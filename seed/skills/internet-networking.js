// seed/skills/internet-networking.js — HTTP, REST, DNS, CORS, TLS, TCP/UDP, LB, CDN, caching, WebRTC
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

function pushSubs(skills, parent, names, defs, codes, fcGroups) {
  names.forEach((name, i) => {
    skills.push(
      mk(name, parent.categoryId, parent.id, {
        definition: defs[i],
        codeExample: codes[i],
        flashcards: fcGroups[i],
      }),
    );
  });
}

export default function buildInternetSkills() {
  const skills = [];

  // --- HTTP / HTTPS ---
  const httpHttps = mk('HTTP / HTTPS', 'internet', null, {
    notes:
      'For how HTTP versions affect throughput and multiplexing when tuning front-end perf, pair with Performance → Network Performance.',
    definition:
      'HTTP is an application-layer, stateless protocol for exchanging messages between clients (often browsers) and servers. HTTPS is HTTP protected by TLS. Together they specify methods, URLs, headers, status codes, and bodies—and they sit on top of a reliable transport stack (traditionally TCP, increasingly QUIC behind HTTP/3).',
    codeExample:
      "curl -i https://example.com/api/items \\\n  -H 'Accept: application/json' \\\n  -H 'Authorization: Bearer $TOKEN'",
    whenUsed:
      'Understand HTTP whenever you integrate REST APIs, diagnose production errors, optimize caching/CDN behaviour, or reason about TLS and multiplexing gains.',
    gotchas:
      'Redirects (3xx), auth headers, conditional requests, cookies, compression and HTTP version all interact—you need the full picture before “just increasing cache TTL”.',
    flashcards: [
      card(
        'What distinguishes HTTP from HTTPS at the protocol boundary?',
        'HTTPS wraps HTTP payloads in TLS, providing confidentiality, integrity, and authenticated server identity; HTTP transmits cleartext (except when tunnelled elsewhere).',
      ),
      card(
        'Why is HTTP repeatedly called stateless?',
        'Each standalone request carries enough context via headers/body/session tokens; servers do not keep conversation memory unless you deliberately add sticky sessions/server-side sessions.',
      ),
      card(
        'What triggers a conditional GET?',
        'Cached validators—like ETag / Last-Modified—plus request headers (`If-None-Match`, `If-Modified-Since`) so servers can reply `304 Not Modified`.',
      ),
      card(
        'How does multiplexing shift performance compared with HTTP/1.1?',
        'HTTP/2 multiplexes many streams over one TLS connection avoiding head-of-line blocking at the HTTP layer; HTTP/3/QUIC further reduces TCP-level HoL blocking and improves lossy/mobile networks.',
      ),
      card(
        'Why separate `Authorization` cookies from `Cookie`?',
        '`Authorization` bearer tokens/API keys are explicitly application-controlled; browsers auto-store/send cookies per domain/path rules—which changes CSRF posture.',
      ),
      card(
        'What is the danger of blindly caching authenticated responses?',
        'Private/session responses may leak personalized data unless `Cache-Control: private`/Vary correctness is enforced consistently through CDNs.',
      ),
      card(
        'When does chunked transfer encoding matter?',
        'Streaming progressively generated bodies (SSE-style data, SSR streams) requires knowing how chunk framing interacts with proxies and buffering.',
      ),
      card(
        'Why do HTTP semantics still matter behind gRPC?',
        'HTTP/2 frames carry gRPC envelopes; timeouts, RST_STREAM behaviour, proxies, TLS settings, flow control still surface as production incidents.',
      ),
    ],
    apis: [
      api(
        'Cache-Control (response)',
        "Cache-Control: public, max-age=3600, stale-while-revalidate=86400",
        'Directs shared/private caches how long representations stay fresh.',
        '`public|private`, `max-age`, `s-maxage`, `no-store`, `no-cache`, `immutable`, `stale-while-revalidate`',
        'Cache directive token string',
        "res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');",
        '`no-cache` still revalidates; `no-store` refuses storage—easy to confuse.',
      ),
      api(
        'Authorization (request)',
        'Authorization: <scheme> <credentials>',
        'Carries asserted identity for bearer tokens/basic auth/custom schemes.',
        'scheme (`Bearer`), opaque token/value',
        'none (header only)',
        "fetch(url, { headers: { Authorization: `Bearer ${token}` } });",
        'Proxies/logs may accidentally capture bearer tokens.',
      ),
      api(
        'Content-Type',
        'Content-Type: application/json; charset=utf-8',
        'Signals media type + optional charset for parsers.',
        'IANA MIME string + charset param',
        'Header string',
        "headers: { 'Content-Type': 'application/json; charset=utf-8' }",
        '`application/json` without charset shifts default interpretation between runtimes.',
      ),
      api(
        'Accept',
        'Accept: application/json, text/plain;q=0.9,*/*;q=0.8',
        'Negotiation hint listing preferred MIME types.',
        'Comma-delimited MIME + quality weights',
        'Negotiation directive',
        "headers: { Accept: 'application/vnd.api+json; version=2' }",
        'Servers may ignore—but clients should still send purposeful values.',
      ),
      api(
        'If-None-Match',
        'If-None-Match: "33a64df5532015"',
        'Validator for conditional GETs using opaque ETags.',
        'Weak or strong etag token(s)',
        '200 response body or empty 304',
        `const etag = res.headers.get('etag'); fetch(url,{headers:{'If-None-Match':etag}});`,
        'Multiple validators follow special precedence rules.',
      ),
      api(
        'Set-Cookie (response)',
        'Set-Cookie: sid=abcd; Secure; HttpOnly; SameSite=Lax; Path=/',
        'Instructs UA to persist cookie jars with semantics + security directives.',
        'name=value + attribute flags',
        'Cookie persisted client-side',
        "res.cookie('sid', token, { httpOnly: true, sameSite: 'lax', secure: true });",
        '`Secure` ineffective over plain HTTP origins.',
      ),
      api(
        'HTTP status families',
        '1xx provisional · 2xx success · 3xx redirection · 4xx client error · 5xx server error',
        'Operational shorthand grouping—guides monitoring + client retry rules.',
        'numeric code buckets',
        'Semantic meaning',
        '`201 Created` carries `Location` for new resources.',
        `Treating everything “non-200” as failure loses nuance.`,
      ),
    ],
    refs: [
      ref('MDN HTTP overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP'),
      ref('RFC 9110 HTTP Semantics', 'https://datatracker.ietf.org/doc/html/rfc9110'),
      ref('HTTP/2 spec (RFC 9113)', 'https://datatracker.ietf.org/doc/html/rfc9113'),
      ref('Security best practices overview', 'https://infosec.mozilla.org/guidelines/web_security'),
    ],
    relatedProjectIds: [],
  });
  skills.push(httpHttps);
  pushSubs(
    skills,
    httpHttps,
    [
      'Request / response anatomy',
      'HTTP versions: 1.1 vs 2 vs 3',
      'Caching headers deep dive',
      'Cookies, sessions & security flags',
      'Connection lifecycle',
    ],
    [
      'HTTP exchanges start-line + headers + optional body with constraints per method semantics.',
      'Each major HTTP revision changes framing/transport assumptions while preserving semantic methods/status codes.',
      'Validators (`ETag`), freshness (`max-age`) and staleness knobs (`stale-*`) constrain caches along the journey.',
      'Cookies automate stateful behaviours but widen CSRF + tracking surface.',
      'Keep-alive and HTTP/3 connection migration materially affect latency dashboards.',
    ],
    [
      "GET https://example.com/items HTTP/1.1\nHost: example.com\nAccept: application/json\n\n",
      '// HTTP/3 uses QUIC UDP transport + TLS 1.3 — tools differ (`curl --http3`).',
      "Cache-Control: public, max-age=0, must-revalidate\nETag: W/\"v3-abc\"\nLast-Modified: Wed, 21 Oct 2024 07:28:00 GMT",
      "Set-Cookie: session=id; Secure; HttpOnly; SameSite=Strict; Path=/; Domain=example.com",
      'Connection: keep-alive\nUpgrade: h2\n',
    ],
    [
      [
        card('Do GET bodies have defined semantics?', 'Historically discouraged/ignored—stick parameters in URLs or use POST/graph layers when payload needed.'),
        card('When is `HEAD` indispensable?', `When probing metadata/size without fetching entire bodies (health checks shouldn't download multi-MB payloads).`),
        card('Which header commonly signals gzip vs brotli?', '`Content-Encoding`.'),
      ],
      [
        card('What pragmatic win does multiplexing unlock?', `Parallel asset downloads without spawning dozens of TCP connections—which hits browser connection limits`),
        card('Why was HTTP2 server-push largely abandoned?', 'Complex cache interaction + mismatched precedence with real workloads; prefer preload hints + CDN strategies.'),
        card('Which layer handles QUIC connection migration?', 'QUIC handles connection migration at the transport layer using connection IDs, so a connection can survive client IP or network changes when both endpoints support it.'),
      ],
      [
        card('What does `Vary` protect against?', `Ensures caches key responses on listed request headers—avoid serving gzip variant to gzip-incapable client.`),
        card('Weak vs strong ETag?', 'Weak permits byte-equivalent substitutions; validators must match server rules for concurrency control.'),
      ],
      [
        card('Why pair `Secure` flag with HTTPS-only deployments?', '`Secure` refuses cookie transmission over cleartext HTTP—closes accidental downgrade leaks.'),
        card('What does SameSite=Lax block?', `SameSite=Lax withholds cookies on most cross-site subrequests and cross-site POSTs, reducing CSRF risk. It still sends cookies on safe top-level navigations such as clicking a normal GET link.`),
      ],
      [
        card(
          'HTTP/1.1 keep-alive implication on proxies?',
          'Idle sockets plus proxy timeouts can surface as phantom ECONNRESET bursts under churning load.',
        ),
        card('Which metric skews heavily with HTTP version?', 'Time-to-first-byte plus parallel download waterfalls—observe via DevTools/protocol columns.'),
      ],
    ],
  );

  // --- REST principles ---
  const restPrinciples = mk('REST principles', 'internet', null, {
    definition:
      'REST (Representational State Transfer) organizes networked applications around resources addressed by stable URIs, manipulated through a constrained set of verbs, yielding cacheable representations. It embraces statelessness on the wire while allowing servers to evolve via hypermedia-ready representations when teams invest in maturity.',
    codeExample:
      "PATCH /customers/42\nContent-Type: application/json\n{\n  \"email\": \"nina@corp.example\"\n}\n",
    whenUsed:
      'Design APIs consumed by SPA/mobile clients, critique backend contracts, negotiate pagination/filter semantics, maintain backward compatibility.',
    gotchas:
      'CRUD≠domain—some actions map poorly to verbs; versioning + idempotency must be spelled out—not implied by REST buzzwords.',
    flashcards: [
      card(
        'What does “uniform interface” concretely require?',
        'Self-descriptive messages, resource identification (`/customers/{id}`), manipulations through representations, optionally hypermedia hints (`links` arrays).',
      ),
      card(
        'Why does statelessness simplify scaling?',
        'Any healthy node can satisfy the next request; you avoid pinning except when session stickiness intentionally added.',
      ),
      card(
        'When prefer `PATCH` vs `PUT`?',
        '`PUT` replaces the whole resource declaratively; `PATCH` conveys partial edits—prefer JSON Merge/Patch semantics explicitly.',
      ),
      card(
        'How should idempotency keys interact with REST?',
        'POST that creates side effects (`POST /transfers`) should accept `Idempotency-Key` headers (pattern) despite POST’s default non-idempotency.',
      ),
      card(
        'Difference between **409 Conflict** vs **422 Unprocessable Content**?',
        '409 implies domain conflict/state mismatch (often recoverable retries); **422 signals syntactically valid JSON but semantics/rules failed—pick one semantics team-wide.**',
      ),
      card(
        'Why versioning via headers beats URL paths occasionally?',
        'Keeps URIs opaque and enables content negotiation—but requires disciplined gateway observability.',
      ),
      card(
        'REST vs GraphQL tradeoff?',
        'REST excels simple caching/CDN interoperability; GraphQL excels client-driven field trimming at cost of caching complexity.',
      ),
      card(
        'Pagination smell when API returns gigantic arrays?',
        'Cursor-based pagination prefers stable sorting keys; naive `OFFSET` destroys performance.',
      ),
    ],
    apis: [
      api(
        'GET collection',
        'GET /customers?status=active&cursor=opaque',
        'Safe, cacheable retrieval with optional filters.',
        'query tokens',
        '200 + paginated representations',
        "router.get('/', listHandler);",
        'Never leak internal DB ids if security requires opaque tokens.',
      ),
      api(
        'POST create',
        'POST /customers',
        'Non-idempotent create—location header expected.',
        'representation body',
        '201 Created + Location',
        "router.post('/', createCustomer);",
        'Return `422`/`400` thoughtfully; document validation errors.',
      ),
      api(
        'PUT replace',
        'PUT /customers/42',
        'Idempotent full replacement semantics.',
        'full resource body',
        '200 / 204 / 201 semantics per design',
        "router.put('/:id', replaceCustomer);",
        'Concurrency control via If-Match/ETags prevents lost updates.',
      ),
      api(
        'DELETE resource',
        'DELETE /sessions/current',
        'Idempotent tombstone—duplicate deletes ideally `204`.',
        'none/minimal entity',
        '204 / 202 async jobs',
        "router.delete('/sessions/current', revoke);",
        'Soft-delete vs HTTP DELETE document clearly.',
      ),
      api(
        'HEAD / OPTIONS',
        'OPTIONS /customers (CORS friendly)',
        'Metadata discovery (`Allow`, `ACL`, CORS preflight interplay).',
        'none',
        'Header-only answers',
        "app.options('/customers', corsPreflightHandler);",
        'Preflight OPTIONS must mirror actual verbs + headers.',
      ),
    ],
    refs: [
      ref('Roy Fielding dissertation (origin)', 'https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm'),
      ref('Mozilla REST guidance', 'https://developer.mozilla.org/en-US/docs/Glossary/REST'),
      ref('RFC 9412 JSON Merge Patch', 'https://datatracker.ietf.org/doc/html/rfc7386'),
      ref('Stripe Idempotency pattern (study)', 'https://stripe.com/docs/api/idempotent_requests'),
    ],
    relatedProjectIds: [],
  });
  skills.push(restPrinciples);
  pushSubs(
    skills,
    restPrinciples,
    [
      'Resources, URIs & statelessness',
      'HTTP verbs → CRUD & edge domains',
      'Status codes with intent',
      'Idempotency & safety matrix',
      'Versioning tactics',
    ],
    [
      'Resources are nouns addressed by URIs; representations serialize state snapshots.',
      'GET/HEAD safe, OPTIONS introspects, PATCH partial, PUT replace, DELETE remove, POST action-oriented.',
      'Codes communicate machine-actionable semantics—helps clients/backoff gracefully.',
      'Safe methods shouldn’t mutate; idempotent repeats converge same server effect.',
      'URL versioning (`/v2`) vs Accept header vs subdomain gateways—teams pick tradeoffs deliberately.',
    ],
    [
      "GET https://shop.example/catalog/shoes/high-tops/123\nAuthorization: Bearer ...\nAccept: application/json",
      '// POST purchases when pure CRUD verbs insufficient\nrouter.post(\\"/orders/{id}:submit\\");',
      "return res.status(409).json({ error: 'EMAIL_TAKEN' });",
      "app.use((req,res,next)=>{\n if(['GET','HEAD','OPTIONS','TRACE'].includes(req.method)) freezeWrites=true;\n next();\n});",
      "curl -H 'Accept: application/vnd.company+json; version=2025-07-01' https://api/entities",
    ],
    [
      [
        card('When is nested URI depth harmful?', `Super deep paths mirror DB joins—prefer shallow resources + relational links.`),
        card('Hypermedia HATEOAS payoff?', 'Clients resist hard-coded URL strings—helps evolve APIs gracefully when teams invest tooling.'),
      ],
      [
        card('Which verb for file uploads chunked/resumable?', 'Often POST to `/uploads` with signed URLs—not literal PUT binary on huge resources blindly.'),
      ],
      [
        card('Difference `201` payload vs Location header?', 'Location points canonical fetch URL; bodies may embed partial summaries—document contract.'),
      ],
      [
        card('why DELETE twice should be safe?', `Second call converges deleted state—middleware must not double-charge quotas.`),
      ],
      [
        card(
          'Deprecation header pattern?',
          'Publish `Deprecation` plus `Sunset` (RFC 8594) dates and observable logs—pair with versioning docs.',
        ),
      ],
    ],
  );

  // --- DNS ---
  const dnsSkill = mk('DNS', 'internet', null, {
    definition:
      'The Domain Name System maps human-readable names to resource records stored hierarchically (`root → TLD → authoritative`). Resolvers cache answers with TTL; modern deployments add privacy layers (DNS-over-HTTPS/TLS).',
    codeExample: "dig example.com ANY +nocmd\n;; ANSWER SECTION:\nexample.com.\t299\tIN\tA\t93.184.216.34\n",
    whenUsed:
      'Debugging broken deploys (`NXDOMAIN`), diagnosing email SPF/DMARC (`TXT`), multi-region routing, CDN CNAME juggling, diagnosing slow first navigation.',
    gotchas:
      'Glue records, TTL vs operational propagation, truncated UDP vs TCP fallback, split-horizon DNS for private networking.',
    flashcards: [
      card(
        'What path does stub resolver traversal take?',
        'Browser/OS stub → recursive resolver iterates delegated NS chain until authoritative answers or cached hit.',
      ),
      card(
        'Why can lowering TTL dangerously destabilize origin?',
        'Clients hammer lookups; authoritative/load balancers choke—balance agility vs infra cost.',
      ),
      card(
        'Purpose of glue records?',
        'Break circular dependence when NS hostnames lie inside delegated zone—they carry A/AAAA sibling answers at parent.',
      ),
      card(
        'Why MX priority matters?',
        'Lower integers preferred first; failover + load spread across cooperating mail relays.',
      ),
      card(
        'DNS lookups happen per-domain how?',
        `Each authoritative label may incur extra RTT unless prefetch/preconnect mitigation—overlap with Perf Network tuning.`,
      ),
      card(
        'DoH implications for corp networks?',
        'Encrypts lookups to HTTPS endpoints—security win but visibility/traditional filtering complexity.',
      ),
    ],
    apis: [
      api(
        'dig',
        'dig +tcp example.com @1.1.1.1 AAAA',
        'Diagnostic resolver queries arbitrary types/servers.',
        'flags, name, `@server`, RR type',
        'ANSWER SECTION text',
        "dig google.com TXT +short",
        'Truncate messages fall back TCP automatically when `+tcp` enforced.',
      ),
      api(
        'nslookup',
        'nslookup -type=TXT _dmarc.example.com',
        'Interactive + batch-friendly legacy tool.',
        'type/host',
        'RR output',
        "nslookup -debug example.com",
        'Behaviour inconsistent across platforms—prefer `dig` for scripts.',
      ),
      api(
        'host',
        'host -v -t MX example.net',
        'Concise summaries for quick scripting.',
        'host + RR type flags',
        'stdout lines',
        "host google.com",
        'Less granular than dig’s trace hooks.',
      ),
    ],
    refs: [
      ref('Mozilla DNS glossary', 'https://developer.mozilla.org/en-US/docs/Glossary/DNS'),
      ref('DNSimple learning center', 'https://support.dnsimple.com/articles/dns-propagation'),
      ref('RFC 8499 DNS terminology', 'https://datatracker.ietf.org/doc/html/rfc8499'),
      ref('Cloudflare Learning DNS', 'https://www.cloudflare.com/learning/dns/what-is-dns/'),
    ],
    relatedProjectIds: [],
  });
  skills.push(dnsSkill);
  pushSubs(
    skills,
    dnsSkill,
    ['Resolution chain', 'Record types arsenal', 'TTL & operational reality', 'DNS privacy transports'],
    [
      'Iterative vs recursive resolver roles + negative caching quirks.',
      'A/AAAA, CNAME flattening pitfalls, TXT for auth, MX/MX-less mail.',
      'Changes respect TTL—not “instant propagation”.',
      'DoT port 853 vs DoH leveraging HTTPS multiplexing ecosystems.',
    ],
    [
      "dig trace example.com  # observes delegation hops",
      "example.com.\t900\tIN\tCNAME\tshop.cdn.example.",
      "// Lower TTL cautiously ahead of migrations then raise after stable.",
      '// DoH resolver URL configured at OS/browser differs from plaintext UDP to ISP',
    ],
    [
      [
        card('Difference authoritative vs recursive answers?', `Authoritative originates zone data; recursive synthesizes by walking chain + caching aggregates.`),
        card('Wildcard record danger?', `Over-broad wildcard captures unintended hostnames leaking internal services`),
      ],
      [
        card('Chain too many CNAMES?', 'Some providers flatten; apex alias rules ≠ generic CNAME spec expectations.'),
      ],
      [
        card('Stale negative cache?', 'NXDOMAIN cached too—during cutovers flush affected PoPs thoughtfully.'),
      ],
      [
        card('Operational logging gap with DoH?', 'Traditional DNS DPI blind—plan endpoint security accordingly.'),
      ],
    ],
  );

  // --- CORS ---
  const corsSkill = mk('CORS', 'internet', null, {
    definition:
      'Cross-Origin Resource Sharing (CORS) is a browser-controlled contract layered on same-origin policy. Servers expose explicit ACAO (+ methods/headers/credentials) headers so cooperating origins can invoke cross-site fetches safely.',
    codeExample:
      "OPTIONS /graphql HTTP/1.1\nOrigin: https://app.example\nAccess-Control-Request-Method: POST\nAccess-Control-Request-Headers: authorization,content-type\n",
    whenUsed:
      'Debugging blocked SPA dashboards, SSR fetch proxies, CDN edge auth, websocket upgrades, multipart uploads initiated cross-site.',
    gotchas:
      'Wildcards forbid credentialed flows; redirects preflight oddly; proxies stripping headers mimic “opaque” confusing errors.',
    flashcards: [
      card(
        'What tuple defines origin equality?',
        'Scheme + registered host + port must match—all three—not just overlapping hostnames/subdomains.',
      ),
      card(
        'Which requests skip preflight?',
        'Historical “simple” subset (methods GET/HEAD/POST with safelisted headers/content-types) executes directly—anything else triggers OPTIONS choreography.',
      ),
      card(
        "Why can't `Access-Control-Allow-Origin: *` accompany `Allow-Credentials: true`?",
        'Spec forbids—it would let any script read authenticated responses blindly; echo requesting `Origin` or reflect via server allowlist.',
      ),
      card(
        'Difference `Access-Control-Expose-Headers` defaults?',
        'Browsers hide most headers from JS (`Set-Cookie` never exposed); whitelist additional ones explicitly.',
      ),
      card(
        'How do opaque responses sabotage SPA error handling?',
        'Failed CORS may yield unreadable bodies—observe network tab versus JavaScript readability.',
      ),
      card(
        'Server-side SSR fetch circumvent CORS—why?',
        'Node fetch isn’t a browser enforcing SOP—you must still validate outbound calls manually.',
      ),
      card(
        'Why preflight caches matter?',
        'Successful preflight caches `Access-Control-Max-Age`—invalidate via unique URLs only if you truly understand fallout.',
      ),
      card(
        'How does `credentials: include` change behaviour?',
        'Sends cookies + blocks wildcard ACAO—you must synchronize cookie SameSite posture.',
      ),
    ],
    apis: [
      api(
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Origin: https://app.example',
        'Enumerates permissible caller origin—or `*` minus credentials.',
        'origin string literal',
        'response directive',
        "res.header('Access-Control-Allow-Origin', req.headers.origin)",
        'Echo untrusted origins only after validating allowlists.',
      ),
      api(
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Methods: GET,POST,OPTIONS',
        'Lists verbs allowed beyond simple requests.',
        'comma verbs',
        'preflight acknowledgement',
        "res.header('Access-Control-Allow-Methods','GET,POST,PUT,PATCH');",
        'OPTIONS handler must enumerate superset covering actual endpoints.',
      ),
      api(
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Headers: Authorization, Content-Type',
        'Permits non-safelisted request headers.',
        'header tokens',
        'preflight acknowledgement',
        "Allow extra client headers dynamically but safely",
        'Wildcard support limited when credentials=true.',
      ),
      api(
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Credentials: true',
        'Signals browsers may expose credentialed responses to JS.',
        '`true|false` literal',
        'credential policy',
        "res.header('Access-Control-Allow-Credentials','true');",
        'Must pair concrete ACAO—not `*`.',
      ),
      api(
        'Vary usage with ACAO?',
        'Vary: Origin',
        'Ensures CDN caches individualized ACAO payloads per caller origin.',
        'vary tokens',
        'cache key widening',
        "res.header('Vary','Origin');",
        'Forgetting causes leaks across tenants behind shared cache PoPs.',
      ),
    ],
    refs: [
      ref('MDN CORS guide', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'),
      ref('Fetch spec security section', 'https://fetch.spec.whatwg.org/#http-cors-protocol'),
      ref('Evil Tester CORS cheatsheet', 'https://www.eviltester.com/sitemap/guides/cheat/sheets/access-control/'),
      ref('Chrome network internals blog', 'https://developer.chrome.com/blog/private-network-access-update'),
    ],
    relatedProjectIds: [],
  });
  skills.push(corsSkill);
  pushSubs(
    skills,
    corsSkill,
    [
      'Same-origin policy primitives',
      'Simple vs preflight flows',
      'ACA* response directives',
      'Wildcards, credentials & Vary pitfalls',
      'Common breakage patterns',
    ],
    [
      'Origins constrain reading responses—not banning server receipt of requests (CSRF is separate mitigation).',
      'Preflight uses OPTIONS + ACA headers mirroring eventual real request allowances.',
      'Expose/List headers gate developer ergonomics/security.',
      'Credential toggles interplay with wildcard bans + cookies.',
      'Reverse proxies unintentionally collapsing headers cause mystifying SPA failures.',
    ],
    [
      "const origin = new URL(import.meta.env.VITE_APP_URL).origin;",
      '// DevTools labels preflight OPTIONS distinct from coloured actual request row',
      "res.set({ 'Access-Control-Expose-Headers': 'X-Trace-Id' });",
      "const reflect = ALLOW.has(origin) ? origin : 'null'; res.setHeader('Access-Control-Allow-Origin', reflect);",
      '// Symptom: opaque response.body — correlate DevTools ACAO+Vary versus Cache layers',
    ],
    [
      [
        card(
          'File:// origin weirdness?',
          'Local file URLs yield opaque origins blocking standard SPA patterns unless local dev servers provide real HTTPS origins.',
        ),
      ],
      [
        card(
          'Why must OPTIONS return quickly?',
          'Browsers block the real HTTP request until preflight settles—timeouts present as flaky cross-env bugs.',
        ),
      ],
      [
        card(
          'Wildcard subdomain traps?',
          'Each subdomain differs by origin—you must whitelist explicitly or programmatically—not DNS-style globbing.',
        ),
      ],
      [
        card(
          'How do CDNs worsen CORS mistakes?',
          'Stale `Access-Control-*` payloads cached wrong way leak headers across callers unless `Vary: Origin`.',
        ),
      ],
      [
        card(
          'Duplicate ACAO headers at proxies?',
          'Behaviour undefined across browsers—terminate with single authoritative ACAO/Vary pairing at edge.',
        ),
      ],
    ],
  );

  const tlsSsl = mk('TLS / SSL', 'internet', null, {
    notes:
      'Handshake nuance complements Performance → Network Performance (session resume / 0-RTT); details stay here.',
    definition:
      'Transport Layer Security (TLS, historically referenced alongside “SSL”) authenticates endpoints, negotiates cryptographic master secrets during the handshake, and encrypts payloads with AEAD symmetric ciphers. HTTPS is HTTP routed through TLS records; classic stacks use TLS over TCP, while HTTP/3 combines QUIC (UDP-based) with TLS 1.3.',
    codeExample:
      "openssl s_client -connect example.com:443 -servername example.com -tls1_3 <<<''\nopenssl x509 -in cert.pem -noout -text\n",
    whenUsed:
      'Certificate issuance/rotation, diagnosing mixed-content, configuring HSTS, evaluating pinning, prepping HTTP/3, debugging mobile captive portals.',
    gotchas:
      'Weak legacy cipher suites disabled by browsers; insecure renegotiation; incomplete chains; misplaced trust anchors; interception proxies violating expectations.',
    flashcards: [
      card(
        'TLS 1.3 handshake efficiency vs TLS 1.2?',
        'Reduced round trips, forbids insecure primitives like static RSA key transport, mandates forward secrecy by default.',
      ),
      card(
        'Why AEAD symmetric ciphers after handshake?',
        'Bulk throughput needs fast symmetric cryptography while handshake bootstrapped slower asymmetric math.',
      ),
      card(
        'Forward secrecy implication?',
        'Captured ciphertext cannot decrypt later if ephemeral keys destroyed—even if RSA cert leaked later.',
      ),
      card(
        'Risk of sloppy certificate pinning?',
        'Legitimate breakage during incidents / rotation—prefer CT monitoring plus fast automation versus naive pin lists.',
      ),
      card(
        'Why automate ACME?',
        'Short-lived certificates shrink blast radius of key compromise—but misconfigured renewal quietly bricks sites.',
      ),
      card(
        'Session ticket vs session ID resumption?',
        'Both amortize handshakes; tickets move statelessness burden server-side securely—replay considerations remain.',
      ),
      card(
        '0-RTT data caveats?',
        'Replay amplification against non-idempotent endpoints—guard with replay caches or disallow sensitive verbs.',
      ),
      card(
        'Corporate TLS interception fallout?',
        'Custom roots let proxies terminate TLS breaking strict pinning assumptions—coordinate mobile fleet trust.',
      ),
    ],
    apis: [
      api(
        'openssl s_client',
        'openssl s_client -connect host:443 -servername sni.host',
        'Interactive probe printing negotiated cipher + chain visibility.',
        'host:port tls flags',
        'handshake transcript',
        "openssl s_client -connect gateway:443 -showcerts",
        'Stdout may include sensitive session identifiers—sanitize shared logs.',
      ),
      api(
        'openssl x509',
        'openssl x509 -in cert.pem -text -noout',
        'Human-readable SANs/expiry/key usage inspection.',
        'PEM-encoded cert paths',
        'diagnostic stdout',
        "openssl verify -partial_chain -trusted CA.pem site.pem",
        'Verify path issues mirror intermittent mobile browser mistrust.',
      ),
      api(
        'Strict-Transport-Security',
        'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        'Forces browser-only HTTPS retries for scoped host coverage.',
        'max-age directive flags',
        'browser policy bucket',
        "res.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');",
        'preload mistakes long-lived—triple-check apex coverage before inclusion.',
      ),
      api(
        'certbot',
        'certbot certonly --dns-cloudflare --dns-propagation seconds 120 -d "*.example.net"',
        "Automates ACME issuance/renew cycles with DNS-01 for wildcards.",
        'provider plugin hooks',
        'PEM material paths',
        'sudo certbot renew --dry-run',
        'Propagate TTL delays cause false renewal failures.',
      ),
    ],
    refs: [
      ref('Mozilla TLS primer', 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security'),
      ref('RFC 8446 TLS 1.3', 'https://datatracker.ietf.org/doc/html/rfc8446'),
      ref('SSL Labs test', 'https://www.ssllabs.com/ssltest/'),
      ref("Let's Encrypt documentation", 'https://letsencrypt.org/getting-started'),
    ],
    relatedProjectIds: [],
  });
  skills.push(tlsSsl);
  pushSubs(
    skills,
    tlsSsl,
    ['Handshake milestones', 'Chains of trust', 'Cipher suites posture', 'HSTS & pinning tradeoffs'],
    [
      'ClientHello/ServerHello, key agreement, Finished messages authenticate transcript.',
      'Leaf + intermediate anchors + optional stapled OCSP responses.',
      'Prefer AEAD ECDHE suites; disable fossils (RC4, 3DES).',
      'HSTS preload vs pinning—operational playbook required before toggling.',
    ],
    [
      "openssl s_client -tls1_3 -brief -connect svc:443 <<<''",
      "openssl crl2pkcs7 ... | openssl pkcs7 -print_certs\n# inspecting chain completeness",
      "ssl_conf = ssl_sect\n…\nCipherString = ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-CHACHA20-POLY1305",
      "add_header Strict-Transport-Security \"$hsts_policy\" always;",
    ],
    [
      [
        card(
          'What does Finished message prove?',
          'Both sides hashed transcript matches—detects downgrade/injection adversaries.',
        ),
        card(
          'OCSP staple benefit?',
          'Avoids realtime OCSP lookups for clients tightening privacy + handshake latency.',
        ),
      ],
      [
        card(
          'Why SAN supersedes CN intuition?',
          'Validators insist matching Subject Alternative Name entries—legacy CN mismatch fails modern stacks.',
        ),
      ],
      [
        card(
          'TLS false start history?',
          'Optimization mostly obsolete post TLS1.3—studying legacy behaviour still helps archaeology traffic.',
        ),
      ],
      [
        card(
          'Preload removals painful why?',
          'Browsers honour max-age aggressively—coordinate HSTS downgrade windows + communication.',
        ),
      ],
    ],
  );

  const tcpUdp = mk('TCP / UDP', 'internet', null, {
    definition:
      'TCP exposes a reliable ordered byte stream with congestion-aware retransmits over IP; UDP sends connectionless datagrams leaving ordering/loss remediation to apps—QUIC reshapes UX by marrying UDP carriage with QUIC-layer reliability.',
    codeExample:
      "nc -vz db.internal 5432\niperf3 -c bench.example -u -b 200M\n",
    whenUsed:
      'Selecting transports (HTTP over TCP vs QUIC UDP), diagnosing tail latency spikes, configuring load balancers/firewalls for WebSockets & WebRTC, capacity planning egress.',
    gotchas:
      'TIME_WAIT explosions, asymmetric routing, QUIC UDP blocking middleboxes, PMTUD black holes impacting UDP payloads.',
    flashcards: [
      card(
        'Three-way handshake purpose?',
        'Synchronize sequence numbers + window sizing so both endpoints agree initial state.',
      ),
      card(
        'TCP head-of-line blocking vs QUIC streams?',
        'Single TCP reordering stalls unrelated bytes HoL QUIC isolates logical streams despite shared connection.',
      ),
      card(
        'UDP sweet spots?',
        'Low-latency voice/video RTP, QUIC, SNMP-style probes tolerant of sporadic drops.',
      ),
      card(
        'SYN flood defenses?',
        'SYN cookies amortize allocating full socket state until handshake completes legitimacy.',
      ),
      card(
        'Why WebSockets rides TCP?',
        'Needs reliable duplex framing semantics—inherits TCP backoff behaviour.',
      ),
      card(
        'QUIC connection migration?',
        'Connection IDs decouple endpoints from IP churn helping mobile radios—still debated operator policies.',
      ),
      card(
        'Port starvation symptoms?',
        'Ephemeral exhaustion causing `EADDRNOTAVAIL` on proxies bursting short-lived connections.',
      ),
      card(
        'ICMP black hole impact?',
        'PMTUD silently fails yielding hung giant UDP datagram transfers until MSS clamp intervenes.',
      ),
    ],
    apis: [
      api(
        'ss',
        'ss -ltnp src :443',
        'Lists sockets with timers + processes—replacement for netstat.',
        'BPF-like filters strings',
        'tabular output',
        "ss -i dst 10.42.15.88 dport = :redis",
        'Need elevated privileges mapping PIDs reliably.',
      ),
      api(
        'tcpdump BPF',
        "tcpdump -nn 'tcp port 443 and (((ip[12:4]<<3)&0xFFFF)==0)'",
        'Packet captures for incident forensics respecting privacy policies.',
        'BPF expression',
        'pcap traces',
        "tcpdump -nn udp port 3478",
        'Large captures risk PII leakage—scrub artefacts.',
      ),
      api(
        'iperf3 UDP mode',
        'iperf3 -c host -u -b 350M --get-server-output',
        'Synthetic UDP bandwidth + jitter quantification baseline.',
        'bitrate knobs',
        'JSON metrics',
        'iperf3 -s -p 5201',
        'Firewall asymmetry biases results.',
      ),
    ],
    refs: [
      ref('Beej sockets guide intro', 'https://beej.us/guide/bgnet/html/split/overview.html'),
      ref('RFC 9293 TCP', 'https://datatracker.ietf.org/doc/html/rfc9293'),
      ref('RFC 9000 QUIC', 'https://datatracker.ietf.org/doc/html/rfc9000'),
      ref('Mozilla WebRTC protocols', 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols'),
    ],
    relatedProjectIds: [],
  });
  skills.push(tcpUdp);
  pushSubs(
    skills,
    tcpUdp,
    [
      'Reliability internals',
      'Congestion interplay',
      'UDP tradeoffs',
      'Transport selection playbook',
      'HoL contrasts',
    ],
    [
      'ACK clocking sequence numbers selectively retransmit loss.',
      'Reno/CUBIC/BBR sculpt throughput vs jitter—simulate with `tc netem`.',
      'Prefer app-level FEC when loss acceptable vs latency unbearable.',
      'Transactional APIs vs realtime media dictate protocol families.',
      'HTTP/2 multiplex solved application HoL QUIC finishes transport angle.',
    ],
    [
      "sysctl net.ipv4.tcp_tw_reuse # historical tuning—audit kernel guidance before applying",
      "tc qdisc add dev eth0 root netem delay 120ms loss 5%",
      "// Voice prefers UDP jitter buffers over TCP backoff tail latency spikes",
      "// Microservice east-west chatter often QUIC-unaware behind L4 LB still",
      'Compare QUIC stream independence vs TLS record sizing coupling',
    ],
    [
      [
        card(
          'Delayed ACK × Nagle interaction?',
          `Tiny interactive packets linger—tune tcp_nodelay for latency-sensitive consoles`,
        ),
      ],
      [
        card(
          'BBR caveat?',
          'Can appear unfair to coexistence workloads—coordinate multi-tenant infra fairness policies.',
        ),
      ],
      [
        card(
          'DNS UDP fallback TCP?',
          'Truncated UDP responses escalate TCP carrying identical query—explain intermittent slowness.',
        ),
      ],
      [
        card(
          'Choosing QUIC yet blocking UDP 443?',
          'Middleboxes degrade to TCP—measure real user uplift not synthetic lab optimism.',
        ),
      ],
      [
        card(
          'Head-of-line at HTTP layer post multiplex?',
          `Single QUIC connection still multiplexes logically—priorities/window updates necessary`,
        ),
      ],
    ],
  );

  const loadBalancing = mk('Load Balancing', 'internet', null, {
    definition:
      'Load balancers spread sessions across backends using deterministic or adaptive algorithms while guarding health via probes and graceful draining—layer-4 proxies entire flows while layer-7 understands HTTP semantics for richer routing.',
    codeExample:
      "upstream app {\n  least_conn;\n  server pod-a:8080 weight=5;\n  server pod-b:8080 backup;\n  keepalive 32;\n}\n",
    whenUsed:
      'Blue/green cutovers, canary ramps, websocket fan-out, TLS termination offload, enforcing global rate shaping.',
    gotchas:
      'Stale health checks hide brownouts sticky cookies misaligned autoscaling QUIC/L4 interplay surprises.',
    flashcards: [
      card(
        'Why least-connections beats naive RR on long tails?',
        'Skews away overloaded nodes holding expensive in-flight GRPC streams.',
      ),
      card(
        'SYN proxy vs full TCP proxy?',
        'SYN absorption accelerates handshake without retaining entire connection state upfront.',
      ),
      card(
        'Health check path realism?',
        'Synthetic `/health` returning 200 while DB degraded lies—probe dependencies explicitly.',
      ),
      card(
        'Why drain overlap matters?',
        'SIGTERM pods must linger until LB weight zeros so client retries converge elsewhere.',
      ),
      card(
        'Anycast vs GeoDNS steering?',
        'Anycast uses BGP locality; GeoDNS leverages resolver geography + weighted records.',
      ),
      card(
        'Sticky session downsides?',
        'Hot tenants pin to overloaded shards breaking smooth spreading—prefer externalised session.',
      ),
      card(
        'EWMA/smoothed observables?',
        'Rolling latency feedback fine-tunes weighting vs simplistic static integers.',
      ),
      card(
        'Envoy locality weighting payoff?',
        'Prioritizes same-zone endpoints trimming cross-AZ chatter spend.',
      ),
    ],
    apis: [
      api(
        'nginx upstream',
        'upstream backend { zone upstream_zone 256k; least_conn;\nserver 10.0.0.1:8080 resolve;\n}\nproxy_pass http://backend;',
        'Composable balancing policies + DNS re-resolve knobs.',
        'method keywords + pools',
        'named upstream bucket',
        "proxy_http_version 1.1;\nproxy_set_header Connection '';",
        'Without keepalive multiplex you recreate TCP unnecessarily.',
      ),
      api(
        'HAProxy server template',
        'server app@@socat.docker 10.11.44.@@:8443 ssl verify required sni svc.check inter 2s rise 2 fall 3',
        'Rich inline health intervals + TLS client params.',
        'address template tokens',
        'backend slot',
        "balance hdr(X-Tenant-ID)",
        'Complex ACL sprawl hurts readability—generate from structured manifests.',
      ),
      api(
        'AWS register-targets',
        'aws elbv2 register-targets --target-group-arn tg --targets Id=i-abcd',
        'ALB NLB memberships attach IPs / instance IDs dynamically.',
        'ARN payloads',
        'API JSON statuses',
        "aws elbv2 describe-target-health --target-group-arn tg --query 'length(TargetHealthStatuses)' ",
        `HTTP health checks mishitting GraphQL POST surface cause flapping.`,
      ),
    ],
    refs: [
      ref('nginx load balancing', 'https://nginx.org/en/docs/http/load_balancing.html'),
      ref('HAProxy intro', 'https://www.haproxy.org/documentation/haproxy/en/latest/introduction.html'),
      ref('AWS ELB guide', 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html'),
      ref('GCP LB overview', 'https://cloud.google.com/load-balancing/docs/load-balancing-overview'),
      ref('Cloudflare LB learning', 'https://www.cloudflare.com/learning/performance/what-is-load-balancing'),
    ],
    relatedProjectIds: [],
  });
  skills.push(loadBalancing);
  pushSubs(
    skills,
    loadBalancing,
    [
      'Layer 4 vs layer 7',
      'Algorithms & EWMA hybrids',
      'Health probing strategies',
      'Sticky sessions realistically',
      'Implementation landscape',
    ],
    [
      'NLB style TCP vs HTTP path aware ALB Envoy programmable data plane hybrids.',
      'Round robin naive vs least connections vs consistent hashing keyed traffic.',
      'Active synthetic checks vs passive LB observability + outlier detection.',
      'Cookies IP-hash JWT pinning—prefer external session stores wherever viable.',
      'nginx HAProxy Envoy cloud managed load balancers differ on observability/control planes.',
    ],
    [
      "stream {\n proxy_pass srvs;\n upstream srvs {\n ip_hash;\n }\n }",
      '// Kubernetes readiness gate must subtract pod before terminating connections',
      "curl --fail-fast http://10.54.33.21:9876/actuator/health",
      '// Cloudflare LB steering vs CDN cache interplay',
      '// Compare EWMA Envoy outlier_detection vs simplistic max_fails',
    ],
    [
      [
        card(
          'NAT pools vs IP-hash?',
          'Huge shared NAT pools collapse hashing diversity—skew loads oddly.',
        ),
      ],
      [
        card(
          'Why passive-only checks brittle?',
          'Idle nodes never receive probes yet cannot serve eventual spike traffic confidently.',
        ),
      ],
      [
        card(
          'Blue/green for websockets?',
          'Need cooperative draining because abrupt resets flood reconnect storms.',
        ),
      ],
      [
        card(
          'Cross-zone data charges?',
          'Multi-subnet backends behind naïve round robin hemorrhage egress—locality matters.',
        ),
      ],
      [
        card(
          'Hardware vs software LB choice?',
          'Hardware saturates NIC offload software flexible but CPU heavy under microburst QUIC.',
        ),
      ],
    ],
  );

  const cdnSkill = mk('CDN', 'internet', null, {
    notes:
      'Performance skills reference CDN purely as latency tool; authoritative invalidation/origin coupling remains here.',
    definition:
      'Content Delivery Networks terminate traffic closer to viewers via geographically distributed POPs caches reverse-proxying HTTPS optionally shielding brittle origins accelerating static assets personalization increasingly extended by edge compute workers.',
    codeExample:
      "curl -I https://cdn.example/app/main~ab12.chunk.js |\nawk 'BEGIN{IGNORECASE=1}/cache-control:|age:|cdn-cache-control:/'\n",
    whenUsed:
      'Burst traffic absorption global latency wins signed URL offload media streaming ISR-style HTML interplay.',
    gotchas:
      'Accidentally caching authenticated HTML TTL chaos during partial deploy QUIC-only edges blocked corporate networks.',
    flashcards: [
      card(
        'Anycast vs DNS steering contrast?',
        'Anycast uses BGP locality DNS uses resolver weighted records—observe traceroute divergence.',
      ),
      card(
        'Origin shield layering benefit?',
      'Caches shield origin from MISS stampedes POP churn invalidations thrash backends.',
      ),
      card(
        'Soft purge vs hard purge?',
        'Soft may keep stale-but-fresh-behind-scenes hard flush risks thundering herds unless warmed.',
      ),
      card(
        'Why fingerprint filenames?',
      'Lets `immutable`/`max-age=31536000` safely accelerate cache hits without staleness nightmares.',
      ),
      card(
        'Edge KV vs relational stores?',
      'KV storage is great for edge config, flags, and small lookup data. If you are doing relational writes, joins, or transactional workflows in KV, the architecture likely belongs in a database instead.',
      ),
      card(
        'Multi CDN pitfalls?',
      'Certs must exist per edge TLS automation drift misaligned steering causes flaky SNI mismatches.',
      ),
      card(
        'Compliance residency nuance?',
      'Edge crossing borders inadvertently may violate GDPR style requirements audit POP maps.',
      ),
      card(
        'ESI legacy notes?',
      'HTML fragment stitching largely replaced SSR streaming disciplined cache headers programmable edges.',
      ),
    ],
    apis: [
      api(
        'Cloudflare purge URLs',
      "curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE/purge_cache \\ -H \"Authorization: Bearer $CF_TOKEN\" \\ -d '{ \"files\":[ \"https://cdn.example/asset.js\"] }'",
      'Per asset bust leveraging API tokens.',
      'zone id payloads',
      'JSON results',
      'watch rate limits backoff exponentially',
      'Wildcard purges propagate slowly hugging SLA edges.',
      ),
      api(
        'Fastly surrogate keys',
      `curl -X POST https://api.fastly.com/service/$SID/purge -H "Fastly-Key: $K" \\ -d '{ "surrogate_keys":"pricing EUR" }'`,
      'Map logical keys emitted via `Surrogate-Key` responses for grouped busts.',
      'service id surrogate tokens',
      'purge confirmation',
      "Surrogate-Key: product/9281 cohort/eu",
      'Forgetting surrogate emission blocks targeted busting.',
      ),
      api(
        'CloudFront invalidation',
      'aws cloudfront create-invalidation --distribution-id DIST --paths "/app/*"',
      'Expensive prefers hashed assets to minimize churn.',
      'ARN path patterns',
      'invalidation ids',
      '# combine with CI release markers',
      'Large path glob invalidations degrade deploy velocity.',
      ),
    ],
    refs: [
      ref('Cloudflare CDN intro', 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/'),
      ref('AWS CloudFront guide', 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html'),
      ref('Fastly caching fundamentals', 'https://docs.fastly.com/en/guides/concepts/how-cdns-work'),
      ref('RFC 9213 targeted cache control', 'https://datatracker.ietf.org/doc/html/rfc9213'),
      ref('Vercel edge overview', 'https://vercel.com/docs/building-your-application/deploying/multi-tenant'),
    ],
    relatedProjectIds: [],
  });
  skills.push(cdnSkill);
  pushSubs(
    skills,
    cdnSkill,
    [
      'POP + anycast anatomy',
      'Invalidation playbook',
      'Origin shields',
      'Provider comparisons',
      'Static vs personalised edge',
    ],
    [
      'TLS termination + PoP locality reduces RTT jitter.',
      'Hash bust surrogate keys CDN-Cache-Control targeted directives.',
      'Mid-tier shields absorb thunder when POP churn frequent.',
      'Cloudflare Fastly CloudFront Front Vercel programmable edges differ quotas.',
      'Personalised SSR requires `private` keyed caches—not shared defaults.',
    ],
    [
      "dig cdn.host +tcp | rg 'IN\\sA'",
      "Surrogate-Key: offers/black-friday CDN-Cache-Control: stale-if-error=120",
      '// Origin concurrency limits choose shield vs naked origin explicitly',
      '// Compare Wasm edge budgets vs centralized lambdas realistically',
      "res.header('CDN-Cache-Control','max-age=60, stale-while-revalidate=120');",
    ],
    [
      [
        card(
          'Stale personalised cached HTML risk?',
          'Same URL differentiated only by Cookie yet cached publicly leaks tenant data nightmares.',
        ),
      ],
      [
        card(
          'Why warm after purge?',
          'Cold MISS storms hammer origin CPU—queue deterministic warm probes.',
        ),
      ],
      [
        card(
          'Shield extra latency possibility?',
          'Additional hop lengthens handshake—measure baseline before layering blindly.',
        ),
      ],
      [
        card(
          'Programmable CDN limits?',
          'CPU wall clocks constrain heavy transforms—fallback to centralized workers.',
        ),
      ],
      [
        card(
          'HTTP3 QUIC blockage?',
          'Some networks filter UDP forcing TCP degradation—observe CrUX deltas not lab-only.',
        ),
      ],
    ],
  );

  const httpCachingSkill = mk('Caching (browser + HTTP)', 'internet', null, {
    notes:
      'Perf → Caching Strategies focuses on TanStack Query / SWR / SW patterns; verb-level headers + browser tiers stay here.',
    definition:
      'HTTP caches (browser memory/disk intermediary CDNs proxies) cooperate via `Cache-Control` `ETag` `Vary` validators Age headers stale-extension directives deterministic busting fingerprints plus browser Back-Forward caches Service Worker interception mentioned only where it wraps fetch.',
    codeExample:
      "exports.headers = {\n 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',\n};",
    whenUsed:
      'SSR/ISR pages static asset fingerprinting diagnosing DevTools freshness contradictions guarding authenticated responses.',
    gotchas:
      '`Cache-Control` misreadings abound `immutable` worthless without hashing `Vary` misuse blows cardinality BFCache quirks.',
    flashcards: [
      card(
        '`private` directive intent?',
      'Keeps caches off shared intermediaries guarding personalised payloads.',
      ),
      card(
        '`s-maxage` vs `max-age` split?',
      'Shared caches honour `s-maxage` tighter leash personal browsers optionally longer/shorter interplay.',
      ),
      card(
        '304 vs 200 interplay?',
      'Validators allow cheap no-body confirmations keeping cached entries fresh logically.',
      ),
      card(
        'Why layered caches matter?',
      'Memory warm hits cost microseconds disk hits microseconds-milliseconds BFCache instantaneous navigation resume.',
      ),
      card(
        'Service Worker mention succinctly?',
      'May override network stack offline layer—still interplay with upstream headers unless bypassed purposely.',
      ),
      card(
        'BFCache disqualifiers?', 
      'Unload listeners lingering timers media complexity may evict disqualify careful audit.',
      ),
      card(
        'Cache bust misuse query strings?', 
      'Fingerprint filenames beat `?cachebust=`—CDNs reuse identical payloads cross tenants easier.',
      ),
      card(
        'stale-if-error humane angle?',
      'During origin outage responsibly serve tolerant stale artefacts monitor ethics.',
      ),
    ],
    apis: [
      api(
        'Cache-Control composite',
      "Cache-Control: public, max-age=0, stale-while-revalidate=86400",
      'Blends CDN browser behaviour via layered directives.',
      'comma-separated tokens',
      'response header',
      "res.sendFile(file,{ headers:{ 'Cache-Control':'public,max-age=31536000,immutable'}}); ",
      '`no-store` vs `no-cache` confusion rampant—explicit training required.',
      ),
      api(
        'ETag + If-None-Match',
      'If-None-Match: W/"v3-aa11"',
      'Weak vs strong comparison semantics matter concurrency.',
      'validator tokens list',
      '304 body optional',
      "const etag = await sha1(payload);",
      `Hashing gigantic buffers synchronously stalls event loop.`,
      ),
      api(
        'Vary explosions',
      'Vary: Accept-Encoding, Cookie',
      'Enumerates axes distinguishing cache partitions.',
      'header names comma list',
      'cache key factorial growth',
      "res.header('Cache-Control','private'); res.header('Vary','Cookie'); ",
      '`Vary:*` forbids caching—almost always unintended.',
      ),
      api(
        'Age freshness math',
      'Age: 17 + max-age interplay',
      'Explains TTL remaining through downstream caches diagnosing drift.',
      'seconds integer',
      'debug mental model',
      "curl -sI https://static/app.js | egrep -i 'age:|cache-control:'",
      'Large Age with microscopic max-age flags miswired origin directives.',
      ),
    ],
    refs: [
      ref('web.dev caching', 'https://web.dev/learn/performance/module-13-caching/'),
      ref('MDN Cache-Control reference', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control'),
      ref('RFC 5861 stale controls', 'https://datatracker.ietf.org/doc/html/rfc5861'),
      ref('RFC 9213 targeted cache control', 'https://datatracker.ietf.org/doc/html/rfc9213'),
    ],
    relatedProjectIds: [],
  });
  skills.push(httpCachingSkill);
  pushSubs(
    skills,
    httpCachingSkill,
    [
      'Directive vocabulary',
      'Validation interplay',
      'Browser cache tiers BFCache',
      'Stale knobs',
      'Busting fingerprints',
    ],
    [
      'Master `immutable` stale-while-revalidate must-revalidate nuance accurately.',
      'Pair `ETag`s with serializers stable cheap.',
      'Memory-disk-service worker interplay plus BFCache restorations resurrect timers.',
      'SWR bridging quick paint vs eventual freshness promise handling.',
      'Content hashing names enable safe infinite TTL.',
    ],
    [
      "grep -n 'Cache-Control' -R infra/nginx",
      `curl --compressed -v -H 'If-None-Match: abc' https://svc/data`,
      "window.addEventListener('pageshow',ev=>console.log(ev.persisted))",
      '// configure CDN-Cache-Control targeted separately from UA Cache-Control selectively',
      "const hashed = `/static/vendor.${buildHash}.js`;",
    ],
    [
      [
        card(
          'Danger `Vary: Authorization` naively?',
          'Explodes cardinality per token—prefer split routes or keyed caches.',
        ),
      ],
      [
        card(
          '304 body expectations?',
          'Should carry no entity body yet clients hydrate from caches carefully.',
        ),
      ],
      [
        card(
          'BFCache + timers?',
          'Restored snapshots replay timers watchers—must idempotent teardown setup.',
        ),
      ],
      [
        card(
          'stale-if-error ethically?',
          'Serving stale transactional states misleads traders—observe domain nuance.',
        ),
      ],
      [
        card(
          'immutable mis-deploy?',
          'Users stuck indefinitely until clearing site data—coordinate release switches.',
        ),
      ],
    ],
  );

  const webrtcBasics = mk('WebRTC basics', 'internet', null, {
    definition:
      'WebRTC wires realtime communications between browsers/apps using RTCPeerConnection orchestrating ICE candidate discovery SDP offer/answer exchange STUN reflexive punching TURN relay fallback optionally RTCDataChannels for unstructured payloads.',
    codeExample:
      "const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.services.mozilla.com:3478' }] });\nconst ch = pc.createDataChannel('metrics',{ ordered:false, maxPacketLifeTime:200 });\n",
    whenUsed:
      'Video conferencing telemetry streaming gaming-adjacent features bridging native SIP worlds cautiously.',
    gotchas:
      'Codec SDP negotiation nightmares symmetric NAT breakage silent black feeds mobile thermal throttling heavy encoders.',
    flashcards: [
      card(
        'Why SDP offers/answers serialised?', 
      'Stateful machine forbids malformed transitions signalling server must correlate IDs.',
      ),
      card(
        'Purpose STUN?', 
      'Determines reflexive NAT mapped addresses enabling direct candidates.',
      ),
      card(
        'Purpose TURN?',
      'Relays payloads when symmetric NAT forbids punching costlier bandwidth billed.',
      ),
      card(
        'ICE nomination completion?', 
      'Chooses workable candidate pairs subject to continual network mobility.',
      ),
      card(
        'Why permissions gating?', 
      'Mitigates drive-by microphone capture aligns autoplay restrictions.',
      ),
      card(
        'Simulcast vs layering?',
      'Adaptive encode layers degrade gracefully watchers bandwidth variance.',
      ),
      card(
        'DataChannel unordered mode?',
      'Mimics lossy realtime telemetry preferring freshest samples over staleness guarantees.',
      ),
      card(
        'Headless testing hack?',
      'Fake media devices CLI flags unblock CI sparingly—they mask real UX.',
      ),
    ],
    apis: [
      api(
        'RTCPeerConnection',
      'new RTCPeerConnection({ iceServers, iceTransportPolicy })',
      'Orchestrates transport media datachannels stats APIs.',
      'RTCConfiguration dictionary',
      'live connection reference',
      "pc.addEventListener('iceconnectionstatechange', log); ",
      '`close()` when done lest ICE timers leak indefinitely.',
      ),
      api(
        'getUserMedia',
      'await navigator.mediaDevices.getUserMedia({ audio:true,video:{ frameRate:{ ideal:30 }}})',
      'Acquires labelled MediaStreams after user gesture allowances.',
      'constraint objects',
      'MediaStreamPromise',
      "await navigator.mediaDevices.getDisplayMedia({ video:true });",
      'Fails on insecure origins—enforce HTTPS localhost exceptions specific.',
      ),
      api(
        'RTCDataChannel',
      "pc.createDataChannel('signals',{ ordered:false, maxRetransmits:0 });",
      'Transports opaque binary payloads with negotiated reliability semantics.',
      'label/options dictionary',
      'RTCDataChannel instance',
      "channel.binaryType='arraybuffer'; channel.send(buf); ",
      '`bufferedAmountLowThreshold` interplay prevents starvation.',
      ),
      api(
        'RTCSessionDescription',
      `await pc.setRemoteDescription(new RTCSessionDescription(signalPayload)); `,
      'Applies SDP from remote signalling channel maintaining state coherence.',
      'type string + sdp string',
      'void promise',
      "await pc.createAnswer(); ",
      `Rollback SDP transitions require signalling cooperation—mistakes spam errors.`,
      ),
      api(
        'RTCIceCandidate',
      "pc.onicecandidate = evt => evt.candidate && send(JSON.stringify(evt.candidate.toJSON()));",
      'Incremental trickle candidates expedite handshake completion latency.',
      'candidate JSON fragments',
      'signalling wire format',
      "send(JSON.stringify({ type:'candidate', candidate })); ",
      `'null' sentinel indicates gathering complete.`,
      ),
    ],
    refs: [
      ref('MDN WebRTC reference', 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API'),
      ref('webrtc.org overview', 'https://webrtc.org/getting-started/overview'),
      ref('RFC 8839 ICE', 'https://datatracker.ietf.org/doc/html/rfc8839'),
      ref('webrtcforthecurious', 'https://webrtcforthecurious.com/docs/introduction/'),
    ],
    relatedProjectIds: [],
  });
  skills.push(webrtcBasics);
  pushSubs(
    skills,
    webrtcBasics,
    [
      'Offer/answer flow',
      'STUN & TURN',
      'SDP contents',
      'ICE trickle',
      'MediaStream ergonomics',
      'DataChannel payloads',
    ],
    [
      'Signalling channel bootstraps WebRTC—not itself standard defined flexible.',
      'STUN cheap discovery TURN paid reliability fallback synergy.',
      'SDP enumerates fingerprints codecs bundle policies—opaque but dissectible.',
      'Trickle lowers time-to-connect vs monolithic SDP blob exchange.',
      'Track lifecycle manage permissions UI degrade gracefully degrade CPU.',
      'Binary telemetry demands buffer backpressure mindfulness.',
    ],
    [
      "socket.emit('signal',{ type:'offer', sdp:offer.sdp })",
      "const turn = { urls:'turn:turn.example:3478', username: user, credential: pass }; ",
      'a=rtpmap:111 opus/48000',
      `pc.onicecandidate = evt => signaling.sendIce(evt.candidate)`,
      "stream.getTracks().forEach(track=> pc.addTrack(track, stream))",
      '// monitor channel.readyState transitions before spamming buffers',
    ],
    [
      [
        card(
          'Renegotiation triggers?', 
          'Adding tracks toggling codecs simulcast toggles SDP again—coordinate polite renegotiations.',
        ),
      ],
      [
        card(
          'Symmetric NAT behaviour?',
          'Changes mapping per destination punching fails—relay via TURN.',
        ),
      ],
      [
        card(
          'Bundle-only transport risks?',
          'Shared connection couples failure blast radius consciously accept tradeoff.',
        ),
      ],
      [
        card(
          'ICE restart?', 
          'Reboots connectivity post network flap faster than teardown entire PC.',
        ),
      ],
      [
        card(
          'Prefer stop vs enabled false?',
          'stop releases hardware captures saving battery mute merely silences amplitude.',
        ),
      ],
      [
        card(
          'BufferedAmount monitoring?',
          'Detect backpressure backlog before overflowing channel causing silent stalls.',
        ),
      ],
    ],
  );

  return skills;
}
