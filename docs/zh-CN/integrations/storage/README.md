# 存储集成

Storage 为 S3-compatible 或云对象存储 providers 提供框架抽象。

支持的 providers 可以包括 Cloudflare R2、AWS S3、Alibaba OSS、Google Cloud Storage 和 MinIO。

## 使用

- 使用 `@/server/storage` 的 exports。
- 产品代码不要直接调用 S3-compatible SDK。
- 上传或暴露文件前校验 file type、size、ownership 和 access policy。
- 通过 storage abstraction 生成 URLs，保持 CDN 行为一致。

## 配置

常见配置：

- Provider endpoint 和 region。
- Access key 和 secret。
- Bucket name。
- 可选 `CDN_BASE_URL`。

新增配置时更新 `.env.example` 和 `src/env.js`。

## AI 规则

- 上传文件必须归属于 user、organization 或 product entity。
- 不要信任客户端传入的 storage keys 做授权。
- Public assets 和 private assets 需要不同访问规则。
- 如果上传工作耗时或需要重试，使用 queues。
