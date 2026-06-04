// ─────────────────────────────────────────────────────────────────────────────
// Product Models — mirrors the backend DTOs exactly (camelCase)
// Source: HandoraApplication/DTOs/ProductDTOs  &  HandoraApplication/DTOs/CommonDTOs
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared ───────────────────────────────────────────────────────────────────

/** Matches PagedResultDto<T> */
export interface IPagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ── Enums ─────────────────────────────────────────────────────────────────────

/** Matches ProductStatus enum: Active = 1, Inactive = 2, OutOfStock = 3 */
export type ProductStatus = 'Active' | 'Inactive' | 'OutOfStock';

// ── Response DTOs ─────────────────────────────────────────────────────────────

/** Matches ProductImageDto */
export interface IProductImageDto {
  id: string;
  imageUrl: string;
  isMain: boolean;
}

/** Matches ReviewSummaryDto (embedded inside ProductResponseDto) */
export interface IReviewSummaryDto {
  rating: number;
  comment?: string;
  userName: string;
  createdAt: string;
}

/** Matches ProductResponseDto — full detail view */
export interface IProductResponseDto {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
  quantity: number;
  status: ProductStatus;
  averageRating: number;
  reviewCount: number;
  categoryId: string;
  categoryNameEn: string;
  categoryNameAr: string;
  shopId: string;
  shopName: string;
  images: IProductImageDto[];
  tags: string[];
  latestReviews: IReviewSummaryDto[];
  createdAt: string;
  updatedAt?: string;
}

/** Matches ProductSummaryDto — used in catalog / cards */
export interface IProductSummaryDto {
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

// ── Query DTO ─────────────────────────────────────────────────────────────────

/** Matches ProductQueryDto (extends PaginationQueryDto) */
export interface IProductQueryDto {
  // PaginationQueryDto
  pageNumber?: number;
  pageSize?: number;
  // ProductQueryDto
  search?: string;
  categoryId?: string;
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  status?: ProductStatus;
  sortBy?: 'price' | 'rating' | 'newest';
  sortDescending?: boolean;
  tags?: string[];
}

// ── Write DTOs ────────────────────────────────────────────────────────────────

/** Matches CreateProductDto — sent as FormData ([FromForm] on backend) */
export interface ICreateProductDto {
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  quantity: number;
  categoryId: string;
  shopId: string;
  images: File[];
  tags: string[];
}

/** Matches UpdateProductDto — sent as FormData ([FromForm] on backend) */
export interface IUpdateProductDto {
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price?: number;
  discountPrice?: number;
  quantity?: number;
  status?: ProductStatus;
  categoryId?: string;
  tags?: string[];
  removeImageIds?: string[];
  newImages?: File[];
}
