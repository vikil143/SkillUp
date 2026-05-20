// seed/skills/performance.js — Virtualization, Memoization, Code Splitting, Web Vitals, etc.
import { mk } from '../helpers.js';

export default function buildPerformanceSkills() {
  return [
    mk('Virtualization', 'perf', null, {
      definition: 'Render only visible items in a list. FlatList/react-window recycle DOM nodes to keep memory and paint cost constant.',
    }),
    mk('Memoization', 'perf', null, {
      definition: 'Cache results of expensive computations (useMemo, React.memo, reselect). Avoids redundant work on re-renders.',
    }),
    mk('Code Splitting', 'perf', null, {
      definition: 'Split JS bundles into chunks loaded on demand (React.lazy + Suspense, dynamic import()). Reduces initial parse/exec time.',
    }),
    mk('Web Vitals', 'perf', null, {
      definition: 'Google metrics: LCP (load), FID/INP (interaction), CLS (layout stability). Baseline for measuring real-user perf.',
    }),
    mk('Lazy Loading', 'perf', null, {
      definition: 'Defer loading of off-screen images, components, or routes until needed. Reduces initial payload.',
    }),
    mk('Caching Strategies', 'perf', null, {
      definition: 'HTTP cache-control headers, CDN edge caching, stale-while-revalidate, service-worker caching for repeat visits.',
    }),
    mk('Bundle Analysis', 'perf', null, {
      definition: 'Inspect bundle composition with webpack-bundle-analyzer or Vite rollup-plugin-visualizer. Find and eliminate bloat.',
    }),
    mk('Database Query Optimization', 'perf', null, {
      definition: 'Indexes, query plan analysis (EXPLAIN), avoiding N+1, denormalization, connection pooling.',
    }),
  ];
}
