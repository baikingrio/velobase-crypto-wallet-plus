/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidBtcAddress,
  isValidSolanaAddress,
  validateAddressForChain,
} from "./chains";

describe("validateAddressForChain", () => {
  it("accepts valid EVM addresses", () => {
    assert.equal(
      validateAddressForChain(
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
        "ETHEREUM",
      ),
      true,
    );
  });

  it("rejects invalid EVM addresses", () => {
    assert.equal(validateAddressForChain("not-an-address", "ETHEREUM"), false);
  });

  it("accepts valid Solana addresses", () => {
    assert.equal(
      isValidSolanaAddress("7EqQdEUGJxEr6uHMLG3nPP8mU5hgD3VzW5L6W3K9mN2p"),
      true,
    );
  });

  it("accepts bc1 bitcoin addresses", () => {
    assert.equal(
      isValidBtcAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"),
      true,
    );
  });
});
