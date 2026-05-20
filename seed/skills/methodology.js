// seed/skills/methodology.js — Agile, Scrum, Code Reviews, Sprint Planning, Architecture
import { mk } from '../helpers.js';

export default function buildMethodologySkills() {
  return [
    mk('Agile', 'method'),
    mk('Scrum', 'method'),
    mk('Code Reviews', 'method'),
    mk('Sprint Planning & Estimations', 'method'),
    mk('Architecture Planning', 'method'),
  ];
}
