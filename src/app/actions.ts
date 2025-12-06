"use server";

import type { CartItem, Order } from "@/lib/types";
import { placeholderOrders, placeholderProducts } from "@/lib/placeholder-data";

interface OrderInput {
  name: string;
  phone: string;
  items: CartItem[];
  status: Order["status"];
}

// In a real app, this would interact with a database like Firebase Firestore.
export async function createOrder(orderInput: OrderInput): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // 1. Generate a unique Order ID
    const orderId = `MM90-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 2. Create the order object
    const newOrder: Order = {
      ...orderInput,
      orderId,
      createdAt: new Date(), // In Firebase, this would be serverTimestamp()
    };

    // 3. "Save" the order (in memory for this placeholder)
    placeholderOrders.push(newOrder);

    // 4. In a real app, you might also want to update product stock here.
    
    console.log("Order created:", newOrder);

    return { success: true, orderId: newOrder.orderId };
  } catch (error) {
    console.error("Error creating order:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function trackOrder(orderId: string, phone: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        // In a real app, this would be a Firestore query:
        // const q = query(collection(db, "orders_leads"), where("orderId", "==", orderId), where("phone", "==", phone));
        // const querySnapshot = await getDocs(q);

        const order = placeholderOrders.find(o => o.orderId.toLowerCase() === orderId.toLowerCase() && o.phone === phone);

        if (order) {
            // Returning a plain object to avoid serialization issues with dates
            return { success: true, order: JSON.parse(JSON.stringify(order)) };
        } else {
            return { success: false, error: "Order not found. Please check your Order ID and Phone Number." };
        }

    } catch (error) {
        console.error("Error tracking order:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: errorMessage };
    }
}
