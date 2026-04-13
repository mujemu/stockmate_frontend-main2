import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FFFFFF';
const PRIMARY = '#E8400A';   // 키움 오렌지
const NAVY   = '#1A3C6E';    // 키움 네이비
const MUTED  = '#9EA3B0';

const { width: WIN_W } = Dimensions.get('window');

type Props = { waitingSession?: boolean };

export function KiwoomStyleLaunchScreen({ waitingSession = false }: Props) {
  const insets = useSafeAreaInsets();
  const trackW = WIN_W - 64;

  const barProgress = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.88)).current;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    barProgress.setValue(0);
    logoOpacity.setValue(0);
    logoScale.setValue(0.88);
    setPct(0);

    const sub = barProgress.addListener(({ value }) => setPct(Math.round(value * 100)));

    const logoIn = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 10,
        tension: 80,
        useNativeDriver: true,
      }),
    ]);

    const barFill = Animated.timing(barProgress, {
      toValue: 1,
      duration: waitingSession ? 60000 : 2200,
      easing: waitingSession
        ? Easing.linear
        : Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    Animated.sequence([logoIn, barFill]).start();

    return () => {
      barProgress.removeListener(sub);
      barProgress.stopAnimation();
      logoOpacity.stopAnimation();
      logoScale.stopAnimation();
    };
  }, [waitingSession, barProgress, logoOpacity, logoScale]);

  const barWidth = barProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackW],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* 상단 헤더 라인 */}
      <View style={styles.topAccent} />

      {/* 로고 영역 */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('../../assets/logos/kiwoom.png')}
          style={styles.kiwoomIcon}
          resizeMode="contain"
        />
        <View style={styles.wordmarkRow}>
          <Text style={styles.wordmarkMain}>키움증권</Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeTxt}>간편모드</Text>
          </View>
        </View>
        <Text style={styles.tagline}>대한민국 1등 증권사</Text>
      </Animated.View>

      {/* 하단 로딩 영역 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}>
        <Text style={styles.statusTxt}>
          {waitingSession ? '계정 정보를 확인하는 중입니다.' : '서비스를 시작하는 중입니다.'}
        </Text>

        {/* 진행 바 */}
        <View style={[styles.track, { width: trackW }]}>
          <Animated.View style={[styles.trackFill, { width: barWidth }]} />
        </View>

        <View style={styles.pctRow}>
          <Text style={styles.pctLabel}>{pct}%</Text>
          <Text style={styles.versionLabel}>v1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topAccent: {
    width: '100%',
    height: 3,
    backgroundColor: PRIMARY,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  kiwoomIcon: {
    width: 72,
    height: 72,
    marginBottom: 4,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmarkMain: {
    fontSize: 28,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: -0.5,
  },
  modeBadge: {
    backgroundColor: PRIMARY,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modeBadgeTxt: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  statusTxt: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#EAEAEE',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
  pctRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pctLabel: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: '800',
  },
  versionLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '500',
  },
});
