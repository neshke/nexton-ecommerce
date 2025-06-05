import type { User } from './auth'; // Pretpostavka da User interfejs postoji u auth.ts ili sličnom modelu

export interface OrderItem {
  id: string | number; // ID stavke porudžbine
  product_id: string | number; // ID proizvoda
  naziv_proizvoda?: string; // Naziv proizvoda, opciono ako se dohvata posebno
  kolicina: number;
  cena: number; // Cena proizvoda u trenutku naručivanja
  // Mogu se dodati i druge informacije o proizvodu ako je potrebno
}

export interface Order {
  id: string | number; // ID porudžbine
  korisnik_id?: User['id']; // ID korisnika, koristi tip iz User interfejsa
  korisnicko_ime?: string; // Opciono, ako API vraća i korisničko ime
  datum_porudzbine: string; // Datum u ISO formatu ili sličnom stringu
  status: 'na cekanju' | 'zavrsena' | 'otkazana' | string; // Status porudžbine
  ukupan_iznos: number | string; // Ukupan iznos, može biti string iz API-ja pa se parsira
  stavke_porudzbine?: OrderItem[]; // Niz stavki porudžbine, opciono
  kreirano_u?: string;
  azurirano_u?: string;
  // Dodatna polja koja vaš API može vraćati
}

// Interfejs za stanje unutar ordersStore-a
export interface OrdersStoreState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

// Interfejs za očekivani odgovor od API-ja za listu porudžbina
export interface OrdersApiResponse {
  status?: number; // HTTP status ili interni status API-ja
  data?: Order[];
  message?: string;
}

// Interfejs za očekivani odgovor greške od API-ja
export interface ApiErrorResponse {
  message: string;
  status?: number;
  // Mogu postojati i druga polja greške
}

// Interfejs za stavku koja se šalje prilikom kreiranja porudžbine
export interface CreateOrderItemPayload {
  product_id: string | number;
  kolicina: number;
  cena_po_komadu: number; // Cena po komadu u trenutku naručivanja
}

// Interfejs za podatke koji se šalju prilikom kreiranja porudžbine
export interface CreateOrderPayload {
  user_id?: User['id'] | null; // ID korisnika, može biti null za goste
  ime_prezime: string;
  adresa: string;
  telefon: string;
  ukupan_iznos: number;
  stavke: CreateOrderItemPayload[];
  email_za_potvrdu?: string; // NOVO: Opciono polje za email
  // status?: string; // Status se obično postavlja na backendu
}

// Interfejs za očekivani odgovor od API-ja prilikom kreiranja porudžbine
export interface CreateOrderApiResponse {
  status?: number;
  success?: boolean;
  message: string;
  order_id?: string | number; // ID novokreirane porudžbine
  // Može sadržati i druge podatke koje API vraća
}
