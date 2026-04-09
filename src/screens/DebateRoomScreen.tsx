import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { DimensionValue } from 'react-native';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../config/colors';
import { ForumHeroStage } from '../components/ForumHeroStage';
const IMG_EAGLE = require('../../assets/debate/eagle.png');
const IMG_OWL = require('../../assets/debate/owl.png');
const IMG_TURTLE = require('../../assets/debate/turtle.png');

type AgentId = 'eagle' | 'owl' | 'turtle';

type Agent = {
  id: AgentId;
  name: string;
  role: string;
  image: typeof IMG_EAGLE;
  labelAnchor: { left: DimensionValue; top: DimensionValue };
  /** 히어로 전체 패닝 시 화면 이동 방향 (말하는 쪽으로 살짝 기울임) */
  heroPan: number;
};

const AGENTS: Agent[] = [
  {
    id: 'eagle',
    name: '독수리',
    role: '애널리스트',
    image: IMG_EAGLE,
    labelAnchor: { left: '8%', top: '18%' },
    heroPan: -1,
  },
  {
    id: 'owl',
    name: '부엉이',
    role: '원칙 코치',
    image: IMG_OWL,
    labelAnchor: { left: '38%', top: '12%' },
    heroPan: 0,
  },
  {
    id: 'turtle',
    name: '거북이',
    role: '회계사',
    image: IMG_TURTLE,
    labelAnchor: { left: '68%', top: '18%' },
    heroPan: 1,
  },
];

type DebateMessage = {
  id: string;
  sender: 'user' | 'agent';
  agentId?: AgentId;
  text: string;
};

interface Props {
  navigation: { goBack: () => void };
}

const buildAgentReplies = (userInput: string) =>
  [
    {
      agentId: 'owl' as const,
      text: `부엉이 (원칙 코치): "${userInput}"를 기준으로 투자 원칙부터 짚을게요. 독수리·거북이 전문가 의견도 이어서 들어보세요.`,
    },
    {
      agentId: 'eagle' as const,
      text: '독수리 (애널리스트): 시장·섹터 흐름과 밸류에이션 관점에서 핵심 리스크와 기회를 짚어 드릴게요.',
    },
    {
      agentId: 'turtle' as const,
      text: '거북이 (회계사): 재무제표·현금흐름·배당 기준으로 숫자의 일관성을 확인하는 게 먼저예요.',
    },
  ];

/** iOS KeyboardAvoidingView 보정용(상단 바 대략 높이) */
const TOP_BAR_OFFSET = 56;

export function DebateRoomScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();

  const [speakerId, setSpeakerId] = useState<AgentId | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DebateMessage[]>([
    {
      id: 'boot-1',
      sender: 'agent',
      agentId: 'owl',
      text: '공론장에 오셨습니다. 부엉이·독수리·거북이와 1인칭 토론을 진행해요. 질문을 입력해 주세요.',
    },
  ]);
  const [thinking, setThinking] = useState(false);

  const listRef = useRef<FlatList>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.top + TOP_BAR_OFFSET : 0;

  const panAmount = Math.min(22, Math.round(winH * 0.028));

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, thinking]);

  useEffect(() => {
    const sub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
      }
    );
    return () => sub.remove();
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    },
    []
  );

  const statusLine = useMemo(() => {
    if (speakerId) {
      const a = AGENTS.find((x) => x.id === speakerId);
      return `현재 '${a?.name} (${a?.role})' 대화 중`;
    }
    if (thinking) return '전문가 그룹이 답변을 준비하고 있어요…';
    return '질문을 내면 부엉이·독수리·거북이 순으로 의견을 나눕니다.';
  }, [speakerId, thinking]);

  const pushAgentMessage = (agentId: AgentId, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${agentId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        sender: 'agent',
        agentId,
        text,
      },
    ]);
  };

  const onSend = () => {
    const content = input.trim();
    if (!content || thinking) return;
    Keyboard.dismiss();
    setInput('');
    setThinking(true);
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: content }]);

    const replies = buildAgentReplies(content);
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = replies.map((reply, idx) =>
      setTimeout(
        () => {
          setSpeakerId(reply.agentId);
          pushAgentMessage(reply.agentId, reply.text);
          if (idx === replies.length - 1) {
            const tail = setTimeout(() => {
              setSpeakerId(null);
              setThinking(false);
            }, 1000);
            timersRef.current.push(tail);
          }
        },
        600 + idx * 1500
      )
    );
  };

  const agentLabel = (id: AgentId) => AGENTS.find((a) => a.id === id);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
        enabled
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backHit}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
          <View style={styles.topTitles}>
            <Text style={styles.serviceTitle}>인공지능 비즈니스 분석 서비스</Text>
            <Text style={styles.screenTitle}>공론장</Text>
          </View>
          <View style={styles.backHit} />
        </View>

        <View style={styles.bodyColumn}>
          <View style={styles.heroSlot}>
            <ForumHeroStage
              fillAvailable
              speakerId={speakerId}
              panAmount={panAmount}
              agents={AGENTS}
            />
          </View>

          <View style={styles.chatColumn}>
            <View style={styles.statusCard}>
              <Text style={styles.statusCardTitle}>전문가 자문 그룹</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusCardSub}>{statusLine}</Text>
              </View>
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              renderItem={({ item }) => {
                const isUser = item.sender === 'user';
                const ag = item.agentId ? agentLabel(item.agentId) : undefined;
                const name = ag?.name ?? '';
                return (
                  <View style={[styles.msgRow, isUser ? styles.msgRight : styles.msgLeft]}>
                    {!isUser ? (
                      <View style={styles.msgLeftHead}>
                        {ag ? <Image source={ag.image} style={styles.msgAvatar} /> : null}
                        <Text style={styles.msgName}>{name}</Text>
                      </View>
                    ) : null}
                    <View style={[styles.bubble, isUser ? styles.userBubble : styles.agentBubble]}>
                      <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>{item.text}</Text>
                    </View>
                  </View>
                );
              }}
              ListFooterComponent={
                thinking ? <Text style={styles.thinking}>전문가들이 응답을 작성 중이에요…</Text> : null
              }
            />

            <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
              <Ionicons name="attach-outline" size={24} color="#8B90A4" style={styles.inputIcon} />
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="메시지를 입력하세요…"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                onSubmitEditing={onSend}
                returnKeyType="send"
                multiline={false}
              />
              <Pressable onPress={onSend} style={[styles.sendFab, !input.trim() && styles.sendFabOff]}>
                <Ionicons name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A1528' },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backHit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitles: { flex: 1, alignItems: 'center' },
  serviceTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' },
  screenTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 },
  bodyColumn: { flex: 1, minHeight: 0 },
  heroSlot: { flex: 5, minHeight: 0 },
  chatColumn: { flex: 4, minHeight: 0, minWidth: 0 },
  statusCard: {
    marginHorizontal: 14,
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statusCardTitle: { color: '#fff', fontWeight: '900', fontSize: 15 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CD964' },
  statusCardSub: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '600', flex: 1 },
  chatList: { flex: 1, marginTop: 6, minHeight: 60 },
  chatListContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexGrow: 1,
  },
  msgRow: { marginBottom: 12 },
  msgLeft: { alignItems: 'flex-start' },
  msgRight: { alignItems: 'flex-end' },
  msgLeftHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  msgAvatar: { width: 26, height: 26, borderRadius: 13 },
  msgName: { fontSize: 11, color: Colors.textSub, fontWeight: '800' },
  bubble: { maxWidth: '88%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  agentBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9EAF3' },
  userBubble: { backgroundColor: Colors.primary },
  bubbleText: { color: Colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  userBubbleText: { color: '#fff' },
  thinking: { fontSize: 12, color: Colors.textSub, fontWeight: '600', marginTop: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  inputIcon: { marginLeft: 4 },
  input: {
    flex: 1,
    backgroundColor: '#F3F4FA',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  sendFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendFabOff: { opacity: 0.45 },
});
