import React, { memo, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { buildGroundedBrief, buildRagDocuments, retrieveRagContext } from '../../domain/rag';
import { COLORS } from '../../theme/colors';

const TYPE_LABELS = {
  skill: 'Skill',
  question: 'Question',
  project: 'Project',
  experience: 'Career',
};

function SourceCard({ item, onOpen }) {
  const canOpen = item.skillId || item.projectId;

  return (
    <View style={styles.sourceCard}>
      <View style={styles.sourceHeader}>
        <View
          style={[
            styles.typePill,
            item.categoryColor && { backgroundColor: item.categoryColor + '22', borderColor: item.categoryColor + '88' },
          ]}
        >
          <Text style={[styles.typePillText, item.categoryColor && { color: item.categoryColor }]}>
            {TYPE_LABELS[item.type] || item.type}
          </Text>
        </View>
        <Text style={styles.score}>{Math.round(item.score * 10) / 10}</Text>
      </View>

      <Text style={styles.sourceTitle}>{item.title}</Text>
      {!!item.subtitle && <Text style={styles.sourceMeta}>{item.subtitle}</Text>}
      <Text style={styles.snippet}>{item.snippet || item.preview}</Text>

      {canOpen && (
        <Pressable
          onPress={() => onOpen(item)}
          style={({ pressed }) => [styles.openButton, { opacity: pressed ? 0.75 : 1 }]}
        >
          <Text style={styles.openButtonText}>Open source</Text>
        </Pressable>
      )}
    </View>
  );
}

function RagScreen({ data, navigate }) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const docCount = useMemo(() => buildRagDocuments(data).length, [data]);
  const results = useMemo(
    () => retrieveRagContext(data, submittedQuery, { topK: 7 }),
    [data, submittedQuery]
  );
  const brief = useMemo(
    () => buildGroundedBrief(submittedQuery, results),
    [submittedQuery, results]
  );

  const ask = () => setSubmittedQuery(query);
  const openSource = (item) => {
    if (item.skillId) navigate('skill-detail', { skillId: item.skillId });
    else if (item.projectId) navigate('project-detail', { projectId: item.projectId });
  };

  return (
    <View>
      <Text style={styles.screenTitle}>RAG Retrieval</Text>
      <Text style={styles.screenSub}>
        Ask across {docCount} local chunks from skills, questions, projects, and career notes.
      </Text>

      <View style={styles.panel}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ask for React performance, RAG, payments, interview prep..."
          placeholderTextColor={COLORS.textLight}
          style={styles.input}
          multiline
          textAlignVertical="top"
          returnKeyType="search"
          onSubmitEditing={ask}
        />
        <View style={styles.actionRow}>
          <Pressable
            onPress={ask}
            style={({ pressed }) => [styles.askButton, { opacity: pressed ? 0.75 : 1 }]}
          >
            <Text style={styles.askButtonText}>Retrieve</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setQuery('');
              setSubmittedQuery('');
            }}
            style={({ pressed }) => [styles.clearButton, { opacity: pressed ? 0.75 : 1 }]}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        </View>
      </View>

      {!!submittedQuery && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>GROUNDED BRIEF</Text>
          <Text style={styles.brief}>{brief}</Text>
        </View>
      )}

      {!!submittedQuery && (
        <View style={styles.resultsHeader}>
          <Text style={styles.panelTitle}>SOURCES</Text>
          <Text style={styles.resultCount}>{results.length} match{results.length !== 1 ? 'es' : ''}</Text>
        </View>
      )}

      {submittedQuery ? (
        results.length ? (
          results.map((item) => (
            <SourceCard key={item.id} item={item} onOpen={openSource} />
          ))
        ) : (
          <View style={styles.panel}>
            <Text style={styles.emptyText}>No matching local context found.</Text>
          </View>
        )
      ) : (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>WHAT THIS DOES</Text>
          <Text style={styles.brief}>
            This is the retrieval half of RAG: the app chunks local knowledge, ranks matching context,
            and shows citations. A production LLM answer should call a backend with these sources,
            keeping model API keys outside the React Native app.
          </Text>
        </View>
      )}
    </View>
  );
}

export default memo(RagScreen);

const styles = StyleSheet.create({
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
  panelTitle: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    minHeight: 88,
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
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  askButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  askButtonText: { color: 'white', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  clearButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  clearButtonText: { color: COLORS.text, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  brief: { color: COLORS.text, fontSize: 14, lineHeight: 21, fontWeight: '600' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  resultCount: { color: COLORS.textLight, fontSize: 12, fontWeight: '800' },
  sourceCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typePill: {
    borderWidth: 1,
    borderColor: COLORS.blue + '88',
    backgroundColor: COLORS.blue + '22',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typePillText: { color: COLORS.blueDark, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  score: { color: COLORS.textLight, fontSize: 11, fontWeight: '800' },
  sourceTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginTop: 10 },
  sourceMeta: { color: COLORS.textLight, fontSize: 12, fontWeight: '700', marginTop: 3 },
  snippet: { color: COLORS.text, fontSize: 13, lineHeight: 20, fontWeight: '600', marginTop: 10 },
  openButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  openButtonText: { color: 'white', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  emptyText: { color: '#BBB', fontStyle: 'italic', fontSize: 14, fontWeight: '600' },
});
