// seed/skills/security-auth.js — JWT, OAuth, Keycloak, 2FA, MD5, SHA
import { mk, uid } from '../helpers.js';

export default function buildSecuritySkills() {
  return [
    mk('JWT', 'auth', null, {
      definition: 'JSON Web Token — signed self-contained token. Stateless auth, verify signature without DB lookup.',
      flashcards: [
        { id: uid(), q: 'Where to store JWT in browser?', a: 'httpOnly cookie is safest. localStorage is XSS-vulnerable.' },
      ],
    }),
    mk('OAuth', 'auth'),
    mk('Keycloak', 'auth', null, {
      whenUsed: '2FA on Stock Trading Platform via external TOTP library.',
    }),
    mk('2FA (TOTP)', 'auth'),
    mk('MD5', 'auth'),
    mk('SHA', 'auth'),
  ];
}
