import { environment } from '../../environments/environment.development';


const base_domain = environment.domain;

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

};