import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getQuestionCards } from '../../domain/questions';
import { COLORS } from '../../theme/colors';

function darken(hex) {
  const c = hex.replace('#', '');
  const r = Math.floor(parseInt(c.slice(0, 2), 16) * 0.7);
  const g = Math.floor(parseInt(c.slice(2, 4), 16) * 0.7);
  const b = Math.floor(parseInt(c.slice(4, 6), 16) * 0.7);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function Chip({ children, color = COLORS.primary }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color + '88' }]}>
      <Text style={[styles.chipText, { color: darken(color) }]}>{children}</Text>
    </View>
  );
}

function ActionButton({ children, color = COLORS.primary, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.actionBtn, { backgroundColor: color }]}>
      <Text style={styles.actionBtnText}>{children}</Text>
    </TouchableOpacity>
  );
}

export default function QuestionsScreen({ data, navigate, onAdd, onEdit }) {
  const [query, setQuery] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('all');
  const allCards = useMemo(() => getQuestionCards(data), [data]);
  const skillFilters = useMemo(() => [{ id: 'all', name: 'All' }, ...data.skills], [data.skills]);
  const q = query.trim().toLowerCase();
  const cards = useMemo(
    () => allCards.filter((card) => {
      const matchesText = !q ||
        card.q.toLowerCase().includes(q) ||
        (card.a || '').toLowerCase().includes(q) ||
        card.trail.join(' ').toLowerCase().includes(q) ||
        card.categoryName.toLowerCase().includes(q);
      const matchesSkill = selectedSkillId === 'all' || card.skillId === selectedSkillId;
      return matchesText && matchesSkill;
    }),
    [allCards, q, selectedSkillId]
  );

  const renderQuestion = ({ item }) => (
    <Pressable
      onPress={() => onEdit(item)}
      style={styles.questionCard}
    >
      <View style={styles.tagRow}>
        <Chip color={item.categoryColor}>{item.categoryEmoji} {item.categoryName}</Chip>
        <Chip color={COLORS.blue}>{item.trail.join(' / ')}</Chip>
      </View>
      <Text style={styles.flashQ}>❓ {item.q}</Text>
      {!!item.a && <Text style={styles.questionAnswer}>{item.a}</Text>}
    </Pressable>
  );

  const renderSkillFilter = ({ item }) => {
    if (item.id === 'all') {
      const on = selectedSkillId === 'all';
      return (
        <TouchableOpacity
          onPress={() => setSelectedSkillId('all')}
          style={[
            styles.choiceChip,
            on && styles.choiceChipActiveNeutral,
          ]}
        >
          <Text style={[
            styles.choiceChipText,
            on && styles.choiceChipTextActive,
          ]}>All</Text>
        </TouchableOpacity>
      );
    }
    const cat = data.categories.find((c) => c.id === item.categoryId);
    const on = selectedSkillId === item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedSkillId(item.id)}
        style={[
          styles.choiceChip,
          on && { backgroundColor: cat?.color || COLORS.blue, borderColor: cat?.color || COLORS.blue },
        ]}
      >
        <Text style={[
          styles.choiceChipText,
          on && styles.choiceChipTextActive,
        ]}>{cat?.emoji || '📁'} {item.name}</Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View>
      <Text style={styles.screenTitle}>❓ Questions</Text>
      <Text style={styles.screenSub}>
        {allCards.length} question{allCards.length !== 1 ? 's' : ''} linked to skills, topics, and sub-topics.
      </Text>

      <View style={styles.panel}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search questions, answers, skills..."
          placeholderTextColor={COLORS.textLight}
          style={styles.input}
        />
        <FlatList
          horizontal
          data={skillFilters}
          keyExtractor={(item) => item.id}
          renderItem={renderSkillFilter}
          showsHorizontalScrollIndicator={false}
          style={styles.skillFilter}
          keyboardShouldPersistTaps="handled"
        />
        <View style={styles.actionRow}>
          <ActionButton onPress={onAdd}>+ Add question</ActionButton>
          <ActionButton color={COLORS.blue} onPress={() => navigate('revise')}>Revise shuffled</ActionButton>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      data={cards}
      keyExtractor={(item) => `${item.skillId}-${item.id}`}
      renderItem={renderQuestion}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={ListHeader}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
      ListEmptyComponent={
        <View style={styles.panel}>
          <Text style={styles.emptyText}>
            No questions found. Tap + to add one and tag it to a skill or sub-topic.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 120 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  screenSub: { color: COLORS.textLight, fontSize: 14, marginBottom: 16, fontWeight: '600' },
  panel: {
    backgroundColor: COLORS.panel,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: 'white',
  },
  skillFilter: { marginTop: 12 },
  choiceChip: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  choiceChipText: { fontWeight: '800', fontSize: 12, color: COLORS.text },
  choiceChipActiveNeutral: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  choiceChipTextActive: { color: 'white' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  actionBtn: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
  actionBtnText: { color: 'white', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  questionCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { fontWeight: '800', fontSize: 12 },
  flashQ: { fontWeight: '800', color: COLORS.text, fontSize: 15, marginBottom: 6 },
  questionAnswer: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderStyle: 'dashed',
    fontWeight: '600',
  },
  emptyText: { color: '#BBB', fontStyle: 'italic', fontSize: 14, fontWeight: '600' },
});
