import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasStock = product.variants.some(v => v.stock > 0);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/products/${product.slug}`} className="block">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {!hasStock && (
                <Badge variant="destructive" className="absolute top-2 left-2">Out of Stock</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-base font-medium mb-1 truncate">{product.name}</CardTitle>
          <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
