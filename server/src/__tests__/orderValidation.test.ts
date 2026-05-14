import { describe, expect, it } from "vitest";
import {
  MAX_ORDER_ITEM_QUANTITY,
  normalizeCheckoutItems,
} from "../utils/orderValidation";

describe("normalizeCheckoutItems", () => {
  it("combines duplicate product ids", () => {
    expect(
      normalizeCheckoutItems([
        { productId: 1, quantity: 1 },
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ])
    ).toEqual([
      { productId: 1, quantity: 3 },
      { productId: 2, quantity: 1 },
    ]);
  });

  it("rejects decimal quantities", () => {
    expect(() =>
      normalizeCheckoutItems([{ productId: 1, quantity: 1.5 }])
    ).toThrow("Invalid order item.");
  });

  it("rejects quantities above the per-product limit", () => {
    expect(() =>
      normalizeCheckoutItems([
        { productId: 1, quantity: MAX_ORDER_ITEM_QUANTITY },
        { productId: 1, quantity: 1 },
      ])
    ).toThrow(`Quantity for each product must be ${MAX_ORDER_ITEM_QUANTITY}`);
  });
});
