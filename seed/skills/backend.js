// seed/skills/backend.js — comprehensive backend and API content
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

export default function buildBackendSkills() {
  const skills = [];

  const node = mk('Node.js', 'backend', null, {
    definition:
      'Node.js is a JavaScript runtime built on V8 for server-side applications, tooling, and automation. It uses an event-driven, non-blocking I/O model that is efficient for network-heavy workloads. The ecosystem around npm enables rapid delivery but requires discipline around dependency quality and operational practices. Production-grade Node services depend on async correctness, observability, and resource management.',
    codeExample:
      "import http from 'node:http';\nimport { readFile } from 'node:fs/promises';\n\nconst server = http.createServer(async (req, res) => {\n  if (req.url === '/health') {\n    res.writeHead(200, { 'content-type': 'application/json' });\n    res.end(JSON.stringify({ ok: true }));\n    return;\n  }\n\n  const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));\n  res.writeHead(200, { 'content-type': 'text/plain' });\n  res.end(`Service: ${pkg.name}`);\n});\n\nserver.listen(process.env.PORT || 3000);",
    whenUsed:
      'Used in `p-stock` for API design and backend services, and in `p-docs` for collaboration infra and server orchestration.',
    gotchas:
      'CPU-bound work blocks event loop and degrades throughput.\nUnhandled promise rejections can crash processes or silently corrupt flow depending on runtime settings.\nNot closing DB/socket/file handles causes memory leaks and hanging shutdowns.\nLarge JSON parse/stringify on main thread can create latency spikes.\nRelying on default process behavior instead of graceful signal handling causes unsafe deploy restarts.',
    flashcards: [
      card('Why is Node strong for I/O but weak for CPU-intensive work?', 'Node uses a single main event loop thread for JS execution; heavy CPU blocks I/O scheduling while async I/O remains efficient.'),
      card('What is the practical difference between microtasks and macrotasks in Node?', 'Microtasks (Promise jobs) run before next event-loop phase, while timers/I/O callbacks run in later phases.'),
      card('How does backpressure apply to Node streams?', 'Readable/writable streams signal when producers should slow down; ignoring this can cause memory bloat.'),
      card('Why should `process.on("SIGTERM")` be handled in services?', 'It allows graceful shutdown: stop accepting traffic, drain requests, close resources, then exit cleanly.'),
      card('What problem does `AbortController` solve in backend code?', 'It gives cancellation semantics for fetch/timeouts and prevents orphaned async work.'),
      card('Why can top-level `await` be risky in startup paths?', 'Slow awaits delay boot and readiness; failures can leave process partially initialized.'),
      card('When would Worker Threads be preferred over clustering?', 'For CPU-bound parallelism within one process where shared memory/message passing is needed.'),
      card('How do you avoid configuration drift in Node apps?', 'Centralize typed config loading/validation from env and fail fast on missing/invalid values.'),
    ],
    apis: [
      api('http.createServer', 'http.createServer((req, res) => void)', 'Creates an HTTP server handling low-level request/response primitives.', 'request handler callback', 'http.Server', "const server = http.createServer((req, res) => {\n  res.writeHead(200);\n  res.end('ok');\n});", 'No routing/body parsing built in.'),
      api('fs.promises.readFile', 'readFile(path, options?) => Promise<Buffer|string>', 'Asynchronously reads a file into memory.', 'path and optional encoding/options', 'Promise<Buffer|string>', "const txt = await readFile('./config.json', 'utf8');", 'Large files should use streams to avoid memory spikes.'),
      api('fs.promises.writeFile', 'writeFile(path, data, options?) => Promise<void>', 'Writes data to file, replacing by default.', 'path, data, options/encoding', 'Promise<void>', "await writeFile('./out.log', 'done\\n', { flag: 'a' });", 'Use append flag for logs; write is not atomic by default.'),
      api('stream.pipeline', 'pipeline(source, ...transforms, destination, cb)', 'Safely pipes streams with automatic error forwarding/cleanup.', 'stream chain and callback/promise', 'void/Promise', "import { pipeline } from 'node:stream/promises';\nawait pipeline(src, gzip, dst);", 'Prefer pipeline over manual pipe chaining for robust error handling.'),
      api('process.env', 'process.env.KEY', 'Reads environment variables for configuration.', 'env key access', 'string | undefined', "const port = Number(process.env.PORT || 3000);", 'Everything is string; validate types explicitly.'),
      api('EventEmitter', 'emitter.on(event, listener)', 'Publishes/subscribes in-process events.', 'event name and listener', 'emitter', "emitter.on('ready', () => console.log('up'));", 'Unbounded listeners can leak memory.'),
      api('AbortController', 'new AbortController()', 'Cancels async operations that accept AbortSignal.', 'optional timeout/cancel trigger', 'controller with signal', "const ac = new AbortController();\nsetTimeout(() => ac.abort(), 2000);", 'Only works when downstream APIs support signal.'),
      api('Buffer.from', 'Buffer.from(value, encoding?)', 'Creates binary buffer from string/array/ArrayBuffer.', 'source data and optional encoding', 'Buffer', "const b = Buffer.from('hello', 'utf8');", 'Avoid deprecated `new Buffer()`.'),
    ],
    refs: [
      ref('Node.js Docs', 'https://nodejs.org/docs/latest/api/'),
      ref('Node.js Guides', 'https://nodejs.org/en/docs/guides'),
      ref('Node.js Streams', 'https://nodejs.org/docs/latest/api/stream.html'),
      ref('Node.js Process Signals', 'https://nodejs.org/docs/latest/api/process.html#signal-events'),
      ref('Undici Fetch in Node', 'https://nodejs.org/docs/latest/api/globals.html#fetch'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs'],
  });
  skills.push(node);

  [
    ['Event Loop & Concurrency',
      'Synchronous CPU work, sync I/O, or large JSON parsing blocks the event loop. Under load this shows up as event-loop lag and request timeouts.',
      'No sync fs/crypto calls in request paths. CPU-heavy work delegated to worker threads. Event loop lag exposed via /metrics. Async patterns consistent (no nested promise chains where async/await reads cleaner).'],
    ['Modules & Package Management',
      'Mixed CJS/ESM (require vs import in same project), unpinned dependency ranges causing reproducible-build failures, transitive vulnerabilities ignored. Lockfile drift between local and CI is a common culprit.',
      'package.json "type" field set explicitly, lockfile committed and respected in CI (`npm ci`, `pnpm install --frozen-lockfile`), engines field pins Node version, dependencies audited via `npm audit` / Snyk in CI.'],
    ['File System & Streams',
      'Reading entire files into memory with fs.readFile when streaming would do — OOM on large uploads. Or streams without backpressure handling — producer outpaces consumer, memory grows unbounded until crash.',
      '`pipe()` preferred over manual stream wiring. Every stream has error handler attached. Sync fs methods banned in request paths. File operations validate paths (no directory traversal) and check size before reading.'],
    ['Process & Environment',
      'Process exits silently on unhandled promise rejection (default in modern Node), env vars assumed present without validation, signals (SIGTERM, SIGINT) not handled — container kill = abrupt shutdown, lost in-flight requests.',
      'Validate env vars at boot, fail fast on missing config, handle SIGTERM gracefully, and log fatal errors before exiting.'],
    ['Error Handling Patterns',
      'Empty catch blocks, missing `await`, and mapping every failure to 500 hide real causes. Separate user errors from server errors and log both.',
      'Typed error classes with HTTP status codes built in. Single error middleware maps errors to response envelopes. Unhandled rejection / uncaughtException at process level always logs + exits (not silent recovery). No empty catch blocks.'],
    ['Worker Threads',
      'Sharing JS objects across threads — workers only share ArrayBuffer/SharedArrayBuffer, not regular objects. Devs assume reference semantics, get value copies, are confused when "updates" don\'t propagate.',
      'Workers used only for CPU-bound work, not I/O. Message protocol typed and validated. No leaked workers — every spawn paired with cleanup on completion or error. Worker pool bounded, not unlimited.'],
    ['Testing Node Services',
      'Shared DB state causes flaky tests. Over-mocking hides real behavior. Slow suites get skipped when pressure rises.',
      'Use a real DB with per-test isolation, mock only external systems, keep most tests fast, and reserve e2e tests for critical flows.'],
  ].forEach(([name, a1, a2]) => {
    skills.push(
      mk(name, 'backend', node.id, {
        definition: `${name} is a core Node.js subtopic needed for resilient production services.`,
        codeExample:
          name === 'Event Loop & Concurrency'
            ? "setTimeout(() => console.log('timer'), 0);\nPromise.resolve().then(() => console.log('microtask'));"
            : name === 'Worker Threads'
              ? "import { Worker } from 'node:worker_threads';\nnew Worker(new URL('./worker.js', import.meta.url));"
              : "try {\n  await serviceCall();\n} catch (err) {\n  logger.error(err);\n}",
        flashcards: [
          card(`What commonly breaks first in ${name}?`, a1),
          card(`What is a strong code-review signal for ${name}?`, a2),
        ],
      })
    );
  });

  const express = mk('Express.js', 'backend', null, {
    definition:
      'Express is a minimalist Node web framework for HTTP servers and APIs. Its middleware pipeline model is simple and composable, making it easy to organize cross-cutting concerns such as auth, logging, and validation. Express remains widely adopted due to ecosystem maturity and low abstraction overhead. Production quality depends on consistent error handling, validation, and security middleware.',
    codeExample:
      "import express from 'express';\n\nconst app = express();\napp.use(express.json());\n\napp.get('/health', (_req, res) => {\n  res.json({ ok: true });\n});\n\napp.post('/users', (req, res) => {\n  const { email } = req.body;\n  if (!email) return res.status(400).json({ error: 'email_required' });\n  return res.status(201).json({ id: 'u_1', email });\n});\n\napp.listen(3000);",
    whenUsed:
      'Core server layer in `p-stock` and backend endpoints supporting integrations and business flows.',
    gotchas:
      'Async route errors without `next(err)`/wrapper can bypass centralized handlers.\nMiddleware order mistakes (auth before body parser, etc.) cause confusing behavior.\nSending multiple responses from one path crashes request lifecycle.\nTrusting user input without validation creates injection and logic bugs.\nDefault Express settings are not enough for security headers/rate control in internet-facing apps.',
    flashcards: [
      card('Why is middleware order critical in Express?', 'Each middleware can short-circuit or mutate request/response; wrong sequence changes behavior and security posture.'),
      card('What makes centralized error middleware valuable?', 'It enforces consistent status codes, logging, and response shape across all failures.'),
      card('How do you avoid repeated try/catch in async routes?', 'Use a shared async wrapper that forwards errors to `next`.'),
      card('Why should validation happen at route boundaries?', 'It prevents invalid data from entering core business logic and simplifies assumptions downstream.'),
      card('What does `app.set("trust proxy", 1)` influence?', 'It affects IP/protocol handling behind proxies and is required for secure cookies in many deployments.'),
      card('Why avoid putting business logic directly in controllers?', 'Controllers should orchestrate I/O; domain logic belongs in services for testability and reuse.'),
      card('When can Express become a bottleneck?', 'Mostly via app-level design issues (sync work, heavy middleware, DB latency), not framework overhead alone.'),
      card('What is the role of idempotency in POST endpoints?', 'It prevents duplicate side effects during retries/timeouts, crucial for payment/order workflows.'),
    ],
    apis: [
      api('express()', 'express()', 'Creates an Express app instance.', 'none', 'Application', 'const app = express();', 'App is a middleware function plus routing methods.'),
      api('express.json', 'express.json(options?)', 'Parses JSON request bodies into `req.body`.', 'optional parser config', 'middleware', 'app.use(express.json({ limit: "1mb" }));', 'Without it, `req.body` is undefined for JSON payloads.'),
      api('app.use', 'app.use([path], middleware)', 'Registers middleware globally or for path prefix.', 'optional path + middleware fn', 'app', 'app.use("/api", authMiddleware);', 'Order defines execution order.'),
      api('app.get/post/put/delete', 'app.METHOD(path, ...handlers)', 'Registers route handlers for HTTP methods.', 'path and one or more handlers', 'app', 'app.get("/users/:id", controller);', 'Route params are strings; validate/parse explicitly.'),
      api('Router', 'express.Router()', 'Creates modular route groups.', 'none', 'router instance', "const router = express.Router();\nrouter.get('/health', handler);", 'Mount with app.use(path, router).'),
      api('res.status().json()', 'res.status(code).json(payload)', 'Sets HTTP status and sends JSON response.', 'status code and serializable payload', 'response', "return res.status(201).json({ id });", 'Do not continue processing after response is sent.'),
      api('next', 'next(err?)', 'Passes control to next middleware or error handler.', 'optional error', 'void', "if (!auth) return next(new Error('unauthorized'));", 'Calling next after response can trigger headers-sent issues.'),
      api('app.listen', 'app.listen(port, callback?)', 'Starts HTTP server.', 'port and optional callback', 'http.Server', "app.listen(process.env.PORT || 3000);", 'Handle server close for graceful shutdown in production.'),
    ],
    refs: [
      ref('Express Docs', 'https://expressjs.com/'),
      ref('Express API Reference', 'https://expressjs.com/en/4x/api.html'),
      ref('Express Security Best Practices', 'https://expressjs.com/en/advanced/best-practice-security.html'),
      ref('Helmet', 'https://helmetjs.github.io/'),
      ref('express-validator', 'https://express-validator.github.io/docs/'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(express);

  [
    ['Middleware Architecture',
      'Business logic in middleware — auth checks doing DB lookups every request, response transformations that should be in controllers. Middleware is for cross-cutting concerns (logging, parsing, auth header parse), not domain work.',
      'All middleware async/await-safe (errors propagated via `next(err)`). Order documented in a central middleware setup file. Per-route middleware preferred over global for narrow concerns (auth, validation).'],
    ['Routing & Modular Routers',
      'All routes in app.js — single 2000-line file. Or catch-all `app.use` blocks placed before specific routes — they swallow downstream requests. Or path strings hardcoded everywhere — refactoring becomes find-and-replace nightmare.',
      'Routes split into feature-based Router modules, mounted on app with consistent prefixes. URL conventions (kebab-case, plural nouns) enforced via lint rules. OpenAPI spec generated from routes — single source of truth.'],
    ['Validation & Sanitization',
      'Scattered inline checks, trusting client validation, or sanitizing for only one threat lets bad data reach business logic.',
      'Use one schema per input, validate before handlers, sanitize by sink, and return consistent 422 errors with field details.'],
    ['Auth Middleware',
      'Auth middleware mounted globally with route-by-route exemptions in handlers. Easy to miss an exemption → wrong default. Or auth tied to a specific JWT library — swap = rewrite everywhere.',
      'Single auth middleware attaches `req.user`; downstream handlers never re-implement auth. Token validation centralized. Failures return consistent 401 envelope. Permissions checked via separate authorization middleware (RBAC/ABAC).'],
    ['Error Handling',
      'try/catch in every controller doing the same error mapping. Or errors caught and swallowed silently. Or stack traces leaked to clients in 500 responses. Centralize in a single error middleware (4-arg signature: `err, req, res, next`).',
      'Use typed errors, one error middleware, consistent JSON envelopes, no production stack leaks, and logs with request context.'],
    ['Security Hardening',
      'Default Express setup left in production — `X-Powered-By` header leaks framework, no helmet, verbose error stacks in 500 responses, no request timeouts. Each is a fingerprinting or attack surface.',
      '`helmet()` middleware globally, `X-Powered-By` disabled, request timeouts set, body size limits enforced, CORS configured explicitly (not `*`), security headers verified via automated scan (OWASP ZAP).'],
    ['Observability & Logging',
      'Unstructured `console.log`, PII in logs, and missing trace IDs make production debugging slow and risky.',
      'Use JSON logs, request trace IDs, central PII scrubbing, environment-specific log levels, and `/metrics` for service health.'],
  ].forEach(([name, a1, a2]) => {
    skills.push(
      mk(name, 'backend', express.id, {
        definition: `${name} in Express ensures APIs stay maintainable, safe, and diagnosable under load.`,
        codeExample:
          name === 'Error Handling'
            ? "app.use((err, _req, res, _next) => {\n  res.status(500).json({ error: 'internal_error' });\n});"
            : name === 'Middleware Architecture'
              ? "app.use(requestId());\napp.use(auth());\napp.use(rateLimit());"
              : "router.get('/resource', handler);",
        flashcards: [
          card(`What anti-pattern appears often in ${name}?`, a1),
          card(`How do you enforce consistency in ${name}?`, a2),
        ],
      })
    );
  });

  const rest = mk('REST APIs', 'backend', null, {
    definition:
      'REST APIs model resources over HTTP using consistent URI design, verbs, and status semantics. Good REST design emphasizes idempotency, statelessness, and explicit error contracts. APIs should be evolvable via versioning and backward-compatible changes where possible. Operationally, pagination, caching headers, and observability are as important as endpoint shape.',
    codeExample:
      "app.get('/v1/orders', async (req, res) => {\n  const limit = Math.min(Number(req.query.limit || 20), 100);\n  const cursor = req.query.cursor || null;\n  const page = await orderRepo.list({ limit, cursor });\n  res.set('cache-control', 'private, max-age=30');\n  res.json({ data: page.items, nextCursor: page.nextCursor });\n});",
    whenUsed:
      'Primary API style for `p-stock`, `p-maak`, and `p-packarma` for mobile/web integration and service interoperability.',
    gotchas:
      'Overloading one endpoint with RPC-style verbs in paths degrades clarity.\nIgnoring idempotency for retryable operations causes duplicate writes.\nInconsistent error payloads increase client complexity and support burden.\nOffset pagination on mutable datasets can skip/duplicate records.\nReturning 200 for every failure hides semantics from clients and observability.',
    flashcards: [
      card('Why is idempotency important for POST-like operations?', 'Network retries are unavoidable; idempotency keys prevent duplicate side effects.'),
      card('When should cursor pagination be preferred over offset?', 'Large or frequently changing datasets where stable page boundaries are needed.'),
      card('What is a robust error response shape?', 'Machine-readable code, human message, request identifier, and optional field-level details.'),
      card('Why should API contracts include explicit nullability?', 'Ambiguous optionality leads to fragile clients and runtime parsing errors.'),
      card('How do ETags improve API efficiency?', 'They enable conditional requests and 304 responses, reducing payload transfer.'),
      card('What makes a breaking API change?', 'Removing/renaming fields, changing types/semantics, or tightening validation without versioning strategy.'),
      card('Why is `PUT` semantically different from `PATCH`?', 'PUT replaces resource representation (often full), PATCH applies partial modifications.'),
      card('What is a common anti-pattern in status code usage?', 'Returning 200 with embedded error metadata instead of proper 4xx/5xx status.'),
    ],
    apis: [
      api('HTTP GET', 'GET /resources/{id}', 'Fetches representation without side effects.', 'path/query parameters', 'resource JSON', 'GET /v1/users/u_1', 'Should be safe and cache-aware.'),
      api('HTTP POST', 'POST /resources', 'Creates new resource or submits command.', 'request body', 'created resource / command result', 'POST /v1/orders', 'Use idempotency keys for retry-sensitive flows.'),
      api('HTTP PUT', 'PUT /resources/{id}', 'Replaces full resource representation.', 'resource identifier + body', 'updated resource', 'PUT /v1/profile/u_1', 'Partial data in PUT can accidentally erase fields.'),
      api('HTTP PATCH', 'PATCH /resources/{id}', 'Applies partial updates.', 'partial patch body', 'updated resource', 'PATCH /v1/users/u_1', 'Define patch semantics clearly to avoid ambiguity.'),
      api('HTTP DELETE', 'DELETE /resources/{id}', 'Deletes resource or marks as deleted.', 'resource identifier', '204 or deletion metadata', 'DELETE /v1/users/u_1', 'Hard delete vs soft delete should be explicit.'),
      api('ETag/If-None-Match', 'ETag + If-None-Match headers', 'Conditional request support for caching.', 'entity tag headers', '304 or fresh response', "res.set('ETag', hash(body));", 'Weak/strong ETag semantics must be consistent.'),
      api('Rate-Limit Headers', 'RateLimit-Limit/Remaining/Reset', 'Communicates request quotas to clients.', 'response headers', 'budget metadata', "res.set('RateLimit-Remaining', '47');", 'Undocumented limits produce poor client retry behavior.'),
      api('OpenAPI', 'openapi.yaml schema', 'Machine-readable API contract for docs, validation, and codegen.', 'spec file', 'contract artifact', 'paths:\n  /v1/orders:\n    get:\n      responses: ...', 'Spec drift from implementation erodes trust quickly.'),
    ],
    refs: [
      ref('MDN HTTP Overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview'),
      ref('RFC 9110 HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110'),
      ref('REST Resource Naming Guide', 'https://restfulapi.net/resource-naming/'),
      ref('OpenAPI Specification', 'https://spec.openapis.org/oas/latest.html'),
      ref('Google API Improvement Proposals', 'https://google.aip.dev/'),
    ],
    relatedProjectIds: ['p-stock', 'p-maak', 'p-packarma'],
  });
  skills.push(rest);

  [
    ['Resource Modeling',
      'Inconsistent resource naming across the API — singular vs plural, verb in path (`/getUser`) vs noun (`/users/{id}`). Clients hit edge cases. Once external clients depend on inconsistency, refactoring cost compounds.',
      'API style guide enforced at PR time (lint rules for path patterns). Schema-first approach (OpenAPI) — design endpoints before coding. Contract tests verify shape changes are explicit, not accidental. Resource lifecycle documented.'],
    ['Status Codes & Error Shapes',
      'Inconsistent error shapes across endpoints — clients can\'t write generic error handling. Or 500s with stack traces leaking internal details. Or wrong status codes (200 with error body, 404 for forbidden) — breaks client logic.',
      'Single error envelope (`{ code, message, details, traceId }`) applied via error middleware. Error codes stable and enumerated. Status codes follow conventions (4xx client error, 5xx server error). Stack traces never sent to clients in prod.'],
    ['Pagination & Filtering',
      'Offset-based pagination on large datasets — DB scans + skips, performance degrades. Plus inserts between pages cause duplicates/skips. Filters without validation allow DoS (sort on unindexed column, deep nested filters).',
      'Cursor-based pagination for collections expected to grow. Cursor opaque to clients. Page size capped (default 20, max 100). Filter fields whitelisted, mapped to indexed columns. Slow-query monitoring alerts on filter combos blowing p95.'],
    ['Idempotency',
      'POST endpoints that aren\'t idempotent — retries (client network blip, mobile reconnect) create duplicate resources. Charges processed twice, orders submitted twice. Causes worst-case data corruption.',
      'Idempotency-Key header for state-changing requests. Server stores key + result for TTL (24h typical). Retries with same key return stored result, never re-execute. Critical for payment, order, and any expensive side-effect operation.'],
    ['Versioning Strategies',
      'No versioning at all → first breaking change ships and breaks every consumer. Or version in query param (`?v=2`) that gets cached differently than path versioning, causing inconsistent client experiences.',
      'URL path versioning (`/v1`, `/v2`) for clarity. Deprecation timeline announced 6+ months before breaking changes. Deprecation headers returned on deprecated endpoints. Client telemetry shows version usage before sunset.'],
    ['Caching & Conditional Requests',
      'Missing headers overload origin; aggressive caching serves stale data; caching personalized responses at CDN can leak user data.',
      'Set ETag or Last-Modified, require conditional requests, choose Cache-Control per endpoint, and mark user-specific data `private`.'],
    ['Rate Limiting',
      'Single-instance rate limit counters in a horizontally scaled service — each instance enforces independently, real limit = N × intended. Or no rate limit on expensive endpoints (search, exports) → first abusive client takes down the API.',
      'Distributed counter store (Redis with INCR + EXPIRE). Limits applied per user, per IP, per endpoint — tiered. 429 responses include Retry-After header. Limits logged and alerted when 429 rate spikes.'],
  ].forEach(([name, a1, a2]) => {
    skills.push(
      mk(name, 'backend', rest.id, {
        definition: `${name} determines API clarity, evolvability, and client reliability.`,
        codeExample:
          name === 'Status Codes & Error Shapes'
            ? "return res.status(422).json({ code: 'validation_failed', fields: [{ path: 'email', message: 'invalid' }] });"
            : name === 'Pagination & Filtering'
              ? "GET /v1/orders?cursor=abc&limit=20&status=open"
              : 'const idempotencyKey = req.header("Idempotency-Key");',
        flashcards: [
          card(`What reliability risk is highest in ${name}?`, a1),
          card(`How do you de-risk ${name} changes?`, a2),
        ],
      })
    );
  });

  const gql = mk('GraphQL', 'backend', null, {
    definition:
      'GraphQL is a query language and runtime for APIs where clients request exactly the data shape they need. It uses a strongly typed schema with resolvers that map fields to data sources. GraphQL reduces over/under-fetching but shifts complexity to schema design, resolver performance, and authorization. Production GraphQL depends on query cost controls and robust observability.',
    codeExample:
      "import { ApolloServer } from '@apollo/server';\n\nconst typeDefs = `#graphql\n  type User { id: ID!, name: String!, email: String! }\n  type Query { user(id: ID!): User }\n`;\n\nconst resolvers = {\n  Query: {\n    user: async (_parent, { id }, { repos }) => repos.users.byId(id),\n  },\n};\n\nconst server = new ApolloServer({ typeDefs, resolvers });",
    whenUsed:
      'Used in `p-maak` and `p-packarma` to optimize mobile payloads and flexible client-driven data needs.',
    gotchas:
      'N+1 resolver patterns can explode DB calls without batching.\nSchema fields without ownership/authorization checks leak data.\nAllowing unbounded nested queries enables denial-of-service patterns.\nCoupling schema directly to DB models causes long-term versioning pain.\nMissing persisted queries can increase attack surface and cache misses.',
    flashcards: [
      card('Why does GraphQL frequently need DataLoader?', 'To batch and cache per-request entity lookups and avoid N+1 query amplification.'),
      card('What is the danger of exposing internal IDs directly?', 'It can leak implementation details and enable enumeration attacks if authorization is weak.'),
      card('How do resolvers differ from REST controllers?', 'Resolvers execute per field graph and can fan out heavily; controllers usually map endpoint to one orchestration path.'),
      card('Why enforce query depth/complexity limits?', 'To prevent expensive nested queries from degrading service availability.'),
      card('What does schema-first design buy teams?', 'Shared contract clarity and intentional evolution independent of storage model changes.'),
      card('How can GraphQL still over-fetch?', 'Clients may request large optional subtrees unless query governance and conventions exist.'),
      card('What is a common auth mistake in GraphQL?', 'Checking auth only at root resolver and forgetting field-level access rules.'),
      card('Why are persisted queries useful in production?', 'They constrain allowed operations, improve caching, and reduce request payload size.'),
    ],
    apis: [
      api('typeDefs', 'GraphQL SDL', 'Defines schema types, queries, mutations, and subscriptions.', 'schema definition language', 'schema contract', 'type Query { me: User }', 'Schema drift breaks clients quickly.'),
      api('resolver', '(parent, args, context, info) => result', 'Function resolving each schema field.', 'resolver context and args', 'field value', "Query: { user: (_, { id }) => repo.byId(id) }", 'Resolver fan-out can trigger N+1 issues.'),
      api('ApolloServer', 'new ApolloServer({ typeDefs, resolvers })', 'GraphQL server runtime with plugin ecosystem.', 'schema + resolver map + options', 'server instance', 'const server = new ApolloServer({ typeDefs, resolvers });', 'Production needs depth limits and error masking.'),
      api('DataLoader', 'new DataLoader(batchFn)', 'Batches and memoizes key-based fetches per request.', 'batch loading function', 'loader instance', "const userLoader = new DataLoader((ids) => repo.byIds(ids));", 'Cache scope should be per request, not global.'),
      api('GraphQL Non-Null', 'String! / [Item!]!', 'Declares nullability guarantees in schema.', 'SDL type annotations', 'stronger contract', 'type User { email: String! }', 'Overusing nullable fields weakens client guarantees.'),
      api('Mutation', 'type Mutation { updateUser(...): User! }', 'Defines write operations with explicit inputs.', 'input args or input object', 'mutation result', 'mutation { updateUser(id:"1", input:{name:"A"}) { id } }', 'Keep side effects idempotent when possible.'),
      api('Fragments', 'fragment UserFields on User { id name }', 'Reusable field selections for client query consistency.', 'fragment definitions', 'query composition', 'query { me { ...UserFields } }', 'Fragment sprawl can hide payload bloat.'),
      api('Subscriptions', 'type Subscription { eventCreated: Event! }', 'Real-time GraphQL updates over WebSocket transport.', 'subscription field definitions', 'stream of results', 'subscription { eventCreated { id } }', 'Needs connection/auth lifecycle management.'),
    ],
    refs: [
      ref('GraphQL Official Docs', 'https://graphql.org/learn/'),
      ref('GraphQL Specification', 'https://spec.graphql.org/'),
      ref('Apollo Server Docs', 'https://www.apollographql.com/docs/apollo-server'),
      ref('DataLoader', 'https://github.com/graphql/dataloader'),
      ref('GraphQL Security Best Practices', 'https://graphql.org/learn/security/'),
    ],
    relatedProjectIds: ['p-maak', 'p-packarma'],
  });
  skills.push(gql);

  [
    ['Schema Design',
      'Treating GraphQL schema as a thin layer over DB tables — exposes implementation details, locks DB shape to API contract, forces clients into N+1 queries by default. Schema should model the domain, not the storage.',
      'Schema changes go through PR review with breaking-change linting (graphql-inspector). Deprecation directive used before removal. Schema versioned in source control. Field-level metrics show actual usage — informs what to deprecate.'],
    ['Resolvers & Data Sources',
      'Resolvers doing DB queries individually per field, per object → exponential query count for nested selections. Looks fine in dev with 10 records; melts in prod with 10k. DataLoader batching mandatory at scale.',
      'Track resolver latency/error/count, assert query counts in tests, and keep resolvers thin behind data-source abstractions.'],
    ['N+1 & Batching',
      'DataLoader instance shared across requests — caches results from one user\'s session and serves them to another → data leak. Or per-request DataLoader forgotten → defaults back to N+1. Each is a different production failure mode.',
      'DataLoader instances created per-request, never global. Tests verify batch size > 1 for nested selections. Query count assertions in tests catch N+1 regressions. Production metrics track resolver-level DB call count.'],
    ['GraphQL Auth & Authorization',
      'Auth checks done in resolvers, scattered across the codebase. Adding a new field requires remembering to add auth. Missed checks ship without anyone noticing. Authorization is a cross-cutting concern that belongs in middleware/directives.',
      'Auth via schema directives (`@auth`, `@hasRole`) so every protected field is visibly tagged. Default-deny: any field without an auth directive treated as authenticated-only. Audit script flags untagged fields in CI.'],
    ['Query Cost Control',
      'Unbounded queries — clients request deeply nested data (post → author → posts → author → posts...), or request 10,000 items in one query. Server tries, falls over. GraphQL\'s flexibility is its DoS vector.',
      'Query depth limit (max 10), query complexity analysis (each field has a cost, total bounded). Persisted queries for known clients — only pre-approved queries run. Rate limiting per user. Slow query alerts.'],
    ['Caching Strategies',
      'Naive whole-query caching is weak in GraphQL because every selection set can become a different cache key. Without persisted queries or normalized caching, cache hit rate stays low and authorization becomes risky.',
      'Use persisted queries for stable operation IDs, cache resolver/entity results with permission-aware keys, and use HTTP caching only for safe, cacheable GraphQL GET requests. Monitor cache hit rate to confirm the layer is useful.'],
    ['Federation Basics',
      'Gateway becomes a single point of failure / latency bottleneck. Subgraph queries hit slowest service. Cross-service joins (entity resolution) hide complexity from clients but compound failure modes.',
      'Subgraph composition validated in CI before merge. Gateway emits per-subgraph latency metrics. Schema ownership documented per team. Federated query plans visualized in observability for debugging slow queries.'],
  ].forEach(([name, a1, a2]) => {
    skills.push(
      mk(name, 'backend', gql.id, {
        definition: `${name} keeps GraphQL APIs scalable, secure, and understandable for client teams.`,
        codeExample:
          name === 'N+1 & Batching'
            ? "const loaders = {\n  userById: new DataLoader((ids) => repo.users.byIds(ids)),\n};"
            : name === 'GraphQL Auth & Authorization'
              ? "if (!ctx.user || ctx.user.id !== parent.ownerId) {\n  throw new Error('forbidden');\n}"
              : 'type Query { health: String! }',
        flashcards: [
          card(`What is the biggest scaling trap in ${name}?`, a1),
          card(`How do you verify correctness in ${name}?`, a2),
        ],
      })
    );
  });

  const ws = mk('WebSockets', 'backend', null, {
    definition:
      'WebSockets provide persistent full-duplex communication between client and server over a single connection. They are suited for real-time interactions such as market feeds, collaboration, and live notifications. Unlike stateless HTTP, connection lifecycle and fan-out become core concerns. Scalable deployments require heartbeats, reconnect policies, and horizontal pub/sub coordination.',
    codeExample:
      "import { WebSocketServer } from 'ws';\n\nconst wss = new WebSocketServer({ port: 8080 });\n\nwss.on('connection', (socket) => {\n  socket.send(JSON.stringify({ type: 'welcome' }));\n\n  socket.on('message', (raw) => {\n    const msg = JSON.parse(raw.toString());\n    if (msg.type === 'ping') socket.send(JSON.stringify({ type: 'pong' }));\n  });\n\n  const hb = setInterval(() => socket.send(JSON.stringify({ type: 'heartbeat' })), 10000);\n  socket.on('close', () => clearInterval(hb));\n});",
    whenUsed:
      'Used in `p-stock` for market stream updates and in `p-docs` for collaborative editing synchronization.',
    gotchas:
      'No heartbeat strategy leads to zombie sockets and stale presence state.\nBroadcast loops without room/topic filters waste bandwidth and CPU.\nAuthentication only at handshake without token refresh handling can create stale auth sessions.\nMissing backpressure handling can crash servers under high fan-out.\nAssuming message order across distributed systems can cause inconsistent client state.',
    flashcards: [
      card('Why are heartbeats mandatory in WebSocket systems?', 'They detect dead connections quickly and keep presence state accurate.'),
      card('What is the difference between transport-level and app-level ACKs?', 'Transport ACK confirms frame delivery; app ACK confirms business event processing.'),
      card('Why can WebSockets complicate horizontal scaling?', 'Connection state is sticky and broadcasts need shared pub/sub across instances.'),
      card('When is SSE a better fit than WebSockets?', 'One-way server-to-client streams with simpler infrastructure and lower protocol complexity.'),
      card('What causes message storms in real-time systems?', 'Unbounded rebroadcasting, missing dedupe, and no per-room routing constraints.'),
      card('Why should message envelopes include version/type fields?', 'They support evolution and backward compatibility across clients.'),
      card('How do you prevent replay/duplication side effects?', 'Use idempotency keys or sequence IDs with dedupe windows.'),
      card('What is a key operational metric for WebSockets?', 'Active connections and per-channel message lag/drop rates.'),
    ],
    apis: [
      api('WebSocketServer (ws)', 'new WebSocketServer({ port | server })', 'Creates a WebSocket server in Node.', 'port or existing HTTP server', 'server instance', "const wss = new WebSocketServer({ server });", 'Attach to existing HTTP server for shared port/proxy setup.'),
      api('connection event', "wss.on('connection', (socket, req) => {})", 'Handles new client connections.', 'socket and upgrade request', 'event callback', "wss.on('connection', (socket) => socket.send('hello'));", 'Authenticate early and reject unauthorized sessions.'),
      api('message event', "socket.on('message', handler)", 'Receives incoming frames/messages.', 'raw data buffer/string', 'event callback', "socket.on('message', (raw) => JSON.parse(raw));", 'Validate schema; never trust client payload shape.'),
      api('socket.send', 'socket.send(data)', 'Sends message to connected client.', 'string/buffer payload', 'void', "socket.send(JSON.stringify({ type: 'update' }));", 'Check ready state before sending.'),
      api('ping/pong', 'socket.ping() / pong handlers', 'Heartbeat primitives to detect dead peers.', 'optional payload', 'void/events', "const t = setInterval(() => socket.ping(), 30000);", 'Terminate unresponsive sockets to avoid leaks.'),
      api('readyState', 'socket.readyState', 'Represents connection state constants.', 'none', 'numeric state', 'if (socket.readyState === socket.OPEN) socket.send(msg);', 'Sending in closing/closed states throws or drops.'),
      api('close event', "socket.on('close', (code, reason) => {})", 'Handles disconnect cleanup.', 'close code and reason', 'event callback', "socket.on('close', () => clearInterval(timer));", 'Always cleanup intervals/subscriptions.'),
      api('Broadcast pattern', 'for (const c of wss.clients) c.send(...)', 'Sends to all or selected clients.', 'iterable of clients and filter', 'void', "for (const c of wss.clients) {\n  if (c.readyState === c.OPEN) c.send(payload);\n}", 'Filter by room/topic to avoid unnecessary fan-out.'),
    ],
    refs: [
      ref('MDN WebSocket API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket'),
      ref('ws Library', 'https://github.com/websockets/ws'),
      ref('RFC 6455 WebSocket Protocol', 'https://www.rfc-editor.org/rfc/rfc6455'),
      ref('Socket.IO Concepts', 'https://socket.io/docs/v4/'),
      ref('Ably WebSocket Scaling Guide', 'https://ably.com/topic/websocket-architecture-best-practices'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs'],
  });
  skills.push(ws);

  [
    ['Connection Lifecycle',
      'Zombie connections — TCP-level connection held open but client-side state died (app backgrounded, network changed). Server keeps "subscriber" alive, wastes memory, fires events into the void. Without heartbeat, undetectable until restart.',
      'Heartbeat ping every 30–60s; missing pong → close connection. Per-connection memory cap. Logging on connect/disconnect with reason. Metrics for connection count, churn rate, and avg lifetime.'],
    ['Pub/Sub Fan-out',
      'In-memory pub/sub misses clients on other servers. Unfiltered fan-out wastes bandwidth and can overload the broker.',
      'Redis pub/sub or Kafka for cross-instance fan-out. Server-side filtering before send (don\'t ship messages clients will drop). Topic granularity tuned (too broad = waste, too narrow = topic explosion). Metrics on fan-out ratio per topic.'],
    ['Presence & Heartbeats',
      'Presence (who\'s online) drifts — clients disconnect ungracefully, server still shows them online for minutes. Or heartbeat too aggressive on mobile → drains battery. Or presence broadcast on every change → N² message storm in large rooms.',
      'Heartbeat tuned per platform (longer on mobile, shorter on web). Presence updates batched and debounced. Last-seen timestamp instead of strict online/offline. Presence cleanup on connection close, scheduled cleanup for missed closes.'],
    ['Message Protocol Design',
      'No protocol versioning — server adds new fields, old clients break or vice versa. Or messages without IDs — can\'t dedupe on reconnect/replay, can\'t correlate request/response. Or schema-less JSON — typo in field name silently ignored.',
      'Protocol version negotiated on connect. Every message has type, id, sequence. Schema validation server-side and client-side (Zod, protobuf). Backwards-compat rules (new optional fields okay, removing fields requires deprecation period).'],
    ['Auth & Re-auth',
      'Token validated only at connection open, then never re-checked. User logs out / token revoked → WebSocket still active forever. Long-lived connections need periodic re-auth or push-revocation handling.',
      'JWT validated on connect via query param or first message. Token refresh handled — client reconnects with new token before old expires. Revocation handled via pub/sub on logout events. Per-message authorization for sensitive operations.'],
    ['Backpressure & Flow Control',
      'Slow client (mobile on bad network) can\'t drain messages as fast as server sends. Server\'s send buffer grows unbounded → OOM, or messages dropped silently. Or producer floods consumers with no rate control.',
      'Per-connection send buffer cap with drop or disconnect policy. Producer throttled to consumer rate where possible. Critical messages acknowledged (ack/replay) so drops are recoverable. Metrics on buffer fill rate.'],
    ['Horizontal Scaling',
      'Single-server pub/sub — clients connected to server A never receive messages sent to clients on server B. Or sticky sessions used as a crutch, breaking on server restart. Cross-instance fan-out requires a shared message bus.',
      'Redis pub/sub or Kafka for cross-instance message fan-out. Each instance subscribes to relevant channels, forwards to its local clients. Sticky sessions only for stateful use cases; stateless WS preferred.'],
  ].forEach(([name, a1, a2]) => {
    skills.push(
      mk(name, 'backend', ws.id, {
        definition: `${name} is essential for reliable real-time systems under variable traffic and network quality.`,
        codeExample:
          name === 'Connection Lifecycle'
            ? "socket.on('open', onOpen);\nsocket.on('close', onClose);\nsocket.on('error', onError);"
            : name === 'Message Protocol Design'
              ? 'const envelope = { id, type, version: 1, ts: Date.now(), payload };'
              : "if (client.readyState === client.OPEN) {\n  client.send(payload);\n}",
        flashcards: [
          card(`What production bug appears often in ${name}?`, a1),
          card(`What is the baseline safeguard for ${name}?`, a2),
        ],
      })
    );
  });

  // Added by Claude Code audit — 2026-05-20

  // Node.js — additional top-level flashcards
  node.flashcards.push(
    card('What is AsyncLocalStorage and why is it useful?', 'It provides request-scoped context (like a trace ID) that flows through async call chains without passing it as a parameter everywhere.'),
    card('How do uncaughtException and unhandledRejection differ?', 'uncaughtException fires for synchronous throws that escape all handlers; unhandledRejection fires for Promise rejections with no .catch(). Both can crash the process.'),
    card('When would you use cluster module over worker_threads?', 'cluster spawns separate OS processes sharing a port for CPU scaling across cores; worker_threads share memory within one process for CPU-bound parallel computation.'),
    card('Why is --max-old-space-size important in production?', 'Node defaults to ~1.5 GB V8 heap; without tuning, memory-heavy services hit OOM before the host machine is exhausted.'),
    card('What does module.exports vs export default mean for dual CJS/ESM packages?', 'Packages can ship both via "exports" field in package.json with "require" and "import" conditions — the dual package hazard arises if consumers load both copies.'),
  );

  // Node.js — additional APIs
  node.apis.push(
    api('path.join / path.resolve', 'path.join(...segments) / path.resolve(...segments)', 'Joins path segments safely (join) or resolves an absolute path (resolve).', 'path string segments', 'string path', "import { join } from 'node:path';\nconst p = join(__dirname, 'config', 'app.json');", 'Use path APIs instead of string concatenation to avoid OS separator bugs.'),
    api('child_process.spawn', "spawn(command, args, options)", 'Spawns a child process and streams stdout/stderr.', 'command, args array, options', 'ChildProcess instance', "import { spawn } from 'node:child_process';\nconst ls = spawn('ls', ['-lh', '/tmp']);", 'Use spawn over exec for large output to avoid buffer overflow.'),
    api('timers/promises', 'setTimeout(ms), setInterval(ms)', 'Promisified timer utilities from node:timers/promises.', 'delay in ms', 'Promise', "import { setTimeout as delay } from 'node:timers/promises';\nawait delay(500);", 'Prefer over wrapping setTimeout in a manual Promise.'),
    api('AsyncLocalStorage', 'new AsyncLocalStorage(); .run(store, fn); .getStore()', 'Propagates request-scoped context through async call chains.', 'store value and callback', 'scoped store access', "const als = new AsyncLocalStorage();\nals.run({ reqId: 'r1' }, () => doWork());\n// inside doWork:\nals.getStore().reqId;", 'Store is undefined outside a run() context.'),
  );

  // Node.js sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== node.id) return;
    const specific = {
      'Event Loop & Concurrency': [
        card('What are the phases of the Node.js event loop in order?', 'timers → pending callbacks → idle/prepare → poll → check (setImmediate) → close callbacks. Microtasks (Promise jobs, nextTick) drain between each phase.'),
        card('Why does process.nextTick fire before Promise microtasks?', 'nextTick queue is drained before the Promise microtask queue in each turn — it has higher priority and can starve I/O if overused recursively.'),
      ],
      'Modules & Package Management': [
        card('What is the "exports" field in package.json used for?', 'It defines public entry points and condition-based resolution (require vs import vs browser), replacing "main" and enabling subpath exports.'),
        card('Why is package-lock.json important for reproducible builds?', 'It pins the exact resolved version and integrity hash of every dependency, ensuring the same tree installs in CI and production.'),
      ],
      'File System & Streams': [
        card('When should you use a stream instead of readFile?', 'For large files where loading the entire content into memory would cause spikes — streams process chunks incrementally with bounded memory.'),
        card('What does stream.pipeline() do that manual pipe() does not?', 'pipeline() automatically forwards errors between stages and calls destroy() on all streams on failure — preventing the resource leaks that manual piping causes on error.'),
      ],
      'Process & Environment': [
        card('Why should config be validated at startup?', 'Failing fast on missing/malformed env vars prevents partially-initialised services from running in a broken state that only surfaces under specific traffic.'),
        card('What does process.exitCode do vs process.exit()?', 'Setting process.exitCode lets the process finish its event loop before exiting with that code; process.exit() terminates immediately, skipping cleanup handlers.'),
      ],
      'Error Handling Patterns': [
        card('What is the operational vs programmer error distinction in Node?', 'Operational errors (network timeout, ENOENT) are expected and should be handled gracefully; programmer errors (TypeError, RangeError) indicate bugs and should crash the process.'),
        card('Why wrap async route handlers in a try/catch or async wrapper?', 'Unhandled rejection in an async Express handler bypasses the centralized error middleware unless the error is explicitly forwarded via next(err).'),
      ],
      'Worker Threads': [
        card('How do worker threads share data without copying?', 'SharedArrayBuffer with Atomics for concurrent low-level access, or transferable objects (ArrayBuffer) which are moved rather than copied.'),
        card('What is a common mistake with worker thread error handling?', "Not listening for the 'error' event on the worker — unhandled worker errors are emitted as events, not thrown in the parent thread."),
      ],
      'Testing Node Services': [
        card('Why hit a real database in integration tests instead of mocking?', 'Mocks diverge from real driver behaviour over time; integration tests catch schema changes, query planner issues, and constraint violations that mocks miss.'),
        card('What is supertest used for in Express testing?', 'It wraps an Express app and allows HTTP-level assertions without binding to a real port — testing routes, status codes, and response bodies in-process.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // Express.js — additional top-level flashcards
  express.flashcards.push(
    card('What does helmet() do for an Express app?', 'It sets ~15 security-related HTTP response headers (CSP, HSTS, X-Frame-Options, etc.) with safe defaults to harden against common browser attacks.'),
    card('How does morgan differ from pino/winston for logging?', 'Morgan is request-focused HTTP middleware; pino/winston are general-purpose structured loggers. Use morgan for access logs and pino for application logs.'),
    card('Why is rate-limiting middleware essential before auth routes?', 'Without it, login and token endpoints are exposed to unlimited brute-force and credential-stuffing attacks.'),
    card('What is the async wrapper pattern for Express routes?', 'A higher-order function that wraps async handlers: `const wrap = fn => (req,res,next) => fn(req,res,next).catch(next)` — forwards all rejections to error middleware.'),
  );

  // Express.js — additional APIs
  express.apis.push(
    api('express.urlencoded', 'express.urlencoded({ extended: boolean })', 'Parses URL-encoded form bodies into req.body.', 'extended: true uses qs, false uses querystring', 'middleware', "app.use(express.urlencoded({ extended: false }));", 'Required for HTML form POST submissions.'),
    api('express.static', 'express.static(root, options?)', 'Serves static files from a directory.', 'root directory path and options', 'middleware', "app.use('/assets', express.static('public'));", 'Set maxAge for cache-control on production static assets.'),
    api('res.cookie', 'res.cookie(name, value, options?)', 'Sets a Set-Cookie response header.', 'name, value, and cookie options', 'response', "res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' });", 'Always set httpOnly and secure for auth cookies.'),
    api('res.redirect', 'res.redirect([status,] url)', 'Sends a redirect response.', 'optional status code (default 302) and URL', 'response', "res.redirect(301, '/new-path');", '301 is permanent (cached); 302 is temporary. Choose deliberately.'),
    api('req.params / req.query', 'req.params.id / req.query.page', 'Accesses route path parameters and query string values.', 'named param from route pattern or query key', 'string or undefined', "app.get('/users/:id', (req) => req.params.id);\n// GET /users?page=2 → req.query.page === '2'", 'All values are strings; parse/validate before use.'),
  );

  // Express sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== express.id) return;
    const specific = {
      'Middleware Architecture': [
        card('What is the four-argument signature for error-handling middleware?', '(err, req, res, next) — Express detects the arity and routes errors to this handler when next(err) is called anywhere upstream.'),
        card('Why must body-parser middleware come before route handlers?', 'Middleware executes in registration order; routes that read req.body will get undefined if the parser has not run yet.'),
      ],
      'Routing & Modular Routers': [
        card('What does express.Router() give you that app.use() alone does not?', 'A mini-application with its own middleware stack and route table that can be mounted at any prefix — enabling feature-based modularisation without path coupling.'),
        card('Why use router.param() for repeated param validation?', 'It runs once per request for a named param, centralising existence/type checks instead of duplicating them across every route that uses that param.'),
      ],
      'Validation & Sanitization': [
        card('What is the difference between validation and sanitization?', 'Validation checks if input meets constraints (type, range, format) and rejects invalid data; sanitization transforms input (trim, escape) to a safe form before use.'),
        card('Why should validation schemas be defined outside route handlers?', 'Colocating schema definitions with business logic couples transport concerns to domain logic — schemas should be reusable across routes and test suites.'),
      ],
      'Auth Middleware': [
        card('Where should auth middleware sit in the Express pipeline?', 'After body/cookie parsers but before any routes that require a user identity — typically mounted globally on an /api prefix or per-router.'),
        card('Why should auth middleware attach user to req rather than return directly?', 'Attaching to req.user allows downstream handlers and middleware to access identity without re-verifying the token on every use.'),
      ],
      'Error Handling': [
        card('What happens if error middleware calls next() without an error?', 'Express treats it as passing to the next non-error middleware — be explicit: either send a response or call next(err) to keep propagating.'),
        card('Why should production error responses omit stack traces?', 'Stack traces reveal file paths, dependency versions, and internal logic — useful for attackers building exploit payloads.'),
      ],
      'Security Hardening': [
        card('What does `app.set("trust proxy", 1)` do in a load-balanced deployment?', 'It trusts the X-Forwarded-For and X-Forwarded-Proto headers from one hop upstream, making req.ip and secure cookies work correctly behind a reverse proxy.'),
        card('What is CORS and why must it be explicitly configured?', 'Cross-Origin Resource Sharing lets browsers make cross-origin requests; without explicit allow-list, browsers block frontend JS calls to your API from different origins.'),
      ],
      'Observability & Logging': [
        card('What fields should every request log include?', 'Request ID, method, path, status, duration, user ID (if authed), and error type — sufficient to trace any request through distributed systems.'),
        card('Why use structured JSON logs over string logs in production?', 'JSON logs are machine-parseable by log aggregators (Datadog, Loki) enabling filtering, alerting, and dashboards without regex parsing.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // REST APIs — additional top-level flashcards
  rest.flashcards.push(
    card('What is the difference between safe and idempotent HTTP methods?', 'Safe methods (GET, HEAD, OPTIONS) have no side effects. Idempotent methods (GET, PUT, DELETE) produce the same result when called multiple times. POST is neither.'),
    card('What is content negotiation in REST?', 'Client sends Accept header with preferred media type; server responds with matching Content-Type or 406 Not Acceptable if it cannot satisfy the request.'),
    card('What does a 422 Unprocessable Entity status communicate vs 400?', '400 means the request is syntactically malformed; 422 means the syntax is valid but the semantic content fails validation (e.g., business rule violation).'),
    card('Why include a Location header in 201 Created responses?', 'It points the client directly to the newly created resource URI, eliminating a follow-up lookup request.'),
  );

  // REST APIs — additional APIs
  rest.apis.push(
    api('Content-Type / Accept', 'Content-Type: application/json / Accept: application/json', 'Content-Type describes the body format sent; Accept declares what the client can receive.', 'header values', 'media type negotiation', "res.set('Content-Type', 'application/json');\n// client: fetch(url, { headers: { Accept: 'application/json' } })", 'Mismatch returns 415 Unsupported Media Type or 406 Not Acceptable.'),
    api('Location header', 'Location: /v1/resources/{id}', 'Points to the newly created or redirected resource URI.', 'absolute or relative URL', 'header string', "res.set('Location', `/v1/orders/${order.id}`).status(201).json(order);", 'Required on 201 Created and 3xx redirect responses for discoverability.'),
    api('Retry-After header', 'Retry-After: <seconds> or <http-date>', 'Tells clients when they may retry after 429 or 503.', 'seconds integer or HTTP date', 'header string', "res.set('Retry-After', '30').status(429).json({ error: 'rate_limited' });", 'Without this, clients use exponential backoff guessing — often wrong.'),
    api('Link header (pagination)', 'Link: <url>; rel="next", <url>; rel="prev"', 'Communicates pagination cursors via standard header.', 'URL and relation type', 'header string', 'res.set("Link", `<${nextUrl}>; rel="next"`);', 'Preferred over body-embedded pagination in hypermedia APIs.'),
  );

  // REST sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== rest.id) return;
    const specific = {
      'Resource Modeling': [
        card('What is the difference between a resource and a collection endpoint?', '/orders is a collection (returns list, accepts POST); /orders/{id} is a resource (returns single item, accepts GET/PUT/PATCH/DELETE).'),
        card('When should you use a sub-resource vs a query parameter?', 'Sub-resource (/users/u1/orders) for ownership/containment relationships; query param (?userId=u1) for filtering across a flat collection.'),
      ],
      'Status Codes & Error Shapes': [
        card('What is the RFC 7807 Problem Details format?', 'A standard JSON error shape with `type`, `title`, `status`, `detail`, and optional `instance` — reduces bespoke error format proliferation.'),
        card('When should 409 Conflict be returned instead of 422?', '409 when the request conflicts with current resource state (duplicate, optimistic lock failure); 422 when the payload itself is semantically invalid.'),
      ],
      'Pagination & Filtering': [
        card('Why is keyset pagination more stable than offset on live data?', 'Offset skips N rows after sorting — inserts/deletes before that offset shift the window; keyset anchors to a stable cursor value immune to concurrent writes.'),
        card('What is the downside of cursor pagination?', 'You cannot jump to arbitrary pages — only forward/backward navigation is possible, which can frustrate admin/reporting use cases.'),
      ],
      'Idempotency': [
        card('How do idempotency keys work for POST requests?', 'Client generates a unique key per logical operation, sends it as a header; server stores the key+result and returns the stored result on duplicate requests rather than re-executing.'),
        card('Why is DELETE usually idempotent but not always safe?', 'Deleting a non-existent resource returns 404 not 204 — technically correct but callers should treat repeated 404 as idempotent success in retry logic.'),
      ],
      'Versioning Strategies': [
        card('What are the three main REST versioning strategies?', 'URI path (/v1/), Accept header (application/vnd.api+json;version=1), and custom header (API-Version: 1). URI versioning is most cache-friendly and explicit.'),
        card('What is a non-breaking API change?', 'Adding new optional fields, new endpoints, or new enum values are typically non-breaking; removing/renaming fields or changing types always require a version bump.'),
      ],
      'Caching & Conditional Requests': [
        card('What is the difference between Cache-Control: private and public?', 'public allows CDN/shared cache storage; private restricts to the end-user browser cache — use private for authenticated user-specific responses.'),
        card('How does If-None-Match work with ETags?', 'Client sends the ETag it received as If-None-Match; server returns 304 Not Modified if the resource has not changed, saving payload transfer.'),
      ],
      'Rate Limiting': [
        card('What is the token bucket algorithm?', 'Each client has a bucket that refills at a fixed rate; each request consumes a token. Allows burst up to bucket capacity while enforcing average rate.'),
        card('Why rate-limit per user rather than per IP in authenticated APIs?', 'Shared IPs (NAT, corporate proxies) would throttle multiple legitimate users; per-user limiting accurately tracks individual consumption.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // WebSockets — additional top-level flashcards
  ws.flashcards.push(
    card('What is the HTTP Upgrade handshake in WebSocket?', 'Client sends HTTP/1.1 request with `Upgrade: websocket` and `Sec-WebSocket-Key`; server responds 101 Switching Protocols and the connection becomes full-duplex TCP.'),
    card('Why does WS framing mask client-to-server messages?', 'RFC 6455 requires masking to prevent cache poisoning via intermediaries that might misinterpret WS frames as HTTP — servers must unmask; masking is not encryption.'),
    card('What is the fan-out amplification problem?', 'A single message to N connected clients requires N socket.send() calls; on large deployments this blocks the event loop — offload to worker threads or a pub/sub broker.'),
    card('When is Socket.IO preferable over raw ws?', 'When you need automatic reconnection, room/namespace abstractions, binary message framing, and fallback transports (long-polling) out of the box.'),
  );

  // WebSockets — additional APIs
  ws.apis.push(
    api('EventSource (SSE)', 'new EventSource(url)', 'Browser API for one-way server-to-client event streams over HTTP.', 'URL of SSE endpoint', 'EventSource instance', "const es = new EventSource('/events');\nes.onmessage = (e) => console.log(e.data);", 'Simpler than WS for push-only notifications; auto-reconnects by default.'),
    api('Socket.IO emit/on', 'io.emit(event, data) / socket.on(event, fn)', 'Higher-level event-based messaging over WebSocket with rooms.', 'event name and data payload', 'void / callback', "io.to('room1').emit('update', payload);\nsocket.on('join', (room) => socket.join(room));", 'Socket.IO protocol is not raw WS — plain WS clients cannot connect.'),
    api('ws client (browser)', 'new WebSocket(url, protocols?)', 'Browser-native WebSocket client constructor.', 'URL and optional subprotocols', 'WebSocket instance', "const ws = new WebSocket('wss://api.example.com/ws');\nws.onmessage = (e) => handle(JSON.parse(e.data));", 'Always use wss:// (TLS) in production.'),
  );

  // WebSocket sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== ws.id) return;
    const specific = {
      'Connection Lifecycle': [
        card('What are the four WebSocket readyState values?', 'CONNECTING (0), OPEN (1), CLOSING (2), CLOSED (3) — always check OPEN before calling send() to avoid errors.'),
        card('Why should the server send a close frame before terminating?', 'A clean close frame (code 1000) allows the client to distinguish intentional shutdown from network failure and implement appropriate reconnection logic.'),
      ],
      'Pub/Sub Fan-out': [
        card('Why use Redis pub/sub for WebSocket fan-out across multiple servers?', 'Each server only knows about its own connected clients; Redis acts as the broker so a message published on server A reaches clients connected to server B.'),
        card('What is the difference between broadcasting to all clients vs a room?', 'Broadcasting to all (wss.clients) is O(n) across every connection; rooms limit fan-out to relevant subscribers, reducing both CPU and bandwidth.'),
      ],
      'Presence & Heartbeats': [
        card('What is the recommended heartbeat interval for WebSockets?', '30 seconds is a common default — short enough to detect dead connections before load balancer idle timeouts (typically 60s), long enough not to waste bandwidth.'),
        card('How do you implement presence using WebSocket events?', 'On connect, add user to a presence set and broadcast join; on close/error, remove and broadcast leave — use a separate store (Redis) for multi-server presence.'),
      ],
      'Message Protocol Design': [
        card('Why include a `version` field in message envelopes?', 'It allows servers and clients to handle multiple protocol generations simultaneously during rolling deploys without breaking existing connections.'),
        card('What is the advantage of binary framing (MessagePack) over JSON?', 'Smaller payload for numeric/binary data, faster serialisation — important for high-frequency tick data or media streaming over WebSockets.'),
      ],
      'Auth & Re-auth': [
        card('Why is cookie-based auth preferred over token-in-URL for WS?', 'Tokens in URLs appear in logs and browser history; cookies are sent automatically on the upgrade request and can use httpOnly/secure flags.'),
        card('How do you handle token expiry on a long-lived WebSocket connection?', 'Send an application-level re-auth message with a fresh token before access token expires; server verifies and updates the session without dropping the connection.'),
      ],
      'Backpressure & Flow Control': [
        card('What does socket.bufferedAmount indicate?', 'The number of bytes queued for sending but not yet transmitted — if this grows, the client is consuming slower than the server is producing; pause sending until it drains.'),
        card('How do you implement server-side backpressure with the ws library?', "Check socket.readyState === OPEN and monitor bufferedAmount; pause upstream data source (pause() on a stream or stop polling) when the buffer exceeds a threshold."),
      ],
      'Horizontal Scaling': [
        card('What is sticky sessions and why might you need it for WebSockets?', 'Sticky sessions route a client to the same server instance; needed when in-memory session state is not externalised — avoids mid-conversation server hops.'),
        card('What replaces sticky sessions in a stateless WS architecture?', 'Externalise all session state to Redis and use pub/sub for fan-out — any server can handle any client connection without affinity.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // ─── Backend Engineering (top-level + 12 sub-topics) ───────────────────────

  const beSkill = mk('Backend Engineering', 'backend', null, {
    definition:
      'Server-side engineering — designing services that expose APIs, manage state in databases, handle authentication, scale under load, and recover from failure. Senior backend work is mostly about failure modes, observability, and trade-offs between consistency, availability, and latency.',
    codeExample: `// Layered backend service shape
//
// HTTP/WS Entry  →  Middleware  →  Controllers
//                                       ↓
//                                  Services (business logic)
//                                       ↓
//                                  Repositories / DB
//                                       ↓
//                                  Caches, Queues, External APIs

import express from 'express';
import { authMiddleware } from './middleware/auth';
import { userRouter } from './routes/users';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/users', userRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ code: err.code, message: err.message, traceId: req.id });
});

app.listen(3000);`,
    whenUsed:
      'Stock Trading Platform (Node + Express APIs, MongoDB + MySQL, WebSocket real-time, Keycloak 2FA). Maak and Packarma mobile backends. Documentation Platform collaborative editing.',
    gotchas: `Treating distributed systems like single-node systems — every network call can fail, timeout, or duplicate.
Storing JWT in localStorage instead of httpOnly cookie when XSS risk is real.
No idempotency keys on payment/mutation APIs → retries cause double charges.
Skipping connection pooling → DB connection exhaustion under load.
Logging without correlation IDs → can't trace a request across services.`,
    flashcards: [
      card('What is backend development at senior level?', 'Server-side engineering — APIs, business logic, persistence, authentication, scaling, failure recovery. Senior work emphasizes failure modes, observability, capacity planning, and trade-offs (consistency vs availability vs latency).'),
      card('What is client-server architecture?', 'Client (browser, mobile, another service) sends requests over a network — usually HTTP. Server processes, queries storage, returns response. Decouples presentation from data and business logic.'),
      card('Request lifecycle from URL to rendered page?', 'DNS lookup → TCP connect → TLS handshake → HTTP request → load balancer → reverse proxy → backend service → DB query → response back up the chain → browser renders.'),
      card('What separates senior backend from mid?', 'Designs for failure modes (timeouts, retries, idempotency), thinks in distributed trade-offs (CAP, eventual consistency), instruments observability, owns capacity and cost.'),
      card('Most important things to instrument in a new service?', 'Healthchecks (liveness + readiness), structured logs with correlation IDs, request latency histogram (p50/p95/p99), error rate, upstream/downstream call metrics, queue depth where applicable.'),
      card('What is an idempotent operation?', "Same request produces the same result no matter how many times it runs. PUT, DELETE are idempotent by spec. POST usually isn't — make it idempotent via idempotency keys for payments and other critical mutations."),
      card('Why is "exactly once" delivery a hard problem?', "Network partitions and crashes make it impossible to guarantee a message was both delivered and acknowledged exactly once. Practical approach: at-least-once delivery + idempotent handlers = exactly-once effect."),
      card('Stateless vs stateful services — pick which?', 'Stateless scales horizontally trivially (any instance handles any request). Stateful needs sticky sessions or external state store. Default to stateless; push state to DB, cache, or queue.'),
    ],
    apis: [],
    refs: [
      ref('Node.js docs', 'https://nodejs.org/en/docs'),
      ref('Designing Data-Intensive Applications', 'https://dataintensive.net/'),
      ref('High Scalability — real-world case studies', 'http://highscalability.com/'),
      ref('System Design Primer', 'https://github.com/donnemartin/system-design-primer'),
      ref('Microservices.io — pattern reference', 'https://microservices.io/patterns/index.html'),
    ],
    relatedProjectIds: ['p-stock', 'p-docs', 'p-maak', 'p-packarma'],
  });
  skills.push(beSkill);

  // 1. HTTP & API Design
  const subHttp = mk('HTTP & API Design', 'backend', beSkill.id, {
    definition:
      "HTTP is the application-layer protocol defining request methods, status codes, and headers for client-server communication. REST maps these primitives to resource-oriented APIs with consistent URI design and verb semantics. GraphQL (single endpoint, client-chosen fields) and gRPC (binary protocol, streaming) are alternatives that trade REST's simplicity for flexibility or performance.",
    codeExample: `import express from 'express';
const app = express();
app.use(express.json());

// POST → 201 + Location on creation
app.post('/v1/orders', async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    if (!productId || qty == null)
      return res.status(400).json({ code: 'missing_fields' });
    const order = await orderService.create({ productId, qty });
    res.status(201).set('Location', \`/v1/orders/\${order.id}\`).json(order);
  } catch (err) { next(err); }
});

// GET → 200 or 404
app.get('/v1/orders/:id', async (req, res, next) => {
  try {
    const order = await orderService.findById(req.params.id);
    if (!order) return res.status(404).json({ code: 'not_found' });
    res.json(order);
  } catch (err) { next(err); }
});

// DELETE → 204 No Content
app.delete('/v1/orders/:id', async (req, res, next) => {
  try {
    await orderService.remove(req.params.id);
    res.sendStatus(204);
  } catch (err) { next(err); }
});`,
    gotchas: `Using 200 for every response including errors — hides failures from monitoring and clients.
Ignoring idempotency on POST — retries from clients or proxies create duplicate resources.
URI path versioning (/v1/) forgotten until a breaking change is needed — add it from day one.
Mixing RPC-style verbs in URIs (/getUser, /deleteOrder) instead of resource + method semantics.
Returning 400 for semantic validation failures instead of 422 — they mean different things to clients.`,
    flashcards: [
      card('What is an API?', 'Application Programming Interface — a contract for how one program talks to another. In backend context, usually HTTP endpoints (REST/GraphQL) or RPC interfaces (gRPC).'),
      card('REST vs GraphQL — when each?', 'Use REST for simple resource CRUD and HTTP caching. Use GraphQL when clients need flexible field selection across related data.'),
      card('HTTP methods → which are idempotent?', "GET, PUT, DELETE, HEAD, OPTIONS are idempotent. POST and PATCH typically are not. Idempotency matters for retries — POSTing twice creates two resources unless you add an idempotency key."),
      card('HTTP vs HTTPS — what changes on the wire?', 'HTTPS wraps HTTP in TLS — encryption, integrity, and server authentication via certificates. Port 443 vs 80. Modern web is HTTPS-everywhere; HTTP only for internal trusted networks.'),
      card('When should you use 201 vs 200 vs 204?', '201 Created — POST creating a resource (return Location header). 200 OK — success with body. 204 No Content — success with no body (typical for DELETE).'),
      card("422 vs 400 — what's the difference?", '400 Bad Request — malformed syntax (invalid JSON, missing required field at parse level). 422 Unprocessable Entity — well-formed but semantically invalid (e.g., email format wrong, business rule violated).'),
      card('API versioning strategies?', 'URL path (`/v1/users`) — most visible, easy. Accept header (`Accept: application/vnd.app.v2+json`) — clean URLs but harder to debug. Query param (`?version=2`) — rare, discouraged. Pick URL path for public APIs.'),
      card('gRPC vs REST — when does gRPC win?', 'Service-to-service, high throughput, polyglot stacks. Binary protobuf is smaller and faster than JSON. Streaming built-in. Loses: browser support without gRPC-Web shim, debuggability.'),
      card('What are webhooks and what are the gotchas?', 'Server-to-server callbacks on events. Gotchas: must be idempotent (provider retries), require signature verification (HMAC), need replay protection, and the receiver must be reachable + fast.'),
      card('HATEOAS — relevant in practice?', 'Concept where API responses include links to next actions. Rare in practice — clients usually hardcode routes. Most "REST" APIs are actually Level 2 Richardson maturity (resources + verbs), not Level 3 (hypermedia).'),
    ],
    apis: [
      api('HTTP GET', 'GET /v1/:resource/:id', 'Fetches a resource without side effects. Safe and idempotent.', 'path params, optional query filters', '200 + body or 404', "app.get('/v1/users/:id', handler);", 'Set Cache-Control for public resources to enable CDN caching.'),
      api('HTTP POST', 'POST /v1/:resource', 'Creates a resource or submits a command. Not idempotent by default.', 'request body', '201 + Location header', "app.post('/v1/orders', handler);", 'Add idempotency key support for critical mutations.'),
      api('HTTP PUT', 'PUT /v1/:resource/:id', 'Replaces the full resource representation. Idempotent.', 'resource id + full body', '200 + updated resource', "app.put('/v1/users/:id', handler);", 'Partial PUT can accidentally null out omitted fields — prefer PATCH for partial updates.'),
      api('HTTP PATCH', 'PATCH /v1/:resource/:id', 'Applies a partial update to a resource.', 'resource id + partial body', '200 + updated resource', "app.patch('/v1/users/:id', handler);", 'Define patch semantics explicitly (JSON Merge Patch RFC 7396 or JSON Patch RFC 6902).'),
      api('HTTP DELETE', 'DELETE /v1/:resource/:id', 'Removes a resource. Idempotent.', 'resource id', '204 No Content', "app.delete('/v1/users/:id', handler);", 'Distinguish hard delete from soft delete — they behave differently on repeat calls.'),
    ],
    refs: [
      ref('MDN HTTP Overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview'),
      ref('RESTful API Design', 'https://restfulapi.net/'),
      ref('GraphQL Official Docs', 'https://graphql.org/learn/'),
      ref('gRPC Documentation', 'https://grpc.io/docs/'),
      ref('RFC 9110 HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110'),
    ],
  });
  skills.push(subHttp);

  // 2. Middleware & Request Pipeline
  const subMiddleware = mk('Middleware & Request Pipeline', 'backend', beSkill.id, {
    definition:
      "Middleware are functions in the request-response pipeline, each performing a focused cross-cutting concern — logging, auth, validation, rate limiting — before passing control via `next()`. They compose in registration order: each can read/modify `req`/`res` or short-circuit by sending a response. Error-handling middleware (4-arg signature) catches forwarded errors and centralizes response shaping.",
    codeExample: `import express from 'express';
import { v4 as uuid } from 'uuid';
const app = express();

// 1. Assign correlation ID to every request
app.use((req, _res, next) => { req.id = uuid(); next(); });

// 2. Structured request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () =>
    console.log(JSON.stringify({ reqId: req.id, method: req.method,
      path: req.path, status: res.statusCode, ms: Date.now() - start }))
  );
  next();
});

app.use(express.json());

// 3. Auth — short-circuits with 401 on missing token
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ code: 'unauthenticated' });
  req.user = verifyToken(token);
  next();
});

app.get('/v1/me', (req, res) => res.json(req.user));

// 4. Centralized error handler — must be last, 4-arg signature
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({ code: err.code || 'internal_error', traceId: req.id });
});`,
    gotchas: `Registering the error handler before routes — it won't catch errors from routes registered after it.
Not calling next(err) in async handlers — the error silently swallows and the request hangs.
Placing body-parser after route handlers — req.body is undefined in those routes.
Mutating req/res in middleware without documenting it — creates invisible coupling between layers.
Leaking stack traces in error responses — reveals internals to clients in production.`,
    flashcards: [
      card('What is middleware in a backend framework?', "A function that sits in the request-response pipeline, can read/modify request and response, then either call `next()` to continue the chain or short-circuit (e.g., send 401)."),
      card('Common middleware concerns?', 'Logging, request ID assignment, authentication, authorization, input validation, rate limiting, body parsing, CORS, compression, error handling.'),
      card('Why does middleware order matter?', "It's a chain — early middleware runs first. Body parser must run before handlers that read `req.body`. Auth must run before authorization. Error handler is registered last but catches errors from all earlier middleware."),
      card('How does Express identify error-handling middleware?', 'Function signature with 4 args: `(err, req, res, next)`. Express routes thrown errors / `next(err)` calls to these. Must be registered after regular routes.'),
      card('How to centralize error responses?', 'Throw typed errors (e.g., `ValidationError`, `NotFoundError`) in handlers. Single error-handling middleware maps them to status codes and a consistent envelope `{ code, message, traceId }`. Never leak stack traces to clients.'),
    ],
    apis: [
      api('app.use()', 'app.use([path], fn)', 'Registers middleware globally or scoped to a path prefix.', 'optional path + middleware fn', 'void', "app.use('/api', authMiddleware);", 'Without a path, applies to every request regardless of method or route.'),
      api('next()', 'next(err?)', 'Passes control to next middleware. Pass an error to skip to error handler.', 'optional error object', 'void', "if (!user) return next(Object.assign(new Error('unauth'), { status: 401 }));", 'Calling next() after res.send() causes double-response errors.'),
      api('Error middleware', '(err, req, res, next) => void', '4-arg signature that Express routes errors to.', 'error, req, res, next', 'void', "app.use((err, req, res, _next) => res.status(err.status || 500).json({ code: err.code }));", 'Must be registered after all routes and regular middleware.'),
    ],
    refs: [
      ref('Express Middleware Guide', 'https://expressjs.com/en/guide/using-middleware.html'),
      ref('Express Error Handling', 'https://expressjs.com/en/guide/error-handling.html'),
      ref('express-async-errors', 'https://github.com/davidbanham/express-async-errors'),
    ],
  });
  skills.push(subMiddleware);

  // 3. Auth & Authorization
  const subAuth = mk('Auth & Authorization', 'backend', beSkill.id, {
    definition:
      "Authentication (authn) verifies identity — who are you; authorization (authz) enforces permissions — what you can do. JWTs provide stateless authn via signed tokens; sessions provide easy revocation at the cost of shared server state. OAuth 2.0 handles delegated user-granted access. RBAC (role-based) and ABAC (attribute-based) are the two dominant authz models.",
    codeExample: `import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET;

// Sign a short-lived access token
export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: '15m', algorithm: 'HS256' });
}

// Middleware: verify JWT on every protected route
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ code: 'missing_token' });
  try {
    const payload = jwt.verify(header.slice(7), SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token';
    res.status(401).json({ code });
  }
}

// RBAC guard factory
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ code: 'forbidden' });
    next();
  };
}

// Usage: only admins can delete
app.delete('/v1/users/:id', authMiddleware, requireRole('admin'), handler);`,
    gotchas: `Storing JWT in localStorage — readable by any XSS payload; use httpOnly cookies.
Long-lived access tokens (hours/days) — breach window is huge; use 15-min tokens + refresh rotation.
Checking auth only at the route level, not per-resource — user A can read user B's record.
Symmetric JWT secret shared across all services — any service can forge tokens for any other.
Not verifying the algorithm in JWT header — algorithm confusion attacks can bypass signature checks.`,
    flashcards: [
      card('Authentication vs authorization?', 'Authentication = "who are you?" (login). Authorization = "what can you do?" (permission check). Authn happens first, then authz. Different layers, different failure modes.'),
      card('What is JWT?', "JSON Web Token — `header.payload.signature` base64url-encoded. Server signs, anyone can read, only server can verify. Stateless auth — server doesn't need to look up sessions."),
      card('Where to store JWT in browser?', 'Prefer httpOnly, Secure cookies plus SameSite/CSRF protection. Avoid localStorage for sensitive tokens because injected JS can read it.'),
      card('How to revoke a JWT before it expires?', "Pure JWT is stateless — you can't. Options: short access token TTL (15 min) + refresh token rotation, maintain a server-side blocklist of revoked jti claims, or fall back to session-based auth where revocation is trivial."),
      card('Session-based vs JWT — pick which?', 'Sessions centralize revocation but need shared storage. JWTs reduce server state but are harder to revoke. Pick by revocation and client needs.'),
      card('OAuth 2.0 authorization code flow steps?', 'Redirect to auth server, user consents, app receives a code, exchanges it for tokens, then calls APIs with the access token. Public clients use PKCE.'),
      card('Why use a refresh token?', 'Access tokens are short-lived (15 min) to limit blast radius if leaked. Refresh tokens are long-lived (days/weeks) and stored more securely. Exchanging refresh → new access lets users stay logged in without re-auth.'),
      card('RBAC vs ABAC?', 'RBAC (role-based): "admin can edit" — coarse, simple. ABAC (attribute-based): "user can edit if user.id === post.authorId AND post.status === draft" — fine-grained, expressive, complex. Start RBAC, escalate when role explosion happens.'),
      card('API keys vs OAuth — when each?', "API keys: server-to-server, simple, long-lived, hard to revoke per user. OAuth: user-delegated access, scoped permissions, revocable per consent. Don't use API keys for end-user authorization."),
      card('Where to enforce authorization?', "On every server endpoint, every time. Never trust the client. Frontend hides UI for UX. Backend enforces for security. Per-resource checks (does this user own this record?) live at the service or repository layer."),
    ],
    apis: [
      api('jwt.sign()', "jwt.sign(payload, secret, options)", 'Creates a signed JWT string.', 'payload object, secret, options (expiresIn, algorithm)', 'string token', "const token = jwt.sign({ sub: userId }, SECRET, { expiresIn: '15m' });", "Always set expiresIn. Default algorithm is HS256 — use RS256 for multi-service architectures."),
      api('jwt.verify()', 'jwt.verify(token, secret, options?)', 'Verifies signature and expiry; throws on failure.', 'token string, secret, optional options', 'decoded payload', 'const payload = jwt.verify(token, SECRET);', 'Handle TokenExpiredError and JsonWebTokenError separately for distinct error codes.'),
      api('bcrypt.hash()', 'bcrypt.hash(password, rounds)', 'Hashes a password with bcrypt. rounds = work factor (cost).', 'plaintext password, salt rounds (10–12)', 'Promise<string> hash', 'const hash = await bcrypt.hash(password, 12);', 'Increase rounds as hardware improves. Never use fewer than 10.'),
      api('bcrypt.compare()', 'bcrypt.compare(plain, hash)', 'Timing-safe comparison of plaintext against stored hash.', 'plaintext password and stored hash', 'Promise<boolean>', 'const ok = await bcrypt.compare(req.body.password, user.passwordHash);', 'Always use compare() — never compare hashes manually (timing attack risk).'),
    ],
    refs: [
      ref('JWT.io introduction', 'https://jwt.io/introduction'),
      ref('OAuth 2.0 RFC 6749', 'https://www.rfc-editor.org/rfc/rfc6749'),
      ref('OWASP Authentication Cheatsheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'),
      ref('OWASP Authorization Cheatsheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'),
      ref('Passport.js strategies', 'https://www.passportjs.org/concepts/authentication/'),
    ],
  });
  skills.push(subAuth);

  // 4. Backend Security
  const subSecurity = mk('Backend Security', 'backend', beSkill.id, {
    definition:
      'Backend security is defense-in-depth across the request lifecycle: validate all input at boundaries, parameterize queries to block injection, set security headers to constrain browsers, manage secrets outside of code, and encrypt data at rest and in transit. The OWASP Top 10 is the canonical checklist for web application threat classes.',
    codeExample: `import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';

const app = express();
const db = new Pool();

// Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());
app.use(express.json({ limit: '100kb' })); // prevent large payload attacks

// Tighter rate limit on login — brute-force protection
app.use('/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { code: 'too_many_attempts' },
}));

// Parameterized query — NEVER interpolate user input into SQL
app.get('/users', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email FROM users WHERE email = $1',
      [req.query.email]  // passed as parameter, not concatenated
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});`,
    gotchas: `Concatenating user input into SQL strings — classic injection; always use parameterized queries.
Hardcoding secrets in source code or committed .env files — use a secrets manager.
Trusting Content-Type header alone — also validate the parsed payload schema with Zod/Joi.
Missing NoSQL injection protection — MongoDB operators in user input can bypass auth queries.
Using SHA-256 for password hashing — too fast; use bcrypt or Argon2id with a proper work factor.`,
    flashcards: [
      card('What is CORS and where is it enforced?', 'Cross-Origin Resource Sharing — browser policy controlled by response headers (`Access-Control-Allow-Origin`, etc.). Enforced by the browser, not the server. Server-to-server calls ignore CORS.'),
      card('CSRF — what is it and how to prevent?', 'CSRF makes a browser send authenticated requests from another site. Prevent with SameSite cookies, CSRF tokens, or custom headers.'),
      card('SQL injection prevention?', "Always use parameterized queries / prepared statements. Never concatenate user input into SQL strings. ORMs do this by default but raw queries are the danger zone."),
      card('NoSQL injection — does it exist?', 'Yes. MongoDB takes operator objects — `{ username: req.body.username }` becomes `{ username: { $ne: null } }` if the client sends `{$ne:null}`. Validate types or use libraries that strip operators from user input.'),
      card('How to handle secrets in production?', 'Never in code or env files committed to git. Use a secrets manager (Vault, AWS Secrets Manager, Doppler, GCP Secret Manager). Inject at runtime. Rotate regularly. Audit access.'),
      card('Encryption at rest vs in transit?', 'In transit = TLS protects data on the network (HTTPS, encrypted DB connections). At rest = data encrypted on disk (database TDE, encrypted volumes, encrypted backups). Both required for sensitive data.'),
      card('Why hash passwords with bcrypt/Argon2 not SHA-256?', 'SHA-256 is fast — attackers can hash billions per second. bcrypt/Argon2 are slow by design (work factor) and include per-password salt. Use Argon2id for new systems; bcrypt is still acceptable.'),
      card('Input validation — where should it live?', 'At the API boundary, every endpoint, every request. Use schema validators (Zod, Joi, ajv). Never trust client input. Validation in business logic is too late — by then bad data has spread.'),
      card('Common security headers to set?', 'Strict-Transport-Security (HSTS), Content-Security-Policy, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy. Use `helmet` middleware in Express.'),
      card('Rate limiting as security — what attacks does it block?', 'Brute-force credential attacks, scraping, application-layer DDoS, abuse. Per-IP and per-user limits. For login endpoints, use stricter limits and consider CAPTCHA after N failures.'),
    ],
    apis: [
      api('helmet()', 'helmet(options?)', 'Sets ~15 security HTTP response headers with safe defaults.', 'optional per-header config object', 'Express middleware', 'app.use(helmet());', 'Configure contentSecurityPolicy carefully — an overly strict CSP breaks legitimate scripts and images.'),
      api('express-rate-limit', 'rateLimit({ windowMs, max, message })', 'Per-IP rate limiter. Use a Redis store for multi-instance deployments.', 'window duration, max requests, response on exceeded', 'Express middleware', "app.use('/auth', rateLimit({ windowMs: 15*60000, max: 10 }));", 'In-memory store resets on restart — use rate-limit-redis in production.'),
      api('Parameterized query (pg)', 'pool.query(sql, [params])', 'Sends SQL with placeholder slots and separately-bound values — prevents injection.', 'SQL string with $1 placeholders + values array', 'Promise<QueryResult>', "await db.query('SELECT * FROM users WHERE id = $1', [userId]);", 'Never use template literals or string concatenation for user-supplied values.'),
      api('Argon2id hash', 'argon2.hash(password, { type: argon2.argon2id })', 'Memory-hard password hashing using the Argon2id variant.', 'plaintext password + options', 'Promise<string> hash', "import argon2 from 'argon2';\nconst hash = await argon2.hash(password, { type: argon2.argon2id });", 'Tune memoryCost and timeCost so hashing takes ~100ms on your hardware.'),
    ],
    refs: [
      ref('OWASP Top 10', 'https://owasp.org/www-project-top-ten/'),
      ref('OWASP API Security Top 10', 'https://owasp.org/www-project-api-security/'),
      ref('Helmet.js', 'https://helmetjs.github.io/'),
      ref('OWASP SQL Injection Prevention', 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'),
      ref('OWASP Secrets Management', 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'),
    ],
  });
  skills.push(subSecurity);

  // 5. Databases — Fundamentals
  const subDbFund = mk('Databases — Fundamentals', 'backend', beSkill.id, {
    definition:
      'Relational databases (PostgreSQL, MySQL) organize data in normalized tables with enforced schema, joins, and ACID transactions — optimal for structured relational data. NoSQL document stores (MongoDB) offer flexible schema and horizontal scale for denormalized reads. Indexes, connection pooling, and careful ORM usage are the practical levers that determine query performance in production.',
    codeExample: `-- Schema with foreign key + composite index
CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL CHECK (status IN ('pending','paid','cancelled')),
  total_cents INT  NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index: queries filter user_id + status, sort by created_at
CREATE INDEX idx_orders_user_status_created
  ON orders (user_id, status, created_at DESC);

-- Covering index: answers query from index alone (no table heap access)
CREATE INDEX idx_orders_user_status_cover
  ON orders (user_id, status) INCLUDE (total_cents, created_at);

-- Parameterized query via Node pg pool
const { rows } = await db.query(
  \`SELECT id, status, total_cents, created_at
     FROM orders
    WHERE user_id = $1 AND status = $2
    ORDER BY created_at DESC
    LIMIT $3\`,
  [userId, 'paid', 20]
);`,
    gotchas: `Missing indexes on foreign keys — joins and WHERE lookups do full table scans silently until data grows.
N+1 queries via ORM lazy-loading — each row in a result triggers a separate SQL call in a loop.
No connection pool — each request opens a new TCP + auth handshake, exhausting DB connection limits.
Over-normalizing hot read paths — expensive multi-table joins on every request; denormalize where justified.
Running migrations inside app startup — causes deployment races; run migrations as a separate pre-deploy step.`,
    flashcards: [
      card('SQL vs NoSQL — pick which when?', 'Use SQL for relational data, joins, schemas, and transactions. Use NoSQL for document/key-value access patterns and flexible scaling.'),
      card('Primary key vs unique constraint?', 'Primary key — uniquely identifies each row, usually one per table, typically clustered (storage order). Unique constraint — any column(s) that must be unique; you can have multiple per table.'),
      card('What is a foreign key?', 'A column whose values must exist as primary keys in another table. Enforces referential integrity. DB rejects orphan rows unless you allow null or cascade.'),
      card('How does a B-tree index help?', 'Stores keys in sorted tree → O(log n) lookup vs O(n) full scan. Range queries (`WHERE created > X`) and ORDER BY use it. Cost: writes update the index (write amplification).'),
      card("Composite index — what's the leftmost prefix rule?", 'Index on `(a, b, c)` supports queries filtering `a`, or `a + b`, or `a + b + c`. Does NOT support queries filtering only `b` or only `c`. Column order matters — put highest-selectivity columns first.'),
      card("What's a covering index?", "Index that includes all columns the query needs, so the engine never touches the table — answers from index alone. Huge perf win for read-heavy queries. Trade-off: bigger index, slower writes."),
      card('When does a partial index make sense?', 'Index only rows matching a WHERE condition (e.g., `WHERE status = active`). Smaller index, faster maintenance, used when queries always filter on that condition.'),
      card('What is database normalization?', 'Organizing schema to eliminate redundancy and update anomalies. 1NF (atomic values), 2NF (depend on full PK), 3NF (no transitive deps). Denormalize for read perf when justified.'),
      card('When does an ORM hurt you?', 'N+1 queries (loop calling lazy relations), inability to express complex queries, hidden expensive operations (`.save()` triggering cascades), schema drift between code and DB. Use raw SQL for hot paths.'),
      card('Why is connection pooling required?', 'Each new DB connection is expensive (TCP + auth handshake). Pool reuses N pre-opened connections. Without it, high traffic exhausts DB connection limits and adds latency per request.'),
      card('How to size a DB connection pool?', 'Start with `pool_size = (cores * 2 + effective_spindle_count)` for the DB. Per-app instance, account for total instances. Too many = DB overload; too few = app waits for connections. Measure under load.'),
    ],
    apis: [
      api('CREATE INDEX', 'CREATE [UNIQUE] INDEX name ON table (col1, col2)', 'Adds a B-tree index. UNIQUE enforces uniqueness constraint.', 'table and ordered column list', 'DDL — no rows returned', 'CREATE INDEX idx_users_email ON users (email);', 'Index every foreign key; also index columns appearing together in WHERE + ORDER BY.'),
      api('EXPLAIN ANALYZE', 'EXPLAIN ANALYZE SELECT ...', 'Shows the query execution plan with actual row counts and timing.', 'any SELECT statement', 'plan text output', "EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 'u1';", "Run on a copy of production data — row estimates differ on small dev datasets."),
      api('pool.query() (pg)', 'pool.query(sql, values?)', 'Executes SQL via a pool-managed connection; releases connection automatically.', 'SQL string + optional params array', 'Promise<{ rows, rowCount }>', "const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [id]);", 'pool.connect() requires manual release — pool.query() handles it automatically.'),
      api('prisma.model.findMany', 'prisma.model.findMany({ where, select, orderBy, take })', 'Type-safe query builder that generates parameterized SQL.', 'query filter object', 'Promise<Model[]>', "const users = await prisma.user.findMany({ where: { active: true }, take: 20 });", 'Always use select to fetch only needed columns — avoids N+1 on eagerly-included relations.'),
    ],
    refs: [
      ref('PostgreSQL Documentation', 'https://www.postgresql.org/docs/current/'),
      ref('MongoDB Manual', 'https://www.mongodb.com/docs/manual/'),
      ref('Prisma ORM Docs', 'https://www.prisma.io/docs'),
      ref('Use the Index, Luke — SQL indexing guide', 'https://use-the-index-luke.com/'),
      ref('PostgreSQL EXPLAIN docs', 'https://www.postgresql.org/docs/current/using-explain.html'),
    ],
  });
  skills.push(subDbFund);

  // 6. Databases — Advanced
  const subDbAdv = mk('Databases — Advanced', 'backend', beSkill.id, {
    definition:
      'Transactions bundle multiple writes into atomic units with ACID guarantees; isolation levels control what concurrent transactions can observe, with higher levels trading anomaly protection for lower concurrency. Sharding distributes data horizontally for write scale; replication copies data for read scale and HA. CQRS separates read and write models when their shapes and scaling needs diverge sharply.',
    codeExample: `-- Pessimistic lock: reserve exactly one seat atomically
BEGIN;

SELECT id, seats_remaining
  FROM events
 WHERE id = $1
   FOR UPDATE;  -- row lock held until COMMIT

UPDATE events
   SET seats_remaining = seats_remaining - 1
 WHERE id = $1 AND seats_remaining > 0;

INSERT INTO bookings (event_id, user_id) VALUES ($1, $2);

COMMIT;

-- Optimistic lock: update only if version still matches
UPDATE products
   SET stock   = stock - $1,
       version = version + 1
 WHERE id = $2 AND version = $3;
-- rowCount === 0 means another transaction won → retry`,
    gotchas: `Using READ COMMITTED isolation for inventory or balance updates — two transactions can both read the same value and both decrement, causing oversell.
Long-running transactions holding row locks — blocks all writers on that row; keep transactions as short as possible.
Ignoring replication lag in read-after-write flows — user writes to master, reads from replica, doesn't see their own write.
Running schema migrations inside a transaction on large tables — ALTER TABLE holds ACCESS EXCLUSIVE lock for minutes.
CQRS without ordering guarantees on the event bus — the read model processes events out of order and shows stale state.`,
    flashcards: [
      card('What is a database transaction?', 'A sequence of operations executed as a single unit — either all commit or all roll back. Provides ACID guarantees. Use for any multi-step write that must be atomic (bank transfer, order + line items).'),
      card('Explain ACID.', "Atomicity (all or nothing), Consistency (constraints hold before and after), Isolation (concurrent txns don't see each other's incomplete state), Durability (committed data survives crashes)."),
      card('SQL isolation levels and their anomalies?', 'Read Uncommitted allows dirty reads. Read Committed allows non-repeatable reads. Repeatable Read limits them. Serializable is strongest but reduces concurrency.'),
      card('What is a race condition in DB?', 'Two transactions read same value, both decide to modify based on it, both write — one update is lost or invariant violated. Classic example: two users buying the last item in stock.'),
      card('Optimistic vs pessimistic locking?', 'Pessimistic: lock the row (`SELECT FOR UPDATE`) until txn commits — blocks others. Optimistic: read with version, write with `WHERE version = X` — retry on conflict. Optimistic wins under low contention; pessimistic under high contention.'),
      card('What is database sharding?', 'Horizontal partitioning — split data across multiple DBs by a shard key (user_id, geo, hash). Each shard holds a subset. Scales writes beyond a single machine. Cost: cross-shard queries are expensive or impossible.'),
      card("Master-slave replication — what breaks?", "Writes go to master, reads to slaves. Slaves lag → read-after-write inconsistency (user posts, refreshes, doesn't see post). Solutions: read from master for write+immediate-read flows, or causal-read tokens."),
      card('What is CQRS?', 'Command Query Responsibility Segregation — separate write model (commands) from read model (queries). Each optimized independently. Often paired with event sourcing. Adds complexity; use when read and write needs diverge sharply.'),
      card('Safe database migration patterns?', "Backwards-compatible deploys: add column nullable → backfill → make NOT NULL → remove old code path. Never deploy code that requires schema not yet applied. Use migration tools (Flyway, Liquibase, Prisma Migrate)."),
      card('How to handle a slow query in production?', '1. EXPLAIN ANALYZE to see plan. 2. Check missing/wrong indexes. 3. Check stats freshness (ANALYZE table). 4. Look for N+1, large IN lists. 5. Last resort: query rewrite or denormalize.'),
    ],
    apis: [
      api('SELECT FOR UPDATE', 'SELECT ... FOR UPDATE [SKIP LOCKED]', 'Locks selected rows until current transaction commits. SKIP LOCKED skips already-locked rows.', 'SQL SELECT statement', 'locked result rows', "SELECT id FROM jobs WHERE status='pending' LIMIT 1 FOR UPDATE SKIP LOCKED;", 'Keep transactions short to minimize lock contention window.'),
      api('BEGIN / COMMIT / ROLLBACK', 'BEGIN; ...; COMMIT; | ROLLBACK;', 'Explicit transaction control — use in application code for multi-step writes.', 'SQL statements between BEGIN and end', 'void', "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = $1;\nUPDATE accounts SET balance = balance + 100 WHERE id = $2;\nCOMMIT;", 'Wrap in try/catch — ROLLBACK on error.'),
      api('SET TRANSACTION ISOLATION LEVEL', 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ | SERIALIZABLE', 'Overrides default isolation level for the current transaction.', 'isolation level name', 'void', "BEGIN;\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;", 'Higher isolation = fewer anomalies + lower concurrency. Benchmark before using Serializable in production.'),
    ],
    refs: [
      ref('PostgreSQL Transaction Isolation', 'https://www.postgresql.org/docs/current/transaction-iso.html'),
      ref('Martin Fowler — CQRS', 'https://martinfowler.com/bliki/CQRS.html'),
      ref('Designing Data-Intensive Applications', 'https://dataintensive.net/'),
      ref('PostgreSQL Explicit Locking', 'https://www.postgresql.org/docs/current/explicit-locking.html'),
      ref('MongoDB Transactions', 'https://www.mongodb.com/docs/manual/core/transactions/'),
    ],
  });
  skills.push(subDbAdv);

  // 7. Caching & Rate Limiting
  const subCache = mk('Caching & Rate Limiting', 'backend', beSkill.id, {
    definition:
      'Caching stores expensive computation or fetch results close to the consumer to reduce latency and backend load. Redis is the dominant store for both caching and rate limit counters, offering atomic operations and TTL-based expiry. Rate limiting protects services from abuse using algorithms like token bucket or sliding window, with shared distributed counters so limits hold across all app instances.',
    codeExample: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache-aside pattern
async function getUser(userId) {
  const key = \`user:\${userId}\`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const user = await db.findUser(userId);
  if (user) await redis.setex(key, 300, JSON.stringify(user)); // TTL 5 min
  return user;
}

// Invalidate on write
async function updateUser(userId, data) {
  await db.updateUser(userId, data);
  await redis.del(\`user:\${userId}\`);
}

// Sliding-window rate limit via Redis INCR
async function checkRateLimit(userId, limit = 60, windowSec = 60) {
  const windowId = Math.floor(Date.now() / (windowSec * 1000));
  const key = \`rl:\${userId}:\${windowId}\`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSec);
  return count <= limit;
}`,
    gotchas: `Cache stampede — key expires, N requests all miss and hit DB simultaneously; use probabilistic early expiration or a mutex.
Stale cache after write — not invalidating or TTL too long; users see outdated data.
Caching per-user data at a shared key — leaks user A's data to user B; always include userId in the key.
In-memory rate limit store in a multi-instance deployment — each instance tracks independently, effective limit is limit × instances.
Not handling Redis connection failure gracefully — if cache is unavailable, fall through to DB rather than returning 500.`,
    flashcards: [
      card('What is the cache-aside pattern?', "App checks cache first → if miss, reads from DB → writes result back to cache. Cache and DB are independent. Most common pattern. Risks: stale cache, thundering herd on miss."),
      card('Write-through vs write-behind cache?', 'Write-through: write to cache and DB synchronously — consistent, slower writes. Write-behind: write to cache first, async to DB — fast writes, risk of data loss on crash.'),
      card('Cache invalidation strategies?', 'TTL (simple, eventually stale), explicit invalidation on write (consistent, easy to miss spots), versioned keys (`user:42:v3`), tag-based bulk invalidation. Hardest problem in computer science for a reason.'),
      card('Redis use cases beyond caching?', 'Session store, rate limiting (atomic INCR + TTL), pub/sub, distributed locks (with caveats), sorted sets for leaderboards, streams for queues, geo indexes.'),
      card('Rate limiting algorithms — pick one?', 'Token bucket: smooth, allows bursts up to bucket size — best general-purpose. Fixed window: simple, edge effects at boundaries. Sliding window: precise but pricier in memory. Leaky bucket: hard rate cap.'),
      card('Where should rate limits live?', 'API gateway / edge for coarse global limits. Application-level for per-user, per-endpoint limits. Distributed counter (Redis) so all app instances see the same counts.'),
      card('What is a "thundering herd" and how to mitigate?', "Cache key expires, hundreds of requests hit the DB simultaneously to refill it. Mitigate with: locked cache refresh (one request rebuilds, others wait), staggered TTLs, probabilistic early expiration."),
      card('Hot vs cold data tiering?', 'Hot data (recent, frequently accessed) lives in fast tier (memory, SSD). Cold data (old, rare) in cheap tier (S3 Glacier, archived tables). Saves cost; queries on cold data are slower.'),
    ],
    apis: [
      api('redis.get / redis.setex', 'redis.get(key) / redis.setex(key, ttlSec, value)', 'Get and set a cache entry with TTL expiry.', 'key string / key + seconds + value', 'Promise<string|null> / Promise<"OK">', "const v = await redis.get('user:1');\nawait redis.setex('user:1', 300, JSON.stringify(user));", 'setex is atomic — avoids a separate SET + EXPIRE race condition.'),
      api('redis.incr / redis.expire', 'redis.incr(key) / redis.expire(key, ttlSec)', 'Atomic increment for rate counters + TTL to bound the window.', 'key string / key + seconds', 'Promise<number>', "const n = await redis.incr(rateKey);\nif (n === 1) await redis.expire(rateKey, 60);", 'incr + expire are two commands — use SET NX EX or Lua script for true atomicity.'),
      api('redis.del', 'redis.del(...keys)', 'Deletes one or more cache keys for explicit invalidation on write.', 'one or more key strings', 'Promise<number> deleted count', "await redis.del(`user:${userId}`, `user:${userId}:profile`);", 'Use key namespacing (prefix:id) to support pattern-based bulk deletes with SCAN.'),
      api('redis pub/sub', 'pub.publish(channel, msg) / sub.subscribe(channel)', 'Redis pub/sub for fan-out messaging across server instances.', 'channel name + message string', 'void / message event', "pub.publish('orders', JSON.stringify(event));\nsub.on('message', (ch, msg) => handle(msg));", 'Fire-and-forget — messages are lost if no subscriber is connected at publish time.'),
    ],
    refs: [
      ref('Redis Documentation', 'https://redis.io/docs/latest/'),
      ref('Redis Rate Limiting patterns', 'https://redis.io/glossary/rate-limiting/'),
      ref('ioredis GitHub', 'https://github.com/redis/ioredis'),
      ref('AWS Caching Best Practices', 'https://aws.amazon.com/caching/best-practices/'),
    ],
  });
  skills.push(subCache);

  // 8. Node.js Internals
  const subNode = mk('Node.js Internals', 'backend', beSkill.id, {
    definition:
      "Node.js runs JavaScript single-threaded on an event loop backed by libuv, which offloads I/O to the OS and a thread pool — enabling high concurrency without per-request threads. Understanding event loop phases (timers → poll → check), microtask/macrotask ordering, and backpressure prevents latency spikes and memory leaks. CPU-bound work requires worker_threads or child processes to avoid blocking the loop.",
    codeExample: `// Event loop phase ordering
console.log('1. sync');

process.nextTick(() => console.log('2. nextTick (before I/O, before Promises)'));
Promise.resolve().then(() => console.log('3. Promise microtask'));

setTimeout(() => console.log('4. setTimeout (timers phase)'), 0);
setImmediate(() => console.log('5. setImmediate (check phase)'));

// Output: 1 → 2 → 3 → 4 → 5
// nextTick drains before Promise microtasks each turn
// setTimeout vs setImmediate order is non-deterministic outside an I/O callback

// Worker thread for CPU-bound work (doesn't block the event loop)
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url));
  worker.on('message', (result) => console.log('result:', result));
  worker.on('error', (err) => console.error(err));
} else {
  const result = computeExpensiveHash();   // runs in its own thread
  parentPort.postMessage(result);
}`,
    gotchas: `Synchronous file/crypto/JSON operations in request handlers block the event loop for every concurrent request.
process.nextTick() in a recursive pattern starves I/O — the poll phase never runs.
Worker threads don't share heap; ArrayBuffers are transferred (moved), not copied — forgetting this causes unexpected zeroing.
Unbounded event listener registration inside request handlers — MaxListenersExceededWarning and memory leak.
Using Date.now() for tight-loop benchmarks — prefer process.hrtime.bigint() for nanosecond precision.`,
    flashcards: [
      card('How does Node.js handle concurrency on a single thread?', 'Event loop + non-blocking I/O via libuv. I/O is offloaded to OS or thread pool; JS runs single-threaded but never blocks waiting. Result: high concurrency without per-request threads.'),
      card('Event loop phases in order?', 'Timers → Pending callbacks → Idle/prepare → Poll (I/O) → Check (setImmediate) → Close callbacks. Microtasks (Promise, process.nextTick) drain between each phase.'),
      card('process.nextTick vs setImmediate vs Promise — order?', "process.nextTick: runs immediately after current op, before any I/O — highest priority. Promise.then: runs in microtask queue, after nextTick. setImmediate: next loop iteration's check phase. nextTick can starve I/O if overused."),
      card('Blocking vs non-blocking — example?', 'Blocking: `fs.readFileSync` halts the thread. Non-blocking: `fs.readFile(..., cb)` returns immediately, callback runs later. Sync APIs are fine at startup; never in request handlers.'),
      card('When to use worker threads?', "CPU-bound work — image processing, hashing, parsing big payloads — that would block the event loop. I/O work doesn't need workers; the event loop handles it."),
      card('Cluster mode — what does it do?', "Forks N worker processes (typically one per CPU core), each with its own event loop. Master distributes incoming connections. Scales CPU-bound work across cores. PM2 or `node:cluster` module."),
      card('Common Node memory leak sources?', 'Unbounded caches, unremoved event listeners, lingering timers/intervals, closures holding large references, global arrays/maps that only grow.'),
      card('How to diagnose a memory leak in production?', "Heap snapshots via Chrome DevTools (`--inspect`), `clinic heapdump`, or v8 profilers. Look for objects that grow over time and aren't released. Compare snapshots before and after suspected leak path."),
      card('What is backpressure in Node streams?', "When a writable stream can't keep up with the readable source, memory fills up. Streams signal via `write()` returning false → pause source until `drain` event. `pipe()` handles this automatically."),
    ],
    apis: [
      api('process.nextTick()', 'process.nextTick(callback)', 'Queues callback to run before any I/O events — before even Promise microtasks.', 'callback function', 'void', "process.nextTick(() => emitter.emit('ready'));", 'Recursive nextTick calls can starve I/O — prefer setImmediate or queueMicrotask when you need to yield.'),
      api('Worker (worker_threads)', 'new Worker(filename | URL, options?)', 'Spawns a worker thread for CPU-bound work without blocking the event loop.', 'script path/URL, optional workerData', 'Worker instance', "const w = new Worker('./hash-worker.js', { workerData: { input } });", "Worker has its own V8 heap — communicate via postMessage, SharedArrayBuffer, or transferList."),
      api('cluster.fork()', 'cluster.fork()', 'Forks a worker process that shares the server port with the primary.', 'none', 'Worker process handle', "if (cluster.isPrimary) { for (let i = 0; i < os.cpus().length; i++) cluster.fork(); }", 'IPC channel between primary and workers enables coordination and graceful restarts.'),
      api('process.hrtime.bigint()', 'process.hrtime.bigint()', 'Returns a monotonic nanosecond-precision timestamp unaffected by clock changes.', 'none', 'BigInt nanoseconds', "const t0 = process.hrtime.bigint();\n// ...\nconst ns = process.hrtime.bigint() - t0;", 'Use for benchmarking — not affected by system clock adjustments (unlike Date.now()).'),
      api('v8.getHeapStatistics()', 'v8.getHeapStatistics()', 'Returns current V8 heap usage stats.', 'none', '{ used_heap_size, heap_size_limit, ... }', "import v8 from 'node:v8';\nconsole.log(v8.getHeapStatistics().used_heap_size);", 'Expose on a /metrics endpoint to monitor heap usage over time.'),
    ],
    refs: [
      ref('Node.js Event Loop Guide', 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick'),
      ref('Node.js Worker Threads', 'https://nodejs.org/api/worker_threads.html'),
      ref('libuv Architecture', 'https://docs.libuv.org/en/v1.x/design.html'),
      ref('Clinic.js — Node profiling', 'https://clinicjs.org/'),
      ref('Node.js Streams API', 'https://nodejs.org/api/stream.html'),
    ],
  });
  skills.push(subNode);

  // 9. Real-Time & WebSocket Scaling
  const subRealtime = mk('Real-Time & WebSocket Scaling', 'backend', beSkill.id, {
    definition:
      "WebSockets provide persistent bidirectional TCP connections for low-latency real-time messaging, unlike HTTP's request-response cycle. Scaling them horizontally requires externalizing per-connection routing and fan-out via a shared pub/sub broker (Redis, NATS) so messages from any server reach clients on any other server. SSE is a simpler HTTP-native alternative for server-to-client one-way streams.",
    codeExample: `import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Redis adapter: fan-out across all Socket.IO server instances
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);

const io = new Server(httpServer, { cors: { origin: process.env.ALLOWED_ORIGIN } });
io.adapter(createAdapter(pubClient, subClient));

// Auth at connection time
io.use((socket, next) => {
  try {
    socket.data.user = verifyToken(socket.handshake.auth.token);
    next();
  } catch { next(new Error('unauthorized')); }
});

io.on('connection', (socket) => {
  const { userId } = socket.data.user;
  socket.join(\`user:\${userId}\`);         // per-user room

  socket.on('subscribe_stock', (ticker) => socket.join(\`stock:\${ticker}\`));

  // Heartbeat — detect zombie connections
  const hb = setInterval(() => socket.emit('ping'), 30_000);
  socket.on('disconnect', () => clearInterval(hb));
});

// Fan-out works across all server instances via Redis adapter
function broadcastPrice(ticker, price) {
  io.to(\`stock:\${ticker}\`).emit('price', { ticker, price, ts: Date.now() });
}`,
    gotchas: `No heartbeat — load balancer idle timeout kills connections silently; server accumulates zombie sockets eating memory.
Skipping sticky sessions or Redis adapter — messages from server A never reach clients connected to server B.
Auth not refreshed on long-lived connections — tokens expire mid-session but the socket stays open.
Broadcasting to all sockets (io.emit) instead of rooms — O(n) with no filtering wastes bandwidth and CPU.
Not handling the reconnection flood — after a server restart all clients reconnect simultaneously; add jitter.`,
    flashcards: [
      card('WebSocket vs HTTP — fundamental difference?', 'HTTP: request/response, stateless, short-lived. WebSocket: persistent bidirectional TCP connection upgraded from HTTP, low latency for real-time push.'),
      card('WebSocket vs SSE — when each?', 'WebSocket: bidirectional, low latency, custom protocol. SSE: server→client only, plain HTTP, auto-reconnect, simpler. Choose SSE for one-way feeds (notifications, log streams).'),
      card('Why does scaling WebSockets get hard?', "Persistent connections consume memory per client. Routing — which server holds which user's socket? State sync across servers. Load balancers must support sticky sessions or rely on backend coordination."),
      card('How to fan out a message to clients across multiple servers?', 'Publish to a shared bus (Redis pub/sub, NATS, Kafka). Each server subscribes and forwards to its local connected clients. Decouples message origin from delivery.'),
      card('Sticky session — when needed?', "When client state lives on a specific server (in-memory). Load balancer pins client to same backend (by IP, cookie). Avoid sticky sessions if possible — they break horizontal scaling and recovery."),
      card('How to auth a WebSocket connection?', 'Pass JWT on connection (query param or first message), verify before accepting. Reject on expiry — client must reconnect with new token. Long-lived connections need refresh logic.'),
      card('Heartbeat / ping-pong — why?', "TCP can't detect dead connections fast. Server pings clients periodically (e.g., 30s); missing pongs mean kill the connection. Prevents zombie connections eating memory."),
    ],
    apis: [
      api('socket.io Server', 'new Server(httpServer, options)', 'Creates a Socket.IO server with rooms, namespaces, and middleware support.', 'http.Server + options (cors, etc.)', 'Server instance', "const io = new Server(httpServer, { cors: { origin: '*' } });", "Socket.IO protocol is not raw WebSocket — plain ws clients can't connect without a compatibility shim."),
      api('socket.join / io.to', 'socket.join(room) / io.to(room).emit(event, data)', 'Room abstraction for targeted fan-out to a subset of connected clients.', 'room name string', 'void', "socket.join('stock:AAPL');\nio.to('stock:AAPL').emit('price', { p: 192.5 });", 'Rooms are in-process — use Redis adapter to synchronize rooms across multiple instances.'),
      api('@socket.io/redis-adapter', 'createAdapter(pubClient, subClient)', 'Synchronizes Socket.IO rooms and broadcasts across instances via Redis pub/sub.', 'two Redis clients (pub and sub)', 'adapter factory', 'io.adapter(createAdapter(pubClient, subClient));', 'Requires two separate Redis connections — one for publish, one for subscribe.'),
    ],
    refs: [
      ref('Socket.IO Documentation', 'https://socket.io/docs/v4/'),
      ref('Socket.IO Redis Adapter', 'https://socket.io/docs/v4/redis-adapter/'),
      ref('MDN WebSocket API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket'),
      ref('RFC 6455 WebSocket Protocol', 'https://www.rfc-editor.org/rfc/rfc6455'),
      ref('MDN Server-Sent Events', 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events'),
    ],
  });
  skills.push(subRealtime);

  // 10. Architecture Patterns
  const subPatterns = mk('Architecture Patterns', 'backend', beSkill.id, {
    definition:
      'Backend architecture patterns describe how to decompose, connect, and coordinate services and data flows. The monolith-to-microservices spectrum involves trade-offs in operational complexity, team autonomy, and distributed-system concerns. Event-driven patterns (pub/sub, saga) decouple services asynchronously; BFF, CQRS, and the modular monolith capture specific benefits without full microservice overhead.',
    codeExample: `// Saga choreography — no central coordinator
// Each service owns its step and its compensation event

// order-service: starts the saga
async function createOrder(data) {
  const order = await db.createOrder({ ...data, status: 'pending' });
  await eventBus.publish('order.created', { orderId: order.id, ...data });
  return order;
}

// inventory-service: reacts and either reserves or compensates
eventBus.on('order.created', async ({ orderId, productId, qty }) => {
  const reserved = await inventory.reserve(productId, qty);
  if (reserved) {
    await eventBus.publish('inventory.reserved', { orderId });
  } else {
    await eventBus.publish('inventory.reserve_failed', { orderId });
  }
});

// order-service: handles compensation
eventBus.on('inventory.reserve_failed', async ({ orderId }) => {
  await db.updateOrder(orderId, { status: 'cancelled' });
  await eventBus.publish('order.cancelled', { orderId });
});`,
    gotchas: `Jumping to microservices before team or scale justifies it — distributed system complexity with none of the scale benefits.
Sharing a database between microservices — creates tight coupling and defeats independent deployability.
Saga without compensation steps — a failed middle step leaves data partially updated with no rollback path.
Choreography without distributed tracing — impossible to follow a saga flow across services without trace IDs.
BFF becoming a fat aggregation layer — it should shape data, not own business logic.`,
    flashcards: [
      card('Monolith vs microservices — when each?', 'Monolith: one team, one deploy, simpler ops, atomic transactions. Microservices: many teams, independent deploy, scale services independently. Start monolith; split when team / scale pressure demands.'),
      card('What is a modular monolith?', 'A monolith with strict internal module boundaries (separate packages, no shared state, defined APIs between modules). Captures most microservice benefits without distributed-system pain. Often the right middle ground.'),
      card('What is BFF (Backend for Frontend)?', "A backend tailored per frontend (web BFF, mobile BFF, smart-TV BFF). Shapes data and orchestrates downstream services for that client's needs. Avoids one-size-fits-all APIs that overfetch or underfetch."),
      card('Event-driven architecture vs request-response?', 'Event-driven: services emit events; others react asynchronously. Loose coupling, async, scalable. Trade: harder debugging, eventual consistency. Request-response: tight coupling, sync, simpler.'),
      card('Pub/Sub pattern — when does it shine?', 'Fan-out scenarios (one event → many consumers). New consumers added without publisher changes. Decouples producers from consumers. Common in notifications, analytics pipelines.'),
      card('What is the Saga pattern?', 'Manages distributed transactions across services via local txns + compensation steps. If step 3 fails, run undo for steps 1–2. Two variants: orchestration (central coordinator) and choreography (event-driven).'),
      card('Saga orchestration vs choreography?', 'Orchestration: a coordinator service tells each service what to do — easy to reason about, single point of complexity. Choreography: services listen to events and self-coordinate — loose, scalable, harder to trace.'),
      card('When is CQRS overkill?', "When your reads and writes share the same model and don't have wildly different scaling needs. CQRS adds two models, sync overhead, eventual consistency. Use only when justified by load asymmetry or read/write divergence."),
    ],
    apis: [],
    refs: [
      ref('Microservices.io Patterns', 'https://microservices.io/patterns/index.html'),
      ref('Martin Fowler — Microservices', 'https://martinfowler.com/articles/microservices.html'),
      ref('Sam Newman — BFF Pattern', 'https://samnewman.io/patterns/architectural/bff/'),
      ref('Martin Fowler — Saga Pattern', 'https://martinfowler.com/articles/patterns-of-distributed-systems/saga.html'),
      ref('Martin Fowler — CQRS', 'https://martinfowler.com/bliki/CQRS.html'),
    ],
  });
  skills.push(subPatterns);

  // 11. Distributed Systems
  const subDist = mk('Distributed Systems', 'backend', beSkill.id, {
    definition:
      'Distributed systems trade single-node simplicity for scale and fault tolerance, introducing fundamental constraints: the CAP theorem limits guarantees during network partitions. Practical design accepts eventual consistency and at-least-once delivery, then makes each operation idempotent so retries are safe. Fencing tokens, logical clocks, and sagas address coordination without shared memory.',
    codeExample: `// Idempotency key pattern — safe POST under retries (Stripe-style)
app.post('/v1/payments', async (req, res, next) => {
  const idemKey = req.headers['idempotency-key'];
  if (!idemKey) return res.status(400).json({ code: 'missing_idempotency_key' });

  // Return stored result if we already processed this key
  const existing = await redis.get(\`idem:\${idemKey}\`);
  if (existing) return res.status(200).json(JSON.parse(existing));

  try {
    const result = await paymentService.charge(req.body);
    // Store result (TTL 24h) before responding — atomic enough for most cases
    await redis.setex(\`idem:\${idemKey}\`, 86_400, JSON.stringify(result));
    res.status(201).json(result);
  } catch (err) {
    // Don't cache errors — client retries with the same key
    next(err);
  }
});`,
    gotchas: `Assuming network calls succeed — every RPC can fail, timeout, or return a partial response; handle all three cases.
Using wall-clock timestamps for event ordering across nodes — clock skew makes this unreliable; use logical clocks.
Distributed lock without fencing tokens — two holders during a partition both think they hold the lock (split-brain).
Two-phase commit for long-running workflows — coordinator failure blocks all participants indefinitely; prefer sagas.
At-most-once delivery (fire-and-forget) for critical events — missed events are unrecoverable; prefer at-least-once + idempotent consumers.`,
    flashcards: [
      card('State the CAP theorem.', 'During a network partition, a distributed system must trade consistency against availability. Partition tolerance is assumed for distributed systems.'),
      card('What is eventual consistency?', 'Updates propagate asynchronously; nodes converge to the same state given enough time without new writes. Common in distributed DBs (Cassandra, DynamoDB, Mongo with weak read concerns), CDNs, replicated caches.'),
      card('How to make a POST endpoint idempotent?', 'Client sends an `Idempotency-Key` header per logical request. Server stores key + result for some TTL. If same key arrives again, return stored result instead of re-processing. Stripe-style.'),
      card('Distributed locking — why is it controversial?', "Easy to think you have a lock but a network partition + clock skew can mean two clients hold the lock simultaneously (split-brain). Redis Redlock claims to solve this; Martin Kleppmann's critique argues you need fencing tokens."),
      card('What is a fencing token?', 'A monotonically increasing ID issued with each lock. Downstream services check the token — if a higher token has been seen, reject older ones. Protects against stale lock holders even during partitions.'),
      card('Why is "exactly once" delivery impossible to guarantee?', "Network failures + crashes mean you can't simultaneously confirm \"message sent\" and \"message processed.\" Practical answer: at-least-once delivery + idempotent handlers = effectively exactly once."),
      card('Read-after-write consistency — what breaks it?', "Async replication lag. User writes to master, reads from a lagging replica, doesn't see their own update. Fixes: read-your-writes from master for that user, causal tokens, or session stickiness to a replica."),
      card('Two-phase commit — why rarely used?', "Distributed coordinator + prepare/commit phases. Provides atomicity across services. Blocks on coordinator failure (no liveness during partitions), high latency, doesn't scale. Sagas + idempotency are preferred in practice."),
      card('What is a clock skew problem?', 'Distributed nodes have slightly different clocks. Comparing timestamps across nodes is unreliable. Use logical clocks (Lamport, vector clocks) or hybrid logical clocks for causality, not wall clock.'),
    ],
    apis: [],
    refs: [
      ref('Designing Data-Intensive Applications (Kleppmann)', 'https://dataintensive.net/'),
      ref('Jepsen — distributed systems testing', 'https://aphyr.com/tags/jepsen'),
      ref('Martin Fowler — Patterns of Distributed Systems', 'https://martinfowler.com/articles/patterns-of-distributed-systems/'),
      ref('CAP Theorem — Brewer revisited', 'https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/'),
      ref('Stripe Idempotency Keys', 'https://stripe.com/blog/idempotency'),
    ],
  });
  skills.push(subDist);

  // 12. Scalability, Infra & Observability
  const subInfra = mk('Scalability, Infra & Observability', 'backend', beSkill.id, {
    definition:
      'Scalability is the ability to handle more load by adding resources: stateless services scale horizontally; stateful ones require sharding, replication, or external state stores. Kubernetes orchestrates containerized workloads with probes, rolling deploys, and auto-scaling. Observability — structured logs, metrics, and distributed traces — provides the feedback loop to understand production behavior and diagnose failures.',
    codeExample: `# docker-compose with healthchecks + Prometheus scrape labels
version: "3.9"
services:
  api:
    image: myapp:latest
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgres://db/app
      - REDIS_URL=redis://redis:6379
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health/live"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 10s
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=3000"
      - "prometheus.io/path=/metrics"

  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s`,
    gotchas: `Conflating liveness and readiness probes — a slow-starting pod failing liveness gets killed in a restart loop; use readiness to gate traffic and liveness only for truly crashed containers.
No circuit breaker on downstream calls — one slow dependency cascades into 503s across the entire call graph.
Logs without correlation IDs — you can't trace a single user request across 5 microservices without a shared trace ID.
Deploying without canary or blue-green strategy — a bad deploy immediately affects 100% of traffic.
Sizing K8s resource requests/limits incorrectly — too low causes OOMKills, too high wastes capacity and prevents scheduling.`,
    flashcards: [
      card('Horizontal vs vertical scaling — pick when?', 'Vertical (bigger box): simple, has a ceiling. Horizontal (more boxes): unbounded but requires stateless services and distributed coordination. Vertical first, horizontal once stateless.'),
      card('L4 vs L7 load balancer?', 'L4 (transport): routes by IP/port, fast, protocol-agnostic. L7 (application): routes by HTTP path/header/cookie, can do SSL termination and content-aware routing. Use L7 for HTTP services.'),
      card('Load balancing algorithms?', 'Round-robin (simple, ignores server load), least-connections (smarter under variable request cost), IP hash (sticky), weighted (mixed-capacity fleets), EWMA / least-response-time (latency-aware).'),
      card('Reverse proxy vs load balancer?', 'Reverse proxy: receives client requests, forwards to backends (one or many) — adds SSL termination, caching, compression. Load balancer: distributes across many backends for HA/scale. Nginx and Envoy do both.'),
      card('Liveness vs readiness probes in K8s?', 'Liveness: "is this container alive?" — restart if fails. Readiness: "ready to serve traffic?" — remove from LB if fails. Conflating them causes restart storms (slow startup → liveness fail → restart loop).'),
      card('Zero-downtime deployment strategies?', 'Rolling update (replace pods gradually — default in K8s). Blue-green (full duplicate environment, switch traffic). Canary (route % of traffic to new version, monitor, ramp up). Each trades risk for cost.'),
      card('What is a circuit breaker?', '"Opens" after N failures within a window — fails fast without calling the downstream. Periodically tries a "half-open" probe. Prevents cascading failures and gives downstream room to recover.'),
      card('Bulkhead pattern?', "Isolate resources so one failure can't drown others. E.g., separate thread pools or connection pools per downstream service. If one service hangs, only its bulkhead fills — others stay healthy."),
      card('Three pillars of observability?', 'Logs (discrete events), metrics (numeric aggregates over time), traces (request flow across services). Together: what happened, how often, where time was spent. Tools: ELK, Prometheus, OpenTelemetry.'),
      card('Why is distributed tracing essential at scale?', 'A single user request can touch 10+ services. Without trace IDs propagated end-to-end, "this request is slow" is unsolvable. OpenTelemetry, Jaeger, Tempo, Datadog APM provide this.'),
      card('What is a dead letter queue?', "When a message can't be processed after N retries, it's moved to a separate \"dead letter\" queue for inspection. Keeps the main queue healthy. Critical for debugging async pipelines."),
      card('Retry strategy — what\'s "exponential backoff with jitter"?', 'Wait 2^attempt seconds between retries (1, 2, 4, 8...) + random jitter to prevent synchronized retries from clients all hitting at once after an outage. Without jitter you cause a thundering herd on recovery.'),
      card('What does an API gateway do?', 'Single entry point for client traffic. Handles auth, rate limiting, request routing, request/response transformation, SSL termination, logging. Examples: Kong, AWS API Gateway, Envoy, Apigee.'),
    ],
    apis: [
      api('K8s livenessProbe', 'livenessProbe: { httpGet: { path, port }, initialDelaySeconds, periodSeconds }', 'K8s restarts the container if this probe fails — use for truly crashed/deadlocked containers only.', 'HTTP/TCP/exec check + timing thresholds', 'K8s Pod spec field', "livenessProbe:\n  httpGet: { path: /health/live, port: 3000 }\n  initialDelaySeconds: 15\n  periodSeconds: 20", 'Do NOT use for slow-start — a slow init will trigger a restart loop.'),
      api('K8s readinessProbe', 'readinessProbe: { httpGet: { path, port }, periodSeconds, failureThreshold }', 'K8s removes the pod from the load balancer endpoint slice if this probe fails.', 'HTTP/TCP/exec check + timing thresholds', 'K8s Pod spec field', "readinessProbe:\n  httpGet: { path: /health/ready, port: 3000 }\n  periodSeconds: 10\n  failureThreshold: 3", 'Block readiness until DB migrations, cache warming, and startup checks complete.'),
      api('Prometheus /metrics', 'GET /metrics', 'Exposes metrics in Prometheus text format for scraping by Prometheus server.', 'none', 'text/plain metrics exposition format', "import { collectDefaultMetrics, Registry } from 'prom-client';\nconst reg = new Registry();\ncollectDefaultMetrics({ register: reg });\napp.get('/metrics', async (_, res) => res.set('Content-Type', reg.contentType).send(await reg.metrics()));", 'Default metrics include Node.js event loop lag, memory, and GC stats out of the box.'),
      api('OpenTelemetry span', 'tracer.startActiveSpan(name, fn)', 'Instruments a code block with a distributed trace span sent to a collector.', 'span name + callback', 'span with attributes', "const span = tracer.startSpan('db.query');\ntry { await query(); } finally { span.end(); }", 'Propagate trace context via W3C TraceContext headers (traceparent) across service boundaries.'),
    ],
    refs: [
      ref('Kubernetes Documentation', 'https://kubernetes.io/docs/home/'),
      ref('OpenTelemetry Node.js Getting Started', 'https://opentelemetry.io/docs/languages/js/getting-started/nodejs/'),
      ref('prom-client — Prometheus for Node', 'https://github.com/siimon/prom-client'),
      ref('Martin Fowler — Circuit Breaker', 'https://martinfowler.com/bliki/CircuitBreaker.html'),
      ref('Google SRE Book (free online)', 'https://sre.google/sre-book/table-of-contents/'),
    ],
  });
  skills.push(subInfra);

  return skills;
}
