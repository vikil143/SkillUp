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
      card('Explain dependency version conflicts.', 'A dependency version conflict can happen when App1 uses React 18 and App2 uses React 19. It can cause runtime issues, hook failures, and context mismatch. Solutions include shared dependency governance and singleton configuration.'),
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

  return skills;
}
