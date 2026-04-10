/**
 * 종목별로 동일한 “키움형” 상세 레이아웃에 넣을 문구·숫자만 분리합니다.
 */

export type StockTradeNotice = { day: string; month: string; title: string; sub: string };

export type StockTradeUiConfig = {
  codeLabel: string;
  moodLine: string;
  chartHigh: string;
  chartLow: string;
  yRightTop: string;
  yRightMid: string;
  yRightBot: string;
  bidVol: string;
  askVol: string;
  stockDesc: string;
  tradeNow: string;
  rangeDayLo: string;
  rangeDayHi: string;
  rangeYearLo: string;
  rangeYearHi: string;
  rankLine1: string;
  rankLine2: string;
  rankLine3: string;
  flowText: string;
  news1: string;
  news2: string;
  notices: [StockTradeNotice, StockTradeNotice];
  barHeights: [number, number, number, number];
  tipLine: string;
  levelTop: string;
  level30: string;
  level50: string;
  level70: string;
  level90: string;
};

const kiwoom: StockTradeUiConfig = {
  codeLabel: '039490 · 코스피 · 중20 · 신용A · 소수점',
  moodLine: '🙂 한 달 전보다 10.72% 올랐어요',
  chartHigh: '최고 517,000원',
  chartLow: '최저 366,000원',
  yRightTop: '517,000',
  yRightMid: '441,500',
  yRightBot: '366,000',
  bidVol: '매도대기 721주',
  askVol: '매수대기 1,895주',
  stockDesc:
    '국내 최초의 온라인 종합증권사. 투자매매업, 투자중개업, 투자자문업, 신탁업을 영위하고 있어요.',
  tradeNow: '현재가 461,000원',
  rangeDayLo: '414,000원',
  rangeDayHi: '500,000원',
  rangeYearLo: '1년 최저 282,000원',
  rangeYearHi: '1년 최고 517,000원',
  rankLine1: '41,636   키움증권   한국투자증권   39,586',
  rankLine2: '34,805   KB증권      신한투자증권   37,778',
  rankLine3: '30,734   미래에셋    모건스탠리      20,260',
  flowText: '외국인 +4,383 / 기관 +25,122 / 개인 -26,799',
  news1: '키움증권, 연금시장 진출... 점유율 빅5 진입 목표',
  news2: '삼성證도 인가 초읽기... 발행어음 경쟁 불붙는다',
  notices: [
    {
      day: '01',
      month: '26',
      title: '키움증권, 2025년 4분기 경영실적 설명',
      sub: '[2026/02/04 10:00] 2025년 4분기 경영실적 설명',
    },
    {
      day: '10',
      month: '21',
      title: '키움증권, 2025년 3분기 경영실적 발표',
      sub: '[2025/10/30 10:00] 2025년 3분기 경영실적 발표',
    },
  ],
  barHeights: [52, 46, 90, 130],
  tipLine: '💡 이 종목 수익률 상위 10% 투자자는 115,500원에 샀어요.',
  levelTop: '상위 10% 115,500원',
  level30: '상위 30% 241,540원',
  level50: '상위 50% 401,500원',
  level70: '상위 70% 426,500원',
  level90: '상위 90% 467,986원',
};

const samsung: StockTradeUiConfig = {
  codeLabel: '005930 · 코스피 · 대형주 · 신용A · 소수점',
  moodLine: '🙂 최근 반도체 업황 기대감에 1주일 전 대비 강세예요',
  chartHigh: '최고 215,000원',
  chartLow: '최저 181,000원',
  yRightTop: '215,000',
  yRightMid: '198,000',
  yRightBot: '181,000',
  bidVol: '매도대기 12,420주',
  askVol: '매수대기 18,903주',
  stockDesc:
    '글로벌 메모리·파운드리·스마트폰 등 다각 사업을 영위하는 국내 대표 기업이에요.',
  tradeNow: '현재가 211,500원',
  rangeDayLo: '205,000원',
  rangeDayHi: '214,000원',
  rangeYearLo: '1년 최저 168,200원',
  rangeYearHi: '1년 최고 228,000원',
  rankLine1: '182,400   삼성전자   미래에셋증권   176,200',
  rankLine2: '165,100   KB증권      키움증권        158,900',
  rankLine3: '142,800   NH투자      한국투자증권   139,400',
  flowText: '외국인 +2,102 / 기관 +8,440 / 개인 -9,118',
  news1: '삼성전자, 차세대 파운드리 투자 확대… 설비 경쟁력 강화',
  news2: '반도체 업황 둔화 우려 속 HBM 수요는 견조 전망',
  notices: [
    {
      day: '12',
      month: '03',
      title: '삼성전자, 분기 실적 발표 예정',
      sub: '[2026/04/30 09:00] 2026년 1분기 잠정 실적',
    },
    {
      day: '22',
      month: '01',
      title: '삼성전자, 배당 관련 기준일 안내',
      sub: '[2026/01/22 08:00] 결산 배당 기준일 공시',
    },
  ],
  barHeights: [48, 55, 88, 120],
  tipLine: '💡 이 종목 수익률 상위 10% 투자자는 189,200원에 샀어요.',
  levelTop: '상위 10% 189,200원',
  level30: '상위 30% 201,000원',
  level50: '상위 50% 208,500원',
  level70: '상위 70% 214,200원',
  level90: '상위 90% 219,800원',
};

const skhynix: StockTradeUiConfig = {
  codeLabel: '000660 · 코스피 · 대형주 · 신용A · 소수점',
  moodLine: '🙂 HBM 수요 기대로 단기 변동성은 크지만 추세는 강해요',
  chartHigh: '최고 1,098,000원',
  chartLow: '최저 920,000원',
  yRightTop: '1,098,000',
  yRightMid: '1,009,000',
  yRightBot: '920,000',
  bidVol: '매도대기 3,210주',
  askVol: '매수대기 4,552주',
  stockDesc:
    'DRAM·NAND 메모리 반도체를 생산·판매하는 글로벌 메모리 기업이에요.',
  tradeNow: '현재가 1,036,000원',
  rangeDayLo: '1,012,000원',
  rangeDayHi: '1,048,000원',
  rangeYearLo: '1년 최저 682,000원',
  rangeYearHi: '1년 최고 1,098,000원',
  rankLine1: '8,420   SK하이닉스   키움증권        7,910',
  rankLine2: '7,102   미래에셋      NH투자증권     6,880',
  rankLine3: '6,340   한국투자      삼성증권        5,990',
  flowText: '외국인 +1,240 / 기관 +3,880 / 개인 -4,210',
  news1: 'SK하이닉스, 고대역폭 메모리 라인 가동률 상향 조정',
  news2: 'AI 데이터센터 투자 확대… 메모리 캐파 점유 경쟁 심화',
  notices: [
    {
      day: '05',
      month: '02',
      title: 'SK하이닉스, 시설투자 계획 공시',
      sub: '[2026/02/05 15:30] 반도체 생산 설비 관련 자율공시',
    },
    {
      day: '18',
      month: '11',
      title: 'SK하이닉스, 잠정 실적 발표',
      sub: '[2025/11/18 08:00] 분기 실적 및 컨퍼런스콜',
    },
  ],
  barHeights: [44, 62, 95, 128],
  tipLine: '💡 이 종목 수익률 상위 10% 투자자는 912,000원에 샀어요.',
  levelTop: '상위 10% 912,000원',
  level30: '상위 30% 968,000원',
  level50: '상위 50% 998,000원',
  level70: '상위 70% 1,018,000원',
  level90: '상위 90% 1,042,000원',
};

const apr: StockTradeUiConfig = {
  codeLabel: '278470 · 코스피 · 중형주 · 신용A · 소수점',
  moodLine: '🙂 브랜드 성장 기대 속에서 최근 거래대금이 늘었어요',
  chartHigh: '최고 318,000원',
  chartLow: '최저 268,000원',
  yRightTop: '318,000',
  yRightMid: '293,000',
  yRightBot: '268,000',
  bidVol: '매도대기 1,842주',
  askVol: '매수대기 2,310주',
  stockDesc:
    '뷰티·헬스케어 등 브랜드를 보유한 글로벌 라이프스타일 기업이에요.',
  tradeNow: '현재가 303,500원',
  rangeDayLo: '296,000원',
  rangeDayHi: '308,000원',
  rangeYearLo: '1년 최저 215,000원',
  rangeYearHi: '1년 최고 318,000원',
  rankLine1: '2,880   에이피알     키움증권        2,640',
  rankLine2: '2,410   NH투자       미래에셋        2,290',
  rankLine3: '2,050   한국투자     삼성증권        1,980',
  flowText: '외국인 +420 / 기관 +1,120 / 개인 -1,310',
  news1: '에이피알, 해외 채널 확장… 브랜드 믹스 개편',
  news2: '국내 뷰티 소비 둔화 속 프리미엄 라인 비중 확대',
  notices: [
    {
      day: '08',
      month: '04',
      title: '에이피알, 주주총회 안건 공고',
      sub: '[2026/03/20 09:00] 정기 주주총회 소집 공고',
    },
    {
      day: '14',
      month: '02',
      title: '에이피알, 실적 발표',
      sub: '[2026/02/14 08:00] 연간 실적 및 가이던스',
    },
  ],
  barHeights: [40, 50, 78, 110],
  tipLine: '💡 이 종목 수익률 상위 10% 투자자는 268,500원에 샀어요.',
  levelTop: '상위 10% 268,500원',
  level30: '상위 30% 282,000원',
  level50: '상위 50% 291,000원',
  level70: '상위 70% 298,000원',
  level90: '상위 90% 305,000원',
};

const amore: StockTradeUiConfig = {
  codeLabel: '090430 · 코스피 · 중형주 · 신용A · 소수점',
  moodLine: '🙂 실적 개선 기대와 화장품 수출 회복에 대한 관심이 이어져요',
  chartHigh: '최고 182,000원',
  chartLow: '최저 158,000원',
  yRightTop: '182,000',
  yRightMid: '170,000',
  yRightBot: '158,000',
  bidVol: '매도대기 2,640주',
  askVol: '매수대기 3,020주',
  stockDesc:
    '화장품·뷰티·일상용품 등을 제조·판매하는 국내 대표 뷰티 기업이에요.',
  tradeNow: '현재가 174,200원',
  rangeDayLo: '171,000원',
  rangeDayHi: '176,500원',
  rangeYearLo: '1년 최저 142,500원',
  rangeYearHi: '1년 최고 182,000원',
  rankLine1: '4,120   아모레퍼시픽  키움증권        3,980',
  rankLine2: '3,640   NH투자        KB증권          3,510',
  rankLine3: '3,210   한국투자      미래에셋        3,080',
  flowText: '외국인 -880 / 기관 +1,640 / 개인 -520',
  news1: '아모레퍼시픽, 북미·일본 채널 매출 성장세',
  news2: '중국 온라인 리오프닝 기대… 면세·여행 수요 변수',
  notices: [
    {
      day: '20',
      month: '03',
      title: '아모레퍼시픽, 배당 결정 공시',
      sub: '[2026/03/20 14:00] 결산 배당 및 주주환원 정책',
    },
    {
      day: '07',
      month: '02',
      title: '아모레퍼시픽, 실적 설명회',
      sub: '[2026/02/07 10:00] 분기 실적 컨퍼런스콜',
    },
  ],
  barHeights: [46, 48, 72, 102],
  tipLine: '💡 이 종목 수익률 상위 10% 투자자는 158,000원에 샀어요.',
  levelTop: '상위 10% 158,000원',
  level30: '상위 30% 164,200원',
  level50: '상위 50% 168,800원',
  level70: '상위 70% 171,500원',
  level90: '상위 90% 173,600원',
};

export const STOCK_TRADE_UI: Record<string, StockTradeUiConfig> = {
  키움증권: kiwoom,
  삼성전자: samsung,
  SK하이닉스: skhynix,
  에이피알: apr,
  아모레퍼시픽: amore,
};

export const STOCK_TRADE_UI_KEYS = new Set(Object.keys(STOCK_TRADE_UI));

export function getStockTradeUi(stockName: string): StockTradeUiConfig {
  return STOCK_TRADE_UI[stockName] ?? samsung;
}
