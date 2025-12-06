"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { placeholderProducts } from "@/lib/placeholder-data";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import type { Product, ProductVariant } from "@/lib/types";
import { ShoppingCart, Minus, Plus } from "lucide-react";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = placeholderProducts.find((p) => p.slug === params.slug);
  
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (selectedVariant && product) {
        addToCart({
            productId: product.id,
            name: product.name,
            image: product.images[0],
            size: selectedVariant.size,
            quantity: quantity,
            price: selectedVariant.price,
        });
        setQuantity(1);
    }
  }

  const handleVariantChange = (size: string) => {
    const variant = product.variants.find(v => v.size === size);
    if(variant) {
        setSelectedVariant(variant);
        setQuantity(1); // Reset quantity when variant changes
    }
  }

  const isAddToCartDisabled = !selectedVariant || selectedVariant.stock === 0 || quantity > selectedVariant.stock;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <ProductCarousel images={product.images} productName={product.name} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mt-2">${product.price.toFixed(2)}</p>
          <div className="mt-4">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="mr-2 mb-2">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-muted-foreground leading-relaxed">{product.description}</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Select Size</h3>
            <RadioGroup 
                onValueChange={handleVariantChange} 
                className="flex flex-wrap gap-2 mt-2"
            >
              {product.variants.map((variant) => (
                <div key={variant.size}>
                  <RadioGroupItem value={variant.size} id={variant.size} className="sr-only" disabled={variant.stock === 0} />
                  <Label htmlFor={variant.size} className={`border rounded-md p-3 px-4 cursor-pointer text-sm ${variant.stock === 0 ? 'cursor-not-allowed opacity-50' : 'hover:bg-accent hover:text-accent-foreground'} ${selectedVariant?.size === variant.size ? 'bg-primary text-primary-foreground' : ''}`}>
                    {variant.size}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {selectedVariant && (
                <p className="text-sm mt-2">
                    {selectedVariant.stock > 0 && selectedVariant.stock <= 5 && <span className="text-destructive font-semibold">Only {selectedVariant.stock} left in stock!</span>}
                    {selectedVariant.stock === 0 && <span className="text-destructive font-semibold">Out of stock</span>}
                </p>
            )}
          </div>

          <div className="flex items-center gap-4 mt-6">
            <h3 className="text-lg font-semibold">Quantity</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q-1))} disabled={!selectedVariant}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 1, q+1))} disabled={!selectedVariant || quantity >= (selectedVariant?.stock || 0)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button size="lg" className="w-full bg-accent hover:bg-accent/90" onClick={handleAddToCart} disabled={isAddToCartDisabled}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
