import type { User } from './auth'; // Pretpostavka da User interfejs postoji u auth.ts ili sličnom modelu

export interface OrderItem {
  stavka_id: number; // ID stavke porudžbine - promenjeno sa id
  proizvod_id: string | number; // ID proizvoda
  naziv_proizvoda?: string; // Naziv proizvoda, opciono ako se dohvata posebno
  kolicina: number;
  cena_po_komadu: number; // Cena po komadu u trenutku naručivanja
  ukupna_cena_stavke?: number; // Dodato, opciono jer se može izračunati
  // Mogu se dodati i druge informacije o proizvodu ako je potrebno
}

export interface Order {
  id: string | number; // ID porudžbine
  korisnik_id?: User['id']; // ID korisnika, koristi tip iz User interfejsa
  korisnicko_ime?: string; // Opciono, ako API vraća i korisničko ime
  ime_prezime?: string; // Dodato
  adresa?: string; // Dodato
  telefon?: string; // Dodato
  datum_porudzbine: string; // Datum u ISO formatu ili sličnom stringu
  status: 'na cekanju' | 'zavrsena' | 'otkazana' | string; // Status porudžbine
  ukupan_iznos: number | string; // Ukupan iznos, može biti string iz API-ja pa se parsira
  stavke?: OrderItem[]; // Niz stavki porudžbine, sada se zove 'stavke' kao u API odgovoru
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
  success?: boolean; // Indicates if the operation was successful
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
  // cena?:number; // Uklonjeno, koristi se cena_po_komadu
}

// Interfejs za payload prilikom kreiranja nove porudžbine
export interface CreateOrderPayload {
  korisnik_id?: number | null; // ID korisnika, može biti null za goste
  ime_prezime: string;
  adresa: string;
  telefon: string;
  ukupan_iznos: number;
  stavke: CreateOrderItemPayload[]; // Niz stavki koje se naručuju
  status?: 'na cekanju' | 'zavrsena' | 'otkazana'; // Opciono, podrazumevano 'na cekanju'
  email_za_potvrdu?: string; // Email za potvrdu, opciono
}

// Interfejs za odgovor API-ja prilikom kreiranja porudžbine
export interface CreateOrderApiResponse {
  success: boolean;
  message: string;
  order_id?: number; // ID kreirane porudžbine
  status?: number; // HTTP status ili interni status API-ja
}
