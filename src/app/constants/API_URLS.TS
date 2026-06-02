import { environment } from '../../environments/environment.development';


const base_domain = environment.domain;  // استخدمي الدومين من ملف البيئة بدلاً من hardcoding في كل URL

export const API_URLS = {

    getAllProducts: `${base_domain}products`,
    getProductById: (id: number) => `${base_domain}products/${id}`,
    addProduct: `${base_domain}products/add`,
    deleteProduct: (id: number) => `${base_domain}products/${id}`,

    // Auth
    login: `${base_domain}auth/login`,
    profile: `${base_domain}auth/profile`,

    searchProducts: (title: string) =>
        `${base_domain}products/?title=${title}`,

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