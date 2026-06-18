export interface DashboardSummary {
  sellerName: string;
  shopName: string;
  shopRating: number;
  shopLogo?: string;
  totalRevenue: number;
  revenueGrowthPercent: number;
  completedOrders: number;
  ordersGrowthPercent: number;
  activeProducts: number;
  totalCustomers: number;
  averageRating: number;
  totalReviews: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface CategoryPerformance {
  categoryName: string;
  revenue: number;
}

export interface RevenueAnalytics {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  trend: RevenueTrendPoint[];
  categoryPerformance: CategoryPerformance[];
}

export interface OrderTrendPoint {
  date: string;
  ordersCount: number;
}

export interface OrdersAnalytics {
  trend: OrderTrendPoint[];
  monthOverMonthRevenueGrowth: number;
  monthOverMonthOrdersGrowth: number;
  yearOverYearRevenueGrowth: number;
  yearOverYearOrdersGrowth: number;
}

export interface TopCustomer {
  customerName: string;
  ordersCount: number;
  totalSpending: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  returningCustomersCount: number;
  returningCustomersPercent: number;
  newCustomersCount: number;
  customerRetentionRate: number;
  topCustomer?: TopCustomer;
}

export interface InventoryProduct {
  productId: string;
  productName: string;
  currentStock: number;
  price: number;
  pictureUrl?: string;
}

export interface LowestPerformingProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  currentStock: number;
  pictureUrl?: string;
  recommendation: string;
}

export interface InventoryAnalytics {
  lowStockProducts: InventoryProduct[];
  outOfStockProducts: InventoryProduct[];
  lowestPerformingProducts: LowestPerformingProduct[];
}

export interface HighestRatedProduct {
  productId: string;
  productName: string;
  rating: number;
  reviewsCount: number;
  pictureUrl?: string;
}

export interface RatingDistributionPoint {
  stars: number;
  reviewsCount: number;
}

export interface RatingAnalytics {
  highestRatedProducts: HighestRatedProduct[];
  ratingDistribution: RatingDistributionPoint[];
}

export interface SmartInsight {
  text: string;
  type: string; // info, success, warning, danger
}

export interface DrillDownDetails {
  date: string;
  revenue: number;
  ordersCount: number;
  productsSold: string[];
}
