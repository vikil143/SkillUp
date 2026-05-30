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
        'When parent re-renders frequently yet props stay shallow-equal—otherwise comparison tax exceeds saved work.',
      ),
      card(
        'Why can `useCallback` backfire?',
        'If dependencies churn every render you rebuild callbacks anyway—stabilize upstream data or drop the hook.',
      ),
      card(
        'What does `useDeferredValue` trade?',
        'Defers expensive UI to keep input snappy—may show slightly stale visual until React catches up.',
      ),
      card(
        'Profiler “commit” meaning?',
        'DOM/React Native host updates applied for subtree—long commits correlate with jank risk.',
      ),
      card(
        'Why virtualization beats pure memo on giant lists?',
        'Memo still walks virtual DOM for off-screen rows; virtualization caps mounted nodes + layout thrash.',
      ),
      card(
        'Context performance smell?',
        'Single mega-context mixing volatile + stable values forces needless consumer re-renders—split contexts or selectors.',
      ),
      card(
        'How does `startTransition` differ from raw `setState`?',
        'Marks updates interruptible yielding to urgent interactions—ideal for expensive non-blocking visual refreshes.',
      ),
      card(
        'Concurrent double render in dev?',
        'Strict mode intentionally duplicates renders to expose impure effects—measure prod builds for real timing.',
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
          'HOC wrappers or suspense fallbacks inflate component names—normalize before blaming leaf nodes.',
        ),
      ],
      [
        card(
          'useMemo dependency array traps?',
          'Objects created in render unless wrapped still renew each pass—flatten or lift stable references.',
        ),
      ],
      [
        card(
          'FlashList vs legacy lists RN?',
          'Recycler views estimate sizes—wrong estimates cause scroll jank; measure carefully.',
        ),
      ],
      [
        card(
          'Suspense without route boundary?',
          'Micro boundaries increase waterfall risk—group related lazy imports above fold intentionally.',
        ),
      ],
      [
        card(
          'startTransition on every keystroke?',
          'Still schedules work—pair with input debouncing for network backed search fields.',
        ),
      ],
      [
        card(
          'Why avoid anonymous inline components in lists?',
          'They remount every parent render destroying internal state and killing memoization.',
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
        'INP captures slowest meaningful interaction latency across entire visit—not merely first input delay snapshot.',
      ),
      card(
        'LCP element typical culprits?',
        'Hero image/video poster, oversized text blocks, background images without priority hints.',
      ),
      card(
        'CLS formula intuition?',
        'Sum impact fraction × distance fraction for unexpected shifts between frames.',
      ),
      card(
        'Why prefer field data over synthetic lab for ranking guardrails?',
        'Search ranking signals emphasise real users on diverse networks/devices not dev laptop Wi-Fi.',
      ),
      card(
        'TTFB vs LCP relationship?',
        'Great TTFB still fails LCP when client renders huge JS before painting hero.',
      ),
      card(
        'What is “good” INP threshold ballpark?',
        'Google currently cites ≤200ms as good at 75th percentile—treat docs as evolving and confirm current guidance.',
      ),
      card(
        'How does soft navigation affect Vitals?',
        'SPA transitions may need `web-vitals` soft-nav builds or router instrumentation—default navigation timing alone incomplete.',
      ),
      card(
        'Why log attribution on INP?',
        'Identify event type + long task culprit + script origin to prioritise fixes vs guessing.',
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
          'Soft navigations need explicit router hooks or Performance API longtask pairing.',
        ),
      ],
      [
        card(
          'How do iframes pollute CLS?',
          'Embedded ads without reserved space shift parent layout—sandbox dimensions contractually.',
        ),
      ],
      [
        card(
          'Can optimistic UI harm INP?',
          'If optimistic transitions still block main thread with huge DOM writes INP still suffers.',
        ),
      ],
      [
        card(
          'CrUX vs RUM sampling bias?',
          'Chrome-only field data plus opt-in population—complement with first-party beacons.',
        ),
      ],
      [
        card(
          'Why log deviceMemory / connection?',
          'Segment vitals by hardware class to avoid mis-prioritising desktop-only fixes.',
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
        'ESM static imports + `sideEffects: false` honest package.json + bundler scope analysis.',
      ),
      card(
        'Why analyse before splitting?',
        'Random dynamic imports fragment without reducing critical path—profile largest modules first.',
      ),
      card(
        'moment.js vs luxon/dayjs lesson?',
        'Locale packs explode bundles—prefer modular date libs or explicit locale imports.',
      ),
      card(
        'How does browserslist influence bundle size?',
        'Modern targets skip legacy polyfills transforms shrinking helper injections.',
      ),
      card(
        'Why dedupe matters in monorepos?',
        'Two React copies balloon hook state weirdness and double framework tax.',
      ),
      card(
        'What is “package import” linting value?',
        'Forces explicit import paths preventing accidental kitchen-sink imports.',
      ),
      card(
        'Server components / RSC impact?',
        'Moves logic server-side trimming client graph—still watch server bundle cost.',
      ),
      card(
        'When does manual chunking beat defaults?',
        'Vendor stability vs app volatility differs—separating rarely changing libs improves long-term caching.',
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
          '`export *` re-exports drag entire package surface into graph—split entry points.',
        ),
      ],
      [
        card(
          'Dynamic import inside loop hazard?',
          'Parallel chunk storms—batch or prefetch consciously.',
        ),
      ],
      [
        card(
          'Why gzip size still matters?',
          'Transfer shrinks but parse/compile still follows raw module count—watch both.',
        ),
      ],
      [
        card(
          'Dual package hazard?',
          'CJS+ESM duplicates can ship both forms—verify resolution in bundler stats.',
        ),
      ],
      [
        card(
          'Manual chunk `react` separate always good?',
          'If app updates often separate vendor chunk may churn less than naively assumed—simulate caching.',
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
        'Placeholder sizing prevents CLS while deferring decode network until proximity.',
      ),
      card(
        'IntersectionObserver thresholds tuning?',
        'Too-early prefetch wastes bandwidth—too-late defeats purpose; align rootMargin with UX.',
      ),
      card(
        'React.lazy vs route-level split?',
        'Route-level lumps related UI—component-level trims further but raises Suspense granularity costs.',
      ),
      card(
        'Prefetch vs preload subtlety?',
        'Prefetch lower priority speculative fetch preload critical soon-used resources.',
      ),
      card(
        '`fetchpriority` high when?',
        'Only for decisive LCP resources—spamming highs starves competing assets.',
      ),
      card(
        'Below-the-fold data fetching pattern?',
      'Defer with viewport hooks or prioritized queries after skeleton paint—avoid blocking hydration.',
      ),
      card(
        'Native module preload hook?',
      '`<link rel="modulepreload">` warms critical ESM graph—pair with router awareness.',
      ),
      card(
        'RN analogue?',
      '`FlatList` windowing plus lazy attachment of nested heavy cells mirrors web lazy philosophies.',
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
          'Delayed discovery postpones LCP hurting vitals—even if technically lazy capable.',
        ),
      ],
      [
        card(
          'Decode async tradeoff?',
          'Offloads main-thread decode latency but delays paint—coordinate with placeholders.',
        ),
      ],
      [
        card(
          'Too many observers?',
          'Reuse single observer multiplexing tracked elements not per-pixel observers.',
        ),
      ],
      [
        card(
          'Prefetch on metered networks?',
          'Respect Save-Data and connectionSaveData hints—ethical bandwidth stewardship.',
        ),
      ],
      [
        card(
          'Suspense fallbacks CLS risk?',
          'Jumping shimmer heights shift layout—lock minimum heights.',
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
      'Serve cached snapshot immediately enqueue background refresh marrying snappy UX with eventual correctness.',
      ),
      card(
        'cache-first vs network-first picking?',
      'Read-heavy dashboards vs financial authorisation mutations—choose policy per endpoint domain split.',
      ),
      card(
        'Why normalised entity stores?',
      'Avoid gigantic nested trees duplication causing broad invalidations hard partial updates.',
      ),
      card(
        'Service worker versioning mistake?',
      'Ship new SW without bumping hashed assets staleness indefinite—coordinate activation messaging.',
      ),
      card(
        'Mutations vs optimistic updates caveat?',
      'Rollback paths must reconcile server truth—observe conflict resolution UX.',
      ),
      card(
        'Memory caches vs IndexedDB?',
      'Memory fastest but ephemeral; IndexedDB survives reload but slower async API surface.',
      ),
      card(
        'Double fetching hydration?',
      'Server prefetched queries must hydrate client cache keyed identically avoiding duplicate waterfalls.',
      ),
      card(
        'Rate limit interplay?',
      `Background revalidation spikes can trip 429 — apply jitter backoff + global inflight guards`,
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
          'Hard reset query caches AND SW controlled pages to strip personalised entries.',
        ),
      ],
      [
        card(
          'Background sync abuse?',
          'Queues must idempotently reconcile—risk double posting payments.',
        ),
      ],
      [
        card(
          'Why avoid caching GraphQL arbitrarily?',
          `Variables explode cardinality—prefer normalized stores keyed by typename/id.`,
        ),
      ],
      [
        card(
          'IndexedDB deadlock symptom?',
          'Transactions left open stall writes—instrument open/complete handlers.',
        ),
      ],
      [
        card(
          'Feature flag interplay?',
          'Stale flags hide toggles—invalidate keyed segments on rollout completion.',
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
      'Filtering only trailing columns skips index—it must honour leading columns ordering.',
      ),
      card(
        'Covering index meaning?',
      'Index leaf contains projections answering query wholly avoiding heap/table lookups.',
      ),
      card(
        'Tradeoff write amplification?',
      'Every insert/update adjusts index pages plus WAL pressure—budget indexes narrowly.',
      ),
      card(
        'Partial index benefit?',
      'Indexes subset meeting predicate shrinking size speeding hot paths conditional uniqueness.',
      ),
      card(
        'Why `EXPLAIN (ANALYZE, BUFFERS)` priceless?',
      'Shows actual timings buffer hits—not just hypothetical planner guesses.',
      ),
      card(
        'Mongo `_id` default index implications?',
      'Always present—design shard keys interplay carefully for distribution.',
      ),
      card(
        'Index-only scan vs sequential?',
      'Planner picks cheaper path based on statistics—stale stats mis-fire.',
      ),
      card(
        'B-tree vs hash index - which is more general purpose?',
      'B-tree is the general-purpose default because it supports equality, range queries, ordering, and prefix-style access. Hash indexes are mainly for equality lookups and are less broadly useful.',
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
          'Planner cost estimates skew when column stats inaccurate—schedule ANALYZE.',
        ),
      ],
      [
        card(
          'Index merge vs composite?',
          'Multiple single-column indexes merging costlier often than purposeful composite.',
        ),
      ],
      [
        card(
          'Partial unique constraints?',
          'Perfect for soft-delete uniqueness where null rows excluded.',
        ),
      ],
      [
        card(
          'Read replica staleness interplay?',
          'Indexes help but replicas still lag—observe replication metrics when tuning.',
        ),
      ],
      [
        card(
          'Mongo compound shard key caveat?',
          'Hot shard on monotonic keys—hash/split patterns needed.',
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
      'CPU + heap creep after navigating away route—missing cleanup frees neither timers nor closures.',
      ),
      card(
      'Why Detached DOM nodes linger?',
      'JS references retained (arrays maps) keep layout trees pinned though visually removed.',
      ),
      card(
      'EventTarget listener leak?',
      'Global singleton DOM nodes need `.removeEventListener` mirror registration signature capture options object identity.',
      ),
      card(
      'WeakRef pattern role?',
      'Hold auxiliary caches that should not prolong primary object lifetime—paired with cleanup finalizers cautiously.',
      ),
      card(
      'React effect missing deps phantom?',
      'Stale closures masking leak vs logic bug—use eslint exhaustive deps thoughtfully.',
      ),
      card(
      'Subscription leak in Redux?',
      'Store.subscribe without teardown on unmount floods listeners duplication.',
      ),
      card(
      'Native module bridging?',
      'RN event emitter listeners accumulate if components remount aggressively—unregister on teardown.',
      ),
      card(
      'Heap snapshot interpretation?',
      'Compare before/after forcing GC distinguishing true leak versus intentional cache growth.',
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
        'Forgotten `.disconnect()` when deps change—reuse observer multiplex targets.',
        ),
      ],
      [
        card(
        'Global `window.__DATA` hoarding?',
        'Debug dumps left shipped leak entire sessions across SPA navigations.',
        ),
      ],
      [
        card(
        'Redux selectors recompute hoard?',
        `Reselect caches unbounded nested maps—expire intentionally`,
        ),
      ],
      [
        card(
        'WebSocket silent leak?',
        'Open connections keep buffers—close on logout route change.',
        ),
      ],
      [
        card(
        'Profiling noise from devtools?',
        'Heap snapshots inflate when extensions inject scripts—clean profile.',
        ),
      ],
      [
        card(
          'Why avoid capturing entire state in closures?',
          'Huge snapshots stick around until closure dies—narrow captured fields.',
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
      'Heavy web workers offload CPU—but profile them separately—they still cost battery.',
      ),
      card(
      'Flame chart reading tip?',
      'Width shows time—not depth alone—widest stacks deserve first scepticism.',
      ),
      card(
      'React Profiler “actual duration”?',
      'Time spent this commit not including suspense waiting children—paired with subtree flags.',
      ),
      card(
      'Lighthouse variability causes?',
      'CPU throttling network simulation nondeterministic ads—capture multiple median runs.',
      ),
      card(
      'Node `--inspect` heap snapshot caution?',
      'Pauses prod unless isolated—prefer diagnostic containers traffic mirrored.',
      ),
      card(
      'clinic.js flame value?',
      'Auto-suggests hotspots in Node event loop heavy stacks—different lens than browser.',
      ),
      card(
      'Why disable extensions profiling?',
      'Injected content scripts overshadow app flame charts massively.',
      ),
      card(
      'Hermes Sampling vs timeline?',
      'Different granularity—timeline good for stalls sampling for JS hotspots.',
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
        'Full fidelity always logging explodes infra cost biases perf itself.',
        ),
      ],
      [
        card(
        'Dev throttling unrealistic?',
      'Tune CPU 4× slowdown mobile profile still cooler than dusty Android Go devices—but better than none.',
        ),
      ],
      [
        card(
        'Ignore idle synthetic tasks?',
      'Often timer coalescence—confirm correlation with visible jank recordings.',
        ),
      ],
      [
        card(
      'profiler onRender misuse?',
      'Logging huge props arrays each commit kills perf—narrow payload.',
      ),
      ],
      [
        card(
        'Safari profiler differences?',
        'Instrumentation hooks differ subtle—cross-browser verify hotspots.',
      ),
      ],
      [
      card(
        'Source map security?',
        `Upload privately never expose publicly—may leak IP`,
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
      `AVIF often smaller but slower encode/decode on low-end GPUs—fallback stack critical`,
      ),
      card(
      'Why `sizes` attribute matters?',
      'Guides SRCSET selection widths reducing overserving huge retina assets to tiny CSS boxes.',
      ),
      card(
      'CDN image resizing params?',
      'Edge transformations avoid shipping original 6000px master to mobile—but watch auth abuse.',
      ),
      card(
      'Aspect ratio CLS tie-in?',
      'Explicit width height or CSS aspect-ratio boxes reserve layout during decode.',
      ),
      card(
      'Priority hints interplay?',
      `Only one decisive LCP image should wield fetchpriority high per view`,
      ),
      card(
      'Decode=async tradeoff?',
      'Defers main-thread decode—good if placeholder stable else delayed LCP.',
      ),
      card(
      'RN `expo-image` benefit?',
      'Disk caching + blurhash integration + efficient native decoders—still mind remote allowlist.',
      ),
      card(
      'Vector vs raster choice?',
      'Icons/logos crisp via SVG simple shapes; photo textures via raster codecs.',
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
        'Incorrect `type` attributes cause fallback extra fetch—validate MIME coverage.',
        ),
      ],
      [
        card(
        'HDR wide-gamut delivery?',
        'Need colorspace metadata aware viewers—test iOS Safari vs Chrome differences.',
        ),
      ],
      [
        card(
        'GPU memory blowups?',
        'Massive decoded textures in RN lists crash—downsample to display pixel bounds.',
        ),
      ],
      [
        card(
        'Third-party stock CDN latency?',
        'Evaluate TTFB vs self-hosted optimised—marketing CDNs not always faster.',
        ),
      ],
      [
        card(
        'Accessible alt vs decorative?',
        'Empty alt only when truly decorative—don’t strip meaning chasing bytes.',
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
      'Still one congestion context per connection—large single-stream downloads can still starve without prioritization hints.',
      ),
      card(
      'HTTP/3 user-visible win often?',
      'Better lossy network behaviour + faster connection setup on mobile switching radios—field verify not assumed.',
      ),
      card(
      'Preload vs preconnect ordering?',
      'Preconnect early for critical origins before issuing high-priority preloads—sequencing matters in parser.',
      ),
      card(
      'Brotli vs gzip tradeoff?',
      'Brotli smaller text assets but slower compress CPU—precompress static at build time not per request hot path.',
      ),
      card(
      'TLS session resumption benefit?',
      'Skips full handshake RTT—ties back to TLS skill; watch session ticket rotation security.',
      ),
      card(
      'Why limit concurrent preconnects?',
      'Spec caps + socket churn—spamming wastes DNS/TCP budget.',
      ),
      card(
      'Server push replacement mindset?',
      'Prefer `preload`/`103 Early Hints` patterns—push largely retired.',
      ),
      card(
      'Third-party script `async` vs `defer`?',
      'Execution order + parser blocking differ—choose based on dependency graph.',
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
          'One TCP/ QUIC congestion window shared—elephant flows still starve multiplexed streams without priorities.',
        ),
      ],
      [
        card(
          'prefetch etiquette on constrained devices?',
          'Respect Save-Data and Network Information hints— speculative bytes cost real money.',
        ),
      ],
      [
        card(
          'Early Hints failure mode?',
          'If intermediary strips 103 hints, fall back to inlined critical CSS or SSR streaming.',
        ),
      ],
      [
        card(
          'When is gzip preferable to brotli at runtime?',
          'Tiny assets where compression CPU exceeds byte savings—or when origin CPU is bottlenecked.',
        ),
      ],
      [
        card(
          'Connect to “too many” origins?',
          'Each new origin retriggers DNS+TLS—even HTTP/3—budget third-party proliferation.',
        ),
      ],
    ],
  );

  return skills;
}

