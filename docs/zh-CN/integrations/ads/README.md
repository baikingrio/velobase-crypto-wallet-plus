# 广告集成

Ads integration 覆盖 Google Ads、Twitter/X Ads 等 provider 的归因和 conversion upload。

## 使用

- Client conversion helpers 放在 analytics/ads abstractions 下。
- Server-side offline conversion upload 应通过框架 queues 或 provider modules。
- 不要在 payment 或 order core flows 中直接调用广告 provider SDK。

## 配置

常见配置：

- Frontend conversion IDs 和 labels。
- Google Ads customer 和 conversion configuration。
- 可选 API credentials，用于 server-side upload。

新增 provider 配置时更新 `.env.example`、`src/env.js` 和 module enablement。

## 规则

- Payment/order flows 发出 domain events。
- Ads modules 订阅事件并上传 conversions。
- Conversion upload 必须按 order、user 或 provider event identifiers 幂等去重。
- Provider 失败不应导致 payment 或 entitlement delivery 失败。
