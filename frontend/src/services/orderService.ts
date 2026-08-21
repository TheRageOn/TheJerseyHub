import { apiRequest } from "@/lib/api";

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  country?: string;
}

export interface DBOrder {
  _id: string;
  id?: string;
  user: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const orderService = {
  // Get all orders (Admin Dispatch)
  async getAllOrders(): Promise<DBOrder[]> {
    try {
      const res = await apiRequest<{ orders: DBOrder[] }>("/orders");
      if (res.success && res.data && Array.isArray(res.data.orders)) {
        return res.data.orders;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  // Get personal orders for authenticated user
  async getMyOrders(): Promise<DBOrder[]> {
    try {
      const res = await apiRequest<{ orders: DBOrder[] }>("/orders/my-orders");
      if (res.success && res.data && Array.isArray(res.data.orders)) {
        return res.data.orders;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  // Update order status (Admin)
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<{ success: boolean; data?: { order: DBOrder }; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: msg };
    }
  },

  // Delete order (Admin)
  async deleteOrder(
    orderId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: msg };
    }
  },
};
