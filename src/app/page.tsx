import PublicLayout from "./public-layout";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getPlaceholderImage } from "@/lib/placeholder-images";

export default function HomePage() {
  const selectionCards = [
    {
      title: "Individual Buyer (Men)",
      image: getPlaceholderImage("men-category").imageUrl,
      imageHint: getPlaceholderImage("men-category").imageHint,
      href: "/products?category=men",
    },
    {
      title: "Individual Buyer (Women)",
      image: getPlaceholderImage("women-category").imageUrl,
      imageHint: getPlaceholderImage("women-category").imageHint,
      href: "/products?category=women",
    },
    {
      title: "Wholesale Buyer",
      image: getPlaceholderImage("wholesale-category").imageUrl,
      imageHint: getPlaceholderImage("wholesale-category").imageHint,
      href: "/products?category=wholesale",
    },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            Find Your Perfect Style
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our curated collections for men and women, or explore wholesale opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {selectionCards.map((card) => (
            <Card key={card.title} className="group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
              <Link href={card.href}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <Image
                  src={card.image}
                  alt={card.title}
                  width={600}
                  height={800}
                  data-ai-hint={card.imageHint}
                  className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <h2 className="text-2xl font-bold text-white">{card.title}</h2>
                  <Button variant="outline" className="mt-4 bg-transparent text-white border-white hover:bg-white hover:text-black">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
