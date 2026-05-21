import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getQuestionCards } from '../../domain/questions';
import { COLORS } from '../../theme/colors';
import RichAnswerText from './RichAnswerText';

function darken(hex) {
  const c = hex.replace('#', '');
  const r = Math.floor(parseInt(c.slice(0, 2), 16) * 0.7);
  const g = Math.floor(parseInt(c.slice(2, 4), 16) * 0.7);
  const b = Math.floor(parseInt(c.slice(4, 6), 16) * 0.7);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

const Chip = memo(function Chip({ children, color = COLORS.primary }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color + '88' }]}>
      <Text style={[styles.chipText, { color: darken(color) }]}>{children}</Text>
    </View>
  );
});

const ActionButton = memo(function ActionButton({ children, color = COLORS.primary, onPress }) {
  return (
    <Pressable
      onPressIn={onPress}
      unstable_pressDelay={0}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: color, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={styles.actionBtnText}>{children}</Text>
    </Pressable>
  );
});

const QuestionRow = memo(function QuestionRow({ item, onEdit }) {
  const openQuestion = useCallback(() => onEdit(item), [item, onEdit]);
  return (
    <Pressable
      onPress={openQuestion}
      unstable_pressDelay={0}
      style={({ pressed }) => [
        styles.questionCard,
        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.tagRow}>
        <Chip color={item.categoryColor}>{item.categoryEmoji} {item.categoryName}</Chip>
        <Chip color={COLORS.blue}>{item.trail.join(' / ')}</Chip>
      </View>
      <Text style={styles.flashQ}>❓ {item.q}</Text>
      {!!item.a && (
        <View style={styles.questionAnswer}>
          <RichAnswerText value={item.a} />
        </View>
      )}
    </Pressable>
  );
});

function QuestionsScreen({ data, navigate, onAdd, onEdit }) {
  const [query, setQuery] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState(new Set());
  const allCards = useMemo(() => getQuestionCards(data), [data]);
  const q = query.trim().toLowerCase();

  const toggleCat = useCallback((id) => {
    setSelectedCatIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelectedCatIds(new Set()), []);

  const cards = useMemo(
    () => allCards.filter((card) => {
      const matchesText = !q ||
        card.q.toLowerCase().includes(q) ||
        (card.a || '').toLowerCase().includes(q) ||
        card.trail.join(' ').toLowerCase().includes(q) ||
        card.categoryName.toLowerCase().includes(q);
      const matchesCat = selectedCatIds.size === 0 || selectedCatIds.has(card.categoryId);
      return matchesText && matchesCat;
    }),
    [allCards, q, selectedCatIds]
  );

  const openRevise = useCallback(() => navigate('revise'), [navigate]);

  const renderQuestion = useCallback(
    ({ item }) => <QuestionRow item={item} onEdit={onEdit} />,
    [onEdit]
  );

  const isAllActive = selectedCatIds.size === 0;

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

        <Text style={styles.filterLabel}>FILTER BY CATEGORY</Text>
        <View style={styles.filterWrap}>
          <Pressable
            onPress={clearAll}
            unstable_pressDelay={0}
            style={[styles.choiceChip, isAllActive && styles.choiceChipActiveNeutral]}
          >
            <Text style={[styles.choiceChipText, isAllActive && styles.choiceChipTextActive]}>All</Text>
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

        <Text style={styles.filterCount}>
          {cards.length} of {allCards.length} question{allCards.length !== 1 ? 's' : ''}
        </Text>

        <View style={styles.actionRow}>
          <ActionButton onPress={onAdd}>+ Add question</ActionButton>
          <ActionButton color={COLORS.blue} onPress={openRevise}>Revise shuffled</ActionButton>
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

export default memo(QuestionsScreen);

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
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterCount: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '700',
    marginTop: 10,
  },
  choiceChip: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
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
  pressedCard: { opacity: 0.75 },
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyText: { color: '#BBB', fontStyle: 'italic', fontSize: 14, fontWeight: '600' },
});
