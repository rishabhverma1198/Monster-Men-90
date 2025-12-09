
import type { Product } from './types';
import { getPlaceholderImage } from './placeholder-images';

// This file is now only for placeholder products if needed for UI mockups,
// but the app primarily fetches from Firestore.
// All order data has been removed to avoid confusion with live data.

export const placeholderProducts: Product[] = [
  // This data can be used as a fallback or for initial seeding.
  // The live application will fetch products from the Firestore 'products' collection.
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
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
