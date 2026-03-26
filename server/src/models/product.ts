export type ProductSection = "menu" | "shop"


export type Product = {
  id: number;
  name: string;
  price: number;
  section: ProductSection;
  category: string;
  description: string;
  imageUrl: string;
};