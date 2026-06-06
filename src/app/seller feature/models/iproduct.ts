export interface IProduct {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  quantity: number;
  categoryId: string;
  shopId: string;
  images: string[];
  tags: string[];
  status: string;
}