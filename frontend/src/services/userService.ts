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
  async getAllUsers(params?: { search?: string; status?: "active" | "blocked" }): Promise<DBUser[]> {
    try {
      let query = "/users";
      const qParams: string[] = [];
      if (params?.search) qParams.push(`search=${encodeURIComponent(params.search)}`);
      if (params?.status) qParams.push(`status=${params.status}`);
      if (qParams.length) query += `?${qParams.join("&")}`;

      const res = await apiRequest<{ users: DBUser[] }>(query);
      if (res.success && res.data && Array.isArray(res.data.users)) {
        return res.data.users;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  // Create new customer from Admin panel
  async createUserByAdmin(data: { name: string; email: string; password: string; phone: string }): Promise<{ success: boolean; data?: { user: DBUser }; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
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

  // Update customer name and phone
  async updateUser(
    userId: string,
    data: { name?: string; phone?: string }
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

  // Timed block/unblock with durationDays
  async toggleBlockWithDuration(
    userId: string,
    durationDays: number
  ): Promise<{ success: boolean; data?: { user: DBUser }; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/users/${userId}/block`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ durationDays }),
      });
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: msg };
    }
  },

  // Delete user account (permanently cascades Cart and Orders)
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
