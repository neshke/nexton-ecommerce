export interface Category {
  id: number;
  naziv: string;           // name
  url_slug: string;        // slug
  opis: string;            // description
  slika_url?: string;      // image_url
  aktivan: boolean;        // is_active
  kreirano_at?: string;    // created_at
  azurirano_at?: string;   // updated_at
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}
