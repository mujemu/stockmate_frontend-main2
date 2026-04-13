import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { mergeServerParamsOverDisk, principlePrefsStorageKey } from '../config/principlePrefsStorage';
import {
  CATEGORY_SECTION_ORDER,
  defaultParamsForRank,
  getParamSpec,
  normalizePrincipleCategory,
  sectionTitle,
} from '../config/principleUiSpecs';
import { StockmateApiV1 } from '../services/stockmateApiV1';
import type { PrincipleDefaultDto } from '../types/stockmateApiV1';
import { PrinciplesParamDragSlider } from './PrinciplesParamDragSlider';

const POOL_SIZE = 23;
const MIN_SELECTED = 5;

/** 컬러 */
const K = {
  orange: '#5E35B1',
  navy:   '#1A3C6E',
  bg:     '#F5F5F5',
  white:  '#FFFFFF',
  border: '#E0E1E8',
  text:   '#1A1D2D',
  sub:    '#6B7280',
  muted:  '#9EA3B0',
  green:  '#059669',
  red:    '#DC2626',
};

function sortIdsByDefaultRank(
  ids: string[],
  byId: Record<string, PrincipleDefaultDto | undefined>,
): string[] {
  return [...ids].sort((a, b) => {
    const ra = byId[a]?.default_rank ?? 999;
    const rb = byId[b]?.default_rank ?? 999;
    return ra - rb;
  });
}

export type PrinciplesPriorityEditorProps = {
  userId: string;
  onSaved?: () => void;
  onRequestClose?: () => void;
  variant?: 'onboarding' | 'settings';
};

export function PrinciplesPriorityEditor({
  userId,
  onSaved,
  onRequestClose,
  variant = 'settings',
}: PrinciplesPriorityEditorProps) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<PrincipleDefaultDto[]>([]);
  const [rankedIds, setRankedIds] = useState<string[]>([]);
  const [paramsByPrinciple, setParamsByPrinciple] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [expandedPid, setExpandedPid] = useState<string | null>(null);

  const defaultById = useMemo(
    () => Object.fromEntries(defaults.map((x) => [x.id, x])),
    [defaults],
  );

  const selectionState = useMemo(() => {
    const cats = new Set<string>();
    for (const id of rankedIds) {
      const d = defaultById[id];
      if (d) cats.add(normalizePrincipleCategory(d.category));
    }
    const chapterFilled = CATEGORY_SECTION_ORDER.filter((c) => cats.has(c)).length;
    const chaptersOk = chapterFilled === CATEGORY_SECTION_ORDER.length;
    const countOk = rankedIds.length >= MIN_SELECTED && rankedIds.length <= POOL_SIZE;
    const missingCats = CATEGORY_SECTION_ORDER.filter((c) => !cats.has(c));
    return { canSave: chaptersOk && countOk, chaptersOk, chapterFilled, countOk, missingCats };
  }, [rankedIds, defaultById]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [d, s, rawPrefs] = await Promise.all([
        StockmateApiV1.principles.getDefaults(),
        StockmateApiV1.principles.getStatus(userId),
        AsyncStorage.getItem(principlePrefsStorageKey(userId)),
      ]);
      const sorted = d.slice().sort((a, b) => a.default_rank - b.default_rank);
      if (sorted.length !== POOL_SIZE) {
        setErr(`기본 원칙 풀은 ${POOL_SIZE}개여야 합니다. (서버: ${sorted.length}개)`);
        setDefaults(sorted);
        setRankedIds([]);
        return;
      }
      setDefaults(sorted);
      let prefsParsed: unknown = null;
      if (rawPrefs) {
        try { prefsParsed = JSON.parse(rawPrefs) as unknown; } catch { prefsParsed = null; }
      }
      setParamsByPrinciple(mergeServerParamsOverDisk(sorted, prefsParsed, s.params));
      if (s.is_configured && s.rankings.length >= MIN_SELECTED) {
        const ordered = s.rankings.slice().sort((a, b) => a.rank - b.rank).map((r) => r.principle_id);
        const byId = Object.fromEntries(sorted.map((x) => [x.id, x]));
        setRankedIds(sortIdsByDefaultRank(ordered, byId));
      } else {
        setRankedIds([]);
      }
      setSaveMsg(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const groupedByCategory = useMemo(() => {
    const m = new Map<string, PrincipleDefaultDto[]>();
    for (const c of CATEGORY_SECTION_ORDER) m.set(c, []);
    for (const d of defaults) {
      const key = normalizePrincipleCategory(d.category);
      let list = m.get(key);
      if (!list) { list = []; m.set(key, list); }
      list.push(d);
    }
    for (const list of m.values()) list.sort((a, b) => a.default_rank - b.default_rank);
    return m;
  }, [defaults]);

  const toggleItem = useCallback((id: string) => {
    setRankedIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
        setExpandedPid((ep) => (ep === id ? null : ep));
      } else if (prev.length >= POOL_SIZE) {
        return prev;
      } else {
        next = [...prev, id];
      }
      return sortIdsByDefaultRank(next, defaultById);
    });
    setSaveMsg(null);
  }, [defaultById]);

  const setParam = useCallback((principleId: string, key: string, value: number) => {
    setParamsByPrinciple((prev) => ({
      ...prev,
      [principleId]: { ...(prev[principleId] ?? {}), [key]: value },
    }));
    setSaveMsg(null);
  }, []);

  const save = useCallback(async () => {
    if (saving) return;
    if (!selectionState.canSave) {
      setSaveMsg(
        selectionState.missingCats.length > 0
          ? `미선택 구역: ${selectionState.missingCats.join('·')} — 각 구역 최소 1개씩 필요합니다.`
          : `원칙을 ${MIN_SELECTED}~${POOL_SIZE}개 선택하세요. (현재 ${rankedIds.length}개)`,
      );
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const sortedIds = sortIdsByDefaultRank(rankedIds, defaultById);
      const rankings = sortedIds.map((principle_id, i) => ({ principle_id, rank: i + 1 }));
      await StockmateApiV1.principles.setup(userId, { rankings, params: paramsByPrinciple });
      await AsyncStorage.setItem(
        principlePrefsStorageKey(userId),
        JSON.stringify({ version: 1 as const, params: paramsByPrinciple }),
      );
      await load();
      setSaveMsg('저장되었습니다.');
      onSaved?.();
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [rankedIds, saving, userId, load, onSaved, paramsByPrinciple, selectionState, defaultById]);

  /* ── 파라미터 인라인 패널 ── */
  const renderParamPanel = (pid: string) => {
    const d = defaultById[pid];
    if (!d) return null;
    const spec = getParamSpec(d.default_rank);
    const bag = paramsByPrinciple[pid] ?? defaultParamsForRank(d.default_rank);

    return (
      <View style={styles.paramPanel}>
        {spec?.mode === 'toggle' ? (
          <View style={styles.toggleRow}>
            <Text style={styles.paramLabel}>활성화</Text>
            <Switch
              value={(bag.on ?? 1) === 1}
              onValueChange={(on) => setParam(pid, 'on', on ? 1 : 0)}
              trackColor={{ false: '#E5E5E5', true: '#FAD9CC' }}
              thumbColor={(bag.on ?? 1) === 1 ? K.orange : '#f4f3f4'}
            />
          </View>
        ) : null}
        {spec && spec.mode !== 'toggle'
          ? spec.fields.map((field) => (
              <PrinciplesParamDragSlider
                key={`${pid}-${field.key}`}
                principleId={pid}
                field={field}
                value={bag[field.key] ?? field.min}
                onValueChange={setParam}
              />
            ))
          : null}
      </View>
    );
  };

  /* ── 로딩 ── */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={K.orange} />
        <Text style={styles.hint}>불러오는 중…</Text>
      </View>
    );
  }

  if (err && !defaults.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.errTxt}>{err}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryTxt}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const progressPct = Math.min(
    100,
    Math.round(
      (selectionState.chapterFilled / 5) * 55 +
        Math.min(1, rankedIds.length / MIN_SELECTED) * 45,
    ),
  );

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        {onRequestClose ? (
          <Pressable onPress={onRequestClose} hitSlop={12} style={styles.headerBtn}>
            <Ionicons name="close" size={22} color={K.text} />
          </Pressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
        <Text style={styles.headerTitle}>투자 판단 설정</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* 진행 상태 바 */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>
            {variant === 'onboarding'
              ? `구역마다 1개 이상, 전체 ${MIN_SELECTED}~${POOL_SIZE}개 선택`
              : `구역별 1개 이상 · 전체 ${MIN_SELECTED}~${POOL_SIZE}개`}
          </Text>
          <Text style={styles.progressCount}>
            {rankedIds.length}/{POOL_SIZE} · 구역 {selectionState.chapterFilled}/5
          </Text>
        </View>
      </View>

      {err ? (
        <View style={styles.warnBanner}>
          <Ionicons name="warning-outline" size={14} color="#92400E" />
          <Text style={styles.warnTxt}>{err}</Text>
        </View>
      ) : null}

      {/* 원칙 목록 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {CATEGORY_SECTION_ORDER.map((cat) => {
          const items = groupedByCategory.get(cat) ?? [];
          if (!items.length) return null;
          const catSelected = items.filter((d) => rankedIds.includes(d.id)).length;

          return (
            <View key={cat} style={styles.section}>
              {/* 섹션 헤더 */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>{sectionTitle(cat)}</Text>
                <Text style={styles.sectionCount}>
                  {catSelected}/{items.length}
                </Text>
              </View>

              {/* 원칙 행 목록 */}
              <View style={styles.sectionCard}>
                {items.map((d, idx) => {
                  const isOn = rankedIds.includes(d.id);
                  const isExpanded = expandedPid === d.id && isOn;
                  const isLast = idx === items.length - 1;

                  return (
                    <View key={d.id}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.row,
                          isOn && styles.rowSelected,
                          !isLast && styles.rowBorder,
                          pressed && styles.rowPressed,
                        ]}
                        onPress={() => toggleItem(d.id)}
                        android_ripple={{ color: '#00000010' }}
                      >
                        {/* 번호 뱃지 */}
                        <View style={[styles.rankBadge, isOn && styles.rankBadgeOn]}>
                          <Text style={[styles.rankBadgeTxt, isOn && styles.rankBadgeTxtOn]}>
                            {d.default_rank}
                          </Text>
                        </View>

                        <View style={styles.rowBody}>
                          <Text
                            style={[styles.rowLabel, isOn && styles.rowLabelOn]}
                            numberOfLines={2}
                          >
                            {d.short_label}
                          </Text>
                        </View>

                        {/* 체크/설정 아이콘 */}
                        <View style={styles.rowRight}>
                          {isOn ? (
                            <Pressable
                              hitSlop={8}
                              onPress={() =>
                                setExpandedPid((ep) => (ep === d.id ? null : d.id))
                              }
                              style={styles.settingBtn}
                            >
                              <Ionicons
                                name={isExpanded ? 'chevron-up' : 'settings-outline'}
                                size={15}
                                color={K.orange}
                              />
                            </Pressable>
                          ) : null}
                          <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                            {isOn ? (
                              <Ionicons name="checkmark" size={13} color="#fff" />
                            ) : null}
                          </View>
                        </View>
                      </Pressable>

                      {/* 파라미터 인라인 패널 */}
                      {isExpanded ? renderParamPanel(d.id) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.spacer} />
      </ScrollView>

      {/* 저장 메시지 */}
      {saveMsg ? (
        <Text
          style={[
            styles.saveBanner,
            saveMsg === '저장되었습니다.'
              ? styles.saveBannerOk
              : saveMsg.startsWith('미선택') || saveMsg.startsWith('원칙을')
                ? styles.saveBannerHint
                : styles.saveBannerErr,
          ]}
        >
          {saveMsg}
        </Text>
      ) : null}

      {/* 하단 저장 버튼 */}
      <View style={styles.footer}>
        {!selectionState.canSave ? (
          <Text style={styles.footerHint}>
            {selectionState.missingCats.length > 0
              ? `미선택 구역: ${selectionState.missingCats.join(' · ')}`
              : `${rankedIds.length}/${POOL_SIZE}개 선택됨`}
          </Text>
        ) : null}
        <Pressable
          style={[styles.saveBtn, (!selectionState.canSave || saving) && styles.saveBtnOff]}
          onPress={save}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnTxt}>
              {selectionState.canSave ? '투자 원칙 저장' : `${rankedIds.length}개 선택됨`}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: K.bg },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: K.bg,
  },
  hint: { marginTop: 14, fontSize: 14, color: K.sub, fontWeight: '600' },
  errTxt: { color: K.red, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  retryTxt: { color: K.orange, fontWeight: '800' },

  /* 헤더 */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: K.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: K.border,
  },
  headerBtn: { width: 44, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: K.navy,
    letterSpacing: -0.3,
  },

  /* 진행 바 */
  progressWrap: {
    backgroundColor: K.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: K.border,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EAEAEE',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: K.orange,
    borderRadius: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: { fontSize: 11, color: K.sub, fontWeight: '600' },
  progressCount: { fontSize: 12, color: K.orange, fontWeight: '800' },

  /* 경고 배너 */
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warnTxt: { fontSize: 12, color: '#92400E', fontWeight: '700', flex: 1 },

  /* 스크롤 */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  spacer: { height: 12 },

  /* 섹션 */
  section: { marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  sectionDot: {
    width: 4,
    height: 14,
    borderRadius: 2,
    backgroundColor: K.orange,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: K.navy,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: K.orange,
  },
  sectionCard: {
    backgroundColor: K.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: K.border,
    overflow: 'hidden',
  },

  /* 행 */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: K.white,
    gap: 10,
  },
  rowSelected: { backgroundColor: '#FFF8F6' },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: K.border,
  },
  rowPressed: { backgroundColor: '#F9F9FA' },

  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F0F1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeOn: { backgroundColor: K.orange },
  rankBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: K.muted,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  rankBadgeTxtOn: { color: '#fff' },

  rowBody: { flex: 1 },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: K.sub,
    lineHeight: 18,
  },
  rowLabelOn: { color: K.text, fontWeight: '700' },

  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: K.white,
  },
  checkboxOn: {
    backgroundColor: K.orange,
    borderColor: K.orange,
  },

  /* 파라미터 패널 */
  paramPanel: {
    backgroundColor: '#FFF8F6',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FDD0C0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paramLabel: { fontSize: 13, fontWeight: '700', color: K.text },

  /* 저장 메시지 */
  saveBanner: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveBannerOk:   { color: '#14532D', backgroundColor: '#DCFCE7' },
  saveBannerHint: { color: '#92400E', backgroundColor: '#FFFBEB' },
  saveBannerErr:  { color: '#991B1B', backgroundColor: '#FEE2E2' },

  /* 하단 푸터 */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: K.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: K.border,
    gap: 8,
  },
  footerHint: {
    fontSize: 12,
    fontWeight: '600',
    color: K.sub,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: K.orange,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnOff: { backgroundColor: '#C4C4C4' },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
});
