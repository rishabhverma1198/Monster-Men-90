
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order } from "@/lib/types";
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { trackOrder as trackOrderAction } from "@/app/actions";

const STATUS_CLASSES: Record<Order['status'], string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  Packed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Shipped: "bg-purple-100 text-purple-800 border-purple-200",
  Delivered: "bg-green-100 text-green-800 border-green-200",
};


export default function OrdersPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || "");
  const [phone, setPhone] = useState(searchParams.get('phone') || "");
  const [isLoading, setIsLoading] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Effect to auto-search if params are present in URL
  useEffect(() => {
    const initialOrderId = searchParams.get('orderId');
    const initialPhone = searchParams.get('phone');
    if (initialOrderId && initialPhone) {
      handleTrackOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTrackOrder = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderId || !phone) {
        setError("Please provide both Order ID and Phone Number.");
        return;
    }
    setIsLoading(true);
    setSearchedOrder(null);
    setError(null);
    
    // Using the server action to track order
    const result = await trackOrderAction(orderId, phone);

    if (result.success && result.order) {
      setSearchedOrder(result.order);
    } else {
      setError(result.error || "Failed to find order.");
    }

    setIsLoading(false);
  };


  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    if (!firestore || !user) return;
    const orderRef = doc(firestore, 'orders_leads', orderId);
    const updatedData = { status: newStatus };
    
    updateDoc(orderRef, updatedData)
        .then(() => {
            toast({
                title: "Status Updated",
                description: `Order ${orderId} is now ${newStatus}.`,
            });
            // Optimistically update the local state
            if(searchedOrder && searchedOrder.orderId === orderId) {
              setSearchedOrder({...searchedOrder, status: newStatus});
            }
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: orderRef.path,
                operation: 'update',
                requestResourceData: updatedData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }

  const getTotalOrderValue = (order: Order) => {
    return order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Order Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track Specific Order</CardTitle>
          <CardDescription>
            Enter an Order ID and customer's phone to find and manage a specific order.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row items-end gap-4 mb-6">
              <div className="w-full sm:w-auto flex-grow space-y-2">
                <Label htmlFor="order-id">Order ID</Label>
                <Input
                  id="order-id"
                  placeholder="MM90-XXXXXX"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                />
              </div>
              <div className="w-full sm:w-auto flex-grow space-y-2">
                <Label htmlFor="phone">Customer Phone</Label>
                <Input
                  id="phone"
                  placeholder="Customer's phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Track Order
              </Button>
            </form>

            {error && <p className="text-sm text-destructive">{error}</p>}
            
            {searchedOrder && (
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow key={searchedOrder.orderId}>
                        <TableCell className="font-medium">{searchedOrder.orderId}</TableCell>
                        <TableCell>
                            <div className="font-medium">{searchedOrder.name}</div>
                            <div className="text-sm text-muted-foreground">{searchedOrder.phone}</div>
                        </TableCell>
                        <TableCell>{searchedOrder.createdAt ? new Date(searchedOrder.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="text-center">{searchedOrder.items.length}</TableCell>
                        <TableCell className="text-right">${getTotalOrderValue(searchedOrder).toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                        <Select defaultValue={searchedOrder.status} onValueChange={(value) => handleStatusChange(searchedOrder.orderId, value as Order['status'])}>
                            <SelectTrigger className={`w-[120px] text-xs h-8 ${STATUS_CLASSES[searchedOrder.status]}`}>
                            <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                            {Object.keys(STATUS_CLASSES).map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            )}

        </CardContent>
      </Card>
    </div>
  );
}
