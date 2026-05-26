# Storage Integration

Storage provides a framework abstraction over S3-compatible or cloud object storage providers.

Supported providers may include Cloudflare R2, AWS S3, Alibaba OSS, Google Cloud Storage, and MinIO.

## Use

- Use exports from `@/server/storage`.
- Do not call S3-compatible SDKs directly from product code.
- Validate file type, size, ownership, and access policy before upload or exposure.
- Generate URLs through the storage abstraction so CDN behavior stays consistent.

## Configuration

Common settings:

- Provider endpoint and region.
- Access key and secret.
- Bucket name.
- Optional `CDN_BASE_URL`.

Update `.env.example` and `src/env.js` when adding configuration.

## AI Rules

- Keep uploaded files owned by a user, organization, or product entity.
- Never trust client-provided storage keys for authorization.
- Public assets and private assets must have different access rules.
- If upload work is long-running or retryable, use queues.
