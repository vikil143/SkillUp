// seed/skills/ai-tools.js — Claude Code, Codex
import { mk } from '../helpers.js';

export default function buildAIToolsSkills() {
  return [
    mk('Claude Code', 'ai'),
    mk('Codex', 'ai'),
  ];
}
