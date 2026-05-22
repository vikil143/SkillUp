import React, { memo, useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import RichAnswerText from './RichAnswerText';

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

export default memo(function ExplanationEditModal({ explanation, onSave, onClose, question }) {
  const [text, setText] = useState(explanation || '');
  const [preview, setPreview] = useState(false);

  const handleSave = useCallback(() => {
    onSave(text.trim());
  }, [text, onSave]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={styles.backdropFill} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>✏️ My Explanation</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {question && (
          <View style={styles.questionContext}>
            <Text style={styles.contextLabel}>Question:</Text>
            <Text style={styles.contextText}>{question}</Text>
          </View>
        )}

        <View style={styles.tabsContainer}>
          <Pressable
            onPress={() => setPreview(false)}
            style={[styles.tab, !preview && styles.tabActive]}
          >
            <Text style={[styles.tabText, !preview && styles.tabTextActive]}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => setPreview(true)}
            style={[styles.tab, preview && styles.tabActive]}
          >
            <Text style={[styles.tabText, preview && styles.tabTextActive]}>Preview</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {!preview ? (
            <View>
              <TextInput
                style={styles.textarea}
                multiline
                value={text}
                onChangeText={setText}
                placeholder="Share your understanding or how you solved this problem...&#10;&#10;Use ```language for code blocks&#10;```javascript&#10;const x = 1;&#10;```"
                placeholderTextColor={COLORS.textLight}
              />
              <Text style={styles.hint}>💡 Tip: Use ```language ... ``` for syntax-highlighted code blocks</Text>
            </View>
          ) : (
            <View style={styles.previewContent}>
              {text.trim() ? (
                <RichAnswerText value={text} textStyle={styles.previewText} />
              ) : (
                <Text style={styles.emptyPreview}>Nothing to preview yet. Start typing to see how it looks!</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Button onPress={handleSave}>Save explanation</Button>
          <Button ghost onPress={onClose}>Cancel</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

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
  questionContext: {
    backgroundColor: COLORS.blue + '11',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.blue,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  contextText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    maxHeight: 400,
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    backgroundColor: 'white',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 8,
  },
  previewContent: {
    padding: 12,
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    minHeight: 100,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyPreview: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  button: { borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, flex: 1, minWidth: '45%' },
  buttonGhost: { backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 14, textTransform: 'uppercase', textAlign: 'center' },
});
