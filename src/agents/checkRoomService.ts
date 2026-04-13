/**
 * CheckRoomService — 키문이(원칙 코치, octopus) 점검방 LLM 서비스
 *
 * - API 키가 있으면 OpenAI 직접 호출 (프로토타입 모드)
 * - 키 없으면 mock 응답 반환
 * - JSON 구조화 응답 파싱 후 summary + closing_question 조합
 * - 마크다운 완전 제거 후 UI에 전달
 * - 단계(situation_brief → coach_question → feedback) 세션별 추적
 */

import type { AgentReplyDto, ForumPostOutDto } from '../types/stockmateApiV1';
import {
  type OctopusPromptVars,
  type ViolationItem,
  type CheckRoomStep,
  type ExpertPromptVars,
  OCTOPUS_PROMPT_ID,
  buildKimuniPrompts,
  buildExpertUserPrompt,
  getMockResponse,
  OWL_EXPERT_ROLE_PROMPT,
  TURTLE_EXPERT_ROLE_PROMPT,
  OWL_MOCK_RESPONSES,
  TURTLE_MOCK_RESPONSES,
} from './promptAssets';
import { callOpenAIChat, type ChatMessage } from './agentClient';

// ── 환경변수 ──────────────────────────────────────────────────────────────

function getOpenAIKey(): string {
  try {
    // @ts-ignore — Expo는 EXPO_PUBLIC_ 변수만 번들에 포함
    return (process.env.EXPO_PUBLIC_OPENAI_API_KEY as string) ?? '';
  } catch {
    return '';
  }
}

function getCheckRoomMode(): 'mock' | 'llm' | 'auto' {
  try {
    // @ts-ignore
    const m = (process.env.EXPO_PUBLIC_CHECKROOM_MODE as string) ?? 'auto';
    if (m === 'mock' || m === 'llm') return m;
    return 'auto';
  } catch {
    return 'auto';
  }
}

function shouldUseLLM(): boolean {
  const mode = getCheckRoomMode();
  if (mode === 'mock') return false;
  if (mode === 'llm') return true;
  return getOpenAIKey().trim().length > 0;
}

// ── 마크다운 제거 ────────────────────────────────────────────────────────

/**
 * UI 말풍선에 표시되는 텍스트에서 마크다운 문법을 모두 제거한다.
 * LLM이 지시를 어기고 마크다운을 포함시켜도 안전하게 처리.
 */
export function stripMarkdown(text: string): string {
  return text
    // 볼드/이탤릭 (**text**, *text*, __text__, _text_)
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
    // 인라인 코드 (`text`)
    .replace(/`(.+?)`/gs, '$1')
    // 코드 블록 (```...```)
    .replace(/```[\s\S]*?```/g, '')
    // 헤더 (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // 링크 [text](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // 수평선 (--- ***)
    .replace(/^[-*]{3,}\s*$/gm, '')
    // 불릿 리스트 (- item, * item)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    // 번호 리스트 (1. item)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 인용 (> text)
    .replace(/^>\s+/gm, '')
    // 3개 이상 연속 줄바꿈 → 2개로 압축
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── JSON 응답 파싱 ────────────────────────────────────────────────────────

interface KimuniJsonResponse {
  step?: string;
  principle_name?: string;
  principle_matched?: string[];
  principle_violated?: string[];
  headline?: string;
  summary?: string;
  closing_question?: string;
  has_expert_briefing?: boolean;
  tone?: string;
}

/**
 * LLM JSON 응답에서 표시할 텍스트를 추출한다.
 * summary + closing_question 조합, 마크다운 제거 후 반환.
 * JSON 파싱 실패 시 raw 텍스트 그대로 마크다운만 제거해서 반환.
 */
function extractDisplayText(raw: string): string {
  // JSON 코드블록 제거 (```json ... ```)
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed: KimuniJsonResponse = JSON.parse(cleaned);
    const parts: string[] = [];

    if (parsed.summary?.trim()) {
      parts.push(parsed.summary.trim());
    }
    if (parsed.closing_question?.trim()) {
      parts.push(parsed.closing_question.trim());
    }

    if (parts.length > 0) {
      return stripMarkdown(parts.join('\n\n'));
    }
  } catch {
    // JSON 파싱 실패 — raw 텍스트로 fallback
  }

  // fallback: 전체 원문에서 마크다운만 제거
  return stripMarkdown(raw);
}

// ── 세션 상태 (히스토리 + 단계 추적) ────────────────────────────────────

interface SessionState {
  history: ChatMessage[];
  step: CheckRoomStep;
  turnCount: number;
}

const sessionCache = new Map<string, SessionState>();

function getSessionKey(topicId: string): string {
  return `check-room:${topicId}`;
}

function getOrCreateSession(topicId: string): SessionState {
  const key = getSessionKey(topicId);
  if (!sessionCache.has(key)) {
    sessionCache.set(key, { history: [], step: 'situation_brief', turnCount: 0 });
  }
  return sessionCache.get(key)!;
}

function saveSession(topicId: string, state: SessionState): void {
  const key = getSessionKey(topicId);
  // 히스토리 최대 20턴 유지
  if (state.history.length > 40) {
    state.history.splice(0, state.history.length - 40);
  }
  sessionCache.set(key, state);
}

export function clearCheckRoomHistory(topicId: string): void {
  sessionCache.delete(getSessionKey(topicId));
}

/** 다음 단계 결정: init → situation_brief, 이후 → coach_question */
function resolveNextStep(current: CheckRoomStep, isInit: boolean, userChoice?: string): CheckRoomStep {
  if (isInit) return 'situation_brief';
  if (userChoice) return 'feedback';
  // situation_brief 이후 사용자 메시지가 오면 coach_question으로 전환
  if (current === 'situation_brief') return 'coach_question';
  return 'coach_question';
}

// ── 응답 포맷 빌더 ────────────────────────────────────────────────────────

function makeFakePost(content: string, topicId: string): ForumPostOutDto {
  return {
    id: `llm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    topic_id: topicId,
    user_id: 'agent:octopus',
    content,
    created_at: new Date().toISOString(),
  };
}

function buildAgentReplyDto(content: string, topicId: string): AgentReplyDto {
  return {
    agent_id: 'octopus',
    agent_name: '키문이',
    content,
    post: makeFakePost(content, topicId),
    extra_replies: [],
    order_cli_suggestions: null,
  };
}

// ── mock 카운터 ───────────────────────────────────────────────────────────

let mockCounter = 0;

// ── 메인 서비스 함수 ──────────────────────────────────────────────────────

export interface CheckRoomCallInput {
  topicId: string;
  userMessage: string;
  vars: OctopusPromptVars;
  isInit?: boolean;
  signal?: AbortSignal;
}

/**
 * 키문이(원칙 코치) 응답 요청.
 *
 * 1. mock 모드: 픽스처 텍스트 즉시 반환
 * 2. LLM 모드:
 *    a. 세션 단계 결정
 *    b. TASK_TEMPLATE 기반 system+user 프롬프트 빌드
 *    c. OpenAI 호출
 *    d. JSON 파싱 → summary+closing_question 추출
 *    e. 마크다운 제거 → AgentReplyDto 반환
 * 3. LLM 실패 시 mock fallback
 */
export async function callOctopusCheckRoom(
  input: CheckRoomCallInput,
): Promise<AgentReplyDto> {
  const { topicId, vars, isInit = false, signal } = input;

  // ── mock 모드 ──────────────────────────────────────────────────────────
  if (!shouldUseLLM()) {
    await _simulateDelay(500, 1000);
    const content = getMockResponse(mockCounter++);
    return buildAgentReplyDto(content, topicId);
  }

  // ── LLM 모드 ──────────────────────────────────────────────────────────
  const apiKey = getOpenAIKey();
  const session = getOrCreateSession(topicId);

  // 단계 결정
  const currentStep = resolveNextStep(session.step, isInit, vars.userChoice);

  // 위반 횟수: isForced이면 5+, 아니면 violationCount 또는 1
  const violationCount = vars.isForced ? 5 : (vars.violationCount ?? 1);

  // 위반 원칙 결정: topViolation 우선, 없으면 violations[0]
  const topViolation =
    vars.topViolation?.trim() ||
    vars.violations[0]?.short_label ||
    '(위반 원칙 정보 없음)';

  // 사용자 원칙 목록
  const userPrinciples =
    vars.userPrinciples && vars.userPrinciples.length > 0
      ? vars.userPrinciples
      : vars.violations.map((v) => v.short_label);

  // 매매 정보
  const tradeType = vars.orderType === 'buy' ? '매수' : vars.orderType === 'sell' ? '매도' : '주문';

  const { systemPrompt, userPrompt } = buildKimuniPrompts({
    userPrinciples,
    violatedPrinciple: topViolation,
    stockName: vars.stockName,
    tradeType,
    quantity: '정보 없음',
    price: '정보 없음',
    marketData: '없음',
    expertBriefings: '없음',
    currentStep,
    violationCount,
    userChoice: vars.userChoice,
  });

  // 히스토리: isInit이면 초기화, 아니면 기존 유지
  const history = isInit ? [] : session.history;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userPrompt },
  ];

  try {
    const res = await callOpenAIChat(
      apiKey,
      {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.5,
        max_tokens: 500,
      },
      { signal, timeoutMs: 25000 },
    );

    const rawContent = res.choices?.[0]?.message?.content ?? '';
    if (!rawContent.trim()) throw new Error('빈 응답');

    const displayText = extractDisplayText(rawContent);

    // 세션 업데이트
    session.history.push({ role: 'user', content: userPrompt });
    session.history.push({ role: 'assistant', content: rawContent });
    session.step = currentStep;
    session.turnCount += 1;
    saveSession(topicId, session);

    return buildAgentReplyDto(displayText, topicId);
  } catch (err: unknown) {
    if (_isAbort(err)) throw err;

    console.warn('[CheckRoomService] LLM 실패, mock fallback:', err);
    const fallback = getMockResponse(mockCounter++);
    return buildAgentReplyDto(fallback, topicId);
  }
}

/**
 * 점검방 자동 개시 — Step 1: 원칙 위반 상황 안내 (situation_brief).
 */
export async function callOctopusCheckRoomInit(
  topicId: string,
  vars: OctopusPromptVars,
  signal?: AbortSignal,
): Promise<AgentReplyDto> {
  return callOctopusCheckRoom({
    topicId,
    userMessage: '[점검 시작]',
    vars,
    isInit: true,
    signal,
  });
}

/**
 * 점검방 Step 2 — 원칙 코치 질문 (coach_question, "왜?").
 * callOctopusCheckRoomInit 이후 호출한다.
 */
export async function callOctopusCheckRoomCoachQuestion(
  topicId: string,
  vars: OctopusPromptVars,
  signal?: AbortSignal,
): Promise<AgentReplyDto> {
  return callOctopusCheckRoom({
    topicId,
    userMessage: '[코치 질문]',
    vars,
    isInit: false,
    signal,
  });
}

// ── expert 에이전트 mock 카운터 ──────────────────────────────────────────────

let owlMockCounter = 0;
let turtleMockCounter = 0;

/**
 * 전문가 에이전트(기자 owl / 회계사 turtle) 점검방 발언.
 *
 * - violation rank 매핑에 따라 해당 에이전트가 등장하는 경우에만 호출된다.
 * - LLM 모드: 해당 에이전트 역할 프롬프트 + violation 정보로 1~2문장 사실 전달.
 * - mock 모드: 픽스처 텍스트 즉시 반환.
 */
export async function callExpertAgentCheckRoom(
  agentId: 'owl' | 'turtle',
  topicId: string,
  vars: OctopusPromptVars,
  signal?: AbortSignal,
): Promise<AgentReplyDto> {
  const agentName = agentId === 'owl' ? '키엉이' : '키북이';

  // mock 모드
  if (!shouldUseLLM()) {
    await _simulateDelay(400, 800);
    const responses = agentId === 'owl' ? OWL_MOCK_RESPONSES : TURTLE_MOCK_RESPONSES;
    const counter = agentId === 'owl' ? owlMockCounter++ : turtleMockCounter++;
    const content = responses[counter % responses.length];
    return {
      agent_id: agentId,
      agent_name: agentName,
      content,
      post: {
        id: `llm-${agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        topic_id: topicId,
        user_id: `agent:${agentId}`,
        content,
        created_at: new Date().toISOString(),
      },
      extra_replies: [],
      order_cli_suggestions: null,
    };
  }

  // LLM 모드
  const apiKey = getOpenAIKey();
  const systemPrompt = agentId === 'owl' ? OWL_EXPERT_ROLE_PROMPT : TURTLE_EXPERT_ROLE_PROMPT;

  const topViolation =
    vars.topViolation?.trim() ||
    vars.violations[0]?.short_label ||
    '(위반 원칙 정보 없음)';
  const tradeType = vars.orderType === 'buy' ? '매수' : vars.orderType === 'sell' ? '매도' : '주문';

  const expertVars: ExpertPromptVars = {
    stockName: vars.stockName,
    violatedPrinciple: topViolation,
    tradeType,
  };
  const userPrompt = buildExpertUserPrompt(expertVars);

  try {
    const res = await callOpenAIChat(
      apiKey,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 150,
      },
      { signal, timeoutMs: 20000 },
    );

    const raw = res.choices?.[0]?.message?.content ?? '';
    const displayText = raw.trim() ? stripMarkdown(raw) : (
      agentId === 'owl' ? OWL_MOCK_RESPONSES[0] : TURTLE_MOCK_RESPONSES[0]
    );

    return {
      agent_id: agentId,
      agent_name: agentName,
      content: displayText,
      post: {
        id: `llm-${agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        topic_id: topicId,
        user_id: `agent:${agentId}`,
        content: displayText,
        created_at: new Date().toISOString(),
      },
      extra_replies: [],
      order_cli_suggestions: null,
    };
  } catch (err: unknown) {
    if (_isAbort(err)) throw err;
    console.warn(`[CheckRoomService] ${agentName} 실패, mock fallback:`, err);
    const responses = agentId === 'owl' ? OWL_MOCK_RESPONSES : TURTLE_MOCK_RESPONSES;
    const content = responses[0];
    return {
      agent_id: agentId,
      agent_name: agentName,
      content,
      post: {
        id: `llm-${agentId}-fallback-${Date.now()}`,
        topic_id: topicId,
        user_id: `agent:${agentId}`,
        content,
        created_at: new Date().toISOString(),
      },
      extra_replies: [],
      order_cli_suggestions: null,
    };
  }
}

// ── 유틸 ─────────────────────────────────────────────────────────────────

function _simulateDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.floor(Math.random() * (maxMs - minMs));
  return new Promise((r) => setTimeout(r, ms));
}

function _isAbort(err: unknown): boolean {
  return err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'));
}

/**
 * DebateOrderContext → ViolationItem[] 변환 헬퍼.
 */
export function extractViolationsFromOrderContext(
  violationDetails: Array<{ short_label?: string | null; default_rank: number; reason?: string }>,
): ViolationItem[] {
  return violationDetails
    .filter((d) => Number.isFinite(d.default_rank) && d.default_rank >= 1)
    .map((d) => ({
      short_label: d.short_label?.trim() ?? `원칙 #${d.default_rank}`,
      default_rank: d.default_rank,
      reason: (d as { reason?: string }).reason?.trim() ?? '',
    }));
}

export { OCTOPUS_PROMPT_ID };
