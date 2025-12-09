
"use client"

import { useState, useEffect } from "react";
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
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryItem extends ProductVariant {
  id: string; // Document ID of the variant
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
  const [isDerivingInventory, setIsDerivingInventory] = useState(true);

  const productsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'products') : null),
    [firestore, user]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  useEffect(() => {
    if (products && firestore && user) {
      const fetchAllVariants = async () => {
        setIsDerivingInventory(true);
        const allItems: InventoryItem[] = [];
        try {
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
        } catch (e: any) {
            const permissionError = new FirestorePermissionError({
                path: 'products', // Generic path as it iterates
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsDerivingInventory(false);
        }
      };
      fetchAllVariants();
    } else if (!productsLoading && !isUserLoading) {
      setIsDerivingInventory(false);
    }
  }, [products, firestore, productsLoading, user, isUserLoading]);


  const handleStockChange = (productId: string, variantId: string, newStock: number) => {
    if (!firestore || newStock < 0 || !user) return;
    
    const variantRef = doc(firestore, 'products', productId, 'variants', variantId);
    const updatedData = { stock: newStock };
    
    updateDoc(variantRef, updatedData)
      .then(() => {
        setInventory(prev => prev.map(item => 
          item.id === variantId ? { ...item, stock: newStock } : item
        ));
        toast({
          title: "Stock Updated",
          description: `Stock for the variant has been updated to ${newStock}.`,
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: variantRef.path,
            operation: 'update',
            requestResourceData: updatedData
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const isLoading = productsLoading || isUserLoading || isDerivingInventory;
  
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
              {isLoading ? (
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
