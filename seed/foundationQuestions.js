import { uid } from './helpers.js';

const normalizeQuestion = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const stripMarkdown = (value) =>
  String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const firstUsefulSentence = (value) => {
  const text = stripMarkdown(value);
  if (!text) return '';
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return (parts[0] || text).trim();
};

const categoryLabel = (categories, categoryId) =>
  categories.find((category) => category.id === categoryId)?.name || 'software engineering';

const card = (q, a) => ({ id: uid(), q, a });

export function addFoundationQuestions(skills, categories) {
  skills.forEach((skill) => {
    if (skill.categoryId === 'foundation') return;
    if (!Array.isArray(skill.flashcards)) skill.flashcards = [];

    const existing = new Set(skill.flashcards.map((item) => normalizeQuestion(item.q)));
    const skillName = String(skill.name || '').trim();
    const categoryName = categoryLabel(categories, skill.categoryId);
    const definition = firstUsefulSentence(skill.structured?.definition || skill.notes);
    const whenUsed = firstUsefulSentence(skill.structured?.whenUsed);
    const gotcha = firstUsefulSentence(skill.structured?.gotchas);

    const foundationCards = [
      card(
        `What is ${skillName} in simple terms?`,
        definition ||
          `${skillName} is a ${categoryName} topic. Start by learning what problem it solves, the core vocabulary, and the smallest practical example before moving into advanced usage.`
      ),
      card(
        `Why does ${skillName} matter?`,
        whenUsed ||
          `${skillName} matters because it gives engineers a shared way to solve a common ${categoryName.toLowerCase()} problem. Understanding the trade-offs helps you choose it intentionally instead of using it by habit.`
      ),
      card(
        `What should a beginner remember about ${skillName}?`,
        gotcha ||
          `Learn the basic workflow first, then the limits. A good foundation answer should explain when ${skillName} helps, when it adds complexity, and what mistake beginners commonly make.`
      ),
    ];

    foundationCards.forEach((item) => {
      if (!existing.has(normalizeQuestion(item.q))) {
        skill.flashcards.push(item);
        existing.add(normalizeQuestion(item.q));
      }
    });
  });

  return skills;
}
