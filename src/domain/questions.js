import { COLORS } from '../theme/colors';

export function getSkillTrail(skills, skillId) {
  const trail = [];
  let current = skills.find((s) => s.id === skillId);
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    trail.unshift(current.name);
    seen.add(current.id);
    current = current.parentId ? skills.find((s) => s.id === current.parentId) : null;
  }
  return trail;
}

export function getQuestionCards(data) {
  const cards = [];
  data.skills.forEach((skill) => {
    const category = data.categories.find((c) => c.id === skill.categoryId);
    const trail = getSkillTrail(data.skills, skill.id);
    (skill.flashcards || []).forEach((card) => {
      cards.push({
        ...card,
        skillId: skill.id,
        skillName: skill.name,
        categoryId: skill.categoryId,
        categoryName: category?.name || 'Uncategorized',
        categoryEmoji: category?.emoji || '📁',
        categoryColor: category?.color || COLORS.blue,
        trail,
      });
    });
  });
  return cards;
}
