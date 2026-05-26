# Daily Bonus

Daily Bonus grants credits to a logged-in user on the first qualifying visit of the day.

## Purpose

- Improve new-user activation.
- Encourage daily retention.
- Control cost with a predictable grant policy.

## Dependencies

- Velobase Billing for granting credits and reading ledger history.
- Auth for the current `userId`.

## Code

```text
src/server/features/daily-bonus/
├── grant-daily-bonus.ts
└── index.ts
```

## Use

```ts
import { grantDailyBonus } from "@/server/features/daily-bonus";

const result = await grantDailyBonus(userId);
```

## AI Rules

- Adjust policy constants at the top of `grant-daily-bonus.ts`.
- Keep `grantDailyBonus()` idempotent.
- Do not bypass billing services when granting credits.
