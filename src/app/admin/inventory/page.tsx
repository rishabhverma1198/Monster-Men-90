
"use client"

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductVariant } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, getDocs, query, updateDoc, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface InventoryItem extends ProductVariant {
  id: string; // Document ID of the variant
  productId: string;
  productName: string;
  category: string;
}

function InventoryRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
      <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
      <TableCell className="text-right"><div className="flex justify-end"><Skeleton className="h-8 w-20" /></div></TableCell>
    </TableRow>
  )
}

export default function InventoryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products first
  const productsQuery = useMemoFirebase(
    () => (firestore && !isUserLoading ? collection(firestore, 'products') : null),
    [firestore, isUserLoading]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  // Then fetch all variants for each product
  useState(() => {
    if (products && firestore) {
      const fetchAllVariants = async () => {
        setIsLoading(true);
        const allItems: InventoryItem[] = [];
        for (const p of products) {
          const variantsQuery = collection(firestore, 'products', p.id, 'variants');
          const variantsSnapshot = await getDocs(variantsQuery);
          variantsSnapshot.forEach(variantDoc => {
            const variantData = variantDoc.data() as ProductVariant;
            allItems.push({
              ...variantData,
              id: variantDoc.id,
              productId: p.id,
              productName: p.name,
              category: p.category,
            });
          });
        }
        setInventory(allItems);
        setIsLoading(false);
      };
      fetchAllVariants();
    } else if (!productsLoading) {
      setIsLoading(false);
    }
  }, [products, firestore, productsLoading]);


  const handleStockChange = async (productId: string, variantId: string, newStock: number) => {
    if (!firestore || newStock < 0) return;
    
    const variantRef = doc(firestore, 'products', productId, 'variants', variantId);
    
    try {
      await updateDoc(variantRef, { stock: newStock });
      setInventory(prev => prev.map(item => 
        item.id === variantId ? { ...item, stock: newStock } : item
      ));
      toast({
        title: "Stock Updated",
        description: `Stock for the variant has been updated to ${newStock}.`,
      });
    } catch(e) {
      console.error("Failed to update stock: ", e);
      toast({
        title: "Update Failed",
        description: "Could not update the variant's stock.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>View and manage stock for all product variants.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-center">Current Stock</TableHead>
                <TableHead className="text-right">Update Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isUserLoading ? (
                <>
                  <InventoryRowSkeleton />
                  <InventoryRowSkeleton />
                  <InventoryRowSkeleton />
                  <InventoryRowSkeleton />
                </>
              ) : inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.stock === 0 ? "destructive" : item.stock < 10 ? "outline" : "default"}>
                        {item.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex justify-end items-center gap-2">
                         <Input
                           type="number"
                           defaultValue={item.stock}
                           className="w-20 h-8"
                           onBlur={(e) => handleStockChange(item.productId, item.id, parseInt(e.target.value) || 0)}
                         />
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No products found in inventory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
