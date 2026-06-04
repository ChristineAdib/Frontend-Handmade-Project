import { environment } from '../../environments/environment.development';


const base_domain = environment.domain;  // استخدمي الدومين من ملف البيئة بدلاً من hardcoding في كل URL

export const API_URLS = {

    // Products
    getAllProducts: `${base_domain}/api/Products`,
    getProductById: (id: string) => `${base_domain}/api/Products/${id}`,
    createProduct: `${base_domain}/api/Products`,
    updateProduct: (id: string) => `${base_domain}/api/Products/${id}`,
    deleteProduct: (id: string) => `${base_domain}/api/Products/${id}`,

    // Auth
    login: `${base_domain}auth/login`,
    profile: `${base_domain}auth/profile`,

    // (search is handled via the query params of getAllProducts — no separate endpoint)

    // Shop
    getShopById: (id: string) => `${base_domain}api/Shops/${id}`,
    getShopWithProducts: (id: string) => `${base_domain}api/Shops/${id}/products`,
    getTopRatedShops: (count: number) => `${base_domain}api/Shops/top?count=${count}`,
    searchShops: (params: string) => `${base_domain}api/Shops/search?${params}`,
    getMyShop: `${base_domain}api/Shops/myShop`,
    getMyShopStats: `${base_domain}api/Shops/myShop/stats`,
    createShop: `${base_domain}api/Shops`,
    updateShop: (id: string) => `${base_domain}api/Shops/${id}`,
    deleteShop: (id: string) => `${base_domain}api/Shops/${id}`,

    // Seller
    getSellerProfile: (id: string) => `${base_domain}api/Sellers/${id}`,
    getMySellerProfile: `${base_domain}api/Sellers/me`,
    updateMyProfile: `${base_domain}api/Sellers/me`,

    // Follow
    followShop: (shopId: string) => `${base_domain}api/Follows/${shopId}`,
    unfollowShop: (shopId: string) => `${base_domain}api/Follows/${shopId}`,
    isFollowing: (shopId: string) => `${base_domain}api/Follows/${shopId}/isFollowing`,
    getFollowedShops: `${base_domain}api/Follows/myShops`,
    getShopFollowers: (shopId: string) => `${base_domain}api/Follows/${shopId}/followers`,

};