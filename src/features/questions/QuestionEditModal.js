import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { uid } from '../../../seed/helpers';
import { getSkillTrail } from '../../domain/questions';
import { COLORS } from '../../theme/colors';

function Button({ children, color = COLORS.primary, ghost, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, ghost ? styles.buttonGhost : { backgroundColor: color }]}
    >
      <Text style={[styles.buttonText, ghost && { color: COLORS.text }]}>{children}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({ children, color = COLORS.primary }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color + '88' }]}>
      <Text style={[styles.chipText, { color }]}>{children}</Text>
    </View>
  );
}

const SkillPickerRow = memo(function SkillPickerRow({ skill, category, active, trail, onSelect }) {
  const select = useCallback(() => onSelect(skill.id), [onSelect, skill.id]);
  return (
    <Pressable
      onPress={select}
      unstable_pressDelay={0}
      style={[
        styles.skillPickerRow,
        active && {
          borderColor: category?.color || COLORS.blue,
          backgroundColor: (category?.color || COLORS.blue) + '14',
        },
      ]}
    >
      <Text style={styles.skillEmoji}>{category?.emoji || '📁'}</Text>
      <View style={styles.skillTextWrap}>
        <Text style={styles.skillName}>{skill.name}</Text>
        <Text style={styles.skillMeta}>{trail}</Text>
      </View>
      {active && <Text style={[styles.check, { color: category?.color || COLORS.blue }]}>✓</Text>}
    </Pressable>
  );
});

export default function QuestionEditModal({ data, question, update, onClose }) {
  const isNew = !question.id;
  const [form, setForm] = useState({
    id: question.id || uid(),
    skillId: question.skillId || data.skills[0]?.id || '',
    q: question.q || '',
    a: question.a || '',
  });
  const setField = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);
  const selectedSkill = data.skills.find((s) => s.id === form.skillId);
  const selectedCat = selectedSkill
    ? data.categories.find((c) => c.id === selectedSkill.categoryId)
    : null;
  const categoryById = useMemo(
    () => new Map(data.categories.map((category) => [category.id, category])),
    [data.categories]
  );
  const selectSkill = useCallback((skillId) => setField('skillId', skillId), [setField]);
  const renderSkill = useCallback(
    ({ item }) => (
      <SkillPickerRow
        skill={item}
        category={categoryById.get(item.categoryId)}
        trail={getSkillTrail(data.skills, item.id).join(' / ')}
        active={form.skillId === item.id}
        onSelect={selectSkill}
      />
    ),
    [categoryById, data.skills, form.skillId, selectSkill]
  );
  const listHeader = (
    <View>
      <Field label="QUESTION *">
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          value={form.q}
          onChangeText={(v) => setField('q', v)}
          placeholder="What do you want to revise?"
          placeholderTextColor={COLORS.textLight}
        />
      </Field>
      <Field label="ANSWER">
        <TextInput
          style={[styles.input, styles.textarea, styles.answerInput]}
          multiline
          value={form.a}
          onChangeText={(v) => setField('a', v)}
          placeholder="Add the answer you want to reveal later."
          placeholderTextColor={COLORS.textLight}
        />
      </Field>
      <Field label="LINKED SKILL / TOPIC / SUB-TOPIC">
        {selectedSkill && (
          <View style={styles.tagRow}>
            <Chip color={selectedCat?.color || COLORS.blue}>
              {selectedCat?.emoji || '📁'} {selectedCat?.name || 'Category'}
            </Chip>
            <Chip color={COLORS.blue}>
              {getSkillTrail(data.skills, selectedSkill.id).join(' / ')}
            </Chip>
          </View>
        )}
      </Field>
    </View>
  );
  const save = () => {
    if (!form.skillId) {
      Alert.alert('Missing skill', 'Add a skill first, then link this question to it.');
      return;
    }
    if (!form.q.trim()) {
      Alert.alert('Missing question', 'Question text is required.');
      return;
    }
    update((d) => {
      if (!isNew && question.skillId && question.skillId !== form.skillId) {
        const oldSkill = d.skills.find((s) => s.id === question.skillId);
        if (oldSkill) oldSkill.flashcards = (oldSkill.flashcards || []).filter((fc) => fc.id !== form.id);
      }
      const skill = d.skills.find((s) => s.id === form.skillId);
      if (!skill) return;
      if (!Array.isArray(skill.flashcards)) skill.flashcards = [];
      const cleaned = { id: form.id, q: form.q.trim(), a: form.a.trim() };
      const i = skill.flashcards.findIndex((fc) => fc.id === form.id);
      if (i >= 0) skill.flashcards[i] = cleaned;
      else skill.flashcards.push(cleaned);
    });
    onClose();
  };

  const del = () => {
    Alert.alert('Delete question?', 'This removes it from revision too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          update((d) => {
            const skill = d.skills.find((s) => s.id === form.skillId || s.id === question.skillId);
            if (skill) skill.flashcards = (skill.flashcards || []).filter((fc) => fc.id !== form.id);
          });
          onClose();
        },
      },
    ]);
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={styles.backdropFill} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? 'New question' : 'Edit question'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={styles.formList}
          data={data.skills}
          keyExtractor={(item) => item.id}
          renderItem={renderSkill}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={listHeader}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
        />
        <View style={styles.footer}>
          <Button onPress={save}>Save</Button>
          {!isNew && <Button color={COLORS.red} onPress={del}>Delete</Button>}
          <Button ghost onPress={onClose}>Cancel</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backdropFill: { flex: 1 },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  closeText: { fontSize: 16 },
  formList: { maxHeight: 560 },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
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
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  answerInput: { minHeight: 140 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { fontWeight: '800', fontSize: 12 },
  skillPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  skillEmoji: { fontSize: 18, marginRight: 8 },
  skillTextWrap: { flex: 1 },
  skillName: { fontWeight: '800', fontSize: 15, color: COLORS.text },
  skillMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 2, fontWeight: '600' },
  check: { fontWeight: '900' },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  button: { borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  buttonGhost: { backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },
});
