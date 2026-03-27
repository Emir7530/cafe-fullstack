import type { Product } from "../models/product";
import type { Category } from "../models/category";

export let categories: Category[] = [
  { id: 1, name: "Hot Drinks", section: "menu" },
  { id: 2, name: "Desserts", section: "menu" },
  { id: 3, name: "Refresh Drinks", section: "menu" },
  { id: 4, name: "Beans", section: "shop" },
  { id: 5, name: "Accessories", section: "shop" }
];

export let products: Product[] = [
  {
    id: 1,
    name: "Latte",
    price: 190,
    categoryId: 1,
    description: "Hot latte with milk and coffee",
    imageUrl: "",
  },
  {
    id: 2,
    name: "Hibiscus",
    price: 220,
    categoryId: 3,
    description: "Berry hibiscus",
    imageUrl: "",
  },
  {
    id: 3,
    name: "Croissant",
    price: 250,
    categoryId: 2,
    description: "A dessert with chocolate",
    imageUrl: "",
  },
];