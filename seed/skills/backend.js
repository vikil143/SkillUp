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
    'Event Loop & Concurrency',
    'Modules & Package Management',
    'File System & Streams',
    'Process & Environment',
    'Error Handling Patterns',
    'Worker Threads',
    'Testing Node Services',
  ].forEach((name) => {
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
          card(`What commonly breaks first in ${name}?`, 'Assumptions about async ordering, resource cleanup, or runtime boundaries.'),
          card(`What is a strong code-review signal for ${name}?`, 'Explicit failure handling and measurable operational safeguards.'),
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
    'Middleware Architecture',
    'Routing & Modular Routers',
    'Validation & Sanitization',
    'Auth Middleware',
    'Error Handling',
    'Security Hardening',
    'Observability & Logging',
  ].forEach((name) => {
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
          card(`What anti-pattern appears often in ${name}?`, 'Coupling transport-layer concerns with domain logic and losing clear boundaries.'),
          card(`How do you enforce consistency in ${name}?`, 'Centralized conventions, reusable middleware wrappers, and contract tests.'),
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
    'Resource Modeling',
    'Status Codes & Error Shapes',
    'Pagination & Filtering',
    'Idempotency',
    'Versioning Strategies',
    'Caching & Conditional Requests',
    'Rate Limiting',
  ].forEach((name) => {
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
          card(`What reliability risk is highest in ${name}?`, 'Silent contract ambiguity that clients interpret differently.'),
          card(`How do you de-risk ${name} changes?`, 'Publish contract tests and monitor client error rates during rollout.'),
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
    'Schema Design',
    'Resolvers & Data Sources',
    'N+1 & Batching',
    'Auth & Authorization',
    'Query Cost Control',
    'Caching Strategies',
    'Federation Basics',
  ].forEach((name) => {
    skills.push(
      mk(name, 'backend', gql.id, {
        definition: `${name} keeps GraphQL APIs scalable, secure, and understandable for client teams.`,
        codeExample:
          name === 'N+1 & Batching'
            ? "const loaders = {\n  userById: new DataLoader((ids) => repo.users.byIds(ids)),\n};"
            : name === 'Auth & Authorization'
              ? "if (!ctx.user || ctx.user.id !== parent.ownerId) {\n  throw new Error('forbidden');\n}"
              : 'type Query { health: String! }',
        flashcards: [
          card(`What is the biggest scaling trap in ${name}?`, 'Treating schema convenience as free and ignoring resolver-level cost.'),
          card(`How do you verify correctness in ${name}?`, 'Contract tests, resolver metrics, and strict schema review discipline.'),
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
    'Connection Lifecycle',
    'Pub/Sub Fan-out',
    'Presence & Heartbeats',
    'Message Protocol Design',
    'Auth & Re-auth',
    'Backpressure & Flow Control',
    'Horizontal Scaling',
  ].forEach((name) => {
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
          card(`What production bug appears often in ${name}?`, 'State desynchronization between connection events and business event streams.'),
          card(`What is the baseline safeguard for ${name}?`, 'Explicit protocol contracts, timeout policies, and per-connection cleanup guarantees.'),
        ],
      })
    );
  });

  return skills;
}
