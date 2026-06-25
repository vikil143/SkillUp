// seed/skills/design-patterns.js — Design Patterns skills
import { mk, uid } from '../helpers.js';

export default function buildDesignPatternSkills() {
  // Individual pattern stubs (Phase 9 — kept as-is)
  const singleton = mk('Singleton', 'design-patterns', null, {
    definition: 'Ensures a class has only one instance and provides a global access point.',
  });
  const factory = mk('Factory', 'design-patterns', null, {
    definition: 'Creates objects behind a simple creation API so callers do not depend on concrete classes.',
  });
  const observer = mk('Observer', 'design-patterns', null, {
    definition: 'Defines a one-to-many relationship where subscribers are notified when the subject changes.',
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
      { id: uid(), q: 'What is a design pattern?', a: 'A named, reusable way to solve a recurring software design problem. It is not copy-paste code; it is a proven structure for organizing code and responsibilities.' },
      { id: uid(), q: 'Why do we use design patterns?', a: 'They reduce repeated design decisions, improve readability, lower coupling, and give teams shared vocabulary. Example: "Observer" is clearer than explaining a subscription system from scratch.' },
      { id: uid(), q: 'Algorithm vs design pattern - difference?', a: 'An algorithm solves a computation problem step by step, like sorting or searching. A design pattern solves a code-organization problem, like object creation, communication, or composition.' },
      { id: uid(), q: 'Three main categories of design patterns?', a: 'Creational patterns manage object creation. Structural patterns compose objects/classes. Behavioral patterns manage communication and responsibility between objects.' },
      { id: uid(), q: 'Design pattern vs framework?', a: 'A pattern is an idea you apply in your own code. A framework is reusable code with rules and APIs. Patterns guide design; frameworks provide implementation structure.' },
      { id: uid(), q: 'Common anti-patterns in software?', a: 'God Object, Spaghetti Code, Massive Component, Premature Abstraction, Singleton-everywhere, and overusing patterns where simple code would be clearer.' },
      { id: uid(), q: 'How do patterns connect to SOLID principles?', a: 'Patterns often apply SOLID principles. Strategy supports Open/Closed. Dependency Injection supports Dependency Inversion. Decorator supports extending behavior without modifying the original object.' },
      { id: uid(), q: 'How does a senior engineer think about patterns?', a: 'They ask whether the problem is real, repeated, and costly enough to justify abstraction. If the pattern does not make code easier to change or test, simple code is better.' },
      { id: uid(), q: 'Best "good engineer" answer about patterns in interviews?', a: '"I use patterns when they simplify scaling or maintenance, not just because the pattern exists." Shows maturity, pragmatism, and awareness of overengineering risk.' },
      { id: uid(), q: 'Most important patterns for a senior frontend engineer?', a: 'Composition, Observer, Strategy, Factory, Dependency Injection, Provider, Custom Hooks, Repository, Pub/Sub, and knowing when not to add abstraction.' },
      { id: uid(), q: 'What is the biggest risk of learning patterns?', a: 'Using them as decoration. A pattern should solve a real maintainability, testing, or extensibility problem. If it only makes the code sound advanced, it is probably the wrong choice.' },
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
      { id: uid(), q: 'What is the Singleton pattern?', a: 'It ensures there is only one shared instance and gives code one access point to it. Good examples are app config, logging, or a process-level cache. Avoid it for user-specific mutable state.' },
      { id: uid(), q: 'Problems with Singleton?', a: 'It can hide global state, make tests affect each other, create implicit dependencies, and keep data alive longer than expected. In React apps, module-level singletons can accidentally share state across screens or users.' },
      { id: uid(), q: 'When is Singleton a bad choice?', a: 'When each request, tenant, test, or user needs isolated state. It is also risky when the object has mutable data that can be changed from many places.' },
      { id: uid(), q: 'What is the Factory pattern?', a: 'A function or object creates the right instance for the caller. The caller asks for what it needs, and the factory hides the concrete class or setup details.' },
      { id: uid(), q: 'Why use Factory pattern?', a: 'Use it to centralize creation logic, hide setup complexity, and decouple callers from concrete classes. It is common for API clients, payment providers, form fields, and UI components.' },
      { id: uid(), q: 'Simple Factory vs Factory Method?', a: 'Simple Factory is usually one function that chooses what to create. Factory Method lets subclasses or implementations decide which concrete object to create. Simple Factory is easier; Factory Method is more extensible.' },
      { id: uid(), q: 'Factory vs Abstract Factory?', a: 'Factory creates one product type. Abstract Factory creates families of related products, such as Button + Input + Modal for LightTheme and DarkTheme.' },
      { id: uid(), q: 'What is the Builder pattern?', a: 'It builds a complex object step by step, often with chained methods. Use it when an object has many optional fields or must be constructed in a valid order.' },
      { id: uid(), q: 'What is the Prototype pattern?', a: 'It creates new objects by copying an existing object. Use it when cloning a preconfigured object is simpler or cheaper than rebuilding it from scratch.' },
      { id: uid(), q: 'What is the Module pattern?', a: 'It hides private state inside a module or closure and exposes only a public API. In modern JavaScript, ES modules already provide much of this encapsulation.' },
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
      { id: uid(), q: 'What is the Adapter pattern?', a: 'It converts one interface into another interface the caller expects. Use it when old code, third-party APIs, or backend responses do not match your app model.' },
      { id: uid(), q: 'Adapter pattern in API integration - concrete example?', a: 'If an API returns `{ full_name: "Vikil" }` but the UI expects `{ name: "Vikil" }`, an adapter maps the response once so UI components stay clean.' },
      { id: uid(), q: 'What is the Decorator pattern?', a: 'It adds behavior by wrapping an object or function without changing the original. Examples: logging, caching, authorization checks, or React HOCs.' },
      { id: uid(), q: 'What is the Facade pattern?', a: 'It provides a small, simple API over a complex subsystem. Example: `startApplication()` can hide setup for database, auth, cache, and logging.' },
      { id: uid(), q: 'What is the Proxy pattern?', a: 'It controls access to another object. A proxy can add caching, auth checks, lazy loading, rate limiting, or logging before forwarding the call.' },
      { id: uid(), q: 'When does Proxy pattern shine in production?', a: 'When you need cross-cutting behavior around a target without changing callers or the target itself. Common examples are API gateways, caching clients, CDNs, and lazy-loaded resources.' },
      { id: uid(), q: 'What is the Composite pattern?', a: 'It lets individual objects and groups of objects be treated the same way. Example: a file tree where both files and folders support operations like render, move, or delete.' },
      { id: uid(), q: 'What is the Bridge pattern?', a: 'It separates an abstraction from its implementation so both can vary independently. Example: a notification abstraction can work with email, SMS, or push senders without changing notification logic.' },
      { id: uid(), q: 'What is the Anti-Corruption Layer (ACL)?', a: 'It protects your clean internal model from messy external or legacy systems. The ACL translates external concepts into your app concepts at the boundary.' },
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
      { id: uid(), q: 'What is the Observer pattern?', a: 'A subject keeps a list of observers and notifies them when something changes. Examples: DOM events, store subscriptions, EventEmitter, and UI state subscriptions.' },
      { id: uid(), q: "Observer vs Pub/Sub - what's the difference?", a: 'Observer is usually direct: the subject knows its observers. Pub/Sub uses a broker or event bus, so publishers and subscribers do not know each other. Pub/Sub is more decoupled.' },
      { id: uid(), q: 'Why is Observer dangerous in large systems?', a: 'Forgotten subscriptions cause memory leaks. Cascading notifications can create loops. Indirect updates can be hard to debug. Always unsubscribe and keep notification flow simple.' },
      { id: uid(), q: 'What is the Strategy pattern?', a: 'It puts interchangeable algorithms behind the same interface. Example: UPI, Card, and Wallet payment strategies can all expose `pay(amount)`.' },
      { id: uid(), q: 'Strategy vs State pattern?', a: 'Strategy is selected from outside to change an algorithm. State changes from inside as the object moves through states, such as Draft -> Paid -> Shipped.' },
      { id: uid(), q: 'What is the State pattern?', a: 'It lets an object change behavior when its internal state changes. Instead of many `if status === ...` checks, each state object owns the behavior allowed in that state.' },
      { id: uid(), q: 'What is the Command pattern?', a: 'It wraps a request as an object or data structure. Commands are useful for undo/redo, queues, scheduled jobs, macro recording, and action dispatching.' },
      { id: uid(), q: 'What is the Chain of Responsibility?', a: 'A request moves through handlers until one handles it or passes it on. Express middleware is the common example: auth -> validation -> business logic -> response.' },
      { id: uid(), q: 'What is the Mediator pattern?', a: 'It centralizes communication between objects so they do not talk to each other directly. Example: a form controller coordinating input fields, validation, and submit state.' },
      { id: uid(), q: "What is the Template Method pattern?", a: 'A base class defines the fixed steps of an algorithm, and subclasses customize some steps. It is useful, but composition or Strategy is often cleaner in modern JavaScript.' },
      { id: uid(), q: 'Which pattern helps avoid "if-else hell"?', a: 'Strategy or polymorphism. Register behavior by type in a map, then call the selected implementation instead of repeating large conditionals everywhere.' },
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
      { id: uid(), q: 'What is Dependency Injection?', a: 'Dependencies are passed in from outside instead of created inside the class/function. This makes code easier to test, replace, and configure.' },
      { id: uid(), q: 'Service Locator vs Dependency Injection?', a: 'Service Locator hides dependencies behind calls like `container.get("db")`. Dependency Injection makes dependencies visible by passing them as arguments or constructor params. DI is usually easier to test and understand.' },
      { id: uid(), q: 'What problems does DI solve?', a: 'It reduces tight coupling, removes hardcoded dependencies, and makes mocking easier in tests. Example: inject a fake payment API instead of calling the real network in a unit test.' },
      { id: uid(), q: 'What is the Repository pattern?', a: 'It puts data access behind a clean interface so business logic does not depend on database details. Services call repositories; repositories handle queries, ORM calls, or API persistence.' },
      { id: uid(), q: 'What is Unit of Work?', a: 'It groups multiple changes into one transaction so all changes commit together or rollback together. Useful for payments, ledgers, and any workflow where partial writes are dangerous.' },
      { id: uid(), q: 'What is CQRS?', a: 'Command Query Responsibility Segregation separates writes from reads. Use it when write rules and read views need very different models. Avoid it for simple CRUD because it adds operational complexity.' },
      { id: uid(), q: 'What is Event-Driven Architecture?', a: 'Services communicate by publishing and consuming events. It improves decoupling and async scaling, but introduces eventual consistency and harder debugging.' },
      { id: uid(), q: 'Problems with event-driven systems?', a: 'Duplicate events, out-of-order events, eventual consistency, retry storms, and difficult tracing. Consumers should be idempotent and events should carry correlation IDs.' },
      { id: uid(), q: 'What is the Outbox pattern?', a: 'It stores outgoing events in the same database transaction as the business change, then publishes them later. This avoids saving data successfully but losing the event.' },
      { id: uid(), q: 'What is Event Sourcing?', a: 'It stores the history of state changes as events instead of storing only the latest state. Current state is rebuilt from events. Useful for auditability, but harder to query and operate.' },
      { id: uid(), q: 'What is the Circuit Breaker pattern?', a: 'It stops calling a failing downstream after repeated failures and fails fast for a while. This prevents one broken service from slowing or breaking the whole system.' },
      { id: uid(), q: 'What is the Saga pattern?', a: 'It manages a distributed workflow using local transactions plus compensating actions. If one step fails, later compensation steps undo earlier successful steps as much as possible.' },
      { id: uid(), q: 'What is the Middleware pattern?', a: 'Middleware functions sit between input and final handling. They can inspect, change, stop, or pass the request forward. Express and Redux middleware are common examples.' },
      { id: uid(), q: 'Why are patterns critical in fintech systems?', a: 'Fintech needs correctness, auditability, consistency, fault tolerance, and clear failure handling. Patterns like Repository, Unit of Work, Saga, Outbox, and Circuit Breaker address those needs.' },
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
      { id: uid(), q: 'When should you NOT use a design pattern?', a: 'Do not use one when the problem is simple, unlikely to repeat, or easier to understand without abstraction. A pattern should reduce future change cost, not just add structure.' },
      { id: uid(), q: 'What happens when patterns are overused?', a: 'The code becomes harder to read, debug, and onboard into. Too many layers can hide simple business rules and make small changes feel expensive.' },
      { id: uid(), q: 'How does a senior engineer decide whether a pattern is needed?', a: 'They ask: is this repeated, changing, hard to test, or tightly coupled? If yes, a pattern may help. If no, direct code is usually better.' },
      { id: uid(), q: 'Can design patterns hurt performance?', a: 'Yes. Extra objects, wrappers, indirection, and subscriptions can add runtime cost. Usually maintainability matters more, but performance-sensitive paths should be measured.' },
      { id: uid(), q: "What's a sign of bad abstraction?", a: 'It hides simple logic, leaks details, requires many jumps to understand, or has a vague name like `Manager`/`Processor` without a clear responsibility.' },
      { id: uid(), q: 'What is premature abstraction?', a: 'Creating a flexible architecture before there is real variation. Example: building a plugin system before you have plugins. It turns guessed future needs into current complexity.' },
      { id: uid(), q: 'Composition over inheritance - why?', a: 'Composition builds behavior by combining smaller pieces. It is more flexible than deep inheritance because you can swap parts without changing a parent class hierarchy.' },
      { id: uid(), q: 'Why do modern systems avoid deep OOP hierarchies?', a: 'Deep hierarchies are rigid and make base-class changes risky. Modern JavaScript and React code usually favors functions, modules, hooks, and composition.' },
      { id: uid(), q: "Is 'clean code' always good?", a: 'Not if it splits simple behavior into too many layers. Clean code means clear and maintainable, not maximum folders, classes, and abstractions.' },
      { id: uid(), q: 'What is engineering maturity?', a: 'Choosing the simplest design that safely meets current needs, while leaving room to change when real requirements appear.' },
      { id: uid(), q: 'Why do startups often avoid heavy architecture initially?', a: 'Early products need fast learning and iteration. Heavy architecture is useful only when the business has enough stability and scale to benefit from it.' },
      { id: uid(), q: 'What is accidental complexity?', a: 'Complexity added by the solution rather than required by the problem. Example: a simple login flow spread across many unnecessary services, factories, and interfaces.' },
      { id: uid(), q: 'Why is readability more important than cleverness?', a: 'Code is read and changed many times. Clear code helps the next developer make safe changes; clever code often saves minutes now and costs hours later.' },
      { id: uid(), q: 'Biggest mistake juniors make with patterns?', a: 'Trying to use patterns everywhere. Good engineering means solving the real problem with the minimum useful complexity.' },
      { id: uid(), q: 'What code smells suggest a pattern might help?', a: 'Repeated conditionals, large switch statements, duplicated creation logic, tight coupling, scattered business rules, and tests that are hard to write.' },
      { id: uid(), q: 'When should you refactor into a pattern?', a: 'After the same shape appears more than once and change pressure is real. Let duplication teach you the right abstraction before you name the pattern.' },
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
      { id: uid(), q: 'Why React prefers composition over inheritance?', a: 'React components are combined with props, children, and hooks. This keeps components flexible and avoids rigid class hierarchies.' },
      { id: uid(), q: 'Container vs Presentational pattern - still relevant?', a: 'The idea is still useful: separate data/logic from rendering. In modern React, custom hooks often replace container components for sharing logic.' },
      { id: uid(), q: 'What is the Compound Component pattern?', a: 'A parent component and its children work together through shared state, often Context. Example: `Tabs`, `Tabs.List`, `Tabs.Tab`, and `Tabs.Panel`.' },
      { id: uid(), q: 'Why are compound components powerful?', a: 'They give consumers a clean declarative API, avoid prop drilling, and let the caller control layout while the component group shares internal state.' },
      { id: uid(), q: 'What is the Slot pattern?', a: 'A component accepts named regions, such as `header`, `footer`, or `actions`. Use it when one `children` area is not enough for the layout.' },
      { id: uid(), q: 'Children vs Slot pattern?', a: '`children` is best for one main content area. Slots are better when the component needs multiple named insertion points, like modal header, body, and footer.' },
      { id: uid(), q: 'Controlled vs uncontrolled components in React?', a: 'Controlled means React owns the value through props like `value` and `onChange`. Uncontrolled means the DOM owns the value and React reads it through refs or form submission.' },
      { id: uid(), q: 'When should a component support controlled mode?', a: 'Use controlled mode when the parent must validate, reset, sync, or store the value. For simple isolated inputs, uncontrolled mode can be simpler and faster.' },
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
      { id: uid(), q: 'What is the Custom Hook pattern?', a: 'A custom hook is a function starting with `use` that extracts reusable stateful logic. Example: `useFetch(url)` can return data, loading, and error state.' },
      { id: uid(), q: 'Which design principles do custom hooks embody?', a: 'Encapsulation, separation of concerns, reuse, and composition. A hook hides logic behind a clear name and can call other hooks.' },
      { id: uid(), q: 'What is the Provider pattern in React?', a: 'A Provider supplies a value through Context to descendants. It is useful for low-churn shared data like theme, locale, auth user, or app config.' },
      { id: uid(), q: 'What is a Higher-Order Component (HOC)?', a: 'An HOC is a function that takes a component and returns a new component with extra behavior. It is the Decorator pattern applied to React components.' },
      { id: uid(), q: 'Why did HOCs become less popular?', a: 'They can create wrapper nesting, prop name collisions, harder debugging, and harder TypeScript inference. Custom hooks solve many of the same reuse problems with less component nesting.' },
      { id: uid(), q: 'What is the Render Props pattern?', a: 'A component receives a function prop and calls it with internal state. It shares logic, but hooks are usually cleaner in modern React.' },
      { id: uid(), q: 'When does Context become a perf bottleneck?', a: 'When the context value changes often and many components consume it. Split contexts, memoize values carefully, or use a state library for high-churn data.' },
      { id: uid(), q: 'What is a stale closure in hooks?', a: 'A stale closure happens when a callback or effect reads old values because dependencies are missing or captured incorrectly. Follow exhaustive-deps guidance unless you have a deliberate reason.' },
      { id: uid(), q: 'Server state vs client state - why split?', a: 'Server state needs caching, refetching, deduplication, retry, and stale handling. Client state is local UI state like modals, tabs, drafts, and toggles.' },
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
      { id: uid(), q: 'What is the State Reducer pattern?', a: 'State changes go through a reducer: `(state, action) => nextState`. It centralizes transitions and makes behavior easier to test and trace.' },
      { id: uid(), q: 'useState vs useReducer - when to choose?', a: 'Use `useState` for simple independent values. Use `useReducer` when state transitions are related, complex, or easier to describe as actions.' },
      { id: uid(), q: 'Which pattern is Redux based on?', a: 'Redux combines one-way data flow, reducer-based state transitions, action dispatching, and Observer-style store subscriptions.' },
      { id: uid(), q: 'What is the Strategy pattern in React?', a: 'It selects behavior or components from a registry instead of using long conditionals. Example: render a field component based on `type` from a map.' },
      { id: uid(), q: 'What is the Factory pattern in React?', a: 'A function returns the right component or config based on input. It is useful in form builders, CMS-driven pages, and low-code UIs.' },
      { id: uid(), q: 'Dependency Injection in React - how?', a: 'Pass dependencies through props, Context, or provider components instead of importing fixed implementations everywhere. This makes tests and environment-specific behavior easier.' },
      { id: uid(), q: 'What is the Lazy Loading pattern in React?', a: '`React.lazy` and `Suspense` defer loading component code until needed. It can reduce the initial bundle, but too much lazy loading can create loading waterfalls.' },
      { id: uid(), q: 'Memoization pattern - when does it backfire?', a: 'Memoization adds comparison cost and mental overhead. Use `memo`, `useMemo`, and `useCallback` when profiling or clear render behavior shows they help.' },
      { id: uid(), q: 'What is component registry pattern?', a: 'A map from type names to components, such as `{ text: TextField, select: SelectField }`. It keeps dynamic rendering extensible and avoids scattered switch statements.' },
      { id: uid(), q: 'Signs of bad React architecture?', a: 'Giant components, duplicated business logic, prop drilling everywhere, unnecessary global state, excessive re-renders, deeply nested providers, and Context used for high-churn state.' },
      { id: uid(), q: 'When NOT to use Context API?', a: 'Avoid Context for values that change very often and are consumed widely, such as cursor position or large form state. Use local state or a dedicated state store instead.' },
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
