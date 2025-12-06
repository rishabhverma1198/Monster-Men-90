import { ProductForm } from "@/components/admin/ProductForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package2 } from "lucide-react";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Package2 className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold">Upload Items</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            Fill out the form below to add a new product to your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
