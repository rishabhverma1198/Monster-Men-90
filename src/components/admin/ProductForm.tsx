"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const variantSchema = z.object({
  size: z.enum(["S", "M", "L", "XL", "XXL"]),
  stock: z.coerce.number().min(0, "Stock cannot be negative."),
  price: z.coerce.number().min(0.01, "Price must be greater than 0."),
});

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format."),
  category: z.enum(["men", "women", "wholesale"]),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0.01, "Base price must be greater than 0."),
  tags: z.string().min(1, "Please add at least one tag."),
  images: z.array(z.string().url("Please enter a valid URL.")).min(1, "Please add at least one image URL."),
  variants: z.array(variantSchema).min(1, "Please add at least one product variant."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm() {
    const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "men",
      description: "",
      price: 0,
      tags: "",
      images: [""],
      variants: [{ size: "M", stock: 10, price: 0 }],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  function onSubmit(data: ProductFormValues) {
    // In a real app, this would be a server action to save the product
    console.log(data);
    toast({
      title: "Product Submitted!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Classic Blue Denim Jacket" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. classic-blue-denim-jacket" {...field} />
                </FormControl>
                <FormDescription>Unique, URL-friendly identifier.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the product..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-3 gap-8">
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 89.99" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                        <Input placeholder="denim, jacket, classic" {...field} />
                    </FormControl>
                     <FormDescription>Comma-separated values.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <div>
          <FormLabel>Image URLs</FormLabel>
          <div className="space-y-4 mt-2">
            {imageFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`images.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      {imageFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendImage("")}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
            </Button>
          </div>
        </div>

        <div>
            <FormLabel>Variants</FormLabel>
            <div className="space-y-4 mt-2 p-4 border rounded-lg">
                {variantFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <FormField
                            control={form.control}
                            name={`variants.${index}.size`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Size</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {["S", "M", "L", "XL", "XXL"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Stock</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Price ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-end h-full">
                         {variantFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                        </div>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => appendVariant({ size: "M", stock: 10, price: form.getValues("price") })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                </Button>
            </div>
        </div>


        <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90">Add Product</Button>
      </form>
    </Form>
  );
}
