export interface ICreateProduct {
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  quantity: number;
  categoryId: string;
  shopId: string;
  images: File[];
  glbFile?: File;
  tags: string[];
}