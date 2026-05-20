// seed/helpers.js — shared uid generator and skill factory
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/**
 * mk(name, categoryId, parentId?, depth?) → skill object
 *
 * @typedef {{ id: string, name: string, categoryId: string, parentId: string|null,
 *   notes: string, structured: { definition: string, codeExample: string, whenUsed: string, gotchas: string },
 *   flashcards: Array<{ id: string, q: string, a: string }>,
 *   apis: Array<{ id: string, name: string, signature: string, description: string, params: string, returns: string, example: string, gotchas: string }>,
 *   refs: Array<{ id: string, title: string, url: string, startTime?: string }>,
 *   relatedProjectIds: string[] }} Skill
 */
export const mk = (name, categoryId, parentId = null, depth = {}) => ({
  id: uid(),
  name,
  categoryId,
  parentId,
  notes: depth.notes || '',
  structured: {
    definition: depth.definition || '',
    codeExample: depth.codeExample || '',
    whenUsed: depth.whenUsed || '',
    gotchas: depth.gotchas || '',
  },
  flashcards: depth.flashcards || [],
  apis: depth.apis || [],
  refs: depth.refs || [],
  relatedProjectIds: depth.relatedProjectIds || [],
});
