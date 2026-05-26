# 队列集成

队列使用 Redis 和 BullMQ 处理后台任务、重试、定时工作和补偿任务。

## 标准结构

每个队列应包含：

- Queue definition。
- Processor function。
- 从中心 queue 和 processor indexes 导出。
- 可选 scheduler registration。

## 使用

- 通过 `createWorkerInstance()` 创建 worker，不直接 `new Worker()`。
- 从 `src/workers/queues/index.ts` 导出 queues。
- 从 `src/workers/processors/index.ts` 导出 processors。
- Processor 逻辑必须幂等。

## 使用场景

适合用队列处理：

- 支付补偿。
- 需要重试的邮件发送。
- Ads conversion upload。
- 长耗时 AI 或文件处理。
- 定时清理或生命周期 jobs。

## AI 规则

- 重复执行 job 不得重复扣费、重复发放或产生重复不可逆副作用。
- Processor 代码不能依赖 Next.js-only APIs。
- 永久失败要留下可排查日志。
- 如果使用 progress updates，需要测试。
