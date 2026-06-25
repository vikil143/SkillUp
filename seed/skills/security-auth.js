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
      card('Why is JWT often paired with short-lived access token + refresh token?', 'Use a 5-15 minute access token for API calls and a longer-lived refresh token to obtain new access tokens; this limits stolen access-token lifetime while preserving login UX and enabling refresh-token rotation/revocation.'),
      card('What is algorithm confusion in JWT validation?', 'A verifier trusts the token header alg instead of pinning allowed algorithms, so an attacker may switch RS256 to HS256, use a public key as an HMAC secret, or try alg=none to bypass verification.'),
      card('Why should JWT payload be considered readable?', 'JWT header and payload are base64url-encoded JSON, not encrypted; anyone with the token can decode claims unless the token is a JWE.'),
      card('When is server-side session preferable over pure JWT stateless auth?', 'Use server-side sessions when you need instant logout, per-device session kill, central risk checks, or server-controlled session state on every request.'),
      card('Why include `jti` in JWT designs?', '`jti` is a unique token ID; store it in allow/deny lists to detect replay, revoke one token, or trace a token family during incident response.'),
      card('What is a safe browser storage strategy for JWT?', 'Prefer Secure, httpOnly, SameSite=Lax/Strict cookies so JavaScript cannot read the token; pair with CSRF protection for unsafe methods.'),
      card('Why is clock skew important for JWT expiry checks?', 'Servers may differ by seconds; allow a small leeway, commonly 30-120 seconds, for exp/nbf checks while keeping token lifetimes short.'),
      card('What does token introspection solve that self-contained JWT does not?', 'It lets the resource server ask the authorization server whether a token is currently active, revoked, expired, and what metadata/scopes apply.'),
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
          card(`What breaks first in ${name}?`, 'Token validation usually fails first: missing algorithm pinning, aud/iss checks, exp/nbf checks, or revocation logic can make a token valid in the wrong service or time window.'),
          card(`How do you verify ${name} hardening?`, 'Add tests that reject expired tokens, future nbf, wrong aud/iss, algorithm mismatch, tampered signatures, and revoked jti/session IDs.'),
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
      card('Why is PKCE required even for public clients?', 'PKCE binds the authorization request to the token request with a high-entropy code_verifier, so a stolen authorization code cannot be exchanged without the verifier.'),
      card('What is the difference between OAuth and OIDC?', 'OAuth grants API access with access tokens and scopes; OIDC adds authentication by returning an ID token with user identity claims such as sub and email.'),
      card('Why should redirect URIs be exact-matched?', 'Exact matching prevents attackers from registering lookalike or open-redirect URLs that receive authorization codes or tokens.'),
      card('What does `state` protect against in OAuth?', '`state` is a random nonce stored before redirect and checked on callback; it prevents CSRF and helps bind the response to the original login attempt.'),
      card('Why are refresh tokens risky on public clients?', 'Public clients cannot keep secrets; a stolen refresh token can mint new access tokens until it expires or is detected by rotation/reuse checks.'),
      card('What is token audience in multi-API systems?', '`aud` identifies the intended resource server; each API should reject tokens whose audience does not include that API.'),
      card('When should client credentials grant be used?', 'Use client credentials only for service-to-service access where the client authenticates as itself, not on behalf of a user.'),
      card('Why is scope minimization a security control?', 'Request only scopes needed for the action, e.g. read:orders instead of admin:*, so stolen or over-issued tokens have limited authority.'),
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
          card(`What is the frequent mistake in ${name}?`, 'Trusting the callback just because a code/token exists; the client must validate state, PKCE, exact redirect_uri, token audience, issuer, and granted scopes.'),
          card(`How do you test ${name} safely?`, 'Verify rejection for missing/wrong state, reused authorization code, missing PKCE verifier, bad redirect_uri, wrong audience, and over-broad scopes.'),
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
      card('Why is Keycloak realm design important?', 'A realm isolates users, clients, roles, sessions, and policies; use separate realms when tenants/environments must not share identity policy or admin blast radius.'),
      card('What is the difference between realm roles and client roles?', 'Realm roles apply across the realm; client roles belong to one application/client and should model that app API permissions.'),
      card('Why should backend still validate tokens with Keycloak setup?', 'The API must verify signature, issuer, audience, expiry, and required roles/scopes; a logged-in frontend alone does not authorize API access.'),
      card('What does offline token access imply?', 'An offline token is a long-lived refresh token usable without an active SSO session, so it needs explicit consent, secure storage, monitoring, and revocation.'),
      card('Why use Keycloak events/audit logs?', 'They record login, logout, token, admin, and error events, enabling incident investigation, anomaly detection, and compliance evidence.'),
      card('How does identity brokering help enterprises?', 'Keycloak can trust external IdPs such as Azure AD or Google, map their claims/roles, and issue local tokens with one central policy layer.'),
      card('What breaks often during Keycloak upgrades?', 'Custom themes, SPIs/extensions, protocol mappers, token/session defaults, and deprecated adapter behavior often need regression testing.'),
      card('Why is client secret handling critical?', 'A leaked confidential-client secret lets an attacker authenticate to the token endpoint as that client and request tokens within its allowed grants/scopes.'),
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
          card(`What commonly fails in ${name}?`, 'Client config drifts: redirect URIs, access type, protocol mappers, role claims, or token lifetimes no longer match backend validation rules.'),
          card(`How do you de-risk ${name}?`, 'Export realm config, review diffs, mirror staging/prod settings, and run tests that log in, refresh tokens, and assert expected role/claim shapes.'),
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
      card('Why does TOTP require secure secret storage?', 'The shared secret is enough to generate every future code; encrypt it at rest, limit admin access, and rotate/re-enroll if exposed.'),
      card('What does verification `window` parameter trade off?', 'A window of 1 usually accepts the previous/current/next 30-second step; larger windows tolerate drift but give attackers more valid codes and replay time.'),
      card('Why should OTP attempts be rate-limited?', 'A 6-digit TOTP has only 1,000,000 possibilities; throttle by account and IP/device so online guessing cannot try many codes per time step.'),
      card('What are recovery codes for?', 'They are single-use backup factors for lost authenticator devices; store only salted hashes and invalidate each code after use.'),
      card('Why should enrollment require current primary auth?', 'Requiring a fresh password/session check prevents an attacker with a stolen session from adding their own authenticator silently.'),
      card('How does TOTP differ from SMS OTP in threat model?', 'TOTP removes carrier/SIM-swap and SMS interception risk, but still fails if the device, seed, or phishing-resistant login flow is compromised.'),
      card('What is replay concern in OTP systems?', 'A valid TOTP may work for the whole accepted window; track the last accepted time step per user to reject reuse.'),
      card('Why monitor OTP failure patterns?', 'Many failures for one account, IP, ASN, or device fingerprint can indicate credential stuffing, MFA fatigue attempts, or targeted takeover.'),
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
          card(`What is a critical risk in ${name}?`, 'Weak enrollment or recovery can let attackers add/bypass MFA; overly strict recovery can permanently lock out legitimate users.'),
          card(`How do you test ${name}?`, 'Test enrollment with current auth, valid/expired/reused codes, drift window boundaries, rate limits, recovery-code use, and lost-device reset approval.'),
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
      card('Why is MD5 still seen in software despite being broken?', 'It persists in legacy protocols and non-adversarial checksums such as old ETags or cache keys, where inputs are trusted and collisions do not affect security decisions.'),
      card('Can MD5 ever be acceptable in modern auth/security?', 'No. Do not use MD5 for passwords, signatures, certificates, MACs, or attacker-controlled integrity checks; use SHA-256/HMAC-SHA256 or a password KDF as appropriate.'),
      card('Why is fast hash bad for password storage?', 'After a database leak, attackers can test huge password lists offline; use Argon2id, bcrypt, or scrypt so each guess costs time and memory.'),
      card('What is the main cryptographic failure in MD5?', 'MD5 has practical collision attacks: attackers can craft two different inputs with the same digest, breaking trust in signatures or integrity checks.'),
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
      card('Why is HMAC-SHA256 stronger than plain SHA256 for message authenticity?', 'HMAC-SHA256 uses a secret key, so only key holders can create a valid tag; plain SHA-256 only proves the message has a digest, not who created it.'),
      card('What is the difference between hashing and encryption?', 'Hashing is one-way and used for fingerprints/integrity; encryption is reversible with a key and used to protect confidentiality.'),
      card('Why can SHA-256 still fail for password storage?', 'SHA-256 is designed to be fast, so leaked hashes can be brute-forced cheaply; password storage needs a salted, slow, memory-hard KDF.'),
      card('When should SHA-512 be preferred over SHA-256?', 'Use SHA-512 when a protocol, compliance rule, or 64-bit performance profile calls for it; otherwise SHA-256 is usually sufficient for modern integrity/HMAC use.'),
      card('What does salting prevent in password hashing?', 'A unique random salt per password prevents rainbow-table reuse and ensures two users with the same password have different stored hashes.'),
      card('Why should signature comparison use constant-time functions?', 'Constant-time comparison avoids revealing how many bytes matched, which can otherwise help attackers guess valid MAC/signature bytes.'),
      card('What is length-extension attack relevance?', 'Raw hash(secret || message) can let attackers append data and forge a valid-looking digest; HMAC is designed to prevent that.'),
      card('What is a secure replacement for plain SHA password storage?', 'Use Argon2id where available, or bcrypt/scrypt/PBKDF2 with strong parameters, unique salts, and periodic cost tuning.'),
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

  // Added by Claude Code audit — 2026-05-20

  // JWT — additional top-level flashcards
  jwt.flashcards.push(
    card('What is the operational difference between RS256 and HS256?', 'HS256 uses one shared secret — both issuer and verifier must hold it. RS256 uses a private key to sign and a public key to verify — resource servers can verify without holding the secret.'),
    card('What is a JWKS endpoint and why does it matter?', 'A JWKS endpoint (/.well-known/jwks.json) publishes the public keys used for token verification, enabling key rotation without redeploying all services.'),
    card('How does the `nbf` (not-before) claim differ from `iat` (issued-at)?', 'iat records when the token was created; nbf sets when it becomes valid — useful for delayed activation or pre-issued tokens.'),
    card('What is JWE and when would you use it over a signed JWT?', 'A normal signed JWT (JWS) is readable by anyone who has the token; the signature only proves integrity. JWE encrypts the payload, so use it when token claims must stay confidential while passing through untrusted intermediaries.'),
  );

  // JWT — additional APIs
  jwt.apis.push(
    api('JWKS endpoint', 'GET /.well-known/jwks.json', 'Publishes public keys for RS256/ES256 token verification.', 'none — public endpoint', 'JSON Web Key Set', '{ keys: [{ kty: "RSA", kid: "key1", n: "...", e: "AQAB" }] }', 'Cache the JWKS response (with TTL) to avoid per-request key fetches.'),
    api('RS256 key generation', 'crypto.generateKeyPairSync("rsa", { modulusLength: 2048 })', 'Generates RSA keypair for asymmetric JWT signing.', 'algorithm and key options', '{ privateKey, publicKey }', "const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {\n  modulusLength: 2048,\n  publicKeyEncoding: { type: 'spki', format: 'pem' },\n  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },\n});", 'Store private key in secrets manager; only distribute public key.'),
  );

  // JWT sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== jwt.id) return;
    const specific = {
      'Token Structure & Claims': [
        card('What are the three dot-separated parts of a JWT?', 'Header (algorithm + type), Payload (claims), Signature — each is base64url-encoded. Only the signature provides integrity; the header and payload are readable by anyone.'),
        card('What is the difference between registered, public, and private claims?', 'Registered claims (iss, sub, aud, exp, nbf, iat, jti) are standardised. Public claims are collision-resistant names. Private claims are custom — agreed between issuer and consumer.'),
      ],
      'Signing Algorithms (HS/RS/ES)': [
        card('Why is ES256 (ECDSA) increasingly preferred over RS256?', 'ES256 provides strong security with much shorter signatures than RS256, reducing JWT size for mobile/API traffic; choose it only when libraries and key management support ECDSA correctly.'),
        card('Why must the `alg: none` algorithm be explicitly rejected?', 'The none algorithm means no signature is verified — an attacker can craft arbitrary claims if your library accepts it without explicit rejection.'),
      ],
      'Access vs Refresh Tokens': [
        card('What is the recommended access token lifetime?', '5–15 minutes — short enough to limit the window of misuse if stolen, long enough to avoid excessive refresh overhead.'),
        card('Why should refresh tokens be stored server-side in a database?', 'Store a hashed refresh token or token-family record server-side so logout, rotation reuse, and compromise response can revoke it before expiry.'),
      ],
      'Revocation Strategies': [
        card('Why is stateless JWT revocation inherently difficult?', 'JWTs are self-contained and valid until expiry — the only ways to revoke are short expiry + refresh, a server-side denylist keyed on jti, or using opaque tokens with introspection.'),
        card('What is refresh token rotation and what attack does it detect?', 'Issue a new refresh token on every use and invalidate the old one. If the old token is presented again, it indicates theft — invalidate the entire token family.'),
      ],
      'Storage & CSRF/XSS Tradeoffs': [
        card('Why does httpOnly cookie storage protect against XSS?', 'httpOnly cookies are not accessible via document.cookie in JavaScript — an XSS payload cannot read or exfiltrate the token.'),
        card('What CSRF mitigation is required when using cookie-stored JWTs?', 'SameSite=Strict or SameSite=Lax prevents cross-site request forgery for most cases; for fine-grained control also validate a custom CSRF header or double-submit cookie.'),
      ],
      'Audience/Issuer Validation': [
        card('What is a token substitution attack?', 'A token issued for service A is presented to service B. Validating the `aud` claim prevents this — service B rejects tokens whose audience does not include its identifier.'),
        card('Why pin allowed algorithms in jwt.verify options?', 'Without explicit algorithm pinning, a manipulated token header could switch to a weaker algorithm — always pass `algorithms: ["RS256"]` explicitly.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // OAuth sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== oauth.id) return;
    const specific = {
      'OAuth Roles & Actors': [
        card('What are the four OAuth roles?', 'Resource Owner (user), Client (app requesting access), Authorization Server (issues tokens), Resource Server (API that accepts tokens).'),
        card('What is the difference between a confidential and public OAuth client?', 'Confidential clients can securely hold a client_secret (server-side apps); public clients (SPAs, mobile apps) cannot — they must use PKCE instead of client secrets.'),
      ],
      'Authorization Code + PKCE': [
        card('What entropy is required for the PKCE code verifier?', 'At least 32 cryptographically random bytes (256 bits) — insufficient entropy makes the verifier guessable and negates PKCE protection.'),
        card('Why is the authorization code single-use?', 'Codes expire after one exchange to limit the window for interception; a server should reject any code presented more than once.'),
      ],
      'Scopes & Consent': [
        card('What is incremental authorisation?', 'Requesting only the scopes needed for the current action rather than all scopes upfront — reduces consent friction and follows least-privilege principle.'),
        card('Why should scopes not map directly to database roles?', 'OAuth scopes represent delegated access grants to an API; RBAC roles are internal resource permissions. Mapping them directly couples the auth layer to internal implementation.'),
      ],
      'Refresh Token Rotation': [
        card('What is refresh token family invalidation?', 'When a reused (stolen) refresh token is detected, invalidate all tokens in the same lineage — prevents the attacker from continuing to use any token from that session.'),
        card('Why give refresh tokens a sliding vs absolute expiry?', 'Sliding expiry extends the session with each use (good UX for active users); absolute expiry forces re-authentication after a fixed period regardless — choose based on security policy.'),
      ],
      'OIDC Basics': [
        card('What does the ID token contain that an access token does not?', 'The ID token carries user identity claims (sub, email, name, picture) for the client application; the access token carries authorization for resource server API calls.'),
        card('Why should you not use the access token to identify the user?', 'Access tokens are opaque to the client in many flows and their format is not guaranteed — the ID token is the correct place to read user identity.'),
      ],
      'Token Introspection & Revocation': [
        card('What does an introspection response of `active: false` mean?', 'The token is expired, revoked, or otherwise invalid — the resource server must reject the request.'),
        card('Why cache introspection responses carefully?', 'Caching an active: true response too long means a revoked token continues to work during the cache TTL — use short TTLs (30–60s) for revocation-sensitive APIs.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // Keycloak sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== keycloak.id) return;
    const specific = {
      'Realm & Client Configuration': [
        card('What are Valid Redirect URIs and why must they be exact?', 'Keycloak only redirects auth codes to URIs on this allowlist; exact entries prevent wildcard/open-redirect abuse that can leak authorization codes.'),
        card('What is the difference between public and confidential client access types?', 'Confidential clients authenticate with a client secret on the token endpoint; public clients (SPAs, mobile) cannot hold secrets and rely on PKCE.'),
      ],
      'Role-Based Access Control': [
        card('How do realm roles differ from composite roles?', 'Composite roles aggregate other roles — assigning a composite role to a user implicitly grants all its contained roles, simplifying management of permission bundles.'),
        card('Why should backends validate roles from the token rather than querying Keycloak on every request?', 'Token validation is local and fast; querying Keycloak on every request adds latency and creates a dependency on Keycloak availability for every API call.'),
      ],
      'Identity Federation': [
        card('What is first broker login flow in Keycloak?', 'The flow executed the first time a user authenticates through an external IdP — determines whether to auto-create a local account, prompt for review, or link to existing accounts.'),
        card('Why can claim mapping errors lock users out of brokered identity?', 'If the mapper cannot extract a required attribute (e.g., email) from the IdP token, Keycloak may refuse to create or link the account.'),
      ],
      'Token Mappers': [
        card('What is a hardcoded claim mapper?', 'A mapper that injects a fixed value into every token for all users in the realm or client — useful for adding a static audience or service identifier claim.'),
        card('Why should you minimise claims in access tokens?', 'Every claim increases token size (sent with every API request) and may expose sensitive user attributes to any service that receives the token.'),
      ],
      'Session & Token Lifetimes': [
        card('What is SSO Session Idle vs Max in Keycloak?', 'Idle timeout resets on each user interaction; Max is the absolute ceiling regardless of activity — use both to balance UX and security.'),
        card('Why do long access token lifetimes increase risk?', 'A stolen access token remains valid until expiry — no server-side revocation for standard JWT access tokens. Short lifetimes limit the exposure window.'),
      ],
      'Admin Automation': [
        card('How do you authenticate against the Keycloak Admin REST API?', 'Obtain an admin access token for a service account with the required realm-management roles, then send it as Bearer auth to /admin/realms/... endpoints.'),
        card('What should you export from Keycloak for disaster recovery?', 'Full realm export (users, clients, roles, identity providers, flows) — store it versioned in source control and test importing regularly.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // MD5 — additional flashcards (target 6–10; currently 4)
  md5.flashcards.push(
    card('What is a collision in hash functions and why is it dangerous for MD5?', 'A collision is two different inputs producing the same digest. MD5 collisions are computationally feasible — attackers can forge matching files or certificates.'),
    card('When is MD5 still acceptable in modern software?', 'Non-security checksum use cases where collision resistance is irrelevant and no adversary controls the input — e.g., cache-busting query strings, content-addressing in low-security systems.'),
    card('Why is salted MD5 still insecure for password storage?', 'MD5 is extremely fast — a GPU can compute billions of MD5 hashes per second. Even with a salt, a brute-force attack on a leaked hash is feasible within hours.'),
    card('What should replace MD5 in new code?', 'SHA-256 for integrity checks, HMAC-SHA256 for message authentication, and Argon2id/bcrypt/scrypt for password hashing — never MD5 for any security-sensitive purpose.'),
  );

  // MD5 — additional APIs
  md5.apis.push(
    api('Streaming hash (MD5)', 'crypto.createHash("md5") with stream piping', 'Computes MD5 of large file without loading it entirely into memory.', 'readable stream piped to hash', 'hex digest', "import { createHash } from 'node:crypto';\nimport { createReadStream } from 'node:fs';\nconst hash = createHash('md5');\ncreateReadStream('file.bin').pipe(hash).on('finish', () => console.log(hash.digest('hex')));", 'Streaming prevents memory spikes but is still insecure for adversarial contexts.'),
    api('crypto.getHashes()', 'crypto.getHashes()', 'Lists all hash algorithms supported by the current OpenSSL build.', 'none', 'string[]', "console.log(crypto.getHashes()); // includes 'md5', 'sha256', ...", 'Use to verify algorithm availability before committing to a choice.'),
  );

  // MD5 — sub-topics (0 exist; need 3+)
  const md5Collision = mk('Collision Attacks & Weaknesses', 'auth', md5.id, {
    definition: 'MD5 collision resistance is broken — two different inputs can be crafted to produce the same hash. This undermines any use case relying on MD5 for integrity or authenticity guarantees.',
    codeExample: "// Conceptual — do not use MD5 for integrity\n// Wang & Yu (2004) demonstrated practical MD5 collisions.\n// Modern tools can generate colliding files in seconds.\nconst a = crypto.createHash('md5').update(fileA).digest('hex');\nconst b = crypto.createHash('md5').update(fileB).digest('hex');\n// a === b even if fileA !== fileB (collision)",
    flashcards: [
      card('What was the Flame malware MD5 attack?', 'Flame used an MD5 chosen-prefix collision to forge a legitimate-looking Microsoft code-signing certificate, enabling it to spread as a Windows Update.'),
      card('What is a chosen-prefix collision?', 'An attack where two arbitrary chosen prefixes can be extended with crafted suffixes to produce the same MD5 hash — stronger than identical-prefix collisions.'),
      card('Why does MD5 collision resistance matter for TLS certificates?', 'Certificate authorities that signed with MD5 allowed attackers to forge trusted certificates by exploiting MD5 collisions.'),
    ],
  });

  const md5Legacy = mk('Legacy Use Cases', 'auth', md5.id, {
    definition: 'MD5 persists in systems where its use predates modern cryptography knowledge, or where non-adversarial checksums are acceptable and collision resistance is not required.',
    codeExample: "// Acceptable: cache-busting asset fingerprinting (non-adversarial)\nconst assetHash = crypto.createHash('md5').update(assetContent).digest('hex').slice(0, 8);\nconst url = `/static/app.${assetHash}.js`;\n// NOT acceptable: file integrity checks, password storage, signatures",
    flashcards: [
      card('Name two contexts where MD5 is still seen in production.', 'HTTP ETag generation in some web servers, and legacy checksum verification in older package managers (pre-SHA256 era).'),
      card('What should you do when you encounter MD5 in an existing codebase?', 'Add a migration issue — replace with SHA-256 for integrity checks or Argon2id for passwords. Document the change clearly so reviewers understand the security improvement.'),
    ],
  });

  const md5Migration = mk('Migration to SHA-2/3', 'auth', md5.id, {
    definition: 'Migrating from MD5 to SHA-256 (or Argon2id for passwords) improves security posture without significant performance cost in most applications.',
    codeExample: "// Before (insecure):\nconst digest = crypto.createHash('md5').update(data).digest('hex');\n\n// After (secure for integrity):\nconst digest = crypto.createHash('sha256').update(data).digest('hex');\n\n// For passwords — use bcrypt/argon2, not raw SHA:\nimport argon2 from 'argon2';\nconst hash = await argon2.hash(password);",
    flashcards: [
      card('Is SHA-256 a drop-in replacement for MD5 in all contexts?', 'For non-security checksums and integrity use cases — yes. For password storage — no. SHA-256 is too fast; use Argon2id, bcrypt, or scrypt with appropriate cost parameters.'),
      card('What is the risk of migrating password hashes from MD5 to bcrypt?', 'You cannot re-hash existing passwords without knowing the plaintext. Use a lazy migration: when users next log in, verify against MD5, then immediately re-hash with bcrypt.'),
    ],
  });
  skills.push(md5Collision, md5Legacy, md5Migration);

  // SHA — sub-topics (0 exist; need 3+)
  const shaFamily = mk('SHA-2 Family Overview', 'auth', sha.id, {
    definition: 'SHA-2 is a family of hash functions standardised by NIST including SHA-224, SHA-256, SHA-384, and SHA-512. SHA-256 is the most widely used variant for integrity checks, certificates, and HMAC constructions.',
    codeExample: "import { createHash } from 'node:crypto';\n\nconst sha256 = createHash('sha256').update('data').digest('hex'); // 64 hex chars\nconst sha512 = createHash('sha512').update('data').digest('hex'); // 128 hex chars\nconst sha384 = createHash('sha384').update('data').digest('hex'); // 96 hex chars",
    flashcards: [
      card('What is the output size of SHA-256 vs SHA-512?', 'SHA-256 produces 256-bit (32-byte) digests; SHA-512 produces 512-bit (64-byte) digests. Larger digests provide more collision resistance but cost more storage/transmission.'),
      card('When is SHA-512 preferred over SHA-256?', 'On 64-bit platforms SHA-512 can be faster than SHA-256 due to 64-bit arithmetic. Also required when protocol/compliance mandates it (some TLS cipher suites).'),
      card('Is SHA-256 collision resistant?', 'Yes — no practical collision attacks are known against SHA-2. It replaced MD5 and SHA-1 as the standard for integrity and signature use cases.'),
    ],
  });

  const shaHmac = mk('HMAC Construction & Key Usage', 'auth', sha.id, {
    definition: 'HMAC (Hash-based Message Authentication Code) combines a cryptographic hash with a secret key to provide both integrity and authenticity. HMAC-SHA256 is the standard for API request signing and webhook verification.',
    codeExample: "import { createHmac, timingSafeEqual } from 'node:crypto';\n\nfunction signPayload(payload, secret) {\n  return createHmac('sha256', secret).update(payload).digest('hex');\n}\n\nfunction verifySignature(payload, signature, secret) {\n  const expected = signPayload(payload, secret);\n  return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));\n}",
    flashcards: [
      card('Why does HMAC resist length extension attacks that plain SHA does not?', 'HMAC wraps the hash in a nested construction (inner and outer hash with the key) that prevents appending data to produce a valid MAC without knowing the key.'),
      card('What is the minimum recommended HMAC key length?', 'At least 256 bits (32 bytes) of cryptographically random data — shorter keys reduce the security level regardless of the hash algorithm used.'),
      card('Why must HMAC comparison use timingSafeEqual?', 'Regular string/buffer comparison short-circuits on first mismatch, leaking timing information that reveals how many bytes match — timingSafeEqual takes constant time.'),
    ],
  });

  const shaPasswords = mk('Password Hashing — Why SHA Alone Fails', 'auth', sha.id, {
    definition: 'Raw SHA-256 is inadequate for password storage because it is too fast — enabling high-speed brute-force attacks on leaked hashes. Dedicated password hashing algorithms add deliberate computational cost and memory hardness.',
    codeExample: "// WRONG — fast hash, brute-forceable:\nconst bad = createHash('sha256').update(password + salt).digest('hex');\n\n// CORRECT — memory-hard, cost-tunable:\nimport argon2 from 'argon2';\nconst hash = await argon2.hash(password, {\n  type: argon2.argon2id,\n  memoryCost: 65536, // 64 MB\n  timeCost: 3,\n  parallelism: 1,\n});",
    flashcards: [
      card('What is the difference between Argon2d, Argon2i, and Argon2id?', 'Argon2d uses password-dependent memory access, Argon2i uses password-independent access, and Argon2id combines both; Argon2id is the commonly recommended default for password hashing.'),
      card('What cost parameters should you tune in Argon2id?', 'memoryCost (RAM used — higher is better), timeCost (iterations), and parallelism. Target ~300–500ms on your target hardware; adjust as hardware improves over time.'),
      card('What is peppering and how does it complement hashing?', 'A pepper is a secret stored outside the database, often in a KMS or config secret, and combined with password verification so a DB-only leak is harder to crack offline.'),
    ],
  });
  skills.push(shaFamily, shaHmac, shaPasswords);

  return skills;
}
