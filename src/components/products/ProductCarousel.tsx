'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCarouselProps {
  images: string[];
  productName: string;
}

export function ProductCarousel({ images, productName }: ProductCarouselProps) {
  return (
    <Carousel className="w-full max-w-lg mx-auto">
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="relative aspect-square flex items-center justify-center p-0">
                <Image
                  src={src}
                  alt={`${productName} image ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
