import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  price: number;
  duration?: number; // days
  type: "subscription" | "single";
}

export const PRODUCTS: Product[] = [
  {
    id: "sheng_monthly",
    name: "镜微·省 月度会员",
    price: 19.9,
    duration: 30,
    type: "subscription"
  },
  {
    id: "sheng_yearly",
    name: "镜微·省 年度会员",
    price: 168,
    duration: 365,
    type: "subscription"
  },
  {
    id: "ten_report_single",
    name: "10 次内省洞察报告",
    price: 9.9,
    type: "single"
  }
];

export const createOrder = async (productId: string, userId: string) => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) throw new Error("Product not found");

  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId,
      productName: product.name,
      amount: product.price,
      userId
    }),
  });
  
  const data = await response.json();
  
  // Save to Firestore
  await setDoc(doc(db, "users", userId, "orders", data.orderId), {
    productId,
    productName: product.name,
    amount: product.price,
    currency: "CNY",
    status: "pending",
    provider: "mock",
    createdAt: serverTimestamp()
  });

  return data;
};

export const processPayment = async (orderId: string, userId: string, productId: string) => {
  const response = await fetch("/api/simulate-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, userId, productId }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // 1. Update Order Status
    await updateDoc(doc(db, "users", userId, "orders", orderId), {
      status: "paid",
      paidAt: serverTimestamp()
    });

    // 2. Activate Entitlement
    const userRef = doc(db, "users", userId);
    const product = PRODUCTS.find(p => p.id === productId);
    
    if (product?.type === "subscription") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (product.duration || 30));
      
      await updateDoc(userRef, {
        subscriptionType: "sheng",
        subscriptionExpiry: expiryDate.getTime(),
        subscriptionTier: "sheng"
      });
    } else {
      // Handle single report unlock or other logic
      await updateDoc(userRef, {
        unlockedInsightsCount: 10 // Mock implementation
      });
    }
  }

  return data;
};
