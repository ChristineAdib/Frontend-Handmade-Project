export interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
  productId: string;
}

export interface Product {
  id: string;
  titleEn: string;
  titleAr: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
  mainImageUrl?: string;
  averageRating: number;
  reviewCount: number;
  categoryNameEn: string;
  shopName: string;
}

export interface ProductDetailResponse {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
  quantity: number;
  status: string; // "Active", "Inactive", "OutOfStock"
  averageRating: number;
  reviewCount: number;
  categoryId: string;
  categoryNameEn: string;
  categoryNameAr: string;
  shopId: string;
  shopName: string;
  images: ProductImage[];
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CategorySummary {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  imageUrl?: string;
  parentId?: string;
  subCategories?: CategorySummary[];
}

export interface ProductQuery {
  pageIndex: number;
  pageSize: number;
  categoryId?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
}
