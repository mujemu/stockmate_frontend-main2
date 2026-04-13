/**
 * ForumHeroStage — 전체화면 MP4 배경 + 끊김 없는 크로스페이드
 *
 * 핵심 전략
 * ─────────
 * 1. 5개 플레이어를 항상 loop 재생 → opacity 전환만으로 전환
 * 2. 에이전트 → idle 전환: 500ms 지연 후 실행
 *    → 직후 다른 에이전트가 발화하면 타이머를 취소 → idle 없이 A→B 직접 전환
 * 3. 크로스페이드: fade-in(새 것)과 fade-out(이전 것)을 동시에 실행
 *    → 겹치는 구간에 영상이 항상 보임
 * 4. 비활성 플레이어는 opacity 0.001 유지 → 네이티브 texture 살아있음
 */
import React, { useCallback, useEffect, useRef } from 'react';
import type { DimensionValue } from 'react-native';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

// ── 영상 소스 ────────────────────────────────────────────────────────────────
const VIDEOS = {
  idle:    require('../../assets/services/사용자들이 아무 채팅 안칠때 기다리는 영상.mp4'),
  typing:  require('../../assets/services/사용자들이 채팅칠때 기다리는 영상1.mp4'),
  owl:     require('../../assets/services/부엉이 말하는 영상.mp4'),
  octopus: require('../../assets/services/문어 말하는 영상.mp4'),
  turtle:  require('../../assets/services/거북이 말하는 영상.mp4'),
};

type VideoKey = keyof typeof VIDEOS;

const FADE_MS      = 220;   // crossfade 지속 시간 (ms)
const IDLE_DELAY   = 500;   // 에이전트 발화 종료 후 idle 전환 지연 (ms)
const HIDDEN       = 0.001; // 비활성 opacity (0이면 네이티브에서 일시정지될 수 있음)

// ── 타입 ─────────────────────────────────────────────────────────────────────
export type ForumHeroAgent = {
  id: 'owl' | 'turtle' | 'octopus';
  name: string;
  role: string;
  labelAnchor: { left: DimensionValue; top: DimensionValue };
  heroPan: number;
  presence?: 'active' | 'resting';
};

type Props = {
  speakerId:      ForumHeroAgent['id'] | null;
  nextSpeakerId?: ForumHeroAgent['id'] | null;
  isUserTyping?:  boolean;
  agents:         ForumHeroAgent[];
};

// ── 현재 원하는 영상 키 결정 ─────────────────────────────────────────────────
function resolveKey(
  speakerId:    ForumHeroAgent['id'] | null,
  isUserTyping: boolean,
): VideoKey {
  if (speakerId === 'owl' || speakerId === 'octopus' || speakerId === 'turtle') return speakerId;
  if (isUserTyping) return 'typing';
  return 'idle';
}

// ── 에이전트 배지 ─────────────────────────────────────────────────────────────
function AgentBadges({
  speakerId, nextSpeakerId, isUserTyping, agents,
}: {
  speakerId:     ForumHeroAgent['id'] | null;
  nextSpeakerId: ForumHeroAgent['id'] | null;
  isUserTyping:  boolean;
  agents:        ForumHeroAgent[];
}) {
  return (
    <>
      {agents.map((agent) => {
        const isSessionRest = agent.presence === 'resting';
        const isSpeaking    = speakerId === agent.id;
        const isNext        = !isSpeaking && nextSpeakerId === agent.id;
        const idleNoSpeech  = speakerId == null && !isUserTyping;

        let mode: 'speaking' | 'waiting' | 'resting';
        if (isSessionRest)     mode = 'resting';
        else if (isSpeaking)   mode = 'speaking';
        else if (idleNoSpeech) mode = 'resting';
        else if (isNext)       mode = 'waiting';
        else                   mode = 'resting';

        const label =
          mode === 'speaking' ? '대화중' :
          mode === 'resting'  ? '쉬는중' : '대기중';

        return (
          <View
            key={agent.id}
            style={[styles.badge, { left: agent.labelAnchor.left, top: agent.labelAnchor.top }]}
            pointerEvents="none"
          >
            <Text style={styles.badgeName}>{agent.name}</Text>
            <Text style={styles.badgeRole}>{agent.role}</Text>
            <View
              style={[
                styles.badgePill,
                mode === 'speaking' && styles.badgePillSpeaking,
                mode === 'waiting'  && styles.badgePillWaiting,
                mode === 'resting'  && styles.badgePillResting,
              ]}
            >
              <View
                style={[
                  styles.badgeDot,
                  mode === 'speaking' && styles.badgeDotSpeaking,
                  mode === 'waiting'  && styles.badgeDotWaiting,
                  mode === 'resting'  && styles.badgeDotResting,
                ]}
              />
              <Text
                style={[
                  styles.badgePillTxt,
                  mode === 'speaking' && styles.badgePillTxtSpeaking,
                  mode === 'waiting'  && styles.badgePillTxtWaiting,
                  mode === 'resting'  && styles.badgePillTxtResting,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export const ForumHeroStage = React.memo(function ForumHeroStage({
  speakerId,
  nextSpeakerId = null,
  isUserTyping  = false,
  agents,
}: Props) {
  // 5개 플레이어 모두 항상 loop 재생
  const pIdle    = useVideoPlayer(VIDEOS.idle,    (p) => { p.loop = true; p.muted = true; p.play(); });
  const pTyping  = useVideoPlayer(VIDEOS.typing,  (p) => { p.loop = true; p.muted = true; p.play(); });
  const pOwl     = useVideoPlayer(VIDEOS.owl,     (p) => { p.loop = true; p.muted = true; p.play(); });
  const pOctopus = useVideoPlayer(VIDEOS.octopus, (p) => { p.loop = true; p.muted = true; p.play(); });
  const pTurtle  = useVideoPlayer(VIDEOS.turtle,  (p) => { p.loop = true; p.muted = true; p.play(); });

  const allOps = useRef<Record<VideoKey, Animated.Value>>({
    idle:    new Animated.Value(1),
    typing:  new Animated.Value(HIDDEN),
    owl:     new Animated.Value(HIDDEN),
    octopus: new Animated.Value(HIDDEN),
    turtle:  new Animated.Value(HIDDEN),
  }).current;

  const allPlayers = useRef<Record<VideoKey, ReturnType<typeof useVideoPlayer>>>({} as never);
  allPlayers.current = { idle: pIdle, typing: pTyping, owl: pOwl, octopus: pOctopus, turtle: pTurtle };

  // 현재 가장 위(zIndex:2)에 있는 레이어
  const [topKey, setTopKey] = React.useState<VideoKey>('idle');

  // 직전에 실제로 보여준 키 (지연 처리 전 상태)
  const activeKeyRef   = useRef<VideoKey>('idle');
  // idle 지연 타이머
  const idleTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 진행 중인 Animated 참조 (중단용)
  const runningAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  /**
   * fromKey → toKey 크로스페이드 실행
   * - fade-in(to)과 fade-out(from) 동시 실행
   * - 에이전트 발화 중: idle은 어둡게(0.34) 유지, 나머지는 HIDDEN
   * - idle/typing: 이전 에이전트 fade-out
   */
  const crossfadeTo = useCallback((from: VideoKey, to: VideoKey) => {
    if (from === to) return;

    // 이전 애니메이션 중단
    runningAnimRef.current?.stop();

    setTopKey(to);
    try { allPlayers.current[to].play(); } catch { /* no-op */ }

    const isSpeaker = (k: VideoKey) => k === 'owl' || k === 'octopus' || k === 'turtle';
    const toIsSpeaker   = isSpeaker(to);
    const fromIsSpeaker = isSpeaker(from);

    // 동시 fade-in(to) + fade-out(from)
    const anim = Animated.parallel([
      // fade-in: to → 1
      Animated.timing(allOps[to], {
        toValue:         1,
        duration:        FADE_MS,
        useNativeDriver: true,
      }),
      // fade-out: from → (에이전트가 말할 때의 idle은 0.34, 그 외 HIDDEN)
      Animated.timing(allOps[from], {
        toValue:
          from === 'idle' && toIsSpeaker ? 0.34 :
          to   === 'idle' && fromIsSpeaker ? 0 :
          HIDDEN,
        duration:        FADE_MS,
        useNativeDriver: true,
      }),
    ]);

    runningAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (!finished) return; // 중단됨 → 다음 전환이 이미 시작됨

      // 완료 후 정리: 화면에 없는 레이어들은 HIDDEN으로 압축
      (Object.keys(allOps) as VideoKey[]).forEach((k) => {
        if (k === to) return;
        if (k === 'idle' && toIsSpeaker) return; // 배경으로 남겨둠
        allOps[k].setValue(HIDDEN);
      });

      // idle로 갈 때: idle을 1.0으로, 에이전트 from을 HIDDEN으로
      if (to === 'idle' || to === 'typing') {
        (Object.keys(allOps) as VideoKey[]).forEach((k) => {
          if (k === to) return;
          allOps[k].setValue(HIDDEN);
        });
      }
    });
  }, [allOps]);

  const currentKey = resolveKey(speakerId, isUserTyping);

  useEffect(() => {
    // idle 지연 타이머 취소 (새 키가 확정됐으므로)
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (currentKey === activeKeyRef.current) return;

    const prevKey = activeKeyRef.current;

    if (currentKey === 'idle') {
      // 에이전트 발화 종료 → 바로 idle로 가지 않고 지연
      // → 곧바로 다른 에이전트가 발화하면 idle 없이 A→B 직접 전환
      idleTimerRef.current = setTimeout(() => {
        idleTimerRef.current = null;
        activeKeyRef.current = 'idle';
        crossfadeTo(prevKey, 'idle');
      }, IDLE_DELAY);
      // activeKeyRef는 아직 prevKey 유지 (타이머가 발화해야 변경)
    } else {
      // 에이전트 발화 또는 typing → 즉시 전환
      activeKeyRef.current = currentKey;
      crossfadeTo(prevKey, currentKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const layers: { key: VideoKey; player: ReturnType<typeof useVideoPlayer>; op: Animated.Value }[] = [
    { key: 'idle',    player: pIdle,    op: allOps.idle    },
    { key: 'typing',  player: pTyping,  op: allOps.typing  },
    { key: 'owl',     player: pOwl,     op: allOps.owl     },
    { key: 'octopus', player: pOctopus, op: allOps.octopus },
    { key: 'turtle',  player: pTurtle,  op: allOps.turtle  },
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="none">
      {layers.map(({ key, player, op }) => (
        <Animated.View
          key={key}
          style={[StyleSheet.absoluteFill, { opacity: op, zIndex: key === topKey ? 2 : 1 }]}
        >
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
        </Animated.View>
      ))}

      {/* 배지는 VideoView 네이티브 레이어 위 */}
      <View
        style={[StyleSheet.absoluteFill, styles.agentBadgeLayer]}
        pointerEvents="none"
      >
        <AgentBadges
          speakerId={speakerId}
          nextSpeakerId={nextSpeakerId}
          isUserTyping={isUserTyping}
          agents={agents}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  agentBadgeLayer: {
    zIndex: 40,
    ...(Platform.OS === 'android' ? { elevation: 40 } : {}),
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    minWidth: 90,
  },
  badgeName: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  badgeRole: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
  badgePill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgePillSpeaking: { backgroundColor: 'rgba(255,255,255,0.95)' },
  badgePillWaiting:  { backgroundColor: 'rgba(0,0,0,0.42)' },
  badgePillResting:  { backgroundColor: 'rgba(55,55,60,0.72)' },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  badgeDotSpeaking: { backgroundColor: '#22C55E' },
  badgeDotWaiting:  { backgroundColor: '#F97316' },
  badgeDotResting:  { backgroundColor: '#9CA3AF' },
  badgePillTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgePillTxtSpeaking: { color: '#1E2748' },
  badgePillTxtWaiting:  { color: 'rgba(255,255,255,0.92)' },
  badgePillTxtResting:  { color: 'rgba(209,213,219,0.95)' },
});
