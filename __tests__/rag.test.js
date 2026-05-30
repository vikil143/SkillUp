import { buildGroundedBrief, buildRagDocuments, retrieveRagContext, tokenize } from '../src/domain/rag';

const data = {
  categories: [{ id: 'genai', name: 'Gen AI', emoji: 'AI', color: '#1CB0F6' }],
  skills: [
    {
      id: 'rag',
      name: 'RAG',
      categoryId: 'genai',
      parentId: null,
      notes: '',
      structured: {
        definition: 'Retrieval-Augmented Generation fetches relevant knowledge before answering.',
        codeExample: '',
        whenUsed: 'Use it for private knowledge bases and cited answers.',
        gotchas: 'Always keep API keys on a backend.',
      },
      flashcards: [{ id: 'q1', q: 'What is RAG?', a: 'Retrieve context, augment the prompt, generate an answer.' }],
      apis: [],
      refs: [],
      relatedProjectIds: [],
    },
  ],
  projects: [
    {
      id: 'p-docs',
      name: 'Docs Platform',
      period: '2025',
      stack: ['React'],
      description: 'Knowledge management platform with collaborative editing.',
      outcomes: ['Searchable documentation for engineering teams.'],
    },
  ],
  experiences: [
    {
      id: 'e1',
      company: 'NeoSoft',
      title: 'Senior Software Engineer',
      period: '2025',
      responsibilities: ['Introduced Agentic AI tools.'],
    },
  ],
};

describe('RAG retrieval', () => {
  it('tokenizes meaningful query terms', () => {
    expect(tokenize('How do I build a RAG system?')).toEqual(['do', 'build', 'rag', 'system']);
  });

  it('builds local documents from app data', () => {
    const docs = buildRagDocuments(data);
    expect(docs.map((doc) => doc.type)).toEqual(['skill', 'question', 'project', 'experience']);
  });

  it('retrieves the most relevant context first', () => {
    const results = retrieveRagContext(data, 'private knowledge rag citations');
    expect(results[0].type).toBe('skill');
    expect(results[0].title).toBe('RAG');
  });

  it('creates a grounded brief from retrieved sources', () => {
    const results = retrieveRagContext(data, 'rag');
    expect(buildGroundedBrief('rag', results)).toContain('Retrieved');
  });
});
