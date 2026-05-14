export type CheckoutItem = {
  productId: number;
  quantity: number;
};

export const MAX_ORDER_ITEM_QUANTITY = 99;
export const MAX_DISTINCT_ORDER_ITEMS = 50;

export const normalizeCheckoutItems = (items: unknown): CheckoutItem[] => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must include at least one item.");
  }

  const itemMap = new Map<number, number>();

  for (const rawItem of items) {
    const item =
      rawItem && typeof rawItem === "object"
        ? (rawItem as { productId?: unknown; quantity?: unknown })
        : {};

    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      productId <= 0 ||
      quantity <= 0
    ) {
      throw new Error("Invalid order item.");
    }

    const nextQuantity = (itemMap.get(productId) ?? 0) + quantity;

    if (nextQuantity > MAX_ORDER_ITEM_QUANTITY) {
      throw new Error(
        `Quantity for each product must be ${MAX_ORDER_ITEM_QUANTITY} or less.`
      );
    }

    itemMap.set(productId, nextQuantity);
  }

  if (itemMap.size > MAX_DISTINCT_ORDER_ITEMS) {
    throw new Error(
      `Order can include at most ${MAX_DISTINCT_ORDER_ITEMS} different products.`
    );
  }

  return Array.from(itemMap, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
};
