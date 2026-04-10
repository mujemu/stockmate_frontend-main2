import React, { useMemo, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts/dist/LineChart';
import type { StockTradeUiConfig } from '../config/stockTradeDetail';

/** gifted-charts-core `yAxisSides.RIGHT` */
const Y_AXIS_RIGHT = 1;

const Y_AXIS_LABEL_W = 52;

function rightYAxisLabelReserve(yAxisLabelWidth: number, endSpacing: number): number {
  return 50 + yAxisLabelWidth / 2 + endSpacing - 70 + yAxisLabelWidth;
}

const CHART_PAD_H = { left: 8, right: 8 } as const;

const screenW = Dimensions.get('window').width;
const FALLBACK_CHART_W = Math.max(0, screenW - 56);

type Props = { d: StockTradeUiConfig; stockName: string };

const LABELS_5D = ['04.05', '04.06', '04.07', '04.08', '04.09'] as const;

const CHART_H = 188;
const VOL_H = 52;

/** 종목별 정적 차트 이미지 (gifted-charts 대신) */
const CHART_IMG_BY_STOCK: Record<string, ReturnType<typeof require>> = {
  삼성전자: require('../../assets/icons/samsung_chart.png'),
  키움증권: require('../../assets/icons/Kiwoom.png'),
  SK하이닉스: require('../../assets/icons/SK_Hynix.png'),
  에이피알: require('../../assets/icons/APR.png'),
  아모레퍼시픽: require('../../assets/icons/Amore_Pacific.png'),
};

function parsePrice(s: string): number {
  const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function buildGenericSeries(d: StockTradeUiConfig) {
  const high = parsePrice(d.yRightTop);
  const low = parsePrice(d.yRightBot);
  const span = Math.max(high - low, 1);
  const n = LABELS_5D.length;
  const lineData = LABELS_5D.map((label, i) => {
    const t = i / (n - 1);
    const wave = Math.sin(t * Math.PI * 2.2) * 0.2 + Math.sin(t * 3.8 + 0.5) * 0.07;
    const base = low + span * (0.22 + 0.56 * t + wave * 0.32);
    const jitter = ((i * 131) % 13) * (span / 8000);
    const raw = Math.round(base + jitter);
    const value = Math.min(high, Math.max(low, raw));
    return { value, label };
  });
  const volData = LABELS_5D.map((_, i) => {
    const v = 32 + ((i * 71) % 48) + (i % 3) * 6;
    return {
      value: v,
      frontColor: i % 2 === 0 ? '#F5B0C8' : '#B0C4F5',
    };
  });
  const range = Math.max(high - low, 1);
  return {
    lineData,
    volData,
    high,
    low,
    span,
    yAxisOffset: low,
    lineMaxValue: range * 1.02,
  };
}

export function StockTradeChartBlock({ d, stockName }: Props) {
  const [measuredW, setMeasuredW] = useState(0);
  const chartWidth = measuredW > 0 ? measuredW : FALLBACK_CHART_W;
  const staticChartImg = CHART_IMG_BY_STOCK[stockName];

  const { lineData, volData, high, low, span, yAxisOffset, lineMaxValue } = useMemo(
    () => buildGenericSeries(d),
    [d],
  );

  const n = lineData.length;
  const initialSpacing = 10;
  const endSpacing = 10;
  const innerW = Math.max(160, chartWidth - CHART_PAD_H.left - CHART_PAD_H.right);
  const yAxisReserve = rightYAxisLabelReserve(Y_AXIS_LABEL_W, endSpacing);
  const plotW = Math.max(140, innerW - yAxisReserve);
  const spacing = (plotW - initialSpacing - endSpacing) / Math.max(1, n - 1);

  const renderPointerLabel = (items: { value: number; label?: string }[]) => {
    const it = items[0];
    if (!it) return null;
    const lab = it.label ?? '';

    const v = Math.round((it.value ?? 0) + yAxisOffset);
    const open = Math.round(v - span * 0.012);
    const hi = Math.round(Math.min(high, v + span * 0.018));
    const lo = Math.round(Math.max(low, v - span * 0.02));
    const vol = (42000000 + ((v % 5000) * 13000)).toLocaleString('ko-KR');
    const wd = ['일', '월', '화', '수', '목', '금', '토'][(v + lab.length) % 7];
    return (
      <View style={styles.tooltip}>
        <Text style={styles.tooltipTitle}>
          2026.{lab} ({wd})
        </Text>
        <Text style={styles.tooltipRow}>
          시가 <Text style={styles.tooltipNum}>{open.toLocaleString('ko-KR')}</Text>
          <Text style={styles.tooltipPct}> 0.47%</Text>
        </Text>
        <Text style={styles.tooltipRow}>
          고가 <Text style={styles.tooltipNum}>{hi.toLocaleString('ko-KR')}</Text>
          <Text style={styles.tooltipPctUp}> 0.94%</Text>
        </Text>
        <Text style={styles.tooltipRow}>
          저가 <Text style={styles.tooltipNum}>{lo.toLocaleString('ko-KR')}</Text>
          <Text style={styles.tooltipPctDn}> -5.16%</Text>
        </Text>
        <Text style={styles.tooltipRow}>
          종가 <Text style={styles.tooltipNum}>{v.toLocaleString('ko-KR')}</Text>
          <Text style={styles.tooltipPctDn}> -4.69%</Text>
        </Text>
        <Text style={styles.tooltipRow}>
          거래량 <Text style={styles.tooltipVol}>{vol}</Text>
        </Text>
      </View>
    );
  };

  const onChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setMeasuredW((prev) => (Math.abs(w - prev) > 0.5 ? w : prev));
  };

  if (staticChartImg != null) {
    return (
      <View style={styles.wrap}>
        <View style={styles.chartMeasuredStatic}>
          <Image
            source={staticChartImg}
            style={styles.staticChartImage}
            resizeMode="contain"
            accessibilityLabel={`${stockName} 차트`}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.highLowRow}>
        <Text style={styles.chartHigh}>{d.chartHigh}</Text>
        <Text style={[styles.chartLow, { marginTop: 4 }]}>{d.chartLow}</Text>
      </View>

      <View style={styles.chartMeasured} onLayout={onChartLayout}>
        <View style={styles.lineChartBox}>
          <LineChart
            data={lineData}
            width={plotW}
            parentWidth={innerW}
            height={CHART_H}
            spacing={spacing}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            thickness={2.4}
            color="#E5396D"
            curved={false}
            hideDataPoints
            hideRules={false}
            rulesType="solid"
            rulesColor="#ECECF0"
            rulesThickness={1}
            noOfSections={4}
            yAxisSide={Y_AXIS_RIGHT}
            yAxisColor="transparent"
            yAxisThickness={0}
            yAxisTextStyle={{
              color: '#8B90A1',
              fontSize: 9,
              fontWeight: '500',
              textAlign: 'right',
            }}
            yAxisLabelWidth={Y_AXIS_LABEL_W}
            yAxisOffset={yAxisOffset}
            maxValue={lineMaxValue}
            mostNegativeValue={0}
            formatYLabel={(lbl) => {
              const n0 = parseFloat(String(lbl).replace(/,/g, ''));
              if (!Number.isFinite(n0)) return String(lbl);
              return Math.round(yAxisOffset + n0).toLocaleString('ko-KR');
            }}
            xAxisColor="#E0E2E8"
            xAxisThickness={1}
            xAxisLabelTextStyle={{ color: '#8B90A1', fontSize: 10 }}
            pointerConfig={{
              pointerStripColor: '#C5C9D4',
              pointerStripWidth: 1,
              pointerStripUptoDataPoint: true,
              pointerColor: '#E5396D',
              pointerComponent: () => <View style={styles.pointerDotGeneric} />,
              radius: 0,
              activatePointersOnLongPress: false,
              activatePointersInstantlyOnTouch: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelWidth: 176,
              pointerLabelHeight: 138,
              pointerLabelComponent: renderPointerLabel,
            }}
          />
        </View>

        <View style={styles.volOuter}>
          <View style={styles.volWrap}>
            {volData.map((bar, i) => (
              <View key={i} style={styles.volCol}>
                <View
                  style={[
                    styles.volBar,
                    {
                      height: VOL_H * (bar.value / 100),
                      backgroundColor: bar.frontColor,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4, width: '100%', alignSelf: 'stretch' },
  chartMeasured: {
    width: '100%',
    paddingLeft: CHART_PAD_H.left,
    paddingRight: CHART_PAD_H.right,
  },
  chartMeasuredStatic: {
    width: '100%',
    paddingLeft: CHART_PAD_H.left,
    paddingRight: CHART_PAD_H.right,
  },
  staticChartImage: {
    width: '100%',
    height: 352,
  },
  highLowRow: {
    marginBottom: 6,
  },
  chartHigh: { fontSize: 11, color: '#E5396D', fontWeight: '700' },
  chartLow: { fontSize: 11, color: '#4C61C9', fontWeight: '700' },
  lineChartBox: { width: '100%', overflow: 'visible' },
  volOuter: { position: 'relative', marginTop: 2, width: '100%' },
  volWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: VOL_H,
    gap: 3,
  },
  volCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: VOL_H },
  volBar: { width: '78%', minHeight: 4, borderRadius: 3 },
  pointerDotGeneric: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5396D',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E9EF',
  },
  tooltipTitle: { fontSize: 11, fontWeight: '700', color: '#1A1D2D', marginBottom: 6 },
  tooltipRow: { fontSize: 10, color: '#6B7080', marginBottom: 2, lineHeight: 14 },
  tooltipNum: { color: '#1A1D2D', fontWeight: '700' },
  tooltipPct: { color: '#D34588', fontWeight: '600' },
  tooltipPctUp: { color: '#D34588', fontWeight: '600' },
  tooltipPctDn: { color: '#4C61C9', fontWeight: '600' },
  tooltipVol: { color: '#4C61C9', fontWeight: '700' },
});
