import { CartItem } from "@/types/cart.type";
export interface OrderRequest {
  items: CartItem[];
  receiver_name: string;
  phone: string;
  province?: string;
  ward?: string;
  address_detail: string;
  id_payment: number;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
}
