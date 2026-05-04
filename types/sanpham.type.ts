export interface Product {
  Id_product: number;
  Name_product: string;
  Price: number;
  Size: string;
  Sale_Price?: number | null;
  Quantity: number;
  Category_Name: string;
  Thumbnail?: string;
}
