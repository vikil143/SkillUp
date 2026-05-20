// seed/skills/security-auth.js — JWT, OAuth, Keycloak, 2FA, MD5, SHA
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

export default function buildSecuritySkills() {
  const skills = [];

  const jwt = mk('JWT', 'auth', null, {
    definition:
      'JWT (JSON Web Token) is a compact token format containing claims, a header, and a signature. It enables stateless authentication/authorization when signature and claim validation are done correctly. JWTs are transport artifacts, not a security model by themselves, so lifecycle controls like expiration, rotation, and revocation strategy are essential.',
    codeExample:
      "import jwt from 'jsonwebtoken';\n\nconst token = jwt.sign(\n  { sub: 'user_123', role: 'admin', aud: 'skillup-api' },\n  process.env.JWT_SECRET,\n  { algorithm: 'HS256', expiresIn: '15m', issuer: 'skillup-auth' }\n);\n\nconst payload = jwt.verify(token, process.env.JWT_SECRET, {\n  algorithms: ['HS256'],\n  audience: 'skillup-api',\n  issuer: 'skillup-auth',\n});\n\nconsole.log(payload.sub);",
    whenUsed:
      'Used in `p-maak` and `p-packarma` for mobile auth flows and token-based API authorization.',
    gotchas:
      'Not validating `aud`, `iss`, and algorithm opens token confusion attacks.\nLong-lived access tokens increase blast radius if stolen.\nStoring tokens in localStorage increases XSS extraction risk.\nPutting sensitive PII in JWT payload leaks data to any party with token visibility.',
    flashcards: [
      card('Why is JWT often paired with short-lived access token + refresh token?', 'Short access TTL limits compromise window while refresh flow preserves UX and supports rotation/revocation controls.'),
      card('What is algorithm confusion in JWT validation?', 'Accepting unexpected algorithms (or `none`) can let attackers bypass signature verification in weak implementations.'),
      card('Why should JWT payload be considered readable?', 'JWT is base64url encoded, not encrypted by default; anyone with token can decode claims.'),
      card('When is server-side session preferable over pure JWT stateless auth?', 'When immediate revocation, strict device/session management, and central control are primary requirements.'),
      card('Why include `jti` in JWT designs?', 'It enables token tracking/replay detection and targeted revocation lists.'),
      card('What is a safe browser storage strategy for JWT?', 'Prefer secure httpOnly sameSite cookies and CSRF mitigations rather than JS-readable storage.'),
      card('Why is clock skew important for JWT expiry checks?', 'Distributed systems can disagree on time; small leeway prevents false-negative validations.'),
      card('What does token introspection solve that self-contained JWT does not?', 'Centralized active-state checks for revocation and policy decisions.'),
    ],
    apis: [
      api('jwt.sign', 'jwt.sign(payload, secretOrPrivateKey, options?)', 'Creates signed JWT.', 'payload, key, algorithm/exp options', 'token string', "const t = jwt.sign({ sub: uid }, secret, { expiresIn: '15m' });", 'Avoid weak secrets and uncontrolled expiry durations.'),
      api('jwt.verify', 'jwt.verify(token, secretOrPublicKey, options?)', 'Verifies signature and validates claims.', 'token, key, expected alg/aud/iss', 'decoded payload', "const p = jwt.verify(token, secret, { audience: 'api' });", 'Always pin allowed algorithms.'),
      api('jwt.decode', 'jwt.decode(token, options?)', 'Decodes payload without verifying signature.', 'token', 'decoded payload or null', 'const data = jwt.decode(token);', 'Never trust decode() output for auth decisions.'),
      api('exp/nbf/iat', 'registered JWT time claims', 'Control token temporal validity.', 'epoch seconds values', 'claim semantics', "jwt.sign({ sub: uid }, secret, { expiresIn: '15m' });", 'Server clock sync is required for reliable validation.'),
      api('aud/iss/sub', 'registered identity claims', 'Bind token to expected issuer/audience/subject.', 'claim values', 'validation context', "jwt.verify(token, secret, { audience: 'skillup-api', issuer: 'auth.svc' });", 'Skipping aud/iss checks invites token substitution across services.'),
      api('kid header', 'JWT header `kid`', 'Selects matching signing key in JWKS rotation.', 'key id in header + JWKS lookup', 'key resolution', 'Header: { alg: "RS256", kid: "2026-05-key1" }', 'Must validate key source and cache safely.'),
      api('refresh token rotation', 'issue new refresh token per use', 'Mitigates replay and supports compromise detection.', 'old/new refresh token lifecycle', 'rotated token pair', 'On refresh: invalidate old token and issue new pair.', 'Failure to invalidate prior refresh token enables replay.'),
      api('revocation list', 'track invalidated jti/session IDs', 'Allows early invalidation before exp.', 'token identifiers and TTL', 'deny decision', 'if (revokedSet.has(payload.jti)) reject();', 'Unbounded lists require expiry/cleanup strategy.'),
    ],
    refs: [
      ref('JWT RFC 7519', 'https://www.rfc-editor.org/rfc/rfc7519'),
      ref('OWASP JWT Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html'),
      ref('OAuth JWT BCP RFC 8725', 'https://www.rfc-editor.org/rfc/rfc8725'),
      ref('jsonwebtoken Docs', 'https://github.com/auth0/node-jsonwebtoken'),
      ref('Auth0 JWT Intro', 'https://auth0.com/docs/secure/tokens/json-web-tokens'),
    ],
    relatedProjectIds: ['p-maak', 'p-packarma'],
  });
  skills.push(jwt);

  [
    'Token Structure & Claims',
    'Signing Algorithms (HS/RS/ES)',
    'Access vs Refresh Tokens',
    'Revocation Strategies',
    'Storage & CSRF/XSS Tradeoffs',
    'Audience/Issuer Validation',
  ].forEach((name) => {
    skills.push(
      mk(name, 'auth', jwt.id, {
        definition: `${name} determines whether JWT-based auth is actually secure in production.`,
        codeExample:
          name === 'Audience/Issuer Validation'
            ? "jwt.verify(token, key, {\n  algorithms: ['RS256'],\n  audience: 'skillup-api',\n  issuer: 'https://auth.skillup.com',\n});"
            : name === 'Storage & CSRF/XSS Tradeoffs'
              ? "res.cookie('access_token', token, {\n  httpOnly: true,\n  secure: true,\n  sameSite: 'strict',\n});"
              : "const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));",
        flashcards: [
          card(`What breaks first in ${name}?`, 'Assuming defaults are safe without explicit validation and lifecycle policy.'),
          card(`How do you verify ${name} hardening?`, 'Threat-model token theft/replay and test negative paths (expired, wrong aud/iss, revoked).'),
        ],
      })
    );
  });

  const oauth = mk('OAuth', 'auth', null, {
    definition:
      'OAuth 2.0 is an authorization framework for delegated access between clients, users, and resource servers. It defines grant flows, token issuance, scopes, and trust boundaries rather than end-user authentication semantics. Modern secure implementations use Authorization Code + PKCE and avoid implicit flow.',
    codeExample:
      "import crypto from 'node:crypto';\n\nconst verifier = crypto.randomBytes(32).toString('base64url');\nconst challenge = crypto.createHash('sha256').update(verifier).digest('base64url');\n\nconst authUrl = new URL('https://auth.example.com/oauth2/authorize');\nauthUrl.searchParams.set('response_type', 'code');\nauthUrl.searchParams.set('client_id', process.env.CLIENT_ID);\nauthUrl.searchParams.set('redirect_uri', 'https://app.example.com/callback');\nauthUrl.searchParams.set('scope', 'openid profile email');\nauthUrl.searchParams.set('code_challenge_method', 'S256');\nauthUrl.searchParams.set('code_challenge', challenge);\nauthUrl.searchParams.set('state', crypto.randomBytes(16).toString('hex'));",
    whenUsed:
      'Used conceptually in Keycloak integrations and external identity-provider login patterns in `p-stock`.',
    gotchas:
      'Skipping state validation allows CSRF on authorization response.\nUsing implicit flow in modern SPAs increases token leakage risk.\nOver-broad scopes grant unnecessary privilege.\nToken exchange over insecure redirect URI leaks credentials.',
    flashcards: [
      card('Why is PKCE required even for public clients?', 'It prevents authorization code interception from being exchanged by attackers.'),
      card('What is the difference between OAuth and OIDC?', 'OAuth handles delegated authorization; OIDC adds identity/authentication layer over OAuth.'),
      card('Why should redirect URIs be exact-matched?', 'Loose matching enables open redirect abuse and token/code leakage.'),
      card('What does `state` protect against in OAuth?', 'Cross-site request forgery and response mix-up.'),
      card('Why are refresh tokens risky on public clients?', 'If stolen, they enable long-lived access unless rotation/binding protections exist.'),
      card('What is token audience in multi-API systems?', 'It constrains where a token is valid, preventing cross-resource token reuse.'),
      card('When should client credentials grant be used?', 'Machine-to-machine service auth where no end user is involved.'),
      card('Why is scope minimization a security control?', 'It enforces least privilege and reduces impact of compromised tokens.'),
    ],
    apis: [
      api('Authorization Code Flow', 'GET /authorize -> code -> POST /token', 'Most secure user-agent flow for web/mobile with backend exchange.', 'client_id, redirect_uri, scope, state, PKCE', 'access/refresh/id tokens', 'Use code + PKCE, not implicit flow.', 'State and PKCE checks are mandatory.'),
      api('PKCE', 'code_verifier/code_challenge(S256)', 'Mitigates authorization code interception attacks.', 'high-entropy verifier and SHA-256 challenge', 'binding between auth and token requests', 'challenge = base64url(SHA256(verifier))', 'Verifier entropy and storage must be robust.'),
      api('Token Endpoint', 'POST /oauth2/token', 'Exchanges code for tokens or refreshes tokens.', 'grant_type and credentials', 'token response JSON', 'grant_type=authorization_code&code=...', 'TLS and client authentication requirements vary by grant type.'),
      api('Introspection', 'POST /oauth2/introspect', 'Checks active state/metadata of opaque tokens.', 'token and client auth', 'active + claims response', 'active=false => reject request', 'Can add latency; cache carefully.'),
      api('Revocation', 'POST /oauth2/revoke', 'Invalidates tokens server-side.', 'token and client auth', 'revocation acknowledgement', 'revoke refresh token on logout', 'Must revoke token families where applicable.'),
      api('Scope', 'space-delimited scope string', 'Limits token privileges.', 'requested scope values', 'granted scope set', 'scope=read:orders write:orders', 'Do not treat scope strings as user roles directly.'),
      api('State Parameter', 'state=<random nonce>', 'Correlates auth response to initiating request.', 'random unguessable value', 'request integrity check', 'Verify exact match on callback.', 'Reused/non-random state weakens CSRF protection.'),
      api('Client Credentials', 'grant_type=client_credentials', 'Machine-to-machine OAuth flow.', 'client auth + scope', 'access token', 'Service A requests token for Service B API.', 'Never use for user impersonation.'),
    ],
    refs: [
      ref('OAuth 2.0 RFC 6749', 'https://www.rfc-editor.org/rfc/rfc6749'),
      ref('OAuth 2.1 Draft', 'https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/'),
      ref('PKCE RFC 7636', 'https://www.rfc-editor.org/rfc/rfc7636'),
      ref('OAuth Security BCP RFC 6819', 'https://www.rfc-editor.org/rfc/rfc6819'),
      ref('OpenID Connect Core', 'https://openid.net/specs/openid-connect-core-1_0.html'),
    ],
  });
  skills.push(oauth);

  [
    'OAuth Roles & Actors',
    'Authorization Code + PKCE',
    'Scopes & Consent',
    'Refresh Token Rotation',
    'OIDC Basics',
    'Token Introspection & Revocation',
  ].forEach((name) => {
    skills.push(
      mk(name, 'auth', oauth.id, {
        definition: `${name} is central to safe delegated authorization and identity-provider integration.`,
        codeExample:
          name === 'Authorization Code + PKCE'
            ? "authorize?response_type=code&client_id=...&code_challenge=...&code_challenge_method=S256&state=..."
            : name === 'Scopes & Consent'
              ? "scope=openid profile email read:orders"
              : "POST /oauth2/revoke\ntoken=<refresh_token>",
        flashcards: [
          card(`What is the frequent mistake in ${name}?`, 'Treating OAuth transport success as complete security without validating all response and token constraints.'),
          card(`How do you test ${name} safely?`, 'Exercise negative callback/token scenarios and verify strict redirect/state/audience checks.'),
        ],
      })
    );
  });

  const keycloak = mk('Keycloak', 'auth', null, {
    definition:
      'Keycloak is an open-source identity and access management platform supporting SSO, OAuth2/OIDC, SAML, MFA, and federation. It centralizes identity concerns such as login, token issuance, role mapping, and policy enforcement. It is widely used for enterprise auth orchestration across multiple apps.',
    codeExample:
      "import Keycloak from 'keycloak-js';\n\nconst keycloak = new Keycloak({\n  url: 'https://auth.example.com',\n  realm: 'skillup',\n  clientId: 'skillup-web',\n});\n\nawait keycloak.init({\n  onLoad: 'check-sso',\n  pkceMethod: 'S256',\n  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,\n});\n\nif (!keycloak.authenticated) {\n  keycloak.login();\n}",
    whenUsed: 'Used in `p-stock` where Keycloak + TOTP delivered enterprise-grade login and role-based access control.',
    gotchas:
      'Incorrect realm/client configuration causes subtle token/audience mismatches.\nRole mapping not mirrored in backend checks leads to authorization gaps.\nNot planning token refresh and session timeout UX causes random user disruptions.\nMisconfigured redirect/logout URIs can leak auth context or break login flows.',
    flashcards: [
      card('Why is Keycloak realm design important?', 'Realm boundaries define identity trust and policy scope; poor partitioning complicates multi-tenant governance.'),
      card('What is the difference between realm roles and client roles?', 'Realm roles are global; client roles are app-specific and should map to service authorization needs.'),
      card('Why should backend still validate tokens with Keycloak setup?', 'Frontend login state is not authorization; APIs must independently verify and enforce claims/roles.'),
      card('What does offline token access imply?', 'Long-lived refresh capability requiring stronger controls and revocation governance.'),
      card('Why use Keycloak events/audit logs?', 'They provide traceability for auth actions, suspicious activity, and compliance reporting.'),
      card('How does identity brokering help enterprises?', 'It integrates external IdPs while centralizing policy and token issuance.'),
      card('What breaks often during Keycloak upgrades?', 'Theme/custom SPI/plugin compatibility and changed defaults around tokens/sessions.'),
      card('Why is client secret handling critical?', 'Leaked confidential client secrets enable unauthorized token exchanges.'),
    ],
    apis: [
      api('Realm', 'admin console realm configuration', 'Top-level isolation unit for users, clients, roles, policies.', 'realm name/settings', 'identity domain boundary', 'realm: skillup-prod', 'Mixing environments in one realm increases blast radius.'),
      api('Client', 'OIDC/SAML client configuration', 'Represents an application requesting auth tokens.', 'client id, redirect URIs, access type', 'issued tokens for app', 'clientId=skillup-web', 'Wildcards in redirect URIs weaken security.'),
      api('Role Mapping', 'realm roles + client roles', 'Assigns authorization semantics to users/groups.', 'role definitions and assignments', 'token role claims', 'user -> role: trader_admin', 'Role explosion can become unmanageable without hierarchy.'),
      api('Protocol Mapper', 'token claim mappers', 'Maps user/session attributes into token claims.', 'mapper configs', 'customized tokens', 'add department claim from user attr', 'Overexposing user attributes increases token sensitivity.'),
      api('Identity Provider', 'external IdP broker config', 'Federates login with Google/AzureAD/other OIDC/SAML IdPs.', 'IdP metadata and mappers', 'brokered identities', 'configure Azure AD as IdP', 'Claim mapping errors can lock users out.'),
      api('Authorization Services', 'resource/scopes/policies', 'Policy-based access control inside Keycloak.', 'resources, policies, permissions', 'allow/deny decisions', 'define scope `trade:execute` with role policy', 'Complex policies need test coverage to avoid accidental allows.'),
      api('Admin REST API', '/admin/realms/... endpoints', 'Automates user/client/role management.', 'admin token and payload', 'management operations', 'POST /admin/realms/skillup/users', 'Protect admin API credentials aggressively.'),
      api('Token Endpoint', '/protocol/openid-connect/token', 'Issues and refreshes OIDC/OAuth tokens.', 'grant params and client auth', 'token response', 'grant_type=refresh_token', 'Monitor token issuance anomalies.'),
    ],
    refs: [
      ref('Keycloak Docs', 'https://www.keycloak.org/documentation'),
      ref('Keycloak Server Admin Guide', 'https://www.keycloak.org/docs/latest/server_admin/'),
      ref('Keycloak Securing Apps Guide', 'https://www.keycloak.org/docs/latest/securing_apps/'),
      ref('Keycloak Authorization Services', 'https://www.keycloak.org/docs/latest/authorization_services/'),
      ref('Keycloak GitHub', 'https://github.com/keycloak/keycloak'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(keycloak);

  [
    'Realm & Client Configuration',
    'Role-Based Access Control',
    'Identity Federation',
    'Token Mappers',
    'Session & Token Lifetimes',
    'Admin Automation',
  ].forEach((name) => {
    skills.push(
      mk(name, 'auth', keycloak.id, {
        definition: `${name} is a Keycloak capability required for secure enterprise auth operations.`,
        codeExample:
          name === 'Role-Based Access Control'
            ? "if (!token.realm_access.roles.includes('trader_admin')) {\n  return res.status(403).json({ error: 'forbidden' });\n}"
            : name === 'Session & Token Lifetimes'
              ? "accessTokenLifespan = 15m\nssoSessionIdleTimeout = 30m"
              : "POST /admin/realms/skillup/users",
        flashcards: [
          card(`What commonly fails in ${name}?`, 'Configuration drift between identity provider setup and application authorization assumptions.'),
          card(`How do you de-risk ${name}?`, 'Version-controlled config exports, staging parity, and automated login/token contract tests.'),
        ],
      })
    );
  });

  const totp = mk('2FA (TOTP)', 'auth', null, {
    definition:
      'TOTP (Time-based One-Time Password) is an MFA factor generating short-lived numeric codes from a shared secret and time step. It raises account security by requiring possession of a second factor in addition to password/token. Proper enrollment, backup, and recovery flows are essential for usability and lockout prevention.',
    codeExample:
      "import speakeasy from 'speakeasy';\nimport qrcode from 'qrcode';\n\nconst secret = speakeasy.generateSecret({ name: 'SkillUp:user@example.com' });\nconst qr = await qrcode.toDataURL(secret.otpauth_url);\n\nconst ok = speakeasy.totp.verify({\n  secret: secret.base32,\n  encoding: 'base32',\n  token: '123456',\n  window: 1,\n});\n\nconsole.log({ qr, ok });",
    whenUsed: 'Used in `p-stock` with Keycloak-integrated 2FA login hardening.',
    gotchas:
      'No backup/recovery codes can lock out legitimate users permanently.\nLarge clock drift tolerance windows can weaken OTP security.\nStoring raw OTP secrets without encryption increases compromise impact.\nSkipping brute-force throttling on OTP verification enables online guessing.',
    flashcards: [
      card('Why does TOTP require secure secret storage?', 'Compromised shared secret allows attacker to generate valid codes indefinitely.'),
      card('What does verification `window` parameter trade off?', 'Larger window improves tolerance for time drift but increases acceptance surface for replay/guessing.'),
      card('Why should OTP attempts be rate-limited?', 'Six-digit spaces are small enough for feasible online brute force without throttling.'),
      card('What are recovery codes for?', 'Emergency account access when device is lost, while maintaining MFA posture.'),
      card('Why should enrollment require current primary auth?', 'It prevents attacker from silently binding their own second factor.'),
      card('How does TOTP differ from SMS OTP in threat model?', 'TOTP avoids telecom interception/SIM swap vectors but still depends on device security.'),
      card('What is replay concern in OTP systems?', 'Reusing same valid code within acceptance window unless one-time semantics are enforced.'),
      card('Why monitor OTP failure patterns?', 'Spikes can indicate credential stuffing or targeted account takeover attempts.'),
    ],
    apis: [
      api('generateSecret', 'speakeasy.generateSecret(options)', 'Generates TOTP shared secret and otpauth URI.', 'issuer/account naming options', 'secret object', "const secret = speakeasy.generateSecret({ name: 'SkillUp:user@x.com' });", 'Secret lifecycle must be encrypted and access-controlled.'),
      api('totp.verify', 'speakeasy.totp.verify({ secret, encoding, token, window })', 'Verifies submitted OTP against secret and current time.', 'secret/token/window options', 'boolean', "const ok = speakeasy.totp.verify({ secret, encoding: 'base32', token });", 'Window too large reduces effective security.'),
      api('otpauth URI', 'otpauth://totp/{issuer}:{account}?secret=...&issuer=...', 'Standard URI format for authenticator apps.', 'issuer/account/secret params', 'URI string', "const uri = secret.otpauth_url;", 'Issuer/account mismatches confuse users during enrollment.'),
      api('QR code generation', 'qrcode.toDataURL(otpauthUrl)', 'Renders enrollment QR for authenticator scanning.', 'otpauth URI', 'data URL/image', 'const qr = await qrcode.toDataURL(secret.otpauth_url);', 'Do not log or expose QR payload in analytics.'),
      api('Backup codes', 'pre-generated one-time recovery tokens', 'Alternative second-factor recovery mechanism.', 'secure random token set', 'fallback auth factors', 'Store salted hashes of recovery codes.', 'Plaintext storage defeats recovery-code security.'),
      api('Rate limit', 'attempt throttling by user/IP/device', 'Limits OTP verification attempts.', 'attempt counters/time windows', 'allow/deny', 'max 5 attempts / 5 min per account', 'Must avoid lockout abuse (griefing) with balanced policy.'),
    ],
    refs: [
      ref('RFC 6238 TOTP', 'https://www.rfc-editor.org/rfc/rfc6238'),
      ref('OWASP MFA Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html'),
      ref('speakeasy', 'https://github.com/speakeasyjs/speakeasy'),
      ref('NIST Digital Identity Guidelines', 'https://pages.nist.gov/800-63-3/'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(totp);

  [
    'Enrollment & QR Provisioning',
    'Verification Windows & Drift',
    'Backup Codes',
    'Attempt Throttling',
    'Recovery Flows',
  ].forEach((name) => {
    skills.push(
      mk(name, 'auth', totp.id, {
        definition: `${name} is required for secure and user-safe 2FA operations at scale.`,
        codeExample:
          name === 'Attempt Throttling'
            ? "if (attempts > 5) {\n  return res.status(429).json({ error: 'otp_rate_limited' });\n}"
            : name === 'Verification Windows & Drift'
              ? "speakeasy.totp.verify({ secret, token, encoding: 'base32', window: 1 });"
              : 'const recoveryCodeHash = hash(code);',
        flashcards: [
          card(`What is a critical risk in ${name}?`, 'Balancing strict security with recovery usability to avoid either takeover or lockout.'),
          card(`How do you test ${name}?`, 'Simulate lost-device, clock-drift, brute-force, and account-recovery scenarios end-to-end.'),
        ],
      })
    );
  });

  const md5 = mk('MD5', 'auth', null, {
    definition:
      'MD5 is a legacy hash function that is cryptographically broken for collision resistance and unsuitable for security-sensitive use. It remains relevant mainly for non-adversarial checksums or legacy interoperability contexts. It must not be used for password hashing, signatures, or integrity under attacker control.',
    codeExample:
      "import crypto from 'node:crypto';\n\nconst digest = crypto.createHash('md5').update('sample').digest('hex');\nconsole.log(digest);",
    whenUsed:
      'Mentioned for legacy understanding and migration; should be replaced by stronger primitives in active security flows.',
    gotchas:
      'Collision attacks are practical enough to break trust assumptions.\nMD5 with salt is still not acceptable for password hashing.\nUsing MD5 for file integrity against active attackers is insecure.',
    flashcards: [
      card('Why is MD5 still seen in software despite being broken?', 'Legacy protocols/checksum use cases persist where collision resistance is not threat-critical.'),
      card('Can MD5 ever be acceptable in modern auth/security?', 'No for security-critical integrity/signature/password contexts; use SHA-2/3 + proper constructions.'),
      card('Why is fast hash bad for password storage?', 'Fast hashes enable high-rate brute force on leaked hashes; use adaptive KDFs like Argon2/bcrypt/scrypt.'),
      card('What is the main cryptographic failure in MD5?', 'Collision resistance is broken, enabling two different inputs with same digest.'),
    ],
    apis: [
      api('crypto.createHash("md5")', 'crypto.createHash("md5").update(data).digest("hex")', 'Computes MD5 digest.', 'input bytes/string and output encoding', 'digest string/buffer', "const md5 = crypto.createHash('md5').update(buf).digest('hex');", 'Do not use for signatures/password security.'),
      api('Checksum comparison', 'md5(fileA) === md5(fileB)', 'Compares checksums in non-adversarial workflows.', 'two digest values', 'boolean equality', 'if (a === b) console.log("same content checksum");', 'Adversarial collision can bypass naive integrity checks.'),
    ],
    refs: [
      ref('RFC 1321 MD5', 'https://www.rfc-editor.org/rfc/rfc1321'),
      ref('NIST Hash Guidance', 'https://csrc.nist.gov/projects/hash-functions'),
      ref('OWASP Password Storage', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'),
      ref('Node.js Crypto', 'https://nodejs.org/api/crypto.html'),
    ],
  });
  skills.push(md5);

  const sha = mk('SHA', 'auth', null, {
    definition:
      'SHA typically refers to the Secure Hash Algorithm family, especially SHA-2 variants like SHA-256 and SHA-512. SHA-2 is widely used for integrity checks, digital signatures, and HMAC constructions. For passwords, SHA alone is insufficient; dedicated password hashing algorithms should be used.',
    codeExample:
      "import crypto from 'node:crypto';\n\nconst hash = crypto.createHash('sha256').update('important payload').digest('hex');\nconst hmac = crypto.createHmac('sha256', process.env.HMAC_KEY).update('important payload').digest('hex');\n\nconsole.log({ hash, hmac });",
    whenUsed:
      'Used across backend security pipelines for integrity/HMAC needs; complements JWT and API signature workflows.',
    gotchas:
      'Using plain SHA for password hashing is insecure due to speed.\nConfusing hash with encryption leads to incorrect data-protection designs.\nNot using constant-time comparison on signatures enables timing attacks.',
    flashcards: [
      card('Why is HMAC-SHA256 stronger than plain SHA256 for message authenticity?', 'HMAC uses a secret key and resists length-extension and forgery attacks.'),
      card('What is the difference between hashing and encryption?', 'Hashing is one-way integrity fingerprinting; encryption is reversible confidentiality with key.'),
      card('Why can SHA-256 still fail for password storage?', 'It is computationally fast; attackers can brute force rapidly without adaptive memory-hard cost.'),
      card('When should SHA-512 be preferred over SHA-256?', 'When policy/compliance requires it; practical security difference is usually workload/context dependent.'),
      card('What does salting prevent in password hashing?', 'Precomputed rainbow-table attacks and identical-hash leakage for equal passwords.'),
      card('Why should signature comparison use constant-time functions?', 'Naive string comparison can leak information via timing side channels.'),
      card('What is length-extension attack relevance?', 'Some constructions using raw hash(secret || msg) are vulnerable; HMAC avoids this pattern.'),
      card('What is a secure replacement for plain SHA password storage?', 'Argon2id (preferred), bcrypt, or scrypt with proper cost parameters and salt.'),
    ],
    apis: [
      api('crypto.createHash("sha256")', 'crypto.createHash("sha256").update(data).digest("hex")', 'Computes SHA-256 digest.', 'input bytes and encoding', 'digest output', "const digest = crypto.createHash('sha256').update(data).digest('hex');", 'Digest alone does not provide authenticity.'),
      api('crypto.createHash("sha512")', 'crypto.createHash("sha512")...', 'Computes SHA-512 digest.', 'input data', 'digest output', "const d = crypto.createHash('sha512').update(data).digest('hex');", 'Output length differs; ensure protocol expectations.'),
      api('crypto.createHmac', 'crypto.createHmac(algorithm, key).update(data).digest()', 'Computes keyed message authentication code.', 'algorithm, secret key, input data', 'HMAC digest', "const sig = crypto.createHmac('sha256', key).update(body).digest('hex');", 'Key management is as important as algorithm choice.'),
      api('crypto.timingSafeEqual', 'crypto.timingSafeEqual(a, b)', 'Compares buffers in constant time.', 'same-length buffers', 'boolean', "if (!timingSafeEqual(Buffer.from(a), Buffer.from(b))) deny();", 'Buffers must have equal length before call.'),
      api('PBKDF2 (legacy KDF)', 'crypto.pbkdf2(password, salt, iter, keylen, digest, cb)', 'Derives keys with configurable iteration cost.', 'password, salt, iterations, digest', 'derived key', "crypto.pbkdf2(pass, salt, 200000, 32, 'sha256', cb);", 'Prefer Argon2id/scrypt where available for password storage.'),
      api('SHA-3 availability', 'algorithm: sha3-256 / sha3-512', 'Newer SHA family variants in crypto libraries.', 'input data', 'digest output', "crypto.createHash('sha3-256').update(data).digest('hex');", 'Algorithm support depends on runtime/OpenSSL version.'),
    ],
    refs: [
      ref('NIST SHA Standard (FIPS 180-4)', 'https://csrc.nist.gov/publications/detail/fips/180/4/final'),
      ref('RFC 2104 HMAC', 'https://www.rfc-editor.org/rfc/rfc2104'),
      ref('OWASP Password Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'),
      ref('Node.js Crypto API', 'https://nodejs.org/api/crypto.html'),
      ref('NIST SP 800-132 (PBKDF guidance)', 'https://csrc.nist.gov/pubs/sp/800/132/final'),
    ],
  });
  skills.push(sha);

  return skills;
}
