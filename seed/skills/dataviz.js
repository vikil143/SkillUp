// seed/skills/dataviz.js — D3.js, Three.js (dataviz), SVG
import { mk } from '../helpers.js';

export default function buildDatavizSkills() {
  return [
    mk('D3.js', 'dataviz', null, {
      whenUsed: 'Custom interactive graphs and optimized SVG rendering at NeoSoft.',
    }),
    mk('Three.js', 'dataviz'),
    mk('SVG', 'dataviz'),
  ];
}
