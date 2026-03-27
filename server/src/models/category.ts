export type CategorySection = "menu" | "shop";

export type Category = {
  id: number;
  name: string;
  section: CategorySection;
};