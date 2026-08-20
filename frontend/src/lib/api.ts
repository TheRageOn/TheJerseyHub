const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("tjh_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const endpointNormalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpointNormalized}`;

  try {
    let res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    }).catch(() => null);

    // Fallback to port 5000 if port 5001 is offline
    if (!res && !endpoint.startsWith("http")) {
      res = await fetch(`http://localhost:5000/api${endpointNormalized}`, {
        ...options,
        headers,
        credentials: "include",
      }).catch(() => null);
    }

    if (!res) {
      return {
        success: false,
        message: "Network error: backend server not reachable",
      };
    }

    const data = (await res.json()) as {
      success?: boolean;
      data?: T;
      message?: string;
      [key: string]: unknown;
    };

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Request failed with status " + res.status,
      };
    }

    return {
      success: true,
      data: (data.data !== undefined ? data.data : data) as T,
      message: data.message,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      success: false,
      message,
    };
  }
}
