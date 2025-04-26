// Export all model interfaces
export * from './category';
export * from './product';
export * from './cart';
export * from './contact';

// Shared interfaces
export interface FilterOptions {
  minPrice: number | null;
  maxPrice: number | null;
  categories: number[] | null;
}
