import type { Product, Order } from './types';
import { getPlaceholderImage } from './placeholder-images';

export const placeholderProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Blue Denim Jacket',
    slug: 'classic-blue-denim-jacket',
    category: 'men',
    description:
      'A timeless denim jacket that is a must-have for every wardrobe. Made with high-quality denim, this jacket is perfect for layering in any season. It features a classic collar, button-front closure, and four pockets for convenience.',
    images: [getPlaceholderImage('men-jacket').imageUrl, getPlaceholderImage('men-jacket-2').imageUrl],
    price: 89.99,
    tags: ['denim', 'jacket', 'men', 'classic', 'outerwear'],
    variants: [
      { size: 'S', stock: 10, price: 89.99 },
      { size: 'M', stock: 5, price: 89.99 },
      { size: 'L', stock: 0, price: 89.99 },
      { size: 'XL', stock: 8, price: 89.99 },
      { size: 'XXL', stock: 3, price: 89.99 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Striped Crewneck Sweater',
    slug: 'striped-crewneck-sweater',
    category: 'men',
    description:
      'Stay warm and stylish with this comfortable crewneck sweater. The classic striped pattern adds a touch of nautical charm. Made from a soft cotton blend, it is perfect for casual outings or a cozy night in.',
    images: [getPlaceholderImage('men-sweater').imageUrl],
    price: 65.0,
    tags: ['sweater', 'men', 'striped', 'knitwear'],
    variants: [
      { size: 'S', stock: 12, price: 65.0 },
      { size: 'M', stock: 15, price: 65.0 },
      { size: 'L', stock: 10, price: 65.0 },
      { size: 'XL', stock: 4, price: 65.0 },
      { size: 'XXL', stock: 2, price: 65.0 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Elegant Floral Maxi Dress',
    slug: 'elegant-floral-maxi-dress',
    category: 'women',
    description:
      'Make a statement in this beautiful floral maxi dress. It features a flattering v-neckline, a cinched waist, and a flowing skirt that moves gracefully with you. Perfect for weddings, garden parties, or a sunny day out.',
    images: [getPlaceholderImage('women-dress').imageUrl, getPlaceholderImage('women-dress-2').imageUrl],
    price: 120.5,
    tags: ['dress', 'women', 'floral', 'maxi', 'elegant'],
    variants: [
      { size: 'S', stock: 8, price: 120.5 },
      { size: 'M', stock: 10, price: 120.5 },
      { size: 'L', stock: 3, price: 120.5 },
      { size: 'XL', stock: 0, price: 120.5 },
      { size: 'XXL', stock: 1, price: 120.5 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'High-Waisted Skinny Jeans',
    slug: 'high-waisted-skinny-jeans',
    category: 'women',
    description:
      'Your new go-to pair of jeans. These high-waisted skinny jeans are crafted from a stretchy denim fabric that hugs your curves in all the right places, providing both comfort and style. They feature a classic five-pocket design.',
    images: [getPlaceholderImage('women-jeans').imageUrl],
    price: 75.0,
    tags: ['jeans', 'women', 'skinny', 'denim', 'high-waist'],
    variants: [
      { size: 'S', stock: 20, price: 75.0 },
      { size: 'M', stock: 18, price: 75.0 },
      { size: 'L', stock: 15, price: 75.0 },
      { size: 'XL', stock: 10, price: 75.0 },
      { size: 'XXL', stock: 5, price: 75.0 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const placeholderOrders: Order[] = [
    {
    orderId: 'MM90-ABCDE1',
    name: 'John Doe',
    phone: '123-456-7890',
    items: [
      {
        productId: '1',
        name: 'Classic Blue Denim Jacket',
        image: getPlaceholderImage('men-jacket').imageUrl,
        size: 'M',
        quantity: 1,
        price: 89.99,
      },
      {
        productId: '3',
        name: 'Elegant Floral Maxi Dress',
        image: getPlaceholderImage('women-dress').imageUrl,
        size: 'S',
        quantity: 1,
        price: 120.5,
      },
    ],
    status: 'Pending',
    createdAt: new Date('2024-05-20T10:30:00Z'),
  },
  {
    orderId: 'MM90ZIVKTG',
    name: 'Jane Smith',
    phone: '8368802934',
    items: [
        {
            productId: '2',
            name: 'Striped Crewneck Sweater',
            image: getPlaceholderImage('men-sweater').imageUrl,
            size: 'L',
            quantity: 2,
            price: 65.00
        }
    ],
    status: 'Shipped',
    createdAt: new Date('2024-05-22T14:00:00Z')
  }
];
