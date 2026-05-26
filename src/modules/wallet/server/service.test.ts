/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAddressForChain } from "../../../lib/crypto/chains";

describe("wallet address validation", () => {
  it("rejects empty EVM address", () => {
    assert.equal(validateAddressForChain("", "ETHEREUM"), false);
  });

  it("accepts Solana base58 address format", () => {
    assert.equal(
      validateAddressForChain(
        "7EqQdEUGJxEr6uHMLG3nPP8mU5hgD3VzW5L6W3K9mN2p",
        "SOLANA",
      ),
      true,
    );
  });
});
