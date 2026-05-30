import { getQuestionCards, getSkillTrail } from './questions';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'can',
  'for',
  'from',
  'how',
  'i',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'what',
  'when',
  'where',
  'why',
  'with',
  'you',
  'your',
]);

function clean(value) {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-zA-Z0-9+#.\s-]/g, ' ')
    .toLowerCase();
}

export function tokenize(value) {
  return clean(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function trimText(value, limit = 520) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
}

function skillDoc(skill, category, trail) {
  const structured = skill.structured || {};
  const sections = [
    skill.name,
    trail.join(' / '),
    category?.name,
    skill.notes,
    structured.definition,
    structured.whenUsed,
    structured.gotchas,
    structured.codeExample,
    ...(skill.apis || []).flatMap((api) => [
      api.name,
      api.signature,
      api.description,
      api.params,
      api.returns,
      api.example,
    ]),
    ...(skill.refs || []).flatMap((ref) => [ref.title, ref.url]),
  ];

  return {
    id: `skill:${skill.id}`,
    type: 'skill',
    title: skill.name,
    subtitle: unique([category?.name, trail.join(' / ')]).join(' · '),
    text: sections.filter(Boolean).join('\n'),
    preview: trimText(
      structured.definition || skill.notes || structured.whenUsed || structured.gotchas || ''
    ),
    skillId: skill.id,
    categoryColor: category?.color,
  };
}

function flashcardDoc(card) {
  return {
    id: `flashcard:${card.skillId}:${card.id}`,
    type: 'question',
    title: card.q,
    subtitle: unique([card.categoryName, card.trail.join(' / ')]).join(' · '),
    text: [card.q, card.a, card.userExplanation, card.categoryName, card.trail.join(' / ')].filter(Boolean).join('\n'),
    preview: trimText(card.a || card.userExplanation || ''),
    skillId: card.skillId,
    categoryColor: card.categoryColor,
  };
}

function projectDoc(project) {
  return {
    id: `project:${project.id}`,
    type: 'project',
    title: project.name,
    subtitle: unique([project.period, ...(project.stack || [])]).join(' · '),
    text: [
      project.name,
      project.period,
      project.description,
      ...(project.stack || []),
      ...(project.highlights || []),
      ...(project.outcomes || []),
      ...(project.links || []).flatMap((link) => [link.title, link.url]),
    ].filter(Boolean).join('\n'),
    preview: trimText(project.description || (project.highlights || []).join(' ')),
    projectId: project.id,
  };
}

function experienceDoc(experience) {
  return {
    id: `experience:${experience.id}`,
    type: 'experience',
    title: experience.company,
    subtitle: unique([experience.title, experience.period]).join(' · '),
    text: [
      experience.company,
      experience.title,
      experience.period,
      experience.location,
      ...(experience.bullets || []),
      ...(experience.stack || []),
    ].filter(Boolean).join('\n'),
    preview: trimText((experience.bullets || []).join(' ')),
  };
}

export function buildRagDocuments(data) {
  if (!data) return [];

  const categoriesById = new Map(data.categories.map((category) => [category.id, category]));
  const skills = data.skills.map((skill) =>
    skillDoc(skill, categoriesById.get(skill.categoryId), getSkillTrail(data.skills, skill.id))
  );
  const flashcards = getQuestionCards(data).map(flashcardDoc);
  const projects = data.projects.map(projectDoc);
  const experiences = data.experiences.map(experienceDoc);

  return [...skills, ...flashcards, ...projects, ...experiences].filter((doc) => doc.text.trim());
}

function termFrequency(tokens) {
  const counts = new Map();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  return counts;
}

function makeSnippet(text, queryTokens) {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  if (!compact) return '';

  const lower = compact.toLowerCase();
  const hitIndex = queryTokens
    .map((token) => lower.indexOf(token.toLowerCase()))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (hitIndex === undefined) return trimText(compact, 260);
  const start = Math.max(0, hitIndex - 90);
  const end = Math.min(compact.length, hitIndex + 220);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < compact.length ? '...' : '';
  return `${prefix}${compact.slice(start, end).trim()}${suffix}`;
}

export function retrieveRagContext(data, query, options = {}) {
  const topK = options.topK || 6;
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const docs = buildRagDocuments(data).map((doc) => {
    const tokens = tokenize(doc.text);
    return { ...doc, tokens, counts: termFrequency(tokens) };
  });
  const docCount = Math.max(docs.length, 1);
  const docFreq = new Map();

  docs.forEach((doc) => {
    unique(doc.tokens).forEach((token) => docFreq.set(token, (docFreq.get(token) || 0) + 1));
  });

  const queryPhrase = clean(query).trim();

  return docs
    .map((doc) => {
      let score = 0;
      queryTokens.forEach((token) => {
        const tf = doc.counts.get(token) || 0;
        if (!tf) return;
        const idf = Math.log(1 + docCount / (1 + (docFreq.get(token) || 0)));
        score += (1 + Math.log(tf)) * idf;
      });

      const title = clean(doc.title);
      const text = clean(doc.text);
      queryTokens.forEach((token) => {
        if (title.includes(token)) score += 2.5;
      });
      if (queryPhrase && text.includes(queryPhrase)) score += 5;

      return {
        ...doc,
        score,
        snippet: makeSnippet(doc.text, queryTokens),
      };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function buildGroundedBrief(query, results) {
  if (!query.trim()) return '';
  if (!results.length) {
    return "I couldn't find matching local context for that query yet. Try naming a skill, project, API, or interview topic.";
  }

  const lead = `Retrieved ${results.length} relevant source${results.length !== 1 ? 's' : ''} for "${query.trim()}".`;
  const best = results
    .slice(0, 3)
    .map((result, index) => `${index + 1}. ${result.title}: ${result.snippet || result.preview}`)
    .join('\n\n');

  return `${lead}\n\n${best}`;
}
