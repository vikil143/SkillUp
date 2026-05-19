// App.js — SkillUp 🦉 (React Native)
// Drop-in single-file app. Setup instructions in README.md.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Linking,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// CONSTANTS & STORAGE
// ============================================================
const STORAGE_KEY = 'skillup-data-v1';
const STREAK_KEY = 'skillup-streak-v1';

const COLORS = {
  primary: '#58CC02',
  primaryDark: '#58A700',
  blue: '#1CB0F6',
  blueDark: '#1899D6',
  orange: '#FF9600',
  orangeDark: '#E08600',
  red: '#FF4B4B',
  redDark: '#E44141',
  yellow: '#FFC800',
  purple: '#CE82FF',
  pink: '#FF86D0',
  teal: '#2EC4B6',
  navy: '#235390',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  text: '#3C3C3C',
  textLight: '#777',
  border: '#E5E5E5',
  panel: '#FAFAFA',
};

const loadData = async () => {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};
const saveData = async (d) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (e) {
    console.warn('Save failed', e);
  }
};
const loadStreak = async () => {
  try {
    const v = await AsyncStorage.getItem(STREAK_KEY);
    return v ? JSON.parse(v) : { count: 0, lastDate: null, xp: 0 };
  } catch {
    return { count: 0, lastDate: null, xp: 0 };
  }
};
const saveStreak = (s) =>
  AsyncStorage.setItem(STREAK_KEY, JSON.stringify(s)).catch(() => {});

// ============================================================
// LINK / YOUTUBE UTILITIES
// ============================================================
const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
};
const isYouTubeUrl = (url) => Boolean(getYouTubeId(url));
const openLink = (url) =>
  Linking.openURL(url).catch(() => Alert.alert('Cannot open link', url));

// Parse "m:ss", "h:mm:ss", or plain seconds string → integer seconds
const parseStartTime = (t) => {
  if (!t || !String(t).trim()) return 0;
  const s = String(t).trim();
  if (s.includes(':')) {
    const parts = s.split(':').map(Number);
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return parseInt(s, 10) || 0;
};

// Format seconds back to "m:ss" for display
const fmtTime = (t) => {
  const secs = parseStartTime(t);
  if (!secs) return '';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// Extract ?t= / &t= from a YouTube URL (handles 90, 1m30s, 1h30m45s)
const extractTFromUrl = (url) => {
  if (!url) return null;
  const m = url.match(/[?&]t=([0-9hms]+)/i);
  if (!m) return null;
  const raw = m[1];
  const hm = raw.match(/(\d+)h/i);
  const mm = raw.match(/(\d+)m/i);
  const sm = raw.match(/(\d+)s/i);
  let secs = 0;
  if (hm || mm || sm) {
    if (hm) secs += parseInt(hm[1], 10) * 3600;
    if (mm) secs += parseInt(mm[1], 10) * 60;
    if (sm) secs += parseInt(sm[1], 10);
  } else {
    secs = parseInt(raw, 10) || 0;
  }
  return secs > 0 ? String(secs) : null;
};

// ============================================================
// SEED DATA (from CV)
// ============================================================
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const SEED = () => {
  const cats = [
    { id: 'frontend', name: 'Frontend', emoji: '🎨', color: COLORS.primary },
    { id: 'state', name: 'State & Architecture', emoji: '🧩', color: COLORS.blue },
    { id: 'styling', name: 'Styling', emoji: '💅', color: COLORS.pink },
    { id: 'backend', name: 'Backend & APIs', emoji: '🔌', color: COLORS.orange },
    { id: 'dataviz', name: 'Data Viz', emoji: '📊', color: COLORS.purple },
    { id: 'databases', name: 'Databases', emoji: '🗄️', color: COLORS.teal },
    { id: 'auth', name: 'Security & Auth', emoji: '🔐', color: COLORS.red },
    { id: 'testing', name: 'Testing & Build', emoji: '🧪', color: COLORS.yellow },
    { id: 'devops', name: 'DevOps & CI/CD', emoji: '🚀', color: COLORS.navy },
    { id: 'cloud', name: 'Cloud & Hosting', emoji: '☁️', color: '#84D8FF' },
    { id: 'mobile', name: 'Mobile', emoji: '📱', color: '#A56AFF' },
    { id: 'payments', name: 'Payments', emoji: '💳', color: '#02CD7C' },
    { id: 'ai', name: 'AI Tools', emoji: '🤖', color: '#F75590' },
    { id: 'method', name: 'Methodology', emoji: '🏃', color: '#FF6D00' },
    { id: 'internet', name: 'Internet & Networking', emoji: '🌐', color: '#4A8BF5' },
    { id: 'genai', name: 'Gen AI', emoji: '🧠', color: '#C026D3' },
    { id: 'design-patterns', name: 'Design Patterns', emoji: '🎯', color: '#9333EA' },
    { id: 'embedded', name: 'Embedded Systems', emoji: '⚡', color: '#E11D48' },
    { id: 'tools', name: 'Tools', emoji: '🛠️', color: '#6B7280' },
    { id: 'perf', name: 'Performance', emoji: '⚡', color: '#F59E0B' },
    { id: 'webgl', name: 'WebGL & 3D', emoji: '🔷', color: '#FF6B35' },
  ];

  const mk = (name, categoryId, parentId = null, depth = {}) => ({
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

  // Seed React with rich sub-topics tree
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
        example: 'const ThemeContext = createContext<"light"|"dark">("light");',
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
    definition: 'React’s diffing algo that compares new tree to previous and applies minimal DOM ops.',
    gotchas: 'Keys must be stable & unique. Array index as key breaks list reordering.',
  });
  const componentsSub = mk('Components & Props', 'frontend', react.id, {
    definition: 'Building blocks of React. Receive props, return JSX. Function components are default.',
  });

  // Next.js with sub-topics
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

  // TypeScript with sub-topics
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

  // React Native with sub-topics
  const rn = mk('React Native', 'mobile', null, {
    definition: 'Framework for building native iOS/Android apps using React. Renders to native components.',
    whenUsed: 'Maak, Packarma at Mypcot. Integrated Firebase, Razorpay, GPS, biometrics.',
  });
  const rnNav = mk('Navigation', 'mobile', rn.id, {
    definition: 'react-navigation provides stack/tab/drawer navigators for screen routing.',
  });
  const rnLists = mk('Lists & Performance', 'mobile', rn.id, {
    definition: 'FlatList virtualizes long lists. SectionList for grouped data. ScrollView only for short, known content.',
    flashcards: [
      { id: uid(), q: 'Why FlatList over ScrollView for long lists?', a: 'FlatList virtualizes — renders only visible items, recycles views. ScrollView mounts everything.' },
    ],
  });

  // WebGL & Three.js skill tree
  const threejs = mk('Three.js', 'webgl', null, {
    definition: 'JavaScript 3D library wrapping WebGL. Provides a scene graph (Scene, Mesh, Camera, Light) so you can render 3D without raw WebGL boilerplate.',
    whenUsed: 'Portfolio 3D effects, product configurators, interactive data viz, immersive UIs.',
    gotchas: 'Always dispose() geometries, materials, and textures when removing objects — Three.js does not GC GPU memory automatically.',
    refs: [
      { id: uid(), title: 'Three.js Official Docs', url: 'https://threejs.org/docs/' },
      { id: uid(), title: 'Three.js Examples Gallery', url: 'https://threejs.org/examples/' },
      { id: uid(), title: 'Three.js in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=Q7AOvWpIVHU' },
      { id: uid(), title: 'Three.js Journey – Bruno Simon (trailer)', url: 'https://www.youtube.com/watch?v=y4ctEhB5F3s' },
    ],
    flashcards: [
      { id: uid(), q: 'Three.js rendering pipeline?', a: 'Scene + Camera → WebGLRenderer.render(scene, camera) → draws to <canvas>. Run every frame in a loop.' },
      { id: uid(), q: 'What is a Mesh?', a: 'Mesh = Geometry (shape/vertices) + Material (appearance). The fundamental renderable object in Three.js.' },
      { id: uid(), q: 'How to start the render loop?', a: 'renderer.setAnimationLoop(() => renderer.render(scene, camera)) — or requestAnimationFrame recursion.' },
      { id: uid(), q: 'Three.js memory leak — how to avoid?', a: 'Call geometry.dispose(), material.dispose(), texture.dispose() when removing objects. Three.js does not free GPU memory automatically.' },
    ],
    apis: [
      {
        id: uid(),
        name: 'WebGLRenderer',
        signature: 'new THREE.WebGLRenderer(params?: { canvas?, antialias?, alpha? })',
        description: 'Main renderer that draws the Three.js scene to a WebGL canvas.',
        params: 'antialias — smooth edges (slight perf cost). alpha — transparent background.',
        returns: 'Renderer with .render(scene, camera), .setSize(w, h), .setPixelRatio(r), .setAnimationLoop(fn).',
        example: "const renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(innerWidth, innerHeight);\nrenderer.setPixelRatio(devicePixelRatio);\ndocument.body.appendChild(renderer.domElement);",
        gotchas: 'setPixelRatio(devicePixelRatio) is required for crisp rendering on HiDPI/Retina screens.',
      },
      {
        id: uid(),
        name: 'PerspectiveCamera',
        signature: 'new THREE.PerspectiveCamera(fov, aspect, near, far)',
        description: 'Mimics natural human vision — objects further away appear smaller.',
        params: 'fov — vertical field of view in degrees. aspect — width÷height. near/far — clipping planes.',
        returns: 'Camera object. Set .position and call .lookAt(target) to aim.',
        example: 'const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);\ncam.position.set(0, 2, 5);\ncam.lookAt(0, 0, 0);',
        gotchas: 'On resize: update camera.aspect and call camera.updateProjectionMatrix() or the scene will distort.',
      },
      {
        id: uid(),
        name: 'Scene',
        signature: 'new THREE.Scene()',
        description: 'Root container for all objects, lights, and helpers in a Three.js world.',
        params: 'None at construction. Add children with .add(object).',
        returns: 'Scene extending Object3D. Supports .background (Color/Texture), .fog.',
        example: 'const scene = new THREE.Scene();\nscene.background = new THREE.Color(0x1a1a2e);\nscene.fog = new THREE.FogExp2(0x1a1a2e, 0.05);\nscene.add(mesh, light);',
        gotchas: 'scene.add() accepts multiple objects at once. Call scene.remove(obj) then dispose() to fully clean up.',
      },
    ],
  });

  const threeScene = mk('Scene Setup', 'webgl', threejs.id, {
    definition: 'Three.js bootstrap: WebGLRenderer (canvas), Scene (container), PerspectiveCamera (viewpoint). Append domElement, handle resize, run the loop.',
    codeExample: "const scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);\ncamera.position.z = 5;\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(innerWidth, innerHeight);\nrenderer.setPixelRatio(devicePixelRatio);\ndocument.body.appendChild(renderer.domElement);\n\nwindow.addEventListener('resize', () => {\n  camera.aspect = innerWidth / innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize(innerWidth, innerHeight);\n});\n\nrenderer.setAnimationLoop(() => renderer.render(scene, camera));",
    flashcards: [
      { id: uid(), q: 'PerspectiveCamera(fov, aspect, near, far)?', a: 'fov = vertical angle in degrees. aspect = width÷height. near/far = clipping planes — objects outside are culled.' },
      { id: uid(), q: 'Why setPixelRatio(devicePixelRatio)?', a: 'Renders at the native display resolution. Skipping it causes a blurry canvas on HiDPI/Retina screens.' },
      { id: uid(), q: 'What breaks on window resize?', a: 'Camera aspect + renderer size go stale. Fix: camera.aspect = w/h → camera.updateProjectionMatrix() → renderer.setSize(w, h).' },
      { id: uid(), q: 'OrbitControls — what do they give you?', a: 'Mouse/touch drag to rotate, scroll to zoom, right-click to pan — without writing camera math. Import from three/addons.' },
    ],
  });

  const threeGeo = mk('Geometries & Materials', 'webgl', threejs.id, {
    definition: 'Geometry stores vertex data (positions, normals, UVs). Material defines appearance. Combined in a Mesh. Primitives: BoxGeometry, SphereGeometry, PlaneGeometry, TorusGeometry. PBR material: MeshStandardMaterial.',
    codeExample: "const geo = new THREE.BoxGeometry(1, 1, 1);\nconst mat = new THREE.MeshStandardMaterial({\n  color: 0x6688cc,\n  metalness: 0.3,\n  roughness: 0.7,\n});\nconst cube = new THREE.Mesh(geo, mat);\nscene.add(cube);\n\n// Texture\nconst tex = new THREE.TextureLoader().load('map.jpg');\nmat.map = tex;",
    flashcards: [
      { id: uid(), q: 'MeshBasicMaterial vs MeshStandardMaterial?', a: 'Basic = flat colour, ignores lights entirely. Standard = PBR with metalness/roughness, responds correctly to scene lights.' },
      { id: uid(), q: 'Can you share one material across many meshes?', a: 'Yes — one instance, many meshes. Changes to material affect all. Assign different .color via mesh.material.color.set() per mesh if needed.' },
      { id: uid(), q: 'When to call geometry.dispose()?', a: 'Whenever you permanently remove a mesh. Frees the GPU vertex buffer. Also call material.dispose() and texture.dispose().' },
      { id: uid(), q: 'What are UVs?', a: '2D texture coordinates per vertex (0–1 range). U = horizontal, V = vertical. Three.js built-in geometries generate UVs automatically.' },
    ],
  });

  const threeLights = mk('Lights & Shadows', 'webgl', threejs.id, {
    definition: 'Light types: AmbientLight (flat fill, no shadows), DirectionalLight (parallel sun rays), PointLight (omnidirectional bulb), SpotLight (cone beam). Shadows require renderer.shadowMap.enabled = true plus castShadow/receiveShadow on objects.',
    codeExample: "renderer.shadowMap.enabled = true;\nrenderer.shadowMap.type = THREE.PCFSoftShadowMap;\n\nconst ambient = new THREE.AmbientLight(0xffffff, 0.3);\nconst sun = new THREE.DirectionalLight(0xffffff, 1);\nsun.position.set(5, 10, 5);\nsun.castShadow = true;\nscene.add(ambient, sun);\n\nmesh.castShadow = true;\nfloor.receiveShadow = true;",
    flashcards: [
      { id: uid(), q: 'Shadow not showing — 3 common causes?', a: '1) renderer.shadowMap.enabled not set to true. 2) castShadow/receiveShadow missing on mesh/light. 3) Using AmbientLight (cannot cast shadows).' },
      { id: uid(), q: 'AmbientLight vs HemisphereLight?', a: 'Ambient: single uniform colour everywhere. Hemisphere: blends sky colour (top) and ground colour (bottom) for a natural outdoor look.' },
      { id: uid(), q: 'PCFSoftShadowMap vs BasicShadowMap?', a: 'PCFSoft = smooth blurred shadow edges. Basic = hard pixelated edges, cheapest. Default is PCF (medium).' },
      { id: uid(), q: 'Why do shadows have artifacts (shadow acne)?', a: 'Self-shadowing from floating-point precision. Fix: increase light.shadow.bias (e.g. -0.001) to push shadow back slightly.' },
    ],
  });

  const threeAnim = mk('Animations', 'webgl', threejs.id, {
    definition: 'Three.js render loop via setAnimationLoop or rAF. Mutate .rotation/.position/.scale each frame. GSAP integrates cleanly — tween any Three.js object property with spring/ease. Use lerp() for smooth damping.',
    codeExample: "// Three.js built-in loop\nrenderer.setAnimationLoop((time) => {\n  cube.rotation.x = time * 0.001;\n  cube.rotation.y = time * 0.002;\n  renderer.render(scene, camera);\n});\n\n// GSAP tween\nimport gsap from 'gsap';\ngsap.to(cube.rotation, {\n  y: Math.PI * 2,\n  duration: 2,\n  repeat: -1,\n  ease: 'power2.inOut',\n});\n\n// Lerp for smooth camera follow (run every frame)\ncamera.position.lerp(targetPosition, 0.05);",
    flashcards: [
      { id: uid(), q: 'setAnimationLoop vs requestAnimationFrame?', a: 'setAnimationLoop is Three.js wrapper — handles WebXR/VR. rAF is the raw browser API. Both work; prefer setAnimationLoop in Three.js projects.' },
      { id: uid(), q: 'How does GSAP tween Three.js objects?', a: 'GSAP tweens any plain JS object property. Pass mesh.position, mesh.rotation, or material directly: gsap.to(mesh.rotation, { y: Math.PI, duration: 1 }).' },
      { id: uid(), q: 'How to stop the animation loop?', a: 'renderer.setAnimationLoop(null). For rAF: store the ID with const id = requestAnimationFrame(loop), cancel with cancelAnimationFrame(id).' },
      { id: uid(), q: 'What is lerp and why use it in animations?', a: 'Linear interpolation: a + (b - a) * t. Running vec.lerp(target, 0.05) every frame creates smooth exponential damping without springs or physics.' },
      { id: uid(), q: 'Clock.getDelta() vs getElapsedTime()?', a: 'getDelta() = seconds since last call — use for frame-rate-independent movement. getElapsedTime() = total seconds since clock start — use for sine/cos waves.' },
    ],
  });

  const webglFund = mk('WebGL Fundamentals', 'webgl', null, {
    definition: 'Low-level browser GPU API (OpenGL ES 2.0 wrapper). Every draw call requires vertex shader (positions) and fragment shader (pixel colours) in GLSL, plus buffer binding and attribute setup.',
    flashcards: [
      { id: uid(), q: 'Two required shaders in every WebGL draw call?', a: 'Vertex shader — runs per vertex, outputs gl_Position. Fragment shader — runs per fragment/pixel, outputs gl_FragColor.' },
      { id: uid(), q: 'Why use Three.js over raw WebGL?', a: 'Three.js abstracts 100s of lines of boilerplate (buffer creation, shader compilation, attribute binding). Raw WebGL needed only for custom render pipelines.' },
      { id: uid(), q: 'What is a VBO?', a: 'Vertex Buffer Object — GPU-side array holding vertex data (positions, normals, UVs). Upload once with gl.bufferData; reused every frame.' },
      { id: uid(), q: 'uniform vs attribute in WebGL?', a: 'Attribute: per-vertex data (position, UV, normal). Uniform: constant for all vertices in a draw call (transform matrix, colour, time).' },
    ],
  });

  const glslShaders = mk('GLSL & ShaderMaterial', 'webgl', threejs.id, {
    definition: 'GLSL: C-like language compiled on the GPU. Vertex shader transforms positions; fragment shader colours pixels. Three.js ShaderMaterial exposes custom shaders with uniforms (dynamic data) and varyings (vertex→fragment interpolation).',
    codeExample: "const mat = new THREE.ShaderMaterial({\n  uniforms: {\n    uTime: { value: 0 },\n    uColor: { value: new THREE.Color(0xff6600) },\n  },\n  vertexShader: `\n    varying vec2 vUv;\n    void main() {\n      vUv = uv;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }`,\n  fragmentShader: `\n    uniform float uTime;\n    varying vec2 vUv;\n    void main() {\n      gl_FragColor = vec4(vUv, sin(uTime) * 0.5 + 0.5, 1.0);\n    }`,\n});\n\n// Update each frame\nrenderer.setAnimationLoop((t) => {\n  mat.uniforms.uTime.value = t * 0.001;\n  renderer.render(scene, camera);\n});",
    flashcards: [
      { id: uid(), q: 'uniform vs varying in GLSL?', a: 'Uniform: same value for every vertex/fragment in a draw (time, resolution). Varying: written in vertex shader, interpolated across triangle, read in fragment shader.' },
      { id: uid(), q: 'How to animate a shader with time?', a: 'Declare uniform float uTime. Each frame: mat.uniforms.uTime.value = clock.getElapsedTime(). Use in GLSL: sin(uTime), cos(uTime * 2.0).' },
      { id: uid(), q: 'ShaderMaterial vs RawShaderMaterial?', a: 'ShaderMaterial auto-injects Three.js built-ins (projectionMatrix, modelViewMatrix, position, uv, normal). RawShaderMaterial is a blank slate — write everything yourself.' },
      { id: uid(), q: 'What is gl_Position?', a: 'Required vertex shader output — the clip-space position of the vertex. Formula: projectionMatrix * modelViewMatrix * vec4(position, 1.0).' },
    ],
  });

  // Flat skills (no sub-topics yet — user can add)
  const flatSkills = [
    mk('JavaScript (ES6+)', 'frontend'),
    mk('HTML5', 'frontend'),
    mk('CSS3', 'frontend'),
    mk('Svelte', 'frontend'),
    mk('jQuery', 'frontend'),
    mk('Java', 'frontend'),

    mk('Redux', 'state', null, {
      definition: 'Predictable state container. Single store, action-reducer flow, pure reducers.',
    }),
    mk('Redux Toolkit', 'state', null, {
      definition: 'Official Redux toolset — createSlice, createAsyncThunk, Immer-powered mutations.',
    }),
    mk('Context API', 'state'),
    mk('Custom Hooks', 'state', null, {
      codeExample: 'function useDebounce(value, ms) {\n  const [v, setV] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setV(value), ms);\n    return () => clearTimeout(id);\n  }, [value, ms]);\n  return v;\n}',
    }),
    mk('Microfrontend', 'state', null, {
      definition: 'Architecture splitting a frontend into independently deployable apps.',
      whenUsed: 'Dynamic Content Editor at Netcore — modules deployed independently.',
    }),
    mk('Component-Driven Architecture', 'state'),
    mk('MVC', 'state'),

    mk('Tailwind CSS', 'styling'),
    mk('Material UI', 'styling'),
    mk('Styled Components', 'styling'),
    mk('Bootstrap', 'styling'),
    mk('CSS Modules', 'styling'),

    mk('Node.js', 'backend', null, {
      definition: 'JS runtime built on V8. Event-driven, non-blocking I/O. Used for servers, CLIs, tooling.',
      apis: [
        {
          id: uid(),
          name: 'fs.readFile',
          signature: 'fs.readFile(path, options, callback) / fs.promises.readFile(path, options): Promise<Buffer|string>',
          description: 'Reads a file asynchronously. Use the promise form (fs.promises) to avoid callback hell.',
          params: 'path — file path. options — encoding (e.g. "utf8") or object. callback — (err, data) => void.',
          returns: 'void (callback) or Promise<Buffer | string> (promise form).',
          example: "const { readFile } = require('fs/promises');\nconst src = await readFile('./data.json', 'utf8');",
          gotchas: 'Without encoding option, returns a Buffer. Large files should use createReadStream instead.',
        },
        {
          id: uid(),
          name: 'fs.writeFile',
          signature: 'fs.promises.writeFile(path, data, options?): Promise<void>',
          description: 'Writes data to a file, creating it if it does not exist. Overwrites by default.',
          params: 'path — destination. data — string, Buffer, or TypedArray. options — encoding, flag, mode.',
          returns: 'Promise<void>',
          example: "await fs.promises.writeFile('./out.json', JSON.stringify(obj), 'utf8');",
          gotchas: "Use flag: 'a' to append instead of overwrite. Not atomic — use a temp file + rename for safety.",
        },
        {
          id: uid(),
          name: 'http.createServer',
          signature: 'http.createServer(handler: (req, res) => void): http.Server',
          description: 'Creates a raw HTTP server. Foundation that Express and Fastify build on.',
          params: 'handler — called with IncomingMessage (req) and ServerResponse (res) for each request.',
          returns: 'http.Server instance. Call .listen(port) to start.',
          example: "const server = http.createServer((req, res) => {\n  res.writeHead(200);\n  res.end('Hello');\n});\nserver.listen(3000);",
          gotchas: 'No routing or body parsing built-in. Use Express or parse req as a stream manually.',
        },
        {
          id: uid(),
          name: 'process.env',
          signature: 'process.env: { [key: string]: string | undefined }',
          description: 'Object containing the user environment at process start. Used for config/secrets.',
          params: 'N/A — property access: process.env.MY_VAR.',
          returns: 'string | undefined for each key.',
          example: "const port = parseInt(process.env.PORT ?? '3000', 10);",
          gotchas: 'All values are strings. Accessing an unset key returns undefined — always provide defaults.',
        },
        {
          id: uid(),
          name: 'Buffer.from',
          signature: 'Buffer.from(value, encoding?): Buffer',
          description: 'Creates a Buffer from a string, array, ArrayBuffer, or another Buffer.',
          params: 'value — source data. encoding — for string input (default "utf8").',
          returns: 'Buffer instance.',
          example: "const b = Buffer.from('hello', 'utf8');\nconsole.log(b.toString('base64')); // aGVsbG8=",
          gotchas: 'Do not use new Buffer() — deprecated and insecure. Always use Buffer.from/alloc/allocUnsafe.',
        },
      ],
    }),
    mk('Express.js', 'backend'),
    mk('REST APIs', 'backend'),
    mk('GraphQL', 'backend'),
    mk('WebSockets', 'backend', null, {
      definition: 'Full-duplex protocol for real-time bidirectional comms over a single TCP connection.',
      whenUsed: 'Real-time market data streaming for Option Chain. Collaborative editing in Docusaurus.',
      flashcards: [
        { id: uid(), q: 'WebSocket vs SSE?', a: 'WebSocket is bidirectional. SSE is server→client only, simpler (just HTTP), auto-reconnects.' },
      ],
    }),

    mk('D3.js', 'dataviz', null, {
      whenUsed: 'Custom interactive graphs and optimized SVG rendering at NeoSoft.',
    }),
    mk('Three.js', 'dataviz'),
    mk('SVG', 'dataviz'),

    mk('MongoDB', 'databases', null, {
      definition: 'Document-oriented NoSQL DB. Stores JSON-like BSON documents. Flexible schema, horizontal scaling.',
      apis: [
        {
          id: uid(),
          name: 'find()',
          signature: 'collection.find(filter?, options?): FindCursor',
          description: 'Returns a cursor over all documents matching the filter. Chainable with .sort(), .limit(), .skip().',
          params: 'filter — query object (e.g. { status: "active" }). options — projection, sort, limit.',
          returns: 'FindCursor — call .toArray() or iterate with for await.',
          example: "const users = await db.collection('users').find({ active: true }).limit(20).toArray();",
          gotchas: 'find() is lazy — it does not execute until you iterate or call toArray(). Always await toArray().',
        },
        {
          id: uid(),
          name: 'findOne()',
          signature: 'collection.findOne(filter?, options?): Promise<Document | null>',
          description: 'Returns the first document matching the filter, or null if none found.',
          params: 'filter — query object. options — projection.',
          returns: 'Promise<Document | null>',
          example: "const user = await db.collection('users').findOne({ _id: new ObjectId(id) });",
          gotchas: 'Returns null (not undefined) when not found. Check for null before accessing properties.',
        },
        {
          id: uid(),
          name: 'insertOne()',
          signature: 'collection.insertOne(doc): Promise<InsertOneResult>',
          description: 'Inserts a single document. MongoDB adds _id if not provided.',
          params: 'doc — document to insert.',
          returns: 'Promise<InsertOneResult> with insertedId and acknowledged fields.',
          example: "const result = await db.collection('posts').insertOne({ title, body, createdAt: new Date() });",
          gotchas: 'insertOne mutates the doc in-place by adding _id. Clone if you need the original unchanged.',
        },
        {
          id: uid(),
          name: 'updateMany()',
          signature: 'collection.updateMany(filter, update, options?): Promise<UpdateResult>',
          description: 'Updates all documents matching the filter. Use $set, $inc, $push operators.',
          params: 'filter — which docs to update. update — update operators. options — upsert, arrayFilters.',
          returns: 'Promise<UpdateResult> with matchedCount and modifiedCount.',
          example: "await db.collection('orders').updateMany({ status: 'pending' }, { $set: { status: 'cancelled' } });",
          gotchas: 'Passing a plain object as update (no $ operators) will error in driver v4+. Always use operators.',
        },
        {
          id: uid(),
          name: 'aggregate()',
          signature: 'collection.aggregate(pipeline: object[]): AggregationCursor',
          description: 'Executes a pipeline of stages (match, group, project, lookup, etc.) for complex queries.',
          params: 'pipeline — array of stage objects e.g. [{ $match: {} }, { $group: {} }].',
          returns: 'AggregationCursor — call .toArray() to get results.',
          example: "const stats = await db.collection('orders').aggregate([\n  { $match: { status: 'done' } },\n  { $group: { _id: '$userId', total: { $sum: '$amount' } } },\n]).toArray();",
          gotchas: '$lookup is expensive on large collections — ensure foreign collection is indexed on the join field.',
        },
      ],
    }),
    mk('MySQL', 'databases'),
    mk('Firebase', 'databases'),

    mk('JWT', 'auth', null, {
      definition: 'JSON Web Token — signed self-contained token. Stateless auth, verify signature without DB lookup.',
      flashcards: [
        { id: uid(), q: 'Where to store JWT in browser?', a: 'httpOnly cookie is safest. localStorage is XSS-vulnerable.' },
      ],
    }),
    mk('OAuth', 'auth'),
    mk('Keycloak', 'auth', null, {
      whenUsed: '2FA on Stock Trading Platform via external TOTP library.',
    }),
    mk('2FA (TOTP)', 'auth'),
    mk('MD5', 'auth'),
    mk('SHA', 'auth'),

    mk('Jest', 'testing'),
    mk('React Testing Library', 'testing'),
    mk('Webpack', 'testing'),
    mk('Babel', 'testing'),
    mk('npm', 'testing'),
    mk('yarn', 'testing'),
    mk('Prettier', 'testing'),
    mk('ESLint', 'testing'),

    mk('Git', 'devops'),
    mk('GitHub Actions', 'devops'),
    mk('CI/CD Pipelines', 'devops'),
    mk('App Signing & Binary Builds', 'devops'),

    mk('Vercel', 'cloud'),
    mk('Firebase Hosting', 'cloud'),

    mk('Electron', 'mobile'),

    mk('Razorpay', 'payments'),
    mk('CCAvenue', 'payments'),

    mk('Claude Code', 'ai'),
    mk('Codex', 'ai'),

    mk('Agile', 'method'),
    mk('Scrum', 'method'),
    mk('Code Reviews', 'method'),
    mk('Sprint Planning & Estimations', 'method'),
    mk('Architecture Planning', 'method'),

    // Internet & Networking
    mk('HTTP', 'internet', null, { definition: 'Stateless application-layer protocol. Request/response over TCP. Methods: GET/POST/PUT/DELETE/PATCH.' }),
    mk('REST', 'internet', null, { definition: 'Architectural style — resources, stateless, uniform interface, cacheable. Maps HTTP verbs to CRUD.' }),
    mk('DNS', 'internet', null, { definition: 'Domain Name System. Hierarchical lookup translating domain names to IP addresses.' }),
    mk('CORS', 'internet', null, { definition: 'Browser security mechanism controlling cross-origin requests via headers (Access-Control-Allow-Origin, etc.).' }),
    mk('TLS/HTTPS', 'internet', null, { definition: 'Transport Layer Security encrypts HTTP traffic. HTTPS = HTTP over TLS. Prevents eavesdropping and MITM attacks.' }),
    mk('WebRTC', 'internet', null, { definition: 'Browser API for real-time peer-to-peer audio, video, and data. Uses STUN/TURN servers for NAT traversal.' }),

    // Gen AI
    mk('LLM Prompting', 'genai', null, { definition: 'Crafting inputs to elicit desired outputs from large language models. Zero-shot, few-shot, chain-of-thought, system prompts.' }),
    mk('RAG', 'genai', null, { definition: 'Retrieval-Augmented Generation — fetch relevant context from a knowledge base, inject into prompt, generate grounded answer.' }),
    mk('Embeddings', 'genai', null, { definition: 'Dense vector representations of text/images. Semantic similarity via cosine distance.' }),
    mk('Vector Databases', 'genai', null, { definition: 'DBs optimized for vector similarity search. Examples: Pinecone, Weaviate, pgvector, Chroma.' }),
    mk('Fine-tuning', 'genai', null, { definition: 'Adapting a pretrained LLM on domain-specific data to improve performance on targeted tasks.' }),
    mk('Function Calling / Tools', 'genai', null, { definition: 'LLM feature allowing models to call structured functions/tools. Enables agents to take actions: search, code, DB queries.' }),

    // Design Patterns
    mk('Singleton', 'design-patterns', null, { definition: 'Ensures a class has only one instance and provides a global access point.' }),
    mk('Factory', 'design-patterns', null, { definition: 'Creates objects without specifying the exact class. Subclasses decide what to instantiate.' }),
    mk('Observer', 'design-patterns', null, { definition: 'One-to-many dependency — when subject changes, all observers notified. Foundation of event systems.' }),
    mk('Strategy', 'design-patterns', null, { definition: 'Defines a family of algorithms, makes them interchangeable at runtime.' }),
    mk('Repository', 'design-patterns', null, { definition: 'Abstracts data access behind a collection-like interface. Decouples domain logic from persistence.' }),
    mk('Decorator', 'design-patterns', null, { definition: 'Attaches additional responsibilities to an object dynamically. Flexible alternative to subclassing.' }),

    // Embedded Systems
    mk('Arduino', 'embedded', null, { definition: 'Open-source electronics platform with simple IDE and C/C++ runtime for microcontrollers.' }),
    mk('ESP32', 'embedded', null, { definition: 'Low-cost SoC with WiFi/Bluetooth from Espressif. Dual-core, programmable in C++ or MicroPython.' }),
    mk('MicroPython', 'embedded', null, { definition: 'Lean Python 3 implementation for microcontrollers. Runs on ESP32, RP2040, STM32 and others.' }),
    mk('I2C', 'embedded', null, { definition: 'Two-wire serial protocol for connecting low-speed peripherals. Master/slave with addresses.' }),
    mk('SPI', 'embedded', null, { definition: 'Four-wire synchronous serial protocol. Faster than I2C, full-duplex, used for displays, sensors, SD cards.' }),
    mk('Raspberry Pi', 'embedded', null, { definition: 'Single-board Linux computer with GPIO pins. Used for prototyping, robotics, and IoT projects.' }),

    // Tools
    mk('VS Code', 'tools', null, { definition: "Microsoft's lightweight, extensible code editor. Built on Electron. Massive extension ecosystem." }),
    mk('Postman', 'tools', null, { definition: 'API client for sending HTTP/GraphQL requests, organizing collections, scripting tests.' }),
    mk('Chrome DevTools', 'tools', null, { definition: 'Browser-based debug suite — DOM inspector, network panel, performance profiler, JS debugger.' }),
    mk('Figma', 'tools', null, { definition: 'Browser-based collaborative UI design tool. Components, auto-layout, prototyping, dev handoff.' }),
    mk('Notion', 'tools', null, { definition: 'All-in-one workspace for notes, docs, databases, and project tracking.' }),

    // Performance Optimization
    mk('Virtualization', 'perf', null, { definition: 'Render only visible items in a list. FlatList/react-window recycle DOM nodes to keep memory and paint cost constant.' }),
    mk('Memoization', 'perf', null, { definition: 'Cache results of expensive computations (useMemo, React.memo, reselect). Avoids redundant work on re-renders.' }),
    mk('Code Splitting', 'perf', null, { definition: 'Split JS bundles into chunks loaded on demand (React.lazy + Suspense, dynamic import()). Reduces initial parse/exec time.' }),
    mk('Web Vitals', 'perf', null, { definition: 'Google metrics: LCP (load), FID/INP (interaction), CLS (layout stability). Baseline for measuring real-user perf.' }),
    mk('Lazy Loading', 'perf', null, { definition: 'Defer loading of off-screen images, components, or routes until needed. Reduces initial payload.' }),
    mk('Caching Strategies', 'perf', null, { definition: 'HTTP cache-control headers, CDN edge caching, stale-while-revalidate, service-worker caching for repeat visits.' }),
    mk('Bundle Analysis', 'perf', null, { definition: 'Inspect bundle composition with webpack-bundle-analyzer or Vite rollup-plugin-visualizer. Find and eliminate bloat.' }),
    mk('Database Query Optimization', 'perf', null, { definition: 'Indexes, query plan analysis (EXPLAIN), avoiding N+1, denormalization, connection pooling.' }),
  ];

  const skills = [
    react, hooks, useState_, useEffect_, useMemoCallback, reconciliation, componentsSub,
    next, appRouter, serverComponents, serverActions,
    ts, tsGenerics, tsUtility, tsUnions,
    rn, rnNav, rnLists,
    threejs, threeScene, threeGeo, threeLights, threeAnim, webglFund, glslShaders,
    ...flatSkills,
  ];

  const projects = [
    {
      id: 'p-stock',
      name: 'Stock Trading Platform',
      period: 'Jun 2025 – Nov 2025',
      teamSize: 3,
      role: 'Front-end Lead',
      stack: ['React.js', 'Node.js', 'Express.js', 'WebSockets', 'MongoDB', 'MySQL', 'Keycloak'],
      description: 'Real-time stock trading platform with Option Chain module, market data streaming, 2FA logins.',
      outcomes: [
        'Architected Option Chain from scratch with 2x perf via virtualization, API restructuring, query tuning',
        'Built custom visible-area virtualization reducing DOM load',
        'Designed RESTful APIs (Node + Express)',
        'Optimized MongoDB & MySQL queries',
        'Integrated Keycloak + TOTP for 2FA',
      ],
    },
    {
      id: 'p-docs',
      name: 'Scalable Documentation Platform',
      period: '2025',
      teamSize: 3,
      role: 'Frontend Engineer',
      stack: ['React.js', 'Next.js (App Router)', 'Tailwind CSS', 'TypeScript', 'WebSockets'],
      description: 'Docusaurus-based docs platform with real-time collaborative editing.',
      outcomes: [
        'Scalable Docusaurus platform for knowledge management',
        'Real-time collaborative editing via WebSockets',
        'Pixel-perfect Figma → production',
        'Reusable code editor component with live preview',
      ],
    },
    {
      id: 'p-editor',
      name: 'Dynamic Content Editor (Microfrontend)',
      period: '2024 – 2025',
      teamSize: 2,
      role: 'Senior React Developer',
      stack: ['React.js', 'JavaScript (ES6+)', 'Microfrontend', 'Git'],
      description: 'Real-time webpage element editor in microfrontend architecture.',
      outcomes: [
        'Real-time modification of text, images, links, styles',
        'Undo/Redo, History Management, DOM Picker, Click Tracking',
        'Reusable templates: Back to Top, Coupon Drawer, Progress Bar',
      ],
    },
    {
      id: 'p-maak',
      name: 'Maak — Services Booking App',
      period: '2022 – 2023',
      teamSize: 3,
      role: 'Senior React Native Developer',
      stack: ['React Native', 'Redux', 'REST APIs', 'GraphQL', 'Firebase', 'JWT', 'TypeScript'],
      description: 'Multi-service booking platform with admin panel and mobile app.',
      outcomes: [
        'Booking + secure payment for multi-service platform',
        'Multi-language support',
        'JWT auth, utility bill payments',
      ],
    },
    {
      id: 'p-packarma',
      name: 'Packarma — Packaging Recommendation App',
      period: '2021 – 2022',
      teamSize: 3,
      role: 'Senior React Native Developer',
      stack: ['React Native', 'JavaScript (ES6+)', 'REST APIs', 'GraphQL', 'Firebase', 'JWT', 'Razorpay'],
      description: 'Mobile app recommending laminate packaging by product type, strength, shelf life.',
      outcomes: [
        'Recommendation engine for optimal packaging',
        'Firebase analytics + Razorpay payments',
        'Pixel-perfect Figma → production UI',
      ],
    },
  ];

  const experiences = [
    {
      id: uid(),
      company: 'NeoSoft Technologies',
      title: 'Senior Software Engineer',
      location: 'Mumbai, India',
      period: 'Jun 2025 – Present',
      responsibilities: [
        'Drove technical vision for front-end team across 5+ enterprise React apps',
        'Led perf optimization — 3x improvement on Option Chain',
        'Code reviews and mentoring 3+ juniors/interns',
        'Sprint planning, effort estimations, architecture discussions',
        'Introduced Agentic AI tools (Claude Code, Codex)',
        'Built reusable component libraries; WebSocket dashboards',
        'Custom D3.js visualizations',
      ],
    },
    {
      id: uid(),
      company: 'Netcore Cloud',
      title: 'Senior React Developer',
      location: 'Thane, India',
      period: 'Feb 2024 – Mar 2025',
      responsibilities: [
        'Revamped legacy React app — 90% UI consistency improvement',
        'Resolved critical legacy bugs via root-cause analysis',
        'Delivered Undo/Redo, Version Management, Click Tracking',
      ],
    },
    {
      id: uid(),
      company: 'Shifa Infotech',
      title: 'Software React Native Developer',
      location: 'Jogeshwari, Mumbai',
      period: 'Apr 2023 – Jan 2024',
      responsibilities: ['Quarterly delivery planning', 'Timely delivery of prioritized tasks'],
    },
    {
      id: uid(),
      company: 'Mypcot Infotech',
      title: 'Senior React Native Developer',
      location: 'Mumbai, India',
      period: 'Feb 2021 – Mar 2023',
      responsibilities: [
        'Pixel-perfect React Native UIs for iOS and Android',
        'Custom reusable components across both platforms',
        'Integrated Firebase, Razorpay, CCAvenue, GPS, Camera, Biometrics',
        'Built and deployed iOS/Android binaries',
        'Mentored junior developers',
      ],
    },
    {
      id: uid(),
      company: 'Blocklogy',
      title: 'Software Developer',
      location: 'Navi Mumbai, India',
      period: 'Mar 2020 – Jan 2021',
      responsibilities: [
        'Built blockchain DApps on Ethereum (v4 & v5)',
        'Reusable React components',
        'Third-party API integration',
      ],
    },
    {
      id: uid(),
      company: 'Tantra-Gyan',
      title: 'Software Solution Developer',
      location: 'Mumbai, India',
      period: 'Feb 2019 – Mar 2020',
      responsibilities: [
        'Built UI components in React.js + Laravel Blade',
        'Integrated Camera and Location APIs',
      ],
    },
  ];

  // Auto-link skills to projects by name match
  skills.forEach((s) => {
    projects.forEach((p) => {
      if (p.stack.some((t) => t.toLowerCase() === s.name.toLowerCase())) {
        s.relatedProjectIds.push(p.id);
      }
    });
  });

  return { categories: cats, skills, projects, experiences };
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================
function PressBtn({ children, color = COLORS.primary, darkColor, onPress, small, style, ghost, disabled }) {
  const [pressed, setPressed] = useState(false);
  const bg = ghost ? '#FFFFFF' : color;
  const shadow = ghost ? COLORS.border : darkColor || darken(color);
  const textColor = ghost ? COLORS.text : '#FFFFFF';
  return (
    <View style={[{ alignSelf: 'flex-start', position: 'relative' }, style]}>
      <View
        style={{
          position: 'absolute', top: 4, left: 0, right: 0, bottom: 0,
          backgroundColor: shadow, borderRadius: 14,
        }}
      />
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={disabled ? null : onPress}
        style={{
          backgroundColor: bg,
          borderRadius: 14,
          paddingHorizontal: small ? 14 : 20,
          paddingVertical: small ? 8 : 12,
          transform: [{ translateY: pressed ? 3 : 0 }],
          opacity: disabled ? 0.5 : 1,
          borderWidth: ghost ? 2 : 0,
          borderColor: COLORS.border,
        }}
      >
        <Text style={{
          color: textColor,
          fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
          fontWeight: '800',
          fontSize: small ? 12 : 14,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>{children}</Text>
      </Pressable>
    </View>
  );
}

function darken(hex) {
  // Simple darken: parse hex, multiply each channel by 0.75
  const c = hex.replace('#', '');
  const r = Math.floor(parseInt(c.slice(0, 2), 16) * 0.7);
  const g = Math.floor(parseInt(c.slice(2, 4), 16) * 0.7);
  const b = Math.floor(parseInt(c.slice(4, 6), 16) * 0.7);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function Chip({ children, color = COLORS.primary, onPress }) {
  const bg = color + '22'; // 13% opacity
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: bg,
        borderColor: color + '88',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      <Text style={{ color: darken(color), fontWeight: '800', fontSize: 12 }}>{children}</Text>
    </TouchableOpacity>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState({ screen: 'skills-home' });
  const [history, setHistory] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [streak, setStreak] = useState({ count: 0, lastDate: null, xp: 0 });
  const [editing, setEditing] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadData();
      if (stored && stored.categories) {
        // Migration: ensure new categories exist
        const seedCats = SEED().categories;
        seedCats.forEach((sc) => {
          if (!stored.categories.find((c) => c.id === sc.id)) {
            stored.categories.push(sc);
          }
        });
        // Migration: ensure every skill has apis and refs arrays
        stored.skills.forEach((s) => {
          if (!Array.isArray(s.apis)) s.apis = [];
          if (!Array.isArray(s.refs)) s.refs = [];
        });
        // Migration: update auth category name if still old value
        const authCat = stored.categories.find((c) => c.id === 'auth');
        if (authCat && authCat.name === 'Auth & Security') authCat.name = 'Security & Auth';
        // Migration: seed webgl skills if the category is newly added
        if (!stored.skills.some((s) => s.categoryId === 'webgl')) {
          const webglSeed = SEED().skills.filter((s) => s.categoryId === 'webgl');
          stored.skills.push(...webglSeed);
        }
        setData(stored);
        await saveData(stored);
      } else {
        const seed = SEED();
        setData(seed);
        await saveData(seed);
      }
      const s = await loadStreak();
      setStreak(s);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded && data) saveData(data);
  }, [data, loaded]);

  const update = useCallback((mutator) => {
    setData((d) => {
      const next = JSON.parse(JSON.stringify(d));
      mutator(next);
      return next;
    });
  }, []);

  const navigate = (screen, params = {}) => {
    setHistory((h) => [...h, view]);
    setView({ screen, ...params });
  };
  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setView(prev);
      return h.slice(0, -1);
    });
  };

  const bumpXP = useCallback((amount) => {
    setStreak((s) => {
      const today = new Date().toDateString();
      const newCount = s.lastDate === today ? s.count : s.lastDate ? s.count + 1 : 1;
      const next = { count: newCount, lastDate: today, xp: s.xp + amount };
      saveStreak(next);
      return next;
    });
  }, []);

  if (!loaded || !data) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={styles.loadingText}>🦉 Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <Header
        streak={streak}
        onSearch={() => setSearchOpen(true)}
        onHome={() => { setHistory([]); setView({ screen: 'skills-home' }); }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {view.screen === 'skills-home' && (
          <SkillsHome data={data} navigate={navigate} />
        )}
        {view.screen === 'category-detail' && (
          <CategoryDetail
            data={data}
            categoryId={view.categoryId}
            navigate={navigate}
            goBack={goBack}
            onAdd={() => setEditing({ type: 'skill', item: { categoryId: view.categoryId } })}
          />
        )}
        {view.screen === 'skill-detail' && (
          <SkillDetail
            data={data}
            skillId={view.skillId}
            navigate={navigate}
            goBack={goBack}
            onEdit={(s) => setEditing({ type: 'skill', item: s })}
            onAddSubtopic={(parentId, categoryId) =>
              setEditing({ type: 'skill', item: { parentId, categoryId } })
            }
          />
        )}
        {view.screen === 'projects' && (
          <ProjectsScreen
            data={data}
            navigate={navigate}
            onAdd={() => setEditing({ type: 'project', item: {} })}
          />
        )}
        {view.screen === 'project-detail' && (
          <ProjectDetail
            data={data}
            projectId={view.projectId}
            navigate={navigate}
            goBack={goBack}
            onEdit={(p) => setEditing({ type: 'project', item: p })}
          />
        )}
        {view.screen === 'experience' && (
          <ExperienceScreen
            data={data}
            onAdd={() => setEditing({ type: 'experience', item: {} })}
            onEdit={(e) => setEditing({ type: 'experience', item: e })}
          />
        )}
        {view.screen === 'revise' && (
          <ReviseMode data={data} bumpXP={bumpXP} />
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {(view.screen === 'category-detail' ||
        view.screen === 'skills-home' ||
        view.screen === 'projects' ||
        view.screen === 'experience') && (
        <Fab
          onPress={() => {
            if (view.screen === 'projects') setEditing({ type: 'project', item: {} });
            else if (view.screen === 'experience') setEditing({ type: 'experience', item: {} });
            else if (view.screen === 'category-detail')
              setEditing({ type: 'skill', item: { categoryId: view.categoryId } });
            else setEditing({ type: 'skill', item: {} });
          }}
        />
      )}

      <BottomNav current={view.screen} navigate={navigate} />

      <Modal visible={searchOpen} animationType="slide" transparent>
        <SearchModal
          data={data}
          q={searchQ}
          setQ={setSearchQ}
          onClose={() => setSearchOpen(false)}
          onPick={(s, p) => { setSearchOpen(false); navigate(s, p); }}
        />
      </Modal>

      <Modal visible={!!editing} animationType="slide" transparent>
        {editing && (
          <EditModal
            data={data}
            editing={editing}
            update={update}
            onClose={() => setEditing(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({ streak, onSearch, onHome }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onHome} activeOpacity={0.7}>
        <Text style={styles.logo}>🦉 SkillUp</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <View style={[styles.pill, { backgroundColor: '#FFF4E5', borderColor: '#FFD89E' }]}>
        <Text style={[styles.pillText, { color: COLORS.orange }]}>🔥 {streak.count}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: '#E8F8E0', borderColor: '#B6E388', marginLeft: 6 }]}>
        <Text style={[styles.pillText, { color: COLORS.primaryDark }]}>⚡ {streak.xp}</Text>
      </View>
      <TouchableOpacity onPress={onSearch} style={styles.iconBtn}>
        <Text style={{ fontSize: 18 }}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// BOTTOM NAV
// ============================================================
function BottomNav({ current, navigate }) {
  const items = [
    { key: 'skills-home', label: 'Skills', emoji: '📚' },
    { key: 'projects', label: 'Projects', emoji: '🚀' },
    { key: 'experience', label: 'Career', emoji: '💼' },
    { key: 'revise', label: 'Revise', emoji: '⚡' },
  ];
  const isActive = (k) =>
    current === k ||
    (k === 'skills-home' && (current === 'category-detail' || current === 'skill-detail')) ||
    (k === 'projects' && current === 'project-detail');

  return (
    <View style={styles.bottomNav}>
      {items.map((it) => {
        const active = isActive(it.key);
        return (
          <TouchableOpacity
            key={it.key}
            onPress={() => navigate(it.key)}
            style={[styles.navItem, active && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 22 }}>{it.emoji}</Text>
            <Text style={[styles.navLabel, active && { color: COLORS.primary }]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ============================================================
// FAB
// ============================================================
function Fab({ onPress }) {
  return (
    <View style={styles.fabWrap} pointerEvents="box-none">
      <Pressable onPress={onPress} style={({ pressed }) => [
        styles.fab,
        { transform: [{ translateY: pressed ? 3 : 0 }] },
      ]}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', lineHeight: 32 }}>+</Text>
      </Pressable>
    </View>
  );
}

// ============================================================
// SKILLS HOME (Categories Grid)
// ============================================================
function SkillsHome({ data, navigate }) {
  return (
    <View>
      <Text style={styles.screenTitle}>Hey Vikil 👋</Text>
      <Text style={styles.screenSub}>
        {data.skills.length} skills · {data.categories.length} categories. Pick one to revise.
      </Text>
      <View style={styles.catGrid}>
        {data.categories.map((c) => {
          const count = data.skills.filter((s) => s.categoryId === c.id && !s.parentId).length;
          return (
            <Pressable
              key={c.id}
              onPress={() => navigate('category-detail', { categoryId: c.id })}
              style={({ pressed }) => [
                styles.catCard,
                { transform: [{ translateY: pressed ? 2 : 0 }] },
              ]}
            >
              <Text style={styles.catEmoji}>{c.emoji}</Text>
              <Text style={styles.catName}>{c.name}</Text>
              <View style={[styles.catCount, { backgroundColor: c.color }]}>
                <Text style={styles.catCountText}>{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================
// CATEGORY DETAIL (Top-level skills only — tree starts at skill)
// ============================================================
function CategoryDetail({ data, categoryId, navigate, goBack, onAdd }) {
  const cat = data.categories.find((c) => c.id === categoryId);
  const skills = data.skills.filter((s) => s.categoryId === categoryId && !s.parentId);
  if (!cat) return null;

  return (
    <View>
      <Crumb onPress={goBack} label="Back to skills" />
      <Text style={styles.screenTitle}>{cat.emoji} {cat.name}</Text>
      <Text style={styles.screenSub}>{skills.length} top-level skill{skills.length !== 1 ? 's' : ''}</Text>

      {skills.length === 0 && (
        <View style={styles.panel}>
          <Text style={styles.emptyText}>No skills yet. Tap + to add one.</Text>
        </View>
      )}

      {skills.map((s) => {
        const subCount = countDescendants(data.skills, s.id);
        const flashCount = (s.flashcards || []).length;
        return (
          <Pressable
            key={s.id}
            onPress={() => navigate('skill-detail', { skillId: s.id })}
            style={({ pressed }) => [styles.skillRow, { transform: [{ translateY: pressed ? 2 : 0 }] }]}
          >
            <View style={[styles.skillBubble, { backgroundColor: cat.color }]}>
              <Text style={styles.skillBubbleText}>{s.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.skillRowName}>{s.name}</Text>
              <Text style={styles.skillRowMeta}>
                {subCount > 0 ? `🌳 ${subCount} sub-topic${subCount !== 1 ? 's' : ''} · ` : ''}
                {flashCount} flashcard{flashCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function countDescendants(skills, parentId) {
  let count = 0;
  const direct = skills.filter((s) => s.parentId === parentId);
  count += direct.length;
  direct.forEach((d) => { count += countDescendants(skills, d.id); });
  return count;
}

// ============================================================
// SKILL DETAIL (with tabs + recursive tree of sub-topics)
// ============================================================
function SkillDetail({ data, skillId, navigate, goBack, onEdit, onAddSubtopic }) {
  const [tab, setTab] = useState('tree');
  const [revealed, setRevealed] = useState({});
  const [apiExpanded, setApiExpanded] = useState({});
  const [ytPlay, setYtPlay] = useState(null); // { videoId, startTime }
  const skill = data.skills.find((s) => s.id === skillId);
  const cat = skill ? data.categories.find((c) => c.id === skill.categoryId) : null;
  if (!skill || !cat) return <Text style={styles.emptyText}>Skill not found.</Text>;

  const directChildren = data.skills.filter((s) => s.parentId === skill.id);
  const parent = skill.parentId ? data.skills.find((s) => s.id === skill.parentId) : null;
  const relatedProjects = (skill.relatedProjectIds || [])
    .map((pid) => data.projects.find((p) => p.id === pid))
    .filter(Boolean);

  const tabs = [
    { key: 'tree', label: `🌳 Tree${directChildren.length ? ` (${directChildren.length})` : ''}` },
    { key: 'notes', label: '📝 Notes' },
    { key: 'deep', label: '🔬 Deep Dive' },
    { key: 'apis', label: `🔧 APIs (${(skill.apis || []).length})` },
    { key: 'cards', label: `🎴 Cards (${(skill.flashcards || []).length})` },
    { key: 'used', label: `🚀 Used (${relatedProjects.length})` },
    { key: 'links', label: `🔗 Links (${(skill.refs || []).length})` },
  ];

  return (
    <View>
      <Crumb
        onPress={goBack}
        label={parent ? `${parent.name}` : `${cat.emoji} ${cat.name}`}
      />

      {/* Hero card */}
      <View style={[styles.hero, { backgroundColor: cat.color }]}>
        <Text style={styles.heroEmoji}>{cat.emoji}</Text>
        <Text style={styles.heroTitle}>{skill.name}</Text>
        <Text style={styles.heroSub}>
          {parent ? `↳ inside ${parent.name}` : `in ${cat.name}`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <PressBtn small color={COLORS.blue} onPress={() => onEdit(skill)}>✏️ Edit</PressBtn>
        <PressBtn small color={COLORS.primary} onPress={() => onAddSubtopic(skill.id, skill.categoryId)}>+ Sub-topic</PressBtn>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={styles.tab}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            {tab === t.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === 'tree' && (
        <View>
          {directChildren.length === 0 ? (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>
                No sub-topics yet. Tap "+ Sub-topic" above to break this skill into smaller learnable pieces.
              </Text>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>SUB-TOPIC TREE</Text>
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 12 }}>
                Tap any node to drill in · arrow to expand/collapse
              </Text>
              {directChildren.map((child) => (
                <TreeNode
                  key={child.id}
                  skill={child}
                  allSkills={data.skills}
                  depth={0}
                  categoryColor={cat.color}
                  onPress={(id) => navigate('skill-detail', { skillId: id })}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {tab === 'notes' && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>FREE-FORM NOTES</Text>
          {skill.notes ? (
            <Text style={styles.panelBody}>{skill.notes}</Text>
          ) : (
            <Text style={styles.emptyText}>No notes yet. Tap Edit to add.</Text>
          )}
        </View>
      )}

      {tab === 'deep' && (
        <View>
          <DepthPanel title="📖 DEFINITION" body={skill.structured.definition} placeholder="Add a clear definition." />
          <DepthPanel title="💻 CODE EXAMPLE" body={skill.structured.codeExample} placeholder="Add a snippet." code />
          <DepthPanel title="🎯 WHEN YOU USED IT" body={skill.structured.whenUsed} placeholder="Project + outcome." />
          <DepthPanel title="⚠️ GOTCHAS" body={skill.structured.gotchas} placeholder="Pitfalls and surprises." />
        </View>
      )}

      {tab === 'apis' && (
        <View>
          {(skill.apis || []).length === 0 ? (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>
                No APIs added yet. Tap Edit to add API references (useState, fs.readFile, etc.).
              </Text>
            </View>
          ) : (
            (skill.apis || []).map((api) => {
              const expanded = !!apiExpanded[api.id];
              return (
                <Pressable
                  key={api.id}
                  onPress={() => setApiExpanded((s) => ({ ...s, [api.id]: !s[api.id] }))}
                  style={styles.apiCard}
                >
                  <Text style={styles.apiName}>{api.name}</Text>
                  {api.signature ? (
                    <Text style={styles.apiSignature}>{api.signature}</Text>
                  ) : null}
                  {!expanded && (
                    <Text style={styles.flashHint}>Tap to expand</Text>
                  )}
                  {expanded && (
                    <View style={{ marginTop: 10 }}>
                      {!!api.description && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>DESCRIPTION</Text>
                          <Text style={styles.panelBody}>{api.description}</Text>
                        </View>
                      )}
                      {!!api.params && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>PARAMETERS</Text>
                          <Text style={styles.panelBody}>{api.params}</Text>
                        </View>
                      )}
                      {!!api.returns && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>RETURNS</Text>
                          <Text style={styles.panelBody}>{api.returns}</Text>
                        </View>
                      )}
                      {!!api.example && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>EXAMPLE</Text>
                          <View style={styles.codeBlock}>
                            <Text style={styles.codeText}>{api.example}</Text>
                          </View>
                        </View>
                      )}
                      {!!api.gotchas && (
                        <View style={styles.panel}>
                          <Text style={styles.panelTitle}>⚠️ GOTCHAS</Text>
                          <Text style={styles.panelBody}>{api.gotchas}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      )}

      {tab === 'cards' && (
        <View>
          {(skill.flashcards || []).length === 0 && (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>No flashcards yet. Add Q&A pairs via Edit.</Text>
            </View>
          )}
          {(skill.flashcards || []).map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setRevealed((r) => ({ ...r, [f.id]: !r[f.id] }))}
              style={styles.flashcard}
            >
              <Text style={styles.flashQ}>❓ {f.q}</Text>
              {revealed[f.id] ? (
                <Text style={styles.flashA}>💡 {f.a}</Text>
              ) : (
                <Text style={styles.flashHint}>Tap to reveal</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {tab === 'used' && (
        <View>
          {relatedProjects.length === 0 && (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>Not linked to any project yet.</Text>
            </View>
          )}
          {relatedProjects.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => navigate('project-detail', { projectId: p.id })}
              style={styles.projectCard}
            >
              <Text style={styles.projectName}>{p.name}</Text>
              <Text style={styles.projectMeta}>{p.role} · {p.period}</Text>
              <Text style={styles.projectDesc}>{p.description}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {tab === 'links' && (
        <View>
          {(skill.refs || []).length === 0 ? (
            <View style={styles.panel}>
              <Text style={styles.emptyText}>
                No references yet. Tap ✏️ Edit to add links and YouTube videos.
              </Text>
            </View>
          ) : (
            (skill.refs || []).map((item) => {
              const vid = getYouTubeId(item.url);
              return vid
                ? <YouTubeRefCard key={item.id} item={item} onPlay={() => setYtPlay({ videoId: vid, startTime: item.startTime || '' })} />
                : <LinkRefCard key={item.id} item={item} />;
            })
          )}
        </View>
      )}

      {ytPlay && <YouTubePlayerModal videoId={ytPlay.videoId} startTime={ytPlay.startTime} onClose={() => setYtPlay(null)} />}
    </View>
  );
}

function DepthPanel({ title, body, placeholder, code }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {body ? (
        code ? (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{body}</Text>
          </View>
        ) : (
          <Text style={styles.panelBody}>{body}</Text>
        )
      ) : (
        <Text style={styles.emptyText}>{placeholder}</Text>
      )}
    </View>
  );
}

// ============================================================
// TREE NODE (recursive)
// ============================================================
function TreeNode({ skill, allSkills, depth, categoryColor, onPress }) {
  const children = allSkills.filter((s) => s.parentId === skill.id);
  const [expanded, setExpanded] = useState(depth < 1); // expand first level by default
  const hasChildren = children.length > 0;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
        {/* Indent lines */}
        {depth > 0 && (
          <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: depth }).map((_, i) => (
              <View key={i} style={{ width: 16, borderLeftWidth: 2, borderLeftColor: COLORS.border, height: 28, marginLeft: i === 0 ? 4 : 0 }} />
            ))}
          </View>
        )}
        {/* Branch connector */}
        {depth > 0 && (
          <View style={{ width: 12, height: 2, backgroundColor: COLORS.border, marginRight: 4 }} />
        )}
        {/* Expand arrow */}
        {hasChildren ? (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
            <Text style={{ fontSize: 12, color: COLORS.textLight }}>{expanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
        {/* Node */}
        <Pressable
          onPress={() => onPress(skill.id)}
          style={({ pressed }) => [
            styles.treeNode,
            {
              borderLeftColor: categoryColor,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={styles.treeNodeName}>{skill.name}</Text>
          {hasChildren && (
            <View style={[styles.treeChildBadge, { backgroundColor: categoryColor + '22' }]}>
              <Text style={{ color: darken(categoryColor), fontSize: 10, fontWeight: '800' }}>
                {children.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      {expanded &&
        children.map((c) => (
          <TreeNode
            key={c.id}
            skill={c}
            allSkills={allSkills}
            depth={depth + 1}
            categoryColor={categoryColor}
            onPress={onPress}
          />
        ))}
    </View>
  );
}

// ============================================================
// PROJECTS
// ============================================================
function ProjectsScreen({ data, navigate }) {
  return (
    <View>
      <Text style={styles.screenTitle}>🚀 Projects</Text>
      <Text style={styles.screenSub}>{data.projects.length} shipped.</Text>
      {data.projects.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => navigate('project-detail', { projectId: p.id })}
          style={styles.projectCard}
        >
          <Text style={styles.projectName}>{p.name}</Text>
          <Text style={styles.projectMeta}>{p.role} · {p.period} · Team {p.teamSize}</Text>
          <Text style={styles.projectDesc}>{p.description}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {p.stack.slice(0, 5).map((t, i) => (
              <Chip key={i} color={COLORS.blue}>{t}</Chip>
            ))}
            {p.stack.length > 5 && <Chip color={COLORS.textLight}>+{p.stack.length - 5}</Chip>}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function ProjectDetail({ data, projectId, navigate, goBack, onEdit }) {
  const p = data.projects.find((x) => x.id === projectId);
  if (!p) return <Text style={styles.emptyText}>Project not found.</Text>;
  return (
    <View>
      <Crumb onPress={goBack} label="Back to projects" />
      <View style={[styles.hero, { backgroundColor: COLORS.blue }]}>
        <Text style={styles.heroEmoji}>🚀</Text>
        <Text style={styles.heroTitle}>{p.name}</Text>
        <Text style={styles.heroSub}>{p.role} · {p.period}</Text>
      </View>
      <View style={{ marginBottom: 12 }}>
        <PressBtn small color={COLORS.blue} onPress={() => onEdit(p)}>✏️ Edit</PressBtn>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>OVERVIEW</Text>
        <Text style={styles.panelBody}>{p.description}</Text>
        <Text style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8 }}>Team size: {p.teamSize}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🛠️ TECH STACK</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {(p.stack || []).map((name, i) => {
            const skill = data.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
            return (
              <Chip
                key={i}
                color={COLORS.blue}
                onPress={() => skill && navigate('skill-detail', { skillId: skill.id })}
              >
                {name}
              </Chip>
            );
          })}
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>✨ OUTCOMES</Text>
        {(p.outcomes || []).map((o, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={{ color: COLORS.primary, marginRight: 8, fontWeight: '800' }}>✓</Text>
            <Text style={{ flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 21 }}>{o}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================================
// EXPERIENCE
// ============================================================
function ExperienceScreen({ data, onAdd, onEdit }) {
  return (
    <View>
      <Text style={styles.screenTitle}>💼 Career</Text>
      <Text style={styles.screenSub}>{data.experiences.length} roles · 7+ years</Text>
      {data.experiences.map((e) => (
        <View key={e.id} style={styles.expCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.expCompany}>{e.company}</Text>
              <Text style={styles.expTitle}>{e.title}</Text>
              <Text style={styles.expMeta}>{e.period} · {e.location}</Text>
            </View>
            <TouchableOpacity onPress={() => onEdit(e)} style={styles.iconBtn}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          {(e.responsibilities || []).map((r, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={{ color: COLORS.primary, marginRight: 8, fontWeight: '800' }}>✓</Text>
              <Text style={{ flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 21 }}>{r}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ============================================================
// YOUTUBE PLAYER MODAL
// ============================================================
// Chrome Mobile UA — makes YouTube treat the WebView as a real browser,
// avoiding Error 153 (embed blocked in non-browser WebViews).
const CHROME_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

function YouTubePlayerModal({ videoId, startTime, onClose }) {
  const secs = parseStartTime(startTime);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}${secs > 0 ? `&t=${secs}` : ''}`;
  return (
    <Modal
      visible
      animationType="slide"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.ytCloseBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.ytCloseTxt}>✕  Close</Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: watchUrl }}
          style={{ flex: 1 }}
          userAgent={CHROME_UA}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mixedContentMode="always"
          startInLoadingState
          renderLoading={() => (
            <View style={styles.ytLoading}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Loading…</Text>
            </View>
          )}
        />
        <Text style={styles.ytHint}>Rotate phone or tap ⛶ for landscape</Text>
      </View>
    </Modal>
  );
}

// ============================================================
// TIME STEPPER  (H : MM : SS tap +/- input)
// ============================================================
function TimeStepperInput({ value, onChange }) {
  const total = parseStartTime(value);
  const hv = Math.floor(total / 3600);
  const mv = Math.floor((total % 3600) / 60);
  const sv = total % 60;

  const set = (h, m, s) => {
    const t = Math.max(0, h) * 3600 + Math.max(0, Math.min(59, m)) * 60 + Math.max(0, Math.min(59, s));
    onChange(String(t));
  };

  const UnitCol = ({ label, val, onInc, onDec }) => (
    <View style={styles.stepperUnit}>
      <TouchableOpacity onPress={onInc} style={styles.stepperBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.stepperArrow}>▲</Text>
      </TouchableOpacity>
      <Text style={styles.stepperVal}>{String(val).padStart(2, '0')}</Text>
      <TouchableOpacity onPress={onDec} style={styles.stepperBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.stepperArrow}>▼</Text>
      </TouchableOpacity>
      <Text style={styles.stepperLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.stepperRow}>
      <UnitCol label="H" val={hv} onInc={() => set(hv + 1, mv, sv)} onDec={() => set(hv - 1, mv, sv)} />
      <Text style={styles.stepperSep}>:</Text>
      <UnitCol label="M" val={mv} onInc={() => set(hv, mv + 1, sv)} onDec={() => set(hv, mv - 1, sv)} />
      <Text style={styles.stepperSep}>:</Text>
      <UnitCol label="S" val={sv} onInc={() => set(hv, mv, sv + 1)} onDec={() => set(hv, mv, sv - 1)} />
      {total > 0 && (
        <TouchableOpacity onPress={() => onChange('0')} style={styles.stepperClear}>
          <Text style={styles.stepperClearTxt}>✕ Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================
// REF CARDS  (YouTube thumbnail card + plain link card)
// ============================================================
function YouTubeRefCard({ item, onPlay }) {
  const videoId = getYouTubeId(item.url);
  const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const timeLabel = fmtTime(item.startTime);
  return (
    <TouchableOpacity style={styles.refCard} onPress={onPlay} activeOpacity={0.85}>
      <Image source={{ uri: thumb }} style={styles.ytThumb} resizeMode="cover" />
      <View style={styles.refCardBody}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <View style={styles.ytBadge}>
            <Text style={styles.ytBadgeText}>▶  YouTube</Text>
          </View>
          {timeLabel ? (
            <View style={styles.ytTimeBadge}>
              <Text style={styles.ytTimeTxt}>⏱ {timeLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.refTitle} numberOfLines={2}>{item.title || 'Watch video'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function LinkRefCard({ item }) {
  return (
    <TouchableOpacity style={styles.refCard} onPress={() => openLink(item.url)} activeOpacity={0.85}>
      <View style={styles.linkIconWrap}>
        <Text style={{ fontSize: 26 }}>🔗</Text>
      </View>
      <View style={styles.refCardBody}>
        <Text style={styles.refTitle} numberOfLines={2}>{item.title || item.url}</Text>
        <Text style={styles.refUrl} numberOfLines={1}>{item.url}</Text>
      </View>
      <Text style={{ fontSize: 20, color: COLORS.textLight, alignSelf: 'center' }}>›</Text>
    </TouchableOpacity>
  );
}

// ============================================================
// REVISE MODE
// ============================================================
function ReviseMode({ data, bumpXP }) {
  const buildDeck = () => {
    const cards = [];
    data.skills.forEach((s) => {
      (s.flashcards || []).forEach((f) => {
        cards.push({ ...f, skillId: s.id, skillName: s.name, categoryId: s.categoryId });
      });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  };

  const [deck, setDeck] = useState(buildDeck);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ good: 0, ok: 0, hard: 0 });

  const restart = () => {
    setDeck(buildDeck());
    setIdx(0);
    setRevealed(false);
    setDone(false);
    setScore({ good: 0, ok: 0, hard: 0 });
  };

  const totalCards = data.skills.reduce((n, s) => n + (s.flashcards?.length || 0), 0);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    restart();
  }, [totalCards]); // eslint-disable-line react-hooks/exhaustive-deps

  if (deck.length === 0) {
    return (
      <View>
        <Text style={styles.screenTitle}>⚡ Revise</Text>
        <View style={styles.panel}>
          <Text style={styles.emptyText}>
            No flashcards yet! Add Q&A pairs to your skills first.
          </Text>
        </View>
      </View>
    );
  }

  if (done) {
    const totalXP = score.good * 10 + score.ok * 5 + score.hard * 2;
    return (
      <View>
        <Text style={styles.screenTitle}>🎉 Session complete!</Text>
        <View style={[styles.hero, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.heroEmoji}>🏆</Text>
          <Text style={styles.heroTitle}>+{totalXP} XP</Text>
          <Text style={styles.heroSub}>{deck.length} cards reviewed</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>BREAKDOWN</Text>
          <Text style={styles.panelBody}>
            😎 Easy: {score.good}    🤔 Good: {score.ok}    😅 Hard: {score.hard}
          </Text>
        </View>
        <PressBtn onPress={restart}>
          🔀 Shuffle & go again
        </PressBtn>
      </View>
    );
  }

  const card = deck[idx];
  const cat = data.categories.find((c) => c.id === card.categoryId);
  const progress = (idx / deck.length) * 100;

  const rate = (key, xp) => {
    bumpXP(xp);
    setScore((s) => ({ ...s, [key]: s[key] + 1 }));
    if (idx + 1 >= deck.length) setDone(true);
    else { setIdx(idx + 1); setRevealed(false); }
  };

  return (
    <View>
      <Text style={styles.screenTitle}>⚡ Revise</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.screenSub}>
        Card {idx + 1} of {deck.length} · {cat?.emoji} {card.skillName}
      </Text>

      <View style={styles.reviseCard}>
        <Text style={styles.reviseQ}>❓ {card.q}</Text>
        {revealed && (
          <View style={styles.reviseAnswer}>
            <Text style={styles.reviseAText}>💡 {card.a}</Text>
          </View>
        )}

        {!revealed ? (
          <PressBtn color={COLORS.blue} onPress={() => setRevealed(true)} style={{ marginTop: 16 }}>
            Reveal answer
          </PressBtn>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <View style={{ flex: 1 }}><PressBtn small color={COLORS.red} onPress={() => rate('hard', 2)}>😅 Hard</PressBtn></View>
            <View style={{ flex: 1 }}><PressBtn small color={COLORS.orange} onPress={() => rate('ok', 5)}>🤔 Good</PressBtn></View>
            <View style={{ flex: 1 }}><PressBtn small color={COLORS.primary} onPress={() => rate('good', 10)}>😎 Easy</PressBtn></View>
          </View>
        )}
      </View>
    </View>
  );
}

// ============================================================
// SEARCH
// ============================================================
function SearchModal({ data, q, setQ, onClose, onPick }) {
  const query = q.trim().toLowerCase();
  const skills = query ? data.skills.filter((s) =>
    s.name.toLowerCase().includes(query) ||
    (s.notes || '').toLowerCase().includes(query) ||
    (s.structured.definition || '').toLowerCase().includes(query)
  ).slice(0, 15) : [];
  const projects = query ? data.projects.filter((p) =>
    p.name.toLowerCase().includes(query) ||
    (p.description || '').toLowerCase().includes(query)
  ).slice(0, 10) : [];
  const experiences = query ? data.experiences.filter((e) =>
    e.company.toLowerCase().includes(query) ||
    e.title.toLowerCase().includes(query)
  ).slice(0, 10) : [];

  return (
    <View style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>🔍 Search</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search skills, projects, experiences…"
          style={styles.input}
          autoFocus
          placeholderTextColor={COLORS.textLight}
        />
        <ScrollView style={{ maxHeight: 400, marginTop: 12 }}>
          {!query && <Text style={styles.emptyText}>Start typing to search across everything.</Text>}
          {query && skills.length === 0 && projects.length === 0 && experiences.length === 0 && (
            <Text style={styles.emptyText}>No matches.</Text>
          )}
          {skills.length > 0 && <Text style={styles.searchSection}>📚 Skills</Text>}
          {skills.map((s) => {
            const c = data.categories.find((x) => x.id === s.categoryId);
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => onPick('skill-detail', { skillId: s.id })}
                style={styles.searchResult}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>{c?.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultName}>{s.name}</Text>
                  <Text style={styles.searchResultMeta}>{c?.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {projects.length > 0 && <Text style={styles.searchSection}>🚀 Projects</Text>}
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => onPick('project-detail', { projectId: p.id })}
              style={styles.searchResult}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>🚀</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.searchResultName}>{p.name}</Text>
                <Text style={styles.searchResultMeta}>{p.period}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {experiences.length > 0 && <Text style={styles.searchSection}>💼 Experience</Text>}
          {experiences.map((e) => (
            <TouchableOpacity
              key={e.id}
              onPress={() => onPick('experience')}
              style={styles.searchResult}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>💼</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.searchResultName}>{e.company}</Text>
                <Text style={styles.searchResultMeta}>{e.title} · {e.period}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================
// EDIT MODALS
// ============================================================
function EditModal({ data, editing, update, onClose }) {
  const { type, item } = editing;
  if (type === 'skill') return <SkillEditModal data={data} skill={item} update={update} onClose={onClose} />;
  if (type === 'project') return <ProjectEditModal data={data} project={item} update={update} onClose={onClose} />;
  if (type === 'experience') return <ExperienceEditModal experience={item} update={update} onClose={onClose} />;
  return null;
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SkillEditModal({ data, skill, update, onClose }) {
  const isNew = !skill.id;
  const [showDepth, setShowDepth] = useState(!isNew);
  const [form, setForm] = useState({
    id: skill.id || uid(),
    name: skill.name || '',
    categoryId: skill.categoryId || data.categories[0].id,
    parentId: skill.parentId || null,
    notes: skill.notes || '',
    structured: {
      definition: skill.structured?.definition || '',
      codeExample: skill.structured?.codeExample || '',
      whenUsed: skill.structured?.whenUsed || '',
      gotchas: skill.structured?.gotchas || '',
    },
    flashcards: skill.flashcards || [],
    apis: skill.apis || [],
    refs: skill.refs || [],
    relatedProjectIds: skill.relatedProjectIds || [],
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setStructured = (k, v) => setForm((f) => ({ ...f, structured: { ...f.structured, [k]: v } }));

  const addFlashcard = () =>
    setForm((f) => ({ ...f, flashcards: [...f.flashcards, { id: uid(), q: '', a: '' }] }));
  const updateFlashcard = (id, k, v) =>
    setForm((f) => ({ ...f, flashcards: f.flashcards.map((fc) => (fc.id === id ? { ...fc, [k]: v } : fc)) }));
  const removeFlashcard = (id) =>
    setForm((f) => ({ ...f, flashcards: f.flashcards.filter((fc) => fc.id !== id) }));

  const addApi = () =>
    setForm((f) => ({
      ...f,
      apis: [...f.apis, { id: uid(), name: '', signature: '', description: '', params: '', returns: '', example: '', gotchas: '' }],
    }));
  const updateApi = (id, k, v) =>
    setForm((f) => ({ ...f, apis: f.apis.map((a) => (a.id === id ? { ...a, [k]: v } : a)) }));
  const removeApi = (id) =>
    setForm((f) => ({ ...f, apis: f.apis.filter((a) => a.id !== id) }));

  const addRef = () =>
    setForm((f) => ({ ...f, refs: [...f.refs, { id: uid(), title: '', url: '', startTime: '' }] }));
  const updateRef = (id, k, v) =>
    setForm((f) => ({ ...f, refs: f.refs.map((r) => (r.id === id ? { ...r, [k]: v } : r)) }));
  const removeRef = (id) =>
    setForm((f) => ({ ...f, refs: f.refs.filter((r) => r.id !== id) }));

  const toggleProject = (pid) =>
    setForm((f) => ({
      ...f,
      relatedProjectIds: f.relatedProjectIds.includes(pid)
        ? f.relatedProjectIds.filter((x) => x !== pid)
        : [...f.relatedProjectIds, pid],
    }));

  const save = () => {
    if (!form.name.trim()) {
      Alert.alert('Missing name', 'Skill needs a name.');
      return;
    }
    const cleaned = {
      ...form,
      flashcards: form.flashcards.filter((fc) => fc.q.trim()),
      apis: form.apis.filter((a) => a.name.trim()),
      refs: form.refs.filter((r) => r.url.trim()),
    };
    update((d) => {
      if (isNew) d.skills.push(cleaned);
      else {
        const i = d.skills.findIndex((s) => s.id === form.id);
        if (i >= 0) d.skills[i] = cleaned;
      }
    });
    onClose();
  };

  const del = () => {
    Alert.alert('Delete?', 'This skill and any sub-topics references stay (sub-topics become orphans). Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          update((d) => {
            d.skills = d.skills.filter((s) => s.id !== form.id);
            // Orphan children to top-level
            d.skills.forEach((s) => { if (s.parentId === form.id) s.parentId = null; });
          });
          onClose();
        },
      },
    ]);
  };

  // Candidate parents: any skill in same category, not self, not descendant
  const parentCandidates = data.skills.filter(
    (s) => s.categoryId === form.categoryId && s.id !== form.id
  );
  const parentName = form.parentId
    ? data.skills.find((s) => s.id === form.parentId)?.name
    : 'None (top-level skill)';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? '✨ New skill' : '✏️ Edit skill'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 500 }} keyboardShouldPersistTaps="handled">
          <Field label="NAME *">
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="e.g. useState"
              placeholderTextColor={COLORS.textLight}
            />
          </Field>

          <Field label="CATEGORY">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setField('categoryId', c.id)}
                  style={[
                    styles.choiceChip,
                    form.categoryId === c.id && { backgroundColor: c.color, borderColor: c.color },
                  ]}
                >
                  <Text style={[
                    styles.choiceChipText,
                    form.categoryId === c.id && { color: 'white' },
                  ]}>{c.emoji} {c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>

          <Field label="PARENT SKILL (optional — leave for top-level)">
            <View>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 6 }}>
                Currently: <Text style={{ fontWeight: '800', color: COLORS.text }}>{parentName}</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => setField('parentId', null)}
                  style={[
                    styles.choiceChip,
                    !form.parentId && { backgroundColor: COLORS.text, borderColor: COLORS.text },
                  ]}
                >
                  <Text style={[
                    styles.choiceChipText,
                    !form.parentId && { color: 'white' },
                  ]}>🌳 Top-level</Text>
                </TouchableOpacity>
                {parentCandidates.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setField('parentId', s.id)}
                    style={[
                      styles.choiceChip,
                      form.parentId === s.id && { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
                    ]}
                  >
                    <Text style={[
                      styles.choiceChipText,
                      form.parentId === s.id && { color: 'white' },
                    ]}>↳ {s.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Field>

          <TouchableOpacity onPress={() => setShowDepth(!showDepth)} style={styles.toggleBtn}>
            <Text style={{ fontWeight: '800', color: COLORS.blue }}>
              {showDepth ? '▼' : '▶'} {showDepth ? 'Hide depth fields' : 'Add depth (notes, code, gotchas, cards)'}
            </Text>
          </TouchableOpacity>

          {showDepth && (
            <>
              <Field label="📝 FREE-FORM NOTES">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.notes}
                  onChangeText={(v) => setField('notes', v)}
                  placeholder="Your personal thoughts, observations…"
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="📖 DEFINITION">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.structured.definition}
                  onChangeText={(v) => setStructured('definition', v)}
                  placeholder="Concise, accurate definition."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="💻 CODE EXAMPLE">
                <TextInput
                  style={[styles.input, styles.textarea, { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 13 }]}
                  multiline
                  value={form.structured.codeExample}
                  onChangeText={(v) => setStructured('codeExample', v)}
                  placeholder="Representative snippet."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="🎯 WHEN YOU USED IT">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.structured.whenUsed}
                  onChangeText={(v) => setStructured('whenUsed', v)}
                  placeholder="Project, what you did, outcome."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>
              <Field label="⚠️ GOTCHAS">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  value={form.structured.gotchas}
                  onChangeText={(v) => setStructured('gotchas', v)}
                  placeholder="Pitfalls, surprises."
                  placeholderTextColor={COLORS.textLight}
                />
              </Field>

              <Field label="🎴 FLASHCARDS">
                {form.flashcards.map((fc) => (
                  <View key={fc.id} style={styles.flashEdit}>
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={fc.q}
                      onChangeText={(v) => updateFlashcard(fc.id, 'q', v)}
                      placeholder="Question"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea]}
                      multiline
                      value={fc.a}
                      onChangeText={(v) => updateFlashcard(fc.id, 'a', v)}
                      placeholder="Answer"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <PressBtn small ghost style={{ marginTop: 6 }} onPress={() => removeFlashcard(fc.id)}>
                      Remove
                    </PressBtn>
                  </View>
                ))}
                <PressBtn small ghost onPress={addFlashcard}>+ Add flashcard</PressBtn>
              </Field>

              <Field label="🔧 APIs">
                {form.apis.map((api) => (
                  <View key={api.id} style={styles.flashEdit}>
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={api.name}
                      onChangeText={(v) => updateApi(api.id, 'name', v)}
                      placeholder="Name (e.g. useState)"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, { marginBottom: 6, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12 }]}
                      value={api.signature}
                      onChangeText={(v) => updateApi(api.id, 'signature', v)}
                      placeholder="Signature"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6 }]}
                      multiline
                      value={api.description}
                      onChangeText={(v) => updateApi(api.id, 'description', v)}
                      placeholder="Description"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6 }]}
                      multiline
                      value={api.params}
                      onChangeText={(v) => updateApi(api.id, 'params', v)}
                      placeholder="Parameters"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={api.returns}
                      onChangeText={(v) => updateApi(api.id, 'returns', v)}
                      placeholder="Returns"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6, minHeight: 120, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12 }]}
                      multiline
                      value={api.example}
                      onChangeText={(v) => updateApi(api.id, 'example', v)}
                      placeholder="Example (code)"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, styles.textarea, { marginBottom: 6 }]}
                      multiline
                      value={api.gotchas}
                      onChangeText={(v) => updateApi(api.id, 'gotchas', v)}
                      placeholder="Gotchas"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <PressBtn small ghost style={{ marginTop: 6 }} onPress={() => removeApi(api.id)}>
                      Remove
                    </PressBtn>
                  </View>
                ))}
                <PressBtn small ghost onPress={addApi}>+ Add API</PressBtn>
              </Field>

              <Field label="🔗 REFERENCE LINKS & YOUTUBE VIDEOS">
                <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 8, fontWeight: '600' }}>
                  Paste any URL or YouTube link. YouTube videos get a thumbnail player.
                </Text>
                {form.refs.map((r) => (
                  <View key={r.id} style={styles.flashEdit}>
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={r.title}
                      onChangeText={(v) => updateRef(r.id, 'title', v)}
                      placeholder="Title (e.g. Official Docs, Tutorial)"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TextInput
                      style={[styles.input, { marginBottom: 6 }]}
                      value={r.url}
                      onChangeText={(v) => {
                        updateRef(r.id, 'url', v);
                        // Auto-fill start time from ?t= in pasted URL
                        const auto = extractTFromUrl(v);
                        if (auto && !parseStartTime(r.startTime)) {
                          updateRef(r.id, 'startTime', auto);
                        }
                      }}
                      placeholder="https://... or https://youtube.com/watch?v=..."
                      placeholderTextColor={COLORS.textLight}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    {isYouTubeUrl(r.url) && (
                      <View style={{ marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ fontSize: 11, color: '#FF0000', fontWeight: '800' }}>
                            ▶ YouTube detected
                          </Text>
                          {extractTFromUrl(r.url) && !parseStartTime(r.startTime) === false && (
                            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '800', marginLeft: 8 }}>
                              · auto-filled from URL
                            </Text>
                          )}
                        </View>
                        <Text style={styles.fieldLabel}>START TIME (optional)</Text>
                        <TimeStepperInput
                          value={r.startTime || '0'}
                          onChange={(v) => updateRef(r.id, 'startTime', v)}
                        />
                        {Boolean(parseStartTime(r.startTime)) && (
                          <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '800', marginTop: 8 }}>
                            ⏱ Will start at {fmtTime(r.startTime)}
                          </Text>
                        )}
                      </View>
                    )}
                    <PressBtn small ghost style={{ marginTop: 4 }} onPress={() => removeRef(r.id)}>
                      Remove
                    </PressBtn>
                  </View>
                ))}
                <PressBtn small ghost onPress={addRef}>+ Add link / video</PressBtn>
              </Field>

              <Field label="🚀 LINKED PROJECTS">
                {data.projects.map((p) => {
                  const on = form.relatedProjectIds.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => toggleProject(p.id)}
                      style={styles.checkboxRow}
                    >
                      <View style={[styles.checkbox, on && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                        {on && <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>✓</Text>}
                      </View>
                      <Text style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </Field>
            </>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.border }}>
          <PressBtn onPress={save}>💾 Save</PressBtn>
          {!isNew && <PressBtn color={COLORS.red} onPress={del}>🗑 Delete</PressBtn>}
          <PressBtn ghost onPress={onClose}>Cancel</PressBtn>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProjectEditModal({ data, project, update, onClose }) {
  const isNew = !project.id;
  const [form, setForm] = useState({
    id: project.id || uid(),
    name: project.name || '',
    role: project.role || '',
    period: project.period || '',
    teamSize: String(project.teamSize || 1),
    stack: (project.stack || []).join(', '),
    description: project.description || '',
    outcomes: (project.outcomes || []).join('\n'),
  });
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { Alert.alert('Missing', 'Name required.'); return; }
    const cleaned = {
      ...form,
      stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean),
      outcomes: form.outcomes.split('\n').map((s) => s.trim()).filter(Boolean),
      teamSize: parseInt(form.teamSize, 10) || 1,
    };
    update((d) => {
      if (isNew) d.projects.push(cleaned);
      else {
        const i = d.projects.findIndex((p) => p.id === form.id);
        if (i >= 0) d.projects[i] = cleaned;
      }
    });
    onClose();
  };
  const del = () => {
    Alert.alert('Delete?', 'Remove this project?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        update((d) => { d.projects = d.projects.filter((p) => p.id !== form.id); });
        onClose();
      } },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? '✨ New project' : '✏️ Edit project'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 500 }}>
          <Field label="NAME *"><TextInput style={styles.input} value={form.name} onChangeText={(v) => setField('name', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="ROLE"><TextInput style={styles.input} value={form.role} onChangeText={(v) => setField('role', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="PERIOD"><TextInput style={styles.input} value={form.period} onChangeText={(v) => setField('period', v)} placeholder="2024 – 2025" placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="TEAM SIZE"><TextInput style={styles.input} keyboardType="numeric" value={form.teamSize} onChangeText={(v) => setField('teamSize', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="DESCRIPTION"><TextInput style={[styles.input, styles.textarea]} multiline value={form.description} onChangeText={(v) => setField('description', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="TECH STACK (comma-separated)"><TextInput style={[styles.input, styles.textarea]} multiline value={form.stack} onChangeText={(v) => setField('stack', v)} placeholder="React, Node, Mongo" placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="OUTCOMES (one per line)"><TextInput style={[styles.input, styles.textarea, { minHeight: 120 }]} multiline value={form.outcomes} onChangeText={(v) => setField('outcomes', v)} placeholderTextColor={COLORS.textLight} /></Field>
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.border }}>
          <PressBtn onPress={save}>💾 Save</PressBtn>
          {!isNew && <PressBtn color={COLORS.red} onPress={del}>🗑 Delete</PressBtn>}
          <PressBtn ghost onPress={onClose}>Cancel</PressBtn>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ExperienceEditModal({ experience, update, onClose }) {
  const isNew = !experience.id;
  const [form, setForm] = useState({
    id: experience.id || uid(),
    company: experience.company || '',
    title: experience.title || '',
    location: experience.location || '',
    period: experience.period || '',
    responsibilities: (experience.responsibilities || []).join('\n'),
  });
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.company.trim()) { Alert.alert('Missing', 'Company required.'); return; }
    const cleaned = {
      ...form,
      responsibilities: form.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    update((d) => {
      if (isNew) d.experiences.unshift(cleaned);
      else {
        const i = d.experiences.findIndex((e) => e.id === form.id);
        if (i >= 0) d.experiences[i] = cleaned;
      }
    });
    onClose();
  };
  const del = () => {
    Alert.alert('Delete?', 'Remove this role?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        update((d) => { d.experiences = d.experiences.filter((e) => e.id !== form.id); });
        onClose();
      } },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isNew ? '✨ New role' : '✏️ Edit role'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 500 }}>
          <Field label="COMPANY *"><TextInput style={styles.input} value={form.company} onChangeText={(v) => setField('company', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="TITLE"><TextInput style={styles.input} value={form.title} onChangeText={(v) => setField('title', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="LOCATION"><TextInput style={styles.input} value={form.location} onChangeText={(v) => setField('location', v)} placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="PERIOD"><TextInput style={styles.input} value={form.period} onChangeText={(v) => setField('period', v)} placeholder="Jun 2025 – Present" placeholderTextColor={COLORS.textLight} /></Field>
          <Field label="RESPONSIBILITIES (one per line)"><TextInput style={[styles.input, styles.textarea, { minHeight: 160 }]} multiline value={form.responsibilities} onChangeText={(v) => setField('responsibilities', v)} placeholderTextColor={COLORS.textLight} /></Field>
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.border }}>
          <PressBtn onPress={save}>💾 Save</PressBtn>
          {!isNew && <PressBtn color={COLORS.red} onPress={del}>🗑 Delete</PressBtn>}
          <PressBtn ghost onPress={onClose}>Cancel</PressBtn>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Crumb({ onPress, label }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginBottom: 10 }}>
      <Text style={{ color: COLORS.textLight, fontSize: 13, fontWeight: '700' }}>← {label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  loadingText: { fontSize: 24, color: COLORS.primary, fontWeight: '800' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  logo: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  pill: {
    borderWidth: 2, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  pillText: { fontWeight: '800', fontSize: 13 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F7F7F7', borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: 6,
  },

  // Screen titles
  screenTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  screenSub: { color: COLORS.textLight, fontSize: 14, marginBottom: 16, fontWeight: '600' },

  // Category grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: {
    width: '48%', backgroundColor: 'white',
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 18, padding: 14,
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 0, elevation: 2,
  },
  catEmoji: { fontSize: 40, marginBottom: 6 },
  catName: { fontWeight: '800', fontSize: 14, color: COLORS.text, textAlign: 'center' },
  catCount: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, marginTop: 6,
  },
  catCountText: { color: 'white', fontWeight: '800', fontSize: 11 },

  // Skill row
  skillRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 0, elevation: 2,
  },
  skillBubble: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  skillBubbleText: { color: 'white', fontWeight: '800', fontSize: 18 },
  skillRowName: { fontWeight: '800', fontSize: 15, color: COLORS.text },
  skillRowMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 2, fontWeight: '600' },
  chevron: { color: '#BBB', fontSize: 24, marginLeft: 8 },

  // Hero
  hero: {
    borderRadius: 20, padding: 22, marginBottom: 14,
    overflow: 'hidden', position: 'relative',
  },
  heroEmoji: { position: 'absolute', right: -10, top: -10, fontSize: 90, opacity: 0.3 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: 'white' },
  heroSub: { fontSize: 13, color: 'white', opacity: 0.9, marginTop: 4, fontWeight: '700' },

  // Tabs
  tabs: { marginBottom: 12, borderBottomWidth: 2, borderBottomColor: COLORS.border },
  tab: { paddingHorizontal: 12, paddingVertical: 10, position: 'relative' },
  tabText: { color: COLORS.textLight, fontWeight: '800', fontSize: 13 },
  tabTextActive: { color: COLORS.primary },
  tabUnderline: {
    position: 'absolute', bottom: -2, left: 0, right: 0,
    height: 3, backgroundColor: COLORS.primary,
  },

  // Panel
  panel: {
    backgroundColor: COLORS.panel,
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  panelTitle: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '800',
    letterSpacing: 0.5, marginBottom: 8,
  },
  panelBody: { fontSize: 15, lineHeight: 22, color: COLORS.text, fontWeight: '600' },
  emptyText: { color: '#BBB', fontStyle: 'italic', fontSize: 14, fontWeight: '600' },

  // Code block
  codeBlock: { backgroundColor: '#2D2D2D', borderRadius: 12, padding: 12 },
  codeText: { color: '#F8F8F2', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12, lineHeight: 18 },

  // Tree
  treeNode: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderLeftWidth: 4,
    paddingVertical: 10, paddingHorizontal: 12, marginVertical: 2,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  treeNodeName: { flex: 1, fontWeight: '800', color: COLORS.text, fontSize: 14 },
  treeChildBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, marginLeft: 6,
  },
  expandBtn: { width: 22, alignItems: 'center', justifyContent: 'center' },

  // Flashcard
  flashcard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  flashQ: { fontWeight: '800', color: COLORS.text, fontSize: 15, marginBottom: 6 },
  flashA: { color: COLORS.text, fontSize: 14, lineHeight: 21, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, borderStyle: 'dashed', fontWeight: '600' },
  flashHint: { color: '#BBB', fontSize: 12, fontStyle: 'italic', fontWeight: '600' },

  // Projects
  projectCard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  projectName: { fontWeight: '800', fontSize: 17, color: COLORS.text, marginBottom: 2 },
  projectMeta: { fontSize: 12, color: COLORS.textLight, marginBottom: 8, fontWeight: '600' },
  projectDesc: { fontSize: 14, color: COLORS.text, lineHeight: 21, fontWeight: '600' },

  // Experience
  expCard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  expCompany: { fontWeight: '800', fontSize: 17, color: COLORS.text },
  expTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginTop: 2 },
  expMeta: { fontSize: 12, color: COLORS.textLight, marginVertical: 6, fontWeight: '600' },
  bulletRow: { flexDirection: 'row', marginVertical: 4 },

  // Revise
  reviseCard: {
    backgroundColor: 'white', borderWidth: 3, borderColor: COLORS.blue,
    borderRadius: 24, padding: 22, marginBottom: 16,
    shadowColor: COLORS.blue, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 0, elevation: 4,
  },
  reviseQ: { fontSize: 20, fontWeight: '800', color: COLORS.text, lineHeight: 28 },
  reviseAnswer: {
    backgroundColor: '#F0FAFF', borderWidth: 2, borderColor: '#84D8FF',
    borderStyle: 'dashed', borderRadius: 14, padding: 14, marginTop: 14,
  },
  reviseAText: { fontSize: 14, color: COLORS.text, lineHeight: 21, fontWeight: '600' },
  progressBar: {
    height: 14, backgroundColor: COLORS.border, borderRadius: 999,
    overflow: 'hidden', marginBottom: 12,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 999 },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8, paddingHorizontal: 8,
    borderTopWidth: 2, borderTopColor: COLORS.border,
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
  },
  navItem: {
    alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 12, minWidth: 64,
  },
  navItemActive: { backgroundColor: '#F0FFE5' },
  navLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '800', marginTop: 2 },

  // FAB
  fabWrap: {
    position: 'absolute', bottom: 110, right: 16, zIndex: 50,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 6,
  },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },

  // Form fields
  fieldLabel: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '800',
    letterSpacing: 0.4, marginBottom: 6,
  },
  input: {
    borderWidth: 2, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    fontWeight: '700', color: COLORS.text, backgroundColor: 'white',
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  choiceChip: {
    borderWidth: 2, borderColor: COLORS.border, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 6,
  },
  choiceChipText: { fontWeight: '800', fontSize: 12, color: COLORS.text },
  toggleBtn: {
    paddingVertical: 10, marginBottom: 8,
    borderTopWidth: 2, borderTopColor: COLORS.border,
    borderBottomWidth: 2, borderBottomColor: COLORS.border,
  },
  flashEdit: {
    backgroundColor: COLORS.panel, borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 12, padding: 10, marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
  },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 6, marginRight: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // API cards
  apiCard: {
    backgroundColor: 'white', borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  apiName: { fontWeight: '800', fontSize: 16, color: COLORS.text, marginBottom: 4 },
  apiSignature: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 11, color: COLORS.textLight, lineHeight: 17, marginBottom: 4,
    flexWrap: 'wrap',
  },

  // Search
  searchSection: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '800',
    letterSpacing: 0.5, marginTop: 12, marginBottom: 4,
  },
  searchResult: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12,
  },
  searchResultName: { fontWeight: '800', fontSize: 15, color: COLORS.text },
  searchResultMeta: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },

  // Reference / link cards
  refCard: {
    flexDirection: 'row', backgroundColor: 'white',
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: 16, marginBottom: 10, overflow: 'hidden',
  },
  ytThumb: {
    width: 110, height: 72,
    backgroundColor: '#000',
  },
  refCardBody: {
    flex: 1, padding: 10, justifyContent: 'center',
  },
  refTitle: {
    fontWeight: '800', fontSize: 14, color: COLORS.text, lineHeight: 20,
  },
  refUrl: {
    fontSize: 11, color: COLORS.textLight, fontWeight: '600', marginTop: 3,
  },
  ytBadge: {
    backgroundColor: '#FF0000', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  ytBadgeText: { color: 'white', fontSize: 10, fontWeight: '800' },
  ytTimeBadge: {
    backgroundColor: '#1a1a1a', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  ytTimeTxt: { color: 'white', fontSize: 10, fontWeight: '800' },

  // Time stepper
  stepperRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.panel, borderRadius: 14,
    borderWidth: 2, borderColor: COLORS.border,
    paddingVertical: 10, paddingHorizontal: 14, gap: 4,
  },
  stepperUnit: { alignItems: 'center', minWidth: 44 },
  stepperBtn: {
    backgroundColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  stepperArrow: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  stepperVal: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginVertical: 4, minWidth: 34, textAlign: 'center' },
  stepperLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textLight, letterSpacing: 0.5 },
  stepperSep: { fontSize: 22, fontWeight: '800', color: COLORS.textLight, marginHorizontal: 2, marginBottom: 14 },
  stepperClear: {
    marginLeft: 'auto', backgroundColor: COLORS.red + '22',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  stepperClearTxt: { fontSize: 12, fontWeight: '800', color: COLORS.red },
  linkIconWrap: {
    width: 64, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.panel,
  },

  // YouTube player modal
  ytCloseBtn: {
    position: 'absolute', top: 44, right: 16, zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  ytCloseTxt: { color: 'white', fontWeight: '800', fontSize: 14 },
  ytHint: {
    textAlign: 'center', color: 'rgba(255,255,255,0.5)',
    fontSize: 12, fontWeight: '600',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  ytLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#111',
  },
});
