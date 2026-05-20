// seed/skills/gen-ai.js — LLM Prompting, RAG, Embeddings, Vector DBs, Fine-tuning, Function Calling
import { mk } from '../helpers.js';

export default function buildGenAISkills() {
  return [
    mk('LLM Prompting', 'genai', null, {
      definition: 'Crafting inputs to elicit desired outputs from large language models. Zero-shot, few-shot, chain-of-thought, system prompts.',
    }),
    mk('RAG', 'genai', null, {
      definition: 'Retrieval-Augmented Generation — fetch relevant context from a knowledge base, inject into prompt, generate grounded answer.',
    }),
    mk('Embeddings', 'genai', null, {
      definition: 'Dense vector representations of text/images. Semantic similarity via cosine distance.',
    }),
    mk('Vector Databases', 'genai', null, {
      definition: 'DBs optimized for vector similarity search. Examples: Pinecone, Weaviate, pgvector, Chroma.',
    }),
    mk('Fine-tuning', 'genai', null, {
      definition: 'Adapting a pretrained LLM on domain-specific data to improve performance on targeted tasks.',
    }),
    mk('Function Calling / Tools', 'genai', null, {
      definition: 'LLM feature allowing models to call structured functions/tools. Enables agents to take actions: search, code, DB queries.',
    }),
  ];
}
