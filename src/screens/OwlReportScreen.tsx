import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../config/colors';

const OCTOPUS_IMG = require('../../assets/debate/octopus.png');

type Msg = { id: string; from: 'user' | 'octopus'; text: string };

interface Props {
  navigation: { goBack: () => void };
}

export function OwlReportScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'o1',
      from: 'octopus',
      text: '안녕하세요, 투자 분석 리포트를 정리하는 기자 문어입니다. 관심 종목이나 지금 고민 중인 매매 원칙을 알려주시면 인터뷰처럼 질문을 던지고 초안을 정리해 드릴게요.',
    },
  ]);
  const [replying, setReplying] = useState(false);
  const listRef = useRef<FlatList>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    p.start();
    return () => p.stop();
  }, [pulse]);

  useEffect(() => {
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    b.start();
    return () => b.stop();
  }, [bob]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, replying]);

  const onSend = () => {
    const t = input.trim();
    if (!t || replying) return;
    setInput('');
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: 'user', text: t }]);
    setReplying(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `o-${Date.now()}`,
          from: 'octopus',
          text: `말씀을 바탕으로 기자 노트 형태로 초안을 정리했어요.\n\n· 핵심 질문: 무엇을 막을 건가요?\n· 진입: 분할 매수 권장\n· 기록: 매매 사유 1줄 남기기\n\n추가로 다듬고 싶은 문장이 있으면 알려주세요.`,
        },
      ]);
      setReplying(false);
    }, 1200);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backHit}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>투자 분석 리포트</Text>
          <View style={styles.backHit} />
        </View>

        <Text style={styles.subtitle}>문어 (기자)와 1:1 · 투자 분석 리포트</Text>

        <View style={styles.hero}>
          <Animated.View
            style={{
              transform: [
                { scale: pulse },
                {
                  translateY: bob.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
            }}
          >
            <Image source={OCTOPUS_IMG} style={styles.heroAvatar} resizeMode="cover" />
          </Animated.View>
          <View style={styles.heroBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.heroBadgeTxt}>기자 에이전트 연결됨</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const user = item.from === 'user';
            return (
              <View style={[styles.row, user ? styles.rowRight : styles.rowLeft]}>
                {!user ? <Image source={OCTOPUS_IMG} style={styles.bubbleAva} /> : null}
                <View style={[styles.bubble, user ? styles.bubbleUser : styles.bubbleAgent]}>
                  <Text style={[styles.bubbleTxt, user && styles.bubbleTxtUser]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            replying ? <Text style={styles.thinking}>문어가 리포트 초안을 작성 중이에요…</Text> : null
          }
        />

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Ionicons name="attach-outline" size={24} color="#8B90A4" />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요…"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            onSubmitEditing={onSend}
          />
          <Pressable onPress={onSend} style={[styles.sendFab, !input.trim() && styles.sendFabOff]}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F2FA' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  backHit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: Colors.text },
  subtitle: {
    textAlign: 'center',
    color: Colors.textSub,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  hero: { alignItems: 'center', paddingVertical: 8 },
  heroAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#E8E4F2',
  },
  heroBadge: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E2F2',
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  heroBadgeTxt: { fontSize: 12, fontWeight: '800', color: Colors.text },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingBottom: 12 },
  row: { marginBottom: 12, maxWidth: '100%' },
  rowLeft: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowRight: { alignSelf: 'flex-end' },
  bubbleAva: { width: 32, height: 32, borderRadius: 16 },
  bubble: {
    maxWidth: '86%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  bubbleAgent: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9E6F2' },
  bubbleUser: { backgroundColor: Colors.primary },
  bubbleTxt: { fontSize: 14, lineHeight: 21, fontWeight: '600', color: Colors.text },
  bubbleTxtUser: { color: '#fff' },
  thinking: { fontSize: 12, color: Colors.textSub, fontWeight: '600', marginLeft: 40 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E9F0',
    gap: 8,
  },
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
