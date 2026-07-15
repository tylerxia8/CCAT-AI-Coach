# Runtime Security

## Browser policy

All routes receive a centralized security-header set:

- Content Security Policy limited to the application and Supabase connections
- Framing disabled
- Browser MIME sniffing disabled
- Camera, microphone, geolocation, and payment APIs disabled
- Strict cross-origin referrer policy
- Cross-origin opener isolation
- Framework identification header disabled

The CSP permits inline scripts and styles because the current Next.js application shell requires them. A nonce-based policy is a later hardening step once deployment middleware owns per-request nonces.

## Health checks

`GET /api/health` returns application readiness and whether persistence is configured for cloud or local fallback. It is dynamic, non-cacheable, and does not contact external services or expose credentials. Hosting platforms can use this as a liveness probe; a separate dependency-aware readiness probe should be added when production Supabase is provisioned.

## Response privacy

Answer-bearing scoring and feedback responses, authenticated progress data, and health output use `no-store` response directives. Private question explanations remain absent from compiled browser artifacts through the CI privacy gate.
