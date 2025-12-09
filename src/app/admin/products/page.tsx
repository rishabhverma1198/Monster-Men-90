
"use client"

import { useState, useMemo } from "react";
import Image from 'next/image';
import { ProductForm } from "@/components/admin/ProductForm";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, deleteDoc, doc, getDocs, writeBatch, Timestamp } from "firebase/firestore";
import type { Product, ProductVariant } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getStorage, ref, deleteObject } from "firebase/storage";


function ProductRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="aspect-square rounded-md w-16 h-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  );
}


export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const productsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'products') : null),
    [firestore, user]
  );
  const { data: products, isLoading } = useCollection<Product & { createdAt: Timestamp }>(productsQuery);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => 
    products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const handleDeleteProduct = async () => {
    if (!productToDelete || !firestore || !user) {
      toast({ title: "Error", description: "Product not selected or database not available.", variant: "destructive" });
      return;
    }

    const productRef = doc(firestore, 'products', productToDelete.id);
    const variantsRef = collection(firestore, 'products', productToDelete.id, 'variants');

    try {
        // Batch delete variants
        const variantsSnapshot = await getDocs(variantsRef);
        const batch = writeBatch(firestore);
        variantsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Delete images from Storage
        const storage = getStorage();
        for (const imageUrl of productToDelete.images) {
            try {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            } catch (storageError: any) {
                if (storageError.code !== 'storage/object-not-found') {
                    console.warn(`Could not delete image ${imageUrl}:`, storageError);
                }
            }
        }

        // Delete the product document itself
        await deleteDoc(productRef);

        toast({
            title: "Product Deleted",
            description: `"${productToDelete.name}" has been successfully deleted.`,
        });

    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: productRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setProductToDelete(null);
    }
  };


  return (
    <>
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="new">Add New</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Price
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Created at
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading || isUserLoading ? (
                    <>
                      <ProductRowSkeleton />
                      <ProductRowSkeleton />
                      <ProductRowSkeleton />
                    </>
                  ) : filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <ProductRow key={product.id} product={product} onSelectDelete={setProductToDelete} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No products found. Add one to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="new">
           <Card>
              <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>
                  Fill out the form below to add a new product to your store.
              </CardDescription>
              </CardHeader>
              <CardContent>
                  <ProductForm onProductAdded={() => setActiveTab("all")} />
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
     <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}" and all its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Memoized row component to avoid re-rendering every row on filter change
const ProductRow = memo(function ProductRow({ product, onSelectDelete }: { product: Product & { createdAt: Timestamp }, onSelectDelete: (product: Product) => void}) {
    const firestore = useFirestore();
    const variantsCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'products', product.id, 'variants') : null), [firestore, product.id]);
    const { data: variants } = useCollection<ProductVariant>(variantsCollection);
    const hasStock = variants ? variants.some(v => v.stock > 0) : false;

    return (
        <TableRow>
            <TableCell className="hidden sm:table-cell">
                <Image
                    alt={product.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.images[0]}
                    width="64"
                />
            </TableCell>
            <TableCell className="font-medium">
                {product.name}
            </TableCell>
            <TableCell>
                <Badge variant={hasStock ? "default" : "outline"}>
                {hasStock ? "In Stock" : "Out of Stock"}
                </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                ${product.price.toFixed(2)}
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {product.createdAt ? product.createdAt.toDate().toLocaleDateString() : 'N/A'}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onClick={() => onSelectDelete(product)}
                    >
                    Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});
