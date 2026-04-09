import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config/colors';
import { STOCK_TRADE_UI_KEYS, getStockTradeUi } from '../config/stockTradeDetail';
import { fetchOrderPrinciple } from '../services/orderPrincipleApi';
import type { OrderPrincipleResult } from '../types/orderPrinciple';

interface Props {
  navigation: any;
  route: { params?: { stockName?: string; stockPrice?: string; stockChange?: string } };
}

const STOCK_LOGO: Record<string, ReturnType<typeof require>> = {
  키움증권: require('../../assets/logos/kiwoom.png'),
  삼성전자: require('../../assets/logos/samsung_new.png'),
  삼성E앤에이: require('../../assets/logos/samsung_new.png'),
  '삼성E&A': require('../../assets/logos/samsung_new.png'),
  SK하이닉스: require('../../assets/logos/skhynix_new.png'),
  에이피알: require('../../assets/logos/apr.png'),
  아모레퍼시픽: require('../../assets/logos/amorepacific.png'),
};

const KIMOONI_AVATAR = require('../../assets/k1.png');

const STOCK_SHOTS: Record<string, any[]> = {
  키움증권: [
    require('../../assets/stockshots/shot_01.png'),
    require('../../assets/stockshots/shot_02.png'),
    require('../../assets/stockshots/shot_03.png'),
    require('../../assets/stockshots/shot_04.png'),
    require('../../assets/stockshots/shot_05.png'),
    require('../../assets/stockshots/shot_06.png'),
    require('../../assets/stockshots/shot_07.png'),
    require('../../assets/stockshots/shot_08.png'),
    require('../../assets/stockshots/shot_09.png'),
  ],
  삼성전자: [
    require('../../assets/stockshots/shot_10.png'),
    require('../../assets/stockshots/shot_11.png'),
    require('../../assets/stockshots/shot_12.png'),
    require('../../assets/stockshots/shot_13.png'),
    require('../../assets/stockshots/shot_14.png'),
    require('../../assets/stockshots/shot_15.png'),
    require('../../assets/stockshots/shot_16.png'),
    require('../../assets/stockshots/shot_17.png'),
    require('../../assets/stockshots/shot_18.png'),
  ],
  SK하이닉스: [
    require('../../assets/stockshots/shot_19.png'),
    require('../../assets/stockshots/shot_20.png'),
    require('../../assets/stockshots/shot_21.png'),
    require('../../assets/stockshots/shot_22.png'),
    require('../../assets/stockshots/shot_23.png'),
    require('../../assets/stockshots/shot_24.png'),
    require('../../assets/stockshots/shot_25.png'),
    require('../../assets/stockshots/shot_26.png'),
    require('../../assets/stockshots/shot_27.png'),
  ],
  에이피알: [
    require('../../assets/stockshots/shot_28.png'),
    require('../../assets/stockshots/shot_29.png'),
    require('../../assets/stockshots/shot_30.png'),
    require('../../assets/stockshots/shot_31.png'),
    require('../../assets/stockshots/shot_32.png'),
    require('../../assets/stockshots/shot_33.png'),
    require('../../assets/stockshots/shot_34.png'),
    require('../../assets/stockshots/shot_35.png'),
    require('../../assets/stockshots/shot_36.png'),
  ],
  아모레퍼시픽: [
    require('../../assets/stockshots/shot_37.png'),
    require('../../assets/stockshots/shot_38.png'),
    require('../../assets/stockshots/shot_39.png'),
    require('../../assets/stockshots/shot_40.png'),
    require('../../assets/stockshots/shot_41.png'),
    require('../../assets/stockshots/shot_42.png'),
    require('../../assets/stockshots/shot_43.png'),
    require('../../assets/stockshots/shot_44.png'),
    require('../../assets/stockshots/shot_45.png'),
  ],
};

export function StockTradeScreen({ navigation, route }: Props) {
  const stockName = route.params?.stockName ?? '삼성전자';
  const stockPrice = route.params?.stockPrice ?? '212,000원';
  const stockChange = route.params?.stockChange ?? '+7.89%';
  const shots = STOCK_SHOTS[stockName] ?? STOCK_SHOTS['삼성전자'];
  const useBuiltUi = STOCK_TRADE_UI_KEYS.has(stockName);
  const d = useBuiltUi ? getStockTradeUi(stockName) : null;

  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('45750');
  /** 한 Modal 안에서 단계 전환 — 연속 Modal 전환 시 완료창이 안 뜨는 RN 이슈 회피 */
  const [orderModalPhase, setOrderModalPhase] = useState<'confirm' | 'done' | null>(null);
  const [principlePayload, setPrinciplePayload] = useState<OrderPrincipleResult | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const totalPrice = useMemo(() => {
    const qty = parseInt(quantity || '0', 10);
    const p = parseInt(price || '0', 10);
    return (qty * p).toLocaleString('ko-KR');
  }, [quantity, price]);

  const stockLogo = STOCK_LOGO[stockName];

  const openInput = (type: 'buy' | 'sell') => {
    setOrderType(type);
    setPrinciplePayload(null);
    setOrderModalPhase('confirm');
  };

  const onSubmitOrder = async () => {
    setSubmittingOrder(true);
    try {
      const p = await fetchOrderPrinciple({
        stock_name: stockName,
        order_type: orderType,
        quantity: parseInt(quantity || '0', 10),
        price: parseInt(price || '0', 10),
      });
      setPrinciplePayload(p);
      setOrderModalPhase('done');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const closeOrderModal = () => setOrderModalPhase(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.headerBtn}>〈</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.stockName}>{stockName}</Text>
            <Text style={styles.stockPrice}>{stockPrice}</Text>
            <Text style={styles.stockChange}>{stockChange}</Text>
            {useBuiltUi && d ? <Text style={styles.meta}>{d.codeLabel}</Text> : null}
          </View>
        </View>
        {useBuiltUi && d ? (
          <>
            <View style={styles.moodBox}>
              <Text style={styles.moodText}>{d.moodLine}</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.fakeChart}>
                <View style={styles.grid1} />
                <View style={styles.grid2} />
                <View style={styles.grid3} />
                <View style={styles.lineA} />
                <View style={styles.lineB} />
                <View style={styles.lineC} />
                <Text style={styles.chartTop}>{d.chartHigh}</Text>
                <Text style={styles.chartBottom}>{d.chartLow}</Text>
                <Text style={styles.yRightTop}>{d.yRightTop}</Text>
                <Text style={styles.yRightMid}>{d.yRightMid}</Text>
                <Text style={styles.yRightBot}>{d.yRightBot}</Text>
              </View>
              <View style={styles.chartTabRow}>
                {['1분', '일', '주', '월', '년'].map((t) => (
                  <Text key={t} style={[styles.chartTab, t === '일' && styles.chartTabOn]}>{t}</Text>
                ))}
              </View>
              <View style={styles.bidAskWrap}>
                <View style={styles.bidBar} />
                <View style={styles.askBar} />
              </View>
              <View style={styles.bidAskTxtRow}>
                <Text style={styles.bidTxt}>{d.bidVol}</Text>
                <Text style={styles.askTxt}>{d.askVol}</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>오늘 등락률 알림</Text>
              <Text style={styles.helper}>오늘 시작 가격 기준으로 도달 시 알려드릴게요.</Text>
              <View style={styles.chipRow}>
                {['-10%', '-5%', '+5%', '+10%', '설정'].map((c) => (
                  <View key={c} style={styles.chip}><Text style={styles.chipTxt}>{c}</Text></View>
                ))}
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>내종목</Text>
                <Text style={styles.account}>위탁종합 6260-1612</Text>
              </View>
              <View style={styles.innerTabRow}>
                <Text style={[styles.innerTab, styles.innerTabOn]}>일반</Text>
                <Text style={styles.innerTab}>소수점</Text>
              </View>
              <View style={styles.holdCard}>
                <Text style={styles.subtle}>❗ 이 종목을 가지고 있지 않아요.</Text>
                <Text style={styles.link}>이 종목을 모아볼까요 〉</Text>
              </View>
              <View style={styles.orderStateRow}>
                <Text style={styles.orderState}>주문내역</Text>
                <Text style={styles.orderState}>미체결</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>종목정보</Text>
              <Text style={styles.desc}>{d.stockDesc}</Text>
              <View style={styles.featureBtn}>
                <Text style={styles.featureTxt}>이 종목만의 5가지 특징</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>거래시황</Text>
              <Text style={styles.now}>{d.tradeNow}</Text>
              <View style={styles.range}>
                <Text>{d.rangeDayLo}</Text>
                <Text>{d.rangeDayHi}</Text>
              </View>
              <View style={styles.range}>
                <Text>{d.rangeYearLo}</Text>
                <Text>{d.rangeYearHi}</Text>
              </View>
              <View style={styles.featureBtn}>
                <Text style={styles.featureTxt}>실시간 시세</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>거래원 순위</Text>
              <View style={styles.rankTable}>
                <Text style={styles.subtle}>{d.rankLine1}</Text>
                <Text style={styles.subtle}>{d.rankLine2}</Text>
                <Text style={styles.subtle}>{d.rankLine3}</Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>오늘의 사구팔구</Text>
                <Text style={styles.helper}>15:30 기준(단위: 백만)</Text>
              </View>
              <Text style={styles.subtle}>{d.flowText}</Text>
              <View style={styles.featureBtn}>
                <Text style={styles.featureTxt}>종목투자자 바로가기</Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.newsTabRow}>
                <Text style={[styles.newsTab, styles.newsTabOn]}>뉴스</Text>
                <Text style={styles.newsTab}>공시</Text>
                <Text style={styles.newsRefresh}>◌</Text>
              </View>
              <Text style={styles.news}>{d.news1}</Text>
              <Text style={styles.news}>{d.news2}</Text>
              <View style={styles.featureBtn}>
                <Text style={styles.featureTxt}>더보기</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>주주알림</Text>
              <View style={styles.noticeItem}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateTxt}>
                    {d.notices[0].day}
                    {'\n'}
                    {d.notices[0].month}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>{d.notices[0].title}</Text>
                  <Text style={styles.noticeSub}>{d.notices[0].sub}</Text>
                </View>
              </View>
              <View style={styles.noticeItem}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateTxt}>
                    {d.notices[1].day}
                    {'\n'}
                    {d.notices[1].month}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>{d.notices[1].title}</Text>
                  <Text style={styles.noticeSub}>{d.notices[1].sub}</Text>
                </View>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>재무정보</Text>
              <View style={styles.innerTabRow}>
                <Text style={[styles.innerTab, styles.innerTabOn]}>실적</Text>
                <Text style={styles.innerTab}>배당</Text>
              </View>
              <View style={styles.barChart}>
                <View style={styles.yAxisLabels}>
                  <Text style={styles.axisTxt}>14,882</Text>
                  <Text style={styles.axisTxt}>9,921</Text>
                  <Text style={styles.axisTxt}>4,961</Text>
                  <Text style={styles.axisTxt}>0</Text>
                </View>
                <View style={styles.barCols}>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: d.barHeights[0] }]} />
                    <Text style={styles.barLabel}>2022.12</Text>
                  </View>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: d.barHeights[1] }]} />
                    <Text style={styles.barLabel}>2023.12</Text>
                  </View>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: d.barHeights[2] }]} />
                    <Text style={styles.barLabel}>2024.12</Text>
                  </View>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: d.barHeights[3] }]} />
                    <Text style={styles.barLabel}>2025.12</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>다들 얼마에 샀을까요?</Text>
              <View style={styles.tipCard}>
                <Text style={styles.tipTxt}>{d.tipLine}</Text>
              </View>
              <View style={styles.buyLevels}>
                <View style={styles.tower} />
                <View style={styles.levels}>
                  <View style={[styles.levelTag, styles.levelTop]}>
                    <Text style={styles.levelTopTxt}>{d.levelTop}</Text>
                  </View>
                  <Text style={styles.levelTxt}>{d.level30}</Text>
                  <Text style={styles.levelTxt}>{d.level50}</Text>
                  <Text style={styles.levelTxt}>{d.level70}</Text>
                  <Text style={styles.levelTxt}>{d.level90}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          shots.map((src, idx) => (
            <Image
              key={`${stockName}-${idx}`}
              source={src}
              style={styles.shot}
              resizeMode="cover"
            />
          ))
        )}
      </ScrollView>

      <View style={styles.orderRow}>
        <Pressable style={[styles.orderBtn, styles.sell]} onPress={() => openInput('sell')}>
          <Text style={styles.orderText}>팔게요</Text>
        </Pressable>
        <Pressable style={[styles.orderBtn, styles.buy]} onPress={() => openInput('buy')}>
          <Text style={styles.orderText}>살게요</Text>
        </Pressable>
      </View>

      <Modal visible={orderModalPhase !== null} transparent animationType="slide">
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalDim}
            onPress={orderModalPhase === 'confirm' ? closeOrderModal : undefined}
          />
          <View style={styles.modalCard}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {orderModalPhase === 'confirm' ? (
                <>
                  <Text style={styles.modalTitle}>이렇게 주문할게요</Text>
                  <View style={styles.confirmGrid}>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>종목명</Text>
                      <Text style={styles.confirmValue}>{stockName}</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>주문구분</Text>
                      <Text style={styles.confirmValue}>{orderType === 'buy' ? '매수' : '매도'}</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>주문유형</Text>
                      <Text style={styles.confirmValue}>지정가</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>거래소</Text>
                      <Text style={styles.confirmValue}>SOR(스마트주문)</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>주문수량</Text>
                      <Text style={styles.confirmValue}>{quantity}주</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>주문가격</Text>
                      <Text style={[styles.confirmValue, styles.orderPriceRed]}>
                        {parseInt(price || '0', 10).toLocaleString('ko-KR')}원
                      </Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>총 주문금액</Text>
                      <Text style={[styles.confirmValue, styles.totalAmountStrong]}>{totalPrice}원</Text>
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Pressable style={styles.grayBtn} onPress={closeOrderModal} disabled={submittingOrder}>
                      <Text style={styles.grayText}>취소</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.buyConfirmBtn, submittingOrder && styles.buyConfirmBtnBusy]}
                      onPress={onSubmitOrder}
                      disabled={submittingOrder}
                    >
                      {submittingOrder ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.primaryText}>확인</Text>
                      )}
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.modalTitle, styles.doneTitle]}>
                    {orderType === 'buy' ? '매수 주문을 완료했어요' : '매도 주문을 완료했어요'}
                  </Text>
                  <View style={styles.stockBrief}>
                    {stockLogo != null ? (
                      <Image source={stockLogo} style={styles.stockBriefLogo} resizeMode="contain" />
                    ) : (
                      <View style={styles.logoMock} />
                    )}
                    <Text style={styles.stockBriefTxt}>{stockName}</Text>
                  </View>
                  <View style={styles.confirmGrid}>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>주문구분</Text>
                      <Text style={styles.confirmValue}>{orderType === 'buy' ? '매수' : '매도'}</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>주문수량</Text>
                      <Text style={styles.confirmValue}>{quantity}주</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>주문가격</Text>
                      <Text style={[styles.confirmValue, styles.orderPriceRed]}>
                        {parseInt(price || '0', 10).toLocaleString('ko-KR')}원
                      </Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>총 주문금액</Text>
                      <Text style={[styles.confirmValue, styles.totalAmountStrong]}>{totalPrice}원</Text>
                    </View>
                  </View>
                  <View style={styles.principleCard}>
                    <Image source={KIMOONI_AVATAR} style={styles.kimooniAvatar} resizeMode="cover" />
                    <View style={styles.principleBody}>
                      <Text style={styles.principleTitle}>
                        {principlePayload?.title ??
                          (orderType === 'buy' ? '이번 매수 원칙은?' : '이번 매도 원칙은?')}
                      </Text>
                      <Text style={styles.principleDesc}>
                        {principlePayload?.body ??
                          (orderType === 'buy'
                            ? '이번 매수는 ‘저점 분할매수’ 원칙에 해당해요. AI 분석 결과가 연결되면 이 문구가 대체돼요.'
                            : '이번 매도는 ‘목표가·손절 기록’ 원칙과 비교해 볼 수 있어요. AI 분석 결과가 연결되면 이 문구가 대체돼요.')}
                      </Text>
                      <Text style={styles.principleLead}>
                        {principlePayload?.lead ??
                          (orderType === 'buy' ? '원칙을 잘 지키셨어요.' : '매도도 계획에 맞게 가져가 보세요.')}
                      </Text>
                      {(principlePayload?.variant ?? 'good') === 'good' ? (
                        <Pressable style={styles.ruleBtnSingle}>
                          <Text style={styles.ruleBtnTxt}>
                            {principlePayload?.singleCtaLabel ?? '원칙 수정하기'}
                          </Text>
                        </Pressable>
                      ) : (
                        <View style={styles.ruleBtnRow}>
                          <Pressable style={styles.ruleBtnHalf}>
                            <Text style={styles.ruleBtnTxt}>
                              {principlePayload?.primaryCtaLabel ?? '원칙 수정하기'}
                            </Text>
                          </Pressable>
                          <Pressable style={styles.ruleBtnHalf}>
                            <Text style={styles.ruleBtnTxt}>
                              {principlePayload?.secondaryCtaLabel ?? '무시하기'}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                  <Pressable style={[styles.primaryBtn, styles.doneConfirmBtn]} onPress={closeOrderModal}>
                    <Text style={styles.primaryText}>확인</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F8' },
  scrollContent: { paddingBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  headerBtn: { fontSize: 24, color: Colors.text },
  stockName: { fontSize: 16, color: Colors.textSub, fontWeight: '700' },
  stockPrice: { fontSize: 30, fontWeight: '900', color: Colors.text, marginTop: 4 },
  stockChange: { fontSize: 20, color: '#D7398A', fontWeight: '700' },
  meta: { marginTop: 4, color: '#8B8FA2', fontSize: 12 },
  moodBox: {
    marginHorizontal: 14,
    marginTop: 2,
    backgroundColor: '#F0EEF6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  moodText: { color: '#6B4BD8', fontWeight: '700' },
  card: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ECECF3',
    padding: 14,
  },
  sectionTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  fakeChart: { height: 210, borderRadius: 10, backgroundColor: '#FAFAFC', overflow: 'hidden', marginTop: 6 },
  grid1: { position: 'absolute', left: 0, right: 0, top: 55, borderTopWidth: 1, borderColor: '#E9EAF1' },
  grid2: { position: 'absolute', left: 0, right: 0, top: 105, borderTopWidth: 1, borderColor: '#E9EAF1' },
  grid3: { position: 'absolute', left: 0, right: 0, top: 155, borderTopWidth: 1, borderColor: '#E9EAF1' },
  lineA: { position: 'absolute', left: 16, right: 120, top: 120, height: 2, backgroundColor: '#E65D79', transform: [{ rotate: '-14deg' }] },
  lineB: { position: 'absolute', left: 80, right: 40, top: 132, height: 2, backgroundColor: '#E65D79', transform: [{ rotate: '8deg' }] },
  lineC: { position: 'absolute', left: 200, right: 16, top: 110, height: 2, backgroundColor: '#E65D79', transform: [{ rotate: '-6deg' }] },
  chartTop: { position: 'absolute', left: 12, top: 10, color: '#E25B74', fontWeight: '700', fontSize: 12 },
  chartBottom: { position: 'absolute', left: 12, bottom: 12, color: '#6E78D1', fontWeight: '700', fontSize: 12 },
  yRightTop: { position: 'absolute', right: 8, top: 10, color: '#8E93A7', fontSize: 11 },
  yRightMid: { position: 'absolute', right: 8, top: 92, color: '#8E93A7', fontSize: 11 },
  yRightBot: { position: 'absolute', right: 8, bottom: 10, color: '#8E93A7', fontSize: 11 },
  chartTabRow: { flexDirection: 'row', gap: 16, marginTop: 12, alignItems: 'center' },
  chartTab: { color: '#888DA0', fontSize: 18, fontWeight: '700' },
  chartTabOn: { color: '#202430' },
  bidAskWrap: { marginTop: 10, height: 4, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  bidBar: { flex: 0.28, backgroundColor: '#6F64F2' },
  askBar: { flex: 0.72, backgroundColor: '#F05C80' },
  bidAskTxtRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  bidTxt: { color: '#6F64F2', fontWeight: '700' },
  askTxt: { color: '#F05C80', fontWeight: '700' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#F3F3F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  chipTxt: { color: '#3E4150', fontWeight: '700' },
  helper: { color: '#9EA4B4', fontSize: 14, marginBottom: 10 },
  subtle: { fontSize: 17, color: '#666C80', lineHeight: 25 },
  desc: { fontSize: 18, color: '#404554', lineHeight: 29 },
  now: { fontSize: 28, color: Colors.primary, fontWeight: '800', marginBottom: 8 },
  range: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  account: { color: '#7C8193', fontSize: 14, fontWeight: '600' },
  innerTabRow: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  innerTab: { color: '#7A8092', fontWeight: '700', fontSize: 18 },
  innerTabOn: { color: Colors.primary },
  holdCard: { backgroundColor: '#F4F1FB', borderRadius: 12, padding: 12, marginBottom: 10 },
  link: { color: Colors.primary, fontWeight: '700', marginTop: 6 },
  orderStateRow: { backgroundColor: '#F3F3F5', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12 },
  orderState: { color: '#585E72', fontWeight: '700' },
  featureBtn: { backgroundColor: '#F1F1F4', borderRadius: 12, alignItems: 'center', paddingVertical: 12, marginTop: 10 },
  featureTxt: { color: '#3A3E4E', fontWeight: '700' },
  rankTable: { backgroundColor: '#F7F7FB', borderRadius: 10, padding: 10 },
  newsTabRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  newsTab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18, backgroundColor: '#F3F3F7', color: '#353948', fontWeight: '700' },
  newsTabOn: { backgroundColor: '#6F3DF2', color: '#fff' },
  newsRefresh: { fontSize: 20, color: '#8B90A4' },
  news: { fontSize: 17, color: '#242837', marginBottom: 10 },
  noticeItem: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'center' },
  dateBadge: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F4F2FB', alignItems: 'center', justifyContent: 'center' },
  dateTxt: { color: '#6B4BD8', fontWeight: '800', textAlign: 'center', lineHeight: 16 },
  noticeTitle: { fontSize: 17, color: '#1F2431', fontWeight: '700' },
  noticeSub: { fontSize: 13, color: '#9AA0B2', marginTop: 2 },
  barChart: { flexDirection: 'row', gap: 10, marginTop: 4 },
  yAxisLabels: { justifyContent: 'space-between', height: 158, paddingTop: 4, paddingBottom: 18 },
  axisTxt: { color: '#ACB1C2', fontSize: 11 },
  barCols: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 158 },
  barCol: { alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 22, borderRadius: 10, backgroundColor: '#F05C80' },
  barLabel: { marginTop: 8, color: '#8D92A5', fontSize: 12 },
  tipCard: { backgroundColor: '#F4F3F9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  tipTxt: { color: '#474D60', fontWeight: '700' },
  buyLevels: { flexDirection: 'row', gap: 12 },
  tower: {
    width: 98,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#D8DBE7',
  },
  levels: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
  levelTag: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  levelTop: { backgroundColor: '#6F3DF2' },
  levelTopTxt: { color: '#fff', fontWeight: '800' },
  levelTxt: { color: '#73798D', fontSize: 17, fontWeight: '600' },
  shot: {
    width: '100%',
    aspectRatio: 473 / 1024,
    marginTop: 0,
    marginBottom: 0,
  },
  orderRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 20, backgroundColor: '#F5F5F8' },
  orderBtn: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  sell: { backgroundColor: '#6F64F2' },
  buy: { backgroundColor: '#FF5579' },
  orderText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000055',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  doneTitle: { color: Colors.primary, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E8F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 24,
    marginBottom: 10,
  },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  grayBtn: { flex: 1, borderRadius: 12, backgroundColor: '#EFEFF2', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  grayText: { fontSize: 22, color: '#4D4F58', fontWeight: '700' },
  primaryBtn: { flex: 1, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  buyConfirmBtn: { flex: 1, borderRadius: 12, backgroundColor: '#FF5579', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, minHeight: 50 },
  buyConfirmBtnBusy: { opacity: 0.85 },
  primaryText: { fontSize: 22, color: '#fff', fontWeight: '800' },
  confirmLine: { fontSize: 22, color: Colors.text, marginBottom: 8, fontWeight: '600' },
  confirmTotal: { fontSize: 26, color: '#E3448F', marginTop: 4, fontWeight: '800' },
  confirmGrid: { marginTop: 6, marginBottom: 4 },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  confirmLabel: { fontSize: 16, color: '#6E7387', fontWeight: '600', flexShrink: 0 },
  confirmValue: { fontSize: 18, color: '#232737', fontWeight: '700', textAlign: 'right', flex: 1 },
  orderPriceRed: { color: '#E53935', fontSize: 18, fontWeight: '900' },
  totalAmountStrong: { color: '#1A1D3A', fontSize: 18, fontWeight: '900' },
  stockBrief: { borderWidth: 1, borderColor: '#EAEBF2', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logoMock: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DCE0EE' },
  stockBriefLogo: { width: 44, height: 44, borderRadius: 22 },
  stockBriefTxt: { fontSize: 18, color: Colors.text, fontWeight: '700' },
  principleCard: { marginTop: 12, borderWidth: 1, borderColor: '#E8E8EE', borderRadius: 14, padding: 12, flexDirection: 'row', gap: 10 },
  kimooniAvatar: { width: 48, height: 48, borderRadius: 24 },
  principleBody: { flex: 1 },
  principleTitle: { fontSize: 16, fontWeight: '800', color: '#3A3F4E', marginBottom: 6 },
  principleDesc: { fontSize: 14, color: '#585D70', lineHeight: 21 },
  principleLead: { color: Colors.primary, fontSize: 16, fontWeight: '800', marginTop: 10, marginBottom: 10 },
  doneConfirmBtn: { marginTop: 16, alignSelf: 'stretch', flex: 0 },
  ruleBtnSingle: { backgroundColor: '#EFEFF2', borderRadius: 8, alignItems: 'center', paddingVertical: 10 },
  ruleBtnRow: { flexDirection: 'row', gap: 8 },
  ruleBtnHalf: { flex: 1, backgroundColor: '#EFEFF2', borderRadius: 8, alignItems: 'center', paddingVertical: 10 },
  ruleBtnTxt: { color: '#505564', fontWeight: '700' },
});

