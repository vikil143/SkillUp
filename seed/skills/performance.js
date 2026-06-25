// seed/skills/performance.js — React perf, Vitals, bundles, lazy-load, caches, indexing, profiling, networking
import { mk, uid } from '../helpers.js';

const card = (q, a) => ({ id: uid(), q, a });
const api = (name, signature, description, params, returns, example, gotchas) => ({
  id: uid(),
  name,
  signature,
  description,
  params,
  returns,
  example,
  gotchas,
});
const ref = (title, url) => ({ id: uid(), title, url });

function pushSubs(skills, parent, names, defs, codes, fcGroups) {
  names.forEach((name, i) => {
    skills.push(
      mk(name, parent.categoryId, parent.id, {
        definition: defs[i],
        codeExample: codes[i],
        flashcards: fcGroups[i],
      }),
    );
  });
}

export default function buildPerformanceSkills() {
  const skills = [];

  const reactPerf = mk('React Performance', 'perf', null, {
    definition:
      'React performance tuning is about finding wasted work, then removing it carefully. Common fixes include stable props, memoization where it pays off, smaller context updates, virtualized lists, deferred non-urgent UI, route-level code splitting, and profiler-guided changes.',
    codeExample:
      "import { memo, useDeferredValue } from 'react';\nconst Row = memo(function Row({ symbol }) {\n return <Cell symbol={symbol} />;\n});\nexport function Tape({ symbols }) {\n const deferred = useDeferredValue(symbols);\n return deferred.map((s) => <Row key={s.id} symbol={s} />);\n}\n",
    whenUsed:
      'Huge Option Chain dashboards (`p-stock` style virtualization), SPA shell complexity, bridging React Native list perf with concurrent interactions.',
    gotchas:
      'Memo without referential stability amplifies noise; context providers force broad subscriptions; concurrent features need intentional loading states.',
    flashcards: [
      card(
        'When does `React.memo` actually pay off?',
        "When parents re-render often and props usually stay the same.",
      ),
      card(
        'Why can `useCallback` backfire?',
        "If dependencies change every render, the callback changes too.",
      ),
      card(
        'What does `useDeferredValue` trade?',
        "It keeps urgent UI responsive by showing slower UI a little later.",
      ),
      card(
        'Profiler “commit” meaning?',
        "React has applied updates to the screen or native view.",
      ),
      card(
        'Why virtualization beats pure memo on giant lists?',
        "It renders only visible rows instead of keeping every row mounted.",
      ),
      card(
        'Context performance smell?',
        "One large context with fast-changing values re-renders too many consumers.",
      ),
      card(
        'How does `startTransition` differ from raw `setState`?',
        "It marks updates as non-urgent so React can keep interactions responsive.",
      ),
      card(
        'Concurrent double render in dev?',
        "Strict Mode does this to catch impure render and effect code.",
      ),
    ],
    apis: [
      api(
        'React.memo',
        'const Row = memo(RowComponent, areEqual?)',
        'Skips re-render when props compare equal via default shallow compare or custom predicate.',
        'component + optional comparator',
        'memoized component type',
        "export const Row = memo(({ id }) => <li>{id}</li>);",
        'Props holding inline objects/functions defeat memo unless stabilized.',
      ),
      api(
        'useMemo',
        'const model = useMemo(() => buildModel(filtered), [filtered]);',
        'Caches expensive derived data between renders while deps unchanged.',
        'factory + dependency array',
        'memoized value',
        "const stats = useMemo(() => aggregate(rows), [rows]);",
        'Over-memoizing tiny computations adds hook overhead without wins.',
      ),
      api(
        'useCallback',
        "const onSelect = useCallback((id) => dispatch({ type: 'select', id }), [dispatch]);",
        'Stabilizes function identity for memoized children or effect subscriptions.',
        'function + deps',
        'stable callback ref',
        "const save = useCallback(() => api.save(form), [form]);",
        'If deps include rapidly changing objects identity churn persists.',
      ),
      api(
        'React.lazy + Suspense',
        "const Chart = lazy(() => import('./Chart'));\n<Suspense fallback={<Spinner/>}><Chart/></Suspense>",
        'Code-splits component trees bundler emits async chunks.',
        'importer function',
        'Lazy component',
        "const Panel = lazy(() => import('./AdminPanel'));",
        'Error boundaries should wrap async boundaries for failed chunk loads.',
      ),
      api(
        'useTransition',
        "const [pending, start] = useTransition();\nstart(() => setHeavy(next));",
        'Marks state updates as transitions enabling interruptible rendering.',
        'state updater callback',
        'boolean pending flag + transition starter',
        "startTransition(() => setTab('analytics'));",
        'Does not magically speed work—only improves scheduling responsiveness.',
      ),
      api(
        'useDeferredValue',
        'const deferredQuery = useDeferredValue(query);',
        'Feeds derived UI a lag-tolerant snapshot of rapidly changing input.',
        'live value',
        'deferred mirror',
        "const rows = useMemo(() => filter(deferredQuery), [deferredQuery]);",
        'Combine with throttling for network not just render deferral.',
      ),
      api(
        'useId',
        'const id = useId();',
        'Stable unique IDs bridging SSR/client without mismatch—accessibility wiring.',
        'none',
        'string id',
        "const labelId = useId();",
        'Do not use for list keys when data provides natural keys.',
      ),
    ],
    refs: [
      ref('React.dev — memo', 'https://react.dev/reference/react/memo'),
      ref('React.dev — useMemo', 'https://react.dev/reference/react/useMemo'),
      ref('React.dev — concurrent features', 'https://react.dev/blog/2022/03/29/react-v18#new-feature-starttransition'),
      ref('React DevTools Profiler', 'https://react.dev/learn/react-developer-tools'),
      ref('web.dev — optimize long tasks', 'https://web.dev/articles/optimize-long-tasks'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(reactPerf);
  pushSubs(
    skills,
    reactPerf,
    [
      'Memoization discipline',
      'useMemo vs useCallback nuance',
      'Virtualized lists',
      'Code splitting & Suspense',
      'Concurrent React APIs',
      'Profiler-driven iteration',
    ],
    [
      'Measure before memo—prove commit time drops with flame evidence.',
      'Reserve hooks for referential stability or heavy pure transforms.',
      'windowing keeps DOM/RN host nodes bounded under scroll.',
      'Strategic import boundaries shrink initial parse/compile cost.',
      'Transitions/deferred values reshape scheduling not algorithmic complexity.',
      'Profiler highlights which subtrees burn time per interaction.',
    ],
    [
      "if (prevProps.row === nextProps.row) return true; // custom memo compare",
      'const handlers = useMemo(() => ({ onSave, onCancel }), [onSave, onCancel]);',
      "import { FixedSizeList as List } from 'react-window';\n<List height={600} itemCount={items.length} itemSize={42} />",
      "const Details = lazy(() => import('./Details'));\n",
      "const [pending, start] = useTransition();\n",
      '// Record interaction → inspect commit flame chart for unexpected parents',
    ],
    [
      [
        card(
          'False positive profiler rows?',
          "Wrappers and fallbacks can hide the real slow component.",
        ),
      ],
      [
        card(
          'useMemo dependency array traps?',
          "New objects or arrays in dependencies break the cache every render.",
        ),
      ],
      [
        card(
          'FlashList vs legacy lists RN?',
          "FlashList recycles rows better, but bad size estimates still cause jank.",
        ),
      ],
      [
        card(
          'Suspense without route boundary?',
          "Too many tiny boundaries can create loading waterfalls.",
        ),
      ],
      [
        card(
          'startTransition on every keystroke?',
          "It still schedules work; debounce network-heavy searches too.",
        ),
      ],
      [
        card(
          'Why avoid anonymous inline components in lists?',
          "They remount often, lose state, and defeat memoization.",
        ),
      ],
    ],
  );

  const webVitals = mk('Web Vitals', 'perf', null, {
    notes:
      'Field data (CrUX) vs lab (Lighthouse) contexts differ; INP replaced FID as Core Web Vital in 2024—verify dashboard labels when reading older posts.',
    definition:
      'Web Vitals summarize user-perceived quality: **LCP** captures largest above-the-fold paint timing, **INP** measures worst interaction latency across the page lifetime, **CLS** quantifies unexpected layout movement. Supporting metrics (`TTFB`, `FCP`) contextualize server vs client bottlenecks.',
    codeExample:
      "import { onLCP, onINP, onCLS } from 'web-vitals';\nonINP((metric) => analytics.send('inp', metric.value));\n",
    whenUsed:
      'Prioritising regressions post-release, aligning perf OKRs with CrUX thresholds, tying front-end instrumentation to analytics backend (`p-stock` scale).',
    gotchas:
      'Lab tests miss real device thermal throttling; single-page soft navigations need soft-nav support in tooling; banner ads/third scripts dominate field CLS.',
    flashcards: [
      card(
        'INP vs legacy FID nuance?',
        "INP measures interaction latency across the whole visit, not just the first input.",
      ),
      card(
        'LCP element typical culprits?',
        "Usually the hero image, poster, background image, or large text block.",
      ),
      card(
        'CLS formula intuition?',
        "It measures how much content moved and how far it moved.",
      ),
      card(
        'Why prefer field data over synthetic lab for ranking guardrails?',
        "Field data reflects real users, devices, and networks.",
      ),
      card(
        'TTFB vs LCP relationship?',
        "Fast server response can still have slow LCP if rendering is heavy.",
      ),
      card(
        'What is “good” INP threshold ballpark?',
        "Good INP is about 200 ms or less at the 75th percentile.",
      ),
      card(
        'How does soft navigation affect Vitals?',
        "SPA route changes need extra instrumentation beyond normal page-load timing.",
      ),
      card(
        'Why log attribution on INP?',
        "It shows which event, task, or script caused the delay.",
      ),
    ],
    apis: [
      api(
        'onLCP',
        'onLCP((metric) => void)',
        'Reports Largest Contentful Paint entries with element attribution when available.',
        'callback receiving metric POJO',
        'unsubscribe handle',
        "onLCP((m) => send('lcp', m.value));",
        'Hero swaps after late async images can reorder LCP target—watch attribute changes.',
      ),
      api(
        'onINP',
        'onINP((metric) => void)',
        'Surfaces Interaction to Next Paint style responsiveness metrics reflecting INP rollout.',
        'callback',
        'subscription',
        "onINP(reportLongTasks);",
        'Long pointerdown handlers inflate INP—profile main thread stalls.',
      ),
      api(
        'onCLS',
        'onCLS((metric) => void, opts?)',
        'Aggregates layout shift scores until page hidden / lifecycle end.',
        'callback + optional reportAllChanges',
        'session cls value',
        "onCLS((m) => buffer.push(m));",
        'User-triggered shifts (500ms window) exempt—understand exemption rules when reproducing.',
      ),
      api(
        'onTTFB / onFCP',
        'onTTFB(handler); onFCP(handler);',
        'Expose server/network vs first paint timelines complementing LCP narratives.',
        'callback',
        'metric handle',
        "onTTFB((m) => spans.add('ttfb', m.value));",
        'Navigation timing entries differ prerender vs BFCache restores.',
      ),
      api(
        'PerformanceObserver',
        'new PerformanceObserver(cb).observe({ type: "longtask", buffered: true })',
        'Collect long tasks / element timing beyond web-vitals defaults.',
        'entry types + options',
        'observer instance',
        "po.observe({ type: 'longtask', buffered: true });",
        'Some entry types require cross-origin isolated opt-ins for full detail.',
      ),
    ],
    refs: [
      ref('web.dev Web Vitals', 'https://web.dev/articles/vitals'),
      ref('web-vitals library', 'https://github.com/GoogleChrome/web-vitals'),
      ref('Chrome UX Report', 'https://developer.chrome.com/docs/crux'),
      ref('MDN Performance API', 'https://developer.mozilla.org/en-US/docs/Web/API/Performance_API'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(webVitals);
  pushSubs(
    skills,
    webVitals,
    [
      'LCP deep dive',
      'INP measurement mindset',
      'CLS stabilisation',
      'TTFB & FCP context',
      'Field vs lab workflows',
    ],
    [
      'Prioritise hero resource discovery + avoid late client-only reveals.',
      'Slice main-thread tasks break up input handlers instrument attributions.',
      'Reserve width/height skeleton states for media + dynamic slots.',
      'Differentiate edge cache vs origin compute vs client hydration costs.',
      'Pair Lighthouse CI with RUM for guardrails + reality checks.',
    ],
    [
      '<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">',
      "requestIdleCallback(() => hydrateHeavyChart()) // after critical interactions",
      '<img width="1200" height="630" alt="" /> // explicit box prevents CLS',
      'const ttfb = performance.timing.responseStart - performance.timing.requestStart;',
      'npx lighthouse https://app.example --only-categories=performance',
    ],
    [
      [
        card(
          'Why client-side nav breaks classic navigation timing?',
          "SPA navigation does not create a full browser navigation entry.",
        ),
      ],
      [
        card(
          'How do iframes pollute CLS?',
          "Ads or embeds without reserved space can push page content around.",
        ),
      ],
      [
        card(
          'Can optimistic UI harm INP?',
          "Yes, if the optimistic update still does heavy main-thread work.",
        ),
      ],
      [
        card(
          'CrUX vs RUM sampling bias?',
          "CrUX is Chrome-only field data; RUM adds your own user coverage.",
        ),
      ],
      [
        card(
          'Why log deviceMemory / connection?',
          "It helps separate low-end device issues from general regressions.",
        ),
      ],
    ],
  );

  const bundleOptimization = mk('Bundle Optimization', 'perf', null, {
    definition:
      'Bundle optimisation shrinks parse/compile/transfer costs via tree-shaking dead-code elimination code-splitting modern transpilation targets bundle visualisation eliminating duplicate polyfills deduping heavy dependencies.',
    codeExample:
      "import { pick } from 'lodash-es/pick';\n// bad: import _ from 'lodash';\n",
    whenUsed:
      'Initial load budgets for marketing sites microfrontends mobile bridges where JS weight directly maps to time-to-interactive.',
    gotchas:
      'CommonJS interop blocks shaking; dynamic import in hot paths may cause waterfalls; duplicate package versions sneak via transitive deps.',
    flashcards: [
      card(
        'What enables effective tree shaking?',
        "Static ESM imports, honest side-effect metadata, and bundler analysis.",
      ),
      card(
        'Why analyse before splitting?',
        "Split the largest real bottlenecks, not random modules.",
      ),
      card(
        'moment.js vs luxon/dayjs lesson?',
        "Avoid shipping huge locale data when a smaller date library works.",
      ),
      card(
        'How does browserslist influence bundle size?',
        "Modern targets need fewer polyfills and transforms.",
      ),
      card(
        'Why dedupe matters in monorepos?',
        "Duplicate packages add bytes and can break shared state, especially React.",
      ),
      card(
        'What is “package import” linting value?',
        "It prevents broad imports that pull in too much code.",
      ),
      card(
        'Server components / RSC impact?',
        "They keep more logic off the client bundle.",
      ),
      card(
        'When does manual chunking beat defaults?',
        "When stable vendor code and changing app code cache better separately.",
      ),
    ],
    apis: [
      api(
        'package.json sideEffects',
        '"sideEffects": false',
        'Signals bundler which files are safe to drop if exports unused.',
        'boolean or file globs',
        'metadata for bundler',
        '"sideEffects": ["*.css", "./register.js"]',
        'Lying causes dropped side-effectful initializers—test thoroughly.',
      ),
      api(
        'dynamic import',
        'const mod = await import("./admin");',
        'Creates async chunk loading on demand.',
        'module path string',
        'Promise of module namespace',
        "onClick={() => import('./modal').then(m => m.open())}",
        'Await inside render without Suspense triggers waterfall UX unless managed.',
      ),
      api(
        'webpack-bundle-analyzer',
        'webpack-bundle-analyzer build/stats.json',
        'Visual treemap of module contributions.',
        'stats json path',
        'local server report',
        'ANALYZE=true npm run build',
        'Remember gzip/brotli sizes differ from byte treemap area.',
      ),
      api(
        'rollup-plugin-visualizer',
        'visualizer({ open: true })',
        'Rollup/Vite compatible sunburst/treemap reports.',
        'plugin options',
        'build hook side effect',
        "import { visualizer } from 'rollup-plugin-visualizer';",
        'CI should emit static HTML artifacts not interactive servers.',
      ),
      api(
        'source-map-explorer',
        'source-map-explorer dist/**/*.js',
        'Maps generated lines back to sources for bloat hunting.',
        'glob of bundles',
        'CLI report',
        'npx source-map-explorer dist/main.*.js',
        'Incomplete maps misattribute bytes—verify map generation settings.',
      ),
    ],
    refs: [
      ref('web.dev — Reduce JavaScript', 'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting'),
      ref('Vite build optimisations', 'https://vitejs.dev/guide/build.html'),
      ref('Webpack tree shaking', 'https://webpack.js.org/guides/tree-shaking/'),
      ref('Smaller JavaScript bundles (Chrome DevRel)', 'https://developer.chrome.com/docs/lighthouse/performance/unused-javascript'),
    ],
    relatedProjectIds: [],
  });
  skills.push(bundleOptimization);
  pushSubs(
    skills,
    bundleOptimization,
      [
        'Tree shaking mechanics',
        'Splitting strategies',
        'Bundle analysis ritual',
        'Lazy boundary placement',
        'Dependency hygiene',
      ],
      [
        'Mark side effects honestly audit barrel files.',
        'Route vs feature vs interaction triggered splits—choose by usage telemetry.',
        'Weekly CI upload treemap diff prevents silent regressions.',
        'Place boundaries above expensive rarely used modules not every component.',
        'Pin major versions dedupe lockfile audit alternative libraries.',
      ],
      [
        'grep -R "from \'lodash\'" src && fail build',
        "const Admin = lazy(() => import('./features/Admin'));\n",
        'npx vite-bundle-visualizer',
        '// Move heavy chart libs behind tab selection not initial shell',
        'npm dedupe && npm ls react',
      ],
    [
      [
        card(
          'Barrel file anti-pattern?',
          "`export *` can pull too much code into the bundle.",
        ),
      ],
      [
        card(
          'Dynamic import inside loop hazard?',
          "It can trigger many chunk downloads at once.",
        ),
      ],
      [
        card(
          'Why gzip size still matters?',
          "Transfer shrinks, but parsing still depends on shipped JavaScript.",
        ),
      ],
      [
        card(
          'Dual package hazard?',
          "A bundle may include both CJS and ESM versions of the same library.",
        ),
      ],
      [
        card(
          'Manual chunk `react` separate always good?',
          "Not always; test caching behavior before forcing chunks.",
        ),
      ],
    ],
  );

  const lazyLoading = mk('Lazy Loading', 'perf', null, {
    definition:
      'Lazy loading postpones fetching or mounting until needed shrinking critical path payloads images components data modules routes etc via native hints dynamic imports observers.',
    codeExample:
      '<img src="/hero.webp" loading="lazy" decoding="async" fetchpriority="low" />\n',
    whenUsed:
      'Feed scroll-heavy dashboards marketing long pages RN lists with windowing analogues deferring tertiary modules.',
    gotchas:
      'Lazy images without dimensions wreck CLS native lazy still needs width/height; eager LCP hero must disable lazy; SSR routes need streaming discipline.',
    flashcards: [
      card(
        'Why pairing `loading="lazy"` + explicit dimensions?',
        "Dimensions reserve space so lazy loading does not cause layout shift.",
      ),
      card(
        'IntersectionObserver thresholds tuning?',
        "Load early enough to feel instant, but not so early that bandwidth is wasted.",
      ),
      card(
        'React.lazy vs route-level split?',
        "Route splits are simpler; component splits are finer but add boundary cost.",
      ),
      card(
        'Prefetch vs preload subtlety?',
        "Preload is for needed-soon assets; prefetch is speculative and low priority.",
      ),
      card(
        '`fetchpriority` high when?',
        "Use it only for the main LCP resource.",
      ),
      card(
        'Below-the-fold data fetching pattern?',
      "Fetch after first paint or when the section nears the viewport.",
      ),
      card(
        'Native module preload hook?',
      "`modulepreload` warms important ESM modules before execution.",
      ),
      card(
        'RN analogue?',
      "Use windowed lists and defer heavy nested cell work.",
      ),
    ],
    apis: [
      api(
        'loading attr',
        '<img loading="lazy"/>',
        'Browser-native approximate viewport deferred image loads.',
      'lazy|eager',
      'hints loading scheduler',
      '<img loading="lazy" sizes="..." />',
      'LCP hero should use `loading="eager"` (default) + `fetchpriority="high"`.',
      ),
      api(
        'fetchpriority',
      '<img fetchpriority="high" />',
      'Coordinates browser resource priority hints LCP orchestration.',
      'high|low|auto',
      'priority directive',
      '<link rel="preload" fetchpriority="high" />',
      'Overuse lowers discriminatory power.',
      ),
      api(
        'IntersectionObserver',
      `const io = new IntersectionObserver(([e])=>{ if(e.isIntersecting) mount(); }, { rootMargin:'200px'});`,
      'General lazy mount sentinel beyond images.',
      'callback + options object',
      'observer instance',
      "io.observe(nodeRef.current);\nreturn ()=>io.disconnect();",
      'Forgetting disconnect leaks observers on SPA route churn.',
      ),
      api(
        'dynamic import (repeat usage)',
      'await import("./module")',
      'JS module lazy retrieval hooking suspense boundaries loaders.',
      'path string literal preferred',
      'Promise module',
      "router.lazy(()=>import('../pages/Billing'));",
      'WebpackMagicComment prefetch influences network timing deliberately.',
      ),
    ],
    refs: [
      ref('MDN loading=lazy', 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading'),
      ref('Lazy loading images patterns', 'https://web.dev/articles/browser-level-image-lazy-loading'),
      ref('IntersectionObserver guide', 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API'),
      ref('fetchpriority specification note', 'https://developer.chrome.com/blog/priority-hints'),
    ],
    relatedProjectIds: [],
  });
  skills.push(lazyLoading);
  pushSubs(
    skills,
    lazyLoading,
    [
      'Route & component tiers',
      'Image & media postponement',
      'Intersection-driven mounts',
      'Speculative prefetching',
      'Framework-specific hooks',
    ],
    [
      'Match split granularity to UX skeleton states.',
      'Reserve layout boxes always for deferred media.',
      'Observers belong in effects with strict cleanup.',
      'Warm next routes on intent hover cautiously sparing bandwidth.',
      'Next.js dynamic + RN suspense analogues converge conceptually.',
    ],
    [
      "const Other = lazy(() => import(/* webpackPrefetch: true */ './Other'));",
      '<iframe loading="lazy" src="about:blank" data-src="https://maps…"></iframe>',
      "const observer = useRef(new IntersectionObserver(cb)).current;",
      '<link rel="prefetch" href="/next-route" />',
      'Preload the next route bundle only when the router or bundler supports it; otherwise keep the navigation lazy and show a fast fallback.',
    ],
    [
      [
        card(
          'Why avoid lazy on hero images?',
          "It delays discovery of the image that likely drives LCP.",
        ),
      ],
      [
        card(
          'Decode async tradeoff?',
          "It reduces main-thread blocking but can delay final paint.",
        ),
      ],
      [
        card(
          'Too many observers?',
          "Reuse one observer for many elements when possible.",
        ),
      ],
      [
        card(
          'Prefetch on metered networks?',
          "Respect Save-Data and avoid spending user bandwidth unnecessarily.",
        ),
      ],
      [
        card(
          'Suspense fallbacks CLS risk?',
          "Fallbacks with different heights can shift layout.",
        ),
      ],
    ],
  );

  const cachingStrategies = mk('Caching Strategies (app-level)', 'perf', null, {
    notes:
      'Pair with Internet & Networking → Caching (browser + HTTP) for header-level semantics & CDN interplay; here we emphasise application memory stores client data libraries offline service workers.',
    definition:
      'App-level caching layers coordinate in-memory LRU maps persistent storage IndexedDB wrappers service workers background sync plus declarative hooks (TanStack Query SWR RTK-query) unify stale freshness policies across components without duplicating imperative fetch choreography.',
    codeExample:
      "queryClient.invalidateQueries({ queryKey: ['bookings'] });\n",
    whenUsed:
      'Feeds dashboards mobile offline-first SPA shells realtime dashboards where HTTP cache alone inadequate due personalisation granularity.',
    gotchas:
      'Stale caches hide auth revocations; SSR hydration mismatches hydrated cache seeds; exponential retry storms amplify outages.',
    flashcards: [
      card(
        'Stale-while-revalidate intuition?',
      "Show cached data now, then refresh it in the background.",
      ),
      card(
        'cache-first vs network-first picking?',
      "Use cache-first for stable reads and network-first for fresh critical data.",
      ),
      card(
        'Why normalised entity stores?',
      "They reduce duplicate data and make targeted updates easier.",
      ),
      card(
        'Service worker versioning mistake?',
      "Old cached assets can stick around if versions and activation are not coordinated.",
      ),
      card(
        'Mutations vs optimistic updates caveat?',
      "Always handle rollback when the server rejects the change.",
      ),
      card(
        'Memory caches vs IndexedDB?',
      "Memory is fastest but temporary; IndexedDB persists but is async and slower.",
      ),
      card(
        'Double fetching hydration?',
      "Use the same cache keys on server and client.",
      ),
      card(
        'Rate limit interplay?',
      "Background refreshes need jitter, backoff, and in-flight dedupe.",
      ),
    ],
    apis: [
      api(
        'useQuery',
        "const q = useQuery({ queryKey: ['user', id], queryFn });",
        'TanStack Query hook orchestrates fetch status deduping staleness timers.',
      'options object',
      'query result object',
      "queryClient.prefetchQuery({ queryKey:['feed'], queryFn });",
      'Forgotten `enabled` guards fire queries before auth ready.',
      ),
      api(
        'useSWR',
      "const { data } = useSWR('/api/profile', fetcher, { revalidateOnFocus: false });",
      'Keyed cache with revalidation focus policy hooks minimalist surface.',
      'key fetcher options',
      'data/error meta',
      "mutate('/api/profile', optimisticData);",
      'Global mutate namespace collisions unless keys disciplined.',
      ),
      api(
        'caches.open',
      `const cache = await caches.open('v2-shell');`,
      'Service worker CacheStorage namespace opening.',
      'cache name string',
      'Promise<Cache>',
      'const cache = await caches.open(namespace); await cache.match(req);',
      'Quota eviction opaque—observe storage persistence events.',
      ),
      api(
        'Cache.match / Cache.add',
      'await cache.add(request); await cache.match(request)',
      'Populate or intercept cached Responses inside SW lifecycle.',
      'Request|string',
      'Response|undefined',
      "event.respondWith(cache.match(req).then(r=>r||fetch(req)));",
      `Vary headers still partition entries—mirror HTTP nuances`,
      ),
    ],
    refs: [
      ref('TanStack Query docs', 'https://tanstack.com/query/latest/docs/framework/react/overview'),
      ref('SWR docs', 'https://swr.vercel.app/'),
      ref('Mozilla Service Worker API', 'https://developer.mozilla.org/en-US/docs/Web/API/Cache'),
      ref('Stale-While-Revalidate pattern', 'https://web.dev/learn/pwa/offline-foundations-recipes'),
    ],
    relatedProjectIds: [],
  });
  skills.push(cachingStrategies);
  pushSubs(
    skills,
    cachingStrategies,
    [
      'SWR semantics',
      'Cache-first decisions',
      'TanStack primitives',
      'Service worker cache layers',
      'Persistence vs ephemeral',
    ],
    [
      'Balance UX responsiveness against data freshness contractual SLAs.',
      'Mutations-heavy flows prefer pessimistic confirmations or nuanced optimistic toggles.',
      'Query keys are schema—nest consistently with versioning.',
      'Precache shells dynamic runtime caching API JSON selectively.',
      'Combine AsyncStorage/sessionStorage thoughtfully on RN vs web nuances.',
    ],
    [
      "persistQueryClient({ queryClient, persister });",
      "const swrConfig = { dedupingInterval: 4000 };",
      "self.addEventListener('fetch', (event) => { /* stale if error */ });",
      'localStorage quotas tiny—prefer IndexedDB for medium blobs.',
      '// Align queryKey with SSR dehydrated payload serialization',
    ],
    [
      [
        card(
          'Global cache bust on logout?',
          "Clear query caches and private service-worker data on logout.",
        ),
      ],
      [
        card(
          'Background sync abuse?',
          "Queued writes must be idempotent to avoid duplicate actions.",
        ),
      ],
      [
        card(
          'Why avoid caching GraphQL arbitrarily?',
          "Many variable combinations create too many cache entries.",
        ),
      ],
      [
        card(
          'IndexedDB deadlock symptom?',
          "Open transactions can stall later reads or writes.",
        ),
      ],
      [
        card(
          'Feature flag interplay?',
          "Stale cached flags can hide or show the wrong experience.",
        ),
      ],
    ],
  );

  const dbIndexing = mk('Database Indexing', 'perf', null, {
    definition:
      'Indexes accelerate lookups by structuring ordered btree (classically) replicas sorted columns enabling seek rather than sequential scans composites combine columns left-prefix rules apply covering indexes answered purely from leaf pages cost write amplification concurrency locks.',
    codeExample:
      'CREATE INDEX CONCURRENTLY idx_orders_user_created ON orders (user_id, created_at DESC);\nEXPLAIN ANALYZE SELECT …;\n',
    whenUsed:
      'Optimising transactional Mongo/MySQL workloads similar to MongoDB/MySQL optimisation from `p-stock` experiences.',
    gotchas:
      'Over-indexing hurts writes hot index contends vacuum/fragmentation interplay misordered composite indexes negate benefits.',
    flashcards: [
      card(
        'Left-prefix composite rule?', 
      "A composite index works best when queries use its leading columns.",
      ),
      card(
        'Covering index meaning?',
      "The index contains all columns needed to answer the query.",
      ),
      card(
        'Tradeoff write amplification?',
      "Each extra index makes writes more expensive.",
      ),
      card(
        'Partial index benefit?',
      "It indexes only matching rows, making hot queries smaller and faster.",
      ),
      card(
        'Why `EXPLAIN (ANALYZE, BUFFERS)` priceless?',
      "It shows real execution time and buffer usage.",
      ),
      card(
        'Mongo `_id` default index implications?',
      "Every collection has it, so design other indexes and shards around it.",
      ),
      card(
        'Index-only scan vs sequential?',
      "The planner chooses based on cost and statistics.",
      ),
      card(
        'B-tree vs hash index - which is more general purpose?',
      "B-tree supports equality, ranges, sorting, and prefixes; hash is mainly equality.",
      ),
    ],
    apis: [
      api(
        'CREATE INDEX Postgres',
      'CREATE INDEX CONCURRENTLY idx ON t (lower(email));',
      'Builds btree without prolonged write locking when concurrent variant used.',
      'columns/expressions predicates',
      'DDL side effect',
      'CREATE UNIQUE INDEX ux ON carts(user_id) WHERE active;',
      `Expression indexes require matching query predicates exactly`,
      ),
      api(
        'EXPLAIN ANALYZE',
      'EXPLAIN ANALYZE SELECT …',
      'Executes showing planner vs actual timings row estimates.',
      'SQL statement',
      'plan tree text/json',
      'EXPLAIN (ANALYZE, COSTS OFF) SELECT …',
      'Production caution: ANALYZE runs query—prefer safe statements/staging snapshots.',
      ),
      api(
        'Mongo explain',
      'db.orders.find({ userId }).explain("executionStats")',
      'Shows winning plan index usage counts.',
      'filter document',
      'stats object',
      "db.orders.createIndex({ userId:1, ts:-1 });",
      'Covered queries flagged via `stage`/`indexOnly` inspect carefully version-specific fields.',
      ),
      api(
        'Mongo createIndex',
      'db.orders.createIndex({ symbol: 1, ts: -1 }, { name: "sym_ts" });',
      'Adds secondary index asynchronously depending on foreground flag.',
      'keys + optional options document',
      'index name acknowledgement',
      "db.orders.createIndex({ user:1},{unique:true});",
      'foreground builds block writers—coordinate maintenance windows.',
      ),
    ],
    refs: [
      ref('PostgreSQL indexes', 'https://www.postgresql.org/docs/current/indexes.html'),
      ref('Use the index, Luke', 'https://use-the-index-luke.com/'),
      ref('MongoDB indexing strategies', 'https://www.mongodb.com/docs/manual/indexes/'),
      ref('MySQL EXPLAIN reference', 'https://dev.mysql.com/doc/refman/8.0/en/explain-output.html'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(dbIndexing);
  pushSubs(
    skills,
    dbIndexing,
      [
        'B-tree mechanics',
      'Composite design',
      'Covering queries',
      'Write cost awareness',
      'Planner literacy',
      ],
      [
      'Seek vs scan intuition anchors understanding.',
      'Order columns selective leading high cardinality predicates first tempered by sorts.',
      'INCLUDE columns (Postgres flavour) widen covering without messing key order unnecessarily.',
      'Batch index builds monitor replication lag mongo secondaries catching up.',
      'Autoexplain slow logs plus pg_stat_* dashboards continuous.',
      ],
      [
      'SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan ASC LIMIT 20;',
      "db.col.getIndexes()",
      'CREATE INDEX BRIN on huge append-only timestamps when linear correlation strong',
      '// Drop unused indexes post measurement window',
      "SET enable_seqscan=off ONLY in dev experiments—never blindly prod",
      ],
    [
      [
        card(
          'Correlation vs independence assumption?',
          "Bad or stale stats can make the planner choose the wrong index.",
        ),
      ],
      [
        card(
          'Index merge vs composite?',
          "A good composite index is often faster than merging single-column indexes.",
        ),
      ],
      [
        card(
          'Partial unique constraints?',
          "They enforce uniqueness only for rows matching a condition.",
        ),
      ],
      [
        card(
          'Read replica staleness interplay?',
          "Indexes speed reads, but replicas can still lag behind writes.",
        ),
      ],
      [
        card(
          'Mongo compound shard key caveat?',
          "Monotonic keys can overload one shard.",
        ),
      ],
    ],
  );

  const memoryLeaks = mk('Memory Leaks', 'perf', null, {
    definition:
      'Memory leaks arise when unintentional references keep unreachable-to-developer graphs alive preventing GC shrinking heap—common JS/RN pitfalls include uncleared timers listeners closures capturing DOM/native modules stray global caches.',
    codeExample:
      "useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);\n",
    whenUsed:
      'Long-lived dashboards WebViews native bridges infinite scroll lists accumulating detached subtrees Redux devtools bridging.',
    gotchas:
      'React strict dev double-mount surfaces effect cleanup regressions closures capturing ever-growing caches Hermes profiler differs subtlety Chrome.',
    flashcards: [
      card(
      'Classic `setInterval` leak symptom?',
      "CPU and memory keep rising after leaving the screen.",
      ),
      card(
      'Why Detached DOM nodes linger?',
      "JavaScript references still point to removed nodes.",
      ),
      card(
      'EventTarget listener leak?',
      "Listeners on global targets must be removed with the matching handler/options.",
      ),
      card(
      'WeakRef pattern role?',
      "It lets cache metadata avoid keeping the main object alive.",
      ),
      card(
      'React effect missing deps phantom?',
      "Stale closures can look like leaks or hide real cleanup bugs.",
      ),
      card(
      'Subscription leak in Redux?',
      "Forgotten unsubscribe calls leave duplicate listeners active.",
      ),
      card(
      'Native module bridging?',
      "React Native event listeners must be removed on unmount.",
      ),
      card(
      'Heap snapshot interpretation?',
      "Compare snapshots after forced GC to separate leaks from intentional cache growth.",
      ),
    ],
    apis: [
      api(
      'AbortController',
      'const ctl = new AbortController(); fetch(url,{ signal: ctl.signal })',
      'Central cancel pattern tied to DOM/React cleanups cancelling inflight fetch streams.',
      'none',
      'controller object',
      "useEffect(()=>{ ctl.abort(); },[])",
      `Must pass same signal everywhere listeners respect cancellation`,
      ),
      api(
      'WeakMap',
      'new WeakMap() keys objects only non-enumerable avoids global string registry leaks.',
      'object keys ephemeral',
      'weak map reference',
      "cache.set(component, metrics); ",
      `Not iterable—cannot introspect membership lists`,
      ),
      api(
      'FinalizationRegistry',
      'new FinalizationRegistry(cb).register(obj,heldValue)',
      'Observes eventual GC—for diagnostics not primary resource release.',
      'weak cleanup callback',
      'registry instance',
      "registry.register(sensor, sensor.id); ",
      `Do not rely timing guarantees—explicit dispose still safest`,
      ),
    ],
    refs: [
      ref('Chrome DevTools heap profiling', 'https://developer.chrome.com/docs/devtools/memory-problems'),
      ref('Firefox memory tooling', 'https://firefox-source-docs.mozilla.org/devtools-memory/index.html'),
      ref('Hermes profiling RN', 'https://reactnative.dev/docs/hermes-engine'),
      ref('WeakRef MDN', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef'),
    ],
    relatedProjectIds: [],
  });
  skills.push(memoryLeaks);
  pushSubs(
    skills,
    memoryLeaks,
      [
      'Timer & listener hygiene',
      'Closure capture audits',
      'Detached DOM/native retention',
      'Heap snapshot workflows',
      'Weak collections patterns',
      ],
      [
      'Always pair registrations with symmetrical teardown in effects.',
      'Boundaries between module singletons versus per-instance caches explicit.',
      'Compare heap delta after forcing navigation loops.',
      'Three snapshot technique pinpoint growing constructor names.',
      'WeakMap can store metadata for DOM nodes without preventing those nodes from being garbage-collected.',
      ],
      [
      `addEventListener('scroll', onScroll, { passive:true }); … remove duplicate options object reuse`,
      "const refs = useRef<Map<string,Node>>(new Map()); refs.current.clear();",
      'performance.measure memory // experimental — pair with profiler',
      "import { GarbageCollectionTracer } ... // profiling integration depends on tooling",
      'Hermes Sampling Profiler timeline spikes native modules bridging',
      ],
    [
      [
        card(
        'IntersectionObserver leaked?',
        "Call `disconnect()` when the observer is no longer needed.",
        ),
      ],
      [
        card(
        'Global `window.__DATA` hoarding?',
        "Large debug globals can keep whole sessions in memory.",
        ),
      ],
      [
        card(
        'Redux selectors recompute hoard?',
        "Unbounded selector caches should be limited or expired.",
        ),
      ],
      [
        card(
        'WebSocket silent leak?',
        "Close sockets on logout, unmount, or route change.",
        ),
      ],
      [
        card(
        'Profiling noise from devtools?',
        "Extensions and tooling can add memory that is not from your app.",
        ),
      ],
      [
        card(
          'Why avoid capturing entire state in closures?',
          "The closure keeps that whole state object alive.",
        ),
      ],
    ],
  );

  const profilingTools = mk('Profiling Tools', 'perf', null, {
    definition:
      'Profiling couples browser runtime tracers sampling profilers allocating timeline visualisations React Profiler flame charts lighthouse audits clinic.js node inspectors Hermes bridging—goal translate signals into prioritized fixes verifying regressions objectively.',
    codeExample:
      "node --inspect server.js\n// Chrome open chrome://inspect\n",
    whenUsed:
      'Any perf initiative baseline before memoization infra upgrades bundler experiments.',
    gotchas:
      'Observer effect overhead distorts timings production builds differ drastic dev profiler throttling hides issues.',
    flashcards: [
      card(
      'Main thread vs worker profiling?',
      "Workers move work off the main thread, but still need separate profiling.",
      ),
      card(
      'Flame chart reading tip?',
      "Focus on the widest blocks; width means time.",
      ),
      card(
      'React Profiler “actual duration”?',
      "Time React spent rendering that update.",
      ),
      card(
      'Lighthouse variability causes?',
      "Throttling, network simulation, ads, and randomness can change scores.",
      ),
      card(
      'Node `--inspect` heap snapshot caution?',
      "Heap snapshots can pause the process.",
      ),
      card(
      'clinic.js flame value?',
      "It highlights expensive Node.js event-loop and CPU work.",
      ),
      card(
      'Why disable extensions profiling?',
      "Extension scripts can appear in traces and hide app costs.",
      ),
      card(
      'Hermes Sampling vs timeline?',
      "Timeline shows stalls; sampling shows hot JavaScript functions.",
      ),
    ],
    apis: [
      api(
      'performance.mark/measure',
      "performance.mark('start'); … performance.measure('task','start'); ",
      'User timing API integrates DevTools Tracks custom spans lightweight.',
      'mark names strings optional detail object',
      'measure entries accessible performance.getEntriesByName',
      "performance.measure('route',undefined,markerStart)",
      `Over-marking floods timeline—budget meaningful checkpoints`,
      ),
      api(
      'React Profiler API',
      "<Profiler id='list' onRender={log}>…",
      'Programmatic flame commit logging integrated with CI?',
      `id plus onCommit callback receives phase actualDuration`,
      '`void` (side effect)',
      `<Profiler id='App' onRender={(id,phase,ad)=>hooks(id,phase,ad)}>`,
      'Adds minor overhead acceptable for intermittent diagnostics—not constant prod logging unsampled.',
      ),
      api(
      'Chrome DevTools performance.record',
      'DevTools › Performance › Record ⌘+E',
      'Manual timeline capture with screenshots stack samples Main thread.',
      'interactive UI gestures',
      'trace json export optional',
      'Enable Web Vitals lanes in latest Canary builds optionally',
      'Large traces hard to diff—narrow capture window targeted interactions.',
      ),
      api(
      'Lighthouse CI',
      'lhci autorun',
      'Headless scripted audits enforcing budgets pipelines.',
      'config file thresholds',
      'assertion pass/fail',
      'npm install -g @lhci/cli',
      `Lab scores ≠ CrUX—but catch obvious regressions early`,
      ),
    ],
    refs: [
      ref('Chrome DevTools Performance', 'https://developer.chrome.com/docs/devtools/performance'),
      ref('React Profiler', 'https://react.dev/reference/react/Profiler'),
      ref('Lighthouse documentation', 'https://developer.chrome.com/docs/lighthouse/overview'),
      ref('Clinic.js', 'https://clinicjs.org/'),
    ],
    relatedProjectIds: [],
  });
  skills.push(profilingTools);
  pushSubs(
    skills,
    profilingTools,
      [
      'Chrome timeline literacy',
      'React commit inspection',
      'Lighthouse budgeting',
      'Hermes/native angles',
      'Node server profiling',
      ],
      [
      'Slice timeline by user story not entire minute noise.',
      'Highlight recurring commit storms after state churn.',
      'Track metrics JSON in CI artefacts graph historical bundle regressions correlate.',
      'Symbolicate RN traces release builds zipped sourcemaps securely.',
      'Use isolates CPU profiles when diagnosing SSR CPU hotspots.',
      ],
      [
      "chrome://tracing import JSON — advanced cross tooling",
      "importprofiler from '@sentry/react' // integrates with timelines",
      '.lighthouseci/assertion-results.json thresholds gating merges',
      "npx react-native profile-devtools ./trace.cpuprofile",
      'clinic doctor -- node server.js captures event loop diagnoses',
      ],
    [
      [
        card(
        'Why sample rate production traces?',
        "Full tracing for every user is costly and can hurt performance.",
        ),
      ],
      [
        card(
        'Dev throttling unrealistic?',
      "It is imperfect, but still helps approximate slower devices.",
        ),
      ],
      [
        card(
        'Ignore idle synthetic tasks?',
      "Confirm they match visible jank before treating them as bugs.",
        ),
      ],
      [
        card(
      'profiler onRender misuse?',
      "Logging large data on every commit can create the slowdown.",
      ),
      ],
      [
        card(
        'Safari profiler differences?',
        "Browser profilers differ, so verify important findings across browsers.",
      ),
      ],
      [
      card(
        'Source map security?',
        "Upload source maps privately because public maps can leak source code.",
      ),
      ],
    ],
  );

  const imageOptimization = mk('Image Optimization', 'perf', null, {
    definition:
      'Optimising imagery cuts LCP/CLS via modern codecs responsive delivery CDN transforms explicit dimensions priority hints placeholders progressive decoding bundler-assisted components (`next/image` `expo-image`) balancing quality vs bytes.',
    codeExample:
      "<picture>\n  <source srcset='/hero.avif' type='image/avif'/>\n  <img src='/hero.webp' alt='showcase' width='1600' height='900'/>\n</picture>\n",
    whenUsed:
      'Marketing pages mobile RN media feeds (`p-maak`, `p-packarma` calibre apps) immersive scroll galleries.',
    gotchas:
      'Art direction vs resolution switching confused; remote URI allowlists block Next optimizer; blurred placeholders increase decode cost if oversized.',
    flashcards: [
      card(
      'AVIF vs WebP trade?',
      "AVIF is often smaller; WebP is usually faster and safer as fallback.",
      ),
      card(
      'Why `sizes` attribute matters?',
      "It helps the browser choose the right image width.",
      ),
      card(
      'CDN image resizing params?',
      "Resize at the edge so mobile users do not download huge originals.",
      ),
      card(
      'Aspect ratio CLS tie-in?',
      "A fixed ratio reserves image space before it loads.",
      ),
      card(
      'Priority hints interplay?',
      "Only the key LCP image should get high priority.",
      ),
      card(
      'Decode=async tradeoff?',
      "It reduces main-thread blocking but can delay final paint.",
      ),
      card(
      'RN `expo-image` benefit?',
      "It adds native caching, placeholders, and efficient decoding.",
      ),
      card(
      'Vector vs raster choice?',
      "Use SVG for simple logos/icons and raster formats for photos.",
      ),
    ],
    apis: [
      api(
      '<picture>',
      '<picture><source srcSet type/></picture>',
      'Art direction + progressive fallback chain by MIME capable browsers.',
      'source elements + img fallback',
      'rendered image box',
      "<source media='(max-width:600px)' srcSet='small.avif'/>",
      'Define final `<img>` alt for a11y—sources alone incomplete.',
      ),
      api(
      'srcset/sizes',
      'srcset="img-400.webp 400w, img-800.webp 800w" sizes="(max-width:600px) 100vw, 50vw"',
      'Responsive density aware selection algorithm.',
      'descriptor list + layout hints',
      'browser-chosen URL',
      '<img srcset="…" sizes="…" />',
      'Omitting sizes overserves wide assets defaulting to 100vw assumption.',
      ),
      api(
      'next/image',
      "<Image src='/hero.jpg' width={1200} height={630} priority placeholder='blur' />",
      'Wraps responsive loader optimiser srcset generation edge caching.',
      'props: src width height fill priority placeholder loader',
      'React element',
      "<Image src={url} alt='' sizes='(max-width:768px) 100vw, 50vw' />",
      'Remote patterns must be allowlisted in `next.config.js`.',
      ),
      api(
      'expo-image',
      "<Image source={{ uri }} contentFit='cover' transition={200} cachePolicy='memory-disk' />",
      'Cross-platform tuned image pipeline disk caching blur placeholders.',
      'source object + cachePolicy + placeholder',
      'native view',
      "<Image placeholder={blurhash} />",
      'Large remote lists still need recycling list discipline.',
      ),
    ],
    refs: [
      ref('web.dev image CDNs', 'https://web.dev/articles/image-cdns'),
      ref('MDN responsive images', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images'),
      ref('Next.js Image', 'https://nextjs.org/docs/app/api-reference/components/image'),
      ref('expo-image docs', 'https://docs.expo.dev/versions/latest/sdk/image/'),
    ],
    relatedProjectIds: ['p-maak', 'p-packarma'],
  });
  skills.push(imageOptimization);
  pushSubs(
    skills,
    imageOptimization,
      [
      'Modern codecs & fallbacks',
      'Responsive delivery',
      'CDN transforms',
      'CLS discipline',
      'Framework helpers',
      ],
      [
      'Layer `<picture>` when art direction not just DPR.',
      'Pair `sizes` with layout breakpoints actually coded in CSS.',
      'Signed transform URLs guard abuse.',
      'Skeleton + ratio reserve space before fetch completes.',
      'Framework components automate but still require conscious `priority` usage.',
      ],
      [
      "sharp(input).avif({ quality: 50 }) // build-time pipeline",
      'srcset="photo-800.jpg 800w, photo-1200.jpg 1200w"',
      'https://res.cloudinary.com/demo/image/upload/w_600,q_auto,f_auto/sample.jpg',
      '.hero { aspect-ratio: 16 / 9; }',
      '<Image fill className="object-cover" sizes="100vw" />',
      ],
    [
      [
        card(
        'Double downloading picture bug?',
        "Wrong `type` or source setup can make browsers fetch fallback too.",
        ),
      ],
      [
        card(
        'HDR wide-gamut delivery?',
        "Color support varies, so test on real target browsers.",
        ),
      ],
      [
        card(
        'GPU memory blowups?',
        "Huge decoded images can crash lists; downsample to display size.",
        ),
      ],
      [
        card(
        'Third-party stock CDN latency?',
        "Measure it; third-party image CDNs are not always faster.",
        ),
      ],
      [
        card(
        'Accessible alt vs decorative?',
        "Use empty alt only for images with no meaning.",
        ),
      ],
    ],
  );

  const networkPerformance = mk('Network Performance', 'perf', null, {
    notes:
      'HTTP semantics & CDN architecture live under Internet & Networking; here we stress measured impact: multiplex savings, QUIC wins, resource hints, compression, TLS resumption—link back rather than re-teach wire formats.',
    definition:
      'Network performance engineering tightens critical path through fewer round trips smarter caching layers efficient compression modern HTTP features resource hints connection warming—always validate with RUM because synthetic lab bandwidth idealised.',
    codeExample:
      '<link rel="preconnect" href="https://api.example" crossorigin />\n<link rel="dns-prefetch" href="https://widgets.cdn" />\n',
    whenUsed:
      'Tuning API adjacency for trading dashboards shipping global marketing pages reducing third-party latency.',
    gotchas:
      'Over-preconnect saturates socket limits counterproductive; brotli dynamic CPU cost on low-end devices; 0-RTT unsafe for non-idempotent endpoints.',
    flashcards: [
      card(
      'HTTP/2 multiplex practical limit?',
      "One large stream can still compete with others on the same connection.",
      ),
      card(
      'HTTP/3 user-visible win often?',
      "It often helps on lossy mobile networks and connection changes.",
      ),
      card(
      'Preload vs preconnect ordering?',
      "Preconnect the origin early, then preload the critical asset.",
      ),
      card(
      'Brotli vs gzip tradeoff?',
      "Brotli is smaller, but precompress it to avoid runtime CPU cost.",
      ),
      card(
      'TLS session resumption benefit?',
      "It saves round trips on repeat connections.",
      ),
      card(
      'Why limit concurrent preconnects?',
      "Too many preconnects waste sockets and network setup work.",
      ),
      card(
      'Server push replacement mindset?',
      "Use preload or 103 Early Hints instead of HTTP/2 push.",
      ),
      card(
      'Third-party script `async` vs `defer`?',
      "`async` runs when ready; `defer` runs after parsing in order.",
      ),
    ],
    apis: [
      api(
      'rel=preload',
      '<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>',
      'High-priority early fetch for critical assets discovered late in HTML.',
      'href as type crossorigin',
      'browser fetch scheduler hint',
      '<link rel="modulepreload" href="/app.js">',
      'Incorrect `as` mis-prioritises—validate console warnings.',
      ),
      api(
      'rel=prefetch',
      '<link rel="prefetch" href="/next">',
      'Low priority speculative navigation warm-up next route.',
      'href',
      'optional future navigation',
      '<link rel="prefetch" as="script" href="/chunk.js">',
      'Abuse harms metered users—gate via Network Information API respectfully.',
      ),
      api(
      'dns-prefetch',
      '<link rel="dns-prefetch" href="//widgets.example">',
      'Early DNS only—lighter than full preconnect.',
      'origin host',
      'DNS cache warm',
      '<meta http-equiv="x-dns-prefetch-control" content="on">',
      `Privacy implication on hidden origins—coordinate policy`,
      ),
      api(
      'preconnect',
      '<link rel="preconnect" href="https://api" crossorigin>',
      'Opens connection early DNS+TCP+TLS where applicable shaving critical chain.',
      `href crossorigin credential policy`,
      'socket preparation',
      '<link rel="preconnect" href="https://images.example" />',
      'Too many saturate global 6-connection limits legacy HTTP/1.1—less issue HTTP/2/3 yet still mindfulness.',
      ),
      api(
      'fetchpriority (img/link)',
      '<img fetchpriority="high" />',
      'Hints LCP boosting coordination among competing downloads.',
      'high|low|auto',
      'priority bias',
      '<link rel=preload fetchpriority="high"/>',
      'Only one-two highs per viewport else hints meaningless.',
      ),
    ],
    refs: [
      ref('Priority Hints (Chrome blog)', 'https://developer.chrome.com/blog/priority-hints'),
      ref('MDN `<link>` (preload/prefetch)', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link'),
      ref('web.dev — Learn Performance', 'https://web.dev/learn/performance/'),
      ref('web.dev — HTTP/2 primer', 'https://web.dev/articles/performance-http2'),
    ],
    relatedProjectIds: [],
  });
  skills.push(networkPerformance);
  pushSubs(
    skills,
    networkPerformance,
    [
      'Multiplex payoff (HTTP/2)',
      'QUIC uplift lens',
      'Resource hints & Early Hints',
      'Compression posture',
      'TLS amortisation tie-in',
    ],
    [
      'Multiplex trims connection setup waterfalls but doesn’t shrink JS parse CPU—profile both.',
      'QUIC shines on flaky networks—confirm with field data when UDP/path is healthy.',
      'Open `preconnect` before emitting high-priority `preload`/`modulepreload`.',
      'Ship precompressed brotli for static bundles; gzip as baseline fallback.',
      'TLS resumption trims repeat TTFB (see Internet → TLS)—watch ticket rotation regressions.',
    ],
    [
      '<link rel="preconnect" href="https://api" crossorigin />',
      '// Compare CrUX p75 mobile vs desktop separately post-HTTP/3 rollout.',
      '// HTTP 103 Early Hints + LINK preload — verify CDN support.',
      'brotli -q 11 -o bundle.js.br bundle.js && content-encoding negotiation',
      '// 0-RTT risky for mutations — constrain to cacheable warmup requests.',
    ],
    [
      [
        card(
          'Why fewer connections can still saturate?',
          "A shared connection can still be dominated by one large transfer.",
        ),
      ],
      [
        card(
          'prefetch etiquette on constrained devices?',
          "Avoid speculative downloads when Save-Data or poor networks are present.",
        ),
      ],
      [
        card(
          'Early Hints failure mode?',
          "Some intermediaries strip 103 hints, so keep normal fallbacks.",
        ),
      ],
      [
        card(
          'When is gzip preferable to brotli at runtime?',
          "For tiny assets or CPU-bound origins, gzip may be cheaper.",
        ),
      ],
      [
        card(
          'Connect to “too many” origins?',
          "Each origin adds DNS, TLS, and connection overhead.",
        ),
      ],
    ],
  );

  return skills;
}

