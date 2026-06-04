import { CategorySummary } from "./CategorySummary";

export interface CategoryResponse {
  id: string;
  nameEn: string;
  nameAr: string;
  imageUrl: string | null;
  parentId: string | null;
  subCategories: CategorySummary[];
}
