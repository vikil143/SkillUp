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

  return skills;
}
