"use client"

import { useState } from "react";
import { placeholderProducts } from "@/lib/placeholder-data";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Boxes } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/types";

interface InventoryItem extends ProductVariant {
  productId: string;
  productName: string;
  category: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(
    placeholderProducts.flatMap(p => 
      p.variants.map(v => ({
        ...v,
        productId: p.id,
        productName: p.name,
        category: p.category,
      }))
    )
  );

  const handleStockChange = (productId: string, size: string, newStock: number) => {
    // In a real app, this would be a server action to update the database
    console.log(`Updating stock for ${productId} size ${size} to ${newStock}`);
    setInventory(prev => prev.map(item => 
      item.productId === productId && item.size === size 
      ? { ...item, stock: newStock }
      : item
    ));
  };
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Boxes className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold">Inventory Management</h1>
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
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow key={`${item.productId}-${item.size}`}>
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
                    <TableCell className="text-right">
                       <div className="flex justify-end items-center gap-2">
                         <Input
                           type="number"
                           defaultValue={item.stock}
                           className="w-20 h-8"
                           onChange={(e) => handleStockChange(item.productId, item.size, parseInt(e.target.value) || 0)}
                         />
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
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
