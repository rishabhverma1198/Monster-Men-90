"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { placeholderProducts } from '@/lib/placeholder-data';
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
import type { Product } from '@/lib/types';

const SIZES: Product['variants'][0]['size'][] = ['S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['All', 'Men', 'Women', 'Wholesale'];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products] = useState<Product[]>(placeholderProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [category, setCategory] = useState(initialCategory);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) =>
        searchTerm
          ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          : true
      )
      .filter((p) =>
        selectedSizes.length > 0
          ? p.variants.some(
              (v) => selectedSizes.includes(v.size) && v.stock > 0
            )
          : true
      )
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
  }, [products, category, searchTerm, selectedSizes, priceRange]);

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
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold">No Products Found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
