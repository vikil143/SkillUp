// seed/skills/frontend.js — comprehensive zero-to-hero frontend content
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

export default function buildFrontendSkills() {
  const skills = [];

  // React.js
  const react = mk('React.js', 'frontend', null, {
    definition:
      'React is a declarative UI library focused on composing interfaces from small reusable components. It uses a virtual DOM and reconciliation to update the real DOM efficiently. The mental model is "UI as a function of state", which makes large interfaces predictable. Modern React centers around function components, hooks, and concurrent rendering capabilities.',
    codeExample:
      "import { useEffect, useMemo, useState } from 'react';\n\nexport default function ProductList({ products }) {\n  const [query, setQuery] = useState('');\n  const filtered = useMemo(\n    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),\n    [products, query]\n  );\n\n  useEffect(() => {\n    document.title = `Products (${filtered.length})`;\n  }, [filtered.length]);\n\n  return (\n    <section>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search' />\n      <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>\n    </section>\n  );\n}",
    whenUsed:
      'Used heavily in `p-stock`, `p-docs`, and `p-editor` for dashboards, collaborative tooling, and high-interaction workflows. React component composition and hooks are also core to `p-maak` and `p-packarma` through React Native.',
    gotchas:
      'Updating state derived from old state without functional updates causes race conditions.\nInline object/function props can defeat memoization and trigger unnecessary child renders.\nUsing array index as `key` breaks identity during insert/reorder operations.\nEffects with missing dependencies lead to stale closures and inconsistent UI behavior.\nMutating state directly (arrays/objects) can prevent expected re-renders.',
    flashcards: [
      card('Why does React require keys for list items, and why are indexes risky?', 'Keys let reconciliation preserve component identity between renders. Index keys shift when items are inserted/removed, causing state to move to the wrong row and subtle UI bugs.'),
      card('What is the practical difference between render phase and commit phase?', 'Render computes the next tree and must stay pure. Commit applies changes to the DOM and runs layout/effects; side effects belong there, not in render.'),
      card('When does React batch state updates, and why does it matter?', 'React batches updates in event handlers and many async contexts to reduce re-renders. Reading state right after setState can show old values unless you use functional updates or effects.'),
      card('How does StrictMode in development expose effect bugs?', 'It intentionally runs setup/cleanup cycles more than once to surface impure effects and missing cleanup logic, revealing leaks before production.'),
      card('Why can a memoized child still re-render?', 'React.memo only skips when props are referentially equal. New object/function props or changed context values still trigger renders.'),
      card('What problem do custom hooks solve better than helper functions?', 'Custom hooks compose stateful logic while preserving React lifecycle semantics. Plain helpers cannot use hooks and cannot bind to component lifecycle.'),
      card('How do controlled and uncontrolled inputs differ in React?', 'Controlled inputs mirror value in React state and update via onChange; uncontrolled inputs keep state in DOM and are read through refs, usually simpler but less deterministic.'),
      card('What is reconciliation in one sentence?', 'It is React’s tree-diff algorithm that computes the minimal set of DOM updates needed to reflect new state.'),
    ],
    apis: [
      api('useState', 'useState<T>(initial: T | (() => T)) => [T, Dispatch<SetStateAction<T>>]', 'Adds local component state with a setter that schedules re-renders.', 'initial value or lazy initializer function', 'Tuple of current state and setter', "const [count, setCount] = useState(0);\nsetCount((c) => c + 1);", 'Setter is async; use functional updates when deriving from previous state.'),
      api('useEffect', 'useEffect(effect: () => void | (() => void), deps?: DependencyList)', 'Runs side effects after commit and supports cleanup.', 'effect callback and optional dependencies array', 'void', "useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);", 'Missing deps cause stale closures; unstable deps can create loops.'),
      api('useMemo', 'useMemo<T>(factory: () => T, deps: DependencyList): T', 'Memoizes expensive computations and stable derived values.', 'factory function and dependencies', 'Memoized value', 'const sorted = useMemo(() => [...rows].sort(cmp), [rows, cmp]);', 'Overuse adds overhead; use for expensive work or stable references.'),
      api('useCallback', 'useCallback<T extends (...args: any[]) => any>(fn: T, deps: DependencyList): T', 'Memoizes function identity between renders.', 'callback and dependencies', 'Stable callback function', 'const onSave = useCallback(() => save(draft), [draft]);', 'Only helpful if referential equality is consumed downstream.'),
      api('useContext', 'useContext<T>(context: Context<T>): T', 'Reads nearest provider value and subscribes to changes.', 'Context object created by createContext', 'Current context value', 'const auth = useContext(AuthContext);', 'All consumers re-render when provider value reference changes.'),
      api('useReducer', 'useReducer<R extends Reducer<any, any>>(reducer: R, initialArg: any, init?)', 'Manages complex state transitions via explicit actions.', 'reducer, initial state, optional initializer', '[state, dispatch]', "const [state, dispatch] = useReducer(reducer, { items: [] });\ndispatch({ type: 'add', item });", 'Reducers must be pure; side effects belong outside reducer.'),
      api('useRef', 'useRef<T>(initialValue: T): MutableRefObject<T>', 'Stores mutable values that persist across renders without causing re-render.', 'Initial value', 'Ref object with `.current`', "const inputRef = useRef(null);\ninputRef.current?.focus();", 'Changing ref.current does not trigger render updates.'),
      api('memo', 'memo(Component, arePropsEqual?)', 'Skips re-render when props are shallowly equal (or custom compare passes).', 'Component and optional comparison function', 'Memoized component', 'const Row = memo(function Row({ item }) { return <li>{item.name}</li>; });', 'Can hide stale props bugs if custom comparator is wrong.'),
      api('lazy', 'lazy(() => import("./MyComponent"))', 'Code-splits components and loads them on first render.', 'Function returning dynamic import promise', 'Lazy component', "const Editor = lazy(() => import('./Editor'));\n<Suspense fallback={<Spinner />}><Editor /></Suspense>", 'Must be wrapped in Suspense with fallback UI.'),
      api('Suspense', '<Suspense fallback={...}>{children}</Suspense>', 'Shows fallback while lazy components or suspended resources load.', 'fallback element and wrapped children', 'React element', '<Suspense fallback={<p>Loading...</p>}><Dashboard /></Suspense>', 'Boundary placement affects user-perceived loading behavior.'),
    ],
    refs: [
      ref('React Docs', 'https://react.dev/'),
      ref('React Learn', 'https://react.dev/learn'),
      ref('React API Reference', 'https://react.dev/reference/react'),
      ref('React Hooks Reference', 'https://react.dev/reference/react/hooks'),
      ref('React Working Group Discussions', 'https://github.com/reactwg/react-18/discussions'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-editor', 'p-maak', 'p-packarma'],
  });
  skills.push(react);

  const reactComponents = mk('Components & Props', 'frontend', react.id, {
    definition: 'Components are reusable UI units. Props are read-only inputs that flow from parent to child, enabling composition and isolation.',
    codeExample:
      "function UserCard({ user, onDelete }) {\n  return (\n    <article>\n      <h3>{user.name}</h3>\n      <button onClick={() => onDelete(user.id)}>Remove</button>\n    </article>\n  );\n}\n\nexport function UserList({ users, onDelete }) {\n  return users.map((u) => <UserCard key={u.id} user={u} onDelete={onDelete} />);\n}",
    flashcards: [
      card('Why should props be treated as immutable in React?', 'Mutating props breaks one-way data flow assumptions and can produce inconsistent rendering behavior.'),
      card('When should behavior be passed via props versus context?', 'Use props for local explicit wiring; use context when many distant descendants need shared data.'),
    ],
  });
  skills.push(reactComponents);

  const reactHooks = mk('Hooks', 'frontend', react.id, {
    definition: 'Hooks let function components use state, lifecycle behavior, context, and memoization while preserving composability.',
    codeExample:
      "import { useEffect, useState } from 'react';\n\nexport function Clock() {\n  const [now, setNow] = useState(new Date());\n  useEffect(() => {\n    const id = setInterval(() => setNow(new Date()), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <time>{now.toLocaleTimeString()}</time>;\n}",
    gotchas: 'Hooks must be called unconditionally at top level.\nNever call hooks inside loops, conditions, or nested helper functions.\nCustom hooks still follow Rules of Hooks.',
    flashcards: [
      card('Why does hook call order matter?', 'React associates hook state slots by call order; conditional calls shift slots and corrupt state mapping.'),
      card('What makes a function a custom hook?', 'It starts with `use` and calls other hooks to encapsulate reusable stateful logic.'),
    ],
  });
  skills.push(reactHooks);

  const hs = mk('useState', 'frontend', reactHooks.id, {
    definition: 'useState stores local mutable state and schedules UI updates when setter is called.',
    codeExample:
      "const [form, setForm] = useState({ email: '', password: '' });\n\nfunction onChange(e) {\n  const { name, value } = e.target;\n  setForm((prev) => ({ ...prev, [name]: value }));\n}",
    flashcards: [
      card('Why is functional setState safer under rapid updates?', 'It uses latest queued state and avoids stale closure snapshots.'),
      card('What is lazy state initialization?', 'Passing a function to useState so expensive initialization runs only once on mount.'),
    ],
  });
  const he = mk('useEffect', 'frontend', reactHooks.id, {
    definition: 'useEffect synchronizes component behavior with external systems like timers, network, and subscriptions.',
    codeExample:
      "useEffect(() => {\n  const ctrl = new AbortController();\n  fetch(`/api/users/${id}`, { signal: ctrl.signal });\n  return () => ctrl.abort();\n}, [id]);",
    flashcards: [
      card('Why should fetch effects support cancellation?', 'It prevents setting state after unmount and avoids race conditions between requests.'),
      card('When does effect cleanup run?', 'Before next effect run and on unmount.'),
    ],
  });
  const hm = mk('useMemo', 'frontend', reactHooks.id, {
    definition: 'useMemo caches computed values to avoid recomputation unless dependencies change.',
    codeExample: 'const grouped = useMemo(() => groupBy(rows, "status"), [rows]);',
    flashcards: [
      card('What is a common anti-pattern with useMemo?', 'Memoizing cheap expressions everywhere, which adds complexity without measurable gain.'),
      card('Can useMemo guarantee value persistence forever?', 'No; React may discard memoized values in some scenarios, so it is a performance hint, not semantic storage.'),
    ],
  });
  const hcb = mk('useCallback', 'frontend', reactHooks.id, {
    definition: 'useCallback memoizes function references so dependent children/effects can avoid unnecessary work.',
    codeExample:
      "const onFilter = useCallback((next) => {\n  setQuery(next);\n  logSearch(next);\n}, []);",
    flashcards: [
      card('Why can useCallback still recreate functions?', 'Dependencies changing creates a new callback reference by design.'),
      card('What is the typical pair for useCallback optimization?', 'React.memo child components that compare callback props by reference.'),
    ],
  });
  const hctx = mk('useContext', 'frontend', reactHooks.id, {
    definition: 'useContext consumes nearest context provider value and subscribes component updates to value reference changes.',
    codeExample:
      "const ThemeContext = createContext('light');\n\nfunction Header() {\n  const theme = useContext(ThemeContext);\n  return <header data-theme={theme}>Dashboard</header>;\n}",
    flashcards: [
      card('Why might context-heavy apps re-render too much?', 'Single broad context values changing frequently force many consumers to re-render.'),
      card('How do you reduce context render fan-out?', 'Split providers by concern and memoize provider values.'),
    ],
  });
  const hrd = mk('useReducer', 'frontend', reactHooks.id, {
    definition: 'useReducer handles multi-step state transitions with action objects and a pure reducer function.',
    codeExample:
      "function reducer(state, action) {\n  switch (action.type) {\n    case 'add': return { ...state, items: [...state.items, action.item] };\n    case 'remove': return { ...state, items: state.items.filter((i) => i.id !== action.id) };\n    default: return state;\n  }\n}",
    flashcards: [
      card('When is useReducer preferable to multiple useState calls?', 'When transitions are coupled, complex, or benefit from explicit action semantics.'),
      card('Why keep reducers pure?', 'Purity guarantees predictable state transitions and enables easier debugging/testing.'),
    ],
  });
  const href = mk('useRef', 'frontend', reactHooks.id, {
    definition: 'useRef keeps mutable values across renders and can hold DOM node references without re-rendering.',
    codeExample:
      "const inputRef = useRef(null);\n\nfunction focusInput() {\n  inputRef.current?.focus();\n}\n\nreturn <input ref={inputRef} />;",
    flashcards: [
      card('What is a non-DOM use case for useRef?', 'Persisting previous values, timeout IDs, or mutable flags between renders.'),
      card('Why not store UI state in refs?', 'Ref updates do not trigger renders, so visible UI can get out of sync.'),
    ],
  });
  skills.push(hs, he, hm, hcb, hctx, hrd, href);

  skills.push(
    mk('Reconciliation & Keys', 'frontend', react.id, {
      definition: 'Reconciliation compares trees and updates DOM nodes with minimal operations; keys preserve child identity in lists.',
      codeExample:
        "const rows = items.map((item) => (\n  <Row key={item.id} item={item} />\n));",
      flashcards: [
        card('How do unstable keys affect local component state?', 'State can jump rows after reorder because React thinks identities changed.'),
        card('Why is key uniqueness only required among siblings?', 'React reconciliation operates within each siblings list boundary.'),
      ],
    }),
    mk('Performance (memo, lazy, Suspense)', 'frontend', react.id, {
      definition: 'Performance in React relies on controlling render frequency, splitting bundles, and progressive loading boundaries.',
      codeExample:
        "const Chart = lazy(() => import('./Chart'));\nconst Row = memo(function Row({ item }) {\n  return <li>{item.name}</li>;\n});\n\n<Suspense fallback={<p>Loading chart...</p>}>\n  <Chart />\n</Suspense>;",
      flashcards: [
        card('What is the danger of memoizing everything?', 'Comparator cost and cognitive load may outweigh render savings.'),
        card('What does Suspense optimize besides code splitting?', 'It coordinates async UI boundaries for smoother loading states.'),
      ],
    }),
    mk('Context & Providers', 'frontend', react.id, {
      definition: 'Providers expose shared values to descendant consumers without explicit prop drilling.',
      codeExample:
        "const AuthContext = createContext(null);\n\nfunction AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const value = useMemo(() => ({ user, setUser }), [user]);\n  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;\n}",
      flashcards: [
        card('Why memoize provider values?', 'To avoid changing object reference every render and re-rendering all consumers.'),
        card('When should context not replace props?', 'When data is local and only a few levels deep; props remain clearer and easier to trace.'),
      ],
    }),
    mk('Error Boundaries', 'frontend', react.id, {
      definition: 'Error boundaries catch render/lifecycle errors in descendant trees and show fallback UI instead of crashing whole app.',
      codeExample:
        "class Boundary extends React.Component {\n  state = { hasError: false };\n  static getDerivedStateFromError() { return { hasError: true }; }\n  render() { return this.state.hasError ? <p>Something failed.</p> : this.props.children; }\n}",
      flashcards: [
        card('Do error boundaries catch async event handler errors?', 'No. They catch render/lifecycle errors, not arbitrary async callbacks.'),
        card('Why place multiple boundaries in large apps?', 'To isolate failures and keep unaffected sections interactive.'),
      ],
    }),
    mk('Refs & DOM', 'frontend', react.id, {
      definition: 'Refs provide escape hatches for imperative DOM actions like focus, measurement, and integration with third-party libraries.',
      codeExample:
        "const modalRef = useRef(null);\nuseEffect(() => {\n  modalRef.current?.showModal();\n}, []);\n\nreturn <dialog ref={modalRef}>Hello</dialog>;",
      flashcards: [
        card('Why are refs considered escape hatches?', 'They bypass declarative flow and should be used only when declarative alternatives are impractical.'),
        card('What does forwardRef enable?', 'Passing ref through wrapper components to underlying DOM/child instance.'),
      ],
    }),
    mk('Patterns (HOC, render props, compound, custom hooks)', 'frontend', react.id, {
      definition: 'Reusable architecture patterns manage shared logic and APIs; modern React usually favors custom hooks and compound components.',
      codeExample:
        "function useToggle(initial = false) {\n  const [on, setOn] = useState(initial);\n  const toggle = useCallback(() => setOn((v) => !v), []);\n  return { on, toggle };\n}",
      flashcards: [
        card('Why have custom hooks replaced many HOCs/render-prop usages?', 'Hooks avoid wrapper nesting and provide cleaner composition of stateful logic.'),
        card('What is a compound component API?', 'A parent manages shared state while child subcomponents read that state via context.'),
      ],
    }),
    mk('Concurrent Features (transitions, deferred values)', 'frontend', react.id, {
      definition: 'Concurrent features let urgent updates render first and non-urgent work be interrupted for smoother interactions.',
      codeExample:
        "const [isPending, startTransition] = useTransition();\nconst deferredQuery = useDeferredValue(query);\n\nfunction onInput(e) {\n  const next = e.target.value;\n  setQuery(next);\n  startTransition(() => setFilters(buildFilters(next)));\n}",
      flashcards: [
        card('What kind of updates belong in startTransition?', 'Non-urgent updates like expensive filtering or route-level view updates.'),
        card('How is useDeferredValue different from debouncing?', 'It keeps immediate input updates while deferring expensive consumers, without fixed time delay.'),
      ],
    })
  );

  // Next.js
  const next = mk('Next.js (App Router)', 'frontend', null, {
    definition:
      'Next.js App Router is a full-stack React framework model built around nested routes, server components, and streaming. It blends server rendering, caching, and client interactivity in one architecture. Route segments define layouts, loading states, and error boundaries co-located with UI. It also supports server actions and route handlers for mutation and API concerns.',
    codeExample:
      "import { notFound } from 'next/navigation';\n\nexport default async function ProductPage({ params }) {\n  const res = await fetch(`https://api.example.com/products/${params.id}`, {\n    next: { revalidate: 60 },\n  });\n  if (!res.ok) notFound();\n\n  const product = await res.json();\n  return (\n    <main>\n      <h1>{product.name}</h1>\n      <p>{product.description}</p>\n    </main>\n  );\n}",
    whenUsed:
      'Primary fit for `p-docs` where SSR/SEO, route-level composition, and collaboration workflows benefit from App Router and server-first rendering.',
    gotchas:
      'Forgetting `"use client"` in interactive components causes hook/event-handler errors.\nAccidentally moving large modules into client components increases bundle size.\nMisunderstanding fetch caching defaults can return stale data unexpectedly.\nCalling server-only APIs (`cookies`, `headers`) in client components fails.\nRelying only on client navigation events for data freshness ignores server cache invalidation.',
    flashcards: [
      card('Why does App Router default to Server Components?', 'To reduce shipped JavaScript, improve TTFB/SEO, and keep data fetching close to the server.'),
      card('How do layout.tsx and template.tsx differ in behavior?', 'Layouts persist between sibling navigations; templates re-mount on navigation for reset behavior.'),
      card('When should you prefer Server Actions over route handlers?', 'For form/mutation flows tightly coupled to UI where direct action invocation simplifies wiring.'),
      card('Why can fetch in Next.js behave differently than browser fetch?', 'Next augments fetch with request memoization and cache controls integrated with route rendering.'),
      card('What role does loading.tsx play in streaming?', 'It provides immediate fallback UI while route segment data/components are still rendering.'),
      card('How do route groups help large apps?', 'They organize folders without affecting URL path structure.'),
      card('Why can middleware hurt performance if overused?', 'It runs on many requests and should remain lightweight, edge-friendly, and focused.'),
      card('What is the safe rule for client/server boundary placement?', 'Keep server by default and introduce small leaf client components only where interactivity is needed.'),
    ],
    apis: [
      api('cookies', 'cookies(): ReadonlyRequestCookies', 'Reads incoming request cookies in server contexts.', 'none', 'ReadonlyRequestCookies', "import { cookies } from 'next/headers';\nconst token = cookies().get('token')?.value;", 'Not usable in client components.'),
      api('headers', 'headers(): ReadonlyHeaders', 'Reads request headers in Server Components and handlers.', 'none', 'ReadonlyHeaders', "const ua = headers().get('user-agent');", 'Read-only and server-only.'),
      api('redirect', 'redirect(url: string): never', 'Performs server redirect by throwing internal control signal.', 'destination URL', 'never', "if (!session) redirect('/login');", 'Do not wrap in try/catch for normal control flow.'),
      api('notFound', 'notFound(): never', 'Triggers nearest not-found boundary.', 'none', 'never', "if (!post) notFound();", 'Needs proper `not-found.tsx` fallback for best UX.'),
      api('revalidatePath', 'revalidatePath(path: string, type?: "page" | "layout")', 'Invalidates cached route data after mutation.', 'route path and optional scope', 'void', "revalidatePath('/docs');", 'Server-side only.'),
      api('revalidateTag', 'revalidateTag(tag: string)', 'Invalidates data cache by tag.', 'tag string used in fetch options', 'void', "revalidateTag('posts');", 'Only works for tagged fetches.'),
      api('useRouter', 'useRouter(): AppRouterInstance', 'Client hook for imperative navigation.', 'none', 'router instance', "const router = useRouter();\nrouter.push('/dashboard');", 'Client component only.'),
      api('usePathname', 'usePathname(): string', 'Returns current pathname in client components.', 'none', 'pathname string', "const pathname = usePathname();", 'Can re-render frequently on navigation.'),
      api('next/image', '<Image src alt width height />', 'Optimized image component with resizing and lazy loading.', 'src, alt, dimensions, optional sizes', 'React element', "<Image src='/hero.jpg' alt='Hero' width={1200} height={600} />", 'Remote domains need explicit configuration.'),
    ],
    refs: [
      ref('Next.js App Router Docs', 'https://nextjs.org/docs/app'),
      ref('Server and Client Components', 'https://nextjs.org/docs/app/building-your-application/rendering/server-components'),
      ref('Data Fetching Patterns', 'https://nextjs.org/docs/app/building-your-application/data-fetching'),
      ref('Route Handlers', 'https://nextjs.org/docs/app/building-your-application/routing/route-handlers'),
      ref('Next.js Image Component', 'https://nextjs.org/docs/app/api-reference/components/image'),
    ],
    relatedProjectIds: ['p-docs'],
  });
  skills.push(next);

  [
    ['App Router fundamentals', 'File-based nested routing with special files like page, layout, loading, and error.', 'app/\n  dashboard/\n    layout.tsx\n    page.tsx\n    loading.tsx'],
    ['Server Components vs Client Components', 'Server Components render on server; Client Components add interactivity and browser APIs.', '"use client";\nimport { useState } from "react";\n\nexport default function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN((v) => v + 1)}>{n}</button>;\n}'],
    ['Server Actions', 'Functions marked with "use server" for mutations without separate client fetch boilerplate.', '"use server";\n\nexport async function createPost(formData) {\n  await db.post.create({ data: { title: formData.get("title") } });\n}'],
    ['Routing (dynamic, parallel, intercepting, groups)', 'Advanced route composition patterns for complex UI and navigation behavior.', 'app/\n  (marketing)/page.tsx\n  dashboard/[teamId]/page.tsx\n  @modal/(.)settings/page.tsx'],
    ['Data Fetching & Caching', 'Fetch supports static, dynamic, revalidate, and tagged cache invalidation strategies.', "const data = await fetch(url, { next: { revalidate: 120, tags: ['stats'] } }).then(r => r.json());"],
    ['Layouts & Templates', 'Layouts persist state; templates re-mount on navigation to reset local state.', 'export default function Layout({ children }) {\n  return <section>{children}</section>;\n}'],
    ['Loading & Error UI', 'Segment-level loading and error boundaries improve resilience and perceived performance.', 'export default function Loading() {\n  return <p>Loading section...</p>;\n}'],
    ['Middleware', 'Edge middleware intercepts requests for auth, redirects, locale, and URL normalization.', "export function middleware(req) {\n  if (!req.cookies.get('session')) {\n    return NextResponse.redirect(new URL('/login', req.url));\n  }\n}"],
    ['API Routes / Route Handlers', 'Route handlers in `route.ts` implement HTTP methods for server endpoints.', "export async function GET() {\n  return Response.json({ ok: true });\n}"],
    ['Performance (Image, Font, Script)', 'Use Next optimizers for image loading, font hosting, and script strategies.', "import Script from 'next/script';\n<Script src='https://example.com/sdk.js' strategy='afterInteractive' />"],
  ].forEach(([name, definition, codeExample]) => {
    skills.push(
      mk(name, 'frontend', next.id, {
        definition,
        codeExample,
        flashcards: [
          card(`What is the main decision point in ${name}?`, 'Choose the smallest feature set that solves the requirement while keeping server-first defaults.'),
          card(`What usually goes wrong first in ${name}?`, 'Incorrect assumptions about runtime boundary (server vs client) or cache lifecycle.'),
        ],
      })
    );
  });

  // TypeScript
  const ts = mk('TypeScript', 'frontend', null, {
    definition:
      'TypeScript adds static typing and tooling guarantees on top of JavaScript. It improves correctness through inference, narrowing, and expressive type composition. The compiler removes types at build time, so runtime behavior is still JavaScript. Its strongest value is safe refactoring and precise contracts across modules, APIs, and UI state.',
    codeExample:
      "type User = { id: string; role: 'admin' | 'editor'; email?: string };\n\nfunction canEdit(user: User): boolean {\n  return user.role === 'admin' || user.role === 'editor';\n}\n\nasync function fetchUser(id: string): Promise<User> {\n  const res = await fetch(`/api/users/${id}`);\n  if (!res.ok) throw new Error('Failed');\n  return res.json() as Promise<User>;\n}",
    whenUsed:
      'Core language for `p-docs` and `p-maak`, improving API contract safety, complex UI state reliability, and maintainability under iterative shipping.',
    gotchas:
      'Using `any` broadly destroys type-safety guarantees and propagates errors.\nType assertions (`as`) can hide real mismatches and cause runtime failures.\nStructural typing can accept unintended shapes when discriminants are weak.\nEnums and classes add runtime output; prefer unions/literals when possible.\nDeclaration files can drift from implementation and create false confidence.',
    flashcards: [
      card('Why is `unknown` safer than `any`?', '`unknown` forces narrowing before use; `any` allows unsafe operations without checks.'),
      card('What is excess property checking and when does it trigger?', 'It checks extra keys on fresh object literals assigned to typed targets, catching likely typos.'),
      card('Why are discriminated unions powerful for UI state?', 'They encode impossible states and enable exhaustive switch checks at compile time.'),
      card('How does inference reduce annotation noise?', 'TypeScript infers types from initializers, function return paths, and generic call sites automatically.'),
      card('What is declaration merging?', 'Certain declarations with same name (like interfaces/namespaces) combine into one type shape.'),
      card('When should you use `satisfies`?', 'When validating object shape against a type while preserving narrow literal types of the object.'),
      card('Why can widening be dangerous with literals?', 'Without `as const`, literals widen to broad types and lose discriminant precision.'),
      card('What is the compile-time/runtime boundary in TypeScript?', 'Types exist only at compile time; runtime checks still require JavaScript validation logic.'),
    ],
    apis: [
      api('Partial', 'Partial<T>', 'Makes all properties optional.', 'T: source type', 'type', 'type Patch = Partial<User>;', 'Shallow only.'),
      api('Pick', 'Pick<T, K extends keyof T>', 'Selects subset of keys from a type.', 'T and key union K', 'type', "type PublicUser = Pick<User, 'id' | 'role'>;", 'Invalid keys fail compilation.'),
      api('Omit', 'Omit<T, K extends keyof any>', 'Removes keys from a type.', 'T and keys to remove', 'type', "type NewUser = Omit<User, 'id'>;", 'Can remove keys not in T when K is too broad.'),
      api('Record', 'Record<K extends PropertyKey, T>', 'Creates object map type from key union to value type.', 'K keys and value type T', 'type', "type RoleMap = Record<'admin' | 'editor', number>;", 'All keys in K are required.'),
      api('ReturnType', 'ReturnType<T>', 'Extracts return type from function type.', 'Function type T', 'type', 'type R = ReturnType<typeof makeConfig>;', 'Overloaded functions may produce broad unions.'),
      api('Awaited', 'Awaited<T>', 'Recursively unwraps Promise result type.', 'Promise-like type', 'unwrapped type', 'type Data = Awaited<ReturnType<typeof fetchData>>;', 'Older TS versions may lack full behavior.'),
      api('Parameters', 'Parameters<T>', 'Extracts tuple of parameter types from function type.', 'Function type T', 'tuple type', 'type Args = Parameters<typeof sendEmail>;', 'Use with concrete function signatures for best inference.'),
      api('satisfies', 'value satisfies Type', 'Checks assignability while preserving narrow inferred literal types.', 'value expression and target type', 'value unchanged', "const config = { mode: 'prod' } satisfies { mode: 'prod' | 'dev' };", 'Not a cast; it validates shape and may surface missing keys.'),
    ],
    refs: [
      ref('TypeScript Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'),
      ref('TypeScript Utility Types', 'https://www.typescriptlang.org/docs/handbook/utility-types.html'),
      ref('TypeScript Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html'),
      ref('TypeScript Generics', 'https://www.typescriptlang.org/docs/handbook/2/generics.html'),
      ref('Declaration Files', 'https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html'),
    ],
    relatedProjectIds: ['p-docs', 'p-maak'],
  });
  skills.push(ts);

  [
    'Basic Types & Inference',
    'Interfaces vs Types',
    'Generics',
    'Utility Types',
    'Discriminated Unions',
    'Type Narrowing & Guards',
    'Conditional Types',
    'Mapped Types',
    'Template Literal Types',
    'Module Declarations',
  ].forEach((name) => {
    skills.push(
      mk(name, 'frontend', ts.id, {
        definition: `${name} is a core TypeScript topic for expressing intent and preventing category-level bugs before runtime.`,
        codeExample:
          name === 'Generics'
            ? 'function identity<T>(value: T): T {\n  return value;\n}'
            : name === 'Discriminated Unions'
              ? "type Result = { ok: true; data: string } | { ok: false; error: string };"
              : name === 'Type Narrowing & Guards'
                ? "function isString(v: unknown): v is string {\n  return typeof v === 'string';\n}"
                : 'type Example = { a: string; b: number };',
        flashcards: [
          card(`In ${name}, what typically causes unsafe code?`, 'Over-widened types, unchecked assertions, or skipping exhaustive checks.'),
          card(`How do you validate understanding of ${name} in code review?`, 'Check if impossible states are encoded out and function boundaries are explicitly typed.'),
        ],
      })
    );
  });

  // JavaScript
  const js = mk('JavaScript (ES6+)', 'frontend', null, {
    definition:
      'JavaScript is the runtime language of the web and many server/tooling platforms. ES6+ adds modern syntax and primitives such as let/const, modules, classes, promises, and iterators. Mastery means understanding both language ergonomics and runtime behavior like event loop scheduling. Most frontend framework abstractions eventually map back to plain JavaScript semantics.',
    codeExample:
      "const cache = new Map();\n\nexport async function getJson(url) {\n  if (cache.has(url)) return cache.get(url);\n\n  const promise = fetch(url).then((r) => {\n    if (!r.ok) throw new Error(`HTTP ${r.status}`);\n    return r.json();\n  });\n\n  cache.set(url, promise);\n  return promise;\n}",
    whenUsed:
      'Foundational in `p-editor` and `p-packarma` where event handling, async orchestration, and DOM/state transformations are intensive.',
    gotchas:
      '`this` binding changes with call-site; arrow functions capture lexical `this`.\n`for...in` traverses enumerable inherited keys; often wrong for arrays.\nPromise rejection without catch can terminate flows and hide UX failures.\nObject/array shallow copies do not clone nested references.\nMicrotasks run before next macrotask and can starve rendering if chained heavily.',
    flashcards: [
      card('Why does `for...of` behave differently from `for...in` on arrays?', '`for...of` iterates iterable values; `for...in` iterates enumerable keys including inherited ones.'),
      card('What is the TDZ and why does it exist?', 'Temporal Dead Zone blocks `let`/`const` access before declaration, preventing hoisting confusion.'),
      card('How do microtasks affect perceived UI responsiveness?', 'Large microtask queues run before painting, delaying visual updates.'),
      card('What is closure in practical terms?', 'A function retaining access to lexical variables after outer function has returned.'),
      card('Why is `Promise.all` risky for partial failure scenarios?', 'Any single rejection rejects the whole aggregate; use `allSettled` when partial success is acceptable.'),
      card('How does prototype lookup work?', 'Property access checks object first, then climbs `[[Prototype]]` chain until found or null.'),
      card('What makes ESM statically analyzable?', 'Import/export structure is declared at top-level and cannot be conditionally redefined like CommonJS.'),
      card('Why can spreading objects be misleading in updates?', 'Spread is shallow; nested objects still share references.'),
    ],
    apis: [
      api('Promise.all', 'Promise.all(iterable)', 'Resolves when all promises resolve, rejects on first failure.', 'iterable of promises/values', 'Promise<array>', "const [a, b] = await Promise.all([fetchA(), fetchB()]);", 'Fails fast; use allSettled for independent tasks.'),
      api('Promise.allSettled', 'Promise.allSettled(iterable)', 'Waits for all promises and returns status objects.', 'iterable', 'Promise<[{status, value|reason}]>', 'const results = await Promise.allSettled(tasks);', 'Must inspect statuses manually.'),
      api('Array.prototype.map', 'arr.map((value, index, array) => newValue)', 'Transforms each item to a new array.', 'mapper callback', 'new array', 'const names = users.map((u) => u.name);', 'Avoid side effects inside map; use for transformation.'),
      api('Array.prototype.reduce', 'arr.reduce((acc, cur) => nextAcc, initial)', 'Folds array into single value.', 'reducer callback and initial accumulator', 'accumulated value', "const total = prices.reduce((sum, p) => sum + p, 0);", 'Missing initial value can break empty arrays.'),
      api('Object.entries', 'Object.entries(obj)', 'Returns array of [key, value] pairs for own enumerable props.', 'object', 'array of tuples', 'for (const [k, v] of Object.entries(config)) {}', 'Ignores non-enumerable and symbol keys.'),
      api('Object.fromEntries', 'Object.fromEntries(iterable)', 'Builds object from key-value pair iterable.', 'iterable of [key, value]', 'object', "const obj = Object.fromEntries(new URLSearchParams(search));", 'Later duplicate keys overwrite earlier ones.'),
      api('setTimeout', 'setTimeout(callback, delay, ...args)', 'Schedules macrotask execution after delay.', 'callback and delay', 'timeout ID', "const id = setTimeout(() => console.log('later'), 300);", 'Minimum delay is not guaranteed under load/clamping.'),
      api('queueMicrotask', 'queueMicrotask(callback)', 'Schedules callback in microtask queue.', 'callback', 'void', "queueMicrotask(() => flushPendingUpdates());", 'Long microtask chains can delay paint/input handling.'),
    ],
    refs: [
      ref('MDN JavaScript Guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'),
      ref('MDN Reference', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference'),
      ref('ECMAScript Specification', 'https://tc39.es/ecma262/'),
      ref('JavaScript Event Loop (web.dev)', 'https://web.dev/articles/optimize-long-tasks'),
      ref('Node.js Event Loop Guide', 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick'),
    ],
    relatedProjectIds: ['p-editor', 'p-packarma'],
  });
  skills.push(js);

  [
    'Variables & Scoping',
    'Functions (arrow, this, closures)',
    'Objects & Prototypes',
    'Promises & Async/Await',
    'Iterators & Generators',
    'Destructuring, Spread & Rest',
    'Modules (ESM vs CommonJS)',
    'Classes',
    'Event Loop & Microtasks',
    'Array/Object methods',
  ].forEach((name) => {
    skills.push(
      mk(name, 'frontend', js.id, {
        definition: `${name} controls how JavaScript code executes, composes data, and avoids hidden runtime bugs.`,
        codeExample:
          name === 'Promises & Async/Await'
            ? "async function load() {\n  try {\n    return await fetch('/api').then((r) => r.json());\n  } catch (e) {\n    return null;\n  }\n}"
            : name === 'Event Loop & Microtasks'
              ? "setTimeout(() => console.log('macro'), 0);\nPromise.resolve().then(() => console.log('micro'));"
              : 'const value = source?.nested ?? defaultValue;',
        flashcards: [
          card(`What interview trap appears often in ${name}?`, 'Confusing syntax sugar with runtime behavior (e.g., async/await still uses promises and microtasks).'),
          card(`How do you debug ${name} issues in production?`, 'Reproduce minimal case, inspect execution order/this-binding, and verify assumptions with logs/tests.'),
        ],
      })
    );
  });

  // HTML5
  const html = mk('HTML5', 'frontend', null, {
    definition:
      'HTML5 defines semantic document structure, media primitives, forms, and browser-native platform features. Good HTML improves accessibility, SEO, interoperability, and resilience regardless of framework. Semantic elements communicate intent to assistive tech and search engines. Many performance and usability wins come from correct native markup before JavaScript enhancements.',
    codeExample:
      "<main>\n  <article>\n    <header>\n      <h1>Weekly Report</h1>\n      <p><time datetime='2026-05-20'>May 20, 2026</time></p>\n    </header>\n\n    <section>\n      <h2>Highlights</h2>\n      <ul>\n        <li>Shipping velocity improved</li>\n      </ul>\n    </section>\n  </article>\n</main>",
    whenUsed:
      'Used across all projects for accessible structure, forms, metadata, and embedded media patterns.',
    gotchas:
      'Div-heavy markup without landmarks harms keyboard/screen-reader navigation.\nMissing labels/`name` attributes in forms causes broken submission payloads.\nIncorrect heading hierarchy reduces accessibility and document scanning.\nRelying only on placeholder text instead of labels hurts usability.\nDuplicate IDs break label binding and script selectors.',
    flashcards: [
      card('Why is semantic HTML still crucial in SPA frameworks?', 'Assistive technologies and crawlers consume rendered markup semantics, not framework abstractions.'),
      card('What is the difference between `<button>` and `<div role="button">`?', 'Native button gets keyboard, focus, semantics, and form behavior by default; role-based div needs manual parity.'),
      card('When should ARIA not be added?', 'When native semantic element already expresses intent; redundant ARIA can introduce conflicts.'),
      card('Why should form validation not rely only on client JS?', 'Native constraints can be bypassed; server validation is the authoritative gate.'),
      card('How does `<picture>` improve media delivery?', 'It enables source selection by media query/format for responsive and efficient image loading.'),
      card('What is the SEO role of `<meta name="description">`?', 'It influences search snippets and click-through behavior though not guaranteed ranking.'),
      card('Why are landmarks like `<main>` and `<nav>` important?', 'They provide structural shortcuts for assistive technology navigation.'),
      card('What makes custom elements safe to use progressively?', 'Browsers ignore unknown tags gracefully and upgrade behavior when definition loads.'),
    ],
    apis: [
      api('<dialog>', '<dialog open>...</dialog>', 'Native modal/dialog primitive with built-in focus management hooks.', 'open attribute and JS methods', 'HTMLElement', "const dialog = document.querySelector('dialog');\ndialog.showModal();", 'Need fallback strategy for legacy browsers.'),
      api('<details>/<summary>', '<details><summary>Title</summary>Body</details>', 'Built-in disclosure widget without JS.', 'summary label and content', 'interactive element', '<details><summary>FAQ</summary><p>Answer</p></details>', 'Styling summary marker can vary by browser.'),
      api('FormData', 'new FormData(formElement)', 'Collects form fields into key-value pairs for fetch/XHR submission.', 'form element', 'FormData instance', "const payload = new FormData(form);\nfetch('/submit', { method: 'POST', body: payload });", 'Only fields with `name` are included.'),
      api('Constraint Validation', 'input.checkValidity(), form.reportValidity()', 'Native validation API for required/pattern/range constraints.', 'form/input element methods', 'boolean/void', "if (!email.checkValidity()) email.reportValidity();", 'Still requires server-side validation.'),
      api('<picture>/srcset', '<picture><source ... /><img ... /></picture>', 'Responsive and format-aware image delivery.', 'source media/type and fallback img', 'rendered image', "<picture><source type='image/avif' srcset='hero.avif' /><img src='hero.jpg' alt='Hero' /></picture>", 'Always include fallback `<img>` with alt text.'),
    ],
    refs: [
      ref('MDN HTML Reference', 'https://developer.mozilla.org/en-US/docs/Web/HTML'),
      ref('WHATWG HTML Living Standard', 'https://html.spec.whatwg.org/'),
      ref('web.dev Accessibility', 'https://web.dev/accessibility'),
      ref('WAI-ARIA Authoring Practices', 'https://www.w3.org/WAI/ARIA/apg/'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-editor', 'p-maak', 'p-packarma'],
  });
  skills.push(html);

  [
    'Semantic Elements',
    'Forms & Validation',
    'Accessibility & ARIA',
    'Media',
    'Canvas basics',
    'Web Storage APIs',
    'Meta tags & SEO',
    'Web Components basics',
  ].forEach((name) => {
    skills.push(
      mk(name, 'frontend', html.id, {
        definition: `${name} in HTML5 focuses on native browser capabilities before adding framework abstractions.`,
        codeExample:
          name === 'Forms & Validation'
            ? "<form>\n  <label>Email <input type='email' required /></label>\n  <button type='submit'>Submit</button>\n</form>"
            : name === 'Canvas basics'
              ? "const canvas = document.querySelector('canvas');\nconst ctx = canvas.getContext('2d');\nctx.fillRect(10, 10, 120, 60);"
              : '<section aria-labelledby="title"><h2 id="title">Section</h2></section>',
        flashcards: [
          card(`What is the high-value default for ${name}?`, 'Use native semantics first; add ARIA/JS only where behavior cannot be expressed natively.'),
          card(`What breaks most often in ${name}?`, 'Assuming visual correctness equals semantic/accessibility correctness.'),
        ],
      })
    );
  });

  // CSS3
  const css = mk('CSS3', 'frontend', null, {
    definition:
      'CSS3 controls presentation, layout, and responsive behavior of web documents. Modern CSS includes flexible layout systems, custom properties, and container/media queries for adaptive design. Performance and maintainability depend on predictable cascade strategy and specificity management. Great CSS minimizes override battles while keeping components themeable and resilient.',
    codeExample:
      ":root {\n  --space: clamp(0.75rem, 2vw, 1.5rem);\n  --card-radius: 12px;\n}\n\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: var(--space);\n}\n\n.card {\n  border-radius: var(--card-radius);\n  padding: var(--space);\n  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);\n}",
    whenUsed:
      'Used in all projects for responsive layouts, design-system tokens, and component-level styling constraints.',
    gotchas:
      'Specificity escalation (`!important`, deeply nested selectors) makes future changes expensive.\nMixing layout concerns across utility and component layers creates cascade conflicts.\nAnimating layout-affecting properties can cause jank; prefer transform/opacity.\nFixed widths without constraints break small viewports.\nIgnoring logical properties complicates RTL and writing-mode support.',
    flashcards: [
      card('Why is CSS specificity debt dangerous?', 'It forces stronger selectors over time and makes refactors unpredictable.'),
      card('When should Grid be preferred over Flexbox?', 'Two-dimensional layouts with explicit rows and columns are clearer in Grid.'),
      card('What is the practical use of `clamp()`?', 'It creates fluid, bounded values for typography and spacing across viewport ranges.'),
      card('Why are CSS custom properties better than preprocess-only variables for theming?', 'They are runtime-resolvable and can be changed per element/context.'),
      card('How do container queries differ from media queries?', 'Container queries respond to container size, enabling reusable responsive components.'),
      card('What performance rule matters for transitions?', 'Animate transform/opacity when possible to avoid layout/repaint heavy updates.'),
      card('Why can `position: sticky` appear broken?', 'Any ancestor with overflow clipping or improper container context can disable sticky behavior.'),
      card('What makes pseudo-elements useful in design systems?', 'They add decorative/content primitives without extra markup.'),
    ],
    apis: [
      api('display: grid', 'display: grid; grid-template-columns: ...', 'Creates a two-dimensional layout context.', 'container declaration', 'layout behavior', '.layout { display: grid; grid-template-columns: 1fr 2fr; }', 'Children become grid items and auto-placement rules apply.'),
      api('display: flex', 'display: flex; justify-content; align-items', 'Creates one-dimensional flex formatting context.', 'container declaration and alignment props', 'layout behavior', '.row { display: flex; gap: 12px; }', 'Min-content sizing can cause unexpected overflow without min-width controls.'),
      api('clamp', 'clamp(min, preferred, max)', 'Returns a bounded responsive value.', 'three length/number values', 'computed value', 'font-size: clamp(1rem, 2vw, 1.5rem);', 'Units should be compatible for predictable interpolation.'),
      api('container queries', '@container (min-width: 40rem) { ... }', 'Applies styles based on container size instead of viewport.', 'container-type on parent and query condition', 'conditional styles', '.card-list { container-type: inline-size; }', 'Requires explicit container context.'),
      api('custom properties', '--token / var(--token)', 'Defines reusable runtime CSS variables.', 'property declarations and var() lookups', 'resolved CSS value', ':root { --brand: #2563eb; } .btn { background: var(--brand); }', 'Fallbacks are important for partially defined themes.'),
    ],
    refs: [
      ref('MDN CSS Reference', 'https://developer.mozilla.org/en-US/docs/Web/CSS'),
      ref('CSS-Tricks Complete Guide to Grid', 'https://css-tricks.com/snippets/css/complete-guide-grid/'),
      ref('CSS-Tricks Complete Guide to Flexbox', 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/'),
      ref('web.dev Learn CSS', 'https://web.dev/learn/css/'),
      ref('W3C CSS Specifications', 'https://www.w3.org/Style/CSS/specs.en.html'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-editor', 'p-maak', 'p-packarma'],
  });
  skills.push(css);

  [
    'Selectors & Specificity',
    'Box Model',
    'Flexbox',
    'Grid',
    'Positioning',
    'Transitions & Animations',
    'Transforms',
    'Responsive Design',
    'Custom Properties',
    'Pseudo-classes & Pseudo-elements',
  ].forEach((name) => {
    skills.push(
      mk(name, 'frontend', css.id, {
        definition: `${name} is a core CSS3 concept for writing predictable, maintainable interface styles.`,
        codeExample:
          name === 'Grid'
            ? ".dashboard {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-areas: 'sidebar main';\n}"
            : name === 'Transitions & Animations'
              ? ".btn { transition: transform 200ms ease; }\n.btn:hover { transform: translateY(-2px); }"
              : '.component { padding: 1rem; }',
        flashcards: [
          card(`What fails first in ${name} under scale?`, 'Implicit assumptions about cascade/layout context that do not hold as components are reused.'),
          card(`What is the senior-level practice in ${name}?`, 'Encode constraints explicitly and avoid one-off overrides that leak across components.'),
        ],
      })
    );
  });

  return skills;
}
