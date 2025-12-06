
"use server";

import type { CartItem, Order } from "@/lib/types";
import { collection, doc, setDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { getSdks } from "@/firebase";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";


interface OrderInput {
  name: string;
  phone: string;
  items: CartItem[];
  status: Order["status"];
}

// This function needs its own separate Firebase initialization
// because Server Actions run in a separate environment.
async function getFirestoreInstance() {
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
    return getFirestore();
}


// In a real app, this would interact with a database like Firebase Firestore.
export async function createOrder(orderInput: OrderInput): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const db = await getFirestoreInstance();

    // 1. Generate a unique Order ID
    const orderId = `MM90-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 2. Create the order object
    const newOrder: Order = {
      ...orderInput,
      orderId,
      createdAt: serverTimestamp(),
    };

    // 3. "Save" the order to Firestore
    await setDoc(doc(db, "orders_leads", orderId), newOrder);

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
        const db = await getFirestoreInstance();
        
        const q = query(collection(db, "orders_leads"), where("orderId", "==", orderId), where("phone", "==", phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            const order = orderDoc.data() as Order;
            // Firestore timestamps need to be converted for serialization
            const serializableOrder = {
              ...order,
              createdAt: order.createdAt.toDate().toISOString(),
            };
            return { success: true, order: serializableOrder as unknown as Order };
        } else {
            return { success: false, error: "Order not found. Please check your Order ID and Phone Number." };
        }

    } catch (error) {
        console.error("Error tracking order:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: errorMessage };
    }
}
