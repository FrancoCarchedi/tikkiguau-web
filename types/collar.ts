export type CollarSize = '1' | '2';
export type LeashSize = '1' | '2';

export const COLLAR_SIZES: { label: string; value: CollarSize; description: string; details: string }[] = [
  { label: 'Talla 1', value: '1', description: 'XS | 1,5 cm de ancho | 25 cm - 40 cm de largo', details: 'Apta para Shih Tzu, Chihuahua, Yorkshire Terrier, Pomerania, Caniche Toy, cachorros y gatitos.' },
  { label: 'Talla 2', value: '2', description: 'M | 2,5 cm de ancho | 55 cm - 70 cm de largo', details: 'Apta para Pit Bull, American Bully, Golden Retriever, Cocker Spaniel.' },
];

export const LEASH_SIZES: { label: string; value: LeashSize; description: string; details: string }[] = [
  { label: 'Talla 1', value: '1', description: 'XS | 1,5 cm de ancho | 1,20 mts de largo', details: 'Ideal para razas pequeñas: Shih Tzu, Chihuahua, Yorkshire Terrier, Pomerania, Caniche Toy y cachorros.' },
  { label: 'Talla 2', value: '2', description: 'M | 2,5 cm de ancho | 1,20 mts de largo', details: 'Ideal para razas medianas y grandes: Pit Bull, American Bully, Golden Retriever, Cocker Spaniel.' },
];

export interface CollarElement {
  id: string;
  type: 'letter' | 'emoji';
  value: string;
  color: string;
}

export interface LeashDesign {
  leashColor: string;
  leashSize: LeashSize;
  elements: CollarElement[];
}

export interface CollarDesign {
  collarColor: string;
  collarSize: CollarSize;
  elements: CollarElement[];
}

export type DeliveryMethod = 'PICKUP' | 'CORREO_DOMICILIO' | 'CORREO_SUCURSAL';

export interface UserData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
}

export interface DeliveryData {
  method: DeliveryMethod;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  branchPreference?: string;
}

export interface CartItem {
  id: string;
  productType: ProductType;
  collarDesign?: CollarDesign;
  leashDesign?: LeashDesign;
}

export type ProductType = 'collar' | 'leash' | 'both';

export const MAX_COLLAR_ELEMENTS = 6;
export const MIN_COLLAR_ELEMENTS = 3;
export const MAX_LEASH_ELEMENTS = 10;
export const MIN_LEASH_ELEMENTS = 3;
