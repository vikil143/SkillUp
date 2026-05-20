import React, { memo, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme/colors';

function splitFencedCode(value) {
  const parts = [];
  const source = value || '';
  const fence = /```(\w+)?\n?([\s\S]*?)```/g;
  let cursor = 0;
  let match;

  while ((match = fence.exec(source))) {
    if (match.index > cursor) {
      parts.push({ type: 'text', value: source.slice(cursor, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || '',
      value: match[2].replace(/\n$/, ''),
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < source.length) {
    parts.push({ type: 'text', value: source.slice(cursor) });
  }

  return parts.length ? parts : [{ type: 'text', value: source }];
}

function RichAnswerText({ value, textStyle, codeStyle }) {
  const parts = useMemo(() => splitFencedCode(value), [value]);

  return (
    <View>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <View key={`${part.type}-${index}`} style={[styles.codeBlock, codeStyle]}>
              {!!part.language && <Text style={styles.codeLang}>{part.language}</Text>}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text selectable style={styles.codeText}>{part.value}</Text>
              </ScrollView>
            </View>
          );
        }

        const text = part.value.trim();
        if (!text) return null;
        return (
          <Text key={`${part.type}-${index}`} style={[styles.answerText, textStyle]}>
            {text}
          </Text>
        );
      })}
    </View>
  );
}

export default memo(RichAnswerText);

const styles = StyleSheet.create({
  answerText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#1F2933',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  codeLang: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  codeText: {
    color: '#F8FAFC',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});
