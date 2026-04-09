import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../config/colors';

interface Props {
  navigation: any;
}

const RANKS = [
  {
    rank: 1,
    name: '키움증권',
    price: '124,300원',
    chg: '+3.12%',
    logo: require('../../assets/logos/kiwoom.png'),
  },
  {
    rank: 2,
    name: '삼성전자',
    price: '211,500원',
    chg: '+7.63%',
    logo: require('../../assets/logos/samsung_new.png'),
  },
  {
    rank: 3,
    name: 'SK하이닉스',
    price: '1,036,000원',
    chg: '+13.10%',
    logo: require('../../assets/logos/skhynix_new.png'),
  },
  {
    rank: 4,
    name: '에이피알',
    price: '303,500원',
    chg: '+5.27%',
    logo: require('../../assets/logos/apr.png'),
  },
  {
    rank: 5,
    name: '아모레퍼시픽',
    price: '174,200원',
    chg: '+2.84%',
    logo: require('../../assets/logos/amorepacific.png'),
  },
];

const INDEX_CARDS = [
  { id: 'kospi', label: '코스피', value: '5,872.34', chg: '+377.56 (6.87%)' },
  { id: 'kosdaq', label: '코스닥', value: '1,089.85', chg: '+53.12 (5.12%)' },
  { id: 'kospi200', label: '코스피200', value: '882.90', chg: '+61.71 (7.51%)' },
];

export function ExploreMainScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topHeader}>
          <Text style={styles.header}>탐색</Text>
          <View style={styles.quickTop}>
            <View style={styles.simpleToggle}>
              <Text style={styles.simpleText}>일반</Text>
              <View style={styles.simpleOn}>
                <Text style={styles.simpleOnText}>간편</Text>
              </View>
            </View>
            <Ionicons name="search-outline" size={28} color="#262A35" />
            <Ionicons name="notifications-outline" size={28} color="#262A35" />
          </View>
        </View>
        <View style={styles.marketTabs}>
          <Pressable style={[styles.marketTabBtn, styles.marketTabBtnOn]}>
            <Text style={[styles.marketTabTxt, styles.marketTabTxtOn]}>국내</Text>
          </Pressable>
          <Pressable style={styles.marketTabBtn}>
            <Text style={styles.marketTabTxt}>미국</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.indexScrollContent}
          style={styles.indexScroll}
        >
          {INDEX_CARDS.map((item) => (
            <View key={item.id} style={styles.indexCard}>
              <Text style={styles.indexLabel}>{item.label}</Text>
              <Text style={styles.indexValue}>{item.value}</Text>
              <Text style={styles.indexChange}>{item.chg}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.card}>
          <View style={styles.rankHeaderRow}>
            <Text style={styles.cardTitle}>실시간 랭킹 TOP5</Text>
            <View style={styles.candleWrap}>
              <View style={[styles.candleStick, { height: 26 }]} />
              <View style={[styles.candleBody, { backgroundColor: '#E73FA0', height: 24 }]} />
              <View style={[styles.candleStick, { height: 18 }]} />
              <View style={[styles.candleBody, { backgroundColor: '#3A6EF5', height: 28 }]} />
              <View style={[styles.candleStick, { height: 30 }]} />
              <View style={[styles.candleBody, { backgroundColor: '#E73FA0', height: 20 }]} />
            </View>
          </View>
          <View style={styles.rankTabRow}>
            <Pressable style={styles.rankTabItem}>
              <Text style={[styles.rankTabText, styles.rankTabTextActive]}>많이보는</Text>
              <View style={styles.rankTabUnderline} />
            </Pressable>
            <Pressable style={styles.rankTabItem}>
              <Text style={styles.rankTabText}>많이사는</Text>
            </Pressable>
            <Pressable style={styles.rankTabItem}>
              <Text style={styles.rankTabText}>많이파는</Text>
            </Pressable>
            <Pressable style={styles.rankTabItem}>
              <Text style={styles.rankTabText}>가격급등</Text>
            </Pressable>
          </View>
          {RANKS.map((item) => (
            <Pressable
              key={item.rank}
              style={styles.row}
              onPress={() =>
                navigation.navigate('StockTrade', {
                  stockName: item.name,
                  stockPrice: item.price,
                  stockChange: item.chg,
                })
              }
            >
              <Text style={styles.rank}>{item.rank}</Text>
              <View style={styles.logoCircle}>
                <Image source={item.logo} style={styles.logo} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.change}>{item.chg}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubTitle}>누가 사고 팔고 있을까</Text>
          <Text style={styles.cardTitle}>투자자별 매매 동향</Text>
          <View style={styles.tableHead}>
            <Text style={styles.tableHeadTxt}>개인</Text>
            <Text style={styles.tableHeadTxt}>외국인</Text>
            <Text style={styles.tableHeadTxt}>기관</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>코스피</Text>
            <Text style={styles.tableBlue}>-73,842억</Text>
            <Text style={styles.tablePink}>+31,252억</Text>
            <Text style={styles.tablePink}>+40,550억</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>코스닥</Text>
            <Text style={styles.tableBlue}>-6,438억</Text>
            <Text style={styles.tablePink}>+2,674억</Text>
            <Text style={styles.tablePink}>+4,167억</Text>
          </View>
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubTitle}>모두의 커뮤니티</Text>
          <Text style={styles.cardTitle}>종목 토론</Text>
          <View style={styles.talkRow}>
            <View style={styles.logoCircleSmall}>
              <Image source={RANKS[0].logo} style={styles.logo} resizeMode="cover" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.talkName}>{RANKS[0].name}</Text>
              <Text style={styles.talkText}>불장 예상됩니다!</Text>
            </View>
            <Text style={styles.tablePink}>{RANKS[0].chg}</Text>
          </View>
          <View style={styles.talkRow}>
            <View style={styles.logoCircleSmall}>
              <Image source={RANKS[1].logo} style={styles.logo} resizeMode="cover" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.talkName}>{RANKS[1].name}</Text>
              <Text style={styles.talkText}>주주는 이렇게 캐릭터 옆에 주라도 뜸</Text>
            </View>
            <Text style={styles.tablePink}>{RANKS[1].chg}</Text>
          </View>
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>실시간 뉴스</Text>
          <Text style={styles.news}>중기·국방부, 방산 10개 분야 지원</Text>
          <Text style={styles.news}>미국 소비지표 발표 대기, 기술주 혼조</Text>
          <Text style={styles.news}>나스피 평가: 철강 업황 단기 약화 전환 가능성</Text>
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubTitle}>더 쉽고 간편하게 주식을 모아주는</Text>
          <Text style={styles.cardTitle}>주식 더모으기</Text>
          <View style={styles.collectRow}>
            {RANKS.map((item) => (
              <View key={`collect-${item.rank}`} style={styles.collectItem}>
                <View style={styles.logoCircleSmall}>
                  <Image source={item.logo} style={styles.logo} resizeMode="cover" />
                </View>
                <Text style={styles.collectName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubTitle}>키움이 전해드리는</Text>
          <Text style={styles.cardTitle}>투자 이야기</Text>
          <Text style={styles.story}>DL이앤씨 수주 우려를 덜어줄 SMR 모멘텀</Text>
          <Text style={styles.story}>LG에너지솔루션 1Q26 잠정 실적 리뷰</Text>
          <Text style={styles.story}>풍산홀딩스 / 흥구석유 / 에코프로머티 / 엘앤에프...</Text>
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubTitle}>연령대별로 바라본</Text>
          <Text style={styles.cardTitle}>고수의 주식 보유 순위</Text>
          {RANKS.map((item) => (
            <View key={`master-${item.rank}`} style={styles.row}>
              <Text style={styles.rank}>{item.rank}</Text>
              <View style={styles.logoCircle}>
                <Image source={item.logo} style={styles.logo} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.change}>{item.chg}</Text>
              </View>
            </View>
          ))}
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubTitle}>오늘 이 테마가 많이 거래돼요</Text>
          <Text style={styles.cardTitle}>국내 마켓맵</Text>
          <View style={styles.mapGrid}>
            <View style={[styles.mapBox, { flex: 1.2, height: 140 }]}><Text style={styles.mapTxt}>소캠(SOCAMM){'\n'}+10.27%</Text></View>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={[styles.mapBox, { height: 66 }]}><Text style={styles.mapTxt}>뉴로모픽{'\n'}+8.91%</Text></View>
              <View style={styles.mapMiniRow}>
                <View style={[styles.mapBox, { flex: 1, height: 66 }]}><Text style={styles.mapTxt}>CXL{'\n'}+9.47%</Text></View>
                <View style={[styles.mapBox, { flex: 1, height: 66 }]}><Text style={styles.mapTxt}>마이크로{'\n'}+7.10%</Text></View>
              </View>
            </View>
          </View>
          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>

        <Pressable style={styles.homeEdit}>
          <Text style={styles.homeEditText}>⌂  홈 편집</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F5' },
  container: { padding: 14, paddingBottom: 24 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  header: { fontSize: 28, fontWeight: '800', color: Colors.text },
  quickTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  simpleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEDEF',
    borderRadius: 16,
    padding: 2,
  },
  simpleText: { paddingHorizontal: 8, color: '#535868', fontWeight: '700', fontSize: 12 },
  simpleOn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  simpleOnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  marketTabs: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  marketTabBtn: {
    height: 42,
    minWidth: 72,
    borderRadius: 21,
    backgroundColor: '#ECEDEF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  marketTabBtnOn: { backgroundColor: Colors.primary },
  marketTabTxt: { fontSize: 16, fontWeight: '700', color: '#232633' },
  marketTabTxtOn: { color: '#fff' },
  indexScroll: { marginBottom: 12 },
  indexScrollContent: { gap: 10, paddingRight: 6 },
  indexCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9EAF3',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  indexLabel: { fontSize: 14, color: '#2C2F3A', fontWeight: '600' },
  indexValue: { fontSize: 18, color: '#1A1D2D', fontWeight: '800', marginTop: 2 },
  indexChange: { fontSize: 13, color: '#E2408E', fontWeight: '700', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9EAF3',
    padding: 14,
    marginBottom: 12,
  },
  rankHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  candleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingRight: 2 },
  candleStick: { width: 2, backgroundColor: '#BABFCD', borderRadius: 1 },
  candleBody: { width: 8, borderRadius: 4 },
  rankTabRow: {
    marginTop: -2,
    marginBottom: 6,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF3',
  },
  rankTabItem: { marginRight: 18, paddingBottom: 8 },
  rankTabText: { fontSize: 14, color: '#6D7182', fontWeight: '600' },
  rankTabTextActive: { color: Colors.primary, fontWeight: '800' },
  rankTabUnderline: { marginTop: 6, height: 3, width: 48, backgroundColor: Colors.primary, borderRadius: 2 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F7',
    gap: 8,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF2FA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoCircleSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF2FA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: '100%', height: '100%', transform: [{ scale: 1.22 }] },
  rank: { width: 18, fontSize: 16, color: '#434758', fontWeight: '600' },
  name: { fontSize: 18, color: Colors.text, fontWeight: '700' },
  price: { fontSize: 18, color: '#DD3C8A', fontWeight: '800' },
  change: { fontSize: 16, color: '#DD3C8A', fontWeight: '600' },
  cardSubTitle: { fontSize: 14, color: '#7A7E8F', marginBottom: 4, fontWeight: '600' },
  tableHead: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  tableHeadTxt: { fontSize: 16, color: '#4D4F58', fontWeight: '600' },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F0F1F7', paddingVertical: 10 },
  tableLabel: { width: 52, fontSize: 16, color: '#4D4F58', fontWeight: '600' },
  tableBlue: { color: '#4C61C9', fontSize: 16, fontWeight: '700' },
  tablePink: { color: '#DD3C8A', fontSize: 16, fontWeight: '700' },
  talkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F1F7' },
  talkName: { fontSize: 16, color: Colors.text, fontWeight: '700' },
  talkText: { fontSize: 14, color: '#4E5261', marginTop: 2 },
  moreBtn: {
    marginTop: 12,
    height: 44,
    backgroundColor: '#F3F3F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { color: '#4D4F58', fontSize: 16, fontWeight: '600' },
  news: {
    fontSize: 17,
    color: '#272A34',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F7',
    paddingBottom: 10,
  },
  collectRow: { flexDirection: 'row', gap: 12, paddingTop: 6 },
  collectItem: { alignItems: 'center', width: 56 },
  collectName: { marginTop: 4, fontSize: 12, color: '#4E5261', fontWeight: '600' },
  story: {
    fontSize: 16,
    color: '#272A34',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F7',
    paddingBottom: 8,
  },
  mapGrid: { flexDirection: 'row', gap: 8, marginTop: 8 },
  mapMiniRow: { flexDirection: 'row', gap: 8 },
  mapBox: {
    backgroundColor: '#EF2D9D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  mapTxt: { color: '#fff', fontSize: 14, textAlign: 'center', fontWeight: '700' },
  homeEdit: {
    backgroundColor: '#EDEEF2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  homeEditText: { fontSize: 18, color: '#4C5060', fontWeight: '600' },
});

