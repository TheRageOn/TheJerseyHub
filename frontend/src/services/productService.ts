import { JERSEYS, Jersey } from "@/data/jerseys";

export interface DBJersey extends Jersey {
  _id?: string;
  category: "club" | "retro" | "special" | "vintage" | "nation" | "national";
  league: string;
  sizesAvailable: ("S" | "M" | "L" | "XL" | "XXL")[];
  stock?: number;
  rating: number;
  inStock: boolean;
  showOnLanding: boolean;
  landingOrder: number;
  showInShop: boolean;
  featured: boolean;
  description?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Curated 12-kit fallback catalog for SSR / Vercel offline resilience
export const FALLBACK_CATALOG: DBJersey[] = [
  {
    ...JERSEYS[0],
    category: "club",
    league: "La Liga",
    sizesAvailable: ["S", "M", "L", "XL"],
    stock: 30,
    rating: 4.9,
    inStock: true,
    showOnLanding: true,
    landingOrder: 0,
    showInShop: true,
    featured: true,
  },
  {
    ...JERSEYS[1],
    category: "club",
    league: "La Liga",
    sizesAvailable: ["M", "L", "XL", "XXL"],
    stock: 25,
    rating: 4.8,
    inStock: true,
    showOnLanding: true,
    landingOrder: 1,
    showInShop: true,
    featured: false,
  },
  {
    ...JERSEYS[2],
    category: "club",
    league: "Premier League",
    sizesAvailable: ["S", "M", "L", "XL"],
    stock: 20,
    rating: 4.9,
    inStock: true,
    showOnLanding: true,
    landingOrder: 2,
    showInShop: true,
    featured: true,
  },
  {
    ...JERSEYS[3],
    category: "club",
    league: "Premier League",
    sizesAvailable: ["S", "M", "L", "XL", "XXL"],
    stock: 35,
    rating: 4.7,
    inStock: true,
    showOnLanding: true,
    landingOrder: 3,
    showInShop: true,
    featured: false,
  },
  {
    id: "man-utd-98-99",
    code: "05/MUFC-TREBLE",
    name: "MAN UTD 98/99 TREBLE WINNERS",
    season: "98/99 VINTAGE FINAL SPEC",
    price: "$165.00",
    imageSrc: "/images/manchester-united-jersey.svg",
    edition: "HERITAGE VAULT EDITION",
    club: "MANCHESTER UNITED",
    category: "vintage",
    league: "Vintage Archive",
    sizesAvailable: ["M", "L", "XL"],
    stock: 12,
    rating: 5.0,
    inStock: true,
    showOnLanding: false,
    landingOrder: 4,
    showInShop: true,
    featured: true,
  },
  {
    id: "arsenal-invincibles",
    code: "06/ARS-0304",
    name: "ARSENAL 03/04 THE INVINCIBLES",
    season: "03/04 COMMEMORATIVE SPEC",
    price: "$150.00",
    imageSrc: "/images/arsenal-jersey.svg",
    edition: "HERITAGE MATCH RUN",
    club: "ARSENAL FC",
    category: "retro",
    league: "Vintage Archive",
    sizesAvailable: ["S", "M", "L", "XL"],
    stock: 15,
    rating: 4.9,
    inStock: true,
    showOnLanding: false,
    landingOrder: 5,
    showInShop: true,
    featured: false,
  },
  {
    id: "ac-milan-0607",
    code: "07/ACM-UCL",
    name: "AC MILAN 06/07 ATHENS UCL FINAL",
    season: "06/07 FINALIST MATCH SPEC",
    price: "$155.00",
    imageSrc: "/images/barca-jersey.svg",
    edition: "ROUGE & NOIR ARCHIVE",
    club: "AC MILAN",
    category: "vintage",
    league: "Serie A",
    sizesAvailable: ["S", "M", "L", "XL"],
    stock: 10,
    rating: 4.9,
    inStock: true,
    showOnLanding: false,
    landingOrder: 6,
    showInShop: true,
    featured: false,
  },
  {
    id: "inter-0910",
    code: "08/INT-TREBLE",
    name: "INTER MILAN 09/10 HISTORIC TREBLE",
    season: "09/10 BERNABÉU WINNER SPEC",
    price: "$145.00",
    imageSrc: "/images/real-jersey.svg",
    edition: "NERAZZURRI COMMEMORATIVE",
    club: "INTER MILAN",
    category: "vintage",
    league: "Serie A",
    sizesAvailable: ["M", "L", "XL"],
    stock: 14,
    rating: 5.0,
    inStock: true,
    showOnLanding: false,
    landingOrder: 7,
    showInShop: true,
    featured: false,
  },
  {
    id: "real-madrid-galacticos",
    code: "09/RMA-0203",
    name: "REAL MADRID 02/03 CENTENARIO",
    season: "02/03 100TH CENTURY EDITION",
    price: "$160.00",
    imageSrc: "/images/real-jersey.svg",
    edition: "BLANCO HERITAGE RUN",
    club: "REAL MADRID CF",
    category: "retro",
    league: "La Liga",
    sizesAvailable: ["S", "M", "L", "XL", "XXL"],
    stock: 18,
    rating: 4.9,
    inStock: true,
    showOnLanding: false,
    landingOrder: 8,
    showInShop: true,
    featured: false,
  },
  {
    id: "barca-0809-sextuple",
    code: "10/FCB-0809",
    name: "FC BARCELONA 08/09 SEXTUPLE",
    season: "08/09 HISTORIC ROME RUN",
    price: "$155.00",
    imageSrc: "/images/barca-jersey.svg",
    edition: "BLAUGRANA IMMORTAL",
    club: "FC BARCELONA",
    category: "retro",
    league: "La Liga",
    sizesAvailable: ["S", "M", "L", "XL"],
    stock: 16,
    rating: 5.0,
    inStock: true,
    showOnLanding: false,
    landingOrder: 9,
    showInShop: true,
    featured: false,
  },
  {
    id: "arsenal-bruised-banana",
    code: "11/ARS-9193",
    name: "ARSENAL 91/93 BRUISED BANANA",
    season: "91/93 ICONIC AWAY RUN",
    price: "$175.00",
    imageSrc: "/images/arsenal-jersey.svg",
    edition: "CULT RETRO DROP",
    club: "ARSENAL FC",
    category: "vintage",
    league: "Vintage Archive",
    sizesAvailable: ["M", "L", "XL"],
    stock: 8,
    rating: 4.9,
    inStock: true,
    showOnLanding: false,
    landingOrder: 10,
    showInShop: true,
    featured: false,
  },
  {
    id: "man-utd-9496-cantona",
    code: "12/MUFC-CANTONA",
    name: "MAN UTD 94/96 CANTONA COLLAR",
    season: "94/96 OLD TRAFFORD SPEC",
    price: "$170.00",
    imageSrc: "/images/manchester-united-jersey.svg",
    edition: "KING ARCHIVE SPEC",
    club: "MANCHESTER UNITED",
    category: "vintage",
    league: "Vintage Archive",
    sizesAvailable: ["S", "M", "L", "XL"],
    stock: 10,
    rating: 5.0,
    inStock: true,
    showOnLanding: false,
    landingOrder: 11,
    showInShop: true,
    featured: false,
  },
];

export const productService = {
  // Fetch active jerseys for 3D landing page
  async getLandingJerseys(): Promise<DBJersey[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/landing`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.products) && json.data.products.length > 0) {
        return json.data.products.map((p: Record<string, unknown>) => ({
          ...p,
          id: p._id || p.id || p.code,
        }));
      }
    } catch {
      // Graceful offline fallback
    }
    return FALLBACK_CATALOG.filter((j) => j.showOnLanding).sort(
      (a, b) => a.landingOrder - b.landingOrder
    );
  },

  // Fetch shop catalog
  async getShopJerseys(): Promise<DBJersey[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products?showInShop=true`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.products) && json.data.products.length > 0) {
        return json.data.products.map((p: Record<string, unknown>) => ({
          ...p,
          id: p._id || p.id || p.code,
        }));
      }
    } catch {
      // Graceful offline fallback
    }
    return FALLBACK_CATALOG.filter((j) => j.showInShop);
  },

  // Fetch full inventory for Admin Command Deck
  async getAllAdminJerseys(): Promise<DBJersey[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.products) && json.data.products.length > 0) {
        return json.data.products.map((p: Record<string, unknown>) => ({
          ...p,
          id: p._id || p.id || p.code,
        }));
      }
    } catch {
      // Graceful fallback
    }
    return FALLBACK_CATALOG;
  },

  // Helper to get auth headers
  getAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tjh_token")
        : null);
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }
    return headers;
  },

  // Admin: Update placement toggles
  async updatePlacement(
    id: string,
    placement: Partial<DBJersey>,
    token?: string
  ): Promise<{ success: boolean; data?: DBJersey; message?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await fetch(`${API_BASE_URL}/products/${id}/placement`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(placement),
      });
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: msg };
    }
  },

  // Admin: Create / Publish new jersey
  async createJersey(
    data: Partial<DBJersey>,
    token?: string
  ): Promise<{ success: boolean; data?: { product: DBJersey }; message?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await fetch(`${API_BASE_URL}/products`, {
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

  // Admin: Update entire jersey
  async updateJersey(
    id: string,
    data: Partial<DBJersey>,
    token?: string
  ): Promise<{ success: boolean; data?: { product: DBJersey }; message?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
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

  // Admin: Delete jersey
  async deleteJersey(
    id: string,
    token?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
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

  // Admin: Remove background from image using AI
  async removeBackground(
    imageBase64: string,
    token?: string
  ): Promise<{ success: boolean; data?: { image: string }; message?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await fetch(`${API_BASE_URL}/products/remove-bg`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ image: imageBase64 }),
      });
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: msg };
    }
  },
};
