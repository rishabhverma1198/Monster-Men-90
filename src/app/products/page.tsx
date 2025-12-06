
"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';
import { useCollection, useFirestore, useAuth, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Skeleton } from '@/components/ui/skeleton';

const SIZES: ProductVariant['size'][] = ['S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['All', 'Men', 'Women', 'Wholesale'];

function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [category, setCategory] = useState(initialCategory);

  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth]);

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSizes([]);
    setPriceRange([0, 200]);
    setCategory('all');
  }

  // A new component to handle filtering based on variants subcollection
  function FilteredProductGrid() {
    const { data: products, isLoading } = useCollection<Product>(productsQuery);
    const [filteredProductIds, setFilteredProductIds] = useState<string[] | null>(null);
    const [isSizeFilterLoading, setSizeFilterLoading] = useState(false);

    useEffect(() => {
      if (!products || !firestore) {
        return;
      }
      if (selectedSizes.length === 0) {
        setFilteredProductIds(null);
        return;
      }

      const findProductsWithSizes = async () => {
        setSizeFilterLoading(true);
        const matchingIds = new Set<string>();
        for (const p of products) {
            const variantsQuery = query(
                collection(firestore, 'products', p.id, 'variants'),
                where('size', 'in', selectedSizes),
                where('stock', '>', 0)
            );
            const variantsSnapshot = await getDocs(variantsQuery);
            if (!variantsSnapshot.empty) {
                matchingIds.add(p.id);
            }
        }
        setFilteredProductIds(Array.from(matchingIds));
        setSizeFilterLoading(false);
      };

      findProductsWithSizes();
    }, [products, firestore, selectedSizes]);


    const finalProducts = useMemo(() => {
      if (!products) return [];
      let list = products
        .filter(p => category.toLowerCase() === 'all' || p.category.toLowerCase() === category.toLowerCase())
        .filter(p => searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) : true)
        .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

      if (filteredProductIds !== null) {
        list = list.filter(p => filteredProductIds.includes(p.id));
      }
      
      return list;

    }, [products, category, searchTerm, priceRange, filteredProductIds]);

    if (isLoading || isSizeFilterLoading) {
      return <ProductsLoadingSkeleton />;
    }
    
    if (finalProducts.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">No Products Found</h2>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or adding products in the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-20">
            <h2 className="text-2xl font-bold mb-4">Filters</h2>
            
            <Button variant="ghost" onClick={resetFilters} className="mb-4 text-accent hover:text-accent/90">
              <X className="mr-2 h-4 w-4" /> Reset Filters
            </Button>

            <div className="space-y-6">
              {/* Search Filter */}
              <div>
                <h3 className="font-semibold mb-2">Search by name or tag</h3>
                <Input
                  placeholder="e.g. jacket, denim"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-2">Category</h3>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="font-semibold mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold mb-2">Price Range</h3>
                <Slider
                  defaultValue={[0, 200]}
                  max={200}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value)}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3">
          <FilteredProductGrid />
        </main>
      </div>
    </div>
  );
}
