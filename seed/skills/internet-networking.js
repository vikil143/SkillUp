// seed/skills/internet-networking.js — HTTP, REST, DNS, CORS, TLS, WebRTC
import { mk } from '../helpers.js';

export default function buildInternetSkills() {
  return [
    mk('HTTP', 'internet', null, {
      definition: 'Stateless application-layer protocol. Request/response over TCP. Methods: GET/POST/PUT/DELETE/PATCH.',
    }),
    mk('REST', 'internet', null, {
      definition: 'Architectural style — resources, stateless, uniform interface, cacheable. Maps HTTP verbs to CRUD.',
    }),
    mk('DNS', 'internet', null, {
      definition: 'Domain Name System. Hierarchical lookup translating domain names to IP addresses.',
    }),
    mk('CORS', 'internet', null, {
      definition: 'Browser security mechanism controlling cross-origin requests via headers (Access-Control-Allow-Origin, etc.).',
    }),
    mk('TLS/HTTPS', 'internet', null, {
      definition: 'Transport Layer Security encrypts HTTP traffic. HTTPS = HTTP over TLS. Prevents eavesdropping and MITM attacks.',
    }),
    mk('WebRTC', 'internet', null, {
      definition: 'Browser API for real-time peer-to-peer audio, video, and data. Uses STUN/TURN servers for NAT traversal.',
    }),
  ];
}
