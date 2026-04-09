import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../config/colors';

type Row = { id: string; label: string };

type Section = { title: string; data: Row[] };

const KIWOOM_LOGO = require('../../assets/logos/kiwoom.png');

const MENU_SECTIONS: Section[] = [
  {
    title: '계좌개설',
    data: [{ id: 'acc-1', label: '계좌개설 시작하기' }],
  },
  {
    title: 'KITCH',
    data: [{ id: 'kitch-1', label: '투자정보 모아보기' }],
  },
  {
    title: '국내 주식',
    data: [
      { id: 'kr-1', label: '거래내역' },
      { id: 'kr-2', label: '주문내역' },
      { id: 'kr-3', label: '실현손익' },
      { id: 'kr-4', label: '소수점거래 신청/관리' },
      { id: 'kr-5', label: '미수현황' },
      { id: 'kr-6', label: '조건검색' },
      { id: 'kr-7', label: '호가주문' },
      { id: 'kr-8', label: '자동감시주문' },
      { id: 'kr-9', label: '신용거래 서비스' },
    ],
  },
  {
    title: '미국 주식',
    data: [
      { id: 'us-1', label: '거래내역' },
      { id: 'us-2', label: '주문내역' },
      { id: 'us-3', label: '실현손익' },
      { id: 'us-4', label: '소수점거래 신청/관리' },
      { id: 'us-5', label: '원화주문서비스 신청' },
      { id: 'us-6', label: '반대매매예정' },
      { id: 'us-7', label: '해외주식 위험고지 안내' },
    ],
  },
  {
    title: '주식 더모으기',
    data: [
      { id: 'mo-1', label: '시작하기' },
      { id: 'mo-2', label: '나의 더모으기' },
    ],
  },
  {
    title: '뱅킹',
    data: [
      { id: 'bk-1', label: '채우기(입금)' },
      { id: 'bk-2', label: '보내기(출금)' },
      { id: 'bk-3', label: '자동충전 신청' },
      { id: 'bk-4', label: '자동충전 내역' },
      { id: 'bk-5', label: '이체내역' },
      { id: 'bk-6', label: '환전하기' },
      { id: 'bk-7', label: '환전내역' },
    ],
  },
  {
    title: '공모주',
    data: [
      { id: 'ipo-1', label: '진행 중인 공모주' },
      { id: 'ipo-2', label: '공모주 청약내역' },
    ],
  },
  {
    title: '오픈뱅킹',
    data: [
      { id: 'ob-1', label: '등록' },
      { id: 'ob-2', label: '변경/관리' },
    ],
  },
];

export function MenuScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const openOurProgram = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'StockMate',
        params: { screen: 'SelectStocks' },
      })
    );
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.topHero}>
        <View style={styles.topTitleRow}>
          <View style={styles.logoTitleBlock}>
            <Image source={KIWOOM_LOGO} style={styles.kiwoomLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>메뉴</Text>
          </View>
          <View style={styles.topIcons}>
            <Ionicons name="search-outline" size={20} color="#555A6B" />
            <Ionicons name="notifications-outline" size={20} color="#555A6B" />
            <Ionicons name="settings-outline" size={20} color="#555A6B" />
          </View>
        </View>
        <View style={styles.userRow}>
          <Text style={styles.userName}>박양희</Text>
          <Text style={styles.userChevron}>›</Text>
          <Pressable hitSlop={8} style={styles.logoutHit}>
            <Text style={styles.logout}>로그아웃</Text>
          </Pressable>
        </View>
        <View style={styles.quickCard}>
          <View style={styles.quickItem}>
            <Feather name="user" size={20} color="#3A3F4D" />
            <Text style={styles.quickItemTxt}>개인정보</Text>
          </View>
          <View style={styles.quickItem}>
            <MaterialCommunityIcons name="laptop" size={20} color="#3A3F4D" />
            <Text style={styles.quickItemTxt}>계좌정보</Text>
          </View>
          <View style={styles.quickItem}>
            <Feather name="file-text" size={20} color="#3A3F4D" />
            <Text style={styles.quickItemTxt}>신청관리</Text>
          </View>
          <View style={styles.quickItem}>
            <Feather name="shield" size={20} color="#3A3F4D" />
            <Text style={styles.quickItemTxt}>인증센터</Text>
          </View>
        </View>
        <View style={styles.secondaryRow}>
          <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}>
            <MaterialCommunityIcons name="party-popper" size={22} color="#3A3F4D" />
            <Text style={styles.secondaryBtnTxt}>이벤트</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}>
            <Ionicons name="megaphone-outline" size={22} color="#3A3F4D" />
            <Text style={styles.secondaryBtnTxt}>공지사항</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}>
            <Ionicons name="call-outline" size={22} color="#3A3F4D" />
            <Text style={styles.secondaryBtnTxt}>고객센터</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View>
        <View style={styles.connectedCard}>
          <Text style={styles.inCardSectionTitle}>시스템</Text>
          <Pressable
            style={({ pressed }) => [styles.connRow, pressed && styles.connRowPressed]}
            onPress={openOurProgram}
            android_ripple={{ color: '#00000012' }}
          >
            <View style={styles.connRowMain}>
              <Text style={styles.connRowLabel}>My Stock Mate</Text>
            </View>
            <Text style={styles.connChevron}>›</Text>
          </Pressable>

          {MENU_SECTIONS.map((section, sIdx) => (
            <View key={section.title} style={sIdx > 0 ? styles.menuSectionBlock : undefined}>
              <Text style={styles.inCardSectionTitle}>{section.title}</Text>
              {section.data.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.connRow, pressed && styles.connRowPressed]}
                  android_ripple={{ color: '#00000012' }}
                >
                  <Text style={styles.connRowLabelPlain}>{item.label}</Text>
                  <Text style={styles.connChevron}>›</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackEmoji}>♡</Text>
          <Text style={styles.feedbackText}>간편모드, 마음에 드시나요?</Text>
        </View>

        <View style={styles.brandFoot}>
          <Text style={styles.brandFootLine}>키움증권</Text>
          <Text style={styles.brandFootSub}>대한민국 주식시장 점유율 21년 연속 1위</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { flex: 1 },
  topHero: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
    backgroundColor: '#F5F5F5',
  },
  topTitleRow: { flexDirection: 'row', alignItems: 'center' },
  logoTitleBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kiwoomLogo: { width: 28, height: 28 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  topIcons: { marginLeft: 'auto', flexDirection: 'row', gap: 14, alignItems: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  userName: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  userChevron: { fontSize: 16, color: Colors.textMuted, fontWeight: '300', marginLeft: 2 },
  logoutHit: { marginLeft: 'auto' },
  logout: { color: '#9A9EAE', textDecorationLine: 'underline', fontSize: 12, fontWeight: '600' },
  quickCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEF2',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  quickItem: { alignItems: 'center', gap: 5, flex: 1 },
  quickItemTxt: { color: '#4A4F5C', fontWeight: '600', fontSize: 11 },
  secondaryRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#E8E8EC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 72,
  },
  secondaryBtnPressed: { opacity: 0.92 },
  secondaryBtnTxt: { color: '#3D424F', fontWeight: '600', fontSize: 11 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  connectedCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEE',
  },
  menuSectionBlock: {
    marginTop: 4,
  },
  inCardSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  connRowPressed: { backgroundColor: '#F7F8FA' },
  connRowMain: { flex: 1 },
  connRowLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  connRowSub: { fontSize: 11, color: Colors.textSub, fontWeight: '600', marginTop: 2 },
  connRowLabelPlain: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  connChevron: { fontSize: 17, color: '#C5C8D4', fontWeight: '300', marginLeft: 6 },
  feedbackCard: {
    marginTop: 14,
    backgroundColor: '#ECECEF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackEmoji: { fontSize: 16, color: Colors.primary },
  feedbackText: { fontSize: 13, fontWeight: '700', color: '#4A4E5C', flex: 1 },
  brandFoot: { alignItems: 'center', marginTop: 16, paddingBottom: 8 },
  brandFootLine: { fontSize: 13, fontWeight: '800', color: '#BCBEC8' },
  brandFootSub: { fontSize: 11, color: '#BCBEC8', marginTop: 3, textAlign: 'center' },
});
