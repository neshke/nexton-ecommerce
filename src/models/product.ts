import type { Category } from "./category";

export interface Product {
  id: number;
  naziv: string;                  // name
  slug: string;                   // slug
  opis: string;                   // description
  cena: number;                   // price
  akcijska_cena?: number;         // sale_price
  slika_url?: string;             // image_url
  dodatne_slike?: string[];       // additional_images
  kolicina_na_stanju: number;     // stock_quantity
  kategorija_id: number;          // category_id
  category?: Category;            // Keep category object reference in English for now
  istaknuto: boolean;             // featured
  aktivan: boolean;               // active
  kreirano_at?: string;           // created_at
  azurirano_at?: string;          // updated_at
}

export interface ProductState {
  products: Product[];
  cart: Product[];
  loading: boolean;
  error: string | null;
}
