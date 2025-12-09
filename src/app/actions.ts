
"use server";

import type { CartItem, Order } from "@/lib/types";
import { collection, doc, setDoc, serverTimestamp, getDocs, query, where, Timestamp } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { firebaseConfig } from "@/firebase/config";


// This function needs its own separate Firebase initialization
// because Server Actions run in a separate environment.
async function getFirebaseInstances() {
    // Check if any app is already initialized
    if (!getApps().length) {
        // If not, initialize with the config
        initializeApp(firebaseConfig);
    }
    // Get the (now initialized) app and its services
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Ensure we have an authenticated user for server actions
    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
    return { db, auth };
}


export async function createOrder(orderInput: OrderInput): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const { db } = await getFirebaseInstances();

    // 1. Generate a unique Order ID
    const orderId = `MM90-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 2. Create the order object
    const newOrder: Omit<Order, 'createdAt'> & { createdAt: any } = {
      ...orderInput,
      orderId,
      createdAt: serverTimestamp(), // Use server timestamp for creation
    };

    // 3. Save the order to Firestore
    await setDoc(doc(db, "orders_leads", orderId), newOrder);
    
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
        const { db } = await getFirebaseInstances();
        
        const q = query(collection(db, "orders_leads"), where("orderId", "==", orderId), where("phone", "==", phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            const orderData = orderDoc.data() as Omit<Order, 'createdAt'> & { createdAt: Timestamp };
            
            // Firestore timestamps need to be converted for serialization
            const serializableOrder: Order = {
              ...orderData,
              createdAt: orderData.createdAt.toDate().toISOString(),
            };

            return { success: true, order: serializableOrder };
        } else {
            return { success: false, error: "Order not found. Please check your Order ID and Phone Number." };
        }

    } catch (error) {
        console.error("Error tracking order:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: errorMessage };
    }
}
