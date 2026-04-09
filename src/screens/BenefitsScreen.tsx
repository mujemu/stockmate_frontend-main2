import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config/colors';

const TODAY = [
  { title: '4월 출석체크', point: '3~20P', icon: require('../../assets/adaptive-icon.png') },
  { title: '국내 마켓맵 확인하기', point: '10P', icon: require('../../assets/icon.png') },
  { title: '실시간 랭킹 확인하기', point: '5P', icon: require('../../assets/favicon.png') },
];

const MORE = [
  { tag: '주간', title: '다른 자산 확인하기', sub: '자산 연결 확인하고 포인트 받기', reward: '5P', icon: require('../../assets/logos/lg.png') },
  { tag: '주간', title: '키움증권 이벤트 구경하기', sub: '10초 구경하고 포인트 받기', reward: '5P', icon: require('../../assets/logos/kiwoom.png') },
  { tag: '이벤트', title: '쿠팡 캐시백 이벤트', sub: '결제 금액 2% 포인트 적립', reward: '2% 적립', icon: require('../../assets/logos/apr.png') },
  { tag: '주간', title: '투자리포트 웹툰으로 보기', sub: '리포툰 방문하고 포인트 받기', reward: '10P', icon: require('../../assets/logos/samsung.png') },
  { tag: '주간', title: '조건 검색으로 종목 찾기', sub: '조건 검색으로 종목 찾고 포인트 받기', reward: '10P', icon: require('../../assets/logos/skhynix.png') },
  { tag: '매일', title: '고수의 주식 보유 순위 확인하기', sub: '고수의 주식 보유 순위 보고 포인트 받기', reward: '5P', icon: require('../../assets/logos/hyundai.png') },
  { tag: '', title: '영웅전 참가하기', sub: '정규전 참가하고 포인트 받기', reward: '200P', icon: require('../../assets/logos/scd.png') },
  { tag: '', title: 'MY자산 서비스 자산 연결', sub: '자산 연결하고 포인트 받기', reward: '500P', icon: require('../../assets/logos/amorepacific.png') },
];

export function BenefitsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>혜택</Text>
          <Text style={styles.point}>Ⓟ 포인트 안내</Text>
        </View>
        <View style={styles.tabRow}>
          <View style={[styles.tab, styles.tabOn]}><Text style={styles.tabOnTxt}>적립</Text></View>
          <View style={styles.tab}><Text style={styles.tabTxt}>사용</Text></View>
        </View>
        <Text style={styles.caption}>받을 수 있는 포인트</Text>
        <Text style={styles.maxPoint}>최대 735 P</Text>

        <View style={styles.card}>
          <Text style={styles.cardSub}>일일미션 수행하고 포인트 받아가세요</Text>
          <Text style={styles.cardTitle}>오늘 미션</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {TODAY.map((item) => (
              <View key={item.title} style={styles.mission}>
                <Text style={styles.missionTitle}>{item.title}</Text>
                <Image source={item.icon} style={styles.icon} resizeMode="contain" />
                <Text style={styles.missionPoint}>{item.point}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>더 많은 미션</Text>
          <View style={styles.moreTabRow}>
            <Text style={styles.moreOn}>참여가능 8</Text>
            <Text style={styles.moreOff}>참여완료</Text>
          </View>
          <View style={styles.pointBox}><Text style={styles.pointBoxText}>받을 수 있는 포인트</Text><Text style={styles.pointBoxValue}>735 P</Text></View>
          {MORE.map((item) => (
            <View key={item.title} style={styles.listRow}>
              <View style={styles.listIconWrap}>
                <Image source={item.icon} style={styles.listIcon} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                {!!item.tag && <Text style={styles.tag}>{item.tag}</Text>}
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listSub}>{item.sub}</Text>
              </View>
              <View style={styles.reward}><Text style={styles.rewardTxt}>{item.reward}</Text></View>
            </View>
          ))}
          <View style={styles.extra}><Text style={styles.extraTxt}>더 받을 수 있는 포인트가 있어요! 추가 미션 둘러보기</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSub}>키움증권 실전투자대회</Text>
          <Text style={styles.cardTitle}>2025 영웅전</Text>
          <View style={styles.twoCol}>
            <View style={styles.box}><Text style={styles.boxTxt}>국내정규전</Text></View>
            <View style={styles.box}><Text style={styles.boxTxt}>해외정규전</Text></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F1F4' },
  container: { paddingHorizontal: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  point: { marginLeft: 'auto', color: '#3F4455', fontSize: 16, fontWeight: '600' },
  tabRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: '#ECECEF' },
  tabOn: { backgroundColor: Colors.primary },
  tabTxt: { color: '#2B2F3D', fontWeight: '700' },
  tabOnTxt: { color: '#fff', fontWeight: '700' },
  caption: { marginTop: 12, color: '#565C70', fontSize: 16 },
  maxPoint: { marginTop: 2, color: '#1C202C', fontSize: 50, fontWeight: '900' },
  card: { marginTop: 12, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#ECECF3', padding: 14 },
  cardSub: { color: '#666D82', fontSize: 14 },
  cardTitle: { color: '#1C202C', fontSize: 21, fontWeight: '900', marginTop: 4 },
  hRow: { gap: 10, paddingTop: 12, paddingBottom: 6 },
  mission: { width: 170, borderWidth: 1, borderColor: '#DFDAF1', borderRadius: 16, padding: 12, alignItems: 'center' },
  missionTitle: { fontSize: 14, color: '#2C3141', fontWeight: '700', textAlign: 'center' },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ECECF4', marginVertical: 12 },
  missionPoint: { backgroundColor: '#F3F2FA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, color: '#5F6380', fontWeight: '700' },
  moreTabRow: { flexDirection: 'row', gap: 20, marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#E8E9F0', paddingBottom: 8 },
  moreOn: { color: Colors.primary, fontWeight: '800' },
  moreOff: { color: '#3A3F4E', fontWeight: '700' },
  pointBox: { marginTop: 10, backgroundColor: '#F3F3F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row' },
  pointBoxText: { color: '#70758A', fontWeight: '700' },
  pointBoxValue: { marginLeft: 'auto', color: '#2A2F40', fontWeight: '900' },
  listRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
  listIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#ECECF4', overflow: 'hidden' },
  listIcon: { width: '100%', height: '100%' },
  tag: { color: '#F180A7', fontSize: 12, fontWeight: '700' },
  listTitle: { color: '#242A39', fontSize: 18, fontWeight: '800' },
  listSub: { color: '#7A8095', fontSize: 14 },
  reward: { backgroundColor: '#F3F2FA', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  rewardTxt: { color: Colors.primary, fontWeight: '800' },
  extra: { marginTop: 14, backgroundColor: '#F2EEFB', borderRadius: 14, padding: 12 },
  extraTxt: { color: '#5D44C6', fontWeight: '800' },
  twoCol: { flexDirection: 'row', gap: 10, marginTop: 12 },
  box: { flex: 1, backgroundColor: '#F2EEFB', borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 64 },
  boxTxt: { color: '#313748', fontSize: 18, fontWeight: '700' },
});
