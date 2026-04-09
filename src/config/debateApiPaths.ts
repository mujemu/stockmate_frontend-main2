/**
 * 공론장·멀티 에이전트 채팅용 경로.
 * 백엔드 OpenAPI/라우터와 문자열을 1:1로 맞추면 됩니다. (지금 값은 예시)
 */
export const DEBATE_API_PATHS = {
  /** POST — 세션 생성 (바디: 사용자·컨텍스트 등) */
  createSession: '/debate/sessions',
  /** POST — 사용자 한 턴 전송 → 에이전트들 응답 (또는 스트림 시작 토큰) */
  postUserTurn: (sessionId: string) => `/debate/sessions/${sessionId}/messages`,
  /** GET — 히스토리 복구 (선택) */
  getSession: (sessionId: string) => `/debate/sessions/${sessionId}`,
} as const;
