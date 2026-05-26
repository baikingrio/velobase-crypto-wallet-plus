# Ads Integration

Ads integration covers attribution and conversion upload for providers such as Google Ads and Twitter/X Ads.

## Use

- Client conversion helpers live under analytics/ads abstractions.
- Server-side offline conversion upload should go through framework queues or provider modules.
- Do not call ad provider SDKs directly from payment or order core flows.

## Configuration

Common settings:

- Frontend conversion IDs and labels.
- Google Ads customer and conversion configuration.
- Optional API credentials for server-side upload.

Update `.env.example`, `src/env.js`, and module enablement when adding provider configuration.

## Rules

- Payment/order flows emit domain events.
- Ads modules subscribe to events and upload conversions.
- Conversion upload must be idempotent and deduplicated by order, user, or provider event identifiers.
- Provider failures should not fail payment or entitlement delivery.
