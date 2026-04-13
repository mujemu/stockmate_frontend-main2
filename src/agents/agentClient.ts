/**
 * AgentClient — LLM/에이전트 엔드포인트용 fetch 래퍼
 *
 * PDF 가이드 기반:
 * - AbortController로 취소 가능
 * - 지수 백오프 + 지터 재시도 (429/500/503)
 * - 타임아웃 기본 20초
 *
 * 프론트는 항상 이 클라이언트를 통해서만 LLM을 호출합니다.
 * (실서비스 전환 시 baseUrl만 백엔드 프록시로 교체)
 */

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 300,
  maxDelayMs: 3000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 503;
}

export interface FetchAgentOptions {
  signal?: AbortSignal;
  retry?: RetryPolicy;
  timeoutMs?: number;
}

/**
 * 재시도 + 타임아웃 지원 fetch.
 * AbortSignal을 외부에서 전달하면 취소 가능.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts?: FetchAgentOptions,
): Promise<Response> {
  const retry = opts?.retry ?? DEFAULT_RETRY;
  const timeoutMs = opts?.timeoutMs ?? 20000;

  const internalController = new AbortController();
  const timeoutHandle = setTimeout(() => internalController.abort(), timeoutMs);

  // 외부 signal이 취소되면 내부 controller도 취소
  const externalSignal = opts?.signal;
  let externalAbortHandler: (() => void) | null = null;
  if (externalSignal) {
    externalAbortHandler = () => internalController.abort();
    externalSignal.addEventListener('abort', externalAbortHandler);
  }

  try {
    for (let attempt = 0; attempt <= retry.maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          ...init,
          signal: internalController.signal,
        });

        if (res.ok) return res;

        if (isRetryableStatus(res.status) && attempt < retry.maxRetries) {
          const backoff = Math.min(
            retry.maxDelayMs,
            retry.baseDelayMs * Math.pow(2, attempt),
          );
          const jitter = Math.floor(Math.random() * 150);
          await sleep(backoff + jitter);
          continue;
        }

        // 재시도 불가 에러는 바로 throw
        const body = await res.text().catch(() => '');
        throw new AgentClientError(res.status, body);
      } catch (err: unknown) {
        if (isAbortError(err)) throw err;

        if (attempt >= retry.maxRetries) throw err;

        const backoff = Math.min(
          retry.maxDelayMs,
          retry.baseDelayMs * Math.pow(2, attempt),
        );
        const jitter = Math.floor(Math.random() * 150);
        await sleep(backoff + jitter);
      }
    }
    throw new Error('unreachable');
  } finally {
    clearTimeout(timeoutHandle);
    if (externalSignal && externalAbortHandler) {
      externalSignal.removeEventListener('abort', externalAbortHandler);
    }
  }
}

export class AgentClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`AgentClient HTTP ${status}: ${body.slice(0, 200)}`);
    this.name = 'AgentClientError';
  }

  get retryable(): boolean {
    return isRetryableStatus(this.status);
  }
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === 'AbortError' || err.message.includes('aborted'))
  );
}

// ── OpenAI Chat Completion 호출 ────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * OpenAI Chat Completion 직접 호출.
 * - 프로토타입 단계에서만 사용 (키를 EXPO_PUBLIC_OPENAI_API_KEY 로 주입).
 * - 실서비스 전환 시 이 함수를 백엔드 프록시 호출로 교체.
 */
export async function callOpenAIChat(
  apiKey: string,
  req: OpenAIChatRequest,
  opts?: FetchAgentOptions,
): Promise<OpenAIChatResponse> {
  const res = await fetchWithRetry(
    OPENAI_CHAT_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req),
    },
    opts,
  );

  const data = await res.json() as OpenAIChatResponse;
  return data;
}
