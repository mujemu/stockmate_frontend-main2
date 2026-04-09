import React, { Component, useCallback, useEffect, useRef } from 'react';
import type { DimensionValue } from 'react-native';
import {
  Animated,
  Easing,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {
  DEBATE_USE_LOTTIE,
  FORUM_LOTTIE_IDLE_FRAMES,
  FORUM_LOTTIE_SOURCE,
  FORUM_LOTTIE_TALK_FRAMES,
  forumLottieUsesFrameSegments,
} from '../config/debateVisual';

const FORUM_BG = require('../../assets/debate/forum_bg.png');

export type ForumHeroAgent = {
  id: 'eagle' | 'owl' | 'turtle';
  name: string;
  role: string;
  labelAnchor: { left: DimensionValue; top: DimensionValue };
  heroPan: number;
};

type Props = {
  speakerId: ForumHeroAgent['id'] | null;
  /** 고정 높이(px). `fillAvailable`이 true면 무시 */
  heroHeight?: number;
  /** true면 상단 바 아래 남는 세로 공간을 히어로가 채움(목업처럼 장면이 크게 보임) */
  fillAvailable?: boolean;
  panAmount: number;
  agents: ForumHeroAgent[];
};

class LottieFailureBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function FloatingLabels({
  agents,
  speakerId,
}: {
  agents: ForumHeroAgent[];
  speakerId: ForumHeroAgent['id'] | null;
}) {
  return (
    <>
      {agents.map((agent) => {
        const isSpeaker = speakerId === agent.id;
        return (
          <View key={agent.id} style={[styles.floatingLabel, agent.labelAnchor]} pointerEvents="none">
            <Text style={styles.floatingName}>{agent.name}</Text>
            <Text style={styles.floatingRole}>{agent.role}</Text>
            <View style={[styles.talkPill, isSpeaker ? styles.talkPillOn : styles.talkPillOff]}>
              <View style={[styles.talkDot, isSpeaker && styles.talkDotOn]} />
              <Text style={[styles.talkPillTxt, isSpeaker && styles.talkPillTxtOn]}>
                {isSpeaker ? '얘기 중' : '청취 중'}
              </Text>
            </View>
          </View>
        );
      })}
    </>
  );
}

function PngBackdrop() {
  return (
    <ImageBackground source={FORUM_BG} style={styles.heroBg} imageStyle={styles.heroImg}>
      <View />
    </ImageBackground>
  );
}

/**
 * Lottie 전용. `debateVisual.ts`의 TALK/IDLE 프레임을 넣으면 말하는 캐릭터 구간이 반복 재생됩니다.
 */
function LottieHero({ speakerId }: { speakerId: ForumHeroAgent['id'] | null }) {
  const ref = useRef<LottieView>(null);
  const speakerRef = useRef(speakerId);
  speakerRef.current = speakerId;

  const segmentMode = forumLottieUsesFrameSegments();

  const applySegment = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const sid = speakerRef.current;

    if (!segmentMode) {
      node.reset();
      node.play();
      return;
    }

    const talk = sid ? FORUM_LOTTIE_TALK_FRAMES[sid] : undefined;
    const idle = FORUM_LOTTIE_IDLE_FRAMES;

    if (sid && talk) {
      node.play(talk[0], talk[1]);
    } else if (!sid && idle) {
      node.play(idle[0], idle[1]);
    } else {
      node.reset();
      node.play();
    }
  }, [segmentMode]);

  useEffect(() => {
    const id = requestAnimationFrame(() => applySegment());
    return () => cancelAnimationFrame(id);
  }, [speakerId, applySegment]);

  const onFinish = useCallback(() => {
    if (!segmentMode) return;
    requestAnimationFrame(() => applySegment());
  }, [segmentMode, applySegment]);

  const speed = speakerId ? 1.25 : 0.85;

  return (
    <LottieView
      ref={ref}
      source={FORUM_LOTTIE_SOURCE}
      style={styles.lottieFill}
      resizeMode="cover"
      loop={!segmentMode}
      autoPlay={!segmentMode}
      speed={speed}
      onAnimationFinish={
        segmentMode
          ? (isCancelled) => {
              if (isCancelled) return;
              onFinish();
            }
          : undefined
      }
    />
  );
}

/**
 * Lottie 우선, 실패·비활성·웹에서는 PNG. `debateVisual.ts`의 DEBATE_USE_LOTTIE로 즉시 전환 가능.
 */
export function ForumHeroStage({
  speakerId,
  heroHeight = 240,
  fillAvailable = false,
  panAmount,
  agents,
}: Props) {
  const heroScale = useRef(new Animated.Value(1)).current;
  const heroTransX = useRef(new Animated.Value(0)).current;
  const heroTalkLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const useLottie = DEBATE_USE_LOTTIE && Platform.OS !== 'web';

  useEffect(() => {
    heroTalkLoopRef.current?.stop();
    heroTalkLoopRef.current = null;

    if (!speakerId) {
      Animated.parallel([
        Animated.spring(heroScale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.spring(heroTransX, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
      ]).start();
      return;
    }

    const agent = agents.find((a) => a.id === speakerId);
    const tx = (agent?.heroPan ?? 0) * panAmount;

    Animated.parallel([
      Animated.spring(heroTransX, { toValue: tx, friction: 6, tension: 70, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1.035, friction: 6, tension: 70, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroScale, {
          toValue: 1.055,
          duration: 380,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(heroScale, {
          toValue: 1.03,
          duration: 380,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    heroTalkLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
    };
  }, [speakerId, heroScale, heroTransX, panAmount, agents]);

  const sizeStyle = fillAvailable
    ? { flex: 1, minHeight: 200, alignSelf: 'stretch' as const }
    : { height: heroHeight };

  return (
    <Animated.View
      style={[
        styles.heroWrap,
        sizeStyle,
        { transform: [{ translateX: heroTransX }, { scale: heroScale }] },
      ]}
    >
      <View style={styles.heroInner}>
        {useLottie ? (
          <LottieFailureBoundary fallback={<PngBackdrop />}>
            <LottieHero speakerId={speakerId} />
          </LottieFailureBoundary>
        ) : (
          <PngBackdrop />
        )}
        <FloatingLabels agents={agents} speakerId={speakerId} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroInner: { flex: 1 },
  heroBg: { flex: 1, justifyContent: 'flex-start' },
  heroImg: { resizeMode: 'cover', transform: [{ scale: 1.08 }] },
  lottieFill: { ...StyleSheet.absoluteFillObject },
  floatingLabel: {
    position: 'absolute',
    alignItems: 'center',
    minWidth: 100,
  },
  floatingName: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  floatingRole: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  talkPill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  talkPillOn: { backgroundColor: 'rgba(255,255,255,0.95)' },
  talkPillOff: { backgroundColor: 'rgba(0,0,0,0.35)' },
  talkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  talkDotOn: { backgroundColor: '#34C759' },
  talkPillTxt: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  talkPillTxtOn: { color: '#1E2748' },
});
