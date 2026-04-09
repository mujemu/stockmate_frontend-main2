import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config/colors';

interface Props {
  navigation: any;
}

const KEYPAD = ['4', '1', '7', '3', '5', '0', '2', '8', '6', '', '9', '⌫'];

export function AssetsScreen({ navigation }: Props) {
  const [pin, setPin] = useState('');

  const unlocked = pin.length >= 6;

  const pinDots = useMemo(
    () => Array.from({ length: 6 }, (_, i) => i < pin.length),
    [pin.length]
  );

  const onKeyPress = (key: string) => {
    if (!key) return;
    if (key === '⌫') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    setPin((prev) => (prev.length >= 6 ? prev : `${prev}${key}`));
  };

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.pinSafe}>
        <View style={styles.pinHeader}>
          <Text style={styles.pinHeaderTitle}>간편인증 로그인</Text>
          <Text style={styles.pinClose}>×</Text>
        </View>
        <View style={styles.pinBody}>
          <Text style={styles.pinGuide}>PIN번호 6자리를 입력해주세요.</Text>
          <View style={styles.dotRow}>
            {pinDots.map((filled, i) => (
              <View key={`pin-dot-${i}`} style={[styles.dot, filled && styles.dotFilled]} />
            ))}
          </View>
          <Text style={styles.altLogin}>다른 방법으로 로그인</Text>
        </View>
        <View style={styles.keypad}>
          {KEYPAD.map((key, idx) => (
            <Pressable
              key={`${key}-${idx.toString()}`}
              style={styles.key}
              onPress={() => onKeyPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
        <View style={styles.topBrandRow}>
          <Text style={styles.brand}>키움자산</Text>
          <Text style={styles.brandMute}>다른자산</Text>
          <Pressable style={styles.bigFontBtn}><Text style={styles.bigFontTxt}>큰글씨</Text></Pressable>
        </View>
        <Text style={styles.accountLine}>위탁종합 6260-1612</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>자산조회</Text>
          <View style={styles.seeBadge}><Text style={styles.seeTxt}>보기</Text></View>
        </View>
        <Text style={styles.sub}>내 계좌의 총 자산을 조회해보세요.</Text>

        <View style={styles.aiRow}>
          <Pressable
            style={[styles.aiBtn, styles.aiBtnForum]}
            onPress={() => navigation.getParent()?.navigate('DebateRoom' as never)}
          >
            <Text style={styles.aiBtnTextForum}>공론장 입장하기</Text>
          </Pressable>
          <Pressable
            style={[styles.aiBtn, styles.aiBtnOwl]}
            onPress={() => navigation.getParent()?.navigate('OwlReport' as never)}
          >
            <Text style={styles.aiBtnTextOwl}>투자 분석 리포트 확인하기</Text>
          </Pressable>
        </View>

        <View style={styles.quickRow}>
          <Pressable key="q-fill" style={styles.quickBtn}><Text style={styles.quickText}>채우기</Text></Pressable>
          <Pressable key="q-send" style={styles.quickBtn}><Text style={styles.quickText}>보내기</Text></Pressable>
          <Pressable key="q-fx" style={styles.quickBtn}><Text style={styles.quickText}>환전하기</Text></Pressable>
        </View>

        <View style={styles.assetTabs}>
          {['국내', '미국', '상품', '현금', '신용/대출'].map((x, i) => (
            <Pressable key={x} style={[styles.assetTab, i === 0 && styles.assetTabOn]}>
              <Text style={[styles.assetTabTxt, i === 0 && styles.assetTabTxtOn]}>{x}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>잔고내역</Text>
          <View style={styles.innerTabRowAsset}>
            <Text key="tab-normal" style={[styles.innerTabAsset, styles.innerTabAssetOn]}>일반</Text>
            <Text key="tab-frac" style={styles.innerTabAsset}>소수점</Text>
            <Text key="tab-eval" style={styles.evalTxt}>평가금액↓</Text>
          </View>
          <View style={styles.emptyWrap}>
            <Text style={styles.dividendIcon}>▥</Text>
            <Text style={styles.emptyText}>보유한 국내 주식이 없어요.</Text>
          </View>
          <View style={styles.orderStateRow}>
            <Text key="os-trade" style={styles.orderState}>거래내역</Text>
            <Text key="os-order" style={styles.orderState}>주문내역</Text>
            <Text key="os-pl" style={styles.orderState}>실현손익</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>올해 받은 배당(세전)</Text>
          <View style={styles.dividendEmptyBox}>
            <Text style={styles.dividendIcon}>▥</Text>
            <Text style={styles.dividendEmptyText}>배당 받은 이력이 없어요.</Text>
          </View>
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreBtnText}>더보기</Text>
          </Pressable>
        </View>

        <View style={styles.brandFooter}>
          <Text style={styles.footerBrand}>키움증권</Text>
          <Text style={styles.footerCaption}>대한민국 주식시장 점유율 21년 연속 1위</Text>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F1F4' },
  container: { paddingHorizontal: 16, paddingBottom: 30 },
  topBrandRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  brand: { fontSize: 22, fontWeight: '900', color: Colors.text },
  brandMute: { fontSize: 22, fontWeight: '900', color: '#A8ABB7', marginLeft: 10 },
  bigFontBtn: { marginLeft: 'auto', borderWidth: 1, borderColor: '#B9BCC7', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  bigFontTxt: { color: '#2E3240', fontWeight: '700', fontSize: 14 },
  accountLine: { marginTop: 14, color: '#666B7C', fontSize: 18, fontWeight: '500' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  title: { fontSize: 44, fontWeight: '900', color: Colors.text },
  seeBadge: { borderRadius: 8, backgroundColor: '#D8DAE2', paddingHorizontal: 8, paddingVertical: 3 },
  seeTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  sub: { fontSize: 16, color: '#8C90A1', marginTop: 4, marginBottom: 12 },
  aiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  aiBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  aiBtnForum: { backgroundColor: '#2C2640' },
  aiBtnOwl: { backgroundColor: Colors.primary },
  aiBtnTextForum: { color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  aiBtnTextOwl: { color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1D8F5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quickText: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  assetTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  assetTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, backgroundColor: '#ECECEF' },
  assetTabOn: { backgroundColor: Colors.primary },
  assetTabTxt: { color: '#232737', fontWeight: '800', fontSize: 18 },
  assetTabTxtOn: { color: '#fff' },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEAF4',
    padding: 18,
    marginBottom: 14,
  },
  statTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 14 },
  moreBtn: {
    backgroundColor: '#F3F3F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  moreBtnText: { fontSize: 30, color: '#4D4F58', fontWeight: '600' },
  dividendEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    marginBottom: 10,
  },
  dividendIcon: { fontSize: 42, color: '#D8DBE5', marginBottom: 8 },
  dividendEmptyText: { fontSize: 18, color: '#767B8B', fontWeight: '700' },
  block: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEAF4',
    minHeight: 330,
    padding: 18,
    marginBottom: 14,
  },
  blockTitle: { fontSize: 38, fontWeight: '900', color: Colors.text },
  innerTabRowAsset: { marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#E7E8EF', paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
  innerTabAsset: { color: '#7A8092', fontWeight: '700', fontSize: 16, marginRight: 18 },
  innerTabAssetOn: { color: Colors.primary, borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingBottom: 4 },
  evalTxt: { marginLeft: 'auto', color: '#666B7B', fontWeight: '700' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  emptyText: { marginTop: 8, textAlign: 'center', fontSize: 18, color: '#666A77', fontWeight: '700' },
  orderStateRow: { backgroundColor: '#F3F3F5', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12 },
  orderState: { color: '#9398A8', fontWeight: '700' },
  brandFooter: { alignItems: 'center', marginTop: 14, marginBottom: 14 },
  footerBrand: { color: '#BCBEC8', fontSize: 24, fontWeight: '800' },
  footerCaption: { color: '#BCBEC8', fontSize: 14, marginTop: 6 },

  pinSafe: { flex: 1, backgroundColor: '#F8F8F8' },
  pinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  pinHeaderTitle: { fontSize: 24, fontWeight: '700', color: '#2A2C33' },
  pinClose: { fontSize: 32, color: '#50535E' },
  pinBody: { alignItems: 'center', marginTop: 70 },
  pinGuide: { fontSize: 26, fontWeight: '900', color: '#20222A' },
  dotRow: { flexDirection: 'row', gap: 12, marginTop: 38 },
  dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#DFE1E7' },
  dotFilled: { backgroundColor: Colors.primary },
  altLogin: {
    marginTop: 110,
    fontSize: 16,
    color: '#666A77',
    textDecorationLine: 'underline',
    textDecorationColor: '#666A77',
  },
  keypad: {
    marginTop: 'auto',
    paddingBottom: 22,
    paddingHorizontal: 36,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  key: { width: '30%', height: 70, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 42, color: '#2D2F38', fontWeight: '500' },
});

