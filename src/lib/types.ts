export type ProductVariant = {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  stock: number;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: 'men' | 'women' | 'wholesale';
  description: string;
  images: string[];
  price: number;
  tags: string[];
  slug: string;
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  price: number;
};

export type Order = {
  orderId: string;
  name: string;
  phone: string;
  items: CartItem[];
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered';
  createdAt: any; // Using `any` for Firebase Timestamp compatibility
};
