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

  const seniorInterview = mk('JavaScript + React Senior Interview', 'frontend', null, {
    definition:
      'A focused senior interview revision set covering JavaScript runtime fundamentals, async behavior, browser events, and React rendering concepts.',
    codeExample:
      "Promise.resolve().then(() => console.log('microtask'));\nsetTimeout(() => console.log('callback'), 0);\n\nfunction outer() {\n  let count = 0;\n  return () => ++count;\n}",
    flashcards: [
      card('What are Global Execution Context and Function Execution Context?', `JavaScript executes code inside execution contexts.

Global Execution Context is created when JavaScript starts. It contains global variables, global functions, the this reference, memory creation phase, and code execution phase.

Function Execution Context is created whenever a function is invoked. It has its own memory, variables, parameters, inner functions, scope chain, and this binding.

Every execution context runs in memory creation phase and code execution phase, and the call stack manages these contexts.`),
      card('What are Memory Phase and Execution Phase?', `Every execution context runs in two phases.

Memory Creation Phase allocates memory for variables, functions, and parameters. var variables start as undefined, and function declarations are stored completely.

Execution Phase runs code line by line and assigns actual values.

\`\`\`js
var a = 10;
// Memory phase: a = undefined
// Execution phase: a = 10
\`\`\``),
      card('What is Lexical Environment?', `Lexical means where code is physically written.

Every execution context contains local memory plus a reference to the outer lexical environment. JavaScript uses lexical scoping, so inner functions can access variables from outer functions.

\`\`\`js
function outer() {
  let a = 10;

  function inner() {
    console.log(a);
  }

  inner();
}
\`\`\``),
      card('What is Closure?', `A closure is a function bundled together with its lexical environment.

It lets a function remember outer-scope variables even after the outer function has finished.

\`\`\`js
function outer() {
  let counter = 0;

  return function inner() {
    counter++;
    console.log(counter);
  };
}

const fn = outer();
fn(); // 1
fn(); // 2
\`\`\`

Used in debouncing, memoization, React hooks, data privacy, and timers.`),
      card('What is Debouncing?', `Debouncing delays function execution until the user stops triggering events for a specified time.

Used in search bars, resize handlers, and API optimization.

\`\`\`js
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
\`\`\`

Closure preserves the timer variable between calls.`),
      card('How does this work in JavaScript?', `this depends on how a function is invoked, not where it is written.

In a normal function called directly in browser non-strict mode, this is window. In an object method, this refers to the object before the dot. Arrow functions do not create their own this; they inherit lexical this from the surrounding scope.

\`\`\`js
const user = {
  name: 'Vikil',
  greet() {
    console.log(this.name);
  },
};
\`\`\``),
      card('What is the difference between call, apply, and bind?', `call executes immediately with comma-separated arguments.

\`\`\`js
fn.call(thisArg, arg1, arg2);
\`\`\`

apply executes immediately with arguments passed as an array.

\`\`\`js
fn.apply(thisArg, [arg1, arg2]);
\`\`\`

bind returns a new function and does not execute immediately.

\`\`\`js
const boundFn = fn.bind(thisArg);
\`\`\``),
      card('What is Prototype in JavaScript?', `Prototype is an object from which other objects inherit properties and methods.

Every object has an internal prototype reference. Arrays can use methods such as map because they are available on Array.prototype.

\`\`\`js
const arr = [1, 2, 3];
arr.map((n) => n * 2);
\`\`\``),
      card('What is Prototype Chain?', `When a property is not found directly on an object, JavaScript searches upward through linked prototypes. This lookup process is the prototype chain.

\`\`\`js
const user = { name: 'Vikil' };
user.toString(); // found on Object.prototype
\`\`\``),
      card('What is Object Delegation?', `Objects delegate property lookup to prototype objects.

\`\`\`js
const animal = {
  eat() {
    console.log('Eating');
  },
};

const dog = Object.create(animal);
dog.eat();
\`\`\`

React class components also use prototype delegation. Methods such as setState come from React.Component.prototype.`),
      card('What is Event Bubbling?', `Event bubbling means an event travels upward from the target element to its ancestors.

\`\`\`js
parent.addEventListener('click', () => console.log('Parent'));
child.addEventListener('click', () => console.log('Child'));

// Click child:
// Child
// Parent
\`\`\``),
      card('What is Event Capturing?', `Event capturing travels from the top ancestor down to the target element.

Enable it by passing true as the third addEventListener argument.

\`\`\`js
parent.addEventListener('click', handler, true);
\`\`\`

The flow is parent first, then child.`),
      card('What is Event Delegation?', `Event delegation attaches one listener to a parent instead of adding listeners to many children. It uses event bubbling.

\`\`\`js
ul.addEventListener('click', (e) => {
  console.log(e.target);
});
\`\`\`

Benefits: better performance, less memory usage, and support for dynamic elements. React internally uses event delegation.`),
      card('What is a Promise?', `A Promise is an object representing the eventual completion or failure of an async operation.

States: pending, fulfilled, and rejected.

\`\`\`js
const promise = new Promise((resolve, reject) => {
  resolve('Success');
});
\`\`\``),
      card('Why do Promise callbacks execute before setTimeout?', `Promise callbacks go into the microtask queue. setTimeout callbacks go into the callback queue. The event loop gives microtasks higher priority.

\`\`\`js
console.log(1);

setTimeout(() => console.log(2));

Promise.resolve().then(() => console.log(3));

console.log(4);
// 1, 4, 3, 2
\`\`\``),
      card('How does async/await work internally?', `async/await is syntactic sugar over Promises.

async functions always return a Promise. await pauses execution of the current async function until the Promise settles, but it does not block the JavaScript thread.

\`\`\`js
async function test() {
  const data = await fetch('/api');
  console.log(data);
}
\`\`\``),
      card('What is Virtual DOM?', 'Virtual DOM is a lightweight JavaScript representation of the real DOM. React creates a virtual tree, compares it with the previous tree, and updates only the changed parts of the real DOM.'),
      card('What is Reconciliation in React?', 'Reconciliation is the process of comparing the old Virtual DOM with the new Virtual DOM so React can identify the minimal real DOM updates needed.'),
      card('Why are keys important in React?', `Keys help React identify elements efficiently during reconciliation. They should be stable and unique among siblings.

Using index as key is risky, especially when items can be inserted, deleted, or reordered.

\`\`\`jsx
items.map((item) => <Row key={item.id} item={item} />);
\`\`\``),
      card('What is React Fiber?', `React Fiber is React's reconciliation engine. It breaks rendering work into small interruptible units.

Fiber enables scheduling, prioritization, interruptible rendering, and concurrent features.

Render phase calculates changes and can pause or resume. Commit phase updates the real DOM and cannot pause.`),
      card('What is useEffect?', `useEffect handles side effects in React, such as API calls, subscriptions, timers, and event listeners.

Effects run after the commit phase.

\`\`\`js
useEffect(() => {
  console.log('Effect');
}, []);
\`\`\``),
      card('How does the dependency array work?', `React shallowly compares dependencies. The effect runs when a dependency value changes.

\`\`\`js
useEffect(() => {
  sync(count);
}, [count]);
\`\`\`

Objects and functions often create new references, which can cause repeated effects if they are dependencies.`),
      card('When does a cleanup function run?', `Cleanup runs before the next effect execution and during component unmount.

\`\`\`js
useEffect(() => {
  const id = setInterval(() => {}, 1000);
  return () => clearInterval(id);
}, []);
\`\`\``),
      card('What is stale closure in React?', `Effects capture variables from the render where they were created.

\`\`\`js
useEffect(() => {
  setInterval(() => {
    console.log(count);
  }, 1000);
}, []);
\`\`\`

This effect always sees the old count value because count was captured from the initial render.`),
      card('What is batching in React?', `Batching means React combines multiple state updates into a single render.

\`\`\`js
setCount(1);
setName('Vikil');
\`\`\`

React can process these together instead of rendering after each update.`),
      card('Why does setState feel asynchronous?', `React queues updates instead of changing state immediately. The current render snapshot remains unchanged.

\`\`\`js
setCount(count + 1);
console.log(count); // old value from this render
\`\`\``),
      card('Why are functional updates important?', `Functional updates use the latest state from React's update queue and avoid stale snapshots.

\`\`\`js
setCount((c) => c + 1);
\`\`\`

They are important when next state depends on previous state.`),
      card('What is startTransition?', `startTransition marks updates as low-priority so urgent updates, like typing, stay responsive.

\`\`\`js
startTransition(() => {
  setBigList(data);
});
\`\`\``),
      card('What is useMemo?', `useMemo memoizes expensive calculations and recalculates only when dependencies change.

\`\`\`js
const result = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
\`\`\`

Use it for expensive work or stable derived references, not every small expression.`),
      card('What is useCallback?', `useCallback memoizes function references.

It is useful when a memoized child component depends on function prop identity.

\`\`\`js
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
\`\`\``),
      card('What is React.memo?', `React.memo prevents unnecessary component re-renders when props have not changed.

\`\`\`js
export default React.memo(Component);
\`\`\`

It uses shallow prop comparison by default.`),
      card('What is Suspense in React?', `Suspense lets React show fallback UI while waiting for async work such as lazy loading, data fetching, or streaming UI.

\`\`\`jsx
<Suspense fallback={<Loader />}>
  <Dashboard />
</Suspense>
\`\`\``),
      card('What is the difference between SSR, CSR, and SSG?', `CSR renders in the browser.

SSR generates HTML on the server for each request.

SSG generates HTML at build time and serves static pages.`),
      card('What is Hydration?', 'Hydration is the process where React attaches event listeners and client behavior to server-rendered HTML. It is commonly used in SSR frameworks like Next.js.'),
      card('What is Concurrent Rendering?', 'Concurrent Rendering lets React pause rendering, resume rendering, and prioritize updates. It is enabled by Fiber architecture. React is not multi-threaded; concurrent means interruptible scheduling.'),
    ],
  });
  skills.push(seniorInterview);

  const microfrontendInterview = mk('Microfrontends Interview', 'frontend', null, {
    definition:
      'A focused revision set for microfrontend interview preparation, covering architecture, Module Federation, routing, communication, state, CSS isolation, performance, testing, and enterprise trade-offs.',
    codeExample:
      "const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');\n\nplugins: [\n  new ModuleFederationPlugin({\n    name: 'dashboard',\n    filename: 'remoteEntry.js',\n    exposes: {\n      './Dashboard': './src/Dashboard',\n    },\n    shared: {\n      react: { singleton: true },\n      'react-dom': { singleton: true },\n    },\n  }),\n];",
    whenUsed:
      'Used in large frontend platforms where multiple teams own separate business domains and need independent build, release, and scaling boundaries.',
    gotchas:
      'Microfrontends add operational complexity. Watch for shared dependency conflicts, duplicated bundles, route ownership issues, CSS leakage, auth boundaries, observability gaps, and tightly coupled shared state.',
    flashcards: [
      card('What is a Microfrontend?', 'Microfrontend is an architectural approach where a frontend application is split into smaller independent frontend applications. Each team can build, deploy, and maintain its own part independently. Examples include Dashboard App, Payment App, Profile App, and Cart App combined inside a shell/container app.'),
      card('Why do companies use Microfrontends?', 'Companies use microfrontends for independent deployments, faster development, team autonomy, better scalability, easier maintenance, and domain-based ownership. They are common in banking systems, e-commerce, enterprise SaaS, and OTT platforms.'),
      card('What is the difference between Monolithic Frontend and Microfrontend?', 'A monolithic frontend is one large application with one codebase and one deployment, which can become hard to scale. A microfrontend system has multiple independent apps with independent deployment, team ownership, and better scalability.'),
      card('What is a Shell/Container Application?', 'The shell app is the main host application that loads remote microfrontends. It commonly owns routing, authentication, layout, shared state, and navigation. For example, the host app can load dashboard, cart, and payment remotes.'),
      card('What are Remote Applications in Microfrontend?', 'Remote apps are independently deployed frontend applications loaded dynamically into the host app. Examples are dashboard.company.com and cart.company.com. Each remote can have a separate repo, separate deployment, and separate CI/CD pipeline.'),
      card('What is Module Federation?', 'Module Federation is a Webpack 5 feature that allows applications to share modules dynamically at runtime. It supports dynamic imports, shared dependencies, independent deployment, and runtime integration, making it a popular modern microfrontend approach.'),
      card('Explain Module Federation Architecture.', 'In Module Federation, the host app consumes remote applications and the remote app exposes components or modules. The host loads remoteEntry.js at runtime and then imports remote components from it.'),
      card('Example of Module Federation Remote Configuration.', `A remote exposes modules and declares shared dependencies.

\`\`\`js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

plugins: [
  new ModuleFederationPlugin({
    name: 'dashboard',
    filename: 'remoteEntry.js',
    exposes: {
      './Dashboard': './src/Dashboard',
    },
    shared: {
      react: { singleton: true },
      'react-dom': { singleton: true },
    },
  }),
];
\`\`\``),
      card('Example of Host Configuration in Module Federation.', `The host declares remotes by name and URL.

\`\`\`js
remotes: {
  dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
}
\`\`\``),
      card('How do you consume remote components?', `Use dynamic import with React.lazy and Suspense.

\`\`\`jsx
const Dashboard = React.lazy(() => import('dashboard/Dashboard'));

<Suspense fallback={<div>Loading...</div>}>
  <Dashboard />
</Suspense>
\`\`\``),
      card('What is remoteEntry.js?', 'remoteEntry.js is the manifest file generated by Module Federation. It contains exposed modules, dependency mapping, and runtime loading information. The host app loads this file to access remote modules.'),
      card('What are shared dependencies?', 'Shared dependencies prevent duplicate libraries from loading multiple times. Common examples are React, ReactDOM, and Redux. Without sharing, each app can load its own React copy; with sharing, a single React instance can be used.'),
      card('What does singleton:true mean?', 'singleton:true ensures only one instance of a library exists across all microfrontends. It is useful for React, ReactDOM, Redux, and other libraries where duplicate instances can break hooks, context, or shared state.'),
      card('What are different ways to implement Microfrontends?', 'Common approaches are build-time integration, runtime integration, iframe-based integration, Web Components, Module Federation, and Single SPA.'),
      card('Explain Build-Time Integration.', 'Build-time integration means applications are integrated during build time, such as installing app1 and app2 as npm packages. It is simpler, but it removes independent deployment and creates tighter coupling.'),
      card('Explain Runtime Integration.', 'Runtime integration means applications are loaded dynamically while the app is running. It enables independent deployment and better scalability, so most modern microfrontend systems prefer runtime integration.'),
      card('Explain Iframe-based Microfrontends.', `Iframe-based microfrontends embed an app with an iframe.

\`\`\`html
<iframe src="https://payments.company.com"></iframe>
\`\`\`

Pros: complete isolation and independent tech stack. Cons: poor communication, SEO issues, weaker UX, and performance problems.`),
      card('Explain Web Components in Microfrontends.', `Web Components use native browser APIs to create reusable custom HTML elements.

\`\`\`js
class UserCard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h1>User</h1>';
  }
}

customElements.define('user-card', UserCard);
\`\`\``),
      card('What is Single SPA?', 'Single SPA is a microfrontend orchestration framework. It supports using React, Angular, and Vue together, and handles routing, mounting apps, and lifecycle management.'),
      card('How do Microfrontends communicate?', 'Microfrontends can communicate through props, custom events, a shared Redux store, RxJS, URL params, localStorage, or an event bus. Prefer loose contracts and avoid tight coupling between domains.'),
      card('Explain Event Bus Communication.', `One app publishes an event and another subscribes to it.

\`\`\`js
window.dispatchEvent(
  new CustomEvent('cartUpdated', {
    detail: { count: 5 },
  })
);

window.addEventListener('cartUpdated', (event) => {
  console.log(event.detail.count);
});
\`\`\``),
      card('What are routing challenges in Microfrontends?', 'Common routing challenges are nested routing, route ownership, and route conflicts. Usually the shell controls top-level routing, while remotes control their internal routing.'),
      card('How do you avoid CSS conflicts?', 'Use CSS Modules, Tailwind CSS, Shadow DOM, CSS-in-JS, or disciplined naming conventions. CSS conflicts happen when two apps define the same global selector, such as .button, with different styles.'),
      card('What are performance challenges in Microfrontends?', 'Challenges include large JS bundles, too many network requests, and duplicate dependencies. Solutions include lazy loading, code splitting, CDN caching, dependency sharing, and prefetching.'),
      card('How does authentication work in Microfrontends?', 'Usually the shell app handles login, token refresh, and session management. Remotes consume auth state from the shell through a shared contract, context, API client, or event mechanism.'),
      card('How is state managed in Microfrontends?', 'State can be managed with Redux, Zustand, Context API, RxJS, or an event bus. The key principle is to avoid over-coupling apps through shared global state.'),
      card('What are the testing challenges in Microfrontends?', 'Microfrontends need unit testing, integration testing, contract testing, and E2E testing. Common tools include Jest, Cypress, and Playwright. Contract tests help ensure remotes and hosts continue to integrate correctly.'),
      card('What is SSR in Microfrontends?', 'SSR means Server Side Rendering. It can improve SEO, first paint, and perceived performance, but it adds challenges around hydration, shared runtime complexity, and coordinating independently deployed fragments.'),
      card('Explain Monorepo vs Polyrepo.', 'A monorepo keeps host, cart, dashboard, and other apps in one repository, making sharing and dependency management easier but creating a larger repo. A polyrepo uses separate repositories, giving more independence but making coordination harder.'),
      card('What is Nx in Microfrontends?', 'Nx is a monorepo management tool with shared libraries, incremental builds, dependency graphs, microfrontend tooling, and build caching. It is useful for coordinating large frontend workspaces.'),
      card('What are the biggest challenges in Microfrontends?', 'The biggest challenges are shared state, routing, dependency conflicts, CSS conflicts, authentication, performance, CI/CD complexity, and governance.'),
      card('When should you NOT use Microfrontends?', 'Avoid microfrontends for a small project, small team, startup MVP, or simple dashboard. They increase operational complexity, deployment complexity, and debugging difficulty.'),
      card('When should you use Microfrontends?', 'Use microfrontends for large teams, enterprise applications, independent business domains, frequent deployments, and frontend scaling problems. They are most valuable when team and deployment independence matter.'),
      card('What are the advantages of Microfrontends?', 'Advantages include independent deployments, team autonomy, scalability, better maintainability, faster releases, and tech flexibility.'),
      card('What are the disadvantages of Microfrontends?', 'Disadvantages include complex architecture, difficult debugging, version conflicts, performance overhead, and operational complexity.'),
      card('Explain Lazy Loading in Microfrontends.', `Lazy loading loads components only when needed.

\`\`\`js
const Cart = React.lazy(() => import('cart/Cart'));
\`\`\`

Benefits include faster initial load and reduced initial bundle size.`),
      card('What is code splitting in Microfrontends?', 'Code splitting divides bundles into smaller chunks loaded on demand. This improves performance by reducing the initial bundle and loading feature code only when needed.'),
      card('Explain dependency version conflicts.', 'A dependency version conflict happens when independently shipped apps load incompatible versions of a shared package. With React, the worst case is multiple React copies on the page, which can break hooks and context. Use shared dependency governance, compatible version ranges, and Module Federation singleton configuration for true singletons.'),
      card('What is a Design System in Microfrontends?', 'A design system is a shared reusable UI system containing buttons, inputs, typography, themes, and colors. It helps maintain UI consistency and speeds up development across independently owned apps.'),
      card('What are enterprise concerns in Microfrontends?', 'Enterprise concerns include CI/CD, monitoring, logging, security, governance, shared design systems, and versioning. These must be planned early because microfrontends increase platform coordination needs.'),
      card('Which companies use Microfrontends?', 'Commonly cited examples include Spotify, IKEA, Zalando, and DAZN. The exact architecture differs by company, but the shared theme is independent frontend ownership at scale.'),
      card('What is the relationship between Microservices and Microfrontends?', 'Microservices split the backend into services, while microfrontends split the frontend into domain applications. Both aim for independence, scalability, and team ownership.'),
      card('What are the most important topics to learn in Microfrontends?', 'Important topics are Module Federation, shared state, runtime integration, routing, SSR, dependency sharing, performance optimization, Nx monorepo, and CI/CD.'),
      card('Explain a real-world Microfrontend architecture.', 'A real-world setup can have a shell app responsible for authentication, navbar, and routing. Remote apps can include Dashboard, Payments, Profile, and Reports. Communication may use shared auth, event bus, and a shared design system, with independent CI/CD pipelines.'),
      card('What interview questions are commonly asked in Microfrontends?', 'Common questions include Module Federation, monolith vs microfrontend, state sharing, routing, CSS conflict solutions, authentication, dependency sharing, runtime vs build-time integration, SSR challenges, and performance optimizations.'),
    ],
  });
  skills.push(microfrontendInterview);

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

  // JS Engine & Runtime Internals
  const jsEngine = mk('JS Engine & Runtime Internals', 'frontend', js.id, {
    definition:
      'The JS engine parses source code into an AST, runs it through an interpreter for fast startup, then JIT-compiles hot code paths into optimized machine code. V8 uses hidden classes and inline caching to make dynamic object access fast.',
    codeExample:
      'const user1 = { name: "A", age: 20 };\nconst user2 = { name: "B", age: 30 };\n// Both share the same hidden class — engine reuses optimization\n\n// Bad pattern: dynamic additions create new hidden classes each time\nconst obj = {};\nobj.name = "A";\nobj.age = 20;\nobj.city = "Mumbai";',
    flashcards: [
      card('What is AST?', 'Abstract syntax tree representation of source code used by the parser and tools'),
      card('Why does the V8 engine use an interpreter first?', 'Fast startup and immediate execution'),
      card('What is JIT?', 'Runtime compilation of hot code into optimized machine code'),
      card('What is deoptimization?', 'Discarding optimized code when engine assumptions fail'),
      card('What are hidden classes and why do they exist?', 'Hidden classes optimize dynamic JS objects for faster property access. The CPU likes fixed structures, but JS objects are dynamic. The engine secretly creates hidden classes so objects with the same shape share the same optimized structure. Dynamic property additions create new hidden classes and hurt optimization.'),
    ],
  });
  skills.push(jsEngine);

  skills.push(
    mk('Full internal flow', 'frontend', jsEngine.id, {
      definition: 'Source code → tokenizer → AST → interpreter (Ignition) → profiler identifies hot code → JIT compiler (TurboFan) → optimized machine code. Deoptimization occurs when type assumptions break.',
      codeExample:
        'function add(a, b) { return a + b; }\n\nadd(1, 2);     // interpreter runs\nadd(3, 4);     // still interpreter\nadd(5, 6);     // profiler marks as "hot"\nadd(7, 8);     // TurboFan compiles optimized version\nadd("x", "y"); // type assumption broken → deoptimize',
      flashcards: [
        card('What is inline caching?', 'After repeated property access on the same hidden class, the engine caches the memory offset so future lookups skip the lookup entirely and become extremely fast.'),
        card('How do hidden classes, inline caching, and JIT work together?', 'They combine to give JS near-native speed: hidden classes enable inline caching, inline caching feeds the JIT compiler with type information for optimal machine code generation.'),
      ],
    })
  );

  // Execution Context
  skills.push(
    mk('Execution Context', 'frontend', js.id, {
      definition:
        'Execution context is the environment in which JS code executes. It contains variables, functions, scope information, the this binding, and memory references. Think of it as a box containing everything needed to run a piece of code.',
      codeExample:
        'function add(a, b) {\n  return a + b;\n}\nadd(10, 20);\n// Calling add() creates a Function Execution Context containing:\n// - a, b parameters\n// - local variables\n// - scope chain reference',
      flashcards: [
        card('What is the execution context?', 'The environment in which JS code executes — contains variables, functions, scope information, this, and memory references.'),
        card('What are the types of execution context?', '1. Global Execution Context (GEC): created when JS program starts, only one exists. 2. Function Execution Context (FEC): created whenever a function is called, containing its parameters, local variables, and scope chain.'),
        card('How does the execution context work internally?', 'Every execution context has 2 phases: 1. Memory creation phase 2. Execution phase'),
        card('What happens in the memory creation phase?', 'JS scans code before execution. var variables are allocated and initialized with undefined. Function declarations are fully stored in memory.'),
        card('What happens in the execution phase?', 'Code is executed line by line, assigning actual values to variables and running function bodies.'),
      ],
    })
  );

  // What is JavaScript
  skills.push(
    mk('What is JavaScript', 'frontend', js.id, {
      definition:
        'JavaScript is a high-level, single-threaded, interpreted/JIT-compiled, garbage-collected, prototype-based programming language. Created in 1995 by Brendan Eich, it was built to add interactivity and dynamic behavior to web pages alongside HTML and CSS.',
      codeExample:
        "// JS is single-threaded — one call stack\nconsole.log('Start');\n\nsetTimeout(() => console.log('Macro (callback queue)'), 0);\n\nPromise.resolve().then(() => console.log('Micro (microtask queue)'));\n\nconsole.log('End');\n// Output: Start → End → Micro → Macro",
      whenUsed:
        'Foundation for every JavaScript topic — understanding what JS is helps explain why async works the way it does, why single-threaded code can still be non-blocking, and why engines like V8 exist.',
      gotchas:
        'JS is single-threaded but not blocking — async is handled by the runtime (Browser APIs + event loop), not the language itself.\nJIT compilation means JS is neither purely interpreted nor purely compiled.\nGarbage collection is automatic but not instant — memory leaks still happen.',
      flashcards: [
        card('Is JavaScript single-threaded?', 'Yes. JavaScript executes one operation at a time using a single call stack. Only one piece of code runs at any given moment.'),
        card('If JavaScript is single-threaded, how does async work?', `Async behavior is handled by the runtime environment, not by JavaScript alone. The runtime provides:

1. Browser APIs (fetch, setTimeout, DOM events) — handled outside the JS thread
2. Callback Queue — macrotask callbacks waiting to enter the call stack
3. Microtask Queue — Promise callbacks, higher priority than callback queue
4. Event Loop — continuously checks if the call stack is empty, then pushes callbacks in

JavaScript delegates the waiting to the browser/Node.js and resumes when results arrive.`),
        card('Is JavaScript interpreted or compiled?', `Modern JavaScript engines use JIT (Just-In-Time) compilation, so JavaScript is both.

The engine first interprets code for fast startup, then identifies hot code paths and compiles them to optimized machine code at runtime.

So JavaScript is:
- Interpreted initially (fast startup)
- JIT compiled for hot paths (fast execution)`),
        card('What is JavaScript, summarized?', `JavaScript is:
- High-level (abstracts memory, hardware)
- Single-threaded (one call stack)
- Interpreted / JIT compiled (both, via engine)
- Garbage collected (automatic memory management)
- Prototype-based (inheritance via prototype chain)

Used to build: web apps, mobile apps, backend systems, desktop apps, and embedded systems.`),
        card('Why was JavaScript created?', `Before JavaScript: HTML gave structure, CSS gave styling, but websites had no interactivity.

In 1995, Brendan Eich created JavaScript to add:
- Interactivity (click handlers, animations)
- Dynamic updates (show/hide content)
- User actions (form validation, events)
- API calls (fetch data without page reload)

JavaScript was designed to run in the browser alongside HTML and CSS.`),
        card('What is a JS Engine?', `JavaScript cannot run directly on a machine. It needs a JavaScript engine.

A JS engine:
1. Reads the source code
2. Parses it into an AST
3. Compiles it (JIT)
4. Executes it
5. Optimizes hot code paths

Examples:
- Chrome → V8
- Firefox → SpiderMonkey
- Safari → JavaScriptCore`),
        card('What is a Compiler?', `A compiler converts the entire source code into machine code before execution.

Process: Source code → [compiler] → machine code → execute

Characteristics:
- Conversion happens once before running
- Faster execution because no runtime translation
- Errors caught at compile time

Examples: C, Java (to bytecode), Rust`),
        card('What is an Interpreter?', `An interpreter executes source code line by line during runtime, without a separate compilation step.

Process: Source code → read one line → execute → read next line → execute

Characteristics:
- No separate compile step
- Slower than compiled code
- Errors found at runtime during execution

Examples: Old JavaScript engines, Python`),
      ],
    })
  );

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

  // Added by Claude Code audit — 2026-05-20

  // React.js — additional top-level flashcards
  react.flashcards.push(
    card('What does useLayoutEffect do that useEffect cannot?', 'It fires synchronously after DOM mutations but before paint, making it safe for measuring DOM dimensions without visual flicker.'),
    card('How does React 18 automatic batching differ from React 17?', 'React 18 batches state updates inside async callbacks, timeouts, and native event handlers — not just synthetic event handlers as before.'),
    card('What is the purpose of useImperativeHandle?', 'It customises the ref value a parent receives via forwardRef, exposing only the imperative API surface you intend.'),
    card('Why can context not replace a state manager for high-frequency updates?', 'Every context consumer re-renders on value reference change; purpose-built stores like Zustand/Redux use subscriptions that re-render only affected slices.'),
    card('What triggers a React render that is NOT setState?', 'Context value change, parent re-render (unless memoised), and forceUpdate — understanding all three prevents surprise renders.'),
  );

  // React.js — additional APIs
  react.apis.push(
    api('useLayoutEffect', 'useLayoutEffect(effect: () => void | (() => void), deps?)', 'Fires synchronously after DOM mutations and before browser paint; use for layout measurement.', 'effect and optional deps', 'void', "useLayoutEffect(() => {\n  const { height } = ref.current.getBoundingClientRect();\n  setHeight(height);\n}, []);", 'Calling setState inside without a guard causes infinite re-renders.'),
    api('useTransition', 'const [isPending, startTransition] = useTransition()', 'Marks state updates as non-urgent so urgent renders (typing) are not blocked.', 'none', '[isPending boolean, startTransition fn]', "const [isPending, startTransition] = useTransition();\nstartTransition(() => setTab('results'));", 'startTransition callback must be synchronous.'),
    api('useDeferredValue', 'useDeferredValue<T>(value: T): T', 'Returns a deferred copy of a value that lags behind when the UI is busy.', 'value to defer', 'deferred value', 'const deferredQuery = useDeferredValue(query);', 'Does not guarantee a fixed delay — React decides when to update.'),
  );

  // React — Components & Props sub-topic: add specific flashcards
  reactComponents.flashcards.push(
    card('What is the children prop and when is it preferable to named slots?', 'children is the implicit composition slot for arbitrary subtrees; it keeps parent markup clean when content is unknown at design time.'),
    card('Why does prop drilling become a maintainability problem?', 'Intermediate components receive props only to pass them down, coupling unrelated layers and making refactoring expensive.'),
  );

  // Next.js sub-topics — replace boilerplate by adding specific cards alongside existing ones
  // (existing generic cards stay; these add real content per sub-topic)
  // We push to individual sub-topic nodes by referencing the skills array positions.
  // The Next.js forEach-generated sub-topics are at the end of the next section;
  // we identify them by name after they were pushed.
  skills.forEach((s) => {
    if (s.parentId !== next.id) return;
    const specific = {
      'App Router fundamentals': [
        card('What is the difference between page.tsx and route.ts in App Router?', 'page.tsx renders UI for a URL segment; route.ts defines HTTP handlers (GET/POST etc.) for that segment — they cannot coexist.'),
        card('Why does App Router use nested layouts instead of a single _app?', 'Nested layouts allow segment-level persistence, reducing re-renders when navigating between sibling pages that share a parent layout.'),
      ],
      'Server Components vs Client Components': [
        card('What is the one rule for importing between server and client components?', 'Server components can import client components, but client components cannot import server components — only pass them as props/children.'),
        card('Why does moving a component to "use client" increase bundle size?', 'All its transitive imports become part of the client bundle; large libraries pulled into client components ship to the browser unnecessarily.'),
      ],
      'Server Actions': [
        card('How do Server Actions handle progressive enhancement?', 'A <form> with a Server Action works without JavaScript because it falls back to a native HTML POST; JS enhances it with optimistic UI.'),
        card('What security check is mandatory inside a Server Action?', 'Auth/session validation — Server Actions are publicly callable endpoints; omitting checks allows unauthenticated mutation.'),
      ],
      'Routing (dynamic, parallel, intercepting, groups)': [
        card('What is a parallel route and when is it useful?', 'Parallel routes (@slot convention) render multiple independent pages in the same layout simultaneously, ideal for dashboards with independently loading panels.'),
        card('What problem do intercepting routes solve?', 'They show a route in a modal overlay on client navigation while rendering the full page on direct URL access — enabling photo-feed modal patterns.'),
      ],
      'Data Fetching & Caching': [
        card('What does `cache: "no-store"` on a fetch call mean in Next.js?', 'The request bypasses all caching and fetches fresh data on every render — equivalent to getServerSideProps behaviour.'),
        card('How does revalidateTag relate to fetch `tags` option?', 'You tag a fetch with `{ next: { tags: ["posts"] } }` and call revalidateTag("posts") in a Server Action to purge only those cached responses.'),
      ],
      'Layouts & Templates': [
        card('When is template.tsx the right choice over layout.tsx?', 'When you need components to remount on navigation (e.g., route-level animation triggers, resetting scroll position, or re-running effects per page visit).'),
        card('Can a layout.tsx read search params?', 'No — layouts do not re-render on search param changes; use a Client Component or page.tsx for search-param-dependent UI.'),
      ],
      'Loading & Error UI': [
        card('What React primitive does loading.tsx wrap route content with?', 'Suspense — Next.js automatically wraps the page segment in <Suspense fallback={<Loading />}>.'),
        card('What is the difference between error.tsx and global-error.tsx?', 'error.tsx catches errors in its segment and children; global-error.tsx catches errors in the root layout itself and must include <html>/<body>.'),
      ],
      'Middleware': [
        card('Where does Next.js middleware run?', 'At the edge, before the request reaches any route — it can rewrite, redirect, or set response headers without spinning up a full serverless function.'),
        card('What should middleware never do for performance?', 'Import heavy Node.js modules or perform slow I/O — middleware runs on every matching request and must stay lightweight.'),
      ],
      'API Routes / Route Handlers': [
        card('How does a Route Handler differ from a Server Action for mutations?', 'Route Handlers are standard HTTP endpoints callable from anywhere; Server Actions are tied to React rendering and called via RSC protocol from within the app.'),
        card('Why use NextResponse.json() over Response.json() in Route Handlers?', 'NextResponse extends Response with Next.js utilities like cookie helpers and rewrite support.'),
      ],
      'Performance (Image, Font, Script)': [
        card('What does next/font do at build time?', 'It downloads and self-hosts the font, generates a CSS variable, and eliminates the external font network request — preventing layout shift.'),
        card('Why is priority prop important on above-the-fold next/image?', 'It adds a <link rel="preload"> and disables lazy loading so the image fetches immediately, improving LCP score.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // Next.js — additional APIs
  next.apis.push(
    api('generateStaticParams', 'generateStaticParams(): Promise<Params[]>', 'Pre-generates dynamic route segments at build time for static rendering.', 'none — returns array of param objects', 'array of segment params', "export async function generateStaticParams() {\n  const posts = await getPosts();\n  return posts.map((p) => ({ slug: p.slug }));\n}", 'Runs at build time; must be exported from a dynamic segment page.'),
    api('generateMetadata', 'generateMetadata({ params, searchParams }): Promise<Metadata>', 'Dynamically generates <head> metadata per route segment.', 'route params and search params', 'Metadata object', "export async function generateMetadata({ params }) {\n  const post = await getPost(params.slug);\n  return { title: post.title };\n}", 'Must be in a Server Component file; cannot co-exist with static metadata export.'),
    api('next/link', '<Link href="...">children</Link>', 'Client-side navigation component with prefetching.', 'href, optional replace/prefetch/scroll props', 'anchor element with routing', '<Link href="/dashboard">Go</Link>', 'prefetch={false} reduces bandwidth on large nav menus.'),
  );

  // TypeScript — additional top-level flashcards
  ts.flashcards.push(
    card('What does the `infer` keyword do in conditional types?', 'It declares a type variable within the conditional pattern to extract and name a sub-type — e.g., `T extends Promise<infer U> ? U : T` extracts the resolved type.'),
    card('How does `never` enable exhaustive checking in switch statements?', 'Assign the default case to a variable typed `never`; if a union member is unhandled, TypeScript errors because the value cannot be assigned to never.'),
    card('What is the difference between `type` and `interface` for extension?', 'Interfaces support declaration merging; types use intersection (&). Interfaces are open (can be augmented); types are closed after declaration.'),
    card('Why is `keyof typeof obj` useful?', 'It derives a union of string literal keys from a runtime object without maintaining a separate type — useful for option maps and config objects.'),
  );

  // TypeScript — additional APIs
  ts.apis.push(
    api('NonNullable', 'NonNullable<T>', 'Removes null and undefined from a type.', 'T: possibly-nullable type', 'type without null/undefined', 'type Id = NonNullable<string | null>; // string', 'Does not deep-remove nullability from nested types.'),
    api('Exclude', 'Exclude<T, U>', 'Removes union members assignable to U from T.', 'T: source union, U: members to remove', 'filtered union type', "type Shape = 'circle' | 'square' | 'triangle';\ntype NoCircle = Exclude<Shape, 'circle'>;", 'Order matters: Exclude<T,U> not Exclude<U,T>.'),
    api('Extract', 'Extract<T, U>', 'Keeps only union members assignable to U.', 'T: source union, U: members to keep', 'filtered union type', "type Strings = Extract<string | number | boolean, string>;", 'Useful for narrowing event handler types from broad unions.'),
    api('infer', 'T extends SomeType<infer U> ? U : never', 'Declares a type variable inside a conditional type for extraction.', 'conditional type expression', 'inferred type', "type Unwrap<T> = T extends Promise<infer U> ? U : T;", 'Only valid inside conditional type extends clause.'),
  );

  // TypeScript sub-topics — add specific cards
  skills.forEach((s) => {
    if (s.parentId !== ts.id) return;
    const specific = {
      'Basic Types & Inference': [
        card('When does TypeScript widen a literal type to its base type?', 'When assigned to a `let` variable — `let x = "hello"` infers `string`, not `"hello"`. Use `const` or `as const` to preserve the literal.'),
        card('What does `strictNullChecks` change?', 'It makes null and undefined distinct types rather than assignable to everything, catching most null-dereference bugs at compile time.'),
      ],
      'Interfaces vs Types': [
        card('When does declaration merging with interfaces cause a bug?', 'When a third-party library merges into a global interface (like Window) and your code inadvertently depends on that merged shape elsewhere.'),
        card('Which supports mapped/conditional types — interface or type alias?', 'Only type aliases support computed/mapped/conditional type expressions; interfaces require explicit property declarations.'),
      ],
      'Generics': [
        card('What is a generic constraint and why use one?', '`<T extends SomeType>` limits the shapes T can take, letting you safely access properties of T without casting.'),
        card('Why do generic defaults exist?', 'They let callers omit type arguments when the default covers the common case: `function wrap<T = string>(v: T)`.'),
      ],
      'Utility Types': [
        card('What is the difference between Partial<T> and Required<T>?', 'Partial makes all properties optional; Required makes all properties mandatory (removes `?` modifiers).'),
        card('When is ReturnType useful in practice?', 'When you want to type a variable to the return value of a function without duplicating the type — especially for factory functions.'),
      ],
      'Discriminated Unions': [
        card('What makes a union "discriminated"?', 'A common literal property (the discriminant) that TypeScript can narrow on — e.g., `{ kind: "circle" }` vs `{ kind: "square" }`.'),
        card('How do you enforce exhaustive handling of a discriminated union?', 'Use a default branch that assigns to `never`: `const _: never = val` — compilation fails if a case is unhandled.'),
      ],
      'Type Narrowing & Guards': [
        card('What is the difference between `typeof` guard and `instanceof` guard?', '`typeof` narrows primitives; `instanceof` narrows class instances. Neither works for plain object shape discrimination — use a user-defined type guard.'),
        card('What does `is` keyword do in a type guard return type?', '`value is SomeType` tells TypeScript that when the function returns true, the parameter is narrowed to SomeType in the calling scope.'),
      ],
      'Conditional Types': [
        card('What is a distributive conditional type?', 'When T in `T extends U ? X : Y` is a naked type parameter, TypeScript distributes over union members: `string | number extends string ? ...` applies the condition to each member separately.'),
        card('How do you prevent distribution in a conditional type?', 'Wrap T in a tuple: `[T] extends [U] ? X : Y` — this disables distribution and treats the union as a whole.'),
      ],
      'Mapped Types': [
        card('How do you make all properties readonly with a mapped type?', '`{ readonly [K in keyof T]: T[K] }` — equivalent to the built-in `Readonly<T>`.'),
        card('What does `-?` mean in a mapped type?', 'It removes the optional modifier from each mapped property, making them all required.'),
      ],
      'Template Literal Types': [
        card('What is a practical use of template literal types?', 'Typing event name strings like `on${Capitalize<EventName>}` to derive handler prop names from a union of event names.'),
        card('Can template literal types combine two unions?', 'Yes — `type AB = \`${A}_${B}\`` produces a cross-product union of all A×B string combinations.'),
      ],
      'Module Declarations': [
        card('What is ambient declaration and when do you write one?', 'An ambient declaration (`declare module "x"`) tells TypeScript the shape of a module without providing an implementation — used when no @types package exists.'),
        card('How do you augment a third-party module type?', 'Create a .d.ts file with `declare module "library" { interface ExistingType { newProp: string } }` — declaration merging adds your property to the existing type.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // JavaScript ES6+ — additional top-level flashcards
  js.flashcards.push(
    card('What does structuredClone do that JSON.parse(JSON.stringify()) does not?', 'structuredClone handles circular references, Date objects, Maps, Sets, and ArrayBuffers correctly without the JSON round-trip lossy conversion.'),
    card('When does optional chaining (?.) differ from short-circuit &&?', 'Optional chaining stops at the first nullish value and returns undefined; && short-circuits on any falsy value including 0 and empty string.'),
    card('What are logical assignment operators (&&=, ||=, ??=)?', 'They combine a logical check with assignment: `a ||= b` only assigns b if a is falsy — useful for default-setting without re-triggering setters.'),
    card('Why is WeakMap useful for associating private data with DOM nodes?', 'Entries are garbage-collected when the key object is collected, avoiding memory leaks that a regular Map would cause by holding strong key references.'),
    card('How does a generator enable lazy infinite sequences?', 'It yields values on demand and suspends execution between yields, so it can produce values from an unbounded series without materialising them all.'),
  );

  // JavaScript ES6+ — additional APIs
  js.apis.push(
    api('Array.prototype.filter', 'arr.filter((value, index, array) => boolean)', 'Returns new array with items passing the predicate.', 'predicate callback', 'new filtered array', 'const active = users.filter((u) => u.active);', 'Does not mutate; returns empty array if nothing passes.'),
    api('Array.prototype.find', 'arr.find((value, index) => boolean)', 'Returns first item passing predicate, or undefined.', 'predicate callback', 'item or undefined', 'const admin = users.find((u) => u.role === "admin");', 'Returns undefined not null when nothing matches.'),
    api('Array.prototype.flat', 'arr.flat(depth?)', 'Flattens nested arrays by the given depth.', 'optional depth (default 1)', 'new flat array', 'const flat = [[1,2],[3,[4]]].flat(2);', 'Infinity depth fully flattens; be cautious with unknown structure.'),
    api('Promise.any', 'Promise.any(iterable)', 'Resolves with first fulfilled promise; rejects only if all fail.', 'iterable of promises', 'Promise<value>', "const fastest = await Promise.any([fetchA(), fetchB()]);", 'Rejects with AggregateError containing all rejection reasons.'),
    api('structuredClone', 'structuredClone(value, options?)', 'Deep clones a value using the structured clone algorithm.', 'value and optional transfer list', 'deep clone', 'const copy = structuredClone(complexObj);', 'Cannot clone functions, DOM nodes, or class instances (loses prototype).'),
  );

  // JavaScript ES6+ sub-topics — add specific cards
  skills.forEach((s) => {
    if (s.parentId !== js.id) return;
    const specific = {
      'Variables & Scoping': [
        card('What is the Temporal Dead Zone (TDZ)?', 'The span between entering a block scope and the let/const declaration line; accessing the variable in this zone throws a ReferenceError.'),
        card('Why prefer const over let by default?', 'It signals immutable binding intent, prevents accidental reassignment, and helps readers identify stable values without scanning further code.'),
      ],
      'Functions (arrow, this, closures)': [
        card('Why cannot arrow functions be used as constructors?', 'They do not have their own `this` binding or `prototype` property, so `new ArrowFn()` throws a TypeError.'),
        card('What is the difference between `.call()`, `.apply()`, and `.bind()`?', '.call and .apply invoke immediately with a given this (apply takes args as array); .bind returns a new function with this permanently bound.'),
      ],
      'Objects & Prototypes': [
        card('What is Object.create(proto) used for?', 'It creates an object with the specified prototype, enabling manual prototype chain setup without constructors or class syntax.'),
        card('Why does hasOwnProperty matter when iterating with for...in?', 'for...in traverses the full prototype chain; hasOwnProperty filters to only direct properties, avoiding unintended inherited key access.'),
      ],
      'Promises & Async/Await': [
        card('What happens if you await a non-Promise value?', 'It is wrapped in Promise.resolve() and the resolved value is returned immediately — await on a plain value is safe but unnecessary.'),
        card('Why is unhandled promise rejection dangerous in Node.js?', 'In recent Node versions it terminates the process; in browsers it surfaces as uncaught error. Always attach .catch() or use try/catch around await.'),
      ],
      'Iterators & Generators': [
        card('What contract must an iterator object fulfil?', 'It must have a `next()` method returning `{ value, done }` — generators implement this automatically.'),
        card('How do you make a custom class iterable?', 'Implement `[Symbol.iterator]()` returning an iterator object; then the class works in for...of, spread, and destructuring.'),
      ],
      'Destructuring, Spread & Rest': [
        card('What is the difference between rest in parameters and rest in destructuring?', 'Both collect remaining items, but parameter rest (`...args`) captures extra function arguments while destructuring rest (`const { a, ...rest } = obj`) captures remaining object/array elements.'),
        card('Can you destructure with default values?', 'Yes — `const { x = 0, y = 0 } = point` uses defaults only when the property is undefined, not when it is null or 0.'),
      ],
      'Modules (ESM vs CommonJS)': [
        card('Why can ESM imports be statically analysed but CJS require() cannot?', 'ESM import declarations are top-level and evaluated at parse time; require() is a runtime function call that can be conditional or dynamic.'),
        card('What is the dual package hazard in Node.js?', 'A package exposing both CJS and ESM entry points can end up with two separate module instances loaded — breaking instanceof checks and singleton state.'),
      ],
      'Classes': [
        card('What does a private class field (#field) do differently than a closure-based private?', 'It is enforced by the runtime (accessing from outside throws) and is accessible within the class body; closure-based private values exist only in the constructor scope.'),
        card('When should you use static class methods?', 'For factory methods, utility operations on the class type, and behaviour that does not need access to instance state.'),
      ],
      'Event Loop & Microtasks': [
        card('In what order do these run: setTimeout(fn,0), Promise.resolve().then(fn), queueMicrotask(fn)?', 'queueMicrotask and Promise.then both run in the microtask queue before the next macrotask, so both fire before setTimeout — order between the two microtasks is FIFO.'),
        card('Why can a long microtask chain starve the render pipeline?', 'The browser only paints between tasks (macrotasks); if microtasks keep scheduling more microtasks, the paint callback never gets a chance to run.'),
      ],
      'Array/Object methods': [
        card('What does Array.from do that the spread operator cannot?', 'Array.from accepts a mapFn second argument for immediate transformation, and handles array-like objects (e.g., NodeList) without needing iterable protocol support.'),
        card('Why is Object.assign shallow and when does that matter?', 'It copies own enumerable property references, so nested objects still share identity — mutations to nested values affect both source and target.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // HTML5 — additional APIs
  html.apis.push(
    api('localStorage / sessionStorage', 'localStorage.setItem(key, value) / getItem(key) / removeItem(key)', 'Persists string key-value pairs in the browser; localStorage survives tab close, sessionStorage does not.', 'string key and value', 'string or null', "localStorage.setItem('theme', 'dark');\nconst theme = localStorage.getItem('theme');", 'Values are always strings; JSON.stringify/parse required for objects.'),
    api('IntersectionObserver', 'new IntersectionObserver(callback, options)', 'Observes when elements enter or exit the viewport.', 'callback and threshold/root options', 'observer instance', "const io = new IntersectionObserver(([entry]) => {\n  if (entry.isIntersecting) load();\n});\nio.observe(lazyImg);", 'Disconnect observer when no longer needed to prevent leaks.'),
    api('ResizeObserver', 'new ResizeObserver(callback)', 'Fires when observed element dimensions change.', 'callback with ResizeObserverEntry[]', 'observer instance', "const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));\nro.observe(el);", 'Can cause loop if callback itself resizes the observed element.'),
    api('<video> / <audio>', '<video src controls width height poster />', 'Native media playback with JS API for play/pause/seek.', 'src, controls, autoplay, loop, muted attrs', 'HTMLMediaElement', "<video src='/demo.mp4' controls muted playsinline />", 'autoplay requires muted on most browsers; use playsinline for iOS.'),
    api('MutationObserver', 'new MutationObserver(callback)', 'Watches for DOM tree changes (child list, attributes, text).', 'callback with MutationRecord[]', 'observer instance', "const mo = new MutationObserver((muts) => console.log(muts));\nmo.observe(target, { childList: true, subtree: true });", 'Disconnect when done; deep subtree observation on large trees is expensive.'),
  );

  // HTML5 sub-topics — add specific cards
  skills.forEach((s) => {
    if (s.parentId !== html.id) return;
    const specific = {
      'Semantic Elements': [
        card('What semantic element should wrap a self-contained syndicated piece of content?', '<article> — it is independently distributable (e.g., a blog post, news story, or forum entry). Use <section> for thematically grouped content within a page.'),
        card('Why does heading hierarchy matter beyond visual styling?', 'Screen readers build a document outline from heading levels; a skipped h1→h3 or multiple h1s breaks navigation for assistive technology users.'),
      ],
      'Forms & Validation': [
        card('What does the `novalidate` attribute on a form do?', 'It disables native browser validation so you can implement custom JS validation while still using the Constraint Validation API for state tracking.'),
        card('Why must every form input have an associated <label>?', 'Labels provide the accessible name for inputs; without them screen readers cannot describe the field, and click target size shrinks to the control itself.'),
      ],
      'Accessibility & ARIA': [
        card('What is the first rule of ARIA?', 'Do not use ARIA if a native HTML element or attribute provides the semantics and behaviour you need.'),
        card('What is aria-live used for?', 'It marks a region whose content updates dynamically; screen readers announce changes to polite (after current speech) or assertive (interrupt) live regions.'),
      ],
      'Media': [
        card('What does the `srcset` attribute on <img> enable?', 'It lets the browser select the most appropriate image source based on device pixel ratio or viewport width, reducing bandwidth on low-DPI displays.'),
        card('Why should <video> include the `playsinline` attribute for mobile?', 'Without it, iOS Safari forces full-screen playback; `playsinline` allows inline video in the page flow, important for UX consistency.'),
      ],
      'Canvas basics': [
        card('What is the difference between canvas 2D context and WebGL context?', '2D context provides a high-level imperative drawing API; WebGL exposes raw GPU programming via shaders, required for 3D or GPU-accelerated effects.'),
        card('Why should canvas dimensions be set via attributes, not CSS?', 'CSS scales the canvas element but the drawing buffer stays at its attribute dimensions; mismatches cause blurry rendering.'),
      ],
      'Web Storage APIs': [
        card('Why must you never store sensitive data in localStorage?', 'It is accessible to any JS on the same origin — an XSS vulnerability can exfiltrate everything. Use httpOnly cookies for auth tokens.'),
        card('What is the storage event and when does it fire?', 'It fires on other tabs/windows of the same origin when localStorage changes, enabling cross-tab state synchronisation.'),
      ],
      'Meta tags & SEO': [
        card('What does <meta name="viewport" content="width=device-width, initial-scale=1"> do?', 'It tells mobile browsers to set viewport width to device width and use 1:1 scale, preventing the 980px default that makes pages appear zoomed-out.'),
        card('Why are Open Graph meta tags important?', 'They control how page previews appear on social platforms (title, image, description) when links are shared.'),
      ],
      'Web Components basics': [
        card('What are the three browser APIs that compose Web Components?', 'Custom Elements (define new HTML tags), Shadow DOM (encapsulated scoped DOM/styles), and HTML Templates (<template>/<slot> for declarative fragments).'),
        card('Why does Shadow DOM provide style encapsulation?', 'Styles defined inside a shadow root do not leak out and external styles do not pierce in by default — each component has an isolated style scope.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // CSS3 — additional top-level flashcards
  css.flashcards.push(
    card('What is CSS3?', 'CSS3 is the modern evolution of Cascading Style Sheets for styling HTML. It introduced features such as Flexbox, Grid, transitions, animations, media queries, variables, gradients, transforms, and more.'),
    card('What is the difference between CSS2 and CSS3?', 'CSS3 is modular and added features such as Flexbox, Grid, media queries, animations, transitions, border radius, shadows, variables, multiple backgrounds, and transforms.'),
    card('What are the different ways to apply CSS?', 'CSS can be applied inline with the style attribute, internally with a style tag, or externally through a linked stylesheet such as <link rel="stylesheet" href="style.css">.'),
    card('What is specificity in CSS?', 'Specificity decides which rule wins when multiple selectors target the same element. In general: inline styles > IDs > classes/attributes/pseudo-classes > elements/pseudo-elements.'),
    card('What is !important in CSS?', '!important gives a declaration priority over normal cascade rules. Use it sparingly because it makes overrides and debugging harder.'),
    card('What is the difference between relative, absolute, fixed, and sticky positioning?', 'relative offsets from normal position; absolute positions against the nearest positioned ancestor; fixed positions against the viewport; sticky acts relative until a scroll threshold, then sticks.'),
    card('What is the difference between em, rem, px, %, vh, and vw?', 'px is fixed; em is relative to parent font size; rem is relative to root font size; % is relative to the parent; vh is viewport height; vw is viewport width.'),
    card('What is Flexbox?', 'Flexbox is a one-dimensional layout system for arranging items in a row or column using properties such as display: flex, justify-content, align-items, flex-direction, and flex-wrap.'),
    card('What is the difference between justify-content and align-items?', 'justify-content aligns flex items on the main axis, while align-items aligns them on the cross axis. With a row layout, main is horizontal and cross is vertical.'),
    card('What is the difference between Grid and Flexbox?', 'Flexbox is mainly one-dimensional and best for component alignment. Grid is two-dimensional and best for rows-and-columns page or section layouts.'),
    card('What is CSS Grid?', 'CSS Grid is a two-dimensional layout system. Example: .container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }.'),
    card('What is z-index?', 'z-index controls the stacking order of positioned elements within the same stacking context. Higher z-index values appear above lower values.'),
    card('What is the difference between visibility: hidden and display: none?', 'display: none removes the element from layout. visibility: hidden hides it visually while preserving its layout space.'),
    card('What is box-sizing?', 'box-sizing defines how width and height are calculated. content-box uses only content size; border-box includes padding and border inside the declared size.'),
    card('What is the CSS Box Model?', 'The CSS box model consists of content, padding, border, and margin. It describes how elements take up space on the page.'),
    card('What is the difference between inline, block, and inline-block?', 'block elements take full available width and start on a new line; inline elements take content width; inline-block flows inline but accepts width and height.'),
    card('What are pseudo-classes?', 'Pseudo-classes target special states or positions of elements, such as :hover, :focus, :first-child, and :last-child.'),
    card('What are pseudo-elements?', 'Pseudo-elements style specific parts of an element, such as ::before, ::after, ::first-line, and ::placeholder.'),
    card('What is the difference between a pseudo-class and a pseudo-element?', 'A pseudo-class targets an element state or condition. A pseudo-element targets a specific generated or structural part of an element.'),
    card('What are media queries?', 'Media queries apply CSS conditionally based on viewport or device features. Example: @media (max-width: 768px) { .container { flex-direction: column; } }.'),
    card('What is responsive design?', 'Responsive design adapts UI to different screen sizes using media queries, flexible layouts, fluid images, and relative units.'),
    card('What is mobile-first design?', 'Mobile-first design starts with styles for small screens, then adds enhancements for larger screens using min-width media queries.'),
    card('What are CSS transitions?', 'Transitions create smooth changes between property values when state changes, such as button { transition: all 0.3s ease; }.'),
    card('What are CSS animations?', 'CSS animations use @keyframes and the animation property to run multi-step visual changes, with or without user interaction.'),
    card('What is the difference between transition and animation?', 'A transition usually needs a state change, such as hover. An animation can run automatically and can define multiple keyframe steps.'),
    card('What are transforms in CSS?', 'Transforms visually modify an element using functions such as translate(), rotate(), scale(), skew(), and 3D transform functions.'),
    card('What is translateZ(0)?', 'translateZ(0) is sometimes used to promote an element to a GPU compositing layer for smoother rendering, but it should not be overused.'),
    card('What is overflow in CSS?', 'overflow controls what happens when content exceeds its box. Common values are visible, hidden, scroll, and auto.'),
    card('What is the difference between opacity: 0 and visibility: hidden?', 'opacity: 0 makes the element invisible but it can still receive pointer events. visibility: hidden hides it and makes it non-interactive.'),
    card('What are CSS variables?', 'CSS variables, also called custom properties, are reusable runtime values declared with --name and read with var(--name).'),
    card('What is inheritance in CSS?', 'Inheritance means some CSS properties, such as color and font-family, are passed from parent elements to children unless overridden.'),
    card('What is cascading in CSS?', 'The cascade decides which style applies based on importance, origin, specificity, and source order.'),
    card('What is the difference between min-width and max-width?', 'min-width applies styles at or above a breakpoint. max-width applies styles at or below a breakpoint.'),
    card('What is object-fit?', 'object-fit controls how replaced content such as images or videos resize inside their box. Common values include cover, contain, and fill.'),
    card('What is the difference between relative and absolute units?', 'Relative units depend on another measurement, such as em, rem, %, vh, and vw. Absolute units such as px are fixed CSS pixels.'),
    card('What is nth-child?', ':nth-child() targets elements based on their position among siblings, such as li:nth-child(2) selecting the second list item.'),
    card('What are combinators in CSS?', 'Combinators describe relationships between selectors: descendant (div p), child (div > p), adjacent sibling (div + p), and general sibling (div ~ p).'),
    card('What is the difference between visibility: hidden and opacity: 0?', 'visibility: hidden hides the element and prevents interaction. opacity: 0 makes it transparent but it can still be clickable unless pointer events are disabled.'),
    card('What is a stacking context?', 'A stacking context is an isolated z-index hierarchy created by triggers such as positioned elements with z-index, transform, opacity less than 1, or isolation: isolate.'),
    card('What is BEM methodology?', 'BEM means Block, Element, Modifier. Example: .card, .card__title, and .card--active. It improves CSS naming consistency and maintainability.'),
    card('What is critical CSS?', 'Critical CSS is the minimum CSS required to render above-the-fold content quickly, often inlined or loaded before non-critical styles.'),
    card('What are repaint and reflow?', 'Reflow recalculates layout, while repaint redraws visual pixels. Reflow is usually more expensive because it can affect surrounding layout.'),
    card('What causes layout thrashing?', 'Layout thrashing happens when code repeatedly alternates DOM writes and layout reads, forcing the browser to recalculate layout multiple times.'),
    card('What are CSS preprocessors?', 'CSS preprocessors extend CSS with features such as variables, nesting, mixins, and functions. Common examples are Sass, Less, and Stylus.'),
    card('What is the difference between Sass and SCSS?', 'Sass uses indentation-based syntax. SCSS uses CSS-like braces and semicolons, making it closer to standard CSS.'),
    card('What is the difference between adaptive and responsive design?', 'Responsive design uses fluid layouts that adjust continuously. Adaptive design uses multiple fixed layouts for selected breakpoints.'),
    card('What is will-change in CSS?', 'will-change hints that an element is likely to change, such as will-change: transform. Use it carefully because unnecessary layers can hurt performance.'),
    card('How do you center a div horizontally and vertically?', 'A common Flexbox solution is: .container { display: flex; justify-content: center; align-items: center; }.'),
    card('What is the difference between auto-fill and auto-fit in Grid?', 'auto-fill keeps empty tracks in the grid. auto-fit collapses empty tracks and lets items expand to fill the available space.'),
    card('What are common CSS performance optimizations?', 'Minimize reflows, animate transform/opacity, reduce expensive shadows, avoid deep selectors, remove unused CSS, reserve layout space, and lazy load assets.'),
    card('Why use transform instead of margin, left, or top for animations?', 'transform can often be handled by the compositor and avoids layout recalculation, making animations smoother than changing layout properties.'),
    card('What is hardware acceleration in CSS?', 'Hardware acceleration means using GPU compositing for smoother rendering. It can be triggered by transform-based animations or 3D transform hints.'),
    card('What is the difference between rem and em in nested elements?', 'em compounds through parent font sizes in nested elements. rem always uses the root html font size, so it is more predictable.'),
    card('What are logical properties in CSS?', 'Logical properties adapt to writing direction and mode, such as margin-inline-start and padding-block-end, which help with RTL and vertical text layouts.'),
    card('What is clamp() in CSS?', 'clamp(min, preferred, max) creates a responsive value within boundaries, such as font-size: clamp(16px, 2vw, 32px).'),
    card('What is aspect-ratio in CSS?', 'aspect-ratio sets a preferred width-to-height ratio, such as .card { aspect-ratio: 16 / 9; }, helping reserve predictable layout space.'),
    card('What is a container query?', 'A container query applies styles based on the size of an element container instead of the viewport, making components more reusable.'),
    card('What is the difference between SVG and Canvas?', 'SVG is vector and DOM-based, making elements individually styleable and accessible. Canvas is pixel-based and better for many dynamic drawings.'),
    card('What is the difference between transform: scale and zoom?', 'transform: scale visually scales an element and is standards-based. zoom changes layout scaling in some browsers but is non-standard.'),
    card('What are advanced CSS architecture approaches?', 'Common approaches include BEM, SMACSS, OOCSS, Atomic CSS, utility-first CSS, CSS Modules, and CSS-in-JS.'),
    card('Why is z-index not working?', 'Common reasons include missing positioning, a different stacking context, parent clipping with overflow, or transform/opacity creating an isolated context.'),
    card('Why is height: 100% not working?', 'height: 100% needs the parent chain to have defined heights. Without a definite parent height, the percentage cannot resolve.'),
    card('Why is Flexbox not centering?', 'Check display: flex, justify-content, align-items, flex-direction, and whether the container has enough height for vertical centering.'),
    card('Why is a media query not applying?', 'Common causes include wrong breakpoint, missing viewport meta tag, invalid syntax, stylesheet order, or a more specific rule overriding it.'),
    card('What is the viewport meta tag?', 'The viewport meta tag enables responsive rendering on mobile: <meta name="viewport" content="width=device-width, initial-scale=1.0">.'),
    card('What are CSS custom properties?', 'CSS custom properties are the official name for CSS variables, declared as --token and consumed with var(--token).'),
    card('What are feature queries?', 'Feature queries use @supports to apply CSS only when a browser supports a feature, such as @supports (display: grid) { ... }.'),
    card('What is prefers-color-scheme?', 'prefers-color-scheme is a media feature that detects whether the user prefers light or dark mode.'),
    card('What are web-safe fonts?', 'Web-safe fonts are commonly available across many systems, such as Arial, Verdana, Tahoma, Georgia, and Times New Roman.'),
    card('What is FOUC?', 'FOUC means Flash Of Unstyled Content. It happens when HTML appears before CSS has loaded or applied.'),
    card('What is CLS in Web Vitals?', 'CLS means Cumulative Layout Shift. It measures unexpected visual movement on the page during loading or interaction.'),
    card('How do you reduce CLS?', 'Set image and video dimensions, reserve ad or embed space, avoid inserting content above existing content, and use stable fonts or font-display carefully.'),
    card('What is the difference between visibility: collapse and visibility: hidden?', 'visibility: collapse mainly affects table rows, columns, and related layout behavior. visibility: hidden is the general hidden-but-space-preserved value.'),
    card('What is isolation: isolate?', 'isolation: isolate creates a new stacking context, preventing blending and z-index interactions from leaking outside the element.'),
    card('What is accent-color in CSS?', 'accent-color customizes the color of supported form controls such as checkboxes, radio buttons, and range inputs.'),
    card('What is scroll-behavior: smooth?', 'scroll-behavior: smooth makes browser-driven scrolling, such as anchor navigation, animate smoothly instead of jumping instantly.'),
    card('What is pointer-events: none?', 'pointer-events: none makes an element ignore pointer interactions, allowing clicks or hovers to pass through to elements behind it.'),
    card('What is CSS containment?', 'CSS containment limits how much an element can affect the rest of the page, improving rendering performance with values such as contain: layout.'),
    card('What is subgrid in CSS?', 'subgrid lets a nested grid inherit row or column tracks from its parent grid, aligning nested content with the outer layout.'),
    card('What is the future of CSS?', 'Modern CSS is moving toward stronger native capabilities such as container queries, cascade layers, nesting, scoped styles, advanced selectors, and better design-token workflows.'),
    card('What triggers a new stacking context?', 'position + z-index (non-auto), opacity < 1, transform, filter, isolation: isolate, and will-change — understanding this prevents z-index fights.'),
    card('What is a Block Formatting Context and why does it matter?', 'A BFC contains floats, prevents margin collapse with children, and does not overlap adjacent floats — created by overflow, display: flow-root, flex/grid containers.'),
    card('What does `aspect-ratio` replace in modern CSS?', 'The padding-top percentage hack for maintaining proportional boxes — `aspect-ratio: 16/9` is declarative and works with actual height constraints.'),
    card('How does `gap` in Grid differ from margin for spacing?', 'gap only applies between grid/flex items, not on outer edges — eliminating the need for negative-margin hacks and first/last-child overrides.'),
    card('What are logical properties and why do they matter for i18n?', 'Properties like `margin-inline-start` map to left/right based on writing direction — they make layouts automatically correct for RTL languages without override rules.'),
  );

  // CSS3 — additional APIs
  css.apis.push(
    api('@media', '@media (condition) { ... }', 'Applies styles conditionally based on viewport, device, or preference features.', 'media feature expressions', 'conditional rule block', '@media (max-width: 768px) { .sidebar { display: none; } }', 'Prefer min-width (mobile-first) over max-width for scalability.'),
    api('@keyframes', '@keyframes name { from { ... } to { ... } }', 'Defines animation steps for use with animation property.', 'animation name and step declarations', 'animation definition', "@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }", 'Keyframe selectors can use percentage values for multi-step animations.'),
    api('animation', 'animation: name duration timing-function delay iteration fill-mode', 'Applies a keyframe animation to an element.', 'shorthand animation values', 'animated element', '.toast { animation: fadeIn 300ms ease forwards; }', 'Use will-change: transform/opacity sparingly to hint GPU compositing.'),
    api('transition', 'transition: property duration timing-function delay', 'Smoothly interpolates CSS property changes.', 'target property and timing', 'animated property change', '.btn { transition: background-color 200ms ease; }', 'Transitioning all properties is wasteful; be explicit about which properties.'),
    api('transform', 'transform: translate() scale() rotate() skew()', 'Applies 2D/3D geometric transformations without affecting layout.', 'transform function list', 'visual transformation', '.card:hover { transform: translateY(-4px) scale(1.01); }', 'transform creates a new stacking context and compositing layer.'),
    api(':is() / :where()', ':is(selector-list) / :where(selector-list)', ':is() matches any selector in list with the highest specificity in the list; :where() always has zero specificity.', 'forgiving selector list', 'matched elements', ':is(h1, h2, h3) { line-height: 1.2; }', ':where() is safer for utility resets as it cannot accidentally win specificity battles.'),
  );

  // CSS3 sub-topics — add specific cards
  skills.forEach((s) => {
    if (s.parentId !== css.id) return;
    const specific = {
      'Selectors & Specificity': [
        card('How is specificity calculated?', 'IDs = 1-0-0, classes/attributes/pseudo-classes = 0-1-0, elements/pseudo-elements = 0-0-1. Inline styles are 1-0-0-0. Higher wins; same specificity means last-declared wins.'),
        card('Why does :not() take on the specificity of its argument?', '`:not(.foo)` has class-level specificity (0-1-0), not zero — this surprises developers who expect the negation to be free.'),
      ],
      'Box Model': [
        card('What does `box-sizing: border-box` change?', 'Width and height include padding and border, not just content — making layout arithmetic predictable without subtracting padding manually.'),
        card('When does margin collapse happen and when does it not?', 'Adjacent block margins collapse vertically; it does not happen inside flex/grid containers, with overflow (not visible), or with padding/border between margins.'),
      ],
      'Flexbox': [
        card('What is the difference between flex-basis and width?', 'flex-basis sets the initial main-axis size before flex-grow/shrink adjust it; it takes precedence over width when flex-direction is row.'),
        card('What causes flex children to overflow their container?', 'flex-shrink: 0 prevents shrinking, and min-width: auto on flex items defaults to their content width — set min-width: 0 to allow shrinking below content size.'),
      ],
      'Grid': [
        card('What does `grid-template-areas` buy you over line-based placement?', 'Named areas make template intent readable and let you reorganise layout by changing the template string without touching child placement rules.'),
        card('What is the difference between implicit and explicit grid tracks?', 'Explicit tracks are defined by grid-template-columns/rows; implicit tracks are auto-created for items that overflow — control them with grid-auto-columns/rows.'),
      ],
      'Positioning': [
        card('What is the difference between position: absolute and position: fixed?', 'Absolute positions relative to the nearest positioned ancestor; fixed positions relative to the viewport and does not scroll with the page.'),
        card('What makes position: sticky not work?', 'An ancestor with overflow: hidden/auto/scroll clips the sticky element; the sticky container must have enough height for the element to stick within.'),
      ],
      'Transitions & Animations': [
        card('Why should you prefer CSS transitions over JS-driven style changes for simple effects?', 'CSS transitions are handled by the compositor thread and avoid main thread JS; they are interruptible and perform better under scroll/interaction load.'),
        card('What is the purpose of animation-fill-mode: forwards?', 'It retains the final keyframe state after the animation completes instead of reverting to the original property value.'),
      ],
      'Transforms': [
        card('Why does transform not affect document flow?', "Transformed elements remain in normal flow for layout purposes — other elements don't reflow around them; only the visual rendering moves."),
        card('What is `transform-origin` and why does it matter for rotation?', 'It sets the pivot point for transform operations; default is 50% 50% (center), but rotating a card around its edge requires transform-origin: left center.'),
      ],
      'Responsive Design': [
        card('What is the mobile-first approach in media queries?', 'Base styles target small screens; min-width queries progressively enhance for larger viewports — avoiding override-heavy max-width patterns.'),
        card('What is the difference between px, em, and rem in responsive design?', 'px is fixed; em is relative to the parent font-size (compounds in nesting); rem is relative to the root font-size (consistent and predictable).'),
      ],
      'Custom Properties': [
        card('How do CSS custom properties differ from Sass variables at runtime?', 'CSS custom properties resolve at paint time and can be changed with JS or per-selector overrides; Sass variables are compiled away and cannot change after build.'),
        card('What is the var() fallback and when should you use it?', '`var(--token, fallback)` uses fallback if --token is not defined in scope — essential for partial theme implementations or optional design tokens.'),
      ],
      'Pseudo-classes & Pseudo-elements': [
        card('What is the difference between :focus and :focus-visible?', ':focus applies on any focus method; :focus-visible applies only when focus was reached via keyboard, enabling visible indicators for keyboard users without outlining mouse clicks.'),
        card('What can ::before and ::after not contain?', 'They cannot contain interactive elements (buttons, inputs); they are purely presentational. They also require content: "" to render.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // ─── JAVASCRIPT APP CATEGORIES ──────────────────────────────────────────────
  const jsAppsSkill = mk('JavaScript App Categories', 'frontend', null, {
    definition: 'JavaScript runs almost everywhere now — browsers, mobile, desktop, servers, edge, embedded devices, even microcontrollers. Each environment has its own runtime, constraints, and best-fit use cases. Senior JS engineers know the landscape and pick the right runtime per problem, not just the one they know.',
    codeExample: `// Same JS, different runtimes, different capabilities:
//
// Browser      → DOM, Web APIs, sandboxed, no file system
// Node.js      → File system, networking, child processes, no DOM
// Bun          → Node-compatible but faster, built-in bundler
// Deno         → Secure-by-default Node alternative, TypeScript native
// React Native → Mobile UI, native modules, no DOM
// Electron     → Browser + Node combined for desktop
// CF Workers   → Edge runtime, V8 isolates, no Node APIs
// Espruino     → JS on microcontrollers (sensors, smart bulbs)`,
    flashcards: [
      card("Why does JavaScript run on so many platforms?", "V8 (Chrome's engine) was extracted to create Node.js in 2009, proving JS could run outside browsers. Since then, JS engines have been embedded in mobile (RN), desktop (Electron), serverless (Lambda), edge (Cloudflare Workers), and even microcontrollers (Espruino). The browser API legacy is what makes the language portable."),
      card('Node.js vs Deno vs Bun — when each?', 'Node.js: mature, vast ecosystem, default choice. Deno: secure-by-default, TypeScript native, web-standard APIs (fetch, Promise) — good for new greenfield. Bun: fastest, drop-in Node replacement with built-in bundler/test runner — promising but newer, some compat gaps.'),
      card('How does same JS run differently across runtimes?', "Each runtime exposes different global APIs. Browser has `window`, `document`. Node has `process`, `fs`, `require`. Workers have `caches`, no `process`. Code targeting one runtime breaks on another unless it uses only the shared subset (ECMAScript + maybe `fetch`)."),
      card('What is "isomorphic" or "universal" JavaScript?', 'Code that runs on both server and client without modification — used in SSR frameworks (Next.js, Remix). Same React component renders to HTML on server, hydrates in browser. Requires avoiding environment-specific APIs (no `window` access in shared code).'),
      card('Why TypeScript over plain JavaScript for serious apps?', 'Type safety catches bugs at compile time (typos, wrong shapes, refactor breakage). IDE autocomplete and refactoring become reliable. Documentation lives in code. Cost: build step, learning curve, slower initial development. Worth it for any app > 10K LOC or team > 2 developers.'),
      card('What environment should a beginner JS engineer learn first?', 'Browser + Node.js. Browser teaches DOM, events, async, debugging. Node.js teaches modules, file system, networking, server basics. Together they cover ~80% of JS jobs. Specialize after — mobile (RN), edge (Workers), or backend frameworks (NestJS).'),
    ],
    refs: [
      ref('MDN Web Docs', 'https://developer.mozilla.org/'),
      ref('Node.js docs', 'https://nodejs.org/docs/'),
      ref('State of JS survey', 'https://stateofjs.com/'),
    ],
  });
  skills.push(jsAppsSkill);

  // Sub 1: Browser-Based Web Apps
  skills.push(mk('Browser-Based Web Apps', 'frontend', jsAppsSkill.id, {
    definition: 'Apps running in a browser tab — static sites, SPAs, SSR apps, PWAs, browser extensions. The most familiar JS environment. Covers landing pages, dashboards, e-commerce, SaaS web apps.',
    codeExample: `// SPA — runs entirely in browser after first load
// SSR — server pre-renders HTML, browser hydrates JS
// SSG — HTML generated at build time, served as static files
// PWA — installable, offline-capable web app

// Vite + React SPA entry point
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App />);

// Next.js SSR page (server renders each request)
export default function ProductPage({ product }) {
  return <h1>{product.name}</h1>;
}
export async function getServerSideProps({ params }) {
  return { props: { product: await fetchProduct(params.id) } };
}`,
    flashcards: [
      card('SPA vs SSR vs SSG — quick rules?', 'SPA: full app loads as JS bundle, then renders client-side — slow first paint, fast navigation, bad SEO out of box. SSR: server renders HTML per request — good SEO, slower at scale. SSG: HTML pre-built at deploy time — fastest, best SEO, but only works for content not personalized per user.'),
      card('When is a SPA the right choice?', "Behind-login dashboards (no SEO needed), highly interactive apps (Figma, Linear), apps where first paint matters less than navigation speed. Bad fit: marketing sites, blogs, e-commerce product pages — SEO and first paint dominate."),
      card('What is a PWA?', 'Progressive Web App — a web app that can be installed to the home screen, runs offline, sends push notifications. Built with service workers + Web App Manifest. Closes the gap between web and native. Examples: Twitter Lite, Starbucks PWA, Spotify web.'),
      card('What is hydration in SSR?', "Server sends HTML with content already rendered. Browser displays it instantly. Then JS bundle loads and \"hydrates\" — attaches event listeners, makes the page interactive. Slow hydration = page looks loaded but doesn't respond to clicks for seconds. React 18 added partial hydration to address this."),
      card('Modern SPA stack in 2026?', 'Vite (build tool, replaces CRA), React or Vue or Svelte (framework), TanStack Router or React Router (routing), TanStack Query (server state), Zustand or Redux (client state), Tailwind (CSS), shadcn/ui (components). Or pick a meta-framework (Next.js, Remix, Nuxt, SvelteKit) for batteries-included.'),
      card('When to use a meta-framework vs plain SPA?', "Meta-framework (Next.js, Remix): SEO matters, SSR/SSG needed, want file-based routing + API routes + image optimization out of box. Plain SPA: behind-login app, no SEO concern, simpler deploy, want to control the stack. Default to meta-framework unless reason against."),
    ],
    refs: [
      ref('Vite docs', 'https://vitejs.dev/'),
      ref('Next.js docs', 'https://nextjs.org/docs'),
      ref('web.dev — PWA guide', 'https://web.dev/explore/progressive-web-apps'),
    ],
  }));

  // Sub 2: Static Sites & SSG
  skills.push(mk('Static Sites & SSG', 'frontend', jsAppsSkill.id, {
    definition: 'HTML/CSS/JS generated at build time, served as static files via CDN. Fastest possible page loads, best SEO, lowest hosting cost. Used for marketing sites, blogs, documentation, portfolios.',
    codeExample: `// Astro — ships zero JS by default, opt-in per component
---
// Frontmatter runs at build time on the server
const posts = await fetch('https://api.example.com/posts').then(r => r.json());
---
<html>
  <body>
    {posts.map(post => (
      <article>
        <h2>{post.title}</h2>
        <p>{post.summary}</p>
      </article>
    ))}
    {/* Only this island ships JS to the browser */}
    <SearchBox client:load />
  </body>
</html>`,
    flashcards: [
      card('Why pick a static site generator over a SPA?', 'SEO is dramatically better (HTML pre-rendered, crawlers see content immediately). First paint is fastest possible (no JS execution required). Hosting is cheap (CDN serves files, no server compute). Trade: no per-user dynamic content without client-side hydration.'),
      card('Astro vs Next.js static export vs Eleventy?', "Astro: ships zero JS by default, opt-in islands for interactivity — best for content-heavy sites with selective interactivity. Next.js static export: full React stack, but ships JS for all components. Eleventy: pure HTML/templates, minimal JS — simplest, no React/Vue."),
      card('What is "islands architecture"?', 'Most of the page is static HTML (no JS). Only specific interactive components ("islands") hydrate with JS. Drastically less JS shipped, faster pages. Astro popularized it. Modern Next.js (with React Server Components) takes a similar approach.'),
      card('When does SSG break down?', "Sites with 100K+ pages — full rebuild becomes slow. Sites with per-user personalized content (dashboards, social feeds). Sites needing fresh data every minute. ISR (Incremental Static Regeneration) and on-demand revalidation help, but at some point switching to SSR or SPA makes sense."),
      card('What is ISR?', 'Incremental Static Regeneration — Next.js feature where pages are statically generated but revalidated on a schedule or on-demand. Best of SSG (fast, cached) + freshness (auto-updates without full rebuild). Used by e-commerce, news sites where content changes regularly but not per-request.'),
      card('Hosting options for SSG sites?', "Cloudflare Pages, Vercel, Netlify, GitHub Pages — all free tiers, deploy from git. CDN-cached globally. For high-traffic sites, S3 + CloudFront also works. Hosting cost for a static site can be $0 for small projects."),
    ],
    refs: [
      ref('Astro', 'https://astro.build/'),
      ref('Eleventy', 'https://www.11ty.dev/'),
      ref('Jamstack overview', 'https://jamstack.org/'),
    ],
  }));

  // Sub 3: Server-Side Apps (Node.js)
  skills.push(mk('Server-Side Apps (Node.js)', 'frontend', jsAppsSkill.id, {
    definition: 'Backend services running on Node.js, Deno, or Bun. REST APIs, GraphQL endpoints, WebSocket servers, background workers, microservices. Same JS skills as frontend, applied to server-side concerns.',
    codeExample: `// Express REST API with Zod validation
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json({ limit: '10kb' }));

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

app.post('/users', async (req, res, next) => {
  try {
    const data = CreateUserSchema.parse(req.body);
    const user = await db.users.create(data);
    res.status(201).json(user);
  } catch (e) { next(e); }
});

// 4-arg signature required for error middleware
app.use((err, req, res, next) => {
  if (err.name === 'ZodError')
    return res.status(422).json({ code: 'VALIDATION', details: err.errors });
  res.status(500).json({ code: 'INTERNAL' });
});

app.listen(3000);`,
    flashcards: [
      card('Express vs Fastify vs Hono vs NestJS — which to pick?', 'Express: most popular, mature, simple, slowest. Fastify: 2-3x faster, schema-first validation built in. Hono: fastest, designed for edge/serverless, smaller. NestJS: opinionated, decorators, DI, structured — best for large teams and enterprise apps.'),
      card('Why is Node well-suited for I/O-heavy backends?', "Single-threaded event loop + non-blocking I/O = thousands of concurrent connections per server with minimal memory. Perfect for APIs, chat, real-time. Worse fit for CPU-heavy work (image processing, ML) — use worker threads or different language for that."),
      card('GraphQL vs REST for server APIs?', 'REST: simple, cacheable, multiple endpoints, fixed shapes. GraphQL: single endpoint, client picks fields, flexible. GraphQL wins for diverse clients (mobile + web with different needs), aggregating multiple sources. REST wins for public APIs, simple CRUD, where caching matters.'),
      card('When use worker threads in Node?', "CPU-bound work — image processing, encryption, large data parsing. Event loop handles I/O fine on its own; worker threads only help when JS itself blocks the loop. Communication between main and worker is async message-passing."),
      card('How do you do background jobs in Node?', 'BullMQ + Redis is the standard — define jobs, queue them, workers process. Use cases: email sending, image processing, scheduled tasks, retries. Alternatives: Agenda (MongoDB-backed), Temporal (workflow engine), simple cron via node-cron for in-process scheduled tasks.'),
      card('How do Node apps deploy in production?', 'PM2 for single-server (process manager, restart on crash). Docker container + Kubernetes for cloud-scale. Serverless (Lambda, Vercel, Cloudflare Workers) for stateless functions. Most production Node apps: Docker + orchestrator + load balancer in front.'),
      card('Common Node performance pitfalls?', 'Blocking the event loop with sync work (fs.readFileSync, heavy CPU). Memory leaks from uncleaned listeners, intervals, closures. Unbounded request body sizes (DoS). Synchronous JSON.parse on huge payloads. All fixable with awareness — profile with clinic.js.'),
    ],
    refs: [
      ref('Node.js docs', 'https://nodejs.org/docs/'),
      ref('Fastify', 'https://fastify.dev/'),
      ref('NestJS', 'https://docs.nestjs.com/'),
    ],
  }));

  // Sub 4: Serverless & Edge Functions
  skills.push(mk('Serverless & Edge Functions', 'frontend', jsAppsSkill.id, {
    definition: 'Backend functions that run on-demand without managing servers — AWS Lambda, Vercel Functions, Cloudflare Workers. Auto-scale, pay-per-execution. Edge functions run at CDN locations globally with <50ms latency.',
    codeExample: `// Cloudflare Worker — runs at edge, V8 isolate (not Node)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/hello')
      return Response.json({ message: 'Hello from the edge' });

    // KV at edge — global key-value store
    const cached = await env.MY_KV.get('homepage');
    if (cached) return new Response(cached, {
      headers: { 'Content-Type': 'text/html' },
    });

    const fresh = await fetch('https://origin.example.com').then(r => r.text());
    ctx.waitUntil(env.MY_KV.put('homepage', fresh, { expirationTtl: 60 }));
    return new Response(fresh);
  },
};`,
    flashcards: [
      card('What is serverless?', 'Backend functions that run on-demand, fully managed by the cloud provider. No server to provision, configure, or scale. Auto-scales from 0 to thousands of concurrent invocations. Pay per execution, not per server-hour. Examples: AWS Lambda, Vercel Functions, Cloudflare Workers.'),
      card('Edge vs traditional serverless?', 'Traditional serverless (Lambda): runs in one region, cold start 100-500ms, full Node runtime. Edge (Cloudflare Workers, Vercel Edge): runs at CDN locations globally (<50ms to user), faster cold starts (V8 isolates, ~5ms), but limited APIs (no full Node, no native modules).'),
      card('When is serverless the right choice?', "Variable / spiky traffic (auto-scales free). Simple stateless endpoints. Cron jobs. Webhook handlers. Bad fit: long-running connections, heavy CPU work (timeouts, cost spikes), apps needing persistent in-memory state."),
      card('What is the cold start problem?', "When a serverless function hasn't been invoked recently, the runtime needs to spin up — first request waits seconds. Subsequent requests in the warm window are instant. Mitigations: provisioned concurrency (paid warm pool), keep functions warm via scheduled pings, use V8 isolates (Workers) instead of containers."),
      card('Cloudflare Workers vs Vercel Edge vs Deno Deploy?', "Cloudflare Workers: most mature, broadest edge network, KV/D1/R2 ecosystem. Vercel Edge: best Next.js integration, easier deploy. Deno Deploy: Deno-native, TypeScript-first. All three use V8 isolates for fast cold starts."),
      card('What runs differently at the edge vs Node?', "No Node APIs (no `fs`, no `process`, no native modules). Uses Web Standard APIs (`fetch`, `Request`, `Response`, `crypto.subtle`). Code that works in browser is more portable to edge than Node code. Most modern frameworks (Hono, itty-router) target both."),
    ],
    refs: [
      ref('Cloudflare Workers', 'https://developers.cloudflare.com/workers/'),
      ref('Vercel Edge Functions', 'https://vercel.com/docs/functions/edge-functions'),
      ref('Hono — edge-first framework', 'https://hono.dev/'),
    ],
  }));

  // Sub 5: Mobile Apps (RN, Capacitor, NativeScript)
  skills.push(mk('Mobile Apps (RN, Capacitor, NativeScript)', 'frontend', jsAppsSkill.id, {
    definition: 'Build iOS and Android apps using JavaScript. React Native is dominant for native-feel apps. Capacitor wraps web apps in native shells. NativeScript provides direct native API access. Each has different performance and capability ceilings.',
    codeExample: `// React Native — JS code, native UI components
import { View, Text, FlatList } from 'react-native';

function MyList({ items }) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View><Text>{item.name}</Text></View>
      )}
    />
  );
}

// Capacitor — web app accessing native device APIs
import { Camera } from '@capacitor/camera';

async function takePhoto() {
  const photo = await Camera.getPhoto({ quality: 90 });
  return photo.webPath;
}`,
    flashcards: [
      card('React Native vs Capacitor vs NativeScript?', 'React Native: native UI components rendered from JS, best native feel, biggest ecosystem. Capacitor: web app wrapped in WebView, easier (any web stack works), lower performance ceiling. NativeScript: direct native API access from JS, less common, niche use cases.'),
      card('When is Capacitor good enough vs needing RN?', "Capacitor: content-heavy apps, dashboards, e-commerce, anything where 60fps animation isn't critical. RN: when you need native-feel UI, complex gestures, high-performance lists, or platform-specific UX patterns."),
      card('Expo vs bare React Native?', "Expo: managed workflow, EAS Build, OTA updates, easier dev experience, broad module library. Bare RN: full native control, any third-party native module, custom native code. Expo has gotten so good that bare RN is mostly chosen for very custom needs or legacy projects."),
      card('Can web apps become mobile apps directly?', 'Yes via Capacitor or PWA. Capacitor packages your web app into a native iOS/Android binary that ships through app stores. PWA installs from browser to home screen without app store. Both have trade-offs vs native performance and platform integration.'),
      card('OTA updates for mobile JS apps — what are they?', "Ship JS bundle updates without going through App Store / Play Store review. Expo Updates, CodePush. Critical for hotfixes, A/B tests, rapid iteration. Limited to JS changes — native code still requires store submission."),
      card('When NOT to use JS for mobile?', "Games (use native or Unity/Unreal). Apps requiring deep OS integration (advanced AR, system-level access). Apps where every MB of binary size matters (RN adds ~10MB baseline). Pure native is still better for very polished UX or maximum performance."),
    ],
    refs: [
      ref('React Native docs', 'https://reactnative.dev/'),
      ref('Capacitor', 'https://capacitorjs.com/'),
      ref('Expo', 'https://docs.expo.dev/'),
    ],
  }));

  // Sub 6: Desktop Apps (Electron, Tauri)
  skills.push(mk('Desktop Apps (Electron, Tauri)', 'frontend', jsAppsSkill.id, {
    definition: 'Cross-platform desktop apps with JavaScript UIs. Electron bundles Chromium + Node.js (heavy but battle-tested). Tauri uses native webview + Rust backend (10x smaller, faster). Used for VS Code, Slack, Discord, Notion, Figma desktop.',
    codeExample: `// Electron main process
const { app, BrowserWindow, ipcMain } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: __dirname + '/preload.js',
      contextIsolation: true,
      nodeIntegration: false,       // security: never enable
    },
  });
  win.loadURL('http://localhost:3000');
});

// IPC handler — renderer calls this securely via preload
ipcMain.handle('readFile', async (_, filePath) =>
  fs.promises.readFile(filePath, 'utf8')
);

// preload.js — safe bridge to renderer
contextBridge.exposeInMainWorld('api', {
  readFile: (path) => ipcRenderer.invoke('readFile', path),
});`,
    flashcards: [
      card('Electron vs Tauri?', 'Electron: Chromium + Node.js bundled per app — 100-200MB binaries, high RAM use, but mature and battle-tested (VS Code, Slack, Discord). Tauri: uses OS-native webview + Rust backend — 5-20MB binaries, much lower RAM, faster startup, smaller ecosystem.'),
      card('When does building a desktop app make sense?', "Need: file system access, system tray, global keyboard shortcuts, native menus, offline-heavy use, multi-window. Examples: writing tools, IDEs, design apps, dev tools. Don't build desktop if a web app + PWA install works — saves the deploy/install friction."),
      card('Why is Electron criticized for size and RAM?', "Each Electron app ships its own Chromium (~120MB) and Node runtime. 5 Electron apps open = 5 copies of Chromium running. RAM use 200MB+ per app baseline. Web apps in a browser share one Chromium — efficient. Tauri solves this by using OS webview."),
      card('How does an Electron app communicate between renderer and main?', "IPC (inter-process communication). Renderer (your React app) sends messages to main process (Node) via `ipcRenderer.invoke()`. Main process handles via `ipcMain.handle()`. Preload scripts expose safe APIs to renderer. Never expose `require` directly to renderer — security risk."),
      card('Auto-updates for desktop apps?', "electron-updater (Electron) or Tauri's built-in updater. Apps check a release URL on startup, download new versions, install on restart. Critical for shipping fixes — desktop users don't restart their apps often, so silent auto-update is essential."),
      card('Code signing for desktop apps?', 'Required for distribution. macOS: Apple Developer certificate + notarization. Windows: code signing certificate (DigiCert, Sectigo). Without signing, users see "unidentified developer" warnings. Cost: ~$100-500/year. Annoying setup but non-negotiable for professional apps.'),
    ],
    refs: [
      ref('Electron docs', 'https://www.electronjs.org/docs/latest'),
      ref('Tauri', 'https://tauri.app/'),
    ],
  }));

  // Sub 7: Browser Extensions
  skills.push(mk('Browser Extensions', 'frontend', jsAppsSkill.id, {
    definition: 'Add functionality to browsers — Chrome, Firefox, Safari, Edge. Productivity tools, ad blockers, password managers, AI helpers. Low effort, fast to ship, can become viral.',
    codeExample: `// manifest.json (Manifest V3 — Chrome current standard)
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "action": { "default_popup": "popup.html" },
  "background": { "service_worker": "background.js" },
  "content_scripts": [{
    "matches": ["https://*.example.com/*"],
    "js": ["content.js"]
  }],
  "permissions": ["storage", "activeTab"]
}

// content.js — injected into matching pages
const observer = new MutationObserver(() => {
  // read/modify page DOM or extract data
});
observer.observe(document.body, { childList: true, subtree: true });`,
    flashcards: [
      card('What are the parts of a browser extension?', 'Popup (UI when icon clicked), content scripts (JS injected into web pages), background script / service worker (long-running logic), options page (settings), permissions (declared in manifest). Each runs in a different context with different APIs available.'),
      card('Manifest V3 — what changed?', "Chrome's newest extension format. Background scripts became service workers (not persistent). Stricter content security policy. Stricter permission model. Older Manifest V2 extensions (with full webRequest) being deprecated. Most new development targets V3."),
      card('Cross-browser extensions — how?', 'WebExtensions API is supported across Chrome, Firefox, Edge. Same code largely works everywhere. Safari uses similar API but requires Apple Developer Program + Xcode for distribution. Tools like Plasmo or WXT make cross-browser development easier.'),
      card('Why are extensions a good first project?', 'Small scope (popup + content script), low publishing friction (Chrome Web Store, $5 one-time fee), instant distribution (no app store reviews), can become viral if useful. Many successful SaaS started as extensions.'),
      card('Common extension use cases?', 'Page modifiers (dark mode, ad blocker, custom CSS), productivity tools (tab managers, notes, password fillers), AI helpers (summarizers, translators, code explainers), data extractors (scraping for personal use), automation (form fillers, repetitive tasks).'),
      card('Extension security concerns?', "Extensions have powerful permissions — can read all page data, modify pages, capture inputs. Malicious extensions are a real threat. Best practices: minimal permissions, no `<all_urls>` unless essential, no eval, sanitize injected content. Users trust extensions implicitly — don't betray that."),
    ],
    refs: [
      ref('Chrome Extension docs', 'https://developer.chrome.com/docs/extensions/'),
      ref('Plasmo — extension framework', 'https://docs.plasmo.com/'),
      ref('WXT — modern extension framework', 'https://wxt.dev/'),
    ],
  }));

  // Sub 8: CLI Tools
  skills.push(mk('CLI Tools', 'frontend', jsAppsSkill.id, {
    definition: 'Command-line tools written in JavaScript. Build tools (Vite, Webpack), test runners (Jest), scaffolding (create-next-app), DevOps utilities, internal team tools. Distributed via npm.',
    codeExample: `#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';

const program = new Command();
program.name('my-cli').description('Example CLI').version('1.0.0');

program
  .command('init')
  .option('-n, --name <name>', 'project name')
  .action(async (options) => {
    if (!options.name) {
      const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Project name?' },
      ]);
      options.name = name;
    }
    console.log(chalk.green(\`Creating \${options.name}...\`));
    // scaffold files here
  });

program.parse();`,
    flashcards: [
      card('When is JavaScript a good fit for a CLI?', "When your users are already in the Node ecosystem (frontend devs, fullstack teams). When you want easy distribution via npm. When CLI integrates with web/JS toolchains. Less ideal: system-level tools where startup time matters (Go, Rust faster cold-start)."),
      card('Commander vs Yargs vs oclif?', 'Commander: simple, declarative API, most popular for small CLIs. Yargs: more powerful argument parsing, better for complex flag combinations. oclif: opinionated framework for multi-command CLIs (like git), used by Salesforce, Heroku. Pick Commander unless you need scaling.'),
      card('How do you distribute a Node CLI?', 'Publish to npm with `"bin"` field in package.json mapping command name to script. Users install globally (`npm install -g my-cli`) or run via `npx my-cli`. Add shebang `#!/usr/bin/env node` to the entry script. Make it executable.'),
      card('Common Node CLI libraries?', 'commander/yargs (args), chalk (colors), inquirer/prompts (interactive prompts), ora (spinners), execa (run shell commands), fs-extra (file operations), zx (shell scripts in JS). These compose into rich CLI UX.'),
      card('How to handle startup time in Node CLIs?', "Node CLI cold start is ~100-300ms — too slow for tools invoked frequently (like git). Mitigations: lazy-load modules, avoid heavy deps at top level, use esbuild to compile to single-file bundle, or compile via Bun to native binary for fast startup."),
      card('When to ship a CLI as a single binary?', "When users don't have Node installed. When startup speed matters. When you want a clean installation without npm. Tools: Bun has `bun build --compile`, Node has SEA (Single Executable Application), pkg packages Node apps into binaries."),
    ],
    refs: [
      ref('Commander.js', 'https://github.com/tj/commander.js'),
      ref('oclif', 'https://oclif.io/'),
    ],
  }));

  // Sub 9: AI / LLM Apps
  skills.push(mk('AI / LLM Apps', 'frontend', jsAppsSkill.id, {
    definition: 'Apps built around LLM APIs — chat assistants, RAG systems, AI agents, code copilots, content generators. Fastest-growing JS app category. Most are full-stack (frontend + backend proxy to LLM provider).',
    codeExample: `// Vercel AI SDK — streaming chat with Anthropic
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// Server-side route (Next.js App Router)
export async function POST(req) {
  const { messages } = await req.json();
  const result = await streamText({
    model: anthropic('claude-sonnet-4-6'),
    messages,
    system: 'You are a helpful coding assistant.',
  });
  return result.toDataStreamResponse();
}

// Client — useChat handles streaming automatically
import { useChat } from 'ai/react';

function ChatUI() {
  const { messages, input, handleSubmit, handleInputChange } = useChat();
  return (
    <>
      {messages.map(m => <div key={m.id}>{m.role}: {m.content}</div>)}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </>
  );
}`,
    flashcards: [
      card('What categories of AI apps can you build with JS?', 'Chat interfaces (ChatGPT-style), RAG apps (document Q&A), AI agents (tool-using autonomous systems), AI coding tools (Cursor-style assistants), content generators (writing, image prompts, code), browser extensions with AI (summarizers, translators).'),
      card('Why must AI apps go through a backend proxy?', "API keys cannot live in frontend code — they'd be extracted in seconds. Backend holds keys, handles auth, rate limiting per user, prompt management, cost tracking, logging. Frontend talks to your backend, not directly to OpenAI/Anthropic."),
      card('Vercel AI SDK — what does it solve?', "Unified API for streaming from multiple LLM providers (Anthropic, OpenAI, Google, etc.) with built-in React hooks (`useChat`, `useCompletion`). Handles SSE streaming, abort signals, tool calls. Drops setup time for AI features from days to hours."),
      card('LangChain.js vs raw LLM SDK?', 'Raw SDK: minimal abstraction, you control everything, simpler for simple use cases. LangChain: framework for chains, agents, RAG, tool calling — useful when building complex agentic workflows. Start with raw SDK, adopt LangChain only when you outgrow it.'),
      card('How do you build a RAG app in JS?', 'Chunk documents → generate embeddings (OpenAI / Cohere / open models) → store in vector DB (Pinecone, Weaviate, Chroma, pgvector). On query: embed query, similarity search, send top-k chunks + question to LLM. Frameworks: LlamaIndex.ts, LangChain.js.'),
      card('What is MCP (Model Context Protocol)?', 'Open protocol from Anthropic for connecting LLMs to external tools and data. Build an MCP server in JS once (with @modelcontextprotocol/sdk), any MCP-compatible client (Claude Desktop, IDEs) can use it. Standardizes tool calling across the ecosystem.'),
      card('Cost concerns with AI apps?', 'LLM API calls compound fast. Mitigations: prompt caching (Anthropic/OpenAI offer this — up to 90% off cached portions), pick smaller models for simpler tasks, cache deterministic responses, per-user cost caps, batch non-urgent requests.'),
    ],
    refs: [
      ref('Vercel AI SDK', 'https://sdk.vercel.ai/docs'),
      ref('LangChain.js', 'https://js.langchain.com/docs/'),
      ref('Anthropic SDK for TypeScript', 'https://github.com/anthropics/anthropic-sdk-typescript'),
    ],
  }));

  // Sub 10: Real-Time Collaborative Apps
  skills.push(mk('Real-Time Collaborative Apps', 'frontend', jsAppsSkill.id, {
    definition: 'Multiple users editing the same data simultaneously — Figma, Miro, Notion, Linear, Excalidraw. Built on WebSocket transport + CRDT or operational-transform algorithms. JavaScript dominates this space.',
    codeExample: `// Yjs + WebSocket — collaborative shared text
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const doc = new Y.Doc();
const provider = new WebsocketProvider(
  'wss://collab.example.com', 'document-id', doc
);
const yText = doc.getText('content');

// Local edit — applied instantly, broadcast to peers
yText.insert(0, 'Hello ');

// Remote edits arrive and merge automatically
yText.observe(() => console.log('Updated:', yText.toString()));

// Presence — cursors, online status
provider.awareness.setLocalState({
  user: { name: 'vk' },
  cursor: { line: 5, ch: 12 },
});`,
    flashcards: [
      card("What makes a 'real-time collaborative' app distinct?", "Multiple users see each other's changes within ~100ms. State converges automatically without conflicts. Each user can edit offline; changes merge when reconnected. Examples: Figma, Notion, Linear, Google Docs, Miro, Excalidraw."),
      card('CRDT vs Operational Transform (OT)?', "OT (Google Docs era): central server maintains canonical state, transforms incoming ops against concurrent ops. Complex, hard to get right. CRDT: math-based merge that works without a central server — simpler distributed model. Modern apps mostly use CRDTs."),
      card('What libraries support collaborative editing in JS?', 'Yjs: most mature CRDT library, used by Notion, JupyterHub. Automerge: JSON-shape CRDT, simpler model. Liveblocks: managed service for presence + collab. PartyKit: collab-focused edge platform. TipTap / ProseMirror: rich text editors that integrate with Yjs.'),
      card('How does presence work in collab apps?', 'Separate from persistent state. Awareness channel broadcasts ephemeral data — cursor positions, "user is typing", selected elements. Updates fast (multiple per second). Does not persist on disconnect. Yjs has awareness built in via providers.'),
      card('Self-host vs managed (Liveblocks, PartyKit)?', "Self-host: Yjs + y-websocket server, full control, free. Managed: Liveblocks / PartyKit / Hocuspocus Cloud — pay per user, no server ops, presence + persistence included. Default to managed for fast launches; self-host once you understand the trade-offs."),
      card('Persisting collaborative documents?', 'CRDTs serialize to binary updates — store as blob in Postgres, S3, or specialized stores. On user connect, server loads the doc, syncs the user up to current state. Hocuspocus, y-redis, y-leveldb provide persistence layers for Yjs.'),
      card('How do collab apps handle access control?', "CRDTs are inherently \"all or nothing\" — can't hide parts of doc from a user. Permissions enforced at connection time (can this user open this document?) and at server level (server rejects mutations from unauthorized users). Fine-grained per-field permissions are genuinely hard."),
    ],
    refs: [
      ref('Yjs', 'https://docs.yjs.dev/'),
      ref('Liveblocks', 'https://liveblocks.io/docs'),
      ref('PartyKit', 'https://docs.partykit.io/'),
    ],
  }));

  // Sub 11: Game Development
  skills.push(mk('Game Development', 'frontend', jsAppsSkill.id, {
    definition: 'Browser-based games using Canvas, WebGL, or WebGPU. 2D casual games (Wordle, puzzle games), 3D experiences (Three.js), multiplayer games with WebSocket backends. Less common than other categories but a fun specialization.',
    codeExample: `// Phaser 3 — full-featured 2D game framework
import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  preload() { this.load.image('player', '/assets/player.png'); }
  create() {
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    if (this.cursors.left.isDown) this.player.setVelocityX(-160);
    else if (this.cursors.right.isDown) this.player.setVelocityX(160);
    else this.player.setVelocityX(0);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800, height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: 300 } } },
  scene: MainScene,
});`,
    flashcards: [
      card('Phaser vs PixiJS vs Three.js — which when?', 'Phaser: full 2D game framework — physics, scenes, input, audio. Great for browser games. PixiJS: 2D rendering library (no game logic) — flexible, used for custom 2D engines. Three.js: 3D scenes — used for 3D games, product viewers, data viz.'),
      card('Can you ship a real game with JS?', 'Yes for casual / web games — Wordle, Cookie Clicker, Townscaper, indie .io games all use JS. For AAA or console games, you need C++/Rust/Unity/Unreal. JS games shine in: instant play (no install), web distribution, multiplayer browser games.'),
      card('WebGL vs WebGPU?', 'WebGL: established standard, broad browser support, OpenGL-based. WebGPU: newer (2023+), modern API based on Metal/Vulkan/D3D12, faster, supports compute shaders. WebGPU is the future but WebGL still dominates today.'),
      card('Multiplayer game backends in JS?', 'Colyseus: state synchronization framework, multiplayer rooms, easy to start. Nakama: full backend platform with auth, leaderboards, multiplayer. Custom WebSocket server: full control, more work. Most JS multiplayer games are small-scale (rooms of 2-50 players).'),
      card('react-three-fiber — what is it?', 'React wrapper for Three.js. Lets you write Three.js scenes as React JSX, with hooks, declarative state. Used in product configurators, portfolio sites, simple games. Lower learning curve than raw Three.js for React developers.'),
      card('Performance constraints for JS games?', "Single-threaded JS = can't use full CPU. Garbage collection causes frame drops if not careful (avoid allocating in game loop). Mobile browser performance varies wildly. Best practices: object pooling, requestAnimationFrame loop, minimize per-frame allocation."),
    ],
    refs: [
      ref('Phaser', 'https://phaser.io/'),
      ref('Three.js', 'https://threejs.org/docs/'),
      ref('react-three-fiber', 'https://r3f.docs.pmnd.rs/'),
    ],
  }));

  // Sub 12: IoT & Hardware
  skills.push(mk('IoT & Hardware', 'frontend', jsAppsSkill.id, {
    definition: 'JavaScript controlling physical devices — Raspberry Pi controllers, smart home hubs, browser apps talking to Bluetooth/USB devices, microcontrollers running JS directly. Niche but growing as JS ecosystem expands beyond traditional environments.',
    codeExample: `// Web Bluetooth API — browser talks directly to BLE device
async function connectToHeartRateMonitor() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['heart_rate'] }],
  });
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('heart_rate');
  const char = await service.getCharacteristic('heart_rate_measurement');

  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', (e) => {
    const bpm = e.target.value.getUint8(1);
    console.log('Heart rate:', bpm, 'bpm');
  });
}`,
    flashcards: [
      card('What hardware can JavaScript control?', 'Raspberry Pi GPIO (LEDs, sensors, motors) via Node.js + Johnny-Five. Bluetooth devices from browser via Web Bluetooth API. USB devices via WebUSB. Serial devices via Web Serial. Microcontrollers via Espruino (JS runtime for embedded chips).'),
      card('Web Bluetooth — what is it?', 'Browser API that lets web pages communicate with BLE devices (heart rate monitors, smart bulbs, fitness trackers). Currently Chromium-based browsers only. Permission-gated. Powerful for hardware-companion apps without needing native apps.'),
      card('When use JavaScript for hardware?', "Web-first products (smart home apps that just work in browser). Rapid prototyping (Node.js GPIO is fast iteration vs C). Maker projects (JS is familiar to web devs). Bad fit: real-time control (motor control, audio synthesis — use C/Rust/MicroPython)."),
      card('Espruino vs MicroPython?', 'Espruino: JS runtime on microcontrollers — small ESP32, nRF52 boards. Niche but growing. MicroPython: Python on microcontrollers, much more popular in maker community. Pick by language preference and existing skills.'),
      card('Common smart home stack with Node.js?', 'Home Assistant or Homebridge (Node-based) connect smart devices to a central hub. Custom dashboards via web UI. MQTT for device messaging. Examples: control lights via web app, build custom automations beyond manufacturer apps.'),
      card('Limitations of JS for hardware?', 'GC pauses make real-time impossible (no audio synthesis, no motor control loops). Limited library ecosystem vs Python/C. Power consumption higher than native. Best for hubs, controllers, dashboards — not the lowest-level firmware.'),
    ],
    refs: [
      ref('Johnny-Five — Node.js robotics', 'http://johnny-five.io/'),
      ref('Web Bluetooth API (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API'),
      ref('Espruino', 'https://www.espruino.com/'),
    ],
  }));

  // Sub 13: Blockchain / Web3 Apps
  skills.push(mk('Blockchain / Web3 Apps', 'frontend', jsAppsSkill.id, {
    definition: 'Decentralized apps (dApps) interacting with blockchains — DeFi protocols, NFT marketplaces, DAOs, crypto wallets. JavaScript is the dominant language for the user-facing layer; Solidity/Rust for the on-chain contracts.',
    codeExample: `// wagmi + viem — modern web3 React stack
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { useAccount, useConnect, useReadContract } from 'wagmi';

const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

function WalletApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: balance } = useReadContract({
    address: '0xTokenAddress',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  });

  return isConnected ? (
    <div>Balance: {balance?.toString()}</div>
  ) : (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  );
}`,
    flashcards: [
      card('What is a dApp?', "Decentralized application — frontend is normal JS web app, backend is a smart contract on a blockchain (Ethereum, Solana, Polygon). User interacts via a wallet (MetaMask) that signs transactions. Examples: Uniswap, OpenSea, Aave."),
      card('ethers.js vs viem — which to pick?', 'ethers.js: older, established, broad community, large bundle. viem: newer (2023+), TypeScript-first, modular, smaller bundle, more performant. New projects mostly pick viem. ethers still dominant in older codebases.'),
      card('wagmi — what does it solve?', 'React hooks for Ethereum — `useAccount`, `useReadContract`, `useWriteContract`, `useConnect`. Wraps viem. Handles wallet connection, network switching, transaction state. Drops boilerplate significantly. Most modern dApps use wagmi.'),
      card('How do users sign transactions in a dApp?', "Browser wallet (MetaMask, Rainbow, Coinbase Wallet) injects `window.ethereum`. dApp requests a transaction via wagmi/viem; wallet shows confirmation popup; user approves; wallet broadcasts to blockchain. dApp never sees user's private keys."),
      card('Wallet connection libraries?', "RainbowKit (most popular UI), ConnectKit, Web3Modal, WalletConnect (cross-wallet protocol). They provide ready-made UI for wallet selection + connection. Wrap wagmi. Saves weeks of UI work."),
      card('When does building a dApp make sense?', "Crypto-native use cases — DeFi, NFTs, DAOs, token-gated content. When decentralization is a real product requirement. Bad fit: most consumer apps (custodial alternatives are simpler), regulated industries (compliance burden), apps where blockchain doesn't add user value."),
    ],
    refs: [
      ref('wagmi', 'https://wagmi.sh/'),
      ref('viem', 'https://viem.sh/'),
      ref('RainbowKit', 'https://www.rainbowkit.com/docs/introduction'),
    ],
  }));

  // Sub 14: Voice & Bot Apps
  skills.push(mk('Voice & Bot Apps', 'frontend', jsAppsSkill.id, {
    definition: 'Conversational apps on chat platforms (Discord, Slack, WhatsApp) and voice platforms (Alexa, Google Assistant). Lightweight, fast to ship, can reach huge audiences via existing platforms.',
    codeExample: `// Discord bot with discord.js
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
  if (message.content.startsWith('!ai ')) {
    const prompt = message.content.slice(4);
    const response = await llm.complete(prompt);
    await message.reply(response);
  }
});

client.login(process.env.DISCORD_TOKEN);`,
    flashcards: [
      card('Discord vs Slack bots — which platform when?', "Discord: communities, gaming, casual use, easier to ship without enterprise approval. Slack: work, enterprise users, B2B SaaS distribution. Both use similar architecture (webhook events + bot user account). Pick by where your users already are."),
      card('How do chat bots authenticate?', "Platform issues a bot token (Discord, Slack). Token used to authenticate API requests. Bot listens for events via WebSocket (Discord) or webhook (Slack). Never expose token client-side. Rotate on compromise."),
      card('Alexa Skills vs Google Actions — JS support?', 'Both have Node.js SDKs. Alexa Skills Kit (`ask-sdk-core`), Actions on Google (`@assistant/conversation`). Bot logic runs in Lambda or any Node-friendly serverless function. Voice apps are declining in mainstream use, but still niche-viable.'),
      card('WhatsApp bots — how?', 'Official: Twilio API, Meta Cloud API. Requires business verification, costs per message. Unofficial: whatsapp-web.js (uses browser automation — fragile, against ToS). Most production WhatsApp bots use Twilio for reliability.'),
      card('Common bot use cases?', "Community management (moderation, welcome messages, role assignment), developer tools (CI/CD notifications, PR review bots, deployment alerts), customer support (FAQ answering, ticket routing), notification digests, and entertainment (trivia, games)."),
      card('How do you deploy a chat bot in production?', "Discord bots need a persistent WebSocket connection — use a VPS (Railway, Fly.io, DigitalOcean, ~$5-10/mo) not serverless. Slack bots work with webhooks — Lambda or Vercel Functions fine. Keep the token in env vars, never in code. PM2 or Docker for reliability."),
    ],
    refs: [
      ref('discord.js', 'https://discord.js.org/'),
      ref('Slack Bolt SDK (Node)', 'https://slack.dev/bolt-js/'),
      ref('Twilio — WhatsApp API', 'https://www.twilio.com/en-us/whatsapp'),
    ],
  }));

  // Sub 15: Data Visualization & Dashboards
  skills.push(mk('Data Visualization & Dashboards', 'frontend', jsAppsSkill.id, {
    definition: 'Apps built primarily around charts, graphs, maps, and interactive data exploration. D3.js is the low-level engine; Recharts, Chart.js, and Observable Plot offer higher-level abstractions. Used in analytics platforms, monitoring dashboards, BI tools, financial reporting.',
    codeExample: `// Recharts — composable charts inside React
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const data = [
  { date: 'Jan', revenue: 42000, costs: 31000 },
  { date: 'Feb', revenue: 58000, costs: 34000 },
  { date: 'Mar', revenue: 67000, costs: 36000 },
];

function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(v) => \`₹\${v.toLocaleString()}\`} />
        <Line dataKey="revenue" stroke="#58CC02" strokeWidth={2} dot={false} />
        <Line dataKey="costs"   stroke="#FF4B4B" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}`,
    flashcards: [
      card('D3.js vs Recharts vs Chart.js — pick which?', 'D3.js: low-level, full control, steep learning curve — use for custom/novel chart types. Recharts: React-composable, sensible defaults — best for most dashboards. Chart.js: simple canvas-based, framework-agnostic — great for non-React projects or quick charts.'),
      card('When is D3.js worth the complexity?', "When you need chart types no library provides (custom geographic maps, force-directed graphs, complex hierarchical visualizations, animated transitions between data states). For bar/line/pie charts — use Recharts or Chart.js, not D3 directly."),
      card('What is Observable Plot?', "Mike Bostock's (D3 creator) higher-level successor to D3 for exploratory data visualization. Concise grammar-of-graphics API — build charts in 5 lines instead of 50. Excellent for data exploration, notebooks, internal tools. Less flexible than raw D3 for custom work."),
      card('How to handle large datasets in charts (100K+ points)?', "Downsampling (LTTB algorithm reduces points while preserving visual shape), WebGL rendering (deck.gl, ECharts WebGL mode) for millions of points, virtualized tables, server-side aggregation before sending to client. Canvas outperforms SVG beyond ~1000 elements."),
      card('WebGL for data visualization — when?', "Standard SVG/Canvas charts break above ~10K elements (frame drops, memory). WebGL renders millions of points at 60fps. Libraries: deck.gl (geospatial, large data), ECharts (built-in WebGL mode). Required for heatmaps, scatter plots with 100K+ points, real-time streaming data."),
      card('What is a headless chart library?', "Provides the data-processing and math layer (scales, ticks, layout) without rendering — you supply the SVG/Canvas drawing. Examples: Visx (Airbnb), Nivo (hooks-based). Gives D3-level control with React state integration. Good middle ground between Recharts and raw D3."),
    ],
    refs: [
      ref('D3.js', 'https://d3js.org/'),
      ref('Recharts', 'https://recharts.org/'),
      ref('Observable Plot', 'https://observablehq.com/plot/'),
    ],
  }));

  // Sub 16: Developer Tools & Plugin APIs
  skills.push(mk('Developer Tools & Plugin APIs', 'frontend', jsAppsSkill.id, {
    definition: 'VS Code extensions, Figma plugins, browser DevTools extensions, Webpack/Vite plugins — JavaScript has become the dominant language for tooling other developers use daily. These ecosystems offer large, captive audiences and low distribution friction.',
    codeExample: `// VS Code Extension — register a command
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand(
    'myExt.insertTimestamp',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      editor.edit((b) => b.insert(
        editor.selection.active,
        new Date().toISOString()
      ));
    }
  );
  context.subscriptions.push(cmd);
}

// package.json contribution point:
// "contributes": {
//   "commands": [{
//     "command": "myExt.insertTimestamp",
//     "title": "Insert Timestamp"
//   }]
// }`,
    flashcards: [
      card('What kinds of VS Code extensions can you build?', "Language features (syntax highlighting, LSP servers, hover docs), editor commands (code generation, formatting, refactoring), UI panels (sidebar webviews, tree views), snippets, themes/icon packs, and git/SCM providers. Most ship via marketplace with zero friction."),
      card('VS Code extension API — what can it access?', "Active editor + selections, workspace files (read/write), diagnostics (errors/warnings), terminals, tasks, git state, language services, status bar, notifications, and full webview panels (render any HTML/React inside the editor). Sandboxed — no arbitrary shell by default."),
      card('Figma plugin architecture?', "Figma plugins run in two sandboxed iframes: the plugin code (has access to Figma's document API — nodes, styles, components) and the UI (renders your HTML/React interface). Communication between them is via `postMessage`. Published in Figma Community, no app store review delay."),
      card('Vite plugin vs Webpack plugin — how different?', "Vite plugins use a Rollup-based hook system — simpler, more composable. Webpack plugins hook into a complex compilation lifecycle. Vite is the default for new projects; Webpack plugins are needed for large existing Webpack projects or loaders not yet ported."),
      card('Why build developer tools vs consumer apps?', "Developer tools have a passionate, vocal audience that advocates for good tools. Distribution is easy (npm, VS Code marketplace, Chrome Web Store). Users tolerate rough edges more than consumers. One popular extension → thousands of users without marketing spend."),
      card('What is a Language Server Protocol (LSP) server?', "A protocol that separates language intelligence (autocomplete, go-to-definition, hover docs, diagnostics) from the editor. Write one LSP server in JS/TS and it works in VS Code, Neovim, Emacs, JetBrains. Libraries: vscode-languageserver-node, tree-sitter for parsing."),
    ],
    refs: [
      ref('VS Code Extension API', 'https://code.visualstudio.com/api'),
      ref('Figma Plugin docs', 'https://www.figma.com/plugin-docs/'),
      ref('Vite Plugin API', 'https://vitejs.dev/guide/api-plugin.html'),
    ],
  }));

  return skills;
}
