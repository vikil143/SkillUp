// App.js — SkillUp 🦉 (React Native)
// Drop-in single-file app. Setup instructions in README.md.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Share,
  Linking,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED } from './seed';
import { uid } from './seed/helpers';
import { getQuestionCards } from './src/domain/questions';
import QuestionEditModal from './src/features/questions/QuestionEditModal';
import QuestionsScreen from './src/features/questions/QuestionsScreen';
import RichAnswerText from './src/features/questions/RichAnswerText';
import ExplanationEditModal from './src/features/questions/ExplanationEditModal';
import RagScreen from './src/features/rag/RagScreen';
import { COLORS } from './src/theme/colors';

// ============================================================
// CONSTANTS & STORAGE
// ============================================================
const STORAGE_KEY = 'skillup-data-v1';
const STREAK_KEY = 'skillup-streak-v1';
const REVISE_STATE_KEY = 'skillup-revise-state-v1';
// Bump this string whenever seed content changes — forces migration to re-run
const SEED_VERSION = '2026-06-25-v17';
const REQUIRED_SEED_SKILLS = [
  'foundation||Programming Foundations',
  'foundation||Web Foundations',
  'foundation||Data Foundations',
  'frontend||JavaScript + React Senior Interview',
  'frontend||Microfrontends Interview',
  'internet||Internet & Networking Interview Q&A',
];

const loadData = async () => {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};
const saveData = async (d) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (e) {
    console.warn('Save failed', e);
  }
};
const loadStreak = async () => {
  try {
    const v = await AsyncStorage.getItem(STREAK_KEY);
    return v ? JSON.parse(v) : { count: 0, lastDate: null, xp: 0 };
  } catch {
    return { count: 0, lastDate: null, xp: 0 };
  }
};
const saveStreak = (s) =>
  AsyncStorage.setItem(STREAK_KEY, JSON.stringify(s)).catch(() => {});

const loadReviseState = async () => {
  try {
    const v = await AsyncStorage.getItem(REVISE_STATE_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};
const saveReviseState = async (state) => {
  try {
    await AsyncStorage.setItem(REVISE_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Revise state save failed', e);
  }
};
const clearReviseState = async () => {
  try {
    await AsyncStorage.removeItem(REVISE_STATE_KEY);
  } catch (e) {
    console.warn('Revise state clear failed', e);
  }
};

// ============================================================
// LINK / YOUTUBE UTILITIES
// ============================================================
const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
};
const isYouTubeUrl = (url) => Boolean(getYouTubeId(url));
const openLink = (url) =>
  Linking.openURL(url).catch(() => Alert.alert('Cannot open link', url));

// Parse "m:ss", "h:mm:ss", or plain seconds string → integer seconds
const parseStartTime = (t) => {
  if (!t || !String(t).trim()) return 0;
  const s = String(t).trim();
  if (s.includes(':')) {
    const parts = s.split(':').map(Number);
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return parseInt(s, 10) || 0;
};

// Format seconds back to "m:ss" for display
const fmtTime = (t) => {
  const secs = parseStartTime(t);
  if (!secs) return '';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// Extract ?t= / &t= from a YouTube URL (handles 90, 1m30s, 1h30m45s)
const extractTFromUrl = (url) => {
  if (!url) return null;
  const m = url.match(/[?&]t=([0-9hms]+)/i);
  if (!m) return null;
  const raw = m[1];
  const hm = raw.match(/(\d+)h/i);
  const mm = raw.match(/(\d+)m/i);
  const sm = raw.match(/(\d+)s/i);
  let secs = 0;
  if (hm || mm || sm) {
    if (hm) secs += parseInt(hm[1], 10) * 3600;
    if (mm) secs += parseInt(mm[1], 10) * 60;
    if (sm) secs += parseInt(sm[1], 10);
  } else {
    secs = parseInt(raw, 10) || 0;
  }
  return secs > 0 ? String(secs) : null;
};

// ============================================================
// SEED DATA - imported from ./seed
// uid imported above; also used by edit forms
// ============================================================

// ============================================================
// REUSABLE COMPONENTS
// ============================================================
function PressBtn({ children, color = COLORS.primary, darkColor, onPress, small, style, ghost, disabled }) {
  const [pressed, setPressed] = useState(false);
  const bg = ghost ? '#FFFFFF' : color;
  const shadow = ghost ? COLORS.border : darkColor || darken(color);
  const textColor = ghost ? COLORS.text : '#FFFFFF';
  return (
    <View style={[{ alignSelf: 'flex-start', position: 'relative' }, style]}>
      <View
        style={{
          position: 'absolute', top: 4, left: 0, right: 0, bottom: 0,
          backgroundColor: shadow, borderRadius: 14,
        }}
      />
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={disabled ? null : onPress}
        style={{
          backgroundColor: bg,
          borderRadius: 14,
          paddingHorizontal: small ? 14 : 20,
          paddingVertical: small ? 8 : 12,
          transform: [{ translateY: pressed ? 3 : 0 }],
          opacity: disabled ? 0.5 : 1,
          borderWidth: ghost ? 2 : 0,
          borderColor: COLORS.border,
        }}
      >
        <Text style={{
          color: textColor,
          fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
          fontWeight: '800',
          fontSize: small ? 12 : 14,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>{children}</Text>
      </Pressable>
    </View>
  );
}

function darken(hex) {
  // Simple darken: parse hex, multiply each channel by 0.75
  const c = hex.replace('#', '');
  const r = Math.floor(parseInt(c.slice(0, 2), 16) * 0.7);
  const g = Math.floor(parseInt(c.slice(2, 4), 16) * 0.7);
  const b = Math.floor(parseInt(c.slice(4, 6), 16) * 0.7);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function Chip({ children, color = COLORS.primary, onPress }) {
  const bg = color + '22'; // 13% opacity
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: bg,
        borderColor: color + '88',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      <Text style={{ color: darken(color), fontWeight: '800', fontSize: 12 }}>{children}</Text>
    </TouchableOpacity>
  );
}

function NewTag() {
  return (
    <View style={{
      backgroundColor: '#FF4B4B',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 6,
      alignSelf: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>NEW</Text>
    </View>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState({ screen: 'skills-home' });
  const [history, setHistory] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [streak, setStreak] = useState({ count: 0, lastDate: null, xp: 0 });
  const [editing, setEditing] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [reviseState, setReviseState] = useState(null);
  const [reviseExplaining, setReviseExplaining] = useState(null);

  useEffect(() => {
    (async () => {
      const stored = await loadData();
      if (stored && stored.categories) {
        // Call SEED() once so all IDs are consistent across every migration step
        const seed = SEED();
        const hasMissingRequiredSeedSkill = REQUIRED_SEED_SKILLS.some((key) => {
          const [categoryId, name] = key.split('||');
          return !stored.skills.some((s) => s.categoryId === categoryId && s.name === name);
        });
        const needsContentSync = stored.seedVersion !== SEED_VERSION || hasMissingRequiredSeedSkill;

        // Migration: ensure new categories exist
        seed.categories.forEach((sc) => {
          if (!stored.categories.find((c) => c.id === sc.id)) {
            stored.categories.push(sc);
          }
        });
        // Migration: ensure every skill has apis and refs arrays
        stored.skills.forEach((s) => {
          if (!Array.isArray(s.apis)) s.apis = [];
          if (!Array.isArray(s.refs)) s.refs = [];
        });
        // Migration: update auth category name if still old value
        const authCat = stored.categories.find((c) => c.id === 'auth');
        if (authCat && authCat.name === 'Auth & Security') authCat.name = 'Security & Auth';
        // Migration: seed webgl skills if the category is newly added
        if (!stored.skills.some((s) => s.categoryId === 'webgl')) {
          stored.skills.push(...seed.skills.filter((s) => s.categoryId === 'webgl'));
        }
        // Migration: merge new seed content when SEED_VERSION has changed
        if (needsContentSync) {
          const seedSkills = seed.skills;
          stored.skills.forEach((storedSkill) => {
            const seedMatch = seedSkills.find(
              (ss) => ss.name === storedSkill.name && ss.categoryId === storedSkill.categoryId
            );
            if (!seedMatch) return;

            // Merge flashcards — add any seed card whose question isn't already present
            const existingQs = new Set((storedSkill.flashcards || []).map((f) => f.q));
            (seedMatch.flashcards || []).forEach((sf) => {
              if (!existingQs.has(sf.q)) storedSkill.flashcards.push(sf);
            });

            // Merge APIs — add any seed API whose name isn't already present
            const existingApiNames = new Set(
              (storedSkill.apis || []).map((a) => a.name.toLowerCase())
            );
            (seedMatch.apis || []).forEach((sa) => {
              if (!existingApiNames.has(sa.name.toLowerCase())) storedSkill.apis.push(sa);
            });

            // Merge refs — add any seed ref whose URL isn't already present
            const existingUrls = new Set((storedSkill.refs || []).map((r) => r.url));
            (seedMatch.refs || []).forEach((sr) => {
              if (!existingUrls.has(sr.url)) storedSkill.refs.push(sr);
            });

            // Fill empty structured fields from seed
            if (!storedSkill.structured) storedSkill.structured = {};
            ['definition', 'codeExample', 'whenUsed', 'gotchas'].forEach((field) => {
              if (!storedSkill.structured[field] && seedMatch.structured?.[field]) {
                storedSkill.structured[field] = seedMatch.structured[field];
              }
            });
          });

          // Push new skills/sub-topics that exist in seed but not in stored
          const storedNames = new Set(
            stored.skills.map((s) => `${s.categoryId}||${s.name}||${s.parentId ?? ''}`)
          );
          seedSkills.forEach((ss) => {
            let resolvedParentId = null;
            if (ss.parentId) {
              const seedParent = seedSkills.find((p) => p.id === ss.parentId);
              if (seedParent) {
                const storedParent = stored.skills.find(
                  (sp) => sp.name === seedParent.name && sp.categoryId === seedParent.categoryId
                );
                resolvedParentId = storedParent ? storedParent.id : null;
              }
            }
            const key = `${ss.categoryId}||${ss.name}||${resolvedParentId ?? ''}`;
            if (!storedNames.has(key)) {
              stored.skills.push({ ...ss, parentId: resolvedParentId });
              storedNames.add(key);
            }
          });

          stored.seedVersion = SEED_VERSION;
        }
        setData(stored);
        await saveData(stored);
      } else {
        const seed = SEED();
        setData(seed);
        await saveData(seed);
      }
      const s = await loadStreak();
      setStreak(s);
      const rs = await loadReviseState();
      setReviseState(rs);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded && data) saveData(data);
  }, [data, loaded]);

  const update = useCallback((mutator) => {
    setData((d) => {
      const next = JSON.parse(JSON.stringify(d));
      mutator(next);
      return next;
    });
  }, []);

  const navigate = useCallback((screen, params = {}) => {
    setHistory((h) => [...h, view]);
    setView({ screen, ...params });
  }, [view]);
  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setView(prev);
      return h.slice(0, -1);
    });
  }, []);
  const addQuestion = useCallback(() => {
    setEditing({ type: 'question', item: {} });
  }, []);
  const editQuestion = useCallback((q) => {
    setEditing({ type: 'question', item: q });
  }, []);

  const bumpXP = useCallback((amount) => {
    setStreak((s) => {
      const today = new Date().toDateString();
      const newCount = s.lastDate === today ? s.count : s.lastDate ? s.count + 1 : 1;
      const next = { count: newCount, lastDate: today, xp: s.xp + amount };
      saveStreak(next);
      return next;
    });
  }, []);

  const handleReviseStateChange = useCallback((newState) => {
    saveReviseState(newState);
    setReviseState(newState);
  }, []);

  if (!loaded || !data) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={styles.loadingText}>🦉 Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <Header
        streak={streak}
        onSearch={() => setSearchOpen(true)}
        onHome={() => { setHistory([]); setView({ screen: 'skills-home' }); }}
      />

      {view.screen === 'questions' ? (
        <QuestionsScreen
          data={data}
          navigate={navigate}
          onAdd={addQuestion}
          onEdit={editQuestion}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {view.screen === 'skills-home' && (
            <SkillsHome
              data={data}
              navigate={navigate}
              onEditCategory={(c) => setEditing({ type: 'category', item: c })}
            />
          )}
          {view.screen === 'category-detail' && (
            <CategoryDetail
              data={data}
              categoryId={view.categoryId}
              navigate={navigate}
              goBack={goBack}
              onAdd={() => setEditing({ type: 'skill', item: { categoryId: view.categoryId } })}
            />
          )}
          {view.screen === 'skill-detail' && (
            <SkillDetail
              data={data}
              skillId={view.skillId}
              navigate={navigate}
              goBack={goBack}
              onEdit={(s) => setEditing({ type: 'skill', item: s })}
              onAddSubtopic={(parentId, categoryId) =>
                setEditing({ type: 'skill', item: { parentId, categoryId } })
              }
            />
          )}
          {view.screen === 'projects' && (
            <ProjectsScreen
              data={data}
              navigate={navigate}
              onAdd={() => setEditing({ type: 'project', item: {} })}
            />
          )}
          {view.screen === 'project-detail' && (
            <ProjectDetail
              data={data}
              projectId={view.projectId}
              navigate={navigate}
              goBack={goBack}
              onEdit={(p) => setEditing({ type: 'project', item: p })}
            />
          )}
          {view.screen === 'experience' && (
            <ExperienceScreen
              data={data}
              onAdd={() => setEditing({ type: 'experience', item: {} })}
              onEdit={(e) => setEditing({ type: 'experience', item: e })}
            />
          )}
          {view.screen === 'rag' && (
            <RagScreen
              data={data}
              navigate={navigate}
            />
          )}
          {view.screen === 'revise' && (
            <ReviseMode 
              data={data} 
              bumpXP={bumpXP}
              reviseState={reviseState}
              onReviseStateChange={handleReviseStateChange}
            />
          )}
        </ScrollView>
      )}

      {/* Floating Add Button */}
      {(view.screen === 'category-detail' ||
        view.screen === 'skills-home' ||
        view.screen === 'projects' ||
        view.screen === 'experience' ||
        view.screen === 'questions') && (
        <Fab
          onPress={() => {
            if (view.screen === 'projects') setEditing({ type: 'project', item: {} });
            else if (view.screen === 'experience') setEditing({ type: 'experience', item: {} });
            else if (view.screen === 'questions') setEditing({ type: 'question', item: {} });
            else if (view.screen === 'category-detail')
              setEditing({ type: 'skill', item: { categoryId: view.categoryId } });
            else setEditing({ type: 'category', item: {} });
          }}
        />
      )}

      <BottomNav current={view.screen} navigate={navigate} />

      <Modal visible={searchOpen} animationType="slide" transparent>
        <SearchModal
          data={data}
          q={searchQ}
          setQ={setSearchQ}
          onClose={() => setSearchOpen(false)}
          onPick={(s, p) => { setSearchOpen(false); navigate(s, p); }}
        />
      </Modal>

      <Modal visible={!!editing} animationType="slide" transparent>
        {editing && (
          <EditModal
            data={data}
            editing={editing}
            update={update}
            onClose={() => setEditing(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({ streak, onSearch, onHome }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onHome} activeOpacity={0.7}>
        <Text style={styles.logo}>🦉 SkillUp</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <View style={[styles.pill, { backgroundColor: '#FFF4E5', borderColor: '#FFD89E' }]}>
        <Text style={[styles.pillText, { color: COLORS.orange }]}>🔥 {streak.count}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: '#E8F8E0', borderColor: '#B6E388', marginLeft: 6 }]}>
        <Text style={[styles.pillText, { color: COLORS.primaryDark }]}>⚡ {streak.xp}</Text>
      </View>
      <TouchableOpacity onPress={onSearch} style={styles.iconBtn}>
        <Text style={{ fontSize: 18 }}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// BOTTOM NAV
// ============================================================
function BottomNav({ current, navigate }) {
  const items = [
    { key: 'skills-home', label: 'Skills', emoji: '📚' },
    { key: 'projects', label: 'Projects', emoji: '🚀' },
    { key: 'experience', label: 'Career', emoji: '💼' },
    { key: 'questions', label: 'Questions', emoji: '❓' },
    { key: 'rag', label: 'RAG', emoji: '🔎' },
    { key: 'revise', label: 'Revise', emoji: '⚡' },
  ];
  const isActive = (k) =>
    current === k ||
    (k === 'skills-home' && (current === 'category-detail' || current === 'skill-detail')) ||
    (k === 'projects' && current === 'project-detail');

  return (
    <View style={styles.bottomNav}>
      {items.map((it) => {
        const active = isActive(it.key);
        return (
          <TouchableOpacity
            key={it.key}
            onPress={() => navigate(it.key)}
            style={[styles.navItem, active && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 22 }}>{it.emoji}</Text>
            <Text style={[styles.navLabel, active && { color: COLORS.primary }]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ============================================================
// FAB
// ============================================================
function Fab({ onPress }) {
  return (
    <View style={styles.fabWrap} pointerEvents="box-none">
      <Pressable onPress={onPress} style={({ pressed }) => [
        styles.fab,
        { transform: [{ translateY: pressed ? 3 : 0 }] },
      ]}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', lineHeight: 32 }}>+</Text>
      </Pressable>
    </View>
  );
}

// ============================================================
// SKILLS HOME (Categories Grid)
// ============================================================
function SkillsHome({ data, navigate, onEditCategory }) {
  return (
    <View>
      <Text style={styles.screenTitle}>Hey Vikil 👋</Text>
      <Text style={styles.screenSub}>
        {data.skills.length} skills · {data.categories.length} categories. Pick one to revise.
      </Text>
      <View style={styles.catGrid}>
        {data.categories.map((c) => {
          const count = data.skills.filter((s) => s.categoryId === c.id && !s.parentId).length;
          return (
            <Pressable
              key={c.id}
              onPress={() => navigate('category-detail', { categoryId: c.id })}
              onLongPress={() => onEditCategory(c)}
              delayLongPress={400}
              style={({ pressed }) => [
                styles.catCard,
                { transform: [{ translateY: pressed ? 2 : 0 }] },
              ]}
            >
              <Text style={styles.catEmoji}>{c.emoji}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.catName}>{c.name}</Text>
                {c.isUserAdded && <NewTag />}
              </View>
              <View style={[styles.catCount, { backgroundColor: c.color }]}>
                <Text style={styles.catCountText}>{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================
// CATEGORY DETAIL (Top-level skills only — tree starts at skill)
// ============================================================
function CategoryDetail({ data, categoryId, navigate, goBack, onAdd }) {
  const cat = data.categories.find((c) => c.id === categoryId);
  const skills = data.skills.filter((s) => s.categoryId === categoryId && !s.parentId);
  if (!cat) return null;

  return (
    <View>
      <Crumb onPress={goBack} label="Back to skills" />
      <Text style={styles.screenTitle}>{cat.emoji} {cat.name}</Text>
      <Text style={styles.screenSub}>{skills.length} top-level skill{skills.length !== 1 ? 's' : ''}</Text>

      {skills.length === 0 && (
        <View style={styles.panel}>
          <Text style={styles.emptyText}>No skills yet. Tap + to add one.</Text>
        </View>
      )}

      {skills.map((s) => {
        const subCount = countDescendants(data.skills, s.id);
        const flashCount = (s.flashcards || []).length;
        return (
          <Pressable
            key={s.id}
            onPress={() => navigate('skill-detail', { skillId: s.id })}
            style={({ pressed }) => [styles.skillRow, { transform: [{ translateY: pressed ? 2 : 0 }] }]}
          >
            <View style={[styles.skillBubble, { backgroundColor: cat.color }]}>
              <Text style={styles.skillBubbleText}>{s.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.skillRowName}>{s.name}</Text>
                {s.isUserAdded && <NewTag />}
              </View>
              <Text style={styles.skillRowMeta}>
                {subCount > 0 ? `🌳 ${subCount} sub-topic${subCount !== 1 ? 's' : ''} · ` : ''}
                {flashCount} flashcard{flashCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => shareSkill(s, data)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 6 }}
            >
              <Text style={{ fontSize: 16 }}>📤</Text>
            </TouchableOpacity>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function countDescendants(skills, parentId) {
  let count = 0;
  const direct = skills.filter((s) => s.parentId === parentId);
  count += direct.length;
  direct.forEach((d) => { count += countDescendants(skills, d.id); });
  return count;
}

// ============================================================
// SKILL DETAIL (with tabs + recursive tree of sub-topics)
// ============================================================
function SkillDetail({ data, skillId, navigate, goBack, onEdit, onAddSubtopic }) {
  const [tab, setTab] = useState('tree');
  const [revealed, setRevealed] = useState({});
  const [apiExpanded, setApiExpanded] = useState({});
  const [ytPlay, setYtPlay] = useState(null); // { videoId, startTime }
  const [editingExplanation, setEditingExplanation] = useState(null);
  const skill = data.skills.find((s) => s.id === skillId);
  const cat = skill ? data.categories.find((c) => c.id === skill.categoryId) : null;
  if (!skill || !cat) return <Text style={styles.emptyText}>Skill not found.</Text>;

  const directChildren = data.skills.filter((s) => s.parentId === skill.id);
  const parent = skill.parentId ? data.skills.find((s) => s.id === skill.parentId) : null;
  const relatedProjects = (skill.relatedProjectIds || [])
    .map((pid) => data.projects.find((p) => p.id === pid))
    .filter(Boolean);

  const tabs = [
    { key: 'tree', label: `🌳 Tree${directChildren.length ? ` (${directChildren.length})` : ''}` },
    { key: 'notes', label: '📝 Notes' },
    { key: 'deep', label: '🔬 Deep Dive' },
    { key: 'apis', label: `🔧 APIs (${(skill.apis || []).length})` },
    { key: 'cards', label: `🎴 Cards (${(skill.flashcards || []).length})` },
    { key: 'used', label: `🚀 Used (${relatedProjects.length})` },
    { key: 'links', label: `🔗 Links (${(skill.refs || []).length})` },
  ];

  return (
    <View>
      <Crumb
        onPress={goBack}
        label={parent ? `${parent.name}` : `${cat.emoji} ${cat.name}`}
      />

      {/* Hero card */}
      <View style={[styles.hero, { backgroundColor: cat.color }]}>
        <Text style={styles.heroEmoji}>{cat.emoji}</Text>
        <Text style={styles.heroTitle}>{skill.name}</Text>
        <Text style={styles.heroSub}>
          {parent ? `↳ inside ${parent.name}` : `in ${cat.name}`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <PressBtn small color={COLORS.blue} onPress={() => onEdit(skill)}>✏️ Edit</PressBtn>
        <PressBtn small color={COLORS.primary} onPress={() => onAddSubtopic(skill.id, skill.categoryId)}>+ Sub-topic</PressBtn>
        <PressBtn small color={COLORS.teal} onPress={() => shareSkill(skill, data)}>📤 Export</PressBtn>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={styles.tab}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            {tab === t.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === 'tree' && (
        <View>
          {directChildren.length === 0 ? (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>
                No sub-topics yet. Tap "+ Sub-topic" above to break this skill into smaller learnable pieces.
              </Text>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>SUB-TOPIC TREE</Text>
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 12 }}>
                Tap any node to drill in · arrow to expand/collapse
              </Text>
              {directChildren.map((child) => (
                <TreeNode
                  key={child.id}
                  skill={child}
                  allSkills={data.skills}
                  depth={0}
                  categoryColor={cat.color}
                  onPress={(id) => navigate('skill-detail', { skillId: id })}
                  onExport={(id) => shareSkill(data.skills.find((s) => s.id === id), data)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {tab === 'notes' && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>FREE-FORM NOTES</Text>
          {skill.notes ? (
            <Text style={styles.panelBody}>{skill.notes}</Text>
          ) : (
            <Text style={styles.emptyText}>No notes yet. Tap Edit to add.</Text>
          )}
        </View>
      )}

      {tab === 'deep' && (
        <View>
          <DepthPanel title="📖 DEFINITION" body={skill.structured.definition} placeholder="Add a clear definition." />
          <DepthPanel title="💻 CODE EXAMPLE" body={skill.structured.codeExample} placeholder="Add a snippet." code />
          <DepthPanel title="🎯 WHEN YOU USED IT" body={skill.structured.whenUsed} placeholder="Project + outcome." />
          <DepthPanel title="⚠️ GOTCHAS" body={skill.structured.gotchas} placeholder="Pitfalls and surprises." />
        </View>
      )}

      {tab === 'apis' && (
        <View>
          {(skill.apis || []).length === 0 ? (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>
                No APIs added yet. Tap Edit to add API references (useState, fs.readFile, etc.).
              </Text>
            </View>
          ) : (
            (skill.apis || []).map((api) => {
              const expanded = !!apiExpanded[api.id];
              return (
                <Pressable
                  key={api.id}
                  onPress={() => setApiExpanded((s) => ({ ...s, [api.id]: !s[api.id] }))}
                  style={styles.apiCard}
                >
                  <Text style={styles.apiName}>{api.name}</Text>
                  {api.signature ? (
                    <Text style={styles.apiSignature}>{api.signature}</Text>
                  ) : null}
                  {!expanded && (
                    <Text style={styles.flashHint}>Tap to expand</Text>
                  )}
                  {expanded && (
                    <View style={{ marginTop: 10 }}>
                      {!!api.description && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>DESCRIPTION</Text>
                          <Text style={styles.panelBody}>{api.description}</Text>
                        </View>
                      )}
                      {!!api.params && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>PARAMETERS</Text>
                          <Text style={styles.panelBody}>{api.params}</Text>
                        </View>
                      )}
                      {!!api.returns && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>RETURNS</Text>
                          <Text style={styles.panelBody}>{api.returns}</Text>
                        </View>
                      )}
                      {!!api.example && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>EXAMPLE</Text>
                          <View style={styles.codeBlock}>
                            <Text style={styles.codeText}>{api.example}</Text>
                          </View>
                        </View>
                      )}
                      {!!api.gotchas && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>⚠️ GOTCHAS</Text>
                          <Text style={styles.panelBody}>{api.gotchas}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      )}

      {tab === 'cards' && (
        <View>
          {(skill.flashcards || []).length === 0 && (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>No flashcards yet. Add Q&A pairs via Edit.</Text>
            </View>
          )}
          {(skill.flashcards || []).map((f) => (
            <View
              key={f.id}
              style={styles.flashcard}
            >
              <Pressable
                onPress={() => setRevealed((r) => ({ ...r, [f.id]: !r[f.id] }))}
              >
                <Text style={styles.flashQ}>❓ {f.q}</Text>
                {revealed[f.id] ? (
                  <View>
                    <View style={styles.reviseAnswer}>
                      <Text style={styles.reviseHint}>💡 Answer</Text>
                      <RichAnswerText value={f.a} textStyle={styles.reviseAText} />
                    </View>
                    {f.userExplanation && (
                      <View style={styles.reviseExplanation}>
                        <Text style={styles.reviseHint}>💭 My explanation</Text>
                        <RichAnswerText value={f.userExplanation} textStyle={styles.reviseAText} />
                      </View>
                    )}
                  </View>
                ) : (
                  <Text style={styles.flashHint}>Tap to reveal</Text>
                )}
              </Pressable>
              {revealed[f.id] && (
                <View style={{ marginTop: 12 }}>
                  <PressBtn small color={COLORS.teal} onPress={() => setEditingExplanation(f)} ghost>
                    ✏️ {f.userExplanation ? 'Edit' : 'Add'} my explanation
                  </PressBtn>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {tab === 'used' && (
        <View>
          {relatedProjects.length === 0 && (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>Not linked to any project yet.</Text>
            </View>
          )}
          {relatedProjects.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => navigate('project-detail', { projectId: p.id })}
              style={styles.projectCard}
            >
              <Text style={styles.projectName}>{p.name}</Text>
              <Text style={styles.projectMeta}>{p.role} · {p.period}</Text>
              <Text style={styles.projectDesc}>{p.description}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {tab === 'links' && (
        <View>
          {(skill.refs || []).length === 0 ? (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>
                No references yet. Tap ✏️ Edit to add links and YouTube videos.
              </Text>
            </View>
          ) : (
            (skill.refs || []).map((item) => {
              const vid = getYouTubeId(item.url);
              return vid
                ? <YouTubeRefCard key={item.id} item={item} onPlay={() => setYtPlay({ videoId: vid, startTime: item.startTime || '' })} />
                : <LinkRefCard key={item.id} item={item} />;
            })
          )}
        </View>
      )}

      {ytPlay && <YouTubePlayerModal videoId={ytPlay.videoId} startTime={ytPlay.startTime} onClose={() => setYtPlay(null)} />}

      <Modal visible={!!editingExplanation} animationType="slide" transparent>
        {editingExplanation && (
          <ExplanationEditModal
            explanation={editingExplanation.userExplanation || ''}
            question={editingExplanation.q}
            onSave={(explanation) => {
              if (editingExplanation.id) {
                editingExplanation.userExplanation = explanation;
                setEditingExplanation(null);
              }
            }}
            onClose={() => setEditingExplanation(null)}
          />
        )}
      </Modal>
    </View>
  );
}

function DepthPanel({ title, body, placeholder, code }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {body ? (
        code ? (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{body}</Text>
          </View>
        ) : (
          <Text style={styles.panelBody}>{body}</Text>
        )
      ) : (
        <Text style={styles.emptyText}>{placeholder}</Text>
      )}
    </View>
  );
}

// ============================================================
// TREE NODE (recursive)
// ============================================================
function TreeNode({ skill, allSkills, depth, categoryColor, onPress, onExport }) {
  const children = allSkills.filter((s) => s.parentId === skill.id);
  const [expanded, setExpanded] = useState(depth < 1); // expand first level by default
  const hasChildren = children.length > 0;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
        {/* Indent lines */}
        {depth > 0 && (
          <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: depth }).map((_, i) => (
              <View key={i} style={{ width: 16, borderLeftWidth: 2, borderLeftColor: COLORS.border, height: 28, marginLeft: i === 0 ? 4 : 0 }} />
            ))}
          </View>
        )}
        {/* Branch connector */}
        {depth > 0 && (
          <View style={{ width: 12, height: 2, backgroundColor: COLORS.border, marginRight: 4 }} />
        )}
        {/* Expand arrow */}
        {hasChildren ? (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
            <Text style={{ fontSize: 12, color: COLORS.textLight }}>{expanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
        {/* Node */}
        <Pressable
          onPress={() => onPress(skill.id)}
          onLongPress={() => onExport && onExport(skill.id)}
          delayLongPress={400}
          style={({ pressed }) => [
            styles.treeNode,
            {
              borderLeftColor: categoryColor,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={styles.treeNodeName}>{skill.name}</Text>
          {skill.isUserAdded && <NewTag />}
          {hasChildren && (
            <View style={[styles.treeChildBadge, { backgroundColor: categoryColor + '22' }]}>
              <Text style={{ color: darken(categoryColor), fontSize: 10, fontWeight: '800' }}>
                {children.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      {expanded &&
        children.map((c) => (
          <TreeNode
            key={c.id}
            skill={c}
            allSkills={allSkills}
            depth={depth + 1}
            categoryColor={categoryColor}
            onPress={onPress}
            onExport={onExport}
          />
        ))}
    </View>
  );
}

// ============================================================
// PROJECTS
// ============================================================
function ProjectsScreen({ data, navigate }) {
  return (
    <View>
      <Text style={styles.screenTitle}>🚀 Projects</Text>
      <Text style={styles.screenSub}>{data.projects.length} shipped.</Text>
      {data.projects.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => navigate('project-detail', { projectId: p.id })}
          style={styles.projectCard}
        >
          <Text style={styles.projectName}>{p.name}</Text>
          <Text style={styles.projectMeta}>{p.role} · {p.period} · Team {p.teamSize}</Text>
          <Text style={styles.projectDesc}>{p.description}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {p.stack.slice(0, 5).map((t, i) => (
              <Chip key={i} color={COLORS.blue}>{t}</Chip>
            ))}
            {p.stack.length > 5 && <Chip color={COLORS.textLight}>+{p.stack.length - 5}</Chip>}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function ProjectDetail({ data, projectId, navigate, goBack, onEdit }) {
  const p = data.projects.find((x) => x.id === projectId);
  if (!p) return <Text style={styles.emptyText}>Project not found.</Text>;
  return (
    <View>
      <Crumb onPress={goBack} label="Back to projects" />
      <View style={[styles.hero, { backgroundColor: COLORS.blue }]}>
        <Text style={styles.heroEmoji}>🚀</Text>
        <Text style={styles.heroTitle}>{p.name}</Text>
        <Text style={styles.heroSub}>{p.role} · {p.period}</Text>
      </View>
      <View style={{ marginBottom: 12 }}>
        <PressBtn small color={COLORS.blue} onPress={() => onEdit(p)}>✏️ Edit</PressBtn>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>OVERVIEW</Text>
        <Text style={styles.panelBody}>{p.description}</Text>
        <Text style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8 }}>Team size: {p.teamSize}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🛠️ TECH STACK</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {(p.stack || []).map((name, i) => {
            const skill = data.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
            return (
              <Chip
                key={i}
                color={COLORS.blue}
                onPress={() => skill && navigate('skill-detail', { skillId: skill.id })}
              >
                {name}
              </Chip>
            );
          })}
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>✨ OUTCOMES</Text>
        {(p.outcomes || []).map((o, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={{ color: COLORS.primary, marginRight: 8, fontWeight: '800' }}>✓</Text>
            <Text style={{ flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 21 }}>{o}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================================
// EXPERIENCE
// ============================================================
function ExperienceScreen({ data, onAdd, onEdit }) {
  return (
    <View>
      <Text style={styles.screenTitle}>💼 Career</Text>
      <Text style={styles.screenSub}>{data.experiences.length} roles · 7+ years</Text>
      {data.experiences.map((e) => (
        <View key={e.id} style={styles.expCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.expCompany}>{e.company}</Text>
              <Text style={styles.expTitle}>{e.title}</Text>
              <Text style={styles.expMeta}>{e.period} · {e.location}</Text>
            </View>
            <TouchableOpacity onPress={() => onEdit(e)} style={styles.iconBtn}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          {(e.responsibilities || []).map((r, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={{ color: COLORS.primary, marginRight: 8, fontWeight: '800' }}>✓</Text>
              <Text style={{ flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 21 }}>{r}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ============================================================
// YOUTUBE PLAYER MODAL
// ============================================================
// Chrome Mobile UA — makes YouTube treat the WebView as a real browser,
// avoiding Error 153 (embed blocked in non-browser WebViews).
const CHROME_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

function YouTubePlayerModal({ videoId, startTime, onClose }) {
  const secs = parseStartTime(startTime);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}${secs > 0 ? `&t=${secs}` : ''}`;
  return (
    <Modal
      visible
      animationType="slide"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.ytCloseBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.ytCloseTxt}>✕  Close</Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: watchUrl }}
          style={{ flex: 1 }}
          userAgent={CHROME_UA}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mixedContentMode="always"
          startInLoadingState
          renderLoading={() => (
            <View style={styles.ytLoading}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Loading…</Text>
            </View>
          )}
        />
        <Text style={styles.ytHint}>Rotate phone or tap ⛶ for landscape</Text>
      </View>
    </Modal>
  );
}

// ============================================================
// TIME STEPPER  (H : MM : SS tap +/- input)
// ============================================================
function TimeStepperInput({ value, onChange }) {
  const total = parseStartTime(value);
  const hv = Math.floor(total / 3600);
  const mv = Math.floor((total % 3600) / 60);
  const sv = total % 60;

  const set = (h, m, s) => {
    const t = Math.max(0, h) * 3600 + Math.max(0, Math.min(59, m)) * 60 + Math.max(0, Math.min(59, s));
    onChange(String(t));
  };

  const UnitCol = ({ label, val, onInc, onDec }) => (
    <View style={styles.stepperUnit}>
      <TouchableOpacity onPress={onInc} style={styles.stepperBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.stepperArrow}>▲</Text>
      </TouchableOpacity>
      <Text style={styles.stepperVal}>{String(val).padStart(2, '0')}</Text>
      <TouchableOpacity onPress={onDec} style={styles.stepperBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.stepperArrow}>▼</Text>
      </TouchableOpacity>
      <Text style={styles.stepperLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.stepperRow}>
      <UnitCol label="H" val={hv} onInc={() => set(hv + 1, mv, sv)} onDec={() => set(hv - 1, mv, sv)} />
      <Text style={styles.stepperSep}>:</Text>
      <UnitCol label="M" val={mv} onInc={() => set(hv, mv + 1, sv)} onDec={() => set(hv, mv - 1, sv)} />
      <Text style={styles.stepperSep}>:</Text>
      <UnitCol label="S" val={sv} onInc={() => set(hv, mv, sv + 1)} onDec={() => set(hv, mv, sv - 1)} />
      {total > 0 && (
        <TouchableOpacity onPress={() => onChange('0')} style={styles.stepperClear}>
          <Text style={styles.stepperClearTxt}>✕ Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================
// REF CARDS  (YouTube thumbnail card + plain link card)
// ============================================================
function YouTubeRefCard({ item, onPlay }) {
  const videoId = getYouTubeId(item.url);
  const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const timeLabel = fmtTime(item.startTime);
  return (
    <TouchableOpacity style={styles.refCard} onPress={onPlay} activeOpacity={0.85}>
      <Image source={{ uri: thumb }} style={styles.ytThumb} resizeMode="cover" />
      <View style={styles.refCardBody}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <View style={styles.ytBadge}>
            <Text style={styles.ytBadgeText}>▶  YouTube</Text>
          </View>
          {timeLabel ? (
            <View style={styles.ytTimeBadge}>
              <Text style={styles.ytTimeTxt}>⏱ {timeLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.refTitle} numberOfLines={2}>{item.title || 'Watch video'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function LinkRefCard({ item }) {
  return (
    <TouchableOpacity style={styles.refCard} onPress={() => openLink(item.url)} activeOpacity={0.85}>
      <View style={styles.linkIconWrap}>
        <Text style={{ fontSize: 26 }}>🔗</Text>
      </View>
      <View style={styles.refCardBody}>
        <Text style={styles.refTitle} numberOfLines={2}>{item.title || item.url}</Text>
        <Text style={styles.refUrl} numberOfLines={1}>{item.url}</Text>
      </View>
      <Text style={{ fontSize: 20, color: COLORS.textLight, alignSelf: 'center' }}>›</Text>
    </TouchableOpacity>
  );
}

// ============================================================
// SKILL EXPORT (Markdown)
// ============================================================
function buildSkillMarkdown(skill, cat, parent, allSkills) {
  const lines = [];

  lines.push(`# ${skill.name}`);
  lines.push(`**Category:** ${cat.emoji} ${cat.name}`);
  if (parent) lines.push(`**Parent:** ${parent.name}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  if (skill.notes) {
    lines.push('## 📝 Notes', '');
    lines.push(skill.notes, '');
  }

  const { definition, codeExample, whenUsed, gotchas } = skill.structured || {};
  if (definition || codeExample || whenUsed || gotchas) {
    lines.push('## 🔬 Deep Dive', '');
    if (definition) { lines.push('### Definition', '', definition, ''); }
    if (codeExample) { lines.push('### Code Example', '', '```', codeExample, '```', ''); }
    if (whenUsed) { lines.push('### When Used', '', whenUsed, ''); }
    if (gotchas) { lines.push('### Gotchas', '', gotchas, ''); }
  }

  const flashcards = skill.flashcards || [];
  if (flashcards.length > 0) {
    lines.push(`## 🎴 Flashcards (${flashcards.length})`, '');
    flashcards.forEach((f, i) => {
      lines.push(`**Q${i + 1}:** ${f.q}`);
      lines.push(`**A:** ${f.a}`, '');
    });
  }

  const apis = skill.apis || [];
  if (apis.length > 0) {
    lines.push(`## 🔧 APIs (${apis.length})`, '');
    apis.forEach((api) => {
      lines.push(`### ${api.name}`);
      if (api.signature) lines.push(`\`${api.signature}\``);
      lines.push('');
      if (api.description) lines.push(api.description, '');
      if (api.params) lines.push(`**Params:** ${api.params}`, '');
      if (api.returns) lines.push(`**Returns:** ${api.returns}`, '');
      if (api.example) lines.push('**Example:**', '```', api.example, '```', '');
      if (api.gotchas) lines.push(`**Gotchas:** ${api.gotchas}`, '');
    });
  }

  const refs = skill.refs || [];
  if (refs.length > 0) {
    lines.push(`## 🔗 References (${refs.length})`, '');
    refs.forEach((r) => lines.push(`- [${r.title || r.url}](${r.url})`));
    lines.push('');
  }

  const children = allSkills.filter((s) => s.parentId === skill.id);
  if (children.length > 0) {
    lines.push(`## 🌳 Sub-topics (${children.length})`, '');
    children.forEach((c) => lines.push(`- ${c.name}`));
    lines.push('');
  }

  lines.push('---');
  lines.push('*Exported from SkillUp*');
  return lines.join('\n');
}

function shareSkill(skill, data) {
  const cat = data.categories.find((c) => c.id === skill.categoryId);
  const parent = skill.parentId ? data.skills.find((s) => s.id === skill.parentId) : null;
  const markdown = buildSkillMarkdown(skill, cat, parent, data.skills);
  Share.share({ title: `${skill.name} — SkillUp`, message: markdown })
    .catch((e) => Alert.alert('Export failed', e.message));
}

// ============================================================
// REVISE MODE
// ============================================================
function ReviseMode({ data, bumpXP, reviseState, onReviseStateChange }) {
  const [selectedCatIds, setSelectedCatIds] = useState(new Set(reviseState?.selectedCatIds || []));

  const makeDeck = (catIds) => {
    let cards = getQuestionCards(data);
    if (catIds.size > 0) {
      cards = cards.filter((c) => catIds.has(c.categoryId));
    }
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  };

  const [deck, setDeck] = useState(() => 
    reviseState?.deck || makeDeck(new Set(reviseState?.selectedCatIds || []))
  );
  const [idx, setIdx] = useState(reviseState?.idx || 0);
  const [revealed, setRevealed] = useState(reviseState?.revealed || false);
  const [done, setDone] = useState(reviseState?.done || false);
  const [score, setScore] = useState(reviseState?.score || { good: 0, ok: 0, hard: 0 });
  const [editingExplanation, setEditingExplanation] = useState(null);

  // Save revise state whenever it changes
  const updateReviseState = useCallback(() => {
    const newState = {
      selectedCatIds: Array.from(selectedCatIds),
      deck,
      idx,
      revealed,
      done,
      score,
    };
    onReviseStateChange(newState);
  }, [selectedCatIds, deck, idx, revealed, done, score, onReviseStateChange]);

  useEffect(() => {
    updateReviseState();
  }, [idx, revealed, done, score, updateReviseState]);

  const resetSession = (newDeck) => {
    setDeck(newDeck);
    setIdx(0);
    setRevealed(false);
    setDone(false);
    setScore({ good: 0, ok: 0, hard: 0 });
  };

  const restart = () => resetSession(makeDeck(selectedCatIds));

  const catKey = [...selectedCatIds].sort().join(',');
  const catMountedRef = useRef(false);
  useEffect(() => {
    if (!catMountedRef.current) { catMountedRef.current = true; return; }
    resetSession(makeDeck(selectedCatIds));
  }, [catKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const questionSignature = data.skills
    .map((s) => `${s.id}:${(s.flashcards || []).map((f) => `${f.id}:${f.q}:${f.a}:${f.userExplanation || ''}`).join('|')}`)
    .join('::');
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    resetSession(makeDeck(selectedCatIds));
  }, [questionSignature]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCat = (id) => {
    setSelectedCatIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearAllCats = () => setSelectedCatIds(new Set());

  const filterSection = (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>FILTER BY CATEGORY</Text>
      <View style={styles.filterWrap}>
        <Pressable
          onPress={clearAllCats}
          unstable_pressDelay={0}
          style={[styles.choiceChip, selectedCatIds.size === 0 && styles.choiceChipActiveNeutral]}
        >
          <Text style={[styles.choiceChipText, selectedCatIds.size === 0 && styles.choiceChipTextActive]}>All</Text>
        </Pressable>
        {data.categories.map((cat) => {
          const on = selectedCatIds.has(cat.id);
          return (
            <Pressable
              key={cat.id}
              onPress={() => toggleCat(cat.id)}
              unstable_pressDelay={0}
              style={[
                styles.choiceChip,
                on && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
            >
              <Text style={[styles.choiceChipText, on && styles.choiceChipTextActive]}>
                {cat.emoji} {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.deckCountText}>{deck.length} cards in deck</Text>
    </View>
  );

  if (deck.length === 0) {
    return (
      <View>
        <Text style={styles.screenTitle}>⚡ Revise</Text>
        {filterSection}
        <View style={styles.panel}>
          <Text style={styles.emptyText}>
            {selectedCatIds.size > 0
              ? 'No flashcards in the selected categories. Try selecting different ones.'
              : 'No flashcards yet! Add Q&A pairs to your skills first.'}
          </Text>
        </View>
      </View>
    );
  }

  if (done) {
    const totalXP = score.good * 10 + score.ok * 5 + score.hard * 2;
    return (
      <View>
        <Text style={styles.screenTitle}>🎉 Session complete!</Text>
        {filterSection}
        <View style={[styles.hero, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.heroEmoji}>🏆</Text>
          <Text style={styles.heroTitle}>+{totalXP} XP</Text>
          <Text style={styles.heroSub}>{deck.length} cards reviewed</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>BREAKDOWN</Text>
          <Text style={styles.panelBody}>
            😎 Easy: {score.good}    🤔 Good: {score.ok}    😅 Hard: {score.hard}
          </Text>
        </View>
        <PressBtn onPress={restart}>
          🔀 Shuffle & go again
        </PressBtn>
      </View>
    );
  }

  const card = deck[idx];
  const cat = data.categories.find((c) => c.id === card.categoryId);
  const progress = (idx / deck.length) * 100;

  const rate = (key, xp) => {
    bumpXP(xp);
    setScore((s) => ({ ...s, [key]: s[key] + 1 }));
    if (idx + 1 >= deck.length) setDone(true);
    else { setIdx(idx + 1); setRevealed(false); }
  };

  const saveExplanation = (explanation) => {
    // Find and update the flashcard with the explanation
    const skill = data.skills.find(s => s.id === card.skillId);
    if (skill) {
      const flashcard = (skill.flashcards || []).find(f => f.id === card.id);
      if (flashcard) {
        flashcard.userExplanation = explanation;
        // Update the card in the deck
        const deckCard = deck.find(c => c.id === card.id && c.skillId === card.skillId);
        if (deckCard) {
          deckCard.userExplanation = explanation;
        }
        setEditingExplanation(null);
      }
    }
  };

  return (
    <View>
      <Text style={styles.screenTitle}>⚡ Revise</Text>
      {filterSection}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.screenSub}>
        Card {idx + 1} of {deck.length} · {cat?.emoji} {card.trail?.join(' / ') || card.skillName}
      </Text>

      <View style={styles.reviseCard}>
        <Text style={styles.reviseQ}>❓ {card.q}</Text>
        {revealed && (
          <View style={styles.reviseAnswer}>
            <Text style={styles.reviseHint}>💡 Answer</Text>
            <RichAnswerText value={card.a} textStyle={styles.reviseAText} />
          </View>
        )}

        {revealed && card.userExplanation && (
          <View style={styles.reviseExplanation}>
            <Text style={styles.reviseHint}>💭 My explanation</Text>
            <RichAnswerText value={card.userExplanation} textStyle={styles.reviseAText} />
          </View>
        )}

        {!revealed ? (
          <PressBtn color={COLORS.blue} onPress={() => setRevealed(true)} style={{ marginTop: 16 }}>
            Reveal answer
          </PressBtn>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <View style={{ flex: 1 }}><PressBtn small color={COLORS.red} onPress={() => rate('hard', 2)}>😅 Hard</PressBtn></View>
              <View style={{ flex: 1 }}><PressBtn small color={COLORS.orange} onPress={() => rate('ok', 5)}>🤔 Good</PressBtn></View>
              <View style={{ flex: 1 }}><PressBtn small color={COLORS.primary} onPress={() => rate('good', 10)}>😎 Easy</PressBtn></View>
            </View>
            <View style={{ marginTop: 12 }}>
              <PressBtn small color={COLORS.teal} onPress={() => setEditingExplanation(card)} ghost>
                ✏️ {card.userExplanation ? 'Edit' : 'Add'} my explanation
              </PressBtn>
            </View>
          </View>
        )}
      </View>

      <Modal visible={!!editingExplanation} animationType="slide" transparent>
        {editingExplanation && (
          <ExplanationEditModal
            explanation={editingExplanation.userExplanation || ''}
            question={editingExplanation.q}
            onSave={saveExplanation}
            onClose={() => setEditingExplanation(null)}
          />
        )}
      </Modal>
    </View>
  );
}

// ============================================================
// SEARCH
// ============================================================
function SearchModal({ data, q, setQ, onClose, onPick }) {
  const query = q.trim().toLowerCase();
  const skills = query ? data.skills.filter((s) =>
    s.name.toLowerCase().includes(query) ||
    (s.notes || '').toLowerCase().includes(query) ||
    (s.structured.definition || '').toLowerCase().includes(query)
  ).slice(0, 15) : [];
  const projects = query ? data.projects.filter((p) =>
    p.name.toLowerCase().includes(query) ||
    (p.description || '').toLowerCase().includes(query)
  ).slice(0, 10) : [];
  const experiences = query ? data.experiences.filter((e) =>
    e.company.toLowerCase().includes(query) ||
    e.title.toLowerCase().includes(query)
  ).slice(0, 10) : [];

  return (
    <View style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>🔍 Search</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search skills, projects, experiences…"
          style={styles.input}
          autoFocus
          placeholderTextColor={COLORS.textLight}
        />
        <ScrollView style={{ maxHeight: 400, marginTop: 12 }}>
          {!query && <Text style={styles.emptyText}>Start typing to search across everything.</Text>}
          {query && skills.length === 0 && projects.length === 0 && experiences.length === 0 && (
            <Text style={styles.emptyText}>No matches.</Text>
          )}
          {skills.length > 0 && <Text style={styles.searchSection}>📚 Skills</Text>}
          {skills.map((s) => {
            const c = data.categories.find((x) => x.id === s.categoryId);
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => onPick('skill-detail', { skillId: s.id })}
                style={styles.searchResult}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>{c?.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultName}>{s.name}</Text>
                  <Text style={styles.searchResultMeta}>{c?.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {projects.length > 0 && <Text style={styles.searchSection}>🚀 Projects</Text>}
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => onPick('project-detail', { projectId: p.id })}
              style={styles.searchResult}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>🚀</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.searchResultName}>{p.name}</Text>
                <Text style={styles.searchResultMeta}>{p.period}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {experiences.length > 0 && <Text style={styles.searchSection}>💼 Experience</Text>}
          {experiences.map((e) => (
            <TouchableOpacity
              key={e.id}
              onPress={() => onPick('experience')}
              style={styles.searchResult}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>💼</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.searchResultName}>{e.company}</Text>
                <Text style={styles.searchResultMeta}>{e.title} · {e.period}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================
// EDIT MODALS
// ============================================================
function EditModal({ data, editing, update, onClose }) {
  const { type, item } = editing;
  if (type === 'skill') return <SkillEditModal data={data} skill={item} update={update} onClose={onClose} />;
  if (type === 'project') return <ProjectEditModal data={data} project={item} update={update} onClose={onClose} />;
  if (type === 'experience') return <ExperienceEditModal experience={item} update={update} onClose={onClose} />;
  if (type === 'category') return <CategoryEditModal category={item} update={update} onClose={onClose} />;
  if (type === 'question') return <QuestionEditModal data={data} question={item} update={update} onClose={onClose} />;
  return null;
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SkillEditModal({ data, skill, update, onClose }) {
  const isNew = !skill.id;
  const [showDepth, setShowDepth] = useState(!isNew);
  const [form, setForm] = useState({
    id: skill.id || uid(),
    name: skill.name || '',
    categoryId: skill.categoryId || data.categories[0].id,
    parentId: skill.parentId || null,
    notes: skill.notes || '',
    structured: {
      definition: skill.structured?.definition || '',
      codeExample: skill.structured?.codeExample || '',
      whenUsed: skill.structured?.whenUsed || '',
      gotchas: skill.structured?.gotchas || '',
    },
    flashcards: skill.flashcards || [],
    apis: skill.apis || [],
    refs: skill.refs || [],
    relatedProjectIds: skill.relatedProjectIds || [],
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setStructured = (k, v) => setForm((f) => ({ ...f, structured: { ...f.structured, [k]: v } }));

  const addFlashcard = () =>
    setForm((f) => ({ ...f, flashcards: [...f.flashcards, { id: uid(), q: '', a: '' }] }));
  const updateFlashcard = (id, k, v) =>
    setForm((f) => ({ ...f, flashcards: f.flashcards.map((fc) => (fc.id === id ? { ...fc, [k]: v } : fc)) }));
  const removeFlashcard = (id) =>
    setForm((f) => ({ ...f, flashcards: f.flashcards.filter((fc) => fc.id !== id) }));

  const addApi = () =>
    setForm((f) => ({
      ...f,
      apis: [...f.apis, { id: uid(), name: '', signature: '', description: '', params: '', returns: '', example: '', gotchas: '' }],
    }));
  const updateApi = (id, k, v) =>
    setForm((f) => ({ ...f, apis: f.apis.map((a) => (a.id === id ? { ...a, [k]: v } : a)) }));
  const removeApi = (id) =>
    setForm((f) => ({ ...f, apis: f.apis.filter((a) => a.id !== id) }));

  const addRef = () =>
    setForm((f) => ({ ...f, refs: [...f.refs, { id: uid(), title: '', url: '', startTime: '' }] }));
  const updateRef = (id, k, v) =>
    setForm((f) => ({ ...f, refs: f.refs.map((r) => (r.id === id ? { ...r, [k]: v } : r)) }));
  const removeRef = (id) =>
    setForm((f) => ({ ...f, refs: f.refs.filter((r) => r.id !== id) }));

  const toggleProject = (pid) =>
    setForm((f) => ({
      ...f,
      relatedProjectIds: f.relatedProjectIds.includes(pid)
        ? f.relatedProjectIds.filter((x) => x !== pid)
        : [...f.relatedProjectIds, pid],
    }));

  const save = () => {
    if (!form.name.trim()) {
      Alert.alert('Missing name', 'Skill needs a name.');
      return;
    }
    const cleaned = {
      ...form,
      flashcards: form.flashcards.filter((fc) => fc.q.trim()),
      apis: form.apis.filter((a) => a.name.trim()),
      refs: form.refs.filter((r) => r.url.trim()),
    };
    if (isNew) cleaned.isUserAdded = true;
    update((d) => {
      if (isNew) d.skills.push(cleaned);
      else {
        const i = d.skills.findIndex((s) => s.id === form.id);
        if (i >= 0) d.skills[i] = cleaned;
      }
    });
    onClose();
  };

  const del = () => {
    Alert.alert('Delete?', 'This skill and any sub-topics references stay (sub-topics become orphans). Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          update((d) => {
            d.skills = d.skills.filter((s) => s.id !== form.id);
            // Orphan children to top-level
            d.skills.forEach((s) => { if (s.parentId === form.id) s.parentId = null; });
          });
          onClose();
        },
      },
    ]);
  };

  // Candidate parents: any skill in same category, not self, not descendant
  const parentCandidates = data.skills.filter(
    (s) => s.categoryId === form.categoryId && s.id !== form.id
  );
  const parentName = form.parentId
    ? data.skills.find((s) => s.id === form.parentId)?.name
    : 'None (top-level skill)';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? '✨ New skill' : '✏️ Edit skill'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 500 }} keyboardShouldPersistTaps="handled">
          <Field label="NAME *">
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="e.g. useState"
              placeholderTextColor={COLORS.textLight}
            />
          </Field>

          <Field label="CATEGORY">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setField('categoryId', c.id)}
                  style={[
                    styles.choiceChip,
                    form.categoryId === c.id && { backgroundColor: c.color, borderColor: c.color },
                  ]}
                >
                  <Text style={[
                    styles.choiceChipText,
                    form.categoryId === c.id && { color: 'white' },
                  ]}>{c.emoji} {c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>

          <Field label="PARENT SKILL (optional — leave for top-level)">
            <View>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 6 }}>
                Currently: <Text style={{ fontWeight: '800', color: COLORS.text }}>{parentName}</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => setField('parentId', null)}
                  style={[
                    styles.choiceChip,
                    !form.parentId && { backgroundColor: COLORS.text, borderColor: COLORS.text },
                  ]}
                >
                  <Text style={[
                    styles.choiceChipText,
                    !form.parentId && { color: 'white' },
                  ]}>🌳 Top-level</Text>
                </TouchableOpacity>
                {parentCandidates.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setField('parentId', s.id)}
                    style={[
                      styles.choiceChip,
                      form.parentId === s.id && { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
                    ]}
                  >
                    <Text style={[
                      styles.choiceChipText,
                      form.parentId === s.id && { color: 'white' },
                    ]}>↳ {s.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Field>

          <TouchableOpacity onPress={() => setShowDepth(!showDepth)} style={styles.toggleBtn}>
            <Text style={{ fontWeight: '800', color: COLORS.blue }}>
              {showDepth ? '▼' : '▶'} {showDepth ? 'Hide depth fields' : 'Add depth (notes, code, gotchas, cards)'}
            </Text>
          </TouchableOpacity>

          {showDepth && (
            <>
              <Field label="📝 FREE-FORM NOTES">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.notes}
                  onChangeText={(v) => setField('notes', v)}
                  placeholder="Your personal thoughts, observations…"
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="📖 DEFINITION">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.structured.definition}
                  onChangeText={(v) => setStructured('definition', v)}
                  placeholder="Concise, accurate definition."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="💻 CODE EXAMPLE">
                <TextInput
                  style={[styles.input, styles.textarea, { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 13 }]}
                  multiline
                  value={form.structured.codeExample}
                  onChangeText={(v) => setStructured('codeExample', v)}
                  placeholder="Representative snippet."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="🎯 WHEN YOU USED IT">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.structured.whenUsed}
                  onChangeText={(v) => setStructured('whenUsed', v)}
                  placeholder="Project, what you did, outcome."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="⚠️ GOTCHAS">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.structured.gotchas}
                  onChangeText={(v) => setStructured('gotchas', v)}
                  placeholder="Pitfalls, surprises."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>

              <Field label="🎴 FLASHCARDS">
                {form.flashcards.map((fc) => (
                  <View key={fc.id} style={styles.flashEdit}>
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={fc.q}
                      onChangeText={(v) => updateFlashcard(fc.id, 'q', v)}
                      placeholder="Question"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea]}
                      multiline
                      value={fc.a}
                      onChangeText={(v) => updateFlashcard(fc.id, 'a', v)}
                      placeholder="Answer"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <PressBtn small ghost style={{ marginTop: 6 }} onPress={() => removeFlashcard(fc.id)}>
                      Remove
                    </PressBtn>
                  </View>
                ))}
                <PressBtn small ghost onPress={addFlashcard}>+ Add flashcard</PressBtn>
              </Field>

              <Field label="🔧 APIs">
                {form.apis.map((api) => (
                  <View key={api.id} style={styles.flashEdit}>
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={api.name}
                      onChangeText={(v) => updateApi(api.id, 'name', v)}
                      placeholder="Name (e.g. useState)"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, { marginBottom: 6, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12 }]}
                      value={api.signature}
                      onChangeText={(v) => updateApi(api.id, 'signature', v)}
                      placeholder="Signature"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6 }]}
                      multiline
                      value={api.description}
                      onChangeText={(v) => updateApi(api.id, 'description', v)}
                      placeholder="Description"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6 }]}
                      multiline
                      value={api.params}
                      onChangeText={(v) => updateApi(api.id, 'params', v)}
                      placeholder="Parameters"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={api.returns}
                      onChangeText={(v) => updateApi(api.id, 'returns', v)}
                      placeholder="Returns"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6, minHeight: 120, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12 }]}
                      multiline
                      value={api.example}
                      onChangeText={(v) => updateApi(api.id, 'example', v)}
                      placeholder="Example (code)"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6 }]}
                      multiline
                      value={api.gotchas}
                      onChangeText={(v) => updateApi(api.id, 'gotchas', v)}
                      placeholder="Gotchas"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <PressBtn small ghost style={{ marginTop: 6 }} onPress={() => removeApi(api.id)}>
                      Remove
                    </PressBtn>
                  </View>
                ))}
                <PressBtn small ghost onPress={addApi}>+ Add API</PressBtn>
              </Field>

              <Field label="🔗 REFERENCE LINKS & YOUTUBE VIDEOS">
                <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 8, fontWeight: '600' }}>
                  Paste any URL or YouTube link. YouTube videos get a thumbnail player.
                </Text>
                {form.refs.map((r) => (
                  <View key={r.id} style={styles.flashEdit}>
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={r.title}
                      onChangeText={(v) => updateRef(r.id, 'title', v)}
                      placeholder="Title (e.g. Official Docs, Tutorial)"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={r.url}
                      onChangeText={(v) => {
                        updateRef(r.id, 'url', v);
                        // Auto-fill start time from ?t= in pasted URL
                        const auto = extractTFromUrl(v);
                        if (auto && !parseStartTime(r.startTime)) {
                          updateRef(r.id, 'startTime', auto);
                        }
                      }}
                      placeholder="https://... or https://youtube.com/watch?v=..."
                      placeholderTextColor={COLORS.textLight}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    {isYouTubeUrl(r.url) && (
                      <View style={{ marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ fontSize: 11, color: '#FF0000', fontWeight: '800' }}>
                            ▶ YouTube detected
                          </Text>
                          {extractTFromUrl(r.url) && !parseStartTime(r.startTime) === false && (
                            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '800', marginLeft: 8 }}>
                              · auto-filled from URL
                            </Text>
                          )}
                        </View>
                        <Text style={styles.fieldLabel}>START TIME (optional)</Text>
                        <TimeStepperInput
                          value={r.startTime || '0'}
                          onChange={(v) => updateRef(r.id, 'startTime', v)}
                        />
                        {Boolean(parseStartTime(r.startTime)) && (
                          <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '800', marginTop: 8 }}>
                            ⏱ Will start at {fmtTime(r.startTime)}
                          </Text>
                        )}
                      </View>
                    )}
                    <PressBtn small ghost style={{ marginTop: 4 }} onPress={() => removeRef(r.id)}>
                      Remove
                    </PressBtn>
                  </View>
                ))}
                <PressBtn small ghost onPress={addRef}>+ Add link / video</PressBtn>
              </Field>

              <Field label="🚀 LINKED PROJECTS">
                {data.projects.map((p) => {
                  const on = form.relatedProjectIds.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => toggleProject(p.id)}
                      style={styles.checkboxRow}
                    >
                      <View style={[styles.checkbox, on && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                        {on && <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>✓</Text>}
                      </View>
                      <Text style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </Field>
            </>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.border }}>
          <PressBtn onPress={save}>💾 Save</PressBtn>
          {!isNew && <PressBtn color={COLORS.red} onPress={del}>🗑 Delete</PressBtn>}
          <PressBtn ghost onPress={onClose}>Cancel</PressBtn>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProjectEditModal({ data, project, update, onClose }) {
  const isNew = !project.id;
  const [form, setForm] = useState({
    id: project.id || uid(),
    name: project.name || '',
    role: project.role || '',
    period: project.period || '',
    teamSize: String(project.teamSize || 1),
    stack: (project.stack || []).join(', '),
    description: project.description || '',
    outcomes: (project.outcomes || []).join('\n'),
  });
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { Alert.alert('Missing', 'Name required.'); return; }
    const cleaned = {
      ...form,
      stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean),
      outcomes: form.outcomes.split('\n').map((s) => s.trim()).filter(Boolean),
      teamSize: parseInt(form.teamSize, 10) || 1,
    };
    update((d) => {
      if (isNew) d.projects.push(cleaned);
      else {
        const i = d.projects.findIndex((p) => p.id === form.id);
        if (i >= 0) d.projects[i] = cleaned;
      }
    });
    onClose();
  };
  const del = () => {
    Alert.alert('Delete?', 'Remove this project?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        update((d) => { d.projects = d.projects.filter((p) => p.id !== form.id); });
        onClose();
      } },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? '✨ New project' : '✏️ Edit project'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 500 }}>
          <Field label="NAME *"><TextInput style={styles.input} value={form.name} onChangeText={(v) => setField('name', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="ROLE"><TextInput style={styles.input} value={form.role} onChangeText={(v) => setField('role', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="PERIOD"><TextInput style={styles.input} value={form.period} onChangeText={(v) => setField('period', v)} placeholder="2024 – 2025" placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="TEAM SIZE"><TextInput style={styles.input} keyboardType="numeric" value={form.teamSize} onChangeText={(v) => setField('teamSize', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="DESCRIPTION"><TextInput style={[styles.input, styles.textarea]} multiline value={form.description} onChangeText={(v) => setField('description', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="TECH STACK (comma-separated)"><TextInput style={[styles.input, styles.textarea]} multiline value={form.stack} onChangeText={(v) => setField('stack', v)} placeholder="React, Node, Mongo" placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="OUTCOMES (one per line)"><TextInput style={[styles.input, styles.textarea, { minHeight: 120 }]} multiline value={form.outcomes} onChangeText={(v) => setField('outcomes', v)} placeholderTextColor={COLORS.textLight} /></Field>
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.border }}>
          <PressBtn onPress={save}>💾 Save</PressBtn>
          {!isNew && <PressBtn color={COLORS.red} onPress={del}>🗑 Delete</PressBtn>}
          <PressBtn ghost onPress={onClose}>Cancel</PressBtn>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ExperienceEditModal({ experience, update, onClose }) {
  const isNew = !experience.id;
  const [form, setForm] = useState({
    id: experience.id || uid(),
    company: experience.company || '',
    title: experience.title || '',
    location: experience.location || '',
    period: experience.period || '',
    responsibilities: (experience.responsibilities || []).join('\n'),
  });
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.company.trim()) { Alert.alert('Missing', 'Company required.'); return; }
    const cleaned = {
      ...form,
      responsibilities: form.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    update((d) => {
      if (isNew) d.experiences.unshift(cleaned);
      else {
        const i = d.experiences.findIndex((e) => e.id === form.id);
        if (i >= 0) d.experiences[i] = cleaned;
      }
    });
    onClose();
  };
  const del = () => {
    Alert.alert('Delete?', 'Remove this role?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        update((d) => { d.experiences = d.experiences.filter((e) => e.id !== form.id); });
        onClose();
      } },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? '✨ New role' : '✏️ Edit role'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 500 }}>
          <Field label="COMPANY *"><TextInput style={styles.input} value={form.company} onChangeText={(v) => setField('company', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="TITLE"><TextInput style={styles.input} value={form.title} onChangeText={(v) => setField('title', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="LOCATION"><TextInput style={styles.input} value={form.location} onChangeText={(v) => setField('location', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="PERIOD"><TextInput style={styles.input} value={form.period} onChangeText={(v) => setField('period', v)} placeholder="Jun 2025 – Present" placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="RESPONSIBILITIES (one per line)"><TextInput style={[styles.input, styles.textarea, { minHeight: 160 }]} multiline value={form.responsibilities} onChangeText={(v) => setField('responsibilities', v)} placeholderTextColor={COLORS.textLight} /></Field>
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.border }}>
          <PressBtn onPress={save}>💾 Save</PressBtn>
          {!isNew && <PressBtn color={COLORS.red} onPress={del}>🗑 Delete</PressBtn>}
          <PressBtn ghost onPress={onClose}>Cancel</PressBtn>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function CategoryEditModal({ category, update, onClose }) {
  const isNew = !category.id;
  const PALETTE = [
    '#58CC02', '#1CB0F6', '#FF9600', '#FF4B4B', '#FFC800',
    '#CE82FF', '#FF86D0', '#2EC4B6', '#235390', '#84D8FF',
    '#A56AFF', '#02CD7C', '#F75590', '#FF6D00', '#4A8BF5',
    '#C026D3', '#9333EA', '#E11D48', '#6B7280', '#F59E0B',
    '#FF6B35', '#3B82F6',
  ];
  const [form, setForm] = useState({
    id: category.id || uid(),
    name: category.name || '',
    emoji: category.emoji || '📁',
    color: category.color || PALETTE[0],
  });
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { Alert.alert('Missing', 'Category name required.'); return; }
    const toSave = isNew ? { ...form, isUserAdded: true } : form;
    update((d) => {
      if (isNew) d.categories.push(toSave);
      else {
        const i = d.categories.findIndex((c) => c.id === form.id);
        if (i >= 0) d.categories[i] = toSave;
      }
    });
    onClose();
  };

  const del = () => {
    Alert.alert('Delete category?', 'This will not delete skills inside it — they will remain unlinked.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        update((d) => { d.categories = d.categories.filter((c) => c.id !== form.id); });
        onClose();
      }},
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? '✨ New category' : '✏️ Edit category'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 520 }}>
          <Field label="NAME *">
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="e.g. TypeScript"
              placeholderTextColor={COLORS.textLight}
            />
          </Field>
          <Field label="EMOJI">
            <TextInput
              style={[styles.input, { fontSize: 24 }]}
              value={form.emoji}
              onChangeText={(v) => setField('emoji', v)}
              placeholder="📁"
              placeholderTextColor={COLORS.textLight}
            />
          </Field>
          <Field label="COLOR">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {PALETTE.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setField('color', c)}
                  style={[
                    { width: 38, height: 38, borderRadius: 10, backgroundColor: c, alignItems: 'center', justifyContent: 'center' },
                    form.color === c && { borderWidth: 3, borderColor: COLORS.text },
                  ]}
                >
                  {form.color === c && (
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </Field>
          <Field label="PREVIEW">
            <View style={[styles.catCard, { width: '60%', alignSelf: 'center' }]}>
              <Text style={styles.catEmoji}>{form.emoji || '📁'}</Text>
              <Text style={styles.catName}>{form.name || 'Category name'}</Text>
              <View style={[styles.catCount, { backgroundColor: form.color }]}>
                <Text style={styles.catCountText}>0</Text>
              </View>
            </View>
          </Field>
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.border }}>
          <PressBtn onPress={save}>💾 Save</PressBtn>
          {!isNew && <PressBtn color={COLORS.red} onPress={del}>🗑 Delete</PressBtn>}
          <PressBtn ghost onPress={onClose}>Cancel</PressBtn>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Crumb({ onPress, label }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginBottom: 10 }}>
      <Text style={{ color: COLORS.textLight, fontSize: 13, fontWeight: '700' }}>← {label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  loadingText: { fontSize: 24, color: COLORS.primary, fontWeight: '800' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  logo: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  pill: {
    borderWidth: 2, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  pillText: { fontWeight: '800', fontSize: 13 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F7F7F7', borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: 6,
  },

  // Screen titles
  screenTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  screenSub: { color: COLORS.textLight, fontSize: 14, marginBottom: 16, fontWeight: '600' },

  // Category grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: {
    width: '48%', backgroundColor: 'white',
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 18, padding: 14,
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 0, elevation: 2,
  },
  catEmoji: { fontSize: 40, marginBottom: 6 },
  catName: { fontWeight: '800', fontSize: 14, color: COLORS.text, textAlign: 'center' },
  catCount: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, marginTop: 6,
  },
  catCountText: { color: 'white', fontWeight: '800', fontSize: 11 },

  // Skill row
  skillRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 0, elevation: 2,
  },
  skillBubble: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  skillBubbleText: { color: 'white', fontWeight: '800', fontSize: 18 },
  skillRowName: { fontWeight: '800', fontSize: 15, color: COLORS.text },
  skillRowMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 2, fontWeight: '600' },
  chevron: { color: '#BBB', fontSize: 24, marginLeft: 8 },

  // Hero
  hero: {
    borderRadius: 20, padding: 22, marginBottom: 14,
    overflow: 'hidden', position: 'relative',
  },
  heroEmoji: { position: 'absolute', right: -10, top: -10, fontSize: 90, opacity: 0.3 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: 'white' },
  heroSub: { fontSize: 13, color: 'white', opacity: 0.9, marginTop: 4, fontWeight: '700' },

  // Tabs
  tabs: { marginBottom: 12, borderBottomWidth: 2, borderBottomColor: COLORS.border },
  tab: { paddingHorizontal: 12, paddingVertical: 10, position: 'relative' },
  tabText: { color: COLORS.textLight, fontWeight: '800', fontSize: 13 },
  tabTextActive: { color: COLORS.primary },
  tabUnderline: {
    position: 'absolute', bottom: -2, left: 0, right: 0,
    height: 3, backgroundColor: COLORS.primary,
  },

  // Panel
  panel: {
    backgroundColor: COLORS.panel,
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  panelTitle: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '800',
    letterSpacing: 0.5, marginBottom: 8,
  },
  panelBody: { fontSize: 15, lineHeight: 22, color: COLORS.text, fontWeight: '600' },
  emptyText: { color: '#BBB', fontStyle: 'italic', fontSize: 14, fontWeight: '600' },

  // Code block
  codeBlock: { backgroundColor: '#2D2D2D', borderRadius: 12, padding: 12 },
  codeText: { color: '#F8F8F2', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12, lineHeight: 18 },

  // Tree
  treeNode: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderLeftWidth: 4,
    paddingVertical: 10, paddingHorizontal: 12, marginVertical: 2,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  treeNodeName: { flex: 1, fontWeight: '800', color: COLORS.text, fontSize: 14 },
  treeChildBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, marginLeft: 6,
  },
  expandBtn: { width: 22, alignItems: 'center', justifyContent: 'center' },

  // Flashcard
  flashcard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  flashQ: { fontWeight: '800', color: COLORS.text, fontSize: 15, marginBottom: 6 },
  flashA: { color: COLORS.text, fontSize: 14, lineHeight: 21, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, borderStyle: 'dashed', fontWeight: '600' },
  flashHint: { color: '#BBB', fontSize: 12, fontStyle: 'italic', fontWeight: '600' },
  // Projects
  projectCard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  projectName: { fontWeight: '800', fontSize: 17, color: COLORS.text, marginBottom: 2 },
  projectMeta: { fontSize: 12, color: COLORS.textLight, marginBottom: 8, fontWeight: '600' },
  projectDesc: { fontSize: 14, color: COLORS.text, lineHeight: 21, fontWeight: '600' },

  // Experience
  expCard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  expCompany: { fontWeight: '800', fontSize: 17, color: COLORS.text },
  expTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginTop: 2 },
  expMeta: { fontSize: 12, color: COLORS.textLight, marginVertical: 6, fontWeight: '600' },
  bulletRow: { flexDirection: 'row', marginVertical: 4 },

  // Revise
  reviseCard: {
    backgroundColor: 'white', borderWidth: 3, borderColor: COLORS.blue,
    borderRadius: 24, padding: 22, marginBottom: 16,
    shadowColor: COLORS.blue, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 0, elevation: 4,
  },
  reviseQ: { fontSize: 20, fontWeight: '800', color: COLORS.text, lineHeight: 28 },
  reviseAnswer: {
    backgroundColor: '#F0FAFF', borderWidth: 2, borderColor: '#84D8FF',
    borderStyle: 'dashed', borderRadius: 14, padding: 14, marginTop: 14,
  },
  reviseHint: {
    color: COLORS.blueDark,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  reviseAText: { fontSize: 14, color: COLORS.text, lineHeight: 21, fontWeight: '600' },
  reviseExplanation: {
    backgroundColor: '#F5E6FF', borderWidth: 2, borderColor: '#D4A5FF',
    borderStyle: 'dashed', borderRadius: 14, padding: 14, marginTop: 14,
  },
  progressBar: {
    height: 14, backgroundColor: COLORS.border, borderRadius: 999,
    overflow: 'hidden', marginBottom: 12,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 999 },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8, paddingHorizontal: 8,
    borderTopWidth: 2, borderTopColor: COLORS.border,
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
  },
  navItem: {
    alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6,
    borderRadius: 12, minWidth: 52,
  },
  navItemActive: { backgroundColor: '#F0FFE5' },
  navLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '800', marginTop: 2 },

  // FAB
  fabWrap: {
    position: 'absolute', bottom: 110, right: 16, zIndex: 50,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 6,
  },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },

  // Form fields
  fieldLabel: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '800',
    letterSpacing: 0.4, marginBottom: 6,
  },
  input: {
    borderWidth: 2, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    fontWeight: '700', color: COLORS.text, backgroundColor: 'white',
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  choiceChip: {
    borderWidth: 2, borderColor: COLORS.border, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6,
  },
  choiceChipText: { fontWeight: '800', fontSize: 12, color: COLORS.text },
  choiceChipActiveNeutral: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  choiceChipTextActive: { color: 'white' },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  deckCountText: { fontSize: 12, color: COLORS.textLight, fontWeight: '700', marginTop: 8 },
  toggleBtn: {
    paddingVertical: 10, marginBottom: 8,
    borderTopWidth: 2, borderTopColor: COLORS.border,
    borderBottomWidth: 2, borderBottomColor: COLORS.border,
  },
  flashEdit: {
    backgroundColor: COLORS.panel, borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 12, padding: 10, marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
  },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 6, marginRight: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // API cards
  apiCard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  apiName: { fontWeight: '800', fontSize: 16, color: COLORS.text, marginBottom: 4 },
  apiSignature: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 11, color: COLORS.textLight, lineHeight: 17, marginBottom: 4,
    flexWrap: 'wrap',
  },

  // Search
  searchSection: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '800',
    letterSpacing: 0.5, marginTop: 12, marginBottom: 4,
  },
  searchResult: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12,
  },
  searchResultName: { fontWeight: '800', fontSize: 15, color: COLORS.text },
  searchResultMeta: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },

  // Reference / link cards
  refCard: {
    flexDirection: 'row', backgroundColor: 'white',
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, marginBottom: 10, overflow: 'hidden',
  },
  ytThumb: {
    width: 110, height: 72,
    backgroundColor: '#000',
  },
  refCardBody: {
    flex: 1, padding: 10, justifyContent: 'center',
  },
  refTitle: {
    fontWeight: '800', fontSize: 14, color: COLORS.text, lineHeight: 20,
  },
  refUrl: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '600', marginTop: 3,
  },
  ytBadge: {
    backgroundColor: '#FF0000', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  ytBadgeText: { color: 'white', fontSize: 10, fontWeight: '800' },
  ytTimeBadge: {
    backgroundColor: '#1a1a1a', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  ytTimeTxt: { color: 'white', fontSize: 10, fontWeight: '800' },

  // Time stepper
  stepperRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.panel, borderRadius: 14,
    borderWidth: 2, borderColor: COLORS.border,
    paddingVertical: 10, paddingHorizontal: 14, gap: 4,
  },
  stepperUnit: { alignItems: 'center', minWidth: 44 },
  stepperBtn: {
    backgroundColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  stepperArrow: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  stepperVal: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginVertical: 4, minWidth: 34, textAlign: 'center' },
  stepperLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textLight, letterSpacing: 0.5 },
  stepperSep: { fontSize: 22, fontWeight: '800', color: COLORS.textLight, marginHorizontal: 2, marginBottom: 14 },
  stepperClear: {
    marginLeft: 'auto', backgroundColor: COLORS.red + '22',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  stepperClearTxt: { fontSize: 12, fontWeight: '800', color: COLORS.red },
  linkIconWrap: {
    width: 64, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.panel,
  },

  // YouTube player modal
  ytCloseBtn: {
    position: 'absolute', top: 44, right: 16, zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  ytCloseTxt: { color: 'white', fontWeight: '800', fontSize: 14 },
  ytHint: {
    textAlign: 'center', color: 'rgba(255,255,255,0.5)',
    fontSize: 12, fontWeight: '600',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  ytLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#111',
  },
});
