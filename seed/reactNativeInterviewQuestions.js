import { mk, uid } from './helpers.js';

const normalizeQuestion = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');

const card = (q, a) => ({ id: uid(), q, a });

const formatAnswer = ({
  short,
  detail,
  example,
  why,
  mistakes,
  followUps,
  difficulty,
  tags,
}) => `### Short Interview Answer
${short}

### Detailed Explanation
${detail}

### Practical Example
${example}

### Why Interviewers Ask This Question
${why}

### Common Mistakes
${mistakes.map((item) => `- ${item}`).join('\n')}

### Follow-Up Questions
${followUps.map((item) => `- ${item}`).join('\n')}

### Difficulty Level
${difficulty}

### Tags
${tags.map((item) => `#${item}`).join(' ')}`;

const qa = (q, answer) => card(q, formatAnswer(answer));

const ensureSkill = (skills, name, categoryId, parentId = null, depth = {}) => {
  let skill = skills.find((item) => item.name === name && item.categoryId === categoryId);
  if (!skill) {
    skill = mk(name, categoryId, parentId, {
      definition: `Interview questions and answers for ${name}.`,
      ...depth,
    });
    skills.push(skill);
  }
  if (!Array.isArray(skill.flashcards)) skill.flashcards = [];
  return skill;
};

const addUniqueCards = (skill, cards) => {
  const existing = new Set((skill.flashcards || []).map((item) => normalizeQuestion(item.q)));
  cards.forEach((item) => {
    const key = normalizeQuestion(item.q);
    if (!existing.has(key)) {
      skill.flashcards.push(item);
      existing.add(key);
    }
  });
};

export function addReactNativeInterviewQuestions(skills) {
  const firebaseParent = skills.find((item) => item.name === 'Firebase');

  const groups = [
    {
      name: 'JavaScript Interview Fundamentals',
      categoryId: 'frontend',
      cards: [
        qa('How do closures work in JavaScript and why do React Native developers care?', {
          short:
            'A closure is a function that keeps access to variables from its outer scope after that outer function has finished. In React Native it matters for callbacks, hooks, timers, subscriptions, and stale state bugs.',
          detail:
            'Every function is created with a lexical environment. When an inner function references outer variables, JavaScript keeps those bindings alive. This is powerful for encapsulation, but in React components it can capture old props or state if dependencies are wrong. Senior candidates should connect closures to `useCallback`, `useEffect`, event handlers, timers, and cleanup functions.',
          example:
            '`setInterval(() => setCount(count + 1), 1000)` inside an effect with an empty dependency array captures the first `count`. Use `setCount((value) => value + 1)` or include the right dependencies.',
          why:
            'It reveals whether the candidate understands JavaScript runtime behavior behind common React and React Native bugs.',
          mistakes: [
            'Saying closures copy values instead of retaining lexical bindings.',
            'Ignoring stale closures in hooks and async callbacks.',
            'Using dependencies randomly to silence lint warnings.',
          ],
          followUps: [
            'How does a stale closure appear in `useEffect`?',
            'When would you prefer a functional state update?',
            'How can `useRef` help with long-lived callbacks?',
          ],
          difficulty: 'Intermediate',
          tags: ['JavaScript', 'ReactNative', 'Closures', 'Hooks'],
        }),
        qa('What is the difference between microtasks and macrotasks in the JavaScript event loop?', {
          short:
            'Microtasks, such as promise callbacks, run after the current call stack before the next macrotask. Macrotasks include timers, I/O, and UI events. The order affects rendering, responsiveness, and async race conditions.',
          detail:
            'JavaScript executes one stack at a time. After the current synchronous work completes, the runtime drains the microtask queue before taking the next macrotask. A long chain of microtasks can starve rendering and input handling. React Native also has native/UI threads, but JS scheduling still matters for gesture responsiveness and bridge or JSI callback timing.',
          example:
            '`Promise.resolve().then(() => console.log("promise")); setTimeout(() => console.log("timer"), 0); console.log("sync");` prints `sync`, `promise`, `timer`.',
          why:
            'Interviewers use this to test async reasoning beyond memorizing `async/await` syntax.',
          mistakes: [
            'Assuming `setTimeout(fn, 0)` runs immediately.',
            'Thinking `await` blocks the whole app thread like synchronous I/O.',
            'Forgetting that too much JS work can still freeze RN interactions.',
          ],
          followUps: [
            'Where does `queueMicrotask` fit?',
            'How would you split heavy JS work in a mobile app?',
            'What happens when a promise chain recursively schedules more promises?',
          ],
          difficulty: 'Intermediate',
          tags: ['JavaScript', 'EventLoop', 'AsyncAwait', 'ReactNative'],
        }),
      ],
    },
    {
      name: 'React Interview Fundamentals',
      categoryId: 'frontend',
      cards: [
        qa('How do React reconciliation and keys affect rendering correctness?', {
          short:
            'Reconciliation compares the previous and next element trees and updates only the changed parts. Keys give React stable identity for list items, preventing wrong state reuse when items move, insert, or delete.',
          detail:
            'React does not diff arbitrary trees perfectly; it uses heuristics based on element type and key. If keys are unstable, React may reuse a component instance for the wrong item, causing incorrect input values, animation state, or row state. In React Native lists this can also lead to visual glitches and wasted renders.',
          example:
            'Use `keyExtractor={(item) => item.id}` in `FlatList`; avoid `index` when the order can change after filtering, sorting, pagination, or deletes.',
          why:
            'It tests whether the candidate can connect React internals to real UI bugs.',
          mistakes: [
            'Using array indexes as keys in dynamic lists.',
            'Thinking keys are passed as normal props.',
            'Adding random keys, which forces remounts every render.',
          ],
          followUps: [
            'When is an index key acceptable?',
            'How can bad keys break controlled inputs?',
            'How does `React.memo` interact with list row components?',
          ],
          difficulty: 'Intermediate',
          tags: ['React', 'Reconciliation', 'Keys', 'ReactNative'],
        }),
        qa('When should you use `useMemo` and `useCallback` in React?', {
          short:
            '`useMemo` caches computed values and `useCallback` caches function identities. Use them when identity stability or expensive computation matters, not as default decoration.',
          detail:
            'Memoization has overhead and can make code harder to reason about. It is useful when passing callbacks to memoized children, stabilizing effect dependencies, avoiding expensive recalculation, or optimizing large RN lists. It does not stop the parent from rendering and it does not guarantee a child will skip rendering unless the child also compares props.',
          example:
            'Memoize a `renderItem` callback passed to `FlatList` when row rendering is expensive and row components are memoized.',
          why:
            'It distinguishes practical performance judgment from cargo-cult hook usage.',
          mistakes: [
            'Wrapping every function in `useCallback` without measuring.',
            'Missing dependencies and creating stale values.',
            'Expecting memoization to fix slow native image or network work.',
          ],
          followUps: [
            'How do you profile whether memoization helped?',
            'What is referential equality?',
            'How can memoization hide a stale closure bug?',
          ],
          difficulty: 'Intermediate',
          tags: ['React', 'Hooks', 'Performance', 'Memoization'],
        }),
      ],
    },
    {
      name: 'React Native Interview Fundamentals',
      categoryId: 'mobile',
      cards: [
        qa('How does React Native render native UI without using a WebView?', {
          short:
            'React Native runs JavaScript to describe a component tree, then creates real native views on iOS and Android. It does not render HTML, CSS, or a DOM inside a browser.',
          detail:
            'React components produce a native shadow tree and view operations. In the legacy architecture, JS communicated serialized messages over the bridge. In the New Architecture, Fabric and JSI reduce serialization and allow tighter integration with native rendering. The result is native UI primitives controlled by React semantics.',
          example:
            '`<View>` maps to native container views and `<Text>` maps to platform text views, while styling is converted into Yoga layout and native style updates.',
          why:
            'This checks whether the candidate understands React Native as a native runtime, not a web wrapper.',
          mistakes: [
            'Calling React Native a WebView framework.',
            'Assuming all CSS and browser APIs are available.',
            'Ignoring platform-specific native behavior.',
          ],
          followUps: [
            'What is Yoga layout?',
            'What runs on the JS thread versus the UI thread?',
            'How does Fabric change rendering?',
          ],
          difficulty: 'Intermediate',
          tags: ['ReactNative', 'Architecture', 'NativeRendering'],
        }),
        qa('How should a React Native app handle app lifecycle transitions?', {
          short:
            'Use `AppState`, navigation focus events, and native lifecycle awareness to pause work in the background, refresh stale data on foreground, and persist critical state before interruption.',
          detail:
            'Mobile apps can be backgrounded, killed, resumed from a push, or reopened through a deep link. A robust app treats lifecycle transitions as normal, not exceptional. It pauses polling and location listeners in the background, refreshes data when returning active, saves drafts, and avoids assuming the JS process lived forever.',
          example:
            'On `AppState` becoming `active`, run a lightweight sync for pending offline mutations and refetch sensitive account balances.',
          why:
            'It probes production mobile thinking around battery, data freshness, and OS constraints.',
          mistakes: [
            'Leaving timers, sockets, or location watchers running unnecessarily.',
            'Assuming background execution is unlimited.',
            'Not testing cold start from push notification or deep link.',
          ],
          followUps: [
            'How do lifecycle events differ on iOS and Android?',
            'How would you restore navigation state after process death?',
            'What work should never rely only on background execution?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'AppLifecycle', 'MobileArchitecture'],
        }),
      ],
    },
    {
      name: 'React Native New Architecture Interview',
      categoryId: 'mobile',
      cards: [
        qa('What problems did the old React Native bridge architecture have?', {
          short:
            'The old bridge serialized asynchronous messages between JS and native. This created overhead, made high-frequency communication expensive, forced async native APIs, and limited concurrent rendering capabilities.',
          detail:
            'The bridge batched JSON-like payloads between separate worlds. That worked for many apps, but it became a bottleneck for gestures, animations, synchronous layout reads, and modules that needed many small calls. It also loaded native modules eagerly and made type mismatches easier to discover only at runtime.',
          example:
            'A scroll-linked animation that sends values across the bridge every frame can drop frames; Reanimated worklets and JSI avoid that path.',
          why:
            'Interviewers ask this to see if the candidate understands why the New Architecture exists.',
          mistakes: [
            'Saying the bridge was always slow for every app.',
            'Ignoring that many performance issues still come from bad JS rendering.',
            'Confusing Hermes, JSI, Fabric, and TurboModules as the same thing.',
          ],
          followUps: [
            'What does JSI change?',
            'What does Fabric own?',
            'Why are TurboModules lazily loaded?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'NewArchitecture', 'Bridge', 'JSI'],
        }),
        qa('What is Codegen in React Native New Architecture?', {
          short:
            'Codegen generates native interface code from typed JavaScript or TypeScript specs for TurboModules and Fabric components.',
          detail:
            'Instead of relying on loosely typed runtime method names and payloads, Codegen creates platform glue code that both JS and native implementations agree on. This improves type safety, reduces boilerplate, and helps native modules work consistently across Android, iOS, and C++ layers.',
          example:
            'A `NativeBattery` TurboModule spec can declare `getLevel(): Promise<number>` and `isCharging(): boolean`; Codegen produces the native stubs required to implement that contract.',
          why:
            'It checks whether the candidate has moved beyond headline-level New Architecture knowledge.',
          mistakes: [
            'Treating Codegen as a bundler or transpiler replacement.',
            'Skipping typed specs and expecting old module exports to become TurboModules automatically.',
            'Forgetting that native implementations are still required.',
          ],
          followUps: [
            'How do TurboModule specs differ from legacy native module registration?',
            'What kinds of methods should be synchronous?',
            'How would you migrate an existing native module?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Codegen', 'TurboModules', 'Fabric'],
        }),
      ],
    },
    {
      name: 'Native Modules Interview',
      categoryId: 'mobile',
      cards: [
        qa('When should you create a custom native module in React Native?', {
          short:
            'Create a native module when the app needs platform APIs, SDKs, performance characteristics, or synchronous native access that JavaScript and existing libraries cannot provide safely.',
          detail:
            'Native modules add maintenance cost across iOS, Android, build tooling, testing, and architecture compatibility. A strong candidate evaluates whether a maintained community library exists, whether the logic truly belongs native-side, and how the module will behave under legacy and New Architecture setups.',
          example:
            'A banking app may need a native SDK for device attestation or biometric signing that cannot be implemented in plain JavaScript.',
          why:
            'It evaluates architectural judgment, not just ability to write Kotlin or Swift glue code.',
          mistakes: [
            'Building native modules for simple business logic that belongs in JS.',
            'Ignoring threading and lifecycle constraints.',
            'Not designing error shapes and type contracts clearly.',
          ],
          followUps: [
            'How would you expose errors from native to JS?',
            'How do you test a native module?',
            'How does a TurboModule differ from a legacy module?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'NativeModules', 'Android', 'iOS'],
        }),
        qa('How is communication with native code different in the New Architecture?', {
          short:
            'The New Architecture uses JSI, TurboModules, Fabric, and Codegen to provide more direct, typed, and sometimes synchronous communication with native code instead of only serialized async bridge messages.',
          detail:
            'Legacy native modules exported methods to the bridge and returned results asynchronously. TurboModules can be lazily loaded and accessed through JSI host objects. Fabric components are described by typed specs and rendered through the new renderer. This reduces overhead but also requires stricter native contracts.',
          example:
            'A synchronous `getConstants()`-style read can be modeled as a TurboModule method when it is fast and safe, while network or disk operations should remain async.',
          why:
            'It shows whether the candidate can reason about migration and native library compatibility.',
          mistakes: [
            'Making slow disk or network calls synchronous.',
            'Assuming every old native module automatically supports New Architecture.',
            'Forgetting to keep platform implementations behaviorally identical.',
          ],
          followUps: [
            'What makes a synchronous native method safe or unsafe?',
            'What does Codegen generate for Android and iOS?',
            'How do you support both architectures during migration?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'NativeModules', 'NewArchitecture', 'JSI'],
        }),
      ],
    },
    {
      name: 'State Management Interview',
      categoryId: 'state',
      cards: [
        qa('When would you choose Redux Toolkit over Context API in a React Native app?', {
          short:
            'Choose Redux Toolkit for complex shared state, predictable updates, dev tooling, middleware, async workflows, and cross-screen consistency. Use Context for low-frequency dependency or preference state.',
          detail:
            'Context is a propagation mechanism, not a full state management architecture. Redux Toolkit gives structured slices, immutable updates through Immer, serializable actions, middleware, and time-travel-friendly debugging. In RN, Redux is often appropriate for auth/session state, normalized entities, offline queues, and multi-screen business flows.',
          example:
            'Use Context for theme and locale; use Redux Toolkit for a cart, order lifecycle, sync queue, and authenticated user state.',
          why:
            'It tests whether candidates can choose tools based on complexity and update frequency.',
          mistakes: [
            'Using Context for frequently changing large objects and causing broad re-renders.',
            'Adding Redux for tiny isolated component state.',
            'Putting non-serializable navigation objects into Redux.',
          ],
          followUps: [
            'How does RTK Query change API state management?',
            'What belongs in local component state?',
            'How would you persist selected Redux slices?',
          ],
          difficulty: 'Intermediate',
          tags: ['ReactNative', 'ReduxToolkit', 'ContextAPI', 'StateManagement'],
        }),
        qa('How does Zustand differ from Redux for React Native state management?', {
          short:
            'Zustand is a small store library with selector-based subscriptions and minimal boilerplate. Redux is more structured, action-centric, and better suited to large teams needing strict conventions and middleware ecosystems.',
          detail:
            'Zustand can be excellent for focused app state because components subscribe only to selected slices. Redux Toolkit provides stronger conventions, serializable actions, predictable reducers, and mature debugging. The choice depends on team size, domain complexity, persistence, auditability, and async requirements.',
          example:
            'A media app might use Zustand for player state and filters; a fintech app with auditable transaction flows may prefer Redux Toolkit conventions.',
          why:
            'It reveals whether the candidate has used modern state tools pragmatically.',
          mistakes: [
            'Choosing based only on popularity.',
            'Ignoring selector equality and causing unnecessary renders.',
            'Mixing several global stores without ownership rules.',
          ],
          followUps: [
            'How do selectors prevent re-renders?',
            'How would you persist Zustand state securely?',
            'When would server cache state not belong in either store?',
          ],
          difficulty: 'Intermediate',
          tags: ['ReactNative', 'Zustand', 'Redux', 'StateManagement'],
        }),
      ],
    },
    {
      name: 'API Integration Interview',
      categoryId: 'backend',
      cards: [
        qa('How do you implement reliable API retries in a React Native app?', {
          short:
            'Retry only safe or explicitly idempotent operations, use exponential backoff with jitter, respect server retry hints, and stop retrying when the user or request context is no longer valid.',
          detail:
            'Retries can improve resilience but can also duplicate payments, orders, or writes. GET requests are usually safe to retry; POST requests need idempotency keys or server-side duplicate detection. Mobile apps should handle flaky networks, app backgrounding, token expiry, and cancellation.',
          example:
            'For `POST /orders`, send `Idempotency-Key: <uuid>` so a retry returns the original order result instead of creating a second order.',
          why:
            'It tests production API thinking under unreliable mobile networks.',
          mistakes: [
            'Retrying all failures blindly.',
            'Retrying validation or authorization errors.',
            'Using synchronized retries without jitter and causing request spikes.',
          ],
          followUps: [
            'Which HTTP status codes are retryable?',
            'How do idempotency keys work?',
            'How would you cancel retries when a screen unmounts?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'API', 'Retries', 'Idempotency'],
        }),
        qa('How do you handle request cancellation in React Native?', {
          short:
            'Use `AbortController` for fetch-compatible requests, cancel Axios requests with its supported cancellation API, and guard state updates after unmount or stale responses.',
          detail:
            'Cancellation prevents wasted network work and avoids setting state from an obsolete request. It is especially important for typeahead, search filters, navigation changes, and slow networks. Cancellation should be paired with request identity checks because a server may still process a request after the client aborts.',
          example:
            'Create an `AbortController` inside `useEffect`, pass `signal` to `fetch`, and call `controller.abort()` in cleanup.',
          why:
            'Interviewers want to know if candidates prevent race conditions and memory leak warnings in async UI.',
          mistakes: [
            'Only checking `isMounted` while leaving the network request running.',
            'Treating cancellation errors as user-visible failures.',
            'Not handling out-of-order responses from rapid searches.',
          ],
          followUps: [
            'How do you debounce search plus cancel old requests?',
            'Can aborting a request roll back server-side work?',
            'How does cancellation interact with retries?',
          ],
          difficulty: 'Intermediate',
          tags: ['ReactNative', 'Fetch', 'Axios', 'Cancellation'],
        }),
      ],
    },
    {
      name: 'Offline First Architecture Interview',
      categoryId: 'state',
      cards: [
        qa('What is Offline First architecture in a mobile app?', {
          short:
            'Offline First means the app can read and write useful data locally first, then sync with the server when connectivity returns.',
          detail:
            'The local database becomes the immediate source of truth for the UI. Writes are stored as pending operations, the UI updates optimistically, and a sync engine uploads changes later. The backend must support conflict detection, idempotency, and reconciliation. Offline First is a product and architecture decision, not just adding AsyncStorage.',
          example:
            'A field-sales order app saves orders in SQLite/MMKV/Realm while offline, shows them as pending, then syncs them with idempotency keys when network returns.',
          why:
            'It tests system design skills for real mobile conditions: poor connectivity, battery constraints, and user trust.',
          mistakes: [
            'Calling cached reads Offline First while writes fail offline.',
            'Using AsyncStorage as a relational database.',
            'Ignoring conflict resolution and retry visibility.',
          ],
          followUps: [
            'How do you model a pending mutation queue?',
            'When would you choose SQLite over MMKV?',
            'How should the UI show sync state?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'OfflineFirst', 'Architecture', 'Sync'],
        }),
        qa('How do you handle conflict resolution when offline data syncs later?', {
          short:
            'Use versioning or timestamps to detect conflicts, define domain-specific merge rules, and make irreversible or financial conflicts explicit instead of silently overwriting.',
          detail:
            'Conflict resolution depends on domain risk. Some fields can use last-write-wins, some can merge, and some require user or server review. Strong systems track base version, local changes, server version, operation IDs, and sync status. The UI should communicate pending, failed, and conflict states clearly.',
          example:
            'For an offline order quantity edit, send `baseVersion`; if the server version changed, return a conflict requiring recalculation of stock and price before final confirmation.',
          why:
            'It reveals whether the candidate understands that sync correctness is a business rule problem.',
          mistakes: [
            'Using last-write-wins for money, inventory, or compliance data.',
            'Not storing enough metadata to explain a conflict.',
            'Hiding failed sync and letting users believe data was saved remotely.',
          ],
          followUps: [
            'What is optimistic UI?',
            'How do vector clocks differ from simple versions?',
            'How would you retry failed sync safely?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'OfflineFirst', 'ConflictResolution', 'Sync'],
        }),
      ],
    },
    {
      name: 'Firebase Interview',
      categoryId: 'databases',
      parentId: firebaseParent?.id || null,
      cards: [
        qa('How does Google Login work with Firebase Authentication in React Native?', {
          short:
            'The app obtains a Google ID token through the native Google sign-in flow, sends that credential to Firebase Auth, and Firebase creates or signs in the Firebase user.',
          detail:
            'Google is the identity provider, while Firebase Auth is the auth broker used by the app. The native SDK handles account selection and obtains Google tokens. Firebase verifies the credential, links it to a Firebase user, and issues Firebase ID and refresh tokens. Backend APIs should verify Firebase ID tokens server-side.',
          example:
            'Use Google Sign-In to get `idToken`, build `GoogleAuthProvider.credential(idToken)`, then call `signInWithCredential(auth, credential)`.',
          why:
            'It checks whether the candidate understands OAuth/OIDC boundaries rather than treating social login as magic.',
          mistakes: [
            'Trusting only the email returned on the client.',
            'Confusing Google access tokens with Firebase ID tokens.',
            'Not handling account linking and revoked credentials.',
          ],
          followUps: [
            'What should your backend verify in a Firebase ID token?',
            'How do you handle Apple Login private relay email?',
            'How do refresh tokens work in Firebase Auth?',
          ],
          difficulty: 'Intermediate',
          tags: ['ReactNative', 'Firebase', 'Authentication', 'OAuth'],
        }),
        qa('How should React Native handle FCM tokens and notification delivery states?', {
          short:
            'Store the current FCM token per device, update it on token refresh, request permissions appropriately, and handle foreground, background, and terminated notification paths separately.',
          detail:
            'FCM tokens can rotate, users can revoke notification permission, and delivery is best effort. The app should register tokens after auth, remove or mark them on logout, and sync token changes to the backend. Foreground messages often require local notification display; background and terminated paths require native configuration and careful navigation handling.',
          example:
            'When `onTokenRefresh` fires, call an authenticated API like `PUT /devices/{deviceId}/push-token` with the new token and platform metadata.',
          why:
            'Push notifications are common in production RN apps and fail subtly when lifecycle states are ignored.',
          mistakes: [
            'Assuming FCM tokens never change.',
            'Navigating immediately from a notification before navigation is ready.',
            'Relying on push delivery for critical state instead of syncing on foreground.',
          ],
          followUps: [
            'What is a data-only push?',
            'How do APNs and FCM interact on iOS?',
            'How would you test terminated-state notification handling?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Firebase', 'FCM', 'PushNotifications'],
        }),
      ],
    },
    {
      name: 'Mobile Security Interview',
      categoryId: 'auth',
      cards: [
        qa('Where should access tokens and refresh tokens be stored in a React Native app?', {
          short:
            'Store sensitive tokens in platform secure storage backed by iOS Keychain and Android Keystore. Avoid AsyncStorage for secrets because it is not encrypted by default.',
          detail:
            'Access tokens should be short-lived. Refresh tokens need stronger protection, rotation, revocation, and logout cleanup. Secure storage reduces casual extraction risk but does not make a compromised device safe. High-risk apps add device binding, biometric gates, jailbreak/root signals, and server-side anomaly detection.',
          example:
            'Use a library backed by Keychain/Keystore for refresh tokens, keep access tokens in memory when practical, and refresh them as needed.',
          why:
            'Token storage is a core mobile security topic with direct production risk.',
          mistakes: [
            'Putting refresh tokens in AsyncStorage or Redux persistence.',
            'Assuming Keychain/Keystore removes the need for server revocation.',
            'Logging tokens during debugging or crash reporting.',
          ],
          followUps: [
            'How do refresh token rotation and reuse detection work?',
            'What changes on rooted or jailbroken devices?',
            'How would you design logout across multiple devices?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Security', 'Tokens', 'Keychain', 'Keystore'],
        }),
        qa('What is SSL pinning and when should a React Native app use it?', {
          short:
            'SSL pinning makes the app accept only specific server certificates or public keys, reducing risk from malicious or compromised certificate authorities and some MITM attacks.',
          detail:
            'Normal TLS trusts a system CA store. Pinning narrows trust to known certificates or public keys for selected domains. It is useful for high-risk apps such as banking or payments, but it adds operational risk: certificate rotation, backup pins, incident response, and app update timelines must be planned.',
          example:
            'A fintech app pins the API public key and ships a backup pin before rotating certificates on the backend.',
          why:
            'It tests security depth and whether the candidate understands trade-offs, not just buzzwords.',
          mistakes: [
            'Pinning leaf certificates without a rotation plan.',
            'Breaking staging or proxy debugging accidentally.',
            'Thinking pinning replaces normal auth, encryption, or server validation.',
          ],
          followUps: [
            'Certificate pinning vs public key pinning?',
            'How do you handle certificate rotation?',
            'Can SSL pinning be bypassed on a compromised device?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Security', 'SSLPinning', 'MITM'],
        }),
      ],
    },
    {
      name: 'React Native Performance Interview',
      categoryId: 'perf',
      cards: [
        qa('How do you optimize a large `FlatList` in React Native?', {
          short:
            'Use stable keys, memoized rows, tuned virtualization props, `getItemLayout` when item height is known, lightweight row components, and avoid nested `ScrollView` wrappers.',
          detail:
            '`FlatList` virtualizes rendering, but bad props or row design can still cause jank. Performance depends on render cost, image loading, item measurement, state updates, and JS thread pressure. For very large or complex lists, FlashList can improve measurement and recycling behavior, but row design still matters.',
          example:
            'Use `React.memo(Row)`, `keyExtractor`, `renderItem` with `useCallback`, `getItemLayout` for fixed-height rows, and paginated data loading.',
          why:
            'Lists are one of the most common sources of RN performance problems.',
          mistakes: [
            'Putting `FlatList` inside `ScrollView`.',
            'Using inline heavy computations in `renderItem`.',
            'Expecting `React.memo` to help while passing new object props every render.',
          ],
          followUps: [
            'When would you choose FlashList?',
            'What does `windowSize` control?',
            'How do images affect list performance?',
          ],
          difficulty: 'Intermediate',
          tags: ['ReactNative', 'Performance', 'FlatList', 'FlashList'],
        }),
        qa('How do you diagnose unnecessary re-renders in React Native?', {
          short:
            'Profile first, then inspect changing props, state placement, context updates, unstable object/function identities, and expensive row or screen components.',
          detail:
            'A re-render is not automatically a bug; expensive or frequent re-renders are. Use React DevTools Profiler, render counters, Flipper or RN DevTools where applicable, and production traces. Fixes include moving state down, splitting context, memoizing selectively, using selectors, and reducing prop churn.',
          example:
            'If every list row re-renders when a search input changes, move search state away from rows and ensure row props are stable and selected by item id.',
          why:
            'It checks practical performance debugging instead of memorized hook names.',
          mistakes: [
            'Adding `useMemo` everywhere without profiling.',
            'Ignoring Context provider value identity.',
            'Optimizing render while the real issue is slow network, images, or native layout.',
          ],
          followUps: [
            'How does context cause broad re-renders?',
            'What is prop identity churn?',
            'How would you measure JS thread blocking?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Performance', 'Rendering', 'Profiling'],
        }),
      ],
    },
    {
      name: 'Debugging & Monitoring Interview',
      categoryId: 'perf',
      cards: [
        qa('How do Sentry and Firebase Crashlytics complement each other in React Native?', {
          short:
            'Sentry is strong for JavaScript errors, releases, breadcrumbs, and performance traces. Crashlytics is strong for native crash reporting on iOS and Android. Many RN apps use both.',
          detail:
            'React Native has JS and native failure modes. A JS exception may not appear as a native crash, while a native SDK crash may not include useful JS context. Good monitoring includes release/version tags, user/session metadata, breadcrumbs, source maps, dSYM uploads, ProGuard mappings, and privacy-safe logging.',
          example:
            'A checkout crash might show a JS stack in Sentry and a native payment SDK crash in Crashlytics; matching release, user id hash, and timestamp connects the story.',
          why:
            'It tests production debugging maturity across the hybrid RN stack.',
          mistakes: [
            'Uploading source maps publicly or not uploading them at all.',
            'Missing dSYM or ProGuard mapping files.',
            'Logging PII, tokens, or payment details in breadcrumbs.',
          ],
          followUps: [
            'What is a non-fatal error?',
            'How do release tags help regression debugging?',
            'How do you capture handled promise rejections?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Sentry', 'Crashlytics', 'Monitoring'],
        }),
        qa('How would you debug a production-only React Native crash?', {
          short:
            'Start with crash reports, release metadata, device/OS patterns, source maps or native symbols, recent changes, and a minimal reproduction path. Then verify with a release-like build.',
          detail:
            'Production-only crashes often involve minification, native build config, permissions, device-specific behavior, race conditions, or missing assets. Debugging requires symbolicated stacks, logs around the failing flow, feature flags, and comparison between debug and release builds. The fix should include regression coverage or monitoring.',
          example:
            'If Android release crashes only after login, check R8/ProGuard keep rules for auth or Firebase native classes and test a signed release build locally.',
          why:
            'It measures real incident-response skill.',
          mistakes: [
            'Trying to reproduce only in debug mode.',
            'Ignoring release artifacts like mappings and dSYMs.',
            'Shipping blind fixes without adding observability.',
          ],
          followUps: [
            'How do you symbolicate iOS crashes?',
            'How do ProGuard mappings work?',
            'When would you use a kill switch or feature flag?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Debugging', 'Crashlytics', 'Production'],
        }),
      ],
    },
    {
      name: 'CI/CD Interview',
      categoryId: 'devops',
      cards: [
        qa('How do you design a CI/CD pipeline for a React Native app?', {
          short:
            'Run lint, type checks, tests, security checks, versioning, platform builds, signing, artifact upload, and staged distribution with environment-specific configuration.',
          detail:
            'RN CI/CD spans JavaScript and native ecosystems. Android needs Gradle, keystores, and Play artifacts; iOS needs certificates, provisioning profiles, Xcode, and App Store Connect. A mature pipeline separates PR validation from release builds, caches safely, protects secrets, and records build provenance.',
          example:
            'A GitHub Actions setup can run JS tests on every PR, then use Fastlane or EAS to create signed internal builds when a release tag is pushed.',
          why:
            'It tests whether the candidate has shipped mobile apps, not just built screens.',
          mistakes: [
            'Storing signing credentials directly in the repo.',
            'Using production Firebase or API config in debug builds.',
            'Skipping release build tests until the day of submission.',
          ],
          followUps: [
            'How do you manage iOS certificates in CI?',
            'How do you separate staging and production builds?',
            'What should block a release pipeline?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'CICD', 'Fastlane', 'GitHubActions'],
        }),
        qa('How should environment variables be managed in React Native builds?', {
          short:
            'Treat mobile environment config as build-time or runtime configuration, keep secrets off the client, and generate separate signed builds for staging and production when behavior differs.',
          detail:
            'Anything bundled into a mobile app can be extracted. API base URLs, feature flags, and public keys may be included, but server secrets must stay backend-side. CI should inject environment-specific values, validate required config, and prevent accidental production endpoints in test builds.',
          example:
            'Use separate Firebase plist/json files for staging and production, selected by build variant or scheme, while private service credentials remain on the server.',
          why:
            'It checks security and release discipline.',
          mistakes: [
            'Putting API secrets in `.env` and assuming they are hidden.',
            'Changing config manually before builds.',
            'Not making the active environment visible in internal QA builds.',
          ],
          followUps: [
            'What config is safe to ship in a mobile app?',
            'How do Android product flavors help?',
            'How do iOS schemes map to environments?',
          ],
          difficulty: 'Intermediate',
          tags: ['ReactNative', 'CICD', 'EnvironmentVariables', 'Security'],
        }),
      ],
    },
    {
      name: 'Fintech & Banking Interview',
      categoryId: 'payments',
      cards: [
        qa('How would you design a secure UPI or mobile payment flow in React Native?', {
          short:
            'Keep payment authority on the backend, use tokenized provider flows, protect device/session state, require idempotency, verify final status server-side, and never trust only the client callback.',
          detail:
            'The RN app should initiate payment intent creation through the backend, hand off to a trusted PSP or UPI app/SDK, receive a callback, and then ask the backend for authoritative status. Security controls include TLS, optional pinning, device binding, secure token storage, risk checks, audit logs, and careful handling of retries and pending states.',
          example:
            'Create `paymentAttemptId` on the server, open the provider SDK, then poll or subscribe to backend status until it becomes `success`, `failed`, or `pending_review`.',
          why:
            'Fintech interviews test correctness under money movement, compliance, and hostile conditions.',
          mistakes: [
            'Marking payment successful based only on a client-side callback.',
            'Allowing duplicate payment attempts without idempotency.',
            'Logging sensitive payment details in analytics or crash tools.',
          ],
          followUps: [
            'How do payment webhooks fit into the flow?',
            'How do you handle pending UPI transactions?',
            'What should be audited for a transaction?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Fintech', 'UPI', 'Payments', 'Security'],
        }),
        qa('How do payment retries work without double-charging the user?', {
          short:
            'Use idempotency keys, server-side payment attempt records, provider status reconciliation, and clear UI states for pending, failed, and retryable outcomes.',
          detail:
            'A retry should not blindly create a new charge. The backend should know whether the previous attempt is still pending, failed safely, or succeeded. Provider webhooks and status APIs are the source of truth. The client should disable duplicate taps, show pending states honestly, and retry only through backend-approved flows.',
          example:
            'If the app times out after starting payment, it sends the same `paymentAttemptId`; the backend checks provider status before allowing a new attempt.',
          why:
            'It tests distributed-systems thinking in a high-stakes domain.',
          mistakes: [
            'Treating client timeout as payment failure.',
            'Creating a fresh order for every retry tap.',
            'Not reconciling webhook and client callback order.',
          ],
          followUps: [
            'What is an idempotency key?',
            'How do you handle webhook replay?',
            'How do you design the transaction state machine?',
          ],
          difficulty: 'Advanced',
          tags: ['ReactNative', 'Fintech', 'Payments', 'Idempotency'],
        }),
      ],
    },
  ];

  groups.forEach(({ name, categoryId, parentId, cards }) => {
    const skill = ensureSkill(skills, name, categoryId, parentId, {
      whenUsed:
        'Use this as a React Native interview preparation bank for mid-level, senior, and lead developer interviews.',
      gotchas:
        'Answers should be technically accurate, concise enough for interviews, and deep enough to support follow-up discussion.',
    });
    addUniqueCards(skill, cards);
  });

  return skills;
}
