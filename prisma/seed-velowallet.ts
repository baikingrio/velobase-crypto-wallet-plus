import type { PrismaClient } from "@prisma/client";

export async function seedVeloWallet(prisma: PrismaClient) {
  const earnCount = await prisma.earnProduct.count();
  if (earnCount === 0) {
    await prisma.earnProduct.createMany({
      data: [
        {
          name: "Lido Staked ETH",
          protocol: "Lido",
          chain: "ETHEREUM",
          type: "STAKING",
          apy: 3.8,
          tvl: "$32B",
          riskLevel: "LOW",
          externalUrl: "https://lido.fi/",
        },
        {
          name: "Aave USDC Supply",
          protocol: "Aave",
          chain: "ETHEREUM",
          type: "YIELD_AGGREGATOR",
          apy: 4.2,
          tvl: "$8B",
          riskLevel: "MEDIUM",
          externalUrl: "https://app.aave.com/",
        },
        {
          name: "Uniswap ETH/USDC LP",
          protocol: "Uniswap",
          chain: "ETHEREUM",
          type: "LIQUIDITY",
          apy: 12.5,
          tvl: "$1.2B",
          riskLevel: "HIGH",
          externalUrl: "https://app.uniswap.org/",
        },
        {
          name: "Marinade Staked SOL",
          protocol: "Marinade",
          chain: "SOLANA",
          type: "STAKING",
          apy: 7.1,
          tvl: "$1.5B",
          riskLevel: "LOW",
          externalUrl: "https://marinade.finance/",
        },
        {
          name: "Raydium SOL-USDC",
          protocol: "Raydium",
          chain: "SOLANA",
          type: "LIQUIDITY",
          apy: 18.3,
          tvl: "$420M",
          riskLevel: "HIGH",
          externalUrl: "https://raydium.io/",
        },
        {
          name: "Jupiter Earn",
          protocol: "Jupiter",
          chain: "SOLANA",
          type: "YIELD_AGGREGATOR",
          apy: 9.4,
          tvl: "$890M",
          riskLevel: "MEDIUM",
          externalUrl: "https://jup.ag/",
        },
      ],
    });
  }

  const dappCount = await prisma.dAppListing.count();
  if (dappCount === 0) {
    await prisma.dAppListing.createMany({
      data: [
        {
          name: "Uniswap",
          description: "Leading decentralized exchange for token swaps on Ethereum.",
          url: "https://app.uniswap.org/",
          category: "DEFI",
          chains: ["ETHEREUM"],
          isPromoted: true,
          promotionTier: "FEATURED",
        },
        {
          name: "OpenSea",
          description: "Discover, collect, and sell NFTs across multiple chains.",
          url: "https://opensea.io/",
          category: "NFT",
          chains: ["ETHEREUM", "SOLANA"],
          isPromoted: true,
          promotionTier: "BASIC",
        },
        {
          name: "Jupiter",
          description: "Solana's key liquidity aggregator for optimal swap routes.",
          url: "https://jup.ag/",
          category: "DEFI",
          chains: ["SOLANA"],
          isPromoted: true,
          promotionTier: "FEATURED",
        },
        {
          name: "Aave",
          description: "Open-source liquidity protocol for earning and borrowing.",
          url: "https://app.aave.com/",
          category: "DEFI",
          chains: ["ETHEREUM"],
          isPromoted: false,
          promotionTier: "NONE",
        },
        {
          name: "Magic Eden",
          description: "Cross-chain NFT marketplace with Solana roots.",
          url: "https://magiceden.io/",
          category: "NFT",
          chains: ["SOLANA", "ETHEREUM"],
          isPromoted: false,
          promotionTier: "NONE",
        },
        {
          name: "Wormhole Portal",
          description: "Bridge assets across major blockchains securely.",
          url: "https://portalbridge.com/",
          category: "BRIDGE",
          chains: ["ETHEREUM", "SOLANA"],
          isPromoted: false,
          promotionTier: "NONE",
        },
        {
          name: "Lido",
          description: "Liquid staking for ETH and other proof-of-stake assets.",
          url: "https://lido.fi/",
          category: "DEFI",
          chains: ["ETHEREUM"],
          isPromoted: false,
          promotionTier: "NONE",
        },
        {
          name: "Raydium",
          description: "Solana AMM and liquidity provider for DeFi traders.",
          url: "https://raydium.io/",
          category: "DEFI",
          chains: ["SOLANA"],
          isPromoted: false,
          promotionTier: "NONE",
        },
      ],
    });
  }
}
