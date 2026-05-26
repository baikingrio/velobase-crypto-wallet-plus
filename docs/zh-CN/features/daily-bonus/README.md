# 每日签到赠送

Daily Bonus 会在登录用户每天首次符合条件访问时发放积分。

## 用途

- 提升新用户激活。
- 鼓励每日留存。
- 用可预测发放策略控制成本。

## 依赖

- Velobase Billing：发放积分和读取 ledger history。
- Auth：获取当前 `userId`。

## 代码

```text
src/server/features/daily-bonus/
├── grant-daily-bonus.ts
└── index.ts
```

## 使用

```ts
import { grantDailyBonus } from "@/server/features/daily-bonus";

const result = await grantDailyBonus(userId);
```

## AI 规则

- 调整 `grant-daily-bonus.ts` 顶部策略常量。
- 保持 `grantDailyBonus()` 幂等。
- 发放积分不要绕过 billing services。
