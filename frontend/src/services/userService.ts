import { apiRequest } from "@/lib/api";

export interface DBUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  isBlocked: boolean;
  blockedUntil?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const userService = {
  // Get all registered users from MongoDB (Admin)
  async getAllUsers(): Promise<DBUser[]> {
    try {
      const res = await apiRequest<{ users: DBUser[] }>("/users");
      if (res.success && res.data && Array.isArray(res.data.users)) {
        return res.data.users;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  // Update user role / details
  async updateUser(
    userId: string,
    data: Partial<DBUser>
  ): Promise<{ success: boolean; data?: { user: DBUser }; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: msg };
    }
  },

  // Toggle user block status
  async toggleBlockUser(
    userId: string,
    isBlocked: boolean
  ): Promise<{ success: boolean; data?: { user: DBUser }; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/users/${userId}/block`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ isBlocked }),
      });
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: msg };
    }
  },

  // Delete user account
  async deleteUser(
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
