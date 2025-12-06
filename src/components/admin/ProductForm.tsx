
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
import { Label } from "@/components/ui/label";
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
import Image from "next/image";
import { useState, useEffect } from "react";

const variantSchema = z.object({
  size: z.enum(["S", "M", "L", "XL", "XXL"]),
  stock: z.coerce.number().min(0, "Stock cannot be negative."),
  price: z.coerce.number().min(0.01, "Price must be greater than 0."),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format."),
  category: z.enum(["men", "women", "wholesale"]),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0.01, "Base price must be greater than 0."),
  tags: z.string().min(1, "Please add at least one tag."),
  images: z.array(z.any())
    .min(1, "Please upload at least one image.")
    .max(5, "You can upload a maximum of 5 images."),
  variants: z.array(variantSchema).min(1, "Please add at least one product variant."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm() {
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "men",
      description: "",
      price: 0,
      tags: "",
      images: [],
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

  const watchedImages = form.watch("images");

  function onSubmit(data: ProductFormValues) {
    // In a real app, this is where you would upload files to Firebase Storage
    // and then save the product data with image URLs to Firestore.
    console.log("Product data:", data);
    
    // Create a new object for display that replaces File objects with their names
    const displayData = {
        ...data,
        images: data.images.map((file: File) => file.name),
    };

    toast({
      title: "Product Submitted!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(displayData, null, 2)}</code>
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
        
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Images</FormLabel>
              <FormDescription>Upload 1 to 5 images for your product.</FormDescription>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if(files.length + imageFields.length > 5){
                        toast({title: "Too many images", description: "You can upload a maximum of 5 images.", variant: "destructive"});
                        return;
                    }
                    files.forEach(file => appendImage(file));
                  }}
                  className="hidden"
                  id="image-upload"
                />
              </FormControl>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {isMounted && imageFields.map((field, index) => {
                    const imageSrc = watchedImages[index] instanceof File ? URL.createObjectURL(watchedImages[index]) : '';
                    return (
                      <div key={field.id} className="relative aspect-square border rounded-md">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover rounded-md"
                            onLoad={() => URL.revokeObjectURL(imageSrc)}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">No image</div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {imageFields.length < 5 && (
                    <Label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PlusCircle className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Add Image</p>
                      </div>
                    </Label>
                  )}
                </div>
              <FormMessage />
            </FormItem>
          )}
        />


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

    