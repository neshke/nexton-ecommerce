export interface Product {
  id: number;
  category_id?: number;
  name: string;
  description: string;
  price: number;
  stock?: number;
  image_url: string;
  type?: string;
}

export interface ProductState {
  products: Product[];
  cart: Product[];
  loading: boolean;
  error: string | null;
}

// Add some utility types for better type safety
export type AddToCartFn = (payload: { product: Product; quantity: number }) => void;
export type RemoveFromCartFn = (productId: number) => void;
export type UpdateCartQuantityFn = (productId: number, quantity: number) => void;
