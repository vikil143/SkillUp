import { SEED } from '../seed';
import { getQuestionCards } from '../src/domain/questions';

describe('question bank seed content', () => {
  it('includes a Foundation question bank', () => {
    const data = SEED();
    const foundation = data.categories.find((category) => category.id === 'foundation');
    const foundationCards = getQuestionCards(data).filter(
      (card) => card.categoryId === 'foundation'
    );

    expect(foundation?.name).toBe('Foundation');
    expect(foundationCards.length).toBeGreaterThanOrEqual(20);
  });

  it('has valid questions and answers for every seeded flashcard', () => {
    const data = SEED();
    const cards = getQuestionCards(data);
    const seenIds = new Set();

    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card.id).toEqual(expect.any(String));
      expect(card.q.trim()).toBe(card.q);
      expect(card.a.trim()).toBe(card.a);
      expect(card.q.length).toBeGreaterThan(5);
      expect(card.a.length).toBeGreaterThan(10);
      expect(card.skillName).toEqual(expect.any(String));
      expect(card.categoryName).toEqual(expect.any(String));

      const cardKey = `${card.skillId}:${card.id}`;
      expect(seenIds.has(cardKey)).toBe(false);
      seenIds.add(cardKey);
    });
  });

  it('adds beginner foundation questions to every non-foundation skill', () => {
    const data = SEED();
    const nonFoundationSkills = data.skills.filter((skill) => skill.categoryId !== 'foundation');

    nonFoundationSkills.forEach((skill) => {
      const skillName = skill.name.trim();
      const questions = (skill.flashcards || []).map((card) => card.q);
      expect(questions).toContain(`What is ${skillName} in simple terms?`);
      expect(questions).toContain(`Why does ${skillName} matter?`);
      expect(questions).toContain(`What should a beginner remember about ${skillName}?`);
    });
  });
});
