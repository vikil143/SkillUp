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
  mistakes,
  followUps,
  difficulty,
  tags,
}) => `### Short Interview Answer
${short}

### Detailed Explanation
${detail}

### Real World Example
${example}

### Practical Example
${example}

### Why Interviewers Ask This Question
Interviewers ask this to check whether you can connect networking fundamentals to real application behavior, debugging, security, and production trade-offs.

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

const addUniqueCards = (skill, cards, globalQuestions) => {
  const localQuestions = new Set((skill.flashcards || []).map((item) => normalizeQuestion(item.q)));
  cards.forEach((item) => {
    const key = normalizeQuestion(item.q);
    if (!localQuestions.has(key) && !globalQuestions.has(key)) {
      skill.flashcards.push(item);
      localQuestions.add(key);
      globalQuestions.add(key);
    }
  });
};

const basicCards = [
  qa('What is a computer network?', {
    short:
      'A computer network is a group of devices connected so they can exchange data, share resources, and communicate using agreed protocols.',
    detail:
      'Networks connect clients, servers, routers, switches, and other systems through wired or wireless links. Communication is broken into structured messages or packets, addressed to destinations, and delivered by layers of hardware and software. Networks can be small like a home LAN or global like the Internet.',
    example:
      'A React Native app, an API server, a database host, and a CDN edge are all networked systems that exchange requests, responses, and telemetry.',
    mistakes: [
      'Thinking a network only means the public Internet.',
      'Ignoring switches, routers, DNS, and firewalls in real traffic paths.',
      'Confusing physical connectivity with successful application communication.',
    ],
    followUps: [
      'What is the difference between a LAN and a WAN?',
      'Where do switches and routers fit?',
      'How would you debug two devices that cannot reach each other?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'Basics', 'LAN', 'WAN'],
  }),
  qa('What is the Internet?', {
    short:
      'The Internet is a global network of networks that uses IP routing and shared protocols to let independent systems communicate.',
    detail:
      'No single machine owns the Internet. Internet service providers, cloud providers, enterprises, CDNs, and backbone networks interconnect and exchange routes. IP addresses identify endpoints, routing moves packets across networks, and protocols such as TCP, UDP, DNS, HTTP, and TLS build usable services on top.',
    example:
      'When a mobile app calls `https://api.example.com`, traffic may cross Wi-Fi, an ISP, transit providers, a CDN, a load balancer, and backend services.',
    mistakes: [
      'Equating the Internet with the web; the web is one application on the Internet.',
      'Assuming packets always take one fixed path.',
      'Forgetting that DNS, routing, and TLS can fail before app code runs.',
    ],
    followUps: [
      'What is an autonomous system?',
      'How is the web different from the Internet?',
      'Why can different users reach the same service through different paths?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'Internet', 'IP', 'Routing'],
  }),
  qa('What is the difference between bandwidth, latency, jitter, and throughput?', {
    short:
      'Bandwidth is capacity, latency is delay, jitter is variation in delay, and throughput is the actual delivered data rate.',
    detail:
      'Bandwidth describes the maximum possible rate of a link. Latency measures how long one trip takes. Jitter is how inconsistent that delay is across packets. Throughput is what the application actually gets after congestion, protocol overhead, packet loss, server speed, and client limits.',
    example:
      'A video call may have high bandwidth but still feel bad if latency and jitter are high because audio packets arrive late or unevenly.',
    mistakes: [
      'Using bandwidth and throughput as exact synonyms.',
      'Optimizing only download speed while ignoring round-trip time.',
      'Missing jitter when debugging real-time apps.',
    ],
    followUps: [
      'How do you measure latency from a client?',
      'Why can throughput be lower than bandwidth?',
      'Which metric matters most for multiplayer gaming?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'Bandwidth', 'Latency', 'Jitter', 'Throughput'],
  }),
  qa('What is packet switching?', {
    short:
      'Packet switching sends data as small packets that can be routed independently and reassembled at the destination.',
    detail:
      'Instead of reserving a dedicated circuit for one conversation, packet-switched networks share links among many flows. Each packet carries addressing and control information. This makes networks efficient and resilient, but packets can be delayed, reordered, duplicated, or lost, so higher layers may add reliability.',
    example:
      'A file download is split into many packets; TCP reorders and retransmits missing pieces so the application receives a correct byte stream.',
    mistakes: [
      'Assuming every packet must follow the same route.',
      'Forgetting that packet loss is normal and protocols must handle it.',
      'Thinking packet switching guarantees delivery by itself.',
    ],
    followUps: [
      'Why does TCP need sequence numbers?',
      'How does packet loss affect UDP?',
      'What is the difference between packet switching and circuit switching?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'Packets', 'Routing', 'TCPIP'],
  }),
];

const osiCards = [
  qa('What is the OSI model and why is it useful?', {
    short:
      'The OSI model is a seven-layer reference model for understanding network communication from physical signals up to application protocols.',
    detail:
      'The layers are Physical, Data Link, Network, Transport, Session, Presentation, and Application. Real systems do not always map perfectly to OSI, but the model gives engineers a shared troubleshooting vocabulary: cables and radio at layer 1, frames and MAC addresses at layer 2, IP routing at layer 3, TCP/UDP at layer 4, and application protocols at layer 7.',
    example:
      'If an API fails, OSI thinking helps separate Wi-Fi signal issues, IP routing issues, TCP connection failures, TLS certificate errors, and HTTP application bugs.',
    mistakes: [
      'Treating OSI as an exact implementation of the Internet.',
      'Putting every protocol into only one layer without nuance.',
      'Skipping lower layers when debugging application errors.',
    ],
    followUps: [
      'Which OSI layer does TCP belong to?',
      'Where do IP addresses and MAC addresses fit?',
      'How does the TCP/IP model differ from OSI?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'OSI', 'TCPIP', 'Troubleshooting'],
  }),
  qa('Explain all seven OSI layers with examples.', {
    short:
      'OSI layers are Physical, Data Link, Network, Transport, Session, Presentation, and Application.',
    detail:
      'Physical moves raw bits over copper, fiber, or radio. Data Link moves frames on a local network using MAC addresses. Network routes packets using IP. Transport provides process-to-process communication such as TCP or UDP. Session manages conversations in the abstract model. Presentation handles data representation such as encryption or encoding. Application includes user-facing protocols such as HTTP, DNS, SMTP, and WebSocket.',
    example:
      'Loading a web page uses Wi-Fi or Ethernet, local frames, IP routing, TCP or QUIC, TLS encryption, and HTTP semantics.',
    mistakes: [
      'Saying HTTPS is only layer 7 and ignoring TLS behavior.',
      'Confusing Data Link switching with Network routing.',
      'Memorizing layer names without using them to diagnose failures.',
    ],
    followUps: [
      'Which layers do routers and switches primarily operate at?',
      'Where does TLS fit?',
      'Why are layers helpful even when protocols overlap?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'OSI', 'Protocols'],
  }),
];

const tcpIpCards = [
  qa('What is TCP/IP?', {
    short:
      'TCP/IP is the protocol suite that powers the Internet, with IP addressing and routing plus transport protocols such as TCP and UDP.',
    detail:
      'TCP/IP is often described in four layers: Network Access, Internet, Transport, and Application. IP provides addressing and best-effort packet delivery. TCP adds reliable ordered byte streams. UDP provides lightweight datagrams. Application protocols such as HTTP, DNS, SSH, and SMTP run above them.',
    example:
      'A backend API usually speaks HTTP over TLS over TCP over IP over Ethernet or Wi-Fi.',
    mistakes: [
      'Thinking TCP/IP means only TCP.',
      'Assuming IP guarantees delivery.',
      'Ignoring UDP and QUIC in modern Internet applications.',
    ],
    followUps: [
      'What is the Internet layer responsible for?',
      'How does TCP differ from UDP?',
      'How does TCP/IP map to OSI?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'TCPIP', 'IP', 'TCP', 'UDP'],
  }),
  qa('Why is TCP/IP used everywhere?', {
    short:
      'TCP/IP is widely used because it is open, scalable, interoperable, routable across independent networks, and proven in real production environments.',
    detail:
      'The suite separates concerns well: local links can vary, IP can route across networks, transports can provide different reliability models, and applications can evolve independently. Open standards and vendor interoperability made TCP/IP the default foundation for operating systems, cloud platforms, mobile networks, and enterprise networks.',
    example:
      'The same mobile app can use TCP/IP over home Wi-Fi, office Ethernet, 5G, or a cloud VPC without changing application code.',
    mistakes: [
      'Assuming TCP/IP is popular only because it is old.',
      'Forgetting that its layered design allows different link technologies.',
      'Ignoring operational tooling built around IP networks.',
    ],
    followUps: [
      'What makes IP routing scalable?',
      'Why is interoperability important?',
      'Where does TCP/IP struggle today?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'TCPIP', 'Internet', 'Architecture'],
  }),
];

const ipCards = [
  qa('What is an IP address?', {
    short:
      'An IP address is a logical address used to identify a device or interface for packet delivery on an IP network.',
    detail:
      'IPv4 addresses are 32-bit values commonly written like `192.168.1.10`. IPv6 addresses are 128-bit values written in hexadecimal groups. IP addresses can be public or private, static or dynamic, and are interpreted together with a subnet prefix to decide whether traffic is local or must go through a gateway.',
    example:
      '`10.0.0.15/24` means the host is in the `10.0.0.0` network with local peers from roughly `10.0.0.1` to `10.0.0.254`.',
    mistakes: [
      'Confusing an IP address with a MAC address.',
      'Ignoring the subnet mask or CIDR prefix.',
      'Assuming private IPs are reachable from the public Internet.',
    ],
    followUps: [
      'What is a subnet mask?',
      'What is the default gateway?',
      'How does IPv6 differ from IPv4?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'IP', 'IPv4', 'IPv6', 'Subnetting'],
  }),
  qa('What is CIDR and why is it used?', {
    short:
      'CIDR expresses an IP network using a prefix length, such as `192.168.1.0/24`, and enables flexible subnet sizing.',
    detail:
      'CIDR stands for Classless Inter-Domain Routing. The number after the slash says how many leading bits are the network prefix. Smaller prefixes represent larger networks. CIDR replaced rigid classful addressing and helps routing tables aggregate networks efficiently.',
    example:
      'A cloud VPC might use `10.0.0.0/16`, then split it into public subnet `10.0.1.0/24` and private subnet `10.0.2.0/24`.',
    mistakes: [
      'Thinking `/24` means 24 usable hosts.',
      'Forgetting network and broadcast addresses in IPv4 subnets.',
      'Choosing overlapping CIDR ranges for VPNs or VPC peering.',
    ],
    followUps: [
      'How many addresses are in a `/24`?',
      'What is subnetting?',
      'Why do overlapping CIDRs break routing?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'CIDR', 'Subnetting', 'Cloud'],
  }),
  qa('What is the difference between public and private IP addresses?', {
    short:
      'Public IPs are globally routable on the Internet; private IPs are used inside local or cloud networks and usually require NAT to reach the Internet.',
    detail:
      'Private IPv4 ranges include `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16`. They can be reused by many organizations because Internet routers do not route them globally. Public IPs must be unique and are assigned by ISPs or cloud providers.',
    example:
      'An EC2 instance in a private subnet may have `10.0.2.25` and access the Internet through a NAT Gateway with a public IP.',
    mistakes: [
      'Expecting a private IP to be reachable from a user device on the Internet.',
      'Using public exposure when a private service plus load balancer is safer.',
      'Overlapping private ranges across connected networks.',
    ],
    followUps: [
      'What does NAT do?',
      'Which IPv4 ranges are private?',
      'How does this change with IPv6?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'PublicIP', 'PrivateIP', 'NAT', 'Cloud'],
  }),
];

const dnsCards = [
  qa('What is DNS?', {
    short:
      'DNS is the distributed naming system that translates human-friendly domain names into records such as IP addresses.',
    detail:
      'DNS lets clients ask for records like A, AAAA, CNAME, MX, TXT, and NS. Resolution may involve local cache, recursive resolvers, root servers, TLD servers, and authoritative name servers. DNS is critical because most applications start with a name, not a raw IP.',
    example:
      '`api.example.com` may resolve to an A record for an IPv4 address or a CNAME pointing to a CDN-managed hostname.',
    mistakes: [
      'Thinking DNS only returns IP addresses.',
      'Forgetting caches and TTL when changing records.',
      'Confusing recursive resolvers with authoritative servers.',
    ],
    followUps: [
      'What is an A record?',
      'What is TTL?',
      'What happens when DNS resolution fails?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'DNS', 'ARecord', 'AAAA', 'CNAME'],
  }),
  qa('What happens when you type a domain like google.com in a browser?', {
    short:
      'The browser resolves DNS, opens a network connection, negotiates security if HTTPS is used, sends an HTTP request, and renders the response.',
    detail:
      'The browser first checks caches, then asks a resolver for the domain records. It chooses an address, connects using TCP or QUIC, performs a TLS handshake for HTTPS, sends an HTTP request, receives response headers and body, and loads dependent assets. Redirects, HSTS, cookies, cache, and CDN routing can all affect the flow.',
    example:
      'For `https://google.com`, DNS may route you to a nearby edge, TLS verifies the certificate, and HTTP returns a page plus scripts, fonts, and images.',
    mistakes: [
      'Skipping DNS or TLS in the explanation.',
      'Assuming one request loads the whole page.',
      'Ignoring redirects and browser cache.',
    ],
    followUps: [
      'Where can latency appear in this flow?',
      'What is HSTS?',
      'How does a CDN change the answer?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'DNS', 'HTTP', 'HTTPS', 'Browser'],
  }),
  qa('What is DNS TTL?', {
    short:
      'DNS TTL is the time a resolver or client may cache a DNS record before asking again.',
    detail:
      'TTL stands for Time To Live. Lower TTLs make changes propagate faster but increase query load. Higher TTLs reduce resolver traffic and improve speed but make migrations or failovers slower. TTL is a cache directive, not a guarantee that every resolver behaves perfectly.',
    example:
      'Before moving `api.example.com` to a new load balancer, teams often lower TTL from hours to a few minutes ahead of the change.',
    mistakes: [
      'Changing a record and expecting every client to update instantly.',
      'Leaving very low TTLs forever without a reason.',
      'Forgetting application and OS DNS caches.',
    ],
    followUps: [
      'How would you plan a DNS migration?',
      'What is negative caching?',
      'How do CDN DNS records differ from origin DNS records?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'DNS', 'TTL', 'Cache'],
  }),
];

const transportCards = [
  qa('What is TCP and why is it reliable?', {
    short:
      'TCP is a connection-oriented transport protocol that provides reliable, ordered byte-stream delivery using acknowledgements, sequence numbers, retransmission, and flow control.',
    detail:
      'TCP establishes a connection before data transfer. It numbers bytes, expects acknowledgements, retransmits missing data, orders received segments, and adjusts sending speed based on receiver capacity and congestion signals. This reliability is useful for HTTP/1.1, HTTP/2, SSH, database connections, and many APIs.',
    example:
      'When downloading a JSON response, TCP hides packet loss from the application by retransmitting missing segments and delivering bytes in order.',
    mistakes: [
      'Saying TCP guarantees low latency.',
      'Assuming reliability means no timeouts or disconnects.',
      'Forgetting that TCP is a byte stream, not a message protocol.',
    ],
    followUps: [
      'What is the TCP three-way handshake?',
      'What are sequence numbers?',
      'What is TCP head-of-line blocking?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'TCP', 'Reliability', 'Transport'],
  }),
  qa('Explain the TCP three-way handshake.', {
    short:
      'The TCP three-way handshake is SYN, SYN-ACK, ACK; it establishes connection state and initial sequence numbers between client and server.',
    detail:
      'The client sends SYN with an initial sequence number. The server replies with SYN-ACK, acknowledging the client sequence and sending its own. The client sends ACK to confirm. After that, both sides can exchange reliable data. The handshake adds a round trip before application data unless protocols use optimizations.',
    example:
      'Opening a new HTTPS connection traditionally requires TCP handshake first, then TLS handshake, then the HTTP request.',
    mistakes: [
      'Forgetting that both sides choose sequence numbers.',
      'Thinking the handshake authenticates the server; TLS certificates do that.',
      'Ignoring handshake latency in mobile networks.',
    ],
    followUps: [
      'What happens in TCP four-way termination?',
      'What is SYN flood protection?',
      'How does TLS fit after the TCP handshake?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'TCP', 'Handshake', 'SYN', 'ACK'],
  }),
  qa('What is UDP and when should it be used?', {
    short:
      'UDP is a connectionless transport protocol for sending datagrams with minimal overhead and no built-in reliability or ordering.',
    detail:
      'UDP is useful when freshness, simplicity, multicast-like behavior, or application-managed reliability matters more than guaranteed ordered delivery. DNS, VoIP, gaming, live video, and QUIC use UDP patterns. Applications must handle loss, duplication, reordering, and congestion responsibly.',
    example:
      'A multiplayer game often prefers a newer position update over a delayed retransmission of an old position.',
    mistakes: [
      'Saying UDP is always faster without explaining trade-offs.',
      'Ignoring packet loss and congestion control.',
      'Using UDP for data that requires reliable ordered delivery without adding protocol logic.',
    ],
    followUps: [
      'How does UDP differ from TCP?',
      'Why does DNS often use UDP?',
      'How does QUIC use UDP?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'UDP', 'DNS', 'Gaming', 'VoIP'],
  }),
  qa('What is the difference between TCP and UDP?', {
    short:
      'TCP provides reliable ordered streams with connection state; UDP provides lightweight independent datagrams without built-in delivery guarantees.',
    detail:
      'TCP handles retransmission, ordering, flow control, and congestion control inside the protocol. UDP has a smaller header and no connection setup, which gives applications more control but more responsibility. The right choice depends on whether correctness, latency, ordering, and message freshness matter most.',
    example:
      'REST APIs commonly use TCP through HTTPS, while DNS lookups and real-time voice often use UDP.',
    mistakes: [
      'Choosing UDP only because it sounds faster.',
      'Forgetting TCP can perform very well with connection reuse.',
      'Assuming UDP traffic can ignore network fairness.',
    ],
    followUps: [
      'Which protocol would you use for file transfer?',
      'Why are WebSockets usually TCP-based?',
      'What reliability does QUIC add over UDP?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'TCP', 'UDP', 'Transport'],
  }),
];

const httpCards = [
  qa('What is HTTP?', {
    short:
      'HTTP is an application-layer protocol for request-response communication between clients and servers.',
    detail:
      'HTTP defines methods, URLs, headers, status codes, and bodies. It is stateless by default, so each request must carry the context needed to process it. HTTP is used by browsers, mobile apps, APIs, CDNs, proxies, and many service-to-service systems.',
    example:
      'A React Native app sends `GET /profile` with an auth token and receives JSON plus a `200 OK` status.',
    mistakes: [
      'Assuming HTTP means only browser pages.',
      'Ignoring headers and status codes.',
      'Forgetting HTTP is stateless unless you add sessions or tokens.',
    ],
    followUps: [
      'What is HTTPS?',
      'Which HTTP methods are idempotent?',
      'What does `Cache-Control` do?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'HTTP', 'API', 'Backend'],
  }),
  qa('What is HTTPS and how is it different from HTTP?', {
    short:
      'HTTPS is HTTP protected by TLS, providing encryption, integrity, and server identity verification.',
    detail:
      'With plain HTTP, intermediaries can read or modify traffic. HTTPS negotiates TLS before HTTP data is exchanged. The server presents a certificate, the client validates it against trusted certificate authorities, and both sides derive session keys used to encrypt application data.',
    example:
      'Login requests should use HTTPS so passwords, session cookies, and bearer tokens are not exposed on Wi-Fi or proxy paths.',
    mistakes: [
      'Calling HTTPS a completely separate application protocol.',
      'Saying encryption alone proves the server is legitimate.',
      'Using HTTPS but leaking tokens in logs or URLs.',
    ],
    followUps: [
      'What is a TLS handshake?',
      'What is a certificate authority?',
      'What happens when a certificate expires?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'HTTPS', 'TLS', 'Security'],
  }),
  qa('What happens when an HTTPS connection starts?', {
    short:
      'The client connects, negotiates TLS parameters, validates the server certificate, derives shared keys, and then sends encrypted HTTP data.',
    detail:
      'In TLS 1.3, the client sends supported versions, ciphers, and key share. The server responds with its choices and certificate. The client verifies hostname, validity period, trust chain, and signature. After key agreement, both sides use symmetric encryption for HTTP traffic. Session resumption can reduce future handshake cost.',
    example:
      'If `api.example.com` serves an expired certificate, mobile clients should reject the connection before sending the API request.',
    mistakes: [
      'Assuming TLS starts after sending credentials.',
      'Ignoring hostname validation.',
      'Confusing SSL with modern TLS.',
    ],
    followUps: [
      'What is certificate pinning?',
      'Why is TLS handshake latency important?',
      'How does HTTP/3 change the transport?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'HTTPS', 'TLS', 'Certificates'],
  }),
];

const methodStatusCards = [
  qa('Which HTTP methods are safe and idempotent?', {
    short:
      'Safe methods should not change server state; idempotent methods can be repeated with the same intended effect.',
    detail:
      '`GET`, `HEAD`, and `OPTIONS` are safe. `GET`, `HEAD`, `OPTIONS`, `PUT`, and `DELETE` are generally idempotent. `POST` is usually not idempotent unless the API adds idempotency keys. `PATCH` may or may not be idempotent depending on patch semantics.',
    example:
      'Retrying `PUT /users/42` with the same full representation should leave the resource in the same state, while retrying `POST /orders` may create duplicate orders unless protected.',
    mistakes: [
      'Thinking idempotent means the response must be identical.',
      'Using GET for state-changing actions.',
      'Assuming DELETE must always return the same status on retries.',
    ],
    followUps: [
      'When should you use POST instead of PUT?',
      'How do idempotency keys work?',
      'Is PATCH idempotent?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'HTTP', 'REST', 'Idempotency'],
  }),
  qa('What is the difference between 200, 201, and 204?', {
    short:
      '`200 OK` means success with a response representation, `201 Created` means a new resource was created, and `204 No Content` means success with no response body.',
    detail:
      'HTTP status codes communicate semantics to clients, caches, logs, and monitoring. `201` often includes a `Location` header for the new resource. `204` is useful for successful deletes or updates where the client does not need a body.',
    example:
      '`POST /users` can return `201 Created`, while `DELETE /users/42` can return `204 No Content`.',
    mistakes: [
      'Returning 200 for every successful action.',
      'Sending a JSON body with 204.',
      'Using 201 for updates that did not create a resource.',
    ],
    followUps: [
      'When should a POST return 202?',
      'What should `Location` contain?',
      'How should clients handle 204?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'HTTP', 'StatusCodes', 'REST'],
  }),
  qa('What is the difference between 401 and 403?', {
    short:
      '`401 Unauthorized` means authentication is missing or invalid; `403 Forbidden` means the user is authenticated but not allowed to perform the action.',
    detail:
      'Despite the name, 401 is about authentication and commonly triggers login or token refresh. 403 is about authorization. Correct distinction helps clients decide whether to refresh credentials, show a permission error, or hide an action.',
    example:
      'No bearer token for `/me` should return 401; a valid user trying to access an admin-only report should receive 403.',
    mistakes: [
      'Using 403 for expired tokens.',
      'Using 401 for all permission failures.',
      'Leaking sensitive resource existence through overly detailed errors.',
    ],
    followUps: [
      'What is authentication?',
      'What is authorization?',
      'How should refresh token flow handle 401?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'HTTP', 'Auth', 'Security'],
  }),
  qa('What do 404, 500, and 503 status codes mean?', {
    short:
      '`404` means the resource was not found, `500` means an unexpected server error, and `503` means the service is temporarily unavailable.',
    detail:
      'A 404 can be caused by a wrong route, missing resource, or intentionally hidden resource. A 500 indicates a server-side bug or unhandled failure. A 503 is often used during overload, maintenance, dependency outage, or failed readiness and may include `Retry-After`.',
    example:
      'If an API pod is alive but cannot reach its database, the load balancer may route traffic to instances returning 503.',
    mistakes: [
      'Returning 500 for validation errors.',
      'Treating 503 as a permanent client-side failure.',
      'Exposing stack traces in 500 responses.',
    ],
    followUps: [
      'When would you use 400 versus 422?',
      'What is `Retry-After`?',
      'How should monitoring group 4xx and 5xx?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'HTTP', 'StatusCodes', 'Observability'],
  }),
];

const restCards = [
  qa('What is REST and what makes an API RESTful?', {
    short:
      'REST is an architectural style where clients interact with resources through standard HTTP semantics and stateless requests.',
    detail:
      'A RESTful API identifies resources with URIs, uses HTTP methods intentionally, returns representations such as JSON, stays stateless between requests, and uses status codes and cache semantics correctly. Mature REST design also thinks about filtering, pagination, versioning, errors, and links.',
    example:
      '`GET /users/42` reads a user, `PUT /users/42` replaces it, and `DELETE /users/42` removes it.',
    mistakes: [
      'Calling any JSON-over-HTTP API RESTful.',
      'Using verbs in URLs for every action.',
      'Ignoring idempotency, status codes, and statelessness.',
    ],
    followUps: [
      'What does stateless mean?',
      'How is REST different from SOAP?',
      'When would RPC be a better fit?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'REST', 'HTTP', 'API'],
  }),
  qa('Why does REST statelessness improve scalability?', {
    short:
      'Statelessness lets any healthy server handle any request because required context is carried by the request instead of stored in server conversation state.',
    detail:
      'When servers do not depend on per-client session memory, load balancers can distribute requests freely, nodes can be added or removed, and failures are easier to recover from. State still exists, but it belongs in databases, caches, tokens, or explicit session stores rather than hidden process memory.',
    example:
      'A mobile client sends a bearer token with each API call, so the load balancer does not need sticky sessions for normal authenticated requests.',
    mistakes: [
      'Thinking stateless means no database state.',
      'Storing important session state only in one app server process.',
      'Using sticky sessions to hide poor state design.',
    ],
    followUps: [
      'Where should session data live?',
      'What are sticky sessions?',
      'How do JWTs affect stateless APIs?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'REST', 'Scalability', 'Backend'],
  }),
];

const realtimeCards = [
  qa('What is WebSocket and when would you use it?', {
    short:
      'WebSocket is a persistent full-duplex connection that lets client and server send messages to each other after an HTTP upgrade.',
    detail:
      'Unlike normal request-response HTTP, WebSocket keeps a connection open for low-latency bidirectional messaging. It is useful for chat, live tracking, collaborative apps, stock ticks, notifications, and multiplayer coordination. It requires connection lifecycle handling, heartbeats, auth, reconnect, and backpressure.',
    example:
      'A chat app can receive new messages immediately over WebSocket without polling `GET /messages` every few seconds.',
    mistakes: [
      'Using WebSocket for simple CRUD where REST is enough.',
      'Forgetting reconnect and heartbeat logic on mobile networks.',
      'Assuming WebSocket automatically scales across servers.',
    ],
    followUps: [
      'How is WebSocket different from REST?',
      'What is SSE?',
      'How would you authenticate a WebSocket connection?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'WebSocket', 'Realtime', 'ReactNative'],
  }),
  qa('What is the difference between WebSocket and Server-Sent Events?', {
    short:
      'WebSocket is bidirectional; Server-Sent Events is a simpler one-way stream from server to client over HTTP.',
    detail:
      'SSE works well when the server only needs to push text events to the client, such as notifications or progress updates. WebSocket is better when both sides need frequent messaging. SSE benefits from HTTP semantics and automatic browser reconnection, while WebSocket gives more flexible message flow.',
    example:
      'A build-status page can use SSE for server-to-browser progress, while a collaborative editor usually needs WebSocket.',
    mistakes: [
      'Choosing WebSocket for every live feature.',
      'Forgetting SSE is primarily server-to-client.',
      'Ignoring proxy buffering and timeout behavior.',
    ],
    followUps: [
      'Can SSE send binary data?',
      'How do mobile clients handle reconnect?',
      'When is long polling acceptable?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'WebSocket', 'SSE', 'Realtime'],
  }),
];

const authCards = [
  qa('What is the difference between authentication and authorization?', {
    short:
      'Authentication verifies who a user or service is; authorization decides what that identity is allowed to do.',
    detail:
      'Authentication uses credentials such as passwords, tokens, certificates, biometrics, or OAuth flows. Authorization uses roles, permissions, ownership, policies, or scopes to allow or deny actions. A system usually authenticates first, then authorizes each protected operation.',
    example:
      'A user logs in successfully, but only users with the `admin` role can delete another user account.',
    mistakes: [
      'Using the terms interchangeably.',
      'Checking login but not permissions.',
      'Trusting client-side role checks without backend enforcement.',
    ],
    followUps: [
      'What is a JWT?',
      'What is OAuth?',
      'What is the difference between 401 and 403?',
    ],
    difficulty: 'Beginner',
    tags: ['Security', 'Auth', 'Authorization', 'Authentication'],
  }),
  qa('What is JWT?', {
    short:
      'A JWT is a signed JSON token format commonly used to carry claims between parties.',
    detail:
      'A JSON Web Token has header, payload, and signature sections. The signature helps recipients verify that claims were issued by a trusted party and not modified. JWTs can carry user ID, issuer, audience, expiry, and scopes. They should be short-lived and validated carefully.',
    example:
      'A React Native app stores an access token and sends it as `Authorization: Bearer <jwt>` to call protected APIs.',
    mistakes: [
      'Thinking JWT payloads are encrypted by default.',
      'Not validating issuer, audience, expiry, and signature.',
      'Storing long-lived JWTs insecurely.',
    ],
    followUps: [
      'Where should mobile apps store tokens?',
      'What is refresh token rotation?',
      'How do you revoke JWT access?',
    ],
    difficulty: 'Intermediate',
    tags: ['Security', 'JWT', 'Auth', 'API'],
  }),
  qa('What is OAuth and how is it different from OpenID Connect?', {
    short:
      'OAuth 2.0 is for delegated authorization; OpenID Connect adds an identity layer for authentication on top of OAuth 2.0.',
    detail:
      'OAuth lets a client obtain access tokens to call APIs with limited scopes. OpenID Connect adds ID tokens and standardized user identity claims so applications can log users in. Mixing them up can create security and design mistakes.',
    example:
      'An app may use OIDC to sign in with Google and OAuth access tokens to call a calendar API with granted scopes.',
    mistakes: [
      'Saying OAuth is a login protocol by itself.',
      'Using access tokens as proof of user identity without validation.',
      'Ignoring redirect URI and PKCE requirements.',
    ],
    followUps: [
      'What is PKCE?',
      'What is an ID token?',
      'How does refresh token flow work?',
    ],
    difficulty: 'Intermediate',
    tags: ['Security', 'OAuth', 'OIDC', 'Auth'],
  }),
];

const securityCards = [
  qa('What is a man-in-the-middle attack?', {
    short:
      'A man-in-the-middle attack occurs when an attacker intercepts, relays, or modifies communication between two parties that believe they are talking directly.',
    detail:
      'MITM attacks can happen through rogue Wi-Fi, DNS poisoning, compromised proxies, or certificate trust problems. HTTPS with correct certificate validation protects confidentiality and integrity, while pinning can add defense for high-risk mobile apps.',
    example:
      'On hostile public Wi-Fi, an attacker may try to intercept login traffic; valid TLS prevents them from reading credentials.',
    mistakes: [
      'Assuming any HTTPS-looking URL is safe without certificate validation.',
      'Disabling TLS verification during development and shipping it.',
      'Ignoring DNS and proxy attack paths.',
    ],
    followUps: [
      'What is SSL pinning?',
      'How does certificate validation prevent MITM?',
      'What are the risks of custom certificate trust?',
    ],
    difficulty: 'Intermediate',
    tags: ['Security', 'HTTPS', 'MITM', 'TLS'],
  }),
  qa('What are CSRF, XSS, and CORS?', {
    short:
      'CSRF tricks a browser into sending unwanted authenticated requests, XSS runs attacker-controlled script in a page, and CORS controls which browser origins can read cross-origin responses.',
    detail:
      'CSRF abuses automatic cookie sending. XSS abuses untrusted content execution. CORS is a browser security mechanism, not an authentication system. These topics often interact: token storage, cookie flags, SameSite, output escaping, CSP, and precise CORS allowlists all matter.',
    example:
      'A banking site uses SameSite cookies and CSRF tokens, escapes user content to prevent XSS, and allows CORS only from trusted frontend origins.',
    mistakes: [
      'Using CORS as the only API security control.',
      'Storing tokens in places exposed to XSS without understanding risk.',
      'Setting `Access-Control-Allow-Origin: *` with sensitive credentialed APIs.',
    ],
    followUps: [
      'What does SameSite do?',
      'How do you prevent XSS?',
      'Why does CORS apply mainly to browsers?',
    ],
    difficulty: 'Intermediate',
    tags: ['Security', 'CSRF', 'XSS', 'CORS', 'API'],
  }),
  qa('What is rate limiting and why is it important for API security?', {
    short:
      'Rate limiting restricts how many requests a client can make in a time window to reduce abuse, overload, scraping, and brute-force attacks.',
    detail:
      'Limits can be based on IP, user ID, API key, route, token bucket, leaky bucket, or sliding window algorithms. Good rate limiting considers trusted proxies, distributed clients, login endpoints, paid tiers, and clear client responses such as `429 Too Many Requests`.',
    example:
      'An auth service may allow only a small number of password attempts per account and IP before delaying or blocking requests.',
    mistakes: [
      'Rate limiting only by IP behind NAT or proxies.',
      'Not rate limiting expensive endpoints.',
      'Returning unclear errors without retry guidance.',
    ],
    followUps: [
      'What is a token bucket?',
      'What status code represents rate limiting?',
      'How would you rate limit in a distributed system?',
    ],
    difficulty: 'Intermediate',
    tags: ['Security', 'RateLimiting', 'API', 'Backend'],
  }),
];

const infraCards = [
  qa('What is a load balancer?', {
    short:
      'A load balancer distributes client traffic across multiple healthy backend targets to improve availability, scalability, and reliability.',
    detail:
      'Load balancers perform health checks, route traffic, terminate or pass through TLS, and apply algorithms such as round robin, least connections, or weighted routing. Layer 4 load balancers use transport-level data, while Layer 7 load balancers understand application protocols like HTTP.',
    example:
      'AWS ALB can route `/api` traffic to backend containers and stop sending requests to unhealthy tasks.',
    mistakes: [
      'Assuming load balancing fixes slow backends by itself.',
      'Forgetting health check path correctness.',
      'Ignoring session affinity and connection draining.',
    ],
    followUps: [
      'What is the difference between Layer 4 and Layer 7 load balancing?',
      'What is weighted routing?',
      'Why can a load balancer be healthy while the service returns 503?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'LoadBalancer', 'AWS', 'Cloud'],
  }),
  qa('What is a CDN and how does it improve performance?', {
    short:
      'A CDN caches and serves content from geographically distributed edge locations closer to users.',
    detail:
      'CDNs reduce latency, offload origin servers, absorb traffic spikes, and can provide TLS, compression, image optimization, DDoS protection, and edge rules. They are especially valuable for static assets, media, and cacheable API responses.',
    example:
      'A user in Mumbai downloading an app image from Cloudflare may hit a nearby edge instead of an origin server in Virginia.',
    mistakes: [
      'Caching personalized data without correct keys and headers.',
      'Thinking CDN cache and browser cache are the same thing.',
      'Forgetting invalidation and versioned asset names.',
    ],
    followUps: [
      'What is cache invalidation?',
      'What is the difference between CDN and Redis cache?',
      'How does TTL affect CDN behavior?',
    ],
    difficulty: 'Beginner',
    tags: ['Networking', 'CDN', 'Cache', 'Performance'],
  }),
  qa('What is the difference between a forward proxy and a reverse proxy?', {
    short:
      'A forward proxy acts on behalf of clients; a reverse proxy acts on behalf of servers.',
    detail:
      'Forward proxies are used for client privacy, corporate egress control, filtering, or caching. Reverse proxies sit in front of services to route requests, terminate TLS, compress responses, enforce policies, and hide backend topology. Nginx, HAProxy, and cloud load balancers often act as reverse proxies.',
    example:
      'A company laptop may use a forward proxy for outbound web access, while Nginx reverse proxies `api.example.com` to internal app servers.',
    mistakes: [
      'Calling every proxy a reverse proxy.',
      'Forgetting `X-Forwarded-For` and trusted proxy configuration.',
      'Exposing backend services directly when a reverse proxy should mediate them.',
    ],
    followUps: [
      'Why use Nginx?',
      'What headers do reverse proxies add?',
      'How does TLS termination work at a proxy?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'Proxy', 'ReverseProxy', 'Nginx'],
  }),
  qa('What is caching and what are common cache strategies?', {
    short:
      'Caching stores previously computed or fetched data to reduce latency, cost, and backend load.',
    detail:
      'Caches exist in browsers, DNS resolvers, CDNs, application memory, Redis, databases, and operating systems. Common strategies include cache-aside, where the app reads and fills the cache; write-through, where writes update cache and storage together; and write-back, where cache accepts writes and persists later.',
    example:
      'An API can cache product details in Redis so repeated mobile requests do not hit the database every time.',
    mistakes: [
      'Ignoring stale data and invalidation.',
      'Caching sensitive user-specific responses incorrectly.',
      'Adding cache without measuring the bottleneck.',
    ],
    followUps: [
      'What is cache-aside?',
      'How do you invalidate CDN cache?',
      'What is a cache stampede?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'Cache', 'Redis', 'CDN', 'Performance'],
  }),
];

const mobileCloudScenarioCards = [
  qa('What happens when a React Native mobile app calls an API?', {
    short:
      'The app builds a request, resolves DNS, opens a network connection, negotiates TLS for HTTPS, sends HTTP data, receives the response, and updates UI state.',
    detail:
      'On mobile, the path also includes OS networking APIs, radio state, captive portals, proxies, certificate trust, retries, timeouts, and app lifecycle transitions. A robust app handles slow networks, dropped connections, token refresh, offline mode, and request cancellation.',
    example:
      'A `fetch` call to `/orders` may fail because DNS is unavailable, the TLS certificate is invalid, the token expired, the server returned 503, or the user backgrounded the app mid-request.',
    mistakes: [
      'Blaming the backend before checking device connectivity and DNS.',
      'Using no request timeouts or cancellation.',
      'Not distinguishing transport errors from HTTP errors.',
    ],
    followUps: [
      'How would you debug API delays?',
      'How does SSL pinning work in React Native?',
      'How should the app handle token refresh?',
    ],
    difficulty: 'Intermediate',
    tags: ['ReactNative', 'Networking', 'HTTP', 'Mobile'],
  }),
  qa('How would you debug a mobile app API failure?', {
    short:
      'Separate the problem by layer: device connectivity, DNS, TLS, HTTP status, authentication, request payload, backend logs, and dependency health.',
    detail:
      'Start by reproducing with request IDs and exact timestamps. Check whether the device has network access, whether DNS resolves, whether TLS validates, whether the request leaves the app, and what status or error returns. Compare with curl/Postman, inspect server logs, review recent deploys, and test on different networks.',
    example:
      'If only some users on one carrier fail before HTTP status appears, investigate DNS, IPv6, TLS, captive proxy, or mobile network path rather than controller code.',
    mistakes: [
      'Treating every failure as a 500.',
      'Not logging correlation IDs.',
      'Ignoring device-only issues such as certificate store, proxy, or poor radio conditions.',
    ],
    followUps: [
      'What tools would you use on Android and iOS?',
      'How do you capture network logs safely?',
      'How would you handle flaky reproduction?',
    ],
    difficulty: 'Intermediate',
    tags: ['ReactNative', 'Networking', 'Debugging', 'API'],
  }),
  qa('What is a VPC in cloud networking?', {
    short:
      'A VPC is a logically isolated virtual network in a cloud provider where you define IP ranges, subnets, routes, gateways, and security controls.',
    detail:
      'A VPC lets teams run cloud resources with controlled connectivity. Public subnets can route through an Internet Gateway. Private subnets usually avoid direct inbound Internet access and use NAT for outbound traffic. Security groups and network ACLs restrict traffic.',
    example:
      'A backend service may run in a private subnet, receive traffic through an ALB in a public subnet, and access external APIs through a NAT Gateway.',
    mistakes: [
      'Putting databases in public subnets without need.',
      'Confusing security groups with firewalls at every layer.',
      'Creating overlapping VPC CIDRs that later break peering or VPN.',
    ],
    followUps: [
      'What is a NAT Gateway?',
      'What is an Internet Gateway?',
      'How do security groups differ from network ACLs?',
    ],
    difficulty: 'Intermediate',
    tags: ['Cloud', 'VPC', 'AWS', 'Networking'],
  }),
  qa('What is the difference between a public subnet and a private subnet?', {
    short:
      'A public subnet has a route to the Internet through an Internet Gateway; a private subnet does not expose resources directly to inbound Internet traffic.',
    detail:
      'In cloud platforms, subnet exposure is primarily about route tables and attached public IP behavior. Public subnets are common for load balancers or bastion hosts. Private subnets are common for app servers, databases, queues, and internal services. Private resources may still make outbound calls through NAT.',
    example:
      'An AWS ALB lives in public subnets, while ECS tasks and RDS instances live in private subnets.',
    mistakes: [
      'Thinking a subnet is private just because its CIDR is `10.0.0.0/8`.',
      'Giving public IPs to resources that should be internal.',
      'Forgetting outbound Internet access for patching or external APIs.',
    ],
    followUps: [
      'What route makes a subnet public?',
      'Why use NAT Gateway?',
      'Where should a database run?',
    ],
    difficulty: 'Intermediate',
    tags: ['Cloud', 'Subnet', 'AWS', 'Networking'],
  }),
  qa('A website loads slowly. What networking issues could be responsible?', {
    short:
      'Slow loads can come from DNS delay, high latency, packet loss, TLS handshake cost, server slowness, large assets, cache misses, CDN issues, or too many requests.',
    detail:
      'Use browser DevTools waterfall, server metrics, CDN logs, synthetic tests, and real user monitoring. Separate time spent on DNS, connect, TLS, TTFB, download, and client rendering. Network causes often combine with backend and frontend issues.',
    example:
      'If TTFB is high only in one region, check CDN origin routing, backend region distance, and regional dependency latency.',
    mistakes: [
      'Optimizing JavaScript before reading the network waterfall.',
      'Ignoring DNS and TLS timing.',
      'Testing only from the developer laptop.',
    ],
    followUps: [
      'What is TTFB?',
      'How does CDN caching help?',
      'How would HTTP/2 or HTTP/3 affect loading?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'Performance', 'CDN', 'HTTP'],
  }),
  qa('DNS is not resolving. How do you troubleshoot it?', {
    short:
      'Check the domain spelling, local cache, resolver response, authoritative records, TTL, DNSSEC, network reachability, and recent DNS changes.',
    detail:
      'Use tools such as `dig`, `nslookup`, or cloud DNS dashboards. Query the recursive resolver and authoritative name servers directly. Compare locations and networks. Verify record type, zone delegation, NS records, and whether cached stale or negative responses explain the behavior.',
    example:
      'If `api.example.com` works on one network but not another after a change, a resolver may still be caching the old or negative response.',
    mistakes: [
      'Only testing in the browser.',
      'Forgetting CNAME chains and authoritative delegation.',
      'Expecting TTL changes to affect records already cached.',
    ],
    followUps: [
      'What is an authoritative name server?',
      'What is negative DNS caching?',
      'How would you verify DNS from multiple regions?',
    ],
    difficulty: 'Intermediate',
    tags: ['Networking', 'DNS', 'Troubleshooting', 'DevOps'],
  }),
  qa('A load balancer is healthy but the service returns unavailable. Why can that happen?', {
    short:
      'Health checks may be too shallow, dependencies may be down, capacity may be exhausted, routing may be wrong, or the app may pass health checks while failing real requests.',
    detail:
      'A load balancer health check often tests one path like `/health`. The app can return OK while database, cache, auth, or downstream dependencies fail. Other causes include bad target group ports, security group rules, deployment mismatch, connection draining, exhausted workers, or incorrect host/path routing.',
    example:
      'An app returns 200 for `/health` but every `/checkout` request returns 503 because the payment dependency is unavailable.',
    mistakes: [
      'Assuming green load balancer health means business endpoints work.',
      'Making health checks so deep they flap during minor dependency issues.',
      'Not comparing health check logs with application request logs.',
    ],
    followUps: [
      'What should readiness checks include?',
      'How do liveness and readiness differ?',
      'How would you debug target group routing?',
    ],
    difficulty: 'Advanced',
    tags: ['Networking', 'LoadBalancer', 'Cloud', 'Troubleshooting'],
  }),
];

const groups = [
  ['Networking Basics Interview Questions', basicCards],
  ['OSI Model Interview Questions', osiCards],
  ['TCP/IP Model Interview Questions', tcpIpCards],
  ['IP Addressing Interview Questions', ipCards],
  ['DNS Interview Questions', dnsCards],
  ['TCP and UDP Interview Questions', transportCards],
  ['HTTP and HTTPS Interview Questions', httpCards],
  ['HTTP Methods and Status Codes Interview Questions', methodStatusCards],
  ['REST API Interview Questions', restCards],
  ['WebSocket Interview Questions', realtimeCards],
  ['Authentication Interview Questions', authCards],
  ['Security Fundamentals Interview Questions', securityCards],
  ['Load Balancing, CDN, Proxy, and Caching Interview Questions', infraCards],
  ['Mobile, Cloud, and Scenario Networking Interview Questions', mobileCloudScenarioCards],
];

export function addNetworkingInterviewQuestions(skills) {
  const parent = ensureSkill(skills, 'Internet & Networking Interview Q&A', 'internet', null, {
    definition:
      'Structured interview question bank for networking fundamentals, web protocols, API security, mobile networking, and cloud networking.',
    whenUsed:
      'Use this to prepare software engineers, React Native developers, backend developers, DevOps engineers, and cloud engineers for networking interviews.',
  });

  const globalQuestions = new Set();
  skills.forEach((skill) => {
    (skill.flashcards || []).forEach((item) => {
      if (item.a?.includes('### Short Interview Answer')) {
        globalQuestions.add(normalizeQuestion(item.q));
      }
    });
  });

  groups.forEach(([name, cards]) => {
    const skill = ensureSkill(skills, name, 'internet', parent.id);
    addUniqueCards(skill, cards, globalQuestions);
  });
}
