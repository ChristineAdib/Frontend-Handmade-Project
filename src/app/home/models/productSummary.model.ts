export interface ProductImage {
  imageUrl: string;
  isMain: boolean;
}

export interface ProductSummary {
  id: string;
  titleEn: string;
  titleAr: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
  images: ProductImage[];
  averageRating: number;
  reviewCount: number;
  categoryNameEn: string;
  shopName: string;
}