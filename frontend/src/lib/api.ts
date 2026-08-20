const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: AuthUser;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Sends and receives httpOnly cookies securely
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg =
        data.message ||
        (Array.isArray(data.errors) ? data.errors[0]?.message : null) ||
        `HTTP Error ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("SERVER_OFFLINE // BACKEND UNREACHABLE");
    }
    throw err;
  }
}

export const api = {
  auth: {
    register: (payload: RegisterPayload) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload: LoginPayload) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: () => request<AuthResponse>("/auth/me"),
    logout: () =>
      request<{ success: boolean; message: string }>("/auth/logout", {
        method: "POST",
      }),
  },
};
