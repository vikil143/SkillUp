// seed/skills/design-patterns.js — Design Patterns skills
import { mk, uid } from '../helpers.js';

export default function buildDesignPatternSkills() {
  // Individual pattern stubs (Phase 9 — kept as-is)
  const singleton = mk('Singleton', 'design-patterns', null, {
    definition: 'Ensures a class has only one instance and provides a global access point.',
  });
  const factory = mk('Factory', 'design-patterns', null, {
    definition: 'Creates objects without specifying the exact class. Subclasses decide what to instantiate.',
  });
  const observer = mk('Observer', 'design-patterns', null, {
    definition: 'One-to-many dependency — when subject changes, all observers notified. Foundation of event systems.',
  });
  const strategy = mk('Strategy', 'design-patterns', null, {
    definition: 'Defines a family of algorithms, makes them interchangeable at runtime.',
  });
  const repository = mk('Repository', 'design-patterns', null, {
    definition: 'Abstracts data access behind a collection-like interface. Decouples domain logic from persistence.',
  });
  const decorator = mk('Decorator', 'design-patterns', null, {
    definition: 'Attaches additional responsibilities to an object dynamically. Flexible alternative to subclassing.',
  });

  // ── Top-level meta-skill ────────────────────────────────────────────────────
  const dpSkill = mk('Design Patterns Mastery', 'design-patterns', null, {
    definition: "Reusable, named solutions to recurring software design problems. Patterns aren't code you copy — they're structural and behavioral approaches that reduce coupling, improve maintainability, and give teams shared vocabulary. Senior engineers know when to apply them AND when not to.",
    codeExample: `// Three pattern categories
//
// Creational  — how objects are created (Singleton, Factory, Builder)
// Structural  — how objects are composed (Adapter, Decorator, Facade, Proxy)
// Behavioral — how objects communicate (Observer, Strategy, State, Command)
//
// Plus architectural patterns (DI, Repository, CQRS, Event-Driven)
// and React-specific patterns (Composition, Provider, HOC, Custom Hooks).

// Strategy pattern (behavioral) — pick algorithm at runtime
class Payment {
  constructor(strategy) { this.strategy = strategy; }
  process(amount) { return this.strategy.pay(amount); }
}

class UPI { pay(a) { /* upi flow */ } }
class Card { pay(a) { /* card flow */ } }

new Payment(new UPI()).process(500);`,
    whenUsed: 'Stock Trading Platform (Observer pattern via WebSocket → store → components). Dynamic Content Editor (Adapter for legacy API responses, Facade over microfrontend modules). Maak / Packarma (Strategy for payment provider selection).',
    gotchas: `Using patterns where simple code suffices — overengineering is a senior anti-pattern.
Treating patterns as goals instead of tools — "I used Factory + Builder + Strategy" isn't a flex.
Singleton everywhere → hidden global state, untestable code.
Deep inheritance hierarchies — composition almost always beats inheritance in modern systems.
Premature abstraction — building plugin systems before you have plugins.`,
    flashcards: [
      { id: uid(), q: 'What is a design pattern?', a: 'A reusable, named solution to a recurring software design problem. Not code you copy — a structural/behavioral approach. Gives teams shared vocabulary ("Singleton", "Observer") instead of redescribing solutions.' },
      { id: uid(), q: 'Why do we use design patterns?', a: 'Reduces repeated problems, improves readability, makes scaling easier, reduces coupling, and gives teams a shared language. Instead of "I created one global object" → "I used Singleton."' },
      { id: uid(), q: 'Algorithm vs design pattern — difference?', a: 'Algorithm solves a computation problem with step-by-step logic (binary search). Pattern solves a design/architecture problem with a structural approach (factory pattern). Algorithms are about logic; patterns about organization.' },
      { id: uid(), q: 'Three main categories of design patterns?', a: 'Creational (object creation — Singleton, Factory, Builder), Structural (composition — Adapter, Decorator, Facade, Proxy), Behavioral (communication — Observer, Strategy, State, Command, Chain of Responsibility).' },
      { id: uid(), q: 'Design pattern vs framework?', a: 'Pattern: a concept, small, flexible, language-agnostic. Framework: ready-made opinionated structure, larger, prescribes architecture. Patterns are ingredients; frameworks are dishes.' },
      { id: uid(), q: 'Common anti-patterns in software?', a: 'God Object (one class doing everything), Spaghetti Code (no structure), Massive Components (UI mixed with logic), Premature Abstraction (over-engineering for imaginary needs), Singleton-everywhere (hidden global state).' },
      { id: uid(), q: 'How do patterns connect to SOLID principles?', a: 'Many patterns implement SOLID: Strategy → Open/Closed (extend without modifying), Dependency Injection → Dependency Inversion (depend on abstractions). SOLID is the foundation; patterns are common applications of it.' },
      { id: uid(), q: 'How does a senior engineer think about patterns?', a: 'Asks: is the problem repeating? Will multiple implementations exist? Is coupling becoming painful? Is testing hard? If no — simple code beats pattern. Patterns are tools, not goals.' },
      { id: uid(), q: 'Best "good engineer" answer about patterns in interviews?', a: '"I use patterns when they simplify scaling or maintenance, not just because the pattern exists." Shows maturity, pragmatism, and awareness of overengineering risk.' },
      { id: uid(), q: 'Most important patterns for a senior frontend engineer?', a: 'Composition, Observer, Strategy, Factory, Dependency Injection, Provider (React), Custom Hooks (React), Repository, Pub/Sub, Circuit Breaker (for distributed). Plus knowing SOLID and when NOT to use patterns.' },
    ],
    apis: [],
    refs: [
      { id: uid(), title: 'Refactoring Guru — Design Patterns', url: 'https://refactoring.guru/design-patterns', type: 'docs' },
      { id: uid(), title: 'Patterns.dev — Modern web patterns', url: 'https://www.patterns.dev/', type: 'docs' },
      { id: uid(), title: 'JavaScript Design Patterns (Addy Osmani, free book)', url: 'https://www.patterns.dev/', type: 'article' },
      { id: uid(), title: 'Martin Fowler — Patterns of Enterprise Application Architecture', url: 'https://martinfowler.com/eaaCatalog/', type: 'docs' },
      { id: uid(), title: 'React Patterns', url: 'https://reactpatterns.com/', type: 'docs' },
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-editor', 'p-maak'],
  });

  // ── Sub-topic 1: Creational Patterns ───────────────────────────────────────
  const subCreational = mk('Creational Patterns', 'design-patterns', dpSkill.id, {
    definition: 'Creational patterns control how objects are created, hiding instantiation complexity from consumers. They address whether to ensure a single instance (Singleton), delegate which class to instantiate (Factory), or assemble complex objects step by step (Builder). Choosing the right creational pattern prevents callers from being tightly coupled to concrete classes and makes swapping implementations safe.',
    codeExample: `// Factory — centralise creation; callers don't know which class
function createPayment(type) {
  const map = { upi: UPIPayment, card: CardPayment, wallet: WalletPayment };
  const Cls = map[type];
  if (!Cls) throw new Error('Unknown payment type: ' + type);
  return new Cls();
}

// Singleton — one shared instance (e.g. in-memory cache)
class Cache {
  static #instance = null;
  static getInstance() {
    if (!Cache.#instance) Cache.#instance = new Cache();
    return Cache.#instance;
  }
  #store = new Map();
  get(key) { return this.#store.get(key); }
  set(key, val) { this.#store.set(key, val); }
}

// Builder — step-by-step construction of complex objects
class QueryBuilder {
  #q = { table: '', conditions: [], limit: null };
  from(table)  { this.#q.table = table; return this; }
  where(cond)  { this.#q.conditions.push(cond); return this; }
  limit(n)     { this.#q.limit = n; return this; }
  build()      { return { ...this.#q }; }
}
const q = new QueryBuilder().from('users').where('active=true').limit(10).build();`,
    gotchas: `Singleton hidden global state — shared mutable state causes interference between parallel tests; scope singletons to request/session when possible in Node.js servers.
Factory without a registry — large if/else chains that require editing the factory for every new type violate Open/Closed; use a type-keyed map instead.
Builder missing terminal build() — partially constructed objects that escape without build() cause runtime errors far from the construction site.
Module pattern redundant in ES modules — native module scope already encapsulates; wrapping with an IIFE adds noise without benefit.
Abstract Factory premature — creating themed button families before you have more than one theme adds three classes and zero value.`,
    flashcards: [
      { id: uid(), q: 'What is the Singleton pattern?', a: 'Ensures only one instance of a class exists, with a single global access point. Used for: DB connection pool, logger, global config, cache manager. Implemented by caching the instance and returning the cached one on subsequent constructions.' },
      { id: uid(), q: 'Problems with Singleton?', a: 'Hidden global state, harder testing (shared state between tests), implicit dependencies (consumers depend on a global), memory persistence across the app lifecycle. In React, too many singletons cause shared-state bugs.' },
      { id: uid(), q: 'When is Singleton a bad choice?', a: 'When state must be isolated (multi-tenant, parallel testing, multiple environments). When shared mutable state causes race conditions. When the singleton hides dependencies that should be explicit.' },
      { id: uid(), q: 'What is the Factory pattern?', a: 'Encapsulates object creation behind a function or class. Caller asks for "a car" without knowing which class to instantiate. Centralizes creation logic, makes it easy to add new types without modifying callers.' },
      { id: uid(), q: 'Why use Factory pattern?', a: 'Centralized creation logic, easier to add new types, decouples consumers from concrete classes. Common in: API client construction, UI component systems, payment gateway selection, form field generators.' },
      { id: uid(), q: 'Factory vs Abstract Factory?', a: 'Factory creates one type/category (`VehicleFactory.create("car")`). Abstract Factory creates families of related objects — e.g., DarkThemeFactory.createButton() + createInput() vs LightThemeFactory.createButton() + createInput(). Used in design systems, multi-platform UIs.' },
      { id: uid(), q: 'What is the Builder pattern?', a: 'Constructs complex objects step-by-step via chained methods. Useful when constructors have many optional params. Example: `new QueryBuilder().select("*").where(...).limit(10).build()`.' },
      { id: uid(), q: 'What is the Module pattern?', a: 'Encapsulation with private state via IIFE or closures. Public API exposed; internals hidden. Pre-class-syntax JS classic. `const Counter = (() => { let count = 0; return { increment, getCount }; })();`' },
    ],
    refs: [
      { id: uid(), title: 'Refactoring Guru — Creational Patterns', url: 'https://refactoring.guru/design-patterns/creational-patterns', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Singleton', url: 'https://refactoring.guru/design-patterns/singleton', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Factory Method', url: 'https://refactoring.guru/design-patterns/factory-method', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Builder', url: 'https://refactoring.guru/design-patterns/builder', type: 'docs' },
    ],
  });

  // ── Sub-topic 2: Structural Patterns ───────────────────────────────────────
  const subStructural = mk('Structural Patterns', 'design-patterns', dpSkill.id, {
    definition: 'Structural patterns define how objects and classes are composed to form larger, cleaner structures. They solve incompatible interface problems (Adapter), simplify complex subsystem surfaces (Facade), inject responsibilities without subclassing (Decorator), and control object access with cross-cutting behaviour (Proxy). The goal is flexible composition that does not require modifying existing classes.',
    codeExample: `// Adapter — bridge legacy interface to new expected shape
class LegacyApi {
  fetchUserData() { return { full_name: 'Vikil', user_id: 42 }; }
}
class ApiAdapter {
  constructor(legacy) { this.legacy = legacy; }
  getUser() {
    const raw = this.legacy.fetchUserData();
    return { name: raw.full_name, id: raw.user_id };   // new shape
  }
}

// Facade — one clean call hides subsystem wiring
class AppBootstrap {
  static start() {
    Database.connect();
    AuthService.init();
    CacheManager.warmUp();
    Logger.setup();
  }
}
AppBootstrap.start(); // caller doesn't know the order or dependencies

// Decorator — add cross-cutting behaviour without modifying original
function withLogging(fn) {
  return function (...args) {
    console.log('→', fn.name, args);
    const result = fn(...args);
    console.log('←', result);
    return result;
  };
}
const loggedFetch = withLogging(fetchUser);`,
    gotchas: `Adapter hiding too much — non-obvious transformations inside an adapter make debugging painful; keep mapping logic simple and transparent.
Facade becoming a God Object — adding coordination logic beyond delegation turns a Facade into a bloated orchestrator that is hard to test in isolation.
Decorator order matters — wrapping fn with logger then cache differs from cache then logger; undocumented ordering causes subtle bugs.
Proxy serving stale data — caching proxies without TTL or invalidation become correctness liabilities; always define a staleness strategy.
Anti-Corruption Layer scope creep — ACL absorbing business logic blurs architectural boundaries and defeats its own purpose.`,
    flashcards: [
      { id: uid(), q: 'What is the Adapter pattern?', a: 'Converts an incompatible interface into a compatible one. Real-world: phone charger adapter. Software: wrap a legacy API so new code can consume it via the new expected shape. Common in API integration when backend data shape changes.' },
      { id: uid(), q: 'Adapter pattern in API integration — concrete example?', a: 'Old API returns `{ full_name: "Vikil" }`, new UI expects `{ name: "Vikil" }`. Adapter wraps fetch and transforms response. Keeps UI clean — backend change isolated to one layer.' },
      { id: uid(), q: 'What is the Decorator pattern?', a: "Adds functionality to an object dynamically without modifying its class. JS example: a logger function that wraps any function, logs entry/exit, then calls the original. In React: HOCs (Higher-Order Components) are the decorator pattern applied to components." },
      { id: uid(), q: 'What is the Facade pattern?', a: "Provides a simplified interface to a complex subsystem. Example: `startApplication()` internally initializes DB, auth, cache, logger. Caller doesn't need to know the order or wire dependencies. Most React frameworks heavily use Facade." },
      { id: uid(), q: 'What is the Proxy pattern?', a: 'Controls access to another object — adds caching, lazy loading, authentication, or logging in between. Example: API caching layer that transparently caches responses. Real-world: CDN, API gateway (Nginx, Cloudflare) act as proxies.' },
      { id: uid(), q: 'When does Proxy pattern shine in production?', a: 'Rate limiting, caching, auth filtering, request transformation, lazy resource loading. Anywhere you want to insert cross-cutting behavior without modifying caller or callee.' },
      { id: uid(), q: 'What is the Anti-Corruption Layer (ACL)?', a: 'Protects internal clean domain model from external messy/legacy systems. Example: integrating with a legacy SOAP banking API — ACL translates legacy concepts into internal domain types, keeps legacy pollution out. Common in enterprise modernization.' },
    ],
    refs: [
      { id: uid(), title: 'Refactoring Guru — Structural Patterns', url: 'https://refactoring.guru/design-patterns/structural-patterns', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Adapter', url: 'https://refactoring.guru/design-patterns/adapter', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Decorator', url: 'https://refactoring.guru/design-patterns/decorator', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Facade', url: 'https://refactoring.guru/design-patterns/facade', type: 'docs' },
      { id: uid(), title: 'Martin Fowler — Anti-Corruption Layer', url: 'https://martinfowler.com/bliki/AnticorruptionLayer.html', type: 'docs' },
    ],
  });

  // ── Sub-topic 3: Behavioral Patterns ───────────────────────────────────────
  const subBehavioral = mk('Behavioral Patterns', 'design-patterns', dpSkill.id, {
    definition: 'Behavioral patterns govern how objects communicate and assign responsibility at runtime. Observer propagates change notifications to many dependents; Strategy swaps algorithms without altering callers; Command encapsulates requests as first-class objects enabling undo/redo; Chain of Responsibility passes a request down a handler pipeline until one processes it. These patterns replace sprawling conditionals with clean, extensible object collaboration.',
    codeExample: `// Observer — subject notifies all subscribers on state change
class Store {
  #listeners = []; #state = {};
  subscribe(fn) { this.#listeners.push(fn); return () => { this.#listeners = this.#listeners.filter(l => l !== fn); }; }
  setState(patch) {
    this.#state = { ...this.#state, ...patch };
    this.#listeners.forEach(fn => fn(this.#state));
  }
}

// Strategy — swap payment algorithm at runtime
class Payment {
  constructor(strategy) { this.strategy = strategy; }
  process(amount) { return this.strategy.pay(amount); }
}
class UPI  { pay(a) { return 'UPI: ₹' + a; } }
class Card { pay(a) { return 'Card: ₹' + a; } }
// swap: new Payment(new Card()) — zero change to Payment

// Chain of Responsibility — Express middleware pipeline
const auth     = (req, res, next) => { if (!req.user) return res.status(401).end(); next(); };
const validate = (req, res, next) => { if (!req.body?.amount) return res.status(400).end(); next(); };
app.post('/pay', auth, validate, handlePayment);`,
    gotchas: `Observer memory leaks — forgetting to unsubscribe keeps dead components in the listener list; always return a cleanup function (or call removeEventListener / store.unsubscribe).
Observer cascading updates — observers that trigger further state changes can produce infinite loops; guard with equality checks before notifying.
Strategy without input validation — passing an unknown type at runtime results in a missing method call; always validate against the strategy registry and fail loudly.
Command history unbounded — unlimited undo stacks consume memory; cap history length in production editors.
Middleware next() forgotten — Express handler that never calls next() silently drops requests with no response or error, very hard to debug.`,
    flashcards: [
      { id: uid(), q: 'What is the Observer pattern?', a: 'One subject maintains a list of dependents (observers) and notifies them automatically of changes. Used in React state updates, Redux store subscriptions, DOM event listeners, EventEmitter.' },
      { id: uid(), q: "Observer vs Pub/Sub — what's the difference?", a: "Observer: direct relationship — subject knows its observers, calls them directly. Pub/Sub: indirection via event bus / broker — publishers and subscribers don't know each other. Pub/Sub is more decoupled, scales across services (Kafka, Redis Pub/Sub)." },
      { id: uid(), q: 'Why is Observer dangerous in large systems?', a: 'Memory leaks from forgotten subscriptions, stale subscribers operating on outdated state, cascading updates triggering more updates, hard-to-debug indirect flows. React useEffect without cleanup is a classic leak source.' },
      { id: uid(), q: 'What is the Strategy pattern?', a: 'Defines a family of algorithms, encapsulates each one, makes them interchangeable at runtime. Example: Payment with UPI / Card / Wallet strategies — caller swaps strategy without changing the Payment class.' },
      { id: uid(), q: 'Strategy vs State pattern?', a: 'Strategy: behavior chosen externally by the caller (`new Payment(new UPI())`). State: behavior changes automatically based on internal state — Order goes Pending → Paid → Shipped, each state has different allowed operations. Object changes its own behavior.' },
      { id: uid(), q: 'What is the Command pattern?', a: 'Encapsulates a request as an object with `execute()` / `undo()` / `redo()`. Useful for undo/redo systems, task queues, scheduled jobs, macro recording. Used in text editors, drawing apps, and Redux-style action dispatching.' },
      { id: uid(), q: 'What is the Chain of Responsibility?', a: 'Each handler in a chain decides to process the request or pass it to the next. Used in Express middleware (auth → validation → business → response), backend filter chains, event bubbling in DOM.' },
      { id: uid(), q: "What is the Template Method pattern?", a: "Base class defines an algorithm's skeleton; subclasses override specific steps. Example: `processPayment()` calls validate() → debit() → notify(), but different providers customize each step. Pre-composition era; today often replaced with strategy + hooks." },
      { id: uid(), q: 'Which pattern helps avoid "if-else hell"?', a: 'Strategy pattern or polymorphism. Instead of `if (type === "upi") ... else if (type === "card") ...`, register strategies keyed by type and call `paymentStrategies[type].pay()`. Cleaner and open to extension.' },
    ],
    refs: [
      { id: uid(), title: 'Refactoring Guru — Behavioral Patterns', url: 'https://refactoring.guru/design-patterns/behavioral-patterns', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Observer', url: 'https://refactoring.guru/design-patterns/observer', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Strategy', url: 'https://refactoring.guru/design-patterns/strategy', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Command', url: 'https://refactoring.guru/design-patterns/command', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Chain of Responsibility', url: 'https://refactoring.guru/design-patterns/chain-of-responsibility', type: 'docs' },
    ],
  });

  // ── Sub-topic 4: Architectural & Resilience Patterns ───────────────────────
  const subArch = mk('Architectural & Resilience Patterns', 'design-patterns', dpSkill.id, {
    definition: 'Architectural patterns operate at a higher level than GoF patterns — they define how entire systems are structured and how services communicate across boundaries. Dependency Injection, Repository, and CQRS improve testability and maintainability at the component and service level. Resilience patterns — Circuit Breaker, Saga, Unit of Work — keep distributed systems stable and consistent when failures are inevitable in production.',
    codeExample: `// Dependency Injection — pass deps in; never create internally
class UserService {
  constructor(api, logger) { this.api = api; this.logger = logger; }
  async getUser(id) {
    this.logger.info('fetching', id);
    return this.api.get('/users/' + id);
  }
}
// test: new UserService(mockApi, mockLogger) — no real network

// Repository — decouple business logic from data access
class UserRepository {
  constructor(db) { this.db = db; }
  findById(id)  { return this.db.query('SELECT * FROM users WHERE id=$1', [id]); }
  save(user)    { return this.db.query('INSERT INTO users ...', [user]); }
}
// swap Postgres for Mongo: change UserRepository, not UserService

// Circuit Breaker — fail fast on repeated downstream failures
class CircuitBreaker {
  #failures = 0; #threshold = 5; #open = false;
  async call(fn) {
    if (this.#open) throw new Error('Circuit open');
    try   { const r = await fn(); this.#failures = 0; return r; }
    catch (e) { if (++this.#failures >= this.#threshold) this.#open = true; throw e; }
  }
}`,
    gotchas: `DI containers becoming magic — automatic dependency resolution hides what is injected where; prefer explicit wiring for core services so the graph is auditable.
Repository leaking ORM details — returning Sequelize model instances instead of plain domain objects couples callers to the ORM; map to plain types at the repository boundary.
CQRS added prematurely — maintaining two separate models is significant overhead; only adopt when read and write needs diverge sharply at scale.
Event-Driven idempotency neglected — duplicate events from retries cause double charges or double inserts without idempotent consumers; assign event IDs and deduplicate.
Saga compensations untested — rollback paths that are never exercised will fail during incidents; write explicit tests for every compensation step.`,
    flashcards: [
      { id: uid(), q: 'What is Dependency Injection?', a: "Dependencies are passed in from outside instead of being created internally. Enables loose coupling, easy testing (mock injections), and swapping implementations. Example: `new UserService(api)` instead of UserService internally calling `new ApiClient()`." },
      { id: uid(), q: 'Service Locator vs Dependency Injection?', a: 'Service Locator: objects fetch their own dependencies from a container (`container.get("db")`) — hidden dependency, harder to test. DI: dependencies passed explicitly via constructor or function — transparent, easier to mock. DI is generally preferred.' },
      { id: uid(), q: 'What problems does DI solve?', a: "Tight coupling, testing difficulty (can't mock internal news), hardcoded dependencies, scaling pain (changing one impl ripples). Critical for fintech and enterprise apps where mocking external systems is mandatory." },
      { id: uid(), q: 'What is the Repository pattern?', a: 'Separates business logic from data access. Flow: UI → Service → Repository → Database. Repository hides DB details — switch from Mongo to Postgres without touching service code. Common in fintech and enterprise apps.' },
      { id: uid(), q: 'What is Unit of Work?', a: 'Tracks multiple operations as a single transaction — either all commit or all rollback. Critical for banking, payments, ledger systems where partial completion would corrupt data.' },
      { id: uid(), q: 'What is CQRS?', a: 'Command Query Responsibility Segregation — separate write model (commands) from read model (queries). Optimize each independently — e.g., normalized writes + denormalized read views. Adds complexity; use when read/write needs diverge sharply (large fintech, analytics dashboards).' },
      { id: uid(), q: 'What is Event-Driven Architecture?', a: 'Services communicate via events instead of direct calls. Publisher emits `PaymentSuccess`, multiple consumers react (notifications, analytics, ledger, fraud check). Loose coupling, scalable, async. Trade-off: harder debugging, eventual consistency.' },
      { id: uid(), q: 'Problems with event-driven systems?', a: 'Eventual consistency (state lags), duplicate events (need idempotency), out-of-order event handling, debugging complexity (no linear call stack), retry storms. Trace correlation IDs across events become essential.' },
      { id: uid(), q: 'What is the Circuit Breaker pattern?', a: 'Wraps calls to an unreliable downstream. After N failures, "opens" — fails fast without calling downstream. Periodically tries "half-open" probe. Prevents cascading failures. Common in microservices and fintech.' },
      { id: uid(), q: 'What is the Saga pattern?', a: 'Manages distributed transactions across services via local txns + compensation. Payment → Inventory → Shipping; if shipping fails, run rollback for inventory + payment. Two flavors: orchestration (coordinator service) and choreography (event-driven).' },
      { id: uid(), q: 'What is the Middleware pattern?', a: 'Functions sit between request and response, can read/transform/short-circuit, then call next. Common in: Express, Redux, API gateways. Implementation of Chain of Responsibility.' },
      { id: uid(), q: 'Why are patterns critical in fintech systems?', a: 'Fintech needs reliability, scalability, transactional consistency, fault tolerance, auditability. Patterns (Saga, Repository, Unit of Work, Circuit Breaker, Event Sourcing) provide tested approaches to these hard requirements.' },
    ],
    refs: [
      { id: uid(), title: 'Microservices.io — Patterns', url: 'https://microservices.io/patterns/', type: 'docs' },
      { id: uid(), title: 'Martin Fowler — Enterprise Application Architecture Catalog', url: 'https://martinfowler.com/eaaCatalog/', type: 'docs' },
      { id: uid(), title: 'Martin Fowler — Circuit Breaker', url: 'https://martinfowler.com/bliki/CircuitBreaker.html', type: 'docs' },
      { id: uid(), title: 'Martin Fowler — CQRS', url: 'https://martinfowler.com/bliki/CQRS.html', type: 'docs' },
      { id: uid(), title: 'Microservices.io — Saga Pattern', url: 'https://microservices.io/patterns/data/saga.html', type: 'docs' },
    ],
  });

  // ── Sub-topic 5: Engineering Judgment & Anti-Patterns ──────────────────────
  const subJudgment = mk('Engineering Judgment & Anti-Patterns', 'design-patterns', dpSkill.id, {
    definition: "Engineering judgment is knowing when NOT to use a pattern. Every abstraction layer is a complexity cost that only pays off when the problem genuinely warrants it. Senior engineers recognise anti-patterns — God Object, Spaghetti Code, Premature Abstraction — as confidently as they recognise patterns, and they default to the simplest solution that solves the actual problem without designing for imaginary future requirements.",
    codeExample: `// Over-engineered — three classes to format a name
class FullNameFormatter  { format(u) { return u.first + ' ' + u.last; } }
class ShortNameFormatter { format(u) { return u.first; } }
class UserNameFormatterFactory {
  static create(type) { return type === 'full' ? new FullNameFormatter() : new ShortNameFormatter(); }
}

// Simple — just write the function; add abstraction when you have ≥3 consumers with diverging needs
function formatName(user, full = true) {
  return full ? user.first + ' ' + user.last : user.first;
}

// Over-engineered — enterprise stack for a feature flag
class FeatureToggleManagerSingletonProviderStrategy {
  constructor(repo, logger, cache, validator, eventBus) { /* ... */ }
  async isEnabled(flag) { /* ... */ }
}

// Simple — matches current product stage
const FEATURES = { darkMode: true, betaChart: false };
const isEnabled = (flag) => FEATURES[flag] ?? false;`,
    gotchas: `Applying patterns before you have the problem — Abstract Factory for one theme, Strategy for one algorithm, Builder for two fields all add classes and zero value.
Naming code by pattern — "UserFactoryManagerBuilderStrategy" signals exploration, not clarity; name by purpose, not by the pattern you applied.
Business logic hidden in abstraction layers — userDataManager.executeUserDataRetrievalProcess() is worse than fetchUsers(); abstraction must reduce cognitive load, not increase it.
Organising folders by pattern type — src/factories/, src/adapters/ fragments cohesive business logic; organise by feature, not by pattern type.
Confusing pattern vocabulary with engineering maturity — naming patterns is table stakes; knowing when not to apply them is the real senior signal.`,
    flashcards: [
      { id: uid(), q: 'When should you NOT use a design pattern?', a: "When the problem is simple, when the pattern adds complexity without benefit, when future needs are uncertain, when the team can't maintain it. For a simple CRUD app, classes like `UserFactoryManagerProviderStrategyBuilder` are pure overengineering." },
      { id: uid(), q: 'What happens when patterns are overused?', a: 'Complex codebase, hard debugging, too many abstractions, slower onboarding, reduced readability. Example: using Factory + Strategy + Builder for a single button component. Patterns are tools, not goals.' },
      { id: uid(), q: 'How does a senior engineer decide whether a pattern is needed?', a: 'Asks: Is the problem repeating? Will multiple implementations exist? Is scaling expected? Is coupling becoming painful? Is testing difficult? If most answers are "no" → simple solution wins.' },
      { id: uid(), q: 'Can design patterns hurt performance?', a: 'Yes. Too many abstraction layers (UI → Facade → Factory → Strategy → Adapter → Service) add object allocation, indirection, and stack depth. Balance maintainability vs perf — measure before assuming patterns are free.' },
      { id: uid(), q: "What's a sign of bad abstraction?", a: 'Hides simple logic unnecessarily, creates more confusion than direct code, leaks implementation details despite "abstraction." `userDataManager.executeDataRetrievalProcess()` instead of just `fetchUsers()`.' },
      { id: uid(), q: 'What is premature abstraction?', a: 'Building complex architecture before real need exists. Example: building a plugin system for an app with one client, one developer, two pages. Predicting imaginary future needs creates accidental complexity now.' },
      { id: uid(), q: 'Composition over inheritance — why?', a: 'Inheritance creates rigid hierarchies, fragile base class problem, side effects on subclasses, hard testing. Composition (`Dog has EatingBehavior, RunningBehavior`) is flexible, reusable, loosely coupled. React Hooks are composition over inheritance.' },
      { id: uid(), q: 'Why do modern systems avoid deep OOP hierarchies?', a: 'Hard scaling, rigid design, side effects when base changes, difficult refactoring. Modern systems prefer composition, functional programming, modular architecture. Seen across React, Vue, Node.js.' },
      { id: uid(), q: "Is 'clean code' always good?", a: 'Not when over-applied. Splitting trivial logic across controller/service/manager/factory/handler/processor/adapter folders hides business logic and harms readability. Match complexity to actual need.' },
      { id: uid(), q: 'What is engineering maturity?', a: 'Choosing appropriate complexity, understanding tradeoffs, optimizing for maintainability over cleverness, avoiding ego-driven architecture. Senior engineers know when to NOT use a pattern just as well as when to use one.' },
      { id: uid(), q: 'Why do startups often avoid heavy architecture initially?', a: 'Speed and iteration matter more than enterprise scalability on day 1. Architecture serves the business stage. Premature scaling architecture wastes time and slows learning.' },
      { id: uid(), q: 'What is accidental complexity?', a: 'Complexity introduced by developers, not by business requirements. Example: a login feature requiring 20 classes, 8 interfaces, 4 patterns. Essential complexity comes from the problem; accidental from how you chose to solve it.' },
      { id: uid(), q: 'Why is readability more important than cleverness?', a: 'Code is read far more than written. Teams maintain software for years. Clever one-liners save 10 seconds writing and cost 10 minutes per future read. Optimize for the next engineer.' },
      { id: uid(), q: 'Biggest mistake juniors make with patterns?', a: 'Trying to use patterns everywhere. Pattern knowledge ≠ engineering maturity. Good engineering = solving real problems with the minimum necessary complexity.' },
      { id: uid(), q: 'What code smells suggest a pattern might help?', a: 'Repeated conditional logic (`if type === ...` everywhere), giant switch statements, tightly coupled modules, duplicated object creation, hard-to-test code. Then patterns earn their complexity cost.' },
      { id: uid(), q: 'The strongest "good engineer" interview answer?', a: '"I use patterns when they simplify scaling or maintenance, not just because the pattern exists." Demonstrates maturity, pragmatism, awareness of overengineering, and production-grade thinking.' },
    ],
    refs: [
      { id: uid(), title: 'Martin Fowler — Bliki (architecture opinions)', url: 'https://martinfowler.com/bliki/', type: 'docs' },
      { id: uid(), title: 'Clean Coder Blog — Robert C. Martin', url: 'https://blog.cleancoder.com/', type: 'docs' },
      { id: uid(), title: 'Refactoring Guru — Anti-Patterns overview', url: 'https://refactoring.guru/antipatterns', type: 'docs' },
      { id: uid(), title: 'Patterns.dev — Anti-patterns', url: 'https://www.patterns.dev/', type: 'docs' },
    ],
  });

  // ── Sub-topic 6: React Composition Patterns ────────────────────────────────
  const subReactCompose = mk('React Composition Patterns', 'design-patterns', dpSkill.id, {
    definition: "React is built on composition — components combine via children, slots, and context rather than class inheritance. The Compound Component pattern gives complex UI primitives a clean declarative API with shared internal state and no prop drilling. The Slot pattern handles multi-region layouts, and controlled vs uncontrolled modes address the spectrum of ownership between library and consumer. These patterns are the foundation of every serious React component library.",
    codeExample: `// Compound Component — shared state via Context, clean consumer API
const TabsCtx = React.createContext(null);

function Tabs({ children, defaultTab }) {
  const [active, setActive] = React.useState(defaultTab);
  return <TabsCtx.Provider value={{ active, setActive }}>{children}</TabsCtx.Provider>;
}
Tabs.List = function TabsList({ children }) {
  return <div role="tablist">{children}</div>;
};
Tabs.Tab = function Tab({ id, children }) {
  const ctx = React.useContext(TabsCtx);
  if (!ctx) throw new Error('Tabs.Tab must be inside <Tabs>');
  return <button onClick={() => ctx.setActive(id)} aria-selected={ctx.active === id}>{children}</button>;
};
Tabs.Panel = function TabPanel({ id, children }) {
  const { active } = React.useContext(TabsCtx);
  return active === id ? <div role="tabpanel">{children}</div> : null;
};

// Consumer controls layout; library controls state
<Tabs defaultTab="profile">
  <Tabs.List>
    <Tabs.Tab id="profile">Profile</Tabs.Tab>
    <Tabs.Tab id="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="profile"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel id="settings"><SettingsForm /></Tabs.Panel>
</Tabs>`,
    gotchas: `Context consumer blast radius — one value object change re-renders all consumers; split contexts by concern (active state vs dispatch) to limit who re-renders.
Compound component used outside parent — Tabs.Tab without a Tabs wrapper receives null context; always guard with an explicit error throw.
Controlled / uncontrolled hybrid — allowing both modes (with and without value prop) without careful implementation doubles the bug surface; use one mode or implement both carefully with a single canonical state source.
Slots via React.cloneElement — key and ref forwarding require extra care; prefer render-prop slots or named-prop slots over cloneElement for safer composition.
Container/Presentational without hooks — if you inherit a pre-hooks codebase with smart/dumb components, understand the pattern but refactor toward custom hooks when touching that code.`,
    flashcards: [
      { id: uid(), q: 'Why React prefers composition over inheritance?', a: 'React components compose via children and props — flexible, reusable, loosely coupled. Inheritance hierarchies (`Button extends BaseButton`) become rigid and fragile. Composition keeps each component focused and combinable.' },
      { id: uid(), q: 'Container vs Presentational pattern — still relevant?', a: "Older split: container handles data/logic, presentational handles UI. Hooks replaced most container components — extract `useUsers()` instead of `<UserContainer>`. The principle (separate logic from rendering) still holds; the mechanism changed." },
      { id: uid(), q: 'What is the Compound Component pattern?', a: 'A parent and several child components share implicit state via React Context, exposing a clean API. Example: `<Tabs><Tabs.List/><Tabs.Panel/></Tabs>`. Used heavily in UI libraries (Radix, Headless UI, Chakra).' },
      { id: uid(), q: 'Why are compound components powerful?', a: 'Clean declarative API for consumers, shared internal state without prop drilling, flexible composition order, separates concerns (`Tabs.List` knows tabs, `Tabs.Panel` knows panels). Pattern of choice for complex stateful UI primitives.' },
      { id: uid(), q: 'What is the Slot pattern?', a: "Components accept named regions as props: `<Modal header={<Header/>} footer={<Footer/>} />`. Useful when children alone isn't enough — you need multiple structured insertion points. Common in enterprise UI layouts." },
      { id: uid(), q: 'Controlled vs uncontrolled components in React?', a: 'Controlled: React owns state via `value` + `onChange`. Predictable, validatable, costly for huge forms. Uncontrolled: DOM owns state, read via ref on submit. Faster for perf-heavy forms (React Hook Form leverages this).' },
    ],
    refs: [
      { id: uid(), title: 'React.dev — Passing Data with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context', type: 'docs' },
      { id: uid(), title: 'Kent C. Dodds — Compound Components with Hooks', url: 'https://kentcdodds.com/blog/compound-components-with-react-hooks', type: 'article' },
      { id: uid(), title: 'Patterns.dev — Compound Pattern', url: 'https://www.patterns.dev/react/compound-pattern', type: 'docs' },
      { id: uid(), title: 'Radix UI — Accessible component primitives', url: 'https://www.radix-ui.com/', type: 'docs' },
    ],
  });

  // ── Sub-topic 7: React Logic Reuse Patterns ────────────────────────────────
  const subReactReuse = mk('React Logic Reuse Patterns', 'design-patterns', dpSkill.id, {
    definition: "React's logic reuse story evolved from render props → HOCs → custom hooks. Custom hooks are now the primary mechanism: they encapsulate stateful logic in composable functions without adding JSX nesting or wrapper components. HOCs and render props still appear in older codebases and some libraries, so understanding all three — and why each made sense in its era — is essential for working across any React codebase.",
    codeExample: `// Custom Hook — encapsulate fetch logic, share across components
function useFetch(url) {
  const [state, setState] = React.useState({ data: null, loading: true, error: null });
  React.useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(r => r.json())
      .then(data  => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(error => { if (!cancelled) setState({ data: null, loading: false, error }); });
    return () => { cancelled = true; };  // prevents stale setState after unmount
  }, [url]);
  return state;
}

// HOC — Decorator pattern applied to components
function withAuth(Component) {
  return function AuthGuard(props) {
    const { user } = useAuth();
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} />;
  };
}

// Render Props — function-as-child (largely replaced by hooks)
function MouseTracker({ render }) {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>{render(pos)}</div>;
}`,
    gotchas: `HOC prop shadowing — HOC injects a prop with the same name as a consumer prop; one silently wins. Always document injected props and spread carefully.
Hooks rules violated — calling a hook inside a conditional or loop causes "rendered more hooks than previous render" which is hard to trace back to its source.
Context for high-churn state — scroll position, cursor position, or frequently updated form fields in Context cause mass re-renders; use local state or Zustand instead.
Stale closure in custom hooks — callbacks captured without the right dependency array operate on stale values; ESLint's exhaustive-deps rule surfaces this automatically.
Server state in Context — user list or order data stored in Context loses caching, deduplication, and background refetch; use React Query or SWR for server state.`,
    flashcards: [
      { id: uid(), q: 'What is the Custom Hook pattern?', a: "Encapsulates reusable stateful logic in a function starting with `use`. Example: `useFetch(url)` returns data + loading + error. Replaces most HOC and render-props use cases with cleaner composition. Modern React's primary logic-reuse mechanism." },
      { id: uid(), q: 'Which design principles do custom hooks embody?', a: 'Encapsulation (logic hidden behind a name), Separation of Concerns (data fetching separate from rendering), Reusability (share across components), Composition (hooks call other hooks).' },
      { id: uid(), q: 'What is the Provider pattern in React?', a: 'A component that supplies data via Context to all descendants. Used for: auth state, themes, localization, global config, design tokens. Combines Observer pattern (subscribers re-render on value change) with Dependency Injection (descendants receive what they need).' },
      { id: uid(), q: 'What is a Higher-Order Component (HOC)?', a: "A function that takes a component and returns a new component with added behavior. `withAuth(Dashboard)` returns a Dashboard variant that checks auth first. It's the Decorator pattern applied to React components." },
      { id: uid(), q: 'Why did HOCs become less popular?', a: 'Wrapper hell (deeply nested HOC stacks), prop name collisions (HOC injects `user`, child component also has `user` prop), debugging complexity, harder TypeScript inference. Custom hooks solved most HOC use cases more cleanly.' },
      { id: uid(), q: 'What is the Render Props pattern?', a: 'Component takes a function as a prop and calls it with internal state. `<MouseTracker render={(x) => <h1>{x}</h1>} />`. Shares logic between components. Largely replaced by hooks but still appears in some libraries (Formik, older React Router).' },
      { id: uid(), q: 'When does Context become a perf bottleneck?', a: 'Frequent value changes + many consumers → cascade re-renders. Fixes: split contexts by churn rate, memoize the value object, use external state libs (Zustand, Redux) for hot data. Context is great for low-churn (theme, locale), bad for high-churn (cursor position, form fields).' },
      { id: uid(), q: 'Server state vs client state — why split?', a: 'Server state needs caching, deduplication, refetch, stale handling, retries — fundamentally different lifecycle from client state (toggles, modals). Tools: React Query / TanStack Query / SWR for server state; useState / Zustand for client state.' },
    ],
    refs: [
      { id: uid(), title: 'React.dev — Reusing Logic with Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', type: 'docs' },
      { id: uid(), title: 'TanStack Query — Server state management', url: 'https://tanstack.com/query/latest', type: 'docs' },
      { id: uid(), title: 'SWR — React Hooks for Data Fetching', url: 'https://swr.vercel.app/', type: 'docs' },
      { id: uid(), title: 'Patterns.dev — HOC Pattern', url: 'https://www.patterns.dev/react/hoc-pattern', type: 'docs' },
      { id: uid(), title: 'Kent C. Dodds — Application State Management with React', url: 'https://kentcdodds.com/blog/application-state-management-with-react', type: 'article' },
    ],
  });

  // ── Sub-topic 8: React Advanced & Architectural Patterns ───────────────────
  const subReactAdv = mk('React Advanced & Architectural Patterns', 'design-patterns', dpSkill.id, {
    definition: "Advanced React patterns address state complexity, bundle performance, and data-driven UIs. The State Reducer pattern (useReducer / Redux) centralises transitions and makes them traceable. Lazy loading with Suspense defers bundle loading for faster first paint. Factory and Strategy patterns bring classical design thinking to component rendering — essential for form builders, low-code platforms, and CMS-driven UIs where component types come from data.",
    codeExample: `// State Reducer — centralised, traceable state transitions
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT': return { ...state, count: state.count + 1 };
    case 'RESET':     return { count: 0 };
    default:          return state;
  }
}
const [state, dispatch] = React.useReducer(reducer, { count: 0 });
dispatch({ type: 'INCREMENT' });

// Strategy — dynamic component selection; no if-else chains
const fieldStrategies = {
  text:     TextInput,
  checkbox: CheckboxInput,
  select:   SelectInput,
  date:     DatePicker,
};
function DynamicField({ type, ...props }) {
  const Component = fieldStrategies[type];
  if (!Component) return null;   // safe fallback — no silent failure
  return <Component {...props} />;
}

// Lazy Loading — defer bundle until first render
const Dashboard = React.lazy(() => import('./Dashboard'));
function App() {
  return (
    <React.Suspense fallback={<Spinner />}>
      <Dashboard />
    </React.Suspense>
  );
}`,
    gotchas: `useReducer overkill for simple state — dispatching { type: 'SET_NAME', payload: 'Vikil' } for a single independent field adds boilerplate; use useState for simple, isolated state.
Lazy loading waterfall — lazy-loading every route causes sequential fetches as the user navigates; group related routes or prefetch on hover/link focus to avoid waterfalls.
Memoization without profiling — wrapping every component in React.memo and every callback in useCallback adds comparison cost and cognitive overhead without measurable benefit; profile first.
Dynamic component factory with no fallback — fieldStrategies[unknownType] returns undefined and silently renders nothing; always validate type against the registry and render an error placeholder.
Redux for all state — UI state (modal open, tab active) stored in Redux creates unnecessary boilerplate and global coupling; keep ephemeral UI state local.`,
    flashcards: [
      { id: uid(), q: 'What is the State Reducer pattern?', a: 'State updates routed through a reducer function `(state, action) => newState`. Used by Redux and `useReducer`. Connects to Command pattern (actions = commands) and Observer (subscribers re-render). Centralizes state transitions, makes them traceable and testable.' },
      { id: uid(), q: 'Which pattern is Redux based on?', a: 'Primarily Observer (store notifies subscribers on state change) plus command-like action dispatching plus reducer-based state transitions. Flux architecture is the lineage. The whole thing is one-way data flow.' },
      { id: uid(), q: 'What is the Strategy pattern in React?', a: 'Dynamic UI behavior selection — instead of `if (type === "upi") ... else if (type === "card") ...`, register components in a map: `const paymentStrategies = { upi: UPIComponent, card: CardComponent }` and render `paymentStrategies[type]`. Avoids if-else explosion.' },
      { id: uid(), q: 'What is the Factory pattern in React?', a: 'Function returns the right component based on input. Example: `createField(type)` returns TextField, CheckboxField, etc. Used in form builders, low-code platforms, CMS-driven UIs where component types are data-driven.' },
      { id: uid(), q: 'Dependency Injection in React — how?', a: 'Pass dependencies via props or Context instead of importing them. `function UserService({ api }) { ... }` allows injecting a mock api in tests. Provider pattern is the most common DI mechanism in React apps.' },
      { id: uid(), q: 'What is the Lazy Loading pattern in React?', a: "`React.lazy(() => import('./Dashboard'))` + `<Suspense fallback={...}>` — defer loading a component's code until first render. Reduces initial bundle. Trade: extra network hop on first use; can cause waterfall if used too granularly." },
      { id: uid(), q: 'Memoization pattern — when does it backfire?', a: "Memoization isn't free — comparison cost + memory + cognitive overhead. Overusing useMemo/useCallback adds complexity without measurable wins. Premature optimization. Memoize only after profiling shows a real bottleneck." },
      { id: uid(), q: 'Signs of bad React architecture?', a: 'Prop drilling everywhere, giant components mixing logic + UI, duplicated business logic across files, unnecessary global state, excessive re-renders, deeply nested providers, overusing Context for high-churn state.' },
      { id: uid(), q: 'When NOT to use Context API?', a: 'For high-frequency state changes with many consumers (cursor, scroll position, frequently updated forms) — causes mass re-renders. Use Zustand, Redux Toolkit, or local state instead. Context is for low-churn (auth, theme, locale).' },
    ],
    refs: [
      { id: uid(), title: 'React.dev — useReducer', url: 'https://react.dev/reference/react/useReducer', type: 'docs' },
      { id: uid(), title: 'React.dev — React.lazy and Suspense', url: 'https://react.dev/reference/react/lazy', type: 'docs' },
      { id: uid(), title: 'React.dev — memo', url: 'https://react.dev/reference/react/memo', type: 'docs' },
      { id: uid(), title: 'Redux.js.org — Style Guide', url: 'https://redux.js.org/style-guide/style-guide', type: 'docs' },
      { id: uid(), title: 'Patterns.dev — React Patterns', url: 'https://www.patterns.dev/react', type: 'docs' },
    ],
  });

  // ── React pattern mapping (reference)
  // Context API          → Provider Pattern + Observer
  // Redux                → Observer + Command (actions) + Reducer
  // Hooks                → Functional composition
  // HOC                  → Decorator
  // Middleware            → Chain of Responsibility
  // React Router         → Facade
  // Compound Components  → Composition (variant)
  // useReducer           → State Reducer / Command
  // TanStack Query       → Server-state pattern (Proxy + Observer)

  return [
    singleton,
    factory,
    observer,
    strategy,
    repository,
    decorator,
    dpSkill,
    subCreational,
    subStructural,
    subBehavioral,
    subArch,
    subJudgment,
    subReactCompose,
    subReactReuse,
    subReactAdv,
  ];
}
