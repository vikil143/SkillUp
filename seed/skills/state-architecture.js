// seed/skills/state-architecture.js — Redux, RTK, Context, Microfrontend, CDA, MVC, Monolithic, Monorepo
import { mk, uid } from '../helpers.js';

const card = (q, a) => ({ id: uid(), q, a });
const api = (name, signature, description, params, returns, example, gotchas) => ({
  id: uid(), name, signature, description, params, returns, example, gotchas,
});
const ref = (title, url) => ({ id: uid(), title, url });

export default function buildStateSkills() {
  const skills = [];

  // ─── MICROFRONTEND (zero to hero) ──────────────────────────────────────────
  const mfe = mk('Microfrontend', 'state', null, {
    definition:
      'Microfrontend architecture decomposes a frontend application into independently owned, built, and deployed units. Each unit is a self-contained app slice with its own tech stack, team, and release cycle. A shell app orchestrates routing and composes the slices at runtime. The pattern applies Conway\'s Law intentionally — team boundaries match product boundaries.',
    codeExample:
      "// webpack.config.js — Shell (host)\nconst { ModuleFederationPlugin } = require('webpack').container;\n\nmodule.exports = {\n  plugins: [\n    new ModuleFederationPlugin({\n      name: 'shell',\n      remotes: {\n        editor: 'editor@https://editor.example.com/remoteEntry.js',\n        dashboard: 'dashboard@https://dash.example.com/remoteEntry.js',\n      },\n      shared: { react: { singleton: true, requiredVersion: '^18.0.0' } },\n    }),\n  ],\n};",
    whenUsed:
      'Used in Dynamic Content Editor at Netcore — modules (template editor, asset manager, preview) deployed independently via Module Federation, enabling separate team release cycles.',
    gotchas:
      'Shared singleton React: if two remotes bundle different React versions, hooks will throw "invalid hook call". Always set singleton: true.\nNetwork waterfall: loading remoteEntry.js then the module chunk adds latency — preload critical remotes.\nShared CSS: global styles bleed across remotes; use CSS Modules or Shadow DOM per remote.\nVersion skew: a remote assuming a newer host API breaks silently — establish explicit contracts.\nCold-start: remote bundle fetches on first navigation; route-level lazy loading is essential.',
    flashcards: [
      card('What is the core problem Microfrontend architecture solves that monolithic frontend does not?', 'It eliminates the shared deployment bottleneck — teams can ship independently without coordinating a single release train, enabling true team autonomy at scale.'),
      card('Why does singleton: true in Module Federation matter?', 'React\'s hook system uses module-level state. Two separate React instances each have their own hook registry — hooks called from different instances throw "invalid hook call" errors.'),
      card('What is the difference between build-time and runtime MFE integration?', 'Build-time integration (npm packages) requires coordinated rebuilds to pick up changes. Runtime integration (Module Federation) loads remote bundles on-demand at runtime, enabling true independent deployment.'),
      card('How do microfrontends communicate without tight coupling?', 'Custom browser events (window.dispatchEvent), a shared event bus, URL/query params, or a lightweight shared-state singleton. Avoid direct imports between remotes — that creates a build-time dependency.'),
      card('What is Conway\'s Law and how does it justify MFE boundaries?', 'Conway\'s Law: software structure mirrors the communication structure of the teams that build it. MFE boundaries aligned to team ownership reduce cross-team coordination friction.'),
      card('What is the main performance risk in a microfrontend architecture?', 'Bundle duplication — each remote may include its own copy of shared libraries. Use the shared config in Module Federation to deduplicate; unshared duplicates can triple page weight.'),
      card('When should you NOT choose microfrontends?', 'Small teams (< 3–4 squads), early-stage products where boundaries are unclear, or apps without genuine independent deployment needs. Complexity cost is high — monolith-first is usually faster.'),
      card('What is a "shell" in MFE architecture?', 'The host application responsible for routing, authentication, global layout, and lazy-loading remote modules. It knows about remotes; remotes should not know about the shell.'),
      card('How do you handle authentication across microfrontends?', 'The shell handles auth and shares the token via a shared auth module (Module Federation shared) or secure cookie readable by all sub-domains. Each remote validates independently; do not trust shell-passed identity without verification.'),
    ],
    apis: [
      api('ModuleFederationPlugin', "new ModuleFederationPlugin({ name, remotes, exposes, shared })", 'Webpack 5 plugin enabling cross-build module sharing at runtime.', 'name: string, remotes: object, exposes: object, shared: object', 'webpack plugin', "new ModuleFederationPlugin({\n  name: 'editor',\n  filename: 'remoteEntry.js',\n  exposes: { './Editor': './src/Editor' },\n  shared: { react: { singleton: true } },\n})", 'Must be in both host and remote webpack configs. remoteEntry.js filename must match the URL in the host\'s remotes config.'),
      api('exposes', "exposes: { './Component': './src/Component' }", 'Declares which local modules a remote makes available to hosts.', 'map of public name to file path', 'exposed module map', "exposes: {\n  './TemplateEditor': './src/TemplateEditor/index.jsx',\n  './AssetPicker': './src/AssetPicker/index.jsx',\n}", 'Path keys must start with "./". Exposed modules are part of the public API — treat as a semver surface.'),
      api('remotes', "remotes: { name: 'remoteName@url/remoteEntry.js' }", 'Declares remote apps the host can consume.', 'map of local alias to remote entry URL', 'remote module map', "remotes: {\n  editor: 'editor@https://editor.cdn.com/remoteEntry.js',\n}", 'URL is fetched at runtime — a missing or unreachable remote throws a network error unless you add a fallback.'),
      api('shared', "shared: { react: { singleton: true, requiredVersion: '^18.0.0' } }", 'Declares shared dependencies to deduplicate across host and remotes.', 'package name to sharing config object', 'deduplication map', "shared: {\n  react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },\n  'react-dom': { singleton: true, eager: true },\n}", 'eager: true on the shell prevents async chunk loading for critical shared libs. Mismatched requiredVersion triggers a console warning and may load both copies.'),
      api('eager', 'eager: true in shared config', 'Loads the shared dependency synchronously rather than as an async chunk.', 'boolean flag in shared config', 'synchronous loading', "shared: { react: { singleton: true, eager: true } }", 'Only set eager on the host/shell, not remotes, to avoid circular async issues.'),
      api('dynamic import (remote)', "import('remoteName/ComponentPath')", 'Lazy-loads a federated module at runtime.', 'module path string', 'Promise<module>', "const Editor = React.lazy(() => import('editor/TemplateEditor'));\n\n<Suspense fallback={<Spinner />}>\n  <Editor />\n</Suspense>", 'Wrap in React.lazy + Suspense. Add error boundary to catch remote load failures gracefully.'),
      api('single-spa registerApplication', "registerApplication({ name, app, activeWhen, customProps })", 'Registers a microfrontend app with the single-spa orchestrator.', 'name, lifecycle functions, activity function, props', 'void', "registerApplication({\n  name: 'editor',\n  app: () => import('./editor/main'),\n  activeWhen: ['/editor'],\n});\nstart();", 'activity function must be deterministic and fast — it runs on every URL change.'),
      api('Custom Elements (cross-framework)', "customElements.define('my-widget', class extends HTMLElement {})", 'Exposes a microfrontend as a Web Component usable in any framework.', 'element name and class extending HTMLElement', 'void', "class DashboardWidget extends HTMLElement {\n  connectedCallback() {\n    ReactDOM.render(<Dashboard />, this);\n  }\n  disconnectedCallback() {\n    ReactDOM.unmountComponentAtNode(this);\n  }\n}\ncustomElements.define('dashboard-widget', DashboardWidget);", 'connectedCallback/disconnectedCallback must clean up React roots to avoid memory leaks.'),
    ],
    refs: [
      ref('Module Federation Docs', 'https://module-federation.io/'),
      ref('Webpack Module Federation', 'https://webpack.js.org/concepts/module-federation/'),
      ref('single-spa Docs', 'https://single-spa.js.org/docs/getting-started-overview'),
      ref('Micro Frontends (martinfowler.com)', 'https://martinfowler.com/articles/micro-frontends.html'),
      ref('monorepo.tools', 'https://monorepo.tools/'),
    ],
    relatedProjectIds: ['p-editor'],
  });
  skills.push(mfe);

  [
    ['What & Why', 'When to choose MFE over monolith: large org, multiple teams, independent release cadence, technology heterogeneity needs.', "// Monolith: one build, one deploy\n// MFE: each team ships their slice independently\n// Shell loads remotes at runtime — no shared build step",
      'Microfrontend means splitting a frontend monolith into smaller, independently deployable apps owned by different teams. Each team picks its own framework, ships on its own schedule, and lets organizational scaling (5+ teams) outweigh the runtime composition cost. Don\'t adopt for small teams or single-product apps — the overhead (shared deps, runtime integration, cross-MFE communication) only pays off when team autonomy is the real bottleneck.'],
    ['Module Federation (Webpack 5)', 'Webpack 5 plugin enabling one build to expose modules and another to consume them at runtime without a shared build pipeline.', "// Remote exposes a component\nnew ModuleFederationPlugin({\n  name: 'cart',\n  filename: 'remoteEntry.js',\n  exposes: { './CartSummary': './src/CartSummary' },\n  shared: { react: { singleton: true } },\n});",
      'Webpack 5 plugin that lets one app load JavaScript modules from another at runtime via a generated `remoteEntry.js` file. The host declares `remotes` (URLs of remote apps); remote apps declare `exposes` (modules they make available). Shared dependencies (React, ReactDOM) are configured with `singleton: true` and `requiredVersion` to prevent multiple copies at runtime. Build-time host config, true runtime composition — the foundation for independent deployment of MFEs.'],
    ['Single-SPA', 'Framework-agnostic MFE orchestrator using activity functions to mount/unmount apps based on URL.', "import { registerApplication, start } from 'single-spa';\nregisterApplication({\n  name: 'navbar',\n  app: () => System.import('@org/navbar'),\n  activeWhen: ['/'],\n});\nstart();",
      'Framework-agnostic orchestrator that lets multiple framework apps (React, Vue, Angular, plain JS) coexist on the same page. You register each app with a lifecycle (bootstrap → mount → unmount) and an activity function (when should this app be mounted). Single-SPA mounts and unmounts apps based on routes. Older approach than Module Federation, but still useful for multi-framework migrations or when teams genuinely need different frameworks.'],
    ['Build-time vs Runtime Integration', 'Build-time: npm packages require coordinated rebuild. Runtime: remoteEntry.js loaded on-demand, enabling true independent deployment.', "// Build-time (npm package — requires rebuild to update):\nimport { Button } from '@org/design-system';\n\n// Runtime (Module Federation — no rebuild needed):\nconst Button = React.lazy(() => import('designSystem/Button'));",
      'Build-time integration (npm packages, git submodules): each shell rebuild pulls the latest MFE versions — simpler tooling but coupled deploys (every MFE update triggers shell rebuild). Runtime integration (Module Federation, iframes, web components loaded dynamically): each MFE deploys independently, the shell discovers and loads them at runtime — more complex (version skew, runtime resolution, network failures) but true independent deployment. Pick build-time for small teams, runtime when independent deploy cadence is the real goal.'],
    ['Shared Dependencies', 'Shared config deduplicates React/etc. across remotes to prevent duplicate instances and hook errors.', "shared: {\n  react: { singleton: true, requiredVersion: '^18.0.0', eager: true },\n  'react-dom': { singleton: true, requiredVersion: '^18.0.0', eager: true },\n  'react-router-dom': { singleton: true },\n}",
      'If each MFE ships its own copy of React, you get multiple React instances at runtime — hooks break (React detects hooks called outside its context tree), bundle size balloons, and event handling becomes unpredictable. Solution: declare React, ReactDOM, and other framework deps as `singleton: true` in Module Federation\'s `shared` config with a `requiredVersion` range. Strict version match fails the build fast on mismatch; loose matching can lead to subtle runtime bugs. Always treat framework and router as singletons.'],
    ['Routing Across MFEs', 'Shell owns top-level routing; each remote owns sub-routes. Use memory router inside remotes to avoid conflicts with shell history.', "// Shell — react-router handles /editor/* paths\n<Route path='/editor/*' element={\n  <Suspense fallback={<Loader />}>\n    <RemoteEditor />\n  </Suspense>\n} />\n\n// Remote — uses MemoryRouter internally\n<MemoryRouter initialEntries={[location.pathname]}>\n  <EditorRoutes />\n</MemoryRouter>",
      'The shell app owns the top-level router and decides which MFE to mount for each route. Each MFE has internal nested routing within its mounted region. Lock route boundaries early — letting MFEs claim arbitrary paths leads to conflicts and unpredictable navigation. The URL becomes the public contract between MFEs; treat it like an API and version it if it changes. Avoid sharing router instances across MFEs unless absolutely needed.'],
    ['Communication Between MFEs', 'Decouple remotes via custom events, a shared event bus, or URL state. Avoid direct imports between remotes.', "// Publish (Remote A)\nwindow.dispatchEvent(new CustomEvent('mfe:cart:updated', { detail: { count: 3 } }));\n\n// Subscribe (Remote B)\nwindow.addEventListener('mfe:cart:updated', (e) => {\n  setCartCount(e.detail.count);\n});",
      'Three patterns, ordered by decoupling: (1) Custom DOM events (CustomEvent + addEventListener) — loosest, framework-agnostic, hard to type. (2) Shared event bus or PubSub library — slightly more structured, still loose. (3) URL/route state as contract — the most stable, MFEs read what they need from the URL. Avoid: direct module imports between MFEs (defeats independence), or a shared global store accessed by all (recreates monolith coupling). Whatever pattern, define the event/contract shapes explicitly.'],
    ['Independent Deployment', 'Each remote has its own CI/CD pipeline and release cadence. Host must tolerate remote failures gracefully.', "// Resilient remote loading\nconst RemoteChart = React.lazy(() =>\n  import('analytics/Chart').catch(() => import('./FallbackChart'))\n);\n\n<ErrorBoundary fallback={<p>Chart unavailable</p>}>\n  <Suspense fallback={<Spinner />}>\n    <RemoteChart />\n  </Suspense>\n</ErrorBoundary>",
      'Each MFE ships on its own schedule without forcing a shell rebuild or other MFE updates. Requires runtime composition (Module Federation, dynamic imports). Contract stability is everything — if an MFE breaks its exposed module shape, all dependents break. Version your exposed modules, run consumer-driven contract tests in CI, and treat breaking changes like any other public API breakage: announce, deprecate, coordinate. Without this discipline, \'independent deployment\' becomes \'synchronized chaos.\''],
    ['Performance Considerations', 'Lazy-load remotes, preload critical paths, and monitor bundle duplication to keep initial load fast.', "// Prefetch critical remote in shell\n<link rel='prefetch' href='https://editor.cdn.com/remoteEntry.js' />\n\n// Or via webpack magic comment:\nconst Editor = React.lazy(\n  () => import(/* webpackPrefetch: true */ 'editor/TemplateEditor')\n);",
      'Multiple MFEs each shipping their own React copy = bundle bloat measured in MB. Each MFE adds at least one extra network request to fetch its `remoteEntry.js`. Mitigate: shared singleton deps via Module Federation, lazy-load MFEs only when their route activates, serve everything from the same CDN with HTTP/2 multiplexing, run a duplicate-dependency audit in CI. Measure the *total* across all loaded MFEs — individual MFE bundle size is misleading.'],
    ['Team Boundaries & Ownership', "Conway's Law: align MFE boundaries to team ownership. Each team owns its remote end-to-end — code, deploy, monitoring.", "// CODEOWNERS (each team owns their slice)\n/packages/editor/   @team-editor\n/packages/dashboard/ @team-analytics\n/packages/shell/     @team-platform\n\n// Each remote has its own:\n// - CI pipeline\n// - feature flags\n// - error tracking DSN",
      'Conway\'s Law: system architecture mirrors team communication structure. Microfrontends only work when each MFE is owned by exactly one team with a clear domain boundary (checkout, search, profile). Two teams sharing ownership of one MFE recreates the monolith coordination problem the architecture was supposed to solve. One team owning many MFEs creates overhead without isolation gain. Map MFEs to teams 1:1 — if you can\'t, microfrontends aren\'t your answer.'],
  ].forEach(([name, definition, codeExample, a1]) => {
    skills.push(mk(name, 'state', mfe.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the key decision factor for ${name}?`, a1),
        card(`What breaks first in ${name} under real-world conditions?`, 'Version skew and shared dependency conflicts — establish contracts and shared config early.'),
      ],
    }));
  });

  // ─── COMPONENT-DRIVEN ARCHITECTURE (zero to hero) ──────────────────────────
  const cda = mk('Component-Driven Architecture', 'state', null, {
    definition:
      'Component-Driven Architecture (CDA) is a development methodology where UIs are built bottom-up from small, isolated, reusable components. It enforces single responsibility, explicit interfaces, and composability. Paired with tools like Storybook, CDA enables parallel design-development workflows and living documentation.',
    codeExample:
      "// Atomic Design layering\n// Atom\nexport function Badge({ count, color = 'blue' }) {\n  return <span className={`badge badge--${color}`}>{count}</span>;\n}\n\n// Molecule\nexport function CartIcon({ itemCount }) {\n  return (\n    <div className='cart-icon'>\n      <Icon name='cart' />\n      {itemCount > 0 && <Badge count={itemCount} color='red' />}\n    </div>\n  );\n}\n\n// Organism\nexport function Navbar({ user, cart }) {\n  return (\n    <nav>\n      <Logo />\n      <SearchBar />\n      <CartIcon itemCount={cart.count} />\n      <UserMenu user={user} />\n    </nav>\n  );\n}",
    whenUsed:
      'Applied in p-stock, p-docs, and p-editor — shared component libraries accelerated feature delivery across teams and reduced visual inconsistency.',
    gotchas:
      'Abstraction too early: creating generic components before third use adds complexity without benefit — follow the Rule of Three.\nProp sprawl: components with 15+ props are hard to use and maintain; split or compose instead.\nLeaky abstractions: components that know too much about their usage context cannot be reused.\nStorybook drift: stories that are not kept in sync with component changes give false confidence.\nDesign token coupling: hard-coding colour values instead of tokens makes theming a rewrite.',
    flashcards: [
      card('What is Atomic Design and what are its five levels?', 'Brad Frost\'s methodology: Atoms (buttons, inputs) → Molecules (form field with label) → Organisms (navbar, card) → Templates (page wireframe) → Pages (real content instances).'),
      card('Why build components bottom-up instead of top-down?', 'Bottom-up forces you to design components in isolation without assumptions about their context, producing more reusable, context-independent primitives.'),
      card('What is the Rule of Three for component abstraction?', 'Only abstract into a reusable component when you need it in three different places. Premature generalisation creates complexity without return.'),
      card('What distinguishes a controlled from an uncontrolled component?', 'Controlled: value is owned by React state (parent dictates value + onChange). Uncontrolled: DOM owns the value, read via ref. Controlled is more predictable for forms; uncontrolled is simpler for file inputs.'),
      card('What is a compound component pattern?', 'A parent manages shared state internally and exposes sub-components that read it via context — e.g. <Tabs>, <Tabs.List>, <Tabs.Panel>. Consumers get flexible composition without prop drilling.'),
      card('Why does Storybook improve component quality beyond documentation?', 'Writing stories forces you to define all props explicitly, discover edge cases (empty state, loading, error), and think about component API surface before the feature drives it.'),
      card('What is the difference between a container and a presentational component?', 'Presentational: pure UI, receives data via props. Container: fetches data and passes it down. In the hooks era, the distinction blurs — custom hooks now carry data-fetching concerns out of components cleanly.'),
      card('How do design tokens improve component library scalability?', 'Tokens (--color-primary, --spacing-md) decouple component styles from specific values — theming, white-labelling, and dark mode become config changes rather than CSS rewrites.'),
      card('What makes a component "open for extension, closed for modification"?', 'Composable props (children, renderProp, className), slot patterns, and compound components — consumers extend behaviour without changing the source, preserving stability for other users.'),
    ],
    apis: [
      api('Storybook Meta / StoryObj', "const meta: Meta<typeof Component> = { component, args, argTypes }", 'TypeScript types for Storybook 7+ CSF3 story format.', 'component, default args, arg type controls', 'story module', "import type { Meta, StoryObj } from '@storybook/react';\nimport { Button } from './Button';\n\nconst meta: Meta<typeof Button> = {\n  component: Button,\n  args: { children: 'Click me' },\n};\nexport default meta;\n\ntype Story = StoryObj<typeof Button>;\nexport const Primary: Story = { args: { variant: 'primary' } };", 'CSF3 requires default export as meta. args defined at meta level are merged with story-level args.'),
      api('forwardRef', 'React.forwardRef((props, ref) => <element ref={ref} />)', 'Passes a ref through a wrapper component to an underlying DOM node or child component.', 'render function receiving props and ref', 'React component', "const Input = React.forwardRef<HTMLInputElement, InputProps>(\n  ({ label, ...props }, ref) => (\n    <label>\n      {label}\n      <input ref={ref} {...props} />\n    </label>\n  )\n);\nInput.displayName = 'Input';", 'Always set displayName for readable DevTools output. Without forwardRef, ref on a function component is silently ignored.'),
      api('Compound component (Context)', 'createContext + useContext inside sub-components', 'Enables sub-components to read shared parent state without prop drilling.', 'context value and provider in parent', 'React element tree', "const TabsCtx = createContext(null);\n\nfunction Tabs({ children }) {\n  const [active, setActive] = useState(0);\n  return <TabsCtx.Provider value={{ active, setActive }}>{children}</TabsCtx.Provider>;\n}\nTabs.Panel = function Panel({ index, children }) {\n  const { active } = useContext(TabsCtx);\n  return active === index ? <div>{children}</div> : null;\n};", 'Export sub-components as static properties of the parent for clean import ergonomics.'),
      api('Slot pattern (children + named props)', 'Component accepts children and named slot props', 'Allows callers to inject arbitrary UI into specific positions without coupling.', 'children and named render props', 'composed layout', "function Card({ header, footer, children }) {\n  return (\n    <div className='card'>\n      {header && <div className='card__header'>{header}</div>}\n      <div className='card__body'>{children}</div>\n      {footer && <div className='card__footer'>{footer}</div>}\n    </div>\n  );\n}\n\n<Card header={<h2>Title</h2>} footer={<Actions />}>\n  <p>Body content</p>\n</Card>", 'Prefer explicit named slot props over index-based children access for clarity.'),
      api('react-docgen / react-docgen-typescript', 'CLI / webpack loader — extracts prop types from source', 'Auto-generates prop documentation from TypeScript types or PropTypes.', 'source file or glob', 'JSON prop metadata', '// CLI\nnpx react-docgen src/Button.tsx\n\n// Output used by Storybook argTypes automatically\n// when using @storybook/react with TypeScript', 'Generic types and complex union types may not extract cleanly — add JSDoc annotations as fallback.'),
    ],
    refs: [
      ref('Atomic Design (Brad Frost)', 'https://atomicdesign.bradfrost.com/'),
      ref('Storybook Docs', 'https://storybook.js.org/docs'),
      ref('Component-Driven Development', 'https://www.componentdriven.org/'),
      ref('React Composition Patterns', 'https://react.dev/learn/passing-props-to-a-component'),
      ref('Design Tokens W3C', 'https://design-tokens.github.io/community-group/format/'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-editor'],
  });
  skills.push(cda);

  [
    ['Atomic Design', 'Five-level hierarchy (Atoms → Molecules → Organisms → Templates → Pages) that guides how components are composed from smallest to largest.', "// Atom: smallest unit, no dependencies\nfunction Avatar({ src, alt, size = 40 }) {\n  return <img src={src} alt={alt} width={size} height={size} style={{ borderRadius: '50%' }} />;\n}\n\n// Molecule: combines atoms\nfunction UserBadge({ user }) {\n  return (\n    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n      <Avatar src={user.avatar} alt={user.name} />\n      <span>{user.name}</span>\n    </div>\n  );\n}",
      'Building organisms before atoms are stable — top-heavy hierarchies that force rewrites as shared primitives change underneath them.',
      'Shared vocabulary (Atom, Molecule, Organism) aligns designers and developers — component discovery is faster because everyone knows where to look in the hierarchy.'],
    ['Storybook', 'Isolated component development environment with interactive controls, docs, and addon ecosystem.', "// Button.stories.tsx (CSF3)\nimport type { Meta, StoryObj } from '@storybook/react';\nimport { Button } from './Button';\n\nconst meta: Meta<typeof Button> = {\n  component: Button,\n  tags: ['autodocs'],\n};\nexport default meta;\n\nexport const Primary: StoryObj<typeof Button> = {\n  args: { children: 'Save', variant: 'primary', disabled: false },\n};\nexport const Loading: StoryObj<typeof Button> = {\n  args: { children: 'Saving…', loading: true },\n};",
      'Writing stories after features are done — stories become documentation catch-up rather than a design tool. Stories written first catch API problems before implementation locks them in.',
      'Every component becomes verifiable in isolation without spinning up the full app — visual QA, accessibility testing, and design review happen in Storybook without backend dependencies.'],
    ['Composition Over Inheritance', 'Prefer composing components via props/children over extending base classes — keeps components flexible and avoids brittle inheritance chains.', "// ❌ Inheritance approach (fragile)\nclass SpecialButton extends Button {\n  render() { return super.render() + <Icon />; }\n}\n\n// ✅ Composition approach (flexible)\nfunction IconButton({ icon, children, ...props }) {\n  return (\n    <Button {...props}>\n      <Icon name={icon} />\n      {children}\n    </Button>\n  );\n}",
      'Reaching for inheritance to share rendering logic — creates rigid hierarchies that cannot vary independently. Composition via props/children handles every case inheritance attempts to solve.',
      'Components assembled from smaller pieces are individually replaceable — swapping out a sub-component does not require touching the hierarchy above it.'],
    ['Prop Drilling vs Composition', 'Prop drilling passes data through multiple levels. Composition solves it by lifting JSX up: pass children rather than data.', "// ❌ Prop drilling — Page → Layout → Sidebar → UserNav\nfunction Page({ user }) {\n  return <Layout user={user} />;\n}\n\n// ✅ Composition — Page controls what Sidebar renders\nfunction Page({ user }) {\n  return (\n    <Layout sidebar={<UserNav user={user} />}>\n      <MainContent />\n    </Layout>\n  );\n}",
      'Adding props to intermediary components that don\'t use them — every intermediary becomes coupled to the interface of its children\'s children, making refactors cascade upward.',
      'Lifting JSX up (passing children instead of data) eliminates intermediary prop threading — components that only render children stay stable when leaf component APIs change.'],
    ['Separation of Concerns', 'Container/presentational split in hooks era: custom hooks own data and behaviour; components own rendering.', "// Custom hook owns data concern\nfunction useUserProfile(id) {\n  const { data, isLoading } = useQuery(['user', id], () => fetchUser(id));\n  return { user: data, isLoading };\n}\n\n// Component owns render concern\nfunction UserProfile({ id }) {\n  const { user, isLoading } = useUserProfile(id);\n  if (isLoading) return <Skeleton />;\n  return <UserCard user={user} />;\n}",
      'Business logic accumulating in components — event handlers that validate, transform, and fetch are impossible to test without rendering and make the component untestable in isolation.',
      'Hooks own orchestration, services own logic, components own rendering — each layer is independently testable and reusable across screens without pulling in React render machinery.'],
    ['Reusable Component Design', 'Design components for the 3rd consumer, not just the 1st. Accept className, style, and HTML attributes via spread for escape hatches.', "function Input({ label, error, className, ...inputProps }) {\n  return (\n    <div className={['field', className].filter(Boolean).join(' ')}>\n      {label && <label>{label}</label>}\n      <input\n        className={['input', error && 'input--error'].filter(Boolean).join(' ')}\n        aria-invalid={!!error}\n        {...inputProps}\n      />\n      {error && <span className='error'>{error}</span>}\n    </div>\n  );\n}",
      'Designing for the first consumer only — one-consumer components encode assumptions about context (parent layout, sibling data) that break when the second consumer arrives.',
      'Components built for the third consumer handle edge cases (empty state, disabled, loading, error) from the start — later features consume them without rework or forking.'],
    ['Component Library Publishing', 'Package components as an npm module with rollup/tsup, peer deps, and design tokens for cross-project reuse.', "// package.json\n{\n  \"name\": \"@org/ui\",\n  \"main\": \"dist/index.cjs.js\",\n  \"module\": \"dist/index.esm.js\",\n  \"types\": \"dist/index.d.ts\",\n  \"peerDependencies\": { \"react\": \">=17\" },\n  \"exports\": {\n    \".\": {\n      \"import\": \"./dist/index.esm.js\",\n      \"require\": \"./dist/index.cjs.js\"\n    }\n  }\n}\n// tsup.config.ts\nexport default { entry: ['src/index.ts'], dts: true, format: ['cjs','esm'] };",
      'Publishing without peer deps — bundling React into the library creates multiple React instances at runtime, breaking hooks and causing mysterious rendering bugs.',
      'A published component library eliminates divergence between apps — visual consistency is enforced at the package level, not by convention.'],
    ['Versioning & Semver', 'Semantic versioning for component libraries: patch = bug fix, minor = new component/prop, major = breaking API change.', "// CHANGELOG.md pattern\n## [2.0.0] — Breaking\n- Button: removed `type` prop in favour of `variant`\n- Removed deprecated `<LegacyModal>` — use `<Dialog>`\n\n## [1.4.0] — Minor\n- Added `<Toast>` component\n- Button: added `loading` prop\n\n// Codemods help consumers migrate majors:\nnpx @org/ui-codemod v2 ./src",
      'Treating all changes as patches — undocumented API breaks slip into minor or patch releases, forcing consumers to scan changelogs for breaking changes that should have been major bumps.',
      'Consumers can pin major versions and adopt breaking changes on their own schedule — library evolution and app stability are decoupled.'],
    ['Documentation', 'Storybook autodocs + MDX for narrative docs. Component API tables auto-generated from TypeScript types via react-docgen.', "// Button.mdx\nimport { Canvas, Meta, Controls } from '@storybook/blocks';\nimport * as ButtonStories from './Button.stories';\n\n<Meta of={ButtonStories} />\n\n# Button\nUse `<Button>` for all clickable actions. Prefer `variant='primary'` for the main CTA.\n\n<Canvas of={ButtonStories.Primary} />\n<Controls of={ButtonStories.Primary} />",
      'Documentation written separately from code — it drifts within weeks. Storybook stories that double as docs stay accurate because they run against real component code.',
      'Discoverable, interactive documentation (Storybook) removes the "ask the author" bottleneck — new engineers find and evaluate components without a walkthrough.'],
    ['Testing Components in Isolation', 'React Testing Library for behaviour tests; Chromatic or Percy for visual regression snapshots.', "// Button.test.tsx (RTL)\nit('calls onClick when not disabled', async () => {\n  const onClick = vi.fn();\n  render(<Button onClick={onClick}>Save</Button>);\n  await userEvent.click(screen.getByRole('button', { name: 'Save' }));\n  expect(onClick).toHaveBeenCalledOnce();\n});\n\nit('does not call onClick when disabled', async () => {\n  const onClick = vi.fn();\n  render(<Button onClick={onClick} disabled>Save</Button>);\n  await userEvent.click(screen.getByRole('button'));\n  expect(onClick).not.toHaveBeenCalled();\n});",
      'Testing implementation details (internal state, class names) instead of behavior — every refactor breaks tests even when the user-visible behavior is unchanged.',
      'Isolated tests run without the full app and catch regressions at the component boundary — fast feedback loop that scales with the number of components without CI slowdown.'],
  ].forEach(([name, definition, codeExample, a1, a2]) => {
    skills.push(mk(name, 'state', cda.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the most common mistake when implementing ${name}?`, a1),
        card(`How does ${name} improve team velocity over time?`, a2),
      ],
    }));
  });

  // ─── REDUX (beginner to intermediate) ──────────────────────────────────────
  const redux = mk('Redux', 'state', null, {
    definition:
      'Redux is a predictable state container for JavaScript apps. It enforces a strict unidirectional data flow: UI dispatches actions, reducers compute new state, store notifies subscribers. Pure reducers and serialisable state power time-travel debugging and hot reloading. Redux is most valuable when multiple distant components share complex state with many transitions.',
    codeExample:
      "import { createStore, combineReducers, applyMiddleware } from 'redux';\nimport thunk from 'redux-thunk';\n\nfunction cartReducer(state = { items: [] }, action) {\n  switch (action.type) {\n    case 'cart/add':\n      return { ...state, items: [...state.items, action.payload] };\n    case 'cart/remove':\n      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };\n    default:\n      return state;\n  }\n}\n\nconst rootReducer = combineReducers({ cart: cartReducer });\nconst store = createStore(rootReducer, applyMiddleware(thunk));",
    whenUsed: 'Used in p-maak for global application state across the canvas editor, toolbar, and collaboration features.',
    gotchas:
      'Pushing to an array in a reducer breaks reference equality — components won\'t re-render. Use [...state, item] or RTK\'s Immer.\nDeriving data in mapStateToProps without memoisation re-renders on every store update.\nPutting non-serialisable values (functions, class instances, Dates) in state breaks Redux DevTools and serialisation.\nUsing Redux for purely local UI state (modal open/close) adds unnecessary boilerplate — useState is fine.',
    flashcards: [
      card('Why must Redux reducers be pure functions?', 'Purity (same inputs → same output, no side effects) enables time-travel debugging, hot reloading, and deterministic state replay. Impure reducers break all three.'),
      card('What is the difference between an action and an action creator?', 'An action is a plain object { type, payload }. An action creator is a function that returns an action — it centralises payload construction and is easier to test.'),
      card('Why does Redux use a single store rather than multiple stores?', 'A single source of truth simplifies state inspection, undo/redo, and cross-slice relationships. Multiple stores complicate synchronisation and DevTools integration.'),
      card('What does combineReducers do under the hood?', 'It creates a root reducer that calls each slice reducer with its own state slice and merges results into a single object. Each slice reducer is isolated and cannot read sibling slices directly.'),
      card('When is Redux overkill?', 'When state is local to one component, simple, or doesn\'t need to be shared across distant parts of the tree. Context + useReducer or Zustand often fit better for medium complexity.'),
      card('How does Redux Thunk enable async action creators?', 'Thunk middleware checks if an action is a function — if so, it calls it with dispatch and getState instead of passing it to reducers. This lets action creators dispatch multiple actions asynchronously.'),
    ],
    apis: [
      api('createStore', 'createStore(reducer, preloadedState?, enhancer?)', 'Creates the Redux store (legacy API — prefer configureStore from RTK).', 'root reducer, optional initial state, optional enhancer', 'Store object', "const store = createStore(rootReducer, applyMiddleware(thunk));", 'Deprecated in favour of RTK\'s configureStore. Still valid but lacks RTK\'s DevTools integration defaults.'),
      api('combineReducers', 'combineReducers({ slice: reducer })', 'Merges multiple slice reducers into a root reducer.', 'object mapping slice names to reducers', 'root reducer function', "const root = combineReducers({ user: userReducer, cart: cartReducer });", 'Each reducer receives only its own slice — cannot directly access sibling slices.'),
      api('applyMiddleware', 'applyMiddleware(...middlewares)', 'Enhances dispatch to support middleware like thunk, saga, logger.', 'middleware functions', 'store enhancer', 'applyMiddleware(thunk, logger)', 'Order matters: logger should be last so it sees fully processed actions.'),
      api('useSelector', 'useSelector(selector: (state) => T): T', 'Subscribes a component to a slice of Redux state.', 'selector function', 'selected state value', "const items = useSelector((state) => state.cart.items);", 'Re-renders whenever selected value changes by reference. Use memoised selectors (reselect) for derived values.'),
      api('useDispatch', 'useDispatch(): Dispatch', 'Returns the store dispatch function for use in components.', 'none', 'dispatch function', "const dispatch = useDispatch();\ndispatch({ type: 'cart/add', payload: item });", 'Dispatch reference is stable — safe to include in useCallback deps.'),
      api('Provider', '<Provider store={store}>{children}</Provider>', 'Makes the Redux store available to all descendant components.', 'store prop', 'React element', "<Provider store={store}><App /></Provider>", 'Must wrap the component tree at the root. Multiple Providers for different stores is an anti-pattern.'),
      api('connect', 'connect(mapStateToProps?, mapDispatchToProps?)(Component)', 'Legacy HOC for connecting class components to Redux (prefer hooks).', 'selector and dispatch maps', 'wrapped component', "export default connect(\n  (state) => ({ items: state.cart.items }),\n  { addItem }\n)(CartComponent);", 'Hooks (useSelector/useDispatch) are preferred in function components. connect adds wrapper nesting.'),
      api('bindActionCreators', 'bindActionCreators(actionCreators, dispatch)', 'Wraps action creators so they auto-dispatch on call.', 'object of action creators and dispatch', 'wrapped action creators', "const actions = bindActionCreators({ addItem, removeItem }, dispatch);", 'Mainly useful with connect mapDispatchToProps. Rarely needed with useDispatch.'),
    ],
    refs: [
      ref('Redux Docs', 'https://redux.js.org/'),
      ref('Redux Style Guide', 'https://redux.js.org/style-guide/'),
      ref('Redux Essentials Tutorial', 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts'),
      ref('Why Redux Toolkit is How to Use Redux Today', 'https://redux.js.org/introduction/why-rtk-is-redux-today'),
    ],
    relatedProjectIds: ['p-maak'],
  });
  skills.push(redux);

  [
    ['Store, Actions, Reducers', 'The Redux triad: store holds state, actions describe what happened, reducers compute the next state from current state + action.', "// Action\nconst addItem = (item) => ({ type: 'cart/add', payload: item });\n\n// Reducer\nfunction cartReducer(state = { items: [] }, action) {\n  switch (action.type) {\n    case 'cart/add':\n      return { ...state, items: [...state.items, action.payload] };\n    default:\n      return state;\n  }\n}\n\n// Store\nconst store = createStore(cartReducer);\nstore.dispatch(addItem({ id: 1, name: 'Widget' }));\nconsole.log(store.getState());",
      'Object mutation inside reducers — `state.items.push(x)` returns the same reference, so `useSelector` sees no change and the component does not re-render, even though the data changed.',
      'Reducers are pure functions — call the reducer with an initial state and an action, assert the output. No store setup, no component mount, no mocking.'],
    ['Selectors & Reselect', 'Selectors derive data from state. Memoised selectors (reselect) prevent unnecessary recalculation and re-renders.', "import { createSelector } from 'reselect';\n\nconst selectItems = (state) => state.cart.items;\nconst selectFilter = (state) => state.ui.filter;\n\n// Only recomputes when items or filter changes\nconst selectFilteredItems = createSelector(\n  [selectItems, selectFilter],\n  (items, filter) => items.filter((i) => i.category === filter)\n);\n\n// In component\nconst filtered = useSelector(selectFilteredItems);",
      'Inline selector functions in `useSelector` — a new function reference every render defeats Reselect memoization, recalculating derived data on every store update.',
      'Selectors are plain functions — call `selectFilteredItems(mockState)` and assert the output. Test cache behavior by calling twice with the same input and confirming the result function ran once.'],
    ['Middleware', 'Middleware intercepts dispatched actions for async flows, logging, and side effects. Redux Thunk is simplest; Redux Saga handles complex async orchestration.', "// Custom logger middleware\nconst logger = (store) => (next) => (action) => {\n  console.log('dispatching', action);\n  const result = next(action);\n  console.log('next state', store.getState());\n  return result;\n};\n\n// Thunk for async action\nconst fetchUser = (id) => async (dispatch) => {\n  dispatch({ type: 'user/loading' });\n  const user = await api.getUser(id);\n  dispatch({ type: 'user/loaded', payload: user });\n};",
      'Async middleware (thunks, sagas) that swallow errors — `catch` blocks that log but don\'t dispatch a failure action leave the UI stuck in a loading state with no way to recover.',
      'Thunks: call the thunk with a `jest.fn()` dispatch and `getState`, assert dispatched action sequence. Sagas: use `redux-saga-test-plan` to step through effects without real async calls.'],
    ['Immutability', 'Redux requires immutable state updates — returning new references signals change to subscribers. Mutation silently breaks change detection.', "// ❌ Mutation — subscribers don't see change\nstate.items.push(newItem);\nreturn state;\n\n// ✅ Immutable update — new reference triggers re-render\nreturn { ...state, items: [...state.items, newItem] };\n\n// ✅ Nested update\nreturn {\n  ...state,\n  user: { ...state.user, name: action.payload },\n};",
      'Spread operators that only shallow-clone — `{ ...state, nested: state.nested }` appears immutable but nested object mutations still change the same reference, silently breaking deep `useSelector` subscriptions.',
      'Write a reducer test: mutate nothing, assert the returned state is a new reference (`!==` original) and contains the expected values. RTK\'s Immer writes tests in the same way — test the output, not the draft.'],
    ['Connecting to React', 'useSelector reads state; useDispatch sends actions; Provider injects store into the component tree.', "import { Provider, useSelector, useDispatch } from 'react-redux';\n\nfunction CartBadge() {\n  const count = useSelector((s) => s.cart.items.length);\n  return <span>{count}</span>;\n}\n\nfunction AddButton({ item }) {\n  const dispatch = useDispatch();\n  return (\n    <button onClick={() => dispatch({ type: 'cart/add', payload: item })}>\n      Add to cart\n    </button>\n  );\n}\n\n// Root\n<Provider store={store}><App /></Provider>",
      'Selecting too much state in one `useSelector` call — a selector returning `state.everything` re-renders the component on any store update, even fields it doesn\'t render.',
      'Render the component inside a `<Provider store={mockStore}>`, dispatch actions, and assert the rendered output. `redux-mock-store` captures dispatched actions without running reducers.'],
  ].forEach(([name, definition, codeExample, a1, a2]) => {
    skills.push(mk(name, 'state', redux.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the most common bug in ${name}?`, a1),
        card(`How do you test ${name} in isolation?`, a2),
      ],
    }));
  });

  // ─── REDUX TOOLKIT (beginner to intermediate) ───────────────────────────────
  const rtk = mk('Redux Toolkit', 'state', null, {
    definition:
      'Redux Toolkit (RTK) is the official, opinionated Redux package that eliminates boilerplate. createSlice combines action creators and reducer into one declaration; createAsyncThunk standardises async patterns; Immer enables "mutating" reducer syntax that produces immutable updates under the hood; RTK Query provides a built-in data fetching and caching layer.',
    codeExample:
      "import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';\n\nexport const fetchUser = createAsyncThunk('user/fetch', async (id) => {\n  const res = await fetch(`/api/users/${id}`);\n  return res.json();\n});\n\nconst userSlice = createSlice({\n  name: 'user',\n  initialState: { data: null, status: 'idle' },\n  reducers: {\n    clearUser: (state) => { state.data = null; }, // Immer — looks like mutation\n  },\n  extraReducers: (builder) => {\n    builder\n      .addCase(fetchUser.pending, (state) => { state.status = 'loading'; })\n      .addCase(fetchUser.fulfilled, (state, action) => {\n        state.status = 'idle';\n        state.data = action.payload;\n      });\n  },\n});\n\nexport const { clearUser } = userSlice.actions;\nexport const store = configureStore({ reducer: { user: userSlice.reducer } });",
    whenUsed: 'RTK is the standard for any new Redux-based project. If Redux was used in p-maak, RTK would be the recommended modernisation path.',
    gotchas:
      'Immer only works inside createSlice/createReducer — returning a new value AND mutating draft in the same reducer function causes an error.\nRTK Query cache keys are derived from endpoint name + arg — passing objects as args requires serializeQueryArgs customisation.\ncreateAsyncThunk does not automatically reject on HTTP errors — check response.ok and throw manually.\nOver-using RTK Query for mutations that are better handled as local state adds unnecessary cache invalidation complexity.',
    flashcards: [
      card('What does createSlice eliminate compared to vanilla Redux?', 'Separate action type constants, action creator functions, and reducer switch statements — it generates all three from a single slice definition.'),
      card('How does Immer work inside RTK reducers?', 'RTK wraps reducer functions with Immer\'s produce(). You write "mutating" code on a draft proxy; Immer records the mutations and returns a new immutable state object.'),
      card('What are the three action types createAsyncThunk generates?', 'thunkName/pending, thunkName/fulfilled, and thunkName/rejected — handle them in extraReducers builder to model loading/success/error states.'),
      card('Why use RTK Query instead of useEffect + fetch?', 'RTK Query handles caching, deduplication, background refetching, loading/error states, and cache invalidation automatically — replacing hundreds of lines of manual async state management.'),
      card('What is createEntityAdapter and when is it useful?', 'It normalises collections into { ids: [], entities: {} } with CRUD helper functions (addOne, updateOne, removeMany, etc.) — ideal for lists of items with unique IDs.'),
      card('What does configureStore add over createStore?', 'It enables Redux DevTools Extension by default, includes thunk middleware, and warns about common mistakes like non-serialisable values in state.'),
    ],
    apis: [
      api('createSlice', "createSlice({ name, initialState, reducers, extraReducers })", 'Generates action creators and reducer from a single config object.', 'slice name, initial state, reducers map, optional extraReducers', '{ reducer, actions }', "const counterSlice = createSlice({\n  name: 'counter',\n  initialState: { value: 0 },\n  reducers: {\n    increment: (state) => { state.value++; },\n    addBy: (state, action) => { state.value += action.payload; },\n  },\n});\nexport const { increment, addBy } = counterSlice.actions;", 'Action type strings are auto-generated as "name/reducerKey". Export actions and reducer separately.'),
      api('createAsyncThunk', "createAsyncThunk(typePrefix, payloadCreator)", 'Creates an action creator for async operations with auto-generated pending/fulfilled/rejected actions.', 'string type prefix and async callback', 'thunk action creator', "export const fetchPosts = createAsyncThunk(\n  'posts/fetchAll',\n  async (_, { rejectWithValue }) => {\n    const res = await fetch('/api/posts');\n    if (!res.ok) return rejectWithValue('Failed');\n    return res.json();\n  }\n);", 'Throw or use rejectWithValue to trigger the rejected case. HTTP errors are not automatic rejections.'),
      api('configureStore', "configureStore({ reducer, middleware?, devTools? })", 'Creates Redux store with sensible defaults (DevTools, thunk middleware, serialisability check).', 'root reducer or slice map, optional middleware and enhancers', 'Redux store', "const store = configureStore({\n  reducer: { posts: postsSlice.reducer, user: userSlice.reducer },\n});", 'Pass middleware as a callback to getDefaultMiddleware to preserve built-in middleware: (getDefault) => getDefault().concat(myMiddleware).'),
      api('createApi (RTK Query)', "createApi({ reducerPath, baseQuery, endpoints })", 'Defines a data-fetching and caching service with auto-generated hooks.', 'reducer path, base query fn, endpoint definitions', 'API slice with hooks', "export const postsApi = createApi({\n  reducerPath: 'postsApi',\n  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),\n  endpoints: (builder) => ({\n    getPosts: builder.query({ query: () => '/posts' }),\n    addPost: builder.mutation({ query: (body) => ({ url: '/posts', method: 'POST', body }) }),\n  }),\n});\nexport const { useGetPostsQuery, useAddPostMutation } = postsApi;", 'Add postsApi.reducer to store and postsApi.middleware to middleware chain.'),
      api('createEntityAdapter', "createEntityAdapter({ selectId?, sortComparer? })", 'Manages normalised entity collections with built-in CRUD reducers and selectors.', 'optional id selector and sort comparator', 'adapter with selectors and reducers', "const adapter = createEntityAdapter();\nconst slice = createSlice({\n  name: 'items',\n  initialState: adapter.getInitialState(),\n  reducers: {\n    addItem: adapter.addOne,\n    updateItem: adapter.updateOne,\n    removeItem: adapter.removeOne,\n  },\n});\nexport const { selectAll, selectById } = adapter.getSelectors((s) => s.items);", 'Default id field is "id" — override with selectId: (e) => e.uuid if needed.'),
      api('createSelector (RTK re-export)', "createSelector([inputSelectors], resultFn)", 'Memoised selector that recomputes only when input selectors return new values.', 'array of input selectors and result function', 'memoised selector', "const selectActiveItems = createSelector(\n  [(s) => s.items.entities, (s) => s.ui.activeIds],\n  (entities, ids) => ids.map((id) => entities[id]).filter(Boolean)\n);", 'Result function runs only when inputs change by reference. Default cache size is 1 — use createSelectorCreator for larger caches.'),
    ],
    refs: [
      ref('Redux Toolkit Docs', 'https://redux-toolkit.js.org/'),
      ref('RTK Query Overview', 'https://redux-toolkit.js.org/rtk-query/overview'),
      ref('createSlice API', 'https://redux-toolkit.js.org/api/createSlice'),
      ref('Immer Docs', 'https://immerjs.github.io/immer/'),
    ],
    relatedProjectIds: [],
  });
  skills.push(rtk);

  [
    ['createSlice', 'Combines action creators, action types, and reducer into a single cohesive unit — eliminating the three-file Redux boilerplate pattern.', "const todosSlice = createSlice({\n  name: 'todos',\n  initialState: [],\n  reducers: {\n    addTodo: (state, action) => {\n      // Immer: looks like mutation, produces immutable update\n      state.push({ id: uid(), text: action.payload, done: false });\n    },\n    toggleTodo: (state, action) => {\n      const todo = state.find((t) => t.id === action.payload);\n      if (todo) todo.done = !todo.done;\n    },\n    removeTodo: (state, action) => {\n      return state.filter((t) => t.id !== action.payload);\n    },\n  },\n});\nexport const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;",
      'One declaration replaces three files — action type strings, action creator functions, and the reducer switch are all generated from a single `createSlice` config object with Immer-powered reducers.',
      'Putting server-fetched data directly into slice state managed by RTK Query — it duplicates the cache and creates two sources of truth that diverge.'],
    ['createAsyncThunk', 'Standardises the loading → success / failure state pattern for async operations, generating three lifecycle action types automatically.', "export const loginUser = createAsyncThunk(\n  'auth/login',\n  async ({ email, password }, { rejectWithValue }) => {\n    try {\n      const res = await fetch('/api/login', {\n        method: 'POST',\n        body: JSON.stringify({ email, password }),\n        headers: { 'Content-Type': 'application/json' },\n      });\n      if (!res.ok) return rejectWithValue(await res.json());\n      return res.json();\n    } catch (err) {\n      return rejectWithValue({ message: 'Network error' });\n    }\n  }\n);",
      'Automatic pending/fulfilled/rejected lifecycle actions eliminate manual status flags — the three action types are generated and typed from a single `payloadCreator` async function.',
      'Not checking `response.ok` before returning — `fetch` only rejects on network failure, not HTTP 4xx/5xx errors, so unchecked thunks dispatch `fulfilled` even on server errors.'],
    ['RTK Query', 'Built-in data fetching layer with automatic caching, deduplication, background refetch, and optimistic updates — replaces useEffect + useState data-fetch patterns.', "const api = createApi({\n  reducerPath: 'api',\n  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),\n  tagTypes: ['Post'],\n  endpoints: (b) => ({\n    getPosts: b.query({ query: () => '/posts', providesTags: ['Post'] }),\n    deletePost: b.mutation({\n      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),\n      invalidatesTags: ['Post'],\n    }),\n  }),\n});\n\n// Component\nconst { data, isLoading } = useGetPostsQuery();\nconst [deletePost] = useDeletePostMutation();",
      'Caching, deduplication, background refetch, and cache invalidation come built-in — replacing hundreds of lines of `useEffect` + `useState` data-fetching boilerplate per endpoint.',
      'Using RTK Query mutations for purely local state changes that have no server round-trip — adds cache invalidation overhead to state that never leaves the browser.'],
    ['createEntityAdapter', 'Normalises entity collections into an { ids, entities } shape with built-in CRUD operations, eliminating manual find/filter patterns.', "const usersAdapter = createEntityAdapter({\n  sortComparer: (a, b) => a.name.localeCompare(b.name),\n});\n\nconst usersSlice = createSlice({\n  name: 'users',\n  initialState: usersAdapter.getInitialState({ status: 'idle' }),\n  extraReducers: (builder) => {\n    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll);\n  },\n});\n\n// Selectors\nconst selectors = usersAdapter.getSelectors((s) => s.users);\nexport const { selectAll: selectAllUsers } = selectors;",
      'Normalized `{ ids: [], entities: {} }` shape with built-in CRUD helpers (`addOne`, `updateOne`, `removeMany`) replaces hand-rolled array find/filter operations in every reducer case.',
      'Using it for non-entity data (UI state, config, counters) — the adapter pattern only pays off for collections of records with stable unique IDs.'],
    ['Immer-powered Mutations', 'RTK uses Immer to let you write "mutating" reducer code — Immer intercepts mutations on a draft proxy and produces a new immutable state.', "// Without Immer (verbose)\ncase 'user/updateName':\n  return {\n    ...state,\n    profile: {\n      ...state.profile,\n      name: action.payload,\n    },\n  };\n\n// With RTK + Immer (clear intent)\nupdateName: (state, action) => {\n  state.profile.name = action.payload;\n  // Immer produces the same immutable result above\n}",
      'Deeply nested updates that required multi-level spread (`{ ...state, a: { ...state.a, b: action.payload } }`) are written as direct assignments — same immutability guarantee, dramatically cleaner intent.',
      'Mixing draft mutation and return value in the same reducer case — returning a new value while also mutating the draft throws an Immer error at runtime.'],
  ].forEach(([name, definition, codeExample, a1, a2]) => {
    skills.push(mk(name, 'state', rtk.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the key advantage of ${name} over the equivalent vanilla Redux approach?`, a1),
        card(`What is a common misuse of ${name}?`, a2),
      ],
    }));
  });

  // ─── CONTEXT API (beginner to intermediate) ─────────────────────────────────
  const ctx = mk('Context API', 'state', null, {
    definition:
      'React Context provides a mechanism to share values between components without passing props through every level. createContext creates a context object; Provider injects a value; useContext reads it. Context is best for low-frequency updates (theme, locale, auth) shared across many components, not high-frequency state like form inputs.',
    codeExample:
      "import { createContext, useContext, useReducer, useMemo } from 'react';\n\nconst AuthCtx = createContext(null);\n\nfunction authReducer(state, action) {\n  switch (action.type) {\n    case 'login': return { ...state, user: action.payload, status: 'authed' };\n    case 'logout': return { user: null, status: 'guest' };\n    default: return state;\n  }\n}\n\nexport function AuthProvider({ children }) {\n  const [state, dispatch] = useReducer(authReducer, { user: null, status: 'guest' });\n  const value = useMemo(() => ({ ...state, dispatch }), [state]);\n  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;\n}\n\nexport const useAuth = () => {\n  const ctx = useContext(AuthCtx);\n  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');\n  return ctx;\n};",
    whenUsed:
      'Used across all React projects for theme, auth state, and locale — any value consumed by many components at different tree depths.',
    gotchas:
      'Every consumer re-renders when the context value reference changes — even if the slice they use did not change. Memoize provider values.\nA single large context with mixed state and dispatch causes over-rendering — split into separate contexts by concern.\nContext is not a replacement for state management in high-frequency update scenarios — each keystroke in a form would re-render every consumer.\nAbsence of a Provider does not throw by default — createContext(null) returns null, causing confusing runtime errors downstream unless you guard with a custom hook.',
    flashcards: [
      card('Why does wrapping a provider value in useMemo matter?', 'Without memoisation, a new object reference is created on every parent render, causing every consumer to re-render even if state values are unchanged.'),
      card('How do you prevent all context consumers from re-rendering when only one sub-value changes?', 'Split the context: separate AuthStateContext (state) from AuthDispatchContext (dispatch). Dispatch is stable; only state consumers re-render on state change.'),
      card('When should you prefer Context + useReducer over Redux?', 'Medium-complexity shared state within one feature tree, small teams, or apps where Redux\'s DevTools and middleware ecosystem are not needed. For large-scale cross-feature state, Redux scales better.'),
      card('What happens if you call useContext outside a matching Provider?', 'It returns the default value passed to createContext(). If that is null or undefined and callers don\'t guard, you get confusing null-dereference errors. Custom hooks that throw a clear error are safer.'),
      card('Why is Context not suitable for high-frequency updates like form input state?', 'Every context value change re-renders all consumers synchronously. Form keystroke updates firing 10× per second would re-render every subscribed component, including unrelated ones.'),
      card('What is the legacy Context.Consumer API and why was it replaced?', 'Context.Consumer used a render prop pattern — verbose and hard to compose. useContext hook provides the same access in a single line and composes cleanly with other hooks.'),
    ],
    apis: [
      api('createContext', 'createContext<T>(defaultValue: T): Context<T>', 'Creates a Context object with a default value used when no Provider is found above.', 'default context value', 'Context object', "const ThemeCtx = createContext<'light' | 'dark'>('light');", 'Default value is only used when there is no matching Provider in the tree. It does not trigger re-renders.'),
      api('Context.Provider', '<Context.Provider value={...}>{children}</Context.Provider>', 'Injects a context value into the component tree for all descendants.', 'value prop and children', 'React element', "<AuthCtx.Provider value={memoizedValue}>\n  <App />\n</AuthCtx.Provider>", 'All consumers re-render when value reference changes — always memoize the value object.'),
      api('useContext', 'useContext<T>(context: Context<T>): T', 'Subscribes a component to a context and returns its current value.', 'Context object', 'current context value', "const { user, dispatch } = useContext(AuthCtx);", 'Re-renders whenever the context value changes. There is no subscription selector — all consumers get the full value.'),
      api('Context.Consumer', '<Context.Consumer>{(value) => <JSX />}</Context.Consumer>', 'Legacy render-prop API for reading context (prefer useContext in function components).', 'render function child', 'React element', "<ThemeCtx.Consumer>\n  {(theme) => <div className={`app--${theme}`} />}\n</ThemeCtx.Consumer>", 'Only useful in class components that cannot use hooks.'),
      api('useReducer (Context pair)', 'const [state, dispatch] = useReducer(reducer, initialState)', 'Pairs with Context Provider to create a lightweight state machine for shared state.', 'reducer function and initial state', '[state, dispatch]', "const [state, dispatch] = useReducer(reducer, { count: 0 });\nconst value = useMemo(() => ({ state, dispatch }), [state]);\n<Ctx.Provider value={value}>{children}</Ctx.Provider>", 'Dispatch is stable across renders — put it in a separate context to avoid re-rendering dispatch-only consumers.'),
    ],
    refs: [
      ref('React Context Docs', 'https://react.dev/learn/passing-data-deeply-with-context'),
      ref('useContext Reference', 'https://react.dev/reference/react/useContext'),
      ref('Scaling Up with Reducer and Context', 'https://react.dev/learn/scaling-up-with-reducer-and-context'),
      ref('When to Use Context vs Redux', 'https://redux.js.org/faq/organizing-state#when-should-i-use-redux-vs-context'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-editor', 'p-maak'],
  });
  skills.push(ctx);

  [
    ['createContext & Provider', 'createContext initialises the context; Provider injects the value into the tree. All descendants can consume without prop drilling.', "const LocaleCtx = createContext('en');\n\nfunction LocaleProvider({ locale, children }) {\n  return (\n    <LocaleCtx.Provider value={locale}>\n      {children}\n    </LocaleCtx.Provider>\n  );\n}\n\n// Anywhere in the tree:\nconst locale = useContext(LocaleCtx);",
      'The default value passed to `createContext()` is only used when no Provider exists above the consumer — a missing Provider doesn\'t throw by default, it silently returns the default, causing confusing null-dereference errors downstream.',
      'Wrap a `useMemo` around the value object inside the Provider — a new object literal on every render is a new reference, re-rendering all consumers even when values are unchanged.'],
    ['useContext Consumer Hook', 'useContext reads the nearest Provider value and subscribes the component to re-render when it changes.', "function UserGreeting() {\n  const { user } = useContext(AuthCtx);\n  return <p>Hello, {user?.name ?? 'Guest'}</p>;\n}\n\n// Custom hook pattern — recommended\nfunction useTheme() {\n  const ctx = useContext(ThemeCtx);\n  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');\n  return ctx;\n}",
      'There is no selector — `useContext` subscribes to the entire context value. A component reading only `user.name` re-renders when any other field in the same context changes.',
      'Expose context through a custom hook (`useAuth`, `useTheme`) that throws a clear error if called outside the Provider — avoids silent null returns and makes the dependency explicit.'],
    ['Performance Pitfalls', 'Context has no selector mechanism — every consumer re-renders when the value object reference changes, even for unrelated fields.', "// ❌ One big context — every consumer re-renders on any field change\nconst value = { user, cart, theme, locale };\n\n// ✅ Separate contexts by update frequency\nconst AuthCtx = createContext(null);   // changes on login/logout\nconst CartCtx = createContext(null);   // changes on add/remove\nconst ThemeCtx = createContext('light'); // rarely changes\n\n// ✅ Memoize value to prevent reference churn\nconst value = useMemo(() => ({ user, dispatch }), [user]);",
      'A single context for all shared state — every field change (theme, user, cart) re-renders every consumer regardless of which field they actually read.',
      'Split contexts by update frequency: auth (changes once per session), theme (on toggle), cart (on add/remove). Memoize each Provider value with `useMemo` to suppress reference churn from parent re-renders.'],
    ['Splitting State from Dispatch', 'Dispatch is stable (created once). Putting it in its own context means dispatch-only consumers never re-render when state changes.', "const StateCtx = createContext(null);\nconst DispatchCtx = createContext(null);\n\nfunction StoreProvider({ children }) {\n  const [state, dispatch] = useReducer(reducer, initialState);\n  return (\n    <DispatchCtx.Provider value={dispatch}>\n      <StateCtx.Provider value={state}>\n        {children}\n      </StateCtx.Provider>\n    </DispatchCtx.Provider>\n  );\n}\n\n// Component that only dispatches never re-renders on state change\nconst dispatch = useContext(DispatchCtx);",
      '`dispatch` is stable across renders (created once by `useReducer`), but putting it in the same context as state means dispatch-only consumers (buttons, form handlers) re-render on every state change.',
      'Two contexts: `StateCtx.Provider` wraps `DispatchCtx.Provider`. Components that only dispatch (`useContext(DispatchCtx)`) are never triggered by state updates — zero unnecessary renders.'],
    ['Context API vs Redux', 'Context suits low-frequency shared values (auth, theme, locale). Redux suits complex multi-reducer state, time-travel debugging, and middleware-driven async flows.', "// Context — best for:\n// - Auth state (changes once per session)\n// - Theme (changes on user toggle)\n// - i18n locale (set at startup)\n\n// Redux — best for:\n// - Shopping cart (many actions, history)\n// - Real-time feeds (frequent updates, complex transitions)\n// - Cross-feature state needing middleware (logging, analytics)",
      'Context has no middleware, no DevTools time-travel, and no subscription selector — any of these requirements means Context is the wrong tool, not a limitation to work around.',
      'Use Context for low-frequency shared values (auth, theme, locale) with a `useMemo`-wrapped provider value and a custom hook guard. For anything with many concurrent writers or complex async flows, use Redux/Zustand.'],
  ].forEach(([name, definition, codeExample, a1, a2]) => {
    skills.push(mk(name, 'state', ctx.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the key constraint in ${name} that surprises developers?`, a1),
        card(`What is the correct way to share both state and updater via ${name}?`, a2),
      ],
    }));
  });

  // ─── MONOREPO (beginner to intermediate) ────────────────────────────────────
  const monorepo = mk('Monorepo', 'state', null, {
    definition:
      'A monorepo is a single version-controlled repository containing multiple packages or applications. It enables atomic cross-package changes, shared tooling configuration, and unified CI. Modern monorepo tools (Nx, Turborepo) add build caching and affected-only task running to keep developer experience fast at scale.',
    codeExample:
      "# pnpm workspaces monorepo structure\n# pnpm-workspace.yaml\npackages:\n  - 'apps/*'\n  - 'packages/*'\n\n# package.json (root)\n{\n  \"scripts\": {\n    \"build\": \"turbo run build\",\n    \"test\": \"turbo run test\",\n    \"lint\": \"turbo run lint\"\n  },\n  \"devDependencies\": {\n    \"turbo\": \"^2.0.0\"\n  }\n}\n\n# apps/web/package.json\n{\n  \"dependencies\": {\n    \"@org/ui\": \"workspace:*\",\n    \"@org/utils\": \"workspace:^\"\n  }\n}",
    whenUsed:
      'Common architecture for multi-app organisations. Nx and Turborepo monorepos are standard in large React/Node codebases sharing design systems and utility libraries.',
    gotchas:
      'CI without caching: running all tasks on every PR is slow — invest in remote cache (Nx Cloud, Vercel Remote Cache) early.\nDependency hoisting: shared peer deps can cause version conflicts across workspaces — use pnpm\'s strict peer-dep enforcement.\nIDE performance: very large monorepos with 100+ packages slow TypeScript language server — use project references and explicit tsconfig paths.\nOwnership confusion: without CODEOWNERS, it is unclear who is responsible for shared packages under change pressure.',
    flashcards: [
      card('What is the primary advantage of a monorepo over polyrepo for a shared design system?', 'Atomic changes — you update the design system and every consuming app in a single commit, with a single CI run, eliminating the version-bump/publish/update cycle.'),
      card('What is "affected" build optimisation and why does it matter?', 'Tools like Nx and Turborepo analyse the dependency graph and only rebuild/retest packages affected by a given change — reducing CI time from minutes to seconds on large repos.'),
      card('What is the workspace: protocol in pnpm and why use it?', 'workspace:* means "use the local workspace version of this package" — guarantees apps always use the latest local code instead of a published npm version.'),
      card('What is remote caching in Turborepo/Nx?', 'Build artefacts are cached in a remote store (Vercel, Nx Cloud). If the inputs to a task have not changed, the cached output is restored instead of re-running — CI times drop dramatically across team members.'),
      card('What is the main argument for polyrepo over monorepo?', 'Independent repository permissions, smaller clone sizes, and cleaner separation of ownership — preferred when teams have significantly different security requirements or tech stacks.'),
      card('How does Turborepo define task pipelines?', 'turbo.json declares task dependencies: "build" depends on "^build" (upstream packages must build first). This enables correct parallel execution order across the dependency graph.'),
    ],
    apis: [
      api('turbo run', 'turbo run <task> [--filter=<pkg>]', 'Runs a task across all packages in topological order with caching.', 'task name and optional filter', 'task outputs (cached or fresh)', "turbo run build --filter='@org/ui'\nturbo run test --filter='...[HEAD^1]'", 'Tasks must be declared in turbo.json pipeline before they can be run.'),
      api('nx affected', 'nx affected --target=<task>', 'Runs a task only on projects affected by current changes vs base branch.', 'target task and optional base/head', 'filtered task execution', 'nx affected --target=test\nnx affected --target=build --base=main', 'Requires nx.json project graph configuration. Most accurate when commit history is available.'),
      api('pnpm -r', 'pnpm -r run <script>', 'Runs a script in all workspace packages recursively.', 'script name', 'script output per package', 'pnpm -r run lint\npnpm -r --filter @org/ui run build', 'Order is not guaranteed — use turbo or nx for dependency-ordered execution.'),
      api('workspace protocol', '"@org/pkg": "workspace:*"', 'Instructs pnpm/yarn to resolve the dependency from the local workspace.', 'semver range or *', 'local package resolution', '"dependencies": { "@org/ui": "workspace:*" }', 'workspace:* always uses the current local version. workspace:^ uses local version matching semver range.'),
      api('turbo.json pipeline', '{ "pipeline": { "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] } } }', 'Declares task dependencies and cacheable outputs for the Turborepo task graph.', 'task names and dependency arrays', 'pipeline config', "{\n  \"pipeline\": {\n    \"build\": { \"dependsOn\": [\"^build\"], \"outputs\": [\"dist/**\"] },\n    \"test\":  { \"dependsOn\": [\"build\"] },\n    \"lint\":  {}\n  }\n}", '"^build" means all upstream packages\' build tasks must complete first.'),
      api('nx.json / project.json', 'nx.json global config; project.json per-project targets', 'Defines Nx project graph, caching rules, and per-project task configurations.', 'JSON config files', 'Nx workspace configuration', "// project.json\n{\n  \"targets\": {\n    \"build\": { \"executor\": \"@nx/webpack:webpack\", \"outputs\": [\"{projectRoot}/dist\"] },\n    \"test\":  { \"executor\": \"@nx/jest:jest\" }\n  }\n}", 'Nx infers many targets automatically; explicit project.json overrides inference.'),
    ],
    refs: [
      ref('monorepo.tools', 'https://monorepo.tools/'),
      ref('Turborepo Docs', 'https://turbo.build/repo/docs'),
      ref('Nx Docs', 'https://nx.dev/getting-started/intro'),
      ref('pnpm Workspaces', 'https://pnpm.io/workspaces'),
      ref('Lerna Docs', 'https://lerna.js.org/'),
    ],
    relatedProjectIds: [],
  });
  skills.push(monorepo);

  [
    ['Why Monorepos', 'Atomic cross-package changes, shared tooling, single CI pipeline, and easier refactoring across package boundaries.', "# Problem in polyrepo: update shared utils\n# 1. Bump version in @org/utils → publish\n# 2. Update @org/web → bump dep → PR\n# 3. Update @org/app → bump dep → PR\n# Three PRs, three CI runs, version sync risk\n\n# In monorepo:\n# 1. Change @org/utils\n# 2. Update all consumers in same commit\n# One PR, one CI run, atomic change",
      'Whether the team actually shares code across packages frequently — a monorepo without genuine cross-package sharing adds tooling overhead for no isolation benefit.',
      'PR size — without enforced module boundaries and CI scoping, monorepo PRs grow to touch everything and review becomes impossible.'],
    ['Nx vs Turborepo vs Lerna', 'Nx: full-featured with code generation, project graph, and plugins. Turborepo: simpler, focused on build caching. Lerna: legacy, now delegates to Nx for task running.', "# Turborepo — minimal config\n# turbo.json\n{ \"pipeline\": { \"build\": { \"dependsOn\": [\"^build\"] } } }\n\n# Nx — richer tooling\n# nx.json\n{ \"tasksRunnerOptions\": { \"default\": { \"runner\": \"nx/tasks-runners/default\" } } }\n\n# Lerna (modern)\n# delegates to nx under the hood:\nlerna run build --since=HEAD^1",
      'Scale and feature needs — Turborepo for fast setup and build caching with minimal config; Nx when you need code generation, project graph visualization, and rich plugin ecosystem. Lerna alone is legacy.',
      'Build correctness — Turborepo relies on correct `outputs` and `inputs` declarations; wrong declarations produce stale cache hits that hide real failures.'],
    ['Build Caching', 'Local and remote caching avoids re-running tasks whose inputs (source files, env, deps) have not changed — the biggest CI time saver.', "# turbo.json — declare what to cache\n{\n  \"pipeline\": {\n    \"build\": {\n      \"outputs\": [\"dist/**\", \".next/**\"],\n      \"inputs\": [\"src/**\", \"package.json\"]\n    }\n  }\n}\n\n# Remote cache (Vercel)\nNX_CLOUD_ACCESS_TOKEN=... nx run-many --target=build\n# or\nVERCEL_REMOTE_CACHE_TOKEN=... turbo run build",
      'Whether to use local-only caching (free, no setup) or remote cache (Nx Cloud, Vercel Remote Cache) — local cache only helps the individual developer; remote cache shares hits across the whole team and CI.',
      'Cache invalidation accuracy — if `inputs` are declared too broadly, everything rebuilds; too narrowly, stale outputs are served. Neither is immediately obvious until a missed cache hit causes a prod bug.'],
    ['Selective Testing & Building', 'Run only tasks in packages affected by the current change, not the entire repo — keeps CI fast as the repo grows.', "# Turborepo — affected by changes since main\nturbo run test --filter='...[origin/main]'\n\n# Nx affected\nnx affected --target=test --base=origin/main\n\n# pnpm filter (manual)\npnpm --filter @org/ui... run test\n# '...' means @org/ui and all its dependents",
      'Whether affected analysis is based on file-level change detection (Turborepo) or an explicit project graph (Nx) — Nx\'s graph is more accurate for deep dependency chains but requires configuration.',
      'False confidence from affected filters — a package excluded from the affected set skips tests entirely, so a missing dependency declaration means a breaking change ships undetected.'],
    ['Shared Deps Management', 'Root-level devDependencies, workspace protocol for internal packages, and version sync tools prevent divergence.', "# pnpm-workspace.yaml\npackages:\n  - 'apps/*'\n  - 'packages/*'\n\n# Root package.json — shared tooling at root\n{\n  \"devDependencies\": {\n    \"typescript\": \"^5.4.0\",\n    \"eslint\": \"^9.0.0\",\n    \"vitest\": \"^1.0.0\"\n  }\n}\n\n# Sync versions with syncpack\nnpx syncpack list-mismatches",
      'Whether to pin shared devDependencies at the root or allow per-package overrides — root pinning enforces consistency but blocks packages that legitimately need a different version.',
      'Version drift — without `syncpack` or similar enforcement, packages silently drift to different versions of the same dep, producing runtime behavior that differs between packages and CI environments.'],
    ['Trade-offs vs Polyrepo', 'Monorepo wins on sharing and atomicity. Polyrepo wins on isolation, permissions, and independent scaling.', "# Monorepo pros:\n# + Atomic changes across packages\n# + Shared lint/test/build config\n# + Easier dependency graph visibility\n# + Single PR for cross-cutting refactors\n\n# Monorepo cons:\n# - Slower git operations at very large scale\n# - Complex CI setup without caching investment\n# - IDE TypeScript perf degrades with many packages\n# - Fine-grained access control is harder",
      'Whether the dominant need is cross-package atomic changes (monorepo wins) or independent security perimeters and clone sizes (polyrepo wins) — pick the axis that actually constrains your team.',
      'Clone and CI time at scale — without sparse checkout and remote caching, a large monorepo slows every developer\'s first-setup and every CI run proportionally to repo size.'],
  ].forEach(([name, definition, codeExample, a1, a2]) => {
    skills.push(mk(name, 'state', monorepo.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the key tooling decision in ${name}?`, a1),
        card(`What breaks first in ${name} without proper setup?`, a2),
      ],
    }));
  });

  // ─── MVC (beginner to intermediate) ─────────────────────────────────────────
  const mvc = mk('MVC', 'state', null, {
    definition:
      'MVC (Model-View-Controller) separates an application into three roles: Model owns data and business logic, View renders the UI, Controller handles user input and mediates between Model and View. It is the dominant pattern in server-rendered frameworks (Rails, Laravel, ASP.NET) and influenced early single-page app frameworks.',
    codeExample:
      "// Express MVC example — server-side\n// Model (data + business logic)\nclass UserModel {\n  static async findById(id) {\n    return db.query('SELECT * FROM users WHERE id = ?', [id]);\n  }\n  static async create(data) {\n    return db.query('INSERT INTO users SET ?', [data]);\n  }\n}\n\n// Controller (handles request, calls model, selects view)\nclass UserController {\n  async show(req, res) {\n    const user = await UserModel.findById(req.params.id);\n    if (!user) return res.status(404).render('error', { message: 'Not found' });\n    res.render('users/show', { user });\n  }\n}\n\n// View — users/show.ejs\n// <h1><%= user.name %></h1>",
    whenUsed:
      'Applies to server-side frameworks (Express + template engines, Rails-style APIs). React\'s unidirectional flow is a deliberate departure from classic MVC\'s two-way binding.',
    gotchas:
      'Fat controllers: business logic creeping into controllers makes them hard to test. Keep controllers thin — they should only orchestrate, never compute.\nView-model coupling: views that reach into model internals create tight coupling — pass view-model DTOs instead.\nTwo-way binding (MVVM variant): Angular-style two-way binding can make data flow hard to trace at scale.\nMVC in SPAs: React deliberately avoids classic MVC — components blend view and controller concerns with hooks separating state management.',
    flashcards: [
      card('What is the single responsibility of each MVC layer?', 'Model: data and business rules. View: rendering data as UI. Controller: receiving input, invoking model methods, selecting the view to render.'),
      card('Why did React move away from classic MVC?', 'Classic MVC\'s two-way data binding and event-driven updates become hard to trace in complex UIs. React\'s unidirectional flow (state → render → action → state) is more predictable.'),
      card('What is the "fat controller" anti-pattern?', 'Business logic accumulating in controllers rather than models — controllers become hard to unit test and changes break multiple request handlers at once.'),
      card('What is the difference between MVC and MVVM?', 'MVVM (Model-View-ViewModel) adds a ViewModel layer that binds directly to View via two-way data binding (Angular, Vue), automating sync between UI and state. MVC uses explicit controller mediation.'),
      card('When does MVC still make sense in modern development?', 'Server-rendered applications (Rails, Laravel, Django), REST APIs where controllers map to resource endpoints, and admin panels where the simplicity of request → model → response outweighs SPA complexity.'),
      card('What is the Law of Demeter and why is it relevant to MVC?', 'A module should only talk to its direct neighbours. In MVC: Views should not call Model methods directly; Controllers mediate. Violations create tight coupling that makes refactoring cascade.'),
    ],
    apis: [],
    refs: [
      ref('MVC Pattern (MDN)', 'https://developer.mozilla.org/en-US/docs/Glossary/MVC'),
      ref('Ruby on Rails MVC', 'https://guides.rubyonrails.org/getting_started.html#mvc-and-you'),
      ref('Martin Fowler — GUI Architectures', 'https://martinfowler.com/eaaDev/uiArchs.html'),
    ],
    relatedProjectIds: [],
  });
  skills.push(mvc);

  [
    ['Model, View, Controller', 'Three distinct roles with clear boundaries: Model owns data integrity, View renders without logic, Controller routes input to model operations.', "// Thin controller (good)\nclass OrderController {\n  async create(req, res) {\n    const order = await OrderService.create(req.body, req.user);\n    res.status(201).json(order);\n  }\n}\n\n// Service/Model owns logic\nclass OrderService {\n  static async create(data, user) {\n    await validateStock(data.items);\n    const order = await Order.create({ ...data, userId: user.id });\n    await notifyWarehouse(order);\n    return order;\n  }\n}",
      'Strict boundary ownership — the Model enforces business rules and data integrity, the View renders without any logic, and the Controller orchestrates without computing — crossing these boundaries is a code smell.',
      'The Controller — it becomes a dumping ground for validation, transformation, and authorization logic that belongs in the Model layer. Fat controllers cannot be unit tested without the full request pipeline.'],
    ['MVP vs MVVM vs MVC', 'Three related patterns with different View-logic coupling strategies, suited to different frameworks and testability requirements.', "// MVC — Controller mediates\nController → Model → view.render(data)\n\n// MVP — Presenter replaces Controller; View is passive\nView.onButtonClick → Presenter.handleSave()\nPresenter → Model.save() → View.showSuccess()\n// View has no logic; Presenter is fully testable\n\n// MVVM — ViewModel binds to View two-way\nViewModel.name = 'Alice' → <input value='Alice' /> auto-updates\n<input> changes → ViewModel.name updates auto\n// Angular/Vue approach",
      'Testability of the middle layer — MVP\'s Presenter has no framework dependency and is unit-testable; MVVM\'s ViewModel is testable but adds two-way binding complexity; MVC\'s Controller is request-coupled and harder to test in isolation.',
      'MVVM two-way binding at scale — automatic sync between View and ViewModel makes data flow hard to trace when multiple bindings update each other, producing update loops and race conditions.'],
    ['Two-Way Binding', 'MVVM pattern where View and ViewModel stay in sync automatically — convenient but can obscure data flow in large apps.', "// Angular two-way binding\n<input [(ngModel)]='user.name' />\n// Changing the input updates user.name in the component\n// Changing user.name updates the input value\n\n// React's deliberate one-way alternative\n<input value={user.name} onChange={(e) => setName(e.target.value)} />\n// Explicit: change event → state update → re-render\n// Easier to trace; more verbose",
      'Traceability — two-way binding hides which side initiated a change. React\'s one-way alternative makes every state mutation explicit: `onChange → setState → re-render`.',
      'Circular updates — a ViewModel updates a bound field, which triggers an onChange, which updates the ViewModel again. Frameworks add guards against infinite loops but the bugs are subtle and hard to reproduce.'],
    ['Pros/Cons in Modern Web', 'MVC\'s strengths in server rendering; its limitations in client-side SPA complexity drove the React/component model.', "// MVC strengths:\n// + Clear separation for server-rendered apps\n// + Rails/Laravel convention reduces decision fatigue\n// + Straightforward for CRUD resource APIs\n\n// MVC limitations in SPAs:\n// - Controller becomes a grab-bag as UI complexity grows\n// - View state (loading, validation) doesn't fit Model cleanly\n// - Two-way binding obscures mutation sources\n// React solution: components + unidirectional state",
      'Server-rendered vs client-rendered context — MVC\'s request/response lifecycle maps cleanly to server rendering (Rails, Laravel); it becomes awkward in SPAs where the "View" manages its own reactive state independently of the Controller.',
      'Client-side state management — MVC has no pattern for local UI state (loading, hover, open/closed) that lives between requests. SPAs accumulate this state in Controllers or Views, breaking the separation MVC was designed to enforce.'],
    ['When MVC Still Makes Sense', 'Server-rendered apps, REST APIs, admin tools, and domains with clear resource→action mappings benefit from MVC conventions.', "// Ruby on Rails — MVC as convention\nrails generate scaffold User name:string email:string\n# Generates:\n# app/models/user.rb\n# app/controllers/users_controller.rb\n# app/views/users/*.html.erb\n# db/migrate/..._create_users.rb\n\n// Express resource controller\nrouter.get('/users/:id', userController.show);\nrouter.post('/users',     userController.create);\nrouter.patch('/users/:id', userController.update);\nrouter.delete('/users/:id', userController.destroy);",
      'Whether the domain is resource-oriented and server-rendered — MVC conventions (one controller per resource, RESTful verbs, template views) are productivity multipliers in Rails/Laravel but become ceremony in React SPAs.',
      'The Controller-grows-into-a-God-object problem — as features accumulate, controllers in unstructured MVC apps absorb authorization, caching, and reporting logic until each action method is 200+ lines.'],
  ].forEach(([name, definition, codeExample, a1, a2]) => {
    skills.push(mk(name, 'state', mvc.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the core design principle behind ${name}?`, a1),
        card(`Where does ${name} break down in practice?`, a2),
      ],
    }));
  });

  // ─── MONOLITHIC (beginner to intermediate) ───────────────────────────────────
  const monolith = mk('Monolithic', 'state', null, {
    definition:
      'A monolithic architecture packages all application concerns — UI, business logic, and data access — into a single deployable unit. It is simpler to develop, test, and deploy at early scale, and avoids the distributed-systems complexity of microservices. The trade-off is that scaling, independent deployment, and large-team coordination become harder as the application grows.',
    codeExample:
      "// Typical modular monolith structure (Node.js/Express)\n// A single deployable, but logically separated by module\n\n// src/\n//   modules/\n//     orders/\n//       orders.controller.js\n//       orders.service.js\n//       orders.repository.js\n//     users/\n//       users.controller.js\n//       ...\n//   shared/\n//     db.js\n//     auth.middleware.js\n//   app.js         ← single entry point\n\n// All modules share one DB connection, one process, one deploy.\n// Extract to microservices only when a specific module's scaling\n// needs can't be met within the monolith.",
    whenUsed:
      'The right default for most projects at founding. Shopify, Stack Overflow, GitHub all scaled significantly as monoliths before selectively extracting services.',
    gotchas:
      'Big Ball of Mud: without module boundaries, cross-concern imports proliferate — any module imports any other, creating an unstructured tangle.\nDeployment coupling: a bug in one module requires redeploying the entire application.\nScaling ceiling: you can only scale the entire application, not individual high-load modules independently.\nTest suite slowdown: a single test run for the whole application grows linearly — invest in test layering (unit/integration/e2e) early.',
    flashcards: [
      card('What is the strongest argument for starting with a monolith over microservices?', '"Monolith first" (Martin Fowler): service boundaries are hard to get right without deep domain understanding. A premature microservice split creates distributed-system complexity without the scale justification.'),
      card('What is a modular monolith and how does it differ from a Big Ball of Mud?', 'A modular monolith enforces strict module boundaries (no cross-module direct imports — only public APIs) while remaining a single deployable. A Big Ball of Mud has no boundaries — everything imports everything.'),
      card('At what point does a monolith justify extraction to microservices?', 'When a specific module has independent scaling needs, a separate release cadence, or a different tech stack requirement — not just because the codebase is "large".'),
      card('How does a monolith simplify database operations that microservices complicate?', 'All modules share one transactional database — atomic cross-module operations are trivial. Microservices require distributed transactions (saga pattern) or eventual consistency, which is significantly harder.'),
      card('What is the "strangler fig" pattern for monolith migration?', 'New functionality is built as separate services while the monolith shrinks. A facade/proxy routes requests — over time the monolith is "strangled" and replaced by services without a big-bang rewrite.'),
      card('Why do most startups default to monolith architecture?', 'Fastest time to market, simplest deployment (one process, one DB), easiest debugging, and cheapest infrastructure. The scale problem is a good problem to have — solve it when it actually arrives.'),
    ],
    apis: [],
    refs: [
      ref('MonolithFirst (Martin Fowler)', 'https://martinfowler.com/bliki/MonolithFirst.html'),
      ref('Modular Monolith (Sam Newman)', 'https://samnewman.io/blog/2019/02/19/monolith-to-microservices/'),
      ref('Strangler Fig Pattern', 'https://martinfowler.com/bliki/StranglerFigApplication.html'),
      ref('Shopify Monolith Blog', 'https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity'),
    ],
    relatedProjectIds: [],
  });
  skills.push(monolith);

  [
    ['Definition & Characteristics', 'Single codebase, single deployable, shared process and database. All modules run in the same runtime and can call each other directly.', "// Everything in one deploy unit\n// Starting a monolith is as simple as:\nnode src/app.js\n\n// vs microservices startup:\ndocker-compose up  # 8 services\n// Each service: its own port, DB, health check, logs, deploy\n\n// Monolith: one process, one DB, one log stream, one deploy",
      'Can the team deploy, debug, and reason about the entire application as a single unit without coordination overhead? If yes, a monolith is appropriate — the simplicity benefit is real.',
      'Deployment frequency starts dropping — teams avoid deploying because any change risks the whole app. Fear of deploy is the earliest sign the monolith needs module discipline or service extraction.'],
    ['Pros', 'Simpler development loop, atomic transactions across modules, easier local debugging, single deployment artifact, no network latency between modules.', "// Atomic transaction spanning two 'modules' — trivial in monolith\nawait db.transaction(async (tx) => {\n  await tx('orders').insert(order);\n  await tx('inventory').decrement({ id: item.id }, 'quantity', 1);\n  await tx('payments').insert(payment);\n  // All three commit or all rollback\n});\n\n// In microservices: requires saga pattern or 2PC\n// — significantly more complex and failure-prone",
      'Does the application require atomic cross-module transactions or low-latency inter-module calls? These are monolith\'s structural advantages — distributed systems require sagas or eventual consistency to replicate them.',
      'When the shared database becomes a coordination problem — multiple teams adding columns and migrations to the same schema without coordination leads to conflicts, long review queues, and deploy blocking.'],
    ['Cons', 'Scaling requires duplicating the whole app, deployment risk affects all modules, large teams create merge conflicts, tech stack is shared.', "// Scaling problem:\n// CPU spike in PDF generation → must scale entire app\n// In microservices: only scale the PDF service\n\n// Deployment risk:\n// Bug in user module → redeploy billing, payments, reporting too\n\n// Team collision:\n// 10 teams modifying the same codebase\n// → long PR queues, merge conflicts, integration hell",
      'Is the scaling bottleneck truly application-wide, or is it one specific module? If one module (PDF generation, video processing) is the bottleneck, extracting it as a service targets the problem without rearchitecting everything.',
      'Deployment pipeline time — a monolith test suite that takes 40+ minutes to run becomes the bottleneck for every team\'s PR. That\'s the operational signal, not code size.'],
    ['Modular Monolith', 'Strict internal boundaries with a public module API — gets most of monolith benefits while avoiding the Big Ball of Mud, and makes future extraction easier.', "// Strict module boundary — only export public API\n// src/modules/orders/index.js\nexport { createOrder, getOrder, listOrders } from './orders.service';\n// ❌ Never import from orders/orders.repository.js directly\n\n// Dependency rule enforced by ESLint plugin:\n// eslint-plugin-import — no-restricted-imports\n// modules/billing must not import from modules/orders internals",
      'Are internal module boundaries enforced by tooling (ESLint `no-restricted-imports`, architectural linting) or only by convention? Convention-only boundaries erode under deadline pressure within months.',
      'Import leakage — modules start importing from each other\'s internal files instead of their public index. Once internals are coupled, the modular monolith is indistinguishable from a Big Ball of Mud.'],
    ['When to Start With Monolith', 'Default choice for new products — premature microservice splits create distributed complexity before domain boundaries are understood.', "// Decision checklist:\n// ✅ Start monolith if:\n// - Team < 10 engineers\n// - Domain not yet fully understood\n// - < 1M requests/day\n// - Budget / infra constraints\n\n// Consider extracting when:\n// - Specific module has 10x traffic of others\n// - Module needs different tech stack\n// - Team > 50 and deployment coordination is a bottleneck",
      'Is the team fewer than ~10 engineers and the domain still being discovered? Premature microservice splits lock in wrong service boundaries that are painful to undo — monolith first lets domain understanding drive future extraction.',
      'The absence of a shared database becomes a discussion topic — when multiple engineers independently suggest splitting a module\'s data out, that module has found its natural service boundary.'],
    ['Migration Paths to Microservices', 'Strangler Fig: incrementally route traffic to new services while the monolith shrinks. Branch by abstraction: introduce interface in monolith, swap implementation behind it.', "// Strangler Fig — step by step\n// 1. Add a proxy/API gateway in front of monolith\n// 2. Extract User Auth to its own service\n// 3. Proxy routes /auth/* to new service\n// 4. Test — old monolith auth still handles fallback\n// 5. Once new service is stable, remove monolith auth module\n// 6. Repeat for next module\n\n// Key: the monolith continues to serve production\n// throughout — no big-bang rewrite",
      'Is the extraction driven by a concrete operational need (independent scaling, different release cadence, different stack) or by desire for architectural elegance? Extraction without an operational driver adds distributed-system complexity with no payoff.',
      'The strangler façade routing layer — it becomes a new monolith of routing rules that nobody owns. Clear ownership and a plan to delete routing rules as modules are fully extracted is mandatory from day one.'],
  ].forEach(([name, definition, codeExample, a1, a2]) => {
    skills.push(mk(name, 'state', monolith.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the practical test for whether ${name} is the right choice?`, a1),
        card(`What signal tells you it is time to move beyond ${name}?`, a2),
      ],
    }));
  });

  // ─── FRONTEND ARCHITECTURE (zero to hero) ──────────────────────────────────
  const archSkill = mk('Frontend Architecture', 'state', null, {
    definition:
      'System-level design of how a frontend codebase is organized — modules, state flow, data layer, rendering strategy, deployment. Aims for scalability, maintainability, and team velocity at scale. Becomes critical past ~20 screens or 5+ engineers.',
    codeExample:
      "// Layered architecture — separation of concerns\n//\n// UI (components, screens)\n//   ↓\n// Hooks (orchestration, state binding)\n//   ↓\n// Services (API clients, business logic)\n//   ↓\n// Infrastructure (HTTP, storage, WebSocket)\n\nsrc/\n  features/        // feature-isolated modules\n    checkout/\n    auth/\n  shared/          // cross-feature primitives\n  services/        // API + business logic\n  hooks/           // reusable orchestration\n  store/           // global state\n  design-system/   // tokens + base components\n  utils/",
    whenUsed:
      'Architectural decisions on Stock Trading Platform (real-time + virtualization), Documentation Platform (collaborative + Next.js rendering), Dynamic Content Editor (microfrontend isolation).',
    gotchas:
      "Premature architecture — over-engineering small apps with patterns made for 100-dev teams.\nTreating client state and server state as the same thing — different lifecycle, different tools.\nAdopting microfrontends with one team — paying isolation cost with no isolation benefit.\nRBAC enforced only on frontend — bypassable via direct API calls.\nMassive component files that hide business logic — kills testability and reuse.",
    flashcards: [
      card('What is frontend architecture?', 'System-level design of how a frontend codebase is organized — modules, state, data flow, rendering strategy, deployment. Aims for scalability, maintainability, team velocity.'),
      card('Why does architecture matter as the app grows?', 'Small apps tolerate sloppy structure. At scale, lack of architecture causes coupling, slow onboarding, regression risk, blocked teams. Architecture is the cost of avoiding rewrites.'),
      card('Difference between small app structure vs enterprise architecture?', 'Small: flat folders, single state store, manual choices. Enterprise: feature/domain isolation, layered concerns (UI/services/state), tooling for cross-team boundaries (codeowners, lint rules), explicit contracts.'),
      card('Common architecture anti-patterns at senior level?', 'Massive components, prop drilling everywhere, business logic in UI, over-globalized state, duplicate API calls, tight coupling between unrelated features.'),
      card('What does "scalability" mean for a frontend codebase?', "Three axes — team scalability (many devs without conflict), codebase scalability (adding features doesn't slow CI/build), deployment scalability (independent feature releases)."),
      card('What is dependency inversion in frontend?', "High-level modules don't depend on low-level details. Components depend on hook interfaces, not concrete API clients. Inject implementations at top level. Makes testing trivial and swapping backends easy."),
      card('How to choose technologies for a new frontend?', 'Decision factors: team size, SEO needs, real-time needs, offline support, perf targets, ecosystem maturity, hiring market. Bias to boring tech for unknowns.'),
      card('How do you measure architecture quality?', 'Cycle time (commit → prod), p95 build time, bundle size budget breaches, % of features behind flags, MTBF for prod incidents, Lighthouse scores, time-to-onboard new dev.'),
      card('How to handle technical debt at architecture level?', 'Tracked in the same backlog as features, not "later" docs. Budget % of each sprint for debt. Block new features on related debt thresholds. Maintain a debt dashboard for product visibility.'),
      card('When is component composition preferred over inheritance?', "Almost always in React. Composition (children as components, slot patterns) is flexible and reusable. Inheritance creates rigid hierarchies that don't map well to UI variation."),
    ],
    apis: [],
    refs: [
      ref('Patterns.dev — Modern web app patterns', 'https://www.patterns.dev/'),
      ref('Clean Architecture (Robert C. Martin)', 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html'),
      ref('Bulletproof React — feature-based scalable structure', 'https://github.com/alan2207/bulletproof-react'),
      ref('web.dev — Application performance', 'https://web.dev/explore/performance'),
      ref('Frontend at Scale', 'https://frontendatscale.com/'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-editor'],
  });

  const subStructure = mk('Project Structure & Foundations', 'state', archSkill.id, {
    definition:
      "Feature-based folder organization groups a feature's components, hooks, services, and types together rather than by technical type — making each feature independently deletable and findable. Past ~20 screens, type-based structures (components/, services/) create massive folders of unrelated code. Other features import only through a defined barrel index, preventing accidental coupling across team boundaries.",
    codeExample:
      "// Feature-based structure (recommended for scale)\nsrc/\n  features/\n    auth/\n      components/   // LoginForm, OAuthButton\n      hooks/        // useAuth, useSession\n      services/     // authService.ts\n      types.ts\n      index.ts      // public API — only import from here\n    checkout/\n      components/\n      hooks/\n      services/\n      index.ts\n  shared/\n    components/     // Button, Input, Modal\n    hooks/          // useDebounce, useLocalStorage\n    utils/\n  services/         // HTTP client, third-party SDKs\n  store/            // global state slices\n  design-system/    // tokens, base styles\n  app/              // routing, providers, app shell",
    gotchas:
      'Missing barrel index.ts in feature folders — consumers import from internal paths, creating invisible coupling.\nType-based folders at scale — components/ with 200 files mixes unrelated concerns side by side.\nNo CODEOWNERS file — ownership unclear under change pressure; cross-team refactors stall.',
    flashcards: [
      card('Feature-based vs type-based folder structure — which scales?', 'Feature-based wins past ~20 screens. Type-based (components/, services/) co-locates unrelated code; feature-based (features/checkout/, features/auth/) keeps related code together — easier to delete, easier to find.'),
      card('When does domain-driven frontend make sense?', 'When backend is already DDD-aligned and product thinks in bounded contexts. Maps frontend feature folders to domains, makes cross-team ownership clear.'),
      card('Monorepo vs polyrepo for frontend?', 'Monorepo (Nx, Turborepo): shared code, atomic refactors, single PR for breaking changes. Polyrepo: independent versioning, smaller CI scope. Pick monorepo if teams collaborate frequently.'),
      card('What is feature isolation?', 'A feature folder owns its components, hooks, services, types. Other features import only through a defined public API (index.ts barrel). Prevents accidental coupling across teams.'),
    ],
    refs: [
      ref('Bulletproof React — feature-based structure', 'https://github.com/alan2207/bulletproof-react'),
      ref('monorepo.tools', 'https://monorepo.tools/'),
      ref('Nx — Smart Monorepos', 'https://nx.dev/'),
      ref('Turborepo Docs', 'https://turbo.build/repo/docs'),
    ],
  });

  const subBusiness = mk('Business Logic Separation', 'state', archSkill.id, {
    definition:
      'Business logic separation keeps UI components purely declarative — they receive data and callbacks, never implement rules. Custom hooks own orchestration (data fetching, state transitions, side effects) and service modules own pure business logic and API calls. The layered pattern UI → Hook → Service → API makes each layer independently testable and reusable across screens.',
    codeExample:
      "// Service layer — no React, no hooks\nexport async function submitOrder(items, userId) {\n  const validated = validateStock(items);\n  return api.post('/orders', { items: validated, userId });\n}\n\n// Hook — orchestration + state\nexport function useCheckout(userId) {\n  const [status, setStatus] = useState('idle');\n  async function checkout(items) {\n    setStatus('loading');\n    try {\n      await submitOrder(items, userId);\n      setStatus('success');\n    } catch {\n      setStatus('error');\n    }\n  }\n  return { status, checkout };\n}\n\n// Component — pure UI, no logic\nfunction CheckoutButton({ items, userId }) {\n  const { status, checkout } = useCheckout(userId);\n  return (\n    <button onClick={() => checkout(items)} disabled={status === 'loading'}>\n      {status === 'loading' ? 'Placing order…' : 'Buy now'}\n    </button>\n  );\n}",
    gotchas:
      'Business logic in onClick handlers — untestable without rendering, impossible to reuse across screens.\nFat hooks that both fetch data AND implement validation rules — split into hook (orchestration) + service (logic).\nService functions that import React hooks — breaks non-React consumers and makes unit testing impossible.',
    flashcards: [
      card('How do you separate business logic from UI in React?', 'Push logic into custom hooks and service modules. Components stay declarative — receive data and callbacks via props. Pattern: UI → Hook → Service → API.'),
      card('Container/presentational pattern — still relevant?', "Less rigid post-hooks. Hooks let you mix concerns cleanly. But the idea — keep render code dumb, push side effects to a layer — still holds. Now it's \"hook + view\" not \"container + view\"."),
      card('What goes into a service layer?', "API calls, request transformations, response mapping to domain types, retry/auth logic. Components and hooks call services; services don't know about React."),
      card('Why avoid business logic inside UI components?', 'Untestable without rendering, hard to reuse, mixes concerns. Move it to hooks/services so you can test it as pure functions and reuse across screens.'),
    ],
    refs: [
      ref('React — Reusing Logic with Custom Hooks', 'https://react.dev/learn/reusing-logic-with-custom-hooks'),
      ref('Patterns.dev — Presentational/Container', 'https://www.patterns.dev/react/presentational-container-pattern/'),
      ref('Bulletproof React — project structure', 'https://github.com/alan2207/bulletproof-react'),
      ref('Clean Architecture (Robert C. Martin)', 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html'),
    ],
  });

  const subState = mk('State Architecture', 'state', archSkill.id, {
    definition:
      'Client state (UI toggles, modals, draft values) and server state (fetched data) have fundamentally different lifecycles — server state requires cache invalidation, staleness detection, and background refetching. TanStack Query or SWR manage server state; Zustand or Redux manage client state. Conflating both into a single Redux store causes stale data, manual invalidation bugs, and excessive re-fetching.',
    codeExample:
      "// Server state — TanStack Query owns caching + refetch\nimport { useQuery } from '@tanstack/react-query';\n\nfunction useStockPrices(symbols) {\n  return useQuery({\n    queryKey: ['stocks', symbols],\n    queryFn: () => fetchStocks(symbols),\n    staleTime: 5_000,         // consider fresh for 5s\n    refetchInterval: 10_000,  // poll every 10s\n  });\n}\n\n// Client state — Zustand owns UI-only state\nimport { create } from 'zustand';\n\nconst useUIStore = create((set) => ({\n  sidebarOpen: false,\n  selectedSymbol: null,\n  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),\n  selectSymbol: (sym) => set({ selectedSymbol: sym }),\n}));",
    gotchas:
      'Storing server data in Redux without TanStack Query — manual loading/error/stale state on every slice, no cache sharing.\nContext API for high-churn server state — every update re-renders all consumers regardless of relevance.\nNo normalization for entity collections — duplicate data across slices diverges silently on partial updates.',
    flashcards: [
      card('Client state vs server state?', 'Client state = UI-only data (toggles, drafts, modals). Server state = backend-owned data fetched and cached locally. Treating them the same is a common mistake — server state needs cache invalidation, staleness handling, refetching.'),
      card('Why does TanStack Query exist when Redux is here?', 'Redux for client state. TanStack Query for server state — automatic caching, deduplication, stale-while-revalidate, refetch-on-focus. Different problems, different tools.'),
      card('When is Context API the wrong choice?', 'When the context value changes frequently and many consumers read it — every consumer re-renders. For high-churn state use Redux/Zustand. Context is good for low-churn (theme, locale, current user).'),
      card('What is state normalization?', 'Storing entities by ID in a flat structure (`{ users: { [id]: User } }`) instead of nested arrays. Enables O(1) lookups, prevents duplication, simplifies updates.'),
      card('What is derived state?', 'State computed from other state at read time, not stored separately. Prevents synchronization bugs. Selectors (Redux reselect, useMemo) compute and cache derived values.'),
      card('Optimistic update pattern?', 'Update UI immediately on user action, then call API. On error, rollback. Trades correctness for perceived speed — fine for low-stakes ops (likes, edits), wrong for payments.'),
      card('When to choose Zustand over Redux?', 'Smaller boilerplate, no provider tree needed, simpler mental model. Pick Zustand for small-to-medium apps. Redux still wins for time-travel debugging, devtools depth, large team conventions.'),
    ],
    refs: [
      ref('TanStack Query Docs', 'https://tanstack.com/query/latest'),
      ref('Redux Docs', 'https://redux.js.org/'),
      ref('Zustand — GitHub', 'https://github.com/pmndrs/zustand'),
      ref('TkDodo — Practical React Query', 'https://tkdodo.eu/blog/practical-react-query'),
    ],
  });

  const subApi = mk('API & Service Layer', 'state', archSkill.id, {
    definition:
      'A centralized HTTP client (Axios instance or fetch wrapper) provides a single place to configure base URLs, auth headers, interceptors, and error normalization. Service functions wrap endpoints and return typed domain objects — components and hooks never call fetch/axios directly. Interceptors handle token refresh, retry on transient failures, and request cancellation without per-component boilerplate.',
    codeExample:
      "// Centralized Axios instance with token refresh\nimport axios from 'axios';\n\nconst http = axios.create({ baseURL: '/api', timeout: 10_000 });\n\nlet isRefreshing = false;\nlet queue = [];\n\nhttp.interceptors.response.use(null, async (error) => {\n  if (error.response?.status !== 401) return Promise.reject(error);\n  if (isRefreshing) {\n    return new Promise((res, rej) => queue.push({ res, rej }))\n      .then((token) => {\n        error.config.headers.Authorization = `Bearer ${token}`;\n        return http(error.config);\n      });\n  }\n  isRefreshing = true;\n  try {\n    const { token } = await refreshTokens();\n    queue.forEach(({ res }) => res(token));\n    error.config.headers.Authorization = `Bearer ${token}`;\n    return http(error.config);\n  } finally {\n    isRefreshing = false;\n    queue = [];\n  }\n});\n\n// Service function\nexport const stocksService = {\n  getQuote: (symbol) => http.get(`/stocks/${symbol}`).then((r) => r.data),\n};",
    gotchas:
      'N+1 parallel 401s — token refresh must be serialized with a queue, not fired once per failing request.\nHTTP errors not thrown by default in fetch — check response.ok and throw explicitly (axios throws on non-2xx automatically).\nNo request cancellation on unmount — stale responses update the wrong screen; use AbortController or TanStack Query.',
    flashcards: [
      card('Why a service layer in frontend?', 'Centralize API calls so UI components stay declarative. Easier to mock for tests. Single place to add interceptors, retries, auth headers, logging.'),
      card('Where should retry logic live?', 'In the HTTP client layer (axios interceptor, fetch wrapper) — not per-component. Centralize retry policy (which errors retry, max attempts, backoff).'),
      card('Token refresh flow architecture?', "Interceptor catches 401, queues failed requests, calls refresh endpoint, retries originals with new token. Single in-flight refresh — don't fire N parallel refreshes for N parallel 401s."),
      card('Why does request cancellation matter?', 'User navigates away mid-fetch → response arrives → updates stale screen, or leaks data into wrong screen. AbortController cancels in-flight requests on unmount or new query.'),
      card('How to standardize API errors?', 'Define error envelope: { code, message, details, traceId }. Client maps code to user message + action. Never show raw server error to user — always translate.'),
      card('Where should request deduplication happen?', 'In the data-fetching layer (TanStack Query, SWR). Multiple components asking for the same key share a single network request. Without it, 5 components = 5 identical GETs.'),
    ],
    refs: [
      ref('TanStack Query Docs', 'https://tanstack.com/query/latest'),
      ref('Axios Docs', 'https://axios-http.com/docs/intro'),
      ref('MDN Fetch API', 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'),
      ref('MDN AbortController', 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController'),
    ],
  });

  const subSecurity = mk('Auth & Security Architecture', 'state', archSkill.id, {
    definition:
      'JWT stored in httpOnly cookies prevents XSS from stealing tokens; localStorage is XSS-vulnerable. RBAC must be enforced at the API level — frontend guards are UX only and bypassable via direct API calls. React auto-escapes JSX interpolations, but dangerouslySetInnerHTML, unsanitized href values (javascript: scheme), and CMS HTML require explicit sanitization. CSP headers add a second defense layer against injected scripts.',
    codeExample:
      "// Route-level RBAC guard\nfunction RequireRole({ role, children }) {\n  const { user } = useAuth();\n  if (!user) return <Navigate to='/login' replace />;\n  if (!user.roles.includes(role)) return <Navigate to='/403' replace />;\n  return children;\n}\n\n<Route path='/admin' element={\n  <RequireRole role='admin'><AdminDashboard /></RequireRole>\n} />\n\n// Sanitize untrusted HTML (e.g. CMS content)\nimport DOMPurify from 'dompurify';\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cmsHtml) }} />\n\n// Validate user-supplied URLs to block javascript: scheme\nfunction safeHref(url) {\n  try {\n    const { protocol } = new URL(url);\n    return protocol === 'https:' || protocol === 'http:' ? url : '#';\n  } catch { return '#'; }\n}",
    gotchas:
      'RBAC only on frontend — any user can call API endpoints directly with a REST client; always enforce on backend.\nJWT in localStorage — readable by any script on the page; XSS = account takeover. Use httpOnly cookies.\ndangerouslySetInnerHTML with unsanitized CMS content — always pass through DOMPurify before rendering.',
    flashcards: [
      card('Where should RBAC be enforced?', 'Both. Frontend hides UI for UX. Backend enforces for security. Frontend-only RBAC is bypassable via direct API calls.'),
      card('How to store JWT safely in browser?', "httpOnly cookie — JS can't read it, immune to XSS token theft. localStorage is XSS-vulnerable. Trade-off: cookies need CSRF protection."),
      card('XSS prevention in React?', 'React auto-escapes interpolated strings. Danger zones: dangerouslySetInnerHTML with untrusted input, unsanitized HTML from CMS, user-controlled URLs in href (javascript: scheme), inline event handlers via innerHTML.'),
      card('What is Content Security Policy?', "HTTP header that whitelists allowed sources for scripts/styles/images. Blocks injected <script> from running. script-src 'self' blocks inline scripts and third-party CDNs unless explicitly allowed."),
      card('CSRF — still relevant with JWT-in-cookie?', 'Yes. If session is in cookie, attacker site can trigger requests with credentials. Mitigate with SameSite=Strict/Lax cookies and CSRF tokens for state-changing operations.'),
      card('RBAC vs ABAC — when each?', 'RBAC (role-based): "admin can edit" — coarse, simple. ABAC (attribute-based): "user can edit if user.id === post.authorId AND post.status === draft" — fine, complex. Start RBAC, escalate when role explosion happens.'),
      card('Where do feature flags live in architecture?', 'Provider (LaunchDarkly, Unleash, Statsig) → SDK in client → Context exposes to components. SSR needs flag eval at request time, not after hydration.'),
    ],
    refs: [
      ref('OWASP Top 10', 'https://owasp.org/www-project-top-ten/'),
      ref('JWT.io — Introduction', 'https://jwt.io/introduction'),
      ref('web.dev — Content Security Policy', 'https://web.dev/articles/csp'),
      ref('MDN — SameSite cookies', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value'),
    ],
  });

  const subRendering = mk('Rendering Architecture', 'state', archSkill.id, {
    definition:
      'Rendering strategy determines when and where HTML is generated: CSR delivers a JS shell (slow first paint, fast navigation), SSR generates HTML per request (good SEO, server cost), SSG pre-builds at deploy time (fast, no per-user content), ISR extends SSG with on-demand revalidation. Hydration attaches React event handlers to server HTML; slow hydration blocks interactivity even with fast first paint. React Server Components render on the server and ship zero JS for that tree segment.',
    codeExample:
      "// Next.js — four rendering modes at a glance\n\n// 1. SSG — built at deploy time\nexport async function generateStaticParams() {\n  return fetchAllSlugs();\n}\nasync function BlogPost({ params }) {\n  const post = await fetchPost(params.slug); // build time only\n  return <Article post={post} />;\n}\n\n// 2. ISR — static + background revalidation\nexport const revalidate = 60; // rebuild every 60s\nasync function PricingPage() {\n  const plans = await fetchPlans();\n  return <Pricing plans={plans} />;\n}\n\n// 3. SSR — per request\nexport const dynamic = 'force-dynamic';\nasync function Dashboard() {\n  const data = await fetchUserDashboard();\n  return <DashboardView data={data} />;\n}\n\n// 4. CSR — client component, hydrated\n'use client';\nfunction LiveChart({ symbol }) {\n  const [price, setPrice] = useState(null);\n  useEffect(() => { /* subscribe WS */ }, [symbol]);\n  return <Chart value={price} />;\n}",
    gotchas:
      "Hydration mismatch — server and client render different HTML (e.g. Date.now(), localStorage read) → React throws. Defer client-only code to useEffect.\nOver-using SSR for auth-gated pages — no SEO benefit, adds server cost; CSR or edge middleware is cheaper.\nFull-page hydration with large JS bundles — fast TTFB, slow TTI; use streaming + Suspense boundaries.",
    flashcards: [
      card('CSR vs SSR vs SSG vs ISR — quick rules?', 'CSR = SPA, slow first paint, fast nav. SSR = HTML per request, slow at scale. SSG = pre-built HTML, fast, no per-user content. ISR = SSG + revalidation, best of both for content sites.'),
      card('What is hydration?', 'Process where server-rendered HTML "becomes interactive" — React attaches event listeners and reconciles. Slow hydration = slow time-to-interactive even with fast first paint.'),
      card('Streaming SSR — what changes?', 'Server flushes HTML in chunks as components resolve, instead of waiting for full page. Fast TTFB, progressive paint. React Server Components + Suspense enable this in React 19.'),
      card('When is SSR the wrong choice?', 'Behind-login dashboards (no SEO benefit, server cost adds up), highly personalized UIs, anything where client-side data hydration is the bottleneck anyway.'),
      card('Partial hydration / Islands architecture?', 'Most of the page is static HTML; only interactive components hydrate. Astro popularized it. Less JS shipped, faster TTI.'),
      card('React Server Components — what problem do they solve?', 'Server-only components render on the server, ship zero JS for that portion. Can directly access DB, secrets, server-only deps. Cuts bundle size and removes a network hop for data.'),
    ],
    refs: [
      ref('Next.js — Rendering Docs', 'https://nextjs.org/docs/app/building-your-application/rendering'),
      ref('React Server Components', 'https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023'),
      ref('web.dev — Rendering on the Web', 'https://web.dev/articles/rendering-on-the-web'),
      ref('Astro — Islands Architecture', 'https://docs.astro.build/en/concepts/islands/'),
    ],
  });

  const subPerf = mk('Performance Architecture', 'state', archSkill.id, {
    definition:
      'Performance architecture embeds perf decisions at design time: code splitting at route and heavy-component boundaries, memoization of expensive computations and stable callbacks, virtualization of long lists, and enforced bundle-size budgets in CI. Without explicit budgets, performance erodes silently with each feature shipped.',
    codeExample:
      "// Route-level code splitting\nimport { lazy, Suspense } from 'react';\nconst StockChart = lazy(() => import('./StockChart'));\nconst EditorView = lazy(() => import('./EditorView'));\n\nfunction App() {\n  return (\n    <Suspense fallback={<PageSkeleton />}>\n      <Routes>\n        <Route path='/chart/:sym' element={<StockChart />} />\n        <Route path='/editor/:id' element={<EditorView />} />\n      </Routes>\n    </Suspense>\n  );\n}\n\n// Virtualized list — renders only visible rows\nimport { FixedSizeList } from 'react-window';\nfunction TradeHistory({ trades }) {\n  return (\n    <FixedSizeList height={600} itemCount={trades.length} itemSize={48} width='100%'>\n      {({ index, style }) => (\n        <TradeRow key={trades[index].id} style={style} trade={trades[index]} />\n      )}\n    </FixedSizeList>\n  );\n}",
    gotchas:
      "React.memo with inline object/function props — parent recreates them every render, memo never matches; memoize the parent's values first.\nSplitting every component — too many small chunks creates a waterfall of requests; split at route boundaries first.\nVirtualizing without measuring — react-window requires known item heights; variable heights need react-virtual or @tanstack/virtual.",
    flashcards: [
      card('Code splitting strategy in a SPA?', "Split at route boundaries first (biggest wins). Then heavy components (charts, editors). Then below-fold sections. Don't split everything — too many chunks = waterfall network requests."),
      card('React.memo — when is it pointless?', "When parent passes inline objects/functions every render — props change every time, memo doesn't help. Either memoize the parent's values or skip memo entirely."),
      card('Bundle size — first thing to check?', 'Source-map-explorer or webpack-bundle-analyzer. Look for: full moment.js (use date-fns), full lodash (cherry-pick imports), unused polyfills, duplicate library versions across micro-bundles.'),
      card('When is virtualization required?', 'Lists with 100+ rows visible in a scroll area. Renders only viewport items, recycles. react-window, react-virtual, FlatList (RN). Without it, large lists kill scroll FPS and memory.'),
      card("What's a performance budget?", 'A pre-agreed cap — bundle size <= X KB, LCP <= Y ms, JS execution <= Z ms. CI fails on breach. Without a budget, perf erodes silently as features ship.'),
    ],
    refs: [
      ref('web.dev — Core Web Vitals', 'https://web.dev/explore/learn-core-web-vitals'),
      ref('web.dev — Performance', 'https://web.dev/explore/performance'),
      ref('React — Code Splitting with lazy', 'https://react.dev/reference/react/lazy'),
      ref('react-window', 'https://react-window.vercel.app/'),
    ],
  });

  const subRealtime = mk('Real-Time Architecture', 'state', archSkill.id, {
    definition:
      'Real-time UIs require a transport layer (WebSocket for bidirectional, SSE for server-push, polling for low-frequency) and a state reconciliation strategy on reconnect. A singleton WebSocketManager handles connection lifecycle and reconnection with exponential backoff; events flow into a store so UI subscribes declaratively rather than to the socket directly. Batching incoming events into requestAnimationFrame intervals prevents UI thrash from high-frequency updates.',
    codeExample:
      "// Singleton WebSocket manager with exponential backoff + jitter\nclass WebSocketManager {\n  #ws = null;\n  #retries = 0;\n  #handlers = new Map();\n\n  connect(url) {\n    this.#ws = new WebSocket(url);\n    this.#ws.onmessage = (e) => {\n      const { type, payload } = JSON.parse(e.data);\n      this.#handlers.get(type)?.forEach((h) => h(payload));\n    };\n    this.#ws.onclose = () => {\n      const delay = Math.min(30_000, 500 * 2 ** this.#retries++);\n      setTimeout(() => this.connect(url), delay + Math.random() * 500);\n    };\n    this.#ws.onopen = () => { this.#retries = 0; };\n  }\n\n  on(type, handler) {\n    if (!this.#handlers.has(type)) this.#handlers.set(type, new Set());\n    this.#handlers.get(type).add(handler);\n    return () => this.#handlers.get(type).delete(handler); // returns unsubscribe fn\n  }\n}\n\nexport const wsManager = new WebSocketManager();",
    gotchas:
      'Multiple WebSocket connections — one per component leads to N subscriptions and N connections; use a singleton.\nNo reconnect backoff — hammering server on network blip; add exponential backoff with jitter.\nState reconciliation on reconnect — missed events leave UI stale; request a server snapshot after reconnect and merge.',
    flashcards: [
      card('WebSocket vs SSE vs polling — when each?', 'Polling: simplest, OK for low-frequency. SSE: server→client only, simpler than WS, auto-reconnect, HTTP-friendly. WebSocket: bidirectional, low latency, requires reconnection logic.'),
      card('WebSocket reconnection strategy?', 'Exponential backoff with jitter. Replay missed events via sequence numbers or last-event-id. On reconnect, reconcile local state with server snapshot.'),
      card('How to architect a WebSocket layer?', 'Singleton WebSocketManager handles connection lifecycle. Pushes events to a store (Redux, Zustand). UI subscribes to store, not WS directly. Decouples lifecycle from rendering.'),
      card('How to handle 100s of WS updates per second without UI thrash?', 'Batch updates into requestAnimationFrame. Throttle store writes. Virtualize affected views. Diff at store level — only notify subscribers whose data actually changed.'),
    ],
    refs: [
      ref('MDN — WebSockets API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'),
      ref('MDN — Server-Sent Events', 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events'),
      ref('web.dev — WebSockets Basics', 'https://web.dev/articles/websockets-basics'),
    ],
  });

  const subOffline = mk('Offline-First Architecture', 'state', archSkill.id, {
    definition:
      'Offline-first apps read from a local cache immediately and sync mutations to the server when connectivity returns. Service Workers (web) or SQLite/MMKV (mobile) persist data across sessions. A mutation queue with idempotency keys replays operations on reconnect without double-applying. Conflict resolution strategy — last-write-wins, CRDTs, or manual conflict UI — is chosen based on data semantics.',
    codeExample:
      "// Mutation queue with idempotency keys\nconst queue = []; // persisted to AsyncStorage / localStorage\n\nasync function queueMutation(type, payload) {\n  const entry = { id: uid(), type, payload, createdAt: Date.now() };\n  queue.push(entry);\n  await persistQueue(queue); // survive app kill\n  if (navigator.onLine) await flushQueue();\n}\n\nasync function flushQueue() {\n  while (queue.length > 0) {\n    const entry = queue[0];\n    try {\n      await api.post('/mutations', entry); // server deduplicates by entry.id\n      queue.shift();\n    } catch (e) {\n      if (e.status === 409) queue.shift(); // already applied — discard\n      else break; // network error — retry later\n    }\n  }\n  await persistQueue(queue);\n}\n\nwindow.addEventListener('online', flushQueue);",
    gotchas:
      'No idempotency keys — replay on reconnect applies mutations twice; every queued mutation needs a unique ID the server deduplicates on.\nLast-write-wins for collaborative data — silently discards concurrent edits; use CRDTs or show conflict resolution UI.\nUnencrypted local storage for sensitive data — use encrypted SQLite or MMKV with hardware-backed keys on mobile.',
    flashcards: [
      card('Cache-first vs network-first strategy?', 'Cache-first: serve from cache immediately, refresh in background. Network-first: try network, fall back to cache on failure. Cache-first for static/slow-changing; network-first for fresh data.'),
      card('Conflict resolution when offline edits merge?', 'Three strategies: last-write-wins (simple, lossy), CRDTs (auto-merge for collaborative data), manual conflict UI (user picks). Pick based on data semantics.'),
      card('Queue-based request retry pattern?', 'Mutations queue locally when offline. On reconnect, replay queue in order. Persist queue to disk to survive app kill. Use idempotency keys to avoid double-applies.'),
      card('SQLite vs AsyncStorage vs MMKV for mobile?', 'AsyncStorage: simple K/V, slow for large data. MMKV: fast K/V (mmap-based), atomic, encrypted. SQLite: relational queries, joins, large datasets. Pick MMKV for prefs, SQLite for entity data.'),
    ],
    refs: [
      ref('web.dev — Offline Cookbook', 'https://web.dev/articles/offline-cookbook'),
      ref('MDN — Service Worker API', 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API'),
      ref('WatermelonDB — offline-first RN', 'https://nozbe.github.io/WatermelonDB/'),
      ref('react-native-mmkv', 'https://github.com/mrousavy/react-native-mmkv'),
    ],
  });

  const subMfe = mk('Microfrontend Architecture (Deep Dive)', 'state', archSkill.id, {
    definition:
      'Microfrontends decompose a frontend into independently deployable units owned by separate teams with separate release cycles. Module Federation enables runtime composition via remote entry files with shared singleton dependencies. Teams communicate via custom DOM events or a shared event bus — direct imports between remotes create build-time coupling that defeats the independence goal.',
    codeExample:
      "// webpack.config.js — Remote (editor team)\nconst { ModuleFederationPlugin } = require('webpack').container;\nmodule.exports = {\n  plugins: [\n    new ModuleFederationPlugin({\n      name: 'editor',\n      filename: 'remoteEntry.js',\n      exposes: { './TemplateEditor': './src/TemplateEditor' },\n      shared: {\n        react: { singleton: true, requiredVersion: '^18.0.0' },\n        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },\n      },\n    }),\n  ],\n};\n\n// Shell (host) — resilient remote load\nconst TemplateEditor = React.lazy(() =>\n  import('editor/TemplateEditor').catch(() => import('./FallbackEditor'))\n);\n\n<ErrorBoundary fallback={<p>Editor unavailable</p>}>\n  <Suspense fallback={<Spinner />}>\n    <TemplateEditor />\n  </Suspense>\n</ErrorBoundary>",
    gotchas:
      'Missing singleton: true for React — two React instances at runtime → hooks throw "invalid hook call"; always set singleton.\nMFE with a single team — isolation cost without isolation benefit; monolith with feature folders is simpler.\nNo error boundary around remote loads — network failure rendering a remote crashes the entire shell page.',
    flashcards: [
      card('When is microfrontend the wrong call?', 'Small team, single product, one deploy cadence. Overhead (shared deps, runtime composition, communication) costs more than monolith friction. MFE wins at 5+ teams with independent release schedules.'),
      card('Module Federation shared dependency conflict?', 'Each MFE may ship its own React version → multiple Reacts at runtime → broken hooks. Solution: shared singleton with version range, or strict version match — fail fast if mismatched.'),
      card('Communication between microfrontends?', 'Custom DOM events (loose coupling), shared event bus, URL state, shared store (defeats isolation). Avoid direct imports between MFEs.'),
      card('Build-time vs runtime MFE integration — pick?', 'Build-time (npm packages): simple, but one MFE updates = all apps redeploy. Runtime (Module Federation): true independent deploy, but version-skew risk and runtime resolution complexity.'),
    ],
    refs: [
      ref('Module Federation Docs', 'https://module-federation.io/'),
      ref('single-spa Docs', 'https://single-spa.js.org/docs/getting-started-overview'),
      ref('Micro Frontends (martinfowler.com)', 'https://martinfowler.com/articles/micro-frontends.html'),
    ],
  });

  const subErrors = mk('Error & Observability', 'state', archSkill.id, {
    definition:
      'Error Boundaries catch synchronous render exceptions and prevent full-page crashes, but miss async errors, event handler errors, and promise rejections — those require window.onerror and unhandledrejection listeners. Sentry (or equivalent) centralizes crash reports with stack traces, release tags, and user session breadcrumbs. Standardized error envelopes ({ code, message, traceId }) decouple server internals from user messages and enable cross-system log correlation.',
    codeExample:
      "// Root ErrorBoundary + Sentry\nimport * as Sentry from '@sentry/react';\n\nSentry.init({\n  dsn: process.env.SENTRY_DSN,\n  release: process.env.APP_VERSION,\n  tracesSampleRate: 0.2,\n});\n\nclass AppErrorBoundary extends React.Component {\n  state = { hasError: false };\n  static getDerivedStateFromError() { return { hasError: true }; }\n  componentDidCatch(error, info) {\n    Sentry.captureException(error, { extra: info });\n  }\n  render() {\n    if (this.state.hasError)\n      return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />;\n    return this.props.children;\n  }\n}\n\n// Catch async and event-handler errors that ErrorBoundary misses\nwindow.addEventListener('unhandledrejection', (e) => {\n  Sentry.captureException(e.reason);\n});\nwindow.addEventListener('error', (e) => {\n  Sentry.captureException(e.error);\n});",
    gotchas:
      "Error boundaries don't catch async errors — event handlers and async callbacks need window.onerror / unhandledrejection.\nNo traceId in error envelope — impossible to correlate frontend crash with backend log; always propagate traceId from API.\nSentry without release tagging — can't determine which deploy introduced a regression.",
    flashcards: [
      card("Error boundaries in React — what they don't catch?", 'Async errors, event handler errors, errors in the boundary itself. Catch render errors only. Pair with global listeners (window.onerror, unhandledrejection).'),
      card('How to design an error envelope?', '{ code, message, details, traceId }. Client maps code to user message + action. Server-internal details (stack traces) never reach UI. traceId enables correlating frontend + backend logs.'),
      card('Sentry vs custom logging — when each?', "Sentry: production crashes, perf tracking, release tagging. Custom logging: business events that aren't errors. Both feed the observability story."),
      card("What's a degraded-mode UI?", "When a subsystem fails (WebSocket, secondary API), UI gracefully degrades instead of breaking. Show a banner, fall back to polling, disable affected features. Better than a blank crash screen."),
    ],
    refs: [
      ref('Sentry React Docs', 'https://docs.sentry.io/platforms/javascript/guides/react/'),
      ref('React — Error Boundaries', 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary'),
      ref('MDN — unhandledrejection event', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event'),
    ],
  });

  const subSystem = mk('System Design Patterns (Senior)', 'state', archSkill.id, {
    definition:
      'Senior frontend engineers apply architecture patterns to real product constraints — real-time data feeds, multi-tenant isolation, offline persistence, collaborative editing, and progressive deployments. Each system design connects state strategy, rendering mode, transport layer, and deployment pattern to specific non-functional requirements (latency, consistency, availability, team autonomy).',
    codeExample:
      "// Chat app — architecture sketch\n//\n// Transport:      WebSocket singleton → event bus → Zustand store\n// Messages:       normalized by conversationId: { [convId]: Message[] }\n// Optimistic send: message marked 'pending' in store before API ack\n// Rendering:      react-window virtualized list (10k+ messages)\n// Offline drafts: persisted to localStorage / AsyncStorage\n// Typing events:  debounced 500ms, expire after 3s\n//\n// Real-time trading UI additions:\n// - Batch WS ticks into requestAnimationFrame (throttle 100s/sec)\n// - Order entry: idempotency key on submit, disable until server ack\n// - WS drop: show degraded banner, fall back to 5s REST polling\n// - Order book: virtualized table, memoized rows (only changed re-render)",
    gotchas:
      "Over-engineering the first version — sketch the design, validate real constraints, then build incrementally.\nIgnoring failure modes — every real-time, offline, or multi-tenant design needs explicit degraded-mode behavior.\nA/B test variants never cleaned up — feature flag sprawl creates dead code paths and hidden test interactions.",
    flashcards: [
      card('Design a chat app frontend — key decisions?', 'WebSocket layer (single connection, reconnect). Normalized message store by conversationId. Optimistic send with pending state. Virtualized list (10k+ messages). Offline draft persistence. Typing indicators via debounced events.'),
      card("Design a real-time trading UI — what's hard?", "100s of updates/sec without UI thrash — batch into RAF, throttle re-renders, virtualize tables. WS reconnect with state reconciliation. Order entry double-submit prevention. Degraded UI when WS drops."),
      card('Design a multi-tenant frontend — concerns?', 'Tenant theming via CSS vars or runtime tokens. Per-tenant feature flags. Tenant context in every API call. Build-time vs runtime tenant resolution. Auth scoped to tenant.'),
      card('Design an offline-first mobile fintech app?', 'SQLite/MMKV persistence. Mutation queue with idempotency keys. Background sync. Conflict resolution (last-write-wins for prefs, manual for transactions). Encrypted storage. Biometric re-auth on resume.'),
      card('Server-driven UI — when does it make sense?', 'Apps where rules/screens change frequently without releases (banking, e-commerce promos). Backend ships UI schema; client renders. Trade: less native feel, more server complexity. Used by Airbnb, Lyft.'),
      card('A/B testing architecture?', 'Variant assignment server-side (sticky per user). Render placeholder until variant resolved to avoid layout shift. Track exposure events. Variant cleanup discipline — kill or graduate within a fixed window.'),
      card('Canary release at the frontend layer?', 'Percentage-based rollout via feature flag. Bake-time monitoring (errors, latency, conversion). Auto-rollback on threshold breach. Server-side for non-cached pages; CDN-level for cached.'),
      card("i18n architecture — what's hard at scale?", "Pluralization varies by locale (Russian 3+ forms). RTL mirrors layouts, not just text. String externalization without breaking translator context. Lazy-load locale bundles. Use Intl APIs for dates/numbers, not custom code."),
    ],
    refs: [
      ref('High Scalability', 'http://highscalability.com/'),
      ref('System Design Primer (GitHub)', 'https://github.com/donnemartin/system-design-primer'),
      ref('Patterns.dev', 'https://www.patterns.dev/'),
      ref('web.dev — Progressive Web Apps', 'https://web.dev/explore/progressive-web-apps'),
    ],
  });

  skills.push(
    archSkill,
    subStructure,
    subBusiness,
    subState,
    subApi,
    subSecurity,
    subRendering,
    subPerf,
    subRealtime,
    subOffline,
    subMfe,
    subErrors,
    subSystem,
  );

  return skills;
}
