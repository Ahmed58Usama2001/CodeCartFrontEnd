import {nanoid} from 'nanoid'

export interface CartType {
    id: string;
    items: CartItem[];
}

export interface CartItem {
    productId: number;
    productName: string;
    price: number;
    pictureUrl: string;
    brand: string;
    type: string;
    quantity: number;
}

export class Cart implements CartType {
    id=nanoid();
    items: CartItem[] = [];
}