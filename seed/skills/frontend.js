// seed/skills/frontend.js — React.js, Next.js, TypeScript, and flat frontend skills
import { mk, uid } from '../helpers.js';

export default function buildFrontendSkills() {
  // ── React.js ──────────────────────────────────────────────────────────────
  const react = mk('React.js', 'frontend', null, {
    definition:
      'Component-based JS library for building UIs through composable, declarative components with a virtual DOM diffing model.',
    whenUsed:
      '7+ years across all roles. Currently leading React architecture for 5+ enterprise apps at NeoSoft.',
    gotchas:
      'Stale closures in useEffect, unnecessary re-renders from inline objects/functions, key prop misuse breaking reconciliation.',
    flashcards: [
      { id: uid(), q: 'What triggers a re-render?', a: 'State change (setState), prop change, parent re-render, context value change.' },
    ],
    apis: [
      {
        id: uid(),
        name: 'useState',
        signature: 'useState<T>(initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>]',
        description: 'Adds local state to a function component. Returns current value and a setter.',
        params: 'initial — initial value, or a lazy initializer function called only on first render.',
        returns: '[value, setValue] tuple. Setter accepts a new value or a function (prev => next).',
        example: 'const [count, setCount] = useState(0);\nconst [user, setUser] = useState(() => loadUser());',
        gotchas: 'Setter is async. Use functional form when new state depends on previous: setCount(c => c + 1).',
      },
      {
        id: uid(),
        name: 'useEffect',
        signature: 'useEffect(effect: () => void | (() => void), deps?: any[]): void',
        description: 'Run side effects after render. Optional cleanup function returned from effect.',
        params: 'effect — function to run after commit. deps — array of values; effect re-runs when any change.',
        returns: 'void',
        example: 'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);',
        gotchas: 'Empty deps = run once. Missing deps = stale closures. Object/array deps = infinite loop risk.',
      },
      {
        id: uid(),
        name: 'useMemo',
        signature: 'useMemo<T>(factory: () => T, deps: any[]): T',
        description: 'Memoize an expensive computation. Recomputes only when deps change.',
        params: 'factory — produces the value. deps — array; recompute when any change.',
        returns: 'Memoized value of type T.',
        example: 'const sorted = useMemo(() => list.sort(cmp), [list]);',
        gotchas: 'Not free — has overhead. Use only for genuinely expensive work or referential equality needs.',
      },
      {
        id: uid(),
        name: 'useCallback',
        signature: 'useCallback<T extends Function>(fn: T, deps: any[]): T',
        description: 'Memoize a function reference across renders. Equivalent to useMemo(() => fn, deps).',
        params: 'fn — the function. deps — array.',
        returns: 'Stable function reference.',
        example: 'const handleClick = useCallback(() => doThing(id), [id]);',
        gotchas: 'Only useful when child relies on referential equality (React.memo, useEffect dep).',
      },
      {
        id: uid(),
        name: 'useContext',
        signature: 'useContext<T>(context: Context<T>): T',
        description: 'Subscribe to a React context. Re-renders whenever the nearest provider value changes.',
        params: 'context — value from createContext.',
        returns: 'Current context value.',
        example: 'const theme = useContext(ThemeContext);',
        gotchas: 'Every consumer re-renders on any provider value change — split contexts for performance.',
      },
      {
        id: uid(),
        name: 'createContext',
        signature: 'createContext<T>(defaultValue: T): Context<T>',
        description: 'Create a context object for passing data through the component tree without prop drilling.',
        params: 'defaultValue — used when no Provider is found above.',
        returns: 'Context object with Provider and Consumer.',
        example: "const ThemeContext = createContext<'light'|'dark'>('light');",
        gotchas: 'defaultValue is only used outside a Provider — not when Provider value is undefined.',
      },
    ],
  });

  const hooks = mk('Hooks', 'frontend', react.id, {
    definition: 'Functions starting with "use" that let function components hook into React features (state, effects, context, refs).',
    gotchas: 'Rules of Hooks — call at top level only, never in loops/conditions/nested fns.',
  });

  const useState_ = mk('useState', 'frontend', hooks.id, {
    definition: 'Hook for adding local state. Returns [value, setter].',
    codeExample: 'const [count, setCount] = useState(0);',
    flashcards: [
      { id: uid(), q: 'Functional update — when needed?', a: 'When new state depends on previous: setCount(c => c + 1). Avoids stale closure bugs.' },
    ],
  });

  const useEffect_ = mk('useEffect', 'frontend', hooks.id, {
    definition: 'Run side-effects after render. Returns optional cleanup fn.',
    codeExample: 'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);',
    gotchas: 'Stale closures over state, missing deps in dep array, infinite loops from object/array deps.',
    flashcards: [
      { id: uid(), q: 'Empty deps array means?', a: 'Effect runs once after mount, cleanup runs on unmount.' },
    ],
  });

  const useMemoCallback = mk('useMemo & useCallback', 'frontend', hooks.id, {
    definition: 'Memoize values (useMemo) and function references (useCallback) across renders.',
    codeExample: 'const expensive = useMemo(() => compute(x), [x]);\nconst handler = useCallback(() => doThing(x), [x]);',
    flashcards: [
      { id: uid(), q: 'useCallback(fn, deps) ≡ ?', a: 'useMemo(() => fn, deps)' },
    ],
  });

  const reconciliation = mk('Reconciliation', 'frontend', react.id, {
    definition: 'React\'s diffing algo that compares new tree to previous and applies minimal DOM ops.',
    gotchas: 'Keys must be stable & unique. Array index as key breaks list reordering.',
  });

  const componentsSub = mk('Components & Props', 'frontend', react.id, {
    definition: 'Building blocks of React. Receive props, return JSX. Function components are default.',
  });

  // ── Next.js ───────────────────────────────────────────────────────────────
  const next = mk('Next.js (App Router)', 'frontend', null, {
    definition: 'React framework with file-based routing, server components, server actions, streaming SSR.',
    whenUsed: 'Building full-stack apps at NeoSoft with dynamic routing, RBAC, SEO.',
    apis: [
      {
        id: uid(),
        name: 'cookies()',
        signature: 'cookies(): ReadonlyRequestCookies',
        description: 'Server-only function to read incoming request cookies. Must be called inside a Server Component or route handler.',
        params: 'None.',
        returns: 'ReadonlyRequestCookies — call .get(name), .has(name), .getAll().',
        example: "import { cookies } from 'next/headers';\nconst token = cookies().get('token')?.value;",
        gotchas: "Only readable in Server Components — can't set cookies here; use route handlers or Server Actions for writes.",
      },
      {
        id: uid(),
        name: 'redirect()',
        signature: 'redirect(url: string, type?: RedirectType): never',
        description: 'Redirects the user to a different URL. Throws internally so it must not be caught.',
        params: 'url — destination. type — "replace" (default) or "push".',
        returns: 'never — throws a NEXT_REDIRECT error caught by Next.js internals.',
        example: "import { redirect } from 'next/navigation';\nif (!session) redirect('/login');",
        gotchas: 'Do not wrap in try/catch. Cannot be used inside event handlers — Server Components and Actions only.',
      },
      {
        id: uid(),
        name: 'notFound()',
        signature: 'notFound(): never',
        description: 'Renders the nearest not-found.tsx boundary. Call when a resource cannot be found.',
        params: 'None.',
        returns: 'never — throws internally.',
        example: "import { notFound } from 'next/navigation';\nconst post = await getPost(id);\nif (!post) notFound();",
        gotchas: 'Must have a not-found.tsx in the route segment; otherwise falls back to the root 404.',
      },
      {
        id: uid(),
        name: 'revalidatePath()',
        signature: 'revalidatePath(path: string, type?: "page" | "layout"): void',
        description: 'Purges the cached data for a given route path. Use inside Server Actions or route handlers after mutations.',
        params: 'path — route to invalidate (e.g. "/blog"). type — scope of invalidation.',
        returns: 'void',
        example: "import { revalidatePath } from 'next/cache';\nawait db.post.create(data);\nrevalidatePath('/blog');",
        gotchas: "Only works server-side. Doesn't trigger a client navigation — the next request gets fresh data.",
      },
    ],
  });

  const appRouter = mk('App Router', 'frontend', next.id, {
    definition: 'File-based routing where folders define routes. Layouts, loading, error files at each level.',
    flashcards: [
      { id: uid(), q: 'page.tsx vs layout.tsx?', a: 'page.tsx renders the route UI. layout.tsx wraps it and persists across child route changes.' },
    ],
  });

  const serverComponents = mk('Server Components', 'frontend', next.id, {
    definition: 'Components that render on the server only. Zero JS shipped. Can be async, fetch directly.',
    gotchas: "Can't use hooks, browser APIs, or event handlers. Push 'use client' down the tree.",
    flashcards: [
      { id: uid(), q: 'When to use "use client"?', a: 'Hooks, event handlers, state, browser-only APIs.' },
    ],
  });

  const serverActions = mk('Server Actions', 'frontend', next.id, {
    definition: 'Async functions marked "use server" callable from client components. Handle mutations without manual API routes.',
    codeExample: '"use server";\nexport async function addTodo(formData) {\n  await db.todo.create({ data: { title: formData.get("title") } });\n}',
  });

  // ── TypeScript ────────────────────────────────────────────────────────────
  const ts = mk('TypeScript', 'frontend', null, {
    definition: 'Typed superset of JS. Static type-checking, interfaces, generics.',
    whenUsed: 'Daily — every React component, API contract, Redux slice.',
    apis: [
      {
        id: uid(),
        name: 'Partial<T>',
        signature: 'Partial<T>',
        description: 'Constructs a type with all properties of T set to optional.',
        params: 'T — source type.',
        returns: 'Type with every key of T made optional.',
        example: 'function update(base: User, patch: Partial<User>): User {\n  return { ...base, ...patch };\n}',
        gotchas: 'Only one level deep — nested objects are not partially typed.',
      },
      {
        id: uid(),
        name: 'Pick<T, K>',
        signature: 'Pick<T, K extends keyof T>',
        description: 'Constructs a type by selecting a subset of keys K from type T.',
        params: 'T — source type. K — union of keys to keep.',
        returns: 'New type with only the specified keys.',
        example: 'type Preview = Pick<Article, "id" | "title" | "slug">;',
        gotchas: 'K must be a subset of keyof T — TypeScript errors if you pick a key that does not exist.',
      },
      {
        id: uid(),
        name: 'Omit<T, K>',
        signature: 'Omit<T, K extends keyof T>',
        description: 'Constructs a type by removing keys K from type T. Inverse of Pick.',
        params: 'T — source type. K — union of keys to remove.',
        returns: 'New type without the specified keys.',
        example: 'type CreateUser = Omit<User, "id" | "createdAt">;',
        gotchas: 'Unlike Pick, K is widened — Omit<T, string> is valid even if string ⊄ keyof T.',
      },
      {
        id: uid(),
        name: 'Awaited<T>',
        signature: 'Awaited<T>',
        description: 'Recursively unwraps the resolved type of a Promise. Essential for async return types.',
        params: 'T — a Promise or nested Promise type.',
        returns: 'The fully unwrapped resolved type.',
        example: 'type R = Awaited<Promise<Promise<string>>>; // string',
        gotchas: 'Introduced in TS 4.5. For older versions use ReturnType + Awaited workarounds.',
      },
    ],
  });

  const tsGenerics = mk('Generics', 'frontend', ts.id, {
    definition: 'Type variables for reusable types. <T> placeholders constrained at call site.',
    codeExample: 'function first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}',
  });

  const tsUtility = mk('Utility Types', 'frontend', ts.id, {
    definition: 'Built-in type transformers: Partial, Required, Pick, Omit, Record, ReturnType, Awaited.',
    flashcards: [
      { id: uid(), q: 'Partial<T> does what?', a: 'Makes every property of T optional.' },
      { id: uid(), q: 'Pick<T, K> vs Omit<T, K>?', a: 'Pick selects keys K from T. Omit removes keys K from T.' },
    ],
  });

  const tsUnions = mk('Discriminated Unions', 'frontend', ts.id, {
    definition: "Union of object types sharing a literal 'tag' property. TS narrows based on the tag.",
    codeExample: "type Shape =\n  | { kind: 'circle'; r: number }\n  | { kind: 'square'; s: number };\n\nfunction area(s: Shape) {\n  switch (s.kind) {\n    case 'circle': return Math.PI * s.r ** 2;\n    case 'square': return s.s ** 2;\n  }\n}",
  });

  // ── Flat frontend skills ───────────────────────────────────────────────────
  const js = mk('JavaScript (ES6+)', 'frontend');
  const html = mk('HTML5', 'frontend');
  const css = mk('CSS3', 'frontend');
  const svelte = mk('Svelte', 'frontend');
  const jquery = mk('jQuery', 'frontend');
  const java = mk('Java', 'frontend');

  return [
    react, hooks, useState_, useEffect_, useMemoCallback, reconciliation, componentsSub,
    next, appRouter, serverComponents, serverActions,
    ts, tsGenerics, tsUtility, tsUnions,
    js, html, css, svelte, jquery, java,
  ];
}
