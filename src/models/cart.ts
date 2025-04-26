import type { Product } from './product';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}


export type RemoveFromCartFn = (productId: number) => void;

export type UpdateCartQuantityFn = (
  productId: number,
  quantity: number
) => void;
