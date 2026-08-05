import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const HISTORY_KEY = '@misha/reel-history';

type InputMode = 'topic' | 'text';
type Tone = 'Energetic' | 'Professional' | 'Storytelling' | 'Viral Hype';
type Voice = 'US English' | 'UK English' | 'Hindi / Urdu';
type VisualStyle =
  | 'Fox Cyberpunk'
  | 'Futuristic Neon'
  | 'Holographic Gradient'
  | 'Tech Dark 3D';
type Reel = {
  id: string;
  topic: string;
  script: string;
  tone: Tone;
  voice: Voice;
  style: VisualStyle;
  createdAt: string;
};

const palettes = [
  { name: 'ORANGE PULSE', primary: '#ff6b35', accent: '#27e3df' },
  { name: 'ELECTRIC CYAN', primary: '#27e3df', accent: '#8b7cff' },
  { name: 'NEON MAGENTA', primary: '#f45bba', accent: '#ff9b4a' },
  { name: 'MATRIX GREEN', primary: '#a8e063', accent: '#27e3df' },
  { name: 'VIOLET SHIFT', primary: '#9d82ff', accent: '#f45bba' },
] as const;
const toneOptions: Tone[] = ['Energetic', 'Professional', 'Storytelling', 'Viral Hype'];
const voiceOptions: Voice[] = ['US English', 'UK English', 'Hindi / Urdu'];
const styleOptions: VisualStyle[] = [
  'Fox Cyberpunk',
  'Futuristic Neon',
  'Holographic Gradient',
  'Tech Dark 3D',
];
const starterTopics = [
  '5 AI tools that save hours every week',
  'How to build a better morning routine',
  'The future of creators in 2026',
];

function buildScript(topic: string, tone: Tone, voice: Voice) {
  const cleanTopic = topic.trim().replace(/\s+/g, ' ');
  const opening: Record<Tone, string> = {
    Energetic: `Stop scrolling. Here is the fast truth about ${cleanTopic}.`,
    Professional: `Here is a practical breakdown of ${cleanTopic}.`,
    Storytelling: `It started with one simple question: what can ${cleanTopic} change?`,
    'Viral Hype': `This is the ${cleanTopic} secret everyone will be talking about.`,
  };
  const voiceNote =
    voice === 'Hindi / Urdu'
      ? 'Is idea ko simple rakho, value clear rakho, aur action abhi lo.'
      : 'Keep it sharp, useful, and easy to remember.';
  return `${opening[tone]} In the next few seconds, you will see the one idea that makes it useful, the mistake most people make, and a simple way to start today. ${voiceNote} Save this reel, share it with a friend, and follow Misha for the next smart shortcut.`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(value),
  );
}

function Chip({
  label,
  selected,
  onPress,
  accent,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accent: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { borderColor: accent, backgroundColor: `${accent}20` },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

function SectionLabel({ icon, children }: { icon: string; children: string }) {
  return (
    <View style={styles.sectionLabel}>
      <MaterialCommunityIcons name={icon as never} size={15} color="#9296b8" />
      <Text style={styles.sectionLabelText}>{children}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('topic');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Tone>('Energetic');
  const [voice, setVoice] = useState<Voice>('US English');
  const [style, setStyle] = useState<VisualStyle>('Fox Cyberpunk');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [latest, setLatest] = useState<Reel | null>(null);
  const [history, setHistory] = useState<Reel[]>([]);
  const [showScript, setShowScript] = useState(true);
  const theme = palettes[paletteIndex];
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  useEffect(() => {
    const interval = setInterval(
      () => setPaletteIndex((current) => (current + 1) % palettes.length),
      30000,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY)
      .then((stored) => {
        if (stored) setHistory(JSON.parse(stored) as Reel[]);
      })
      .catch(() => setHistory([]));
  }, []);

  const persistHistory = useCallback(async (nextHistory: Reel[]) => {
    setHistory(nextHistory);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  }, []);

  const generate = useCallback(async () => {
    Keyboard.dismiss();
    if (!topic.trim()) {
      setError('Add a topic or paste content first.');
      return;
    }
    setError('');
    setIsGenerating(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const nextReel: Reel = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic: topic.trim(),
      script: buildScript(topic, tone, voice),
      tone,
      voice,
      style,
      createdAt: new Date().toISOString(),
    };
    setLatest(nextReel);
    setShowScript(true);
    await persistHistory([nextReel, ...history].slice(0, 6));
    setIsGenerating(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [history, persistHistory, style, tone, topic, voice]);

  const selectHistory = (reel: Reel) => {
    setLatest(reel);
    setTopic(reel.topic);
    setTone(reel.tone);
    setVoice(reel.voice);
    setStyle(reel.style);
    setShowScript(true);
  };
  const inputPlaceholder =
    inputMode === 'topic'
      ? 'e.g. 5 AI tools to boost productivity'
      : 'Paste a blog paragraph, notes, or any custom content...';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[`${theme.primary}26`, 'transparent', `${theme.accent}12`]}
        locations={[0, 0.32, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 16,
          paddingBottom: insets.bottom + webBottomInset + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.brandLockup}>
              <View style={[styles.logoRing, { borderColor: theme.primary }]}>
                <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
              </View>
              <View>
                <View style={styles.brandLine}>
                  <Text style={styles.brandName}>MISHA</Text>
                  <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
                </View>
                <Text style={styles.brandSubline}>AI CONTENT FACTORY</Text>
              </View>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>30-SECOND REELS ENGINE</Text>
            <Text style={styles.heroTitle}>
              Turn one idea into a <Text style={{ color: theme.primary }}>scroll-stopping</Text>{' '}
              short.
            </Text>
            <Text style={styles.heroCopy}>
              Build a hook, story, captions, and a clear call to action in one focused flow.
            </Text>
          </View>

          <View style={[styles.themeRail, { borderColor: `${theme.primary}55` }]}>
            <View style={styles.themeRailLeft}>
              <View style={[styles.signal, { backgroundColor: theme.primary }]} />
              <Text style={styles.themeRailText}>{theme.name}</Text>
            </View>
            <Text style={styles.themeRailHint}>AUTO-SHIFT · 30 SEC</Text>
          </View>

          <View style={[styles.panel, { borderColor: `${theme.primary}35` }]}>
            <SectionLabel icon="text-box-edit-outline">START WITH AN IDEA</SectionLabel>
            <View style={styles.segmented}>
              {(['topic', 'text'] as InputMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setInputMode(mode)}
                  style={[styles.segment, inputMode === mode && { backgroundColor: theme.primary }]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      inputMode === mode && { color: colors.primaryForeground },
                    ]}
                  >
                    {mode === 'topic' ? 'Topic / idea' : 'Custom content'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              accessibilityLabel="Topic or content input"
              testID="topic-input"
              value={topic}
              onChangeText={(value) => {
                setTopic(value);
                if (error) setError('');
              }}
              placeholder={inputPlaceholder}
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
              style={[styles.input, { borderColor: error ? colors.destructive : colors.border }]}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.starterRow}
            >
              {starterTopics.map((starter) => (
                <Pressable key={starter} onPress={() => setTopic(starter)} style={styles.starter}>
                  <Text style={styles.starterText}>{starter}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <SectionLabel icon="tune-variant">DIRECT THE VIBE</SectionLabel>
            <Text style={styles.fieldTitle}>Tone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {toneOptions.map((option) => (
                <Chip key={option} label={option} selected={tone === option} onPress={() => setTone(option)} accent={theme.primary} />
              ))}
            </ScrollView>
            <Text style={styles.fieldTitle}>Voice</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {voiceOptions.map((option) => (
                <Chip key={option} label={option} selected={voice === option} onPress={() => setVoice(option)} accent={theme.accent} />
              ))}
            </ScrollView>
            <Text style={styles.fieldTitle}>Visual direction</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {styleOptions.map((option) => (
                <Chip key={option} label={option} selected={style === option} onPress={() => setStyle(option)} accent={theme.primary} />
              ))}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Generate 30 second reel"
              testID="generate-button"
              disabled={isGenerating}
              onPress={generate}
              style={({ pressed }) => [
                styles.generateButton,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
                pressed && styles.pressed,
                isGenerating && styles.disabled,
              ]}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Ionicons name="sparkles" size={19} color={colors.primaryForeground} />
              )}
              <Text style={[styles.generateText, { color: colors.primaryForeground }]}>
                {isGenerating ? 'BUILDING YOUR REEL...' : 'GENERATE 30S SHORT'}
              </Text>
              {!isGenerating ? <Feather name="arrow-up-right" size={18} color={colors.primaryForeground} /> : null}
            </Pressable>
          </View>

          {latest ? (
            <View style={[styles.outputPanel, { borderColor: `${theme.accent}4d` }]}>
              <View style={styles.outputHeader}>
                <View>
                  <Text style={[styles.eyebrow, { color: theme.accent }]}>REEL BLUEPRINT READY</Text>
                  <Text style={styles.outputTitle}>Your short is in the lab.</Text>
                </View>
                <View style={[styles.readyBadge, { backgroundColor: `${theme.accent}1d` }]}>
                  <View style={[styles.readyDot, { backgroundColor: theme.accent }]} />
                  <Text style={[styles.readyText, { color: theme.accent }]}>READY</Text>
                </View>
              </View>
              <View style={[styles.reelPreview, { borderColor: `${theme.primary}55` }]}>
                <LinearGradient
                  colors={[`${theme.primary}dd`, '#171535', `${theme.accent}cc`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.previewTopline}>
                  <View style={[styles.previewPill, { backgroundColor: `${theme.primary}cc` }]}>
                    <MaterialCommunityIcons name="robot-outline" size={13} color="#ffffff" />
                    <Text style={styles.previewPillText}>MISHA / 30S</Text>
                  </View>
                  <Text style={styles.previewTime}>00:00</Text>
                </View>
                <View style={styles.previewCenter}>
                  <Text style={styles.previewHook}>
                    {latest.script.split(/\s+/).slice(0, 7).join(' ')}
                  </Text>
                  <View style={[styles.captionLine, { backgroundColor: theme.accent }]} />
                </View>
                <View style={styles.previewBottom}>
                  <Text style={styles.previewTopic} numberOfLines={1}>{latest.topic}</Text>
                  <Text style={styles.previewStyle}>{latest.style.toUpperCase()}</Text>
                </View>
              </View>
              <Pressable onPress={() => setShowScript((value) => !value)} style={styles.inspectorHeader}>
                <View style={styles.inspectorTitleWrap}>
                  <Feather name="file-text" size={16} color={theme.accent} />
                  <Text style={styles.inspectorTitle}>SCRIPT INSPECTOR</Text>
                  <View style={styles.wordBadge}>
                    <Text style={styles.wordBadgeText}>{latest.script.split(/\s+/).length} WORDS</Text>
                  </View>
                </View>
                <Feather name={showScript ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
              </Pressable>
              {showScript ? (
                <View style={styles.scriptBody}>
                  <Text style={styles.scriptText}>{latest.script}</Text>
                  <View style={styles.scriptMeta}>
                    <Text style={styles.metaText}>{latest.tone} tone</Text>
                    <Text style={styles.metaText}>{latest.voice}</Text>
                    <Text style={styles.metaText}>{formatDate(latest.createdAt)}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyPreview}>
              <View style={[styles.emptyIcon, { borderColor: `${theme.primary}55` }]}>
                <MaterialCommunityIcons name="movie-open-outline" size={23} color={theme.primary} />
              </View>
              <Text style={styles.emptyTitle}>Your reel preview will appear here</Text>
              <Text style={styles.emptyCopy}>Drop in an idea above and let Misha shape the story.</Text>
            </View>
          )}

          {history.length > 0 ? (
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <SectionLabel icon="history">RECENT BUILDS</SectionLabel>
                <Text style={styles.historyCount}>{history.length} / 6</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyRow}>
                {history.map((reel) => (
                  <Pressable
                    key={reel.id}
                    onPress={() => selectHistory(reel)}
                    style={[
                      styles.historyCard,
                      { borderColor: reel.id === latest?.id ? `${theme.primary}88` : colors.border },
                    ]}
                  >
                    <View style={[styles.historyAccent, { backgroundColor: reel.id === latest?.id ? theme.primary : theme.accent }]} />
                    <Text style={styles.historyDate}>{formatDate(reel.createdAt)}</Text>
                    <Text style={styles.historyTopic} numberOfLines={2}>{reel.topic}</Text>
                    <Text style={styles.historyTone}>{reel.tone.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.footerCopy}>
              <Text style={styles.footerTitle}>Create on the move.</Text>
              <Text style={styles.footerText}>Misha Mobile is ready for your next scroll-stopper.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  page: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoRing: { width: 43, height: 43, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#12142a' },
  logo: { width: 35, height: 35, borderRadius: 12 },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandName: { color: '#f8f7ff', fontSize: 19, fontWeight: '800', letterSpacing: 2.2 },
  liveDot: { width: 5, height: 5, borderRadius: 3 },
  brandSubline: { color: '#9296b8', fontSize: 8, fontWeight: '700', letterSpacing: 1.4, marginTop: 2 },
  hero: { paddingTop: 35, paddingBottom: 22 },
  eyebrow: { color: '#9296b8', fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  heroTitle: { color: '#f8f7ff', fontSize: 34, lineHeight: 41, fontWeight: '800', letterSpacing: -1.1, marginTop: 10 },
  heroCopy: { color: '#9296b8', fontSize: 14, lineHeight: 21, marginTop: 12, maxWidth: 510 },
  themeRail: { height: 38, borderWidth: 1, borderRadius: 12, backgroundColor: '#12142a99', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 14 },
  themeRailLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  signal: { width: 7, height: 7, borderRadius: 4 },
  themeRailText: { color: '#f8f7ff', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  themeRailHint: { color: '#656a8d', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  panel: { borderWidth: 1, borderRadius: 22, padding: 15, backgroundColor: '#12142ae8' },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 11 },
  sectionLabelText: { color: '#9296b8', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  segmented: { flexDirection: 'row', padding: 3, borderRadius: 13, backgroundColor: '#090a18', marginBottom: 12 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  segmentText: { color: '#9296b8', fontSize: 12, fontWeight: '700' },
  input: { minHeight: 106, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 12, color: '#f8f7ff', fontSize: 15, lineHeight: 22, backgroundColor: '#0d0f21' },
  starterRow: { gap: 7, paddingVertical: 10, paddingRight: 18 },
  starter: { borderWidth: 1, borderColor: '#292d50', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#171a32' },
  starterText: { color: '#9296b8', fontSize: 10 },
  errorText: { color: '#ff5c7c', fontSize: 12, marginBottom: 12, marginTop: -2 },
  fieldTitle: { color: '#f8f7ff', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 3 },
  chipRow: { gap: 7, paddingBottom: 10 },
  chip: { borderWidth: 1, borderColor: '#292d50', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, backgroundColor: '#171a32' },
  chipText: { color: '#9296b8', fontSize: 11, fontWeight: '600' },
  generateButton: { minHeight: 54, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 7, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 7 },
  generateText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.9 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.65 },
  emptyPreview: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 25 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, backgroundColor: '#12142a', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { color: '#f8f7ff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptyCopy: { color: '#656a8d', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6, maxWidth: 250 },
  outputPanel: { borderWidth: 1, borderRadius: 22, padding: 15, backgroundColor: '#12142ae8', marginTop: 14 },
  outputHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 13 },
  outputTitle: { color: '#f8f7ff', fontSize: 20, fontWeight: '800', marginTop: 7 },
  readyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9 },
  readyDot: { width: 6, height: 6, borderRadius: 3 },
  readyText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  reelPreview: { width: '100%', maxWidth: 310, alignSelf: 'center', aspectRatio: 9 / 12, borderWidth: 1, borderRadius: 18, overflow: 'hidden', padding: 13, justifyContent: 'space-between' },
  previewTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', gap: 5, alignItems: 'center' },
  previewPillText: { color: '#ffffff', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  previewTime: { color: '#ffffffcc', fontSize: 10, fontWeight: '700' },
  previewCenter: { alignItems: 'center', paddingHorizontal: 12 },
  previewHook: { color: '#ffffff', fontSize: 23, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  captionLine: { width: 38, height: 3, borderRadius: 2, marginTop: 15 },
  previewBottom: { gap: 5 },
  previewTopic: { color: '#ffffffdd', fontSize: 11, fontWeight: '700' },
  previewStyle: { color: '#ffffff99', fontSize: 8, fontWeight: '800', letterSpacing: 1.2 },
  inspectorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#292d50' },
  inspectorTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inspectorTitle: { color: '#f8f7ff', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  wordBadge: { backgroundColor: '#171a32', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4 },
  wordBadgeText: { color: '#9296b8', fontSize: 8, fontWeight: '800' },
  scriptBody: { paddingTop: 14 },
  scriptText: { color: '#c6c8dc', fontSize: 13, lineHeight: 21 },
  scriptMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  metaText: { color: '#656a8d', fontSize: 10, backgroundColor: '#171a32', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  historySection: { marginTop: 24 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyCount: { color: '#656a8d', fontSize: 10, fontWeight: '700' },
  historyRow: { gap: 9, paddingBottom: 5 },
  historyCard: { width: Math.min(width * 0.52, 190), minHeight: 112, borderWidth: 1, borderRadius: 15, backgroundColor: '#12142a', padding: 12, overflow: 'hidden' },
  historyAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  historyDate: { color: '#656a8d', fontSize: 9, fontWeight: '700', marginBottom: 9 },
  historyTopic: { color: '#f8f7ff', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  historyTone: { color: '#9296b8', fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginTop: 10 },
  footer: { borderTopWidth: 1, marginTop: 28, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  footerCopy: { flex: 1 },
  footerTitle: { color: '#f8f7ff', fontSize: 16, fontWeight: '800' },
  footerText: { color: '#656a8d', fontSize: 11, lineHeight: 17, marginTop: 4 },
});
