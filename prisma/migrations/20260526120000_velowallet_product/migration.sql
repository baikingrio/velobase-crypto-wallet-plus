-- CreateEnum
CREATE TYPE "WalletChain" AS ENUM ('ETHEREUM', 'SOLANA', 'BITCOIN');

-- CreateEnum
CREATE TYPE "WalletProvider" AS ENUM ('METAMASK', 'WALLETCONNECT', 'PHANTOM', 'OTHER');

-- CreateEnum
CREATE TYPE "SwapOrderStatus" AS ENUM ('PENDING', 'SUBMITTED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EarnProductType" AS ENUM ('STAKING', 'LIQUIDITY', 'YIELD_AGGREGATOR');

-- CreateEnum
CREATE TYPE "EarnRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "EarnPositionStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "DAppCategory" AS ENUM ('DEFI', 'NFT', 'GAMING', 'BRIDGE', 'OTHER');

-- CreateEnum
CREATE TYPE "DAppPromotionTier" AS ENUM ('NONE', 'BASIC', 'FEATURED');

-- CreateEnum
CREATE TYPE "PlatformRevenueType" AS ENUM ('SWAP_FEE', 'EARN_FEE', 'DAPP_PROMOTION');

-- CreateTable
CREATE TABLE "wallet_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" "WalletChain" NOT NULL,
    "provider" "WalletProvider" NOT NULL DEFAULT 'OTHER',
    "label" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swap_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chain" "WalletChain" NOT NULL,
    "from_token" TEXT NOT NULL,
    "to_token" TEXT NOT NULL,
    "from_amount" TEXT NOT NULL,
    "to_amount" TEXT,
    "fee_amount" TEXT,
    "fee_bps" INTEGER NOT NULL DEFAULT 30,
    "tx_hash" TEXT,
    "aggregator" TEXT,
    "status" "SwapOrderStatus" NOT NULL DEFAULT 'PENDING',
    "quote_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "swap_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earn_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "chain" "WalletChain" NOT NULL,
    "type" "EarnProductType" NOT NULL,
    "apy" DOUBLE PRECISION NOT NULL,
    "tvl" TEXT,
    "risk_level" "EarnRiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "contract_address" TEXT,
    "external_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earn_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earn_positions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "deposited_amount" TEXT NOT NULL,
    "current_value" TEXT,
    "rewards_earned" TEXT NOT NULL DEFAULT '0',
    "status" "EarnPositionStatus" NOT NULL DEFAULT 'ACTIVE',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earn_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dapp_listings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "DAppCategory" NOT NULL,
    "chains" JSONB NOT NULL DEFAULT '[]',
    "logo_url" TEXT,
    "is_promoted" BOOLEAN NOT NULL DEFAULT false,
    "promotion_tier" "DAppPromotionTier" NOT NULL DEFAULT 'NONE',
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dapp_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_revenues" (
    "id" TEXT NOT NULL,
    "type" "PlatformRevenueType" NOT NULL,
    "source_id" TEXT,
    "user_id" TEXT,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "chain" "WalletChain",
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallet_connections_user_id_idx" ON "wallet_connections"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_connections_user_id_address_chain_key" ON "wallet_connections"("user_id", "address", "chain");

-- CreateIndex
CREATE INDEX "swap_orders_user_id_created_at_idx" ON "swap_orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "swap_orders_status_idx" ON "swap_orders"("status");

-- CreateIndex
CREATE INDEX "earn_products_chain_is_active_idx" ON "earn_products"("chain", "is_active");

-- CreateIndex
CREATE INDEX "earn_products_type_idx" ON "earn_products"("type");

-- CreateIndex
CREATE INDEX "earn_positions_user_id_status_idx" ON "earn_positions"("user_id", "status");

-- CreateIndex
CREATE INDEX "earn_positions_product_id_idx" ON "earn_positions"("product_id");

-- CreateIndex
CREATE INDEX "dapp_listings_category_is_active_idx" ON "dapp_listings"("category", "is_active");

-- CreateIndex
CREATE INDEX "dapp_listings_is_promoted_promotion_tier_idx" ON "dapp_listings"("is_promoted", "promotion_tier");

-- CreateIndex
CREATE INDEX "platform_revenues_type_recorded_at_idx" ON "platform_revenues"("type", "recorded_at");

-- CreateIndex
CREATE INDEX "platform_revenues_user_id_idx" ON "platform_revenues"("user_id");

-- AddForeignKey
ALTER TABLE "wallet_connections" ADD CONSTRAINT "wallet_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swap_orders" ADD CONSTRAINT "swap_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earn_positions" ADD CONSTRAINT "earn_positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earn_positions" ADD CONSTRAINT "earn_positions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "earn_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_revenues" ADD CONSTRAINT "platform_revenues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
