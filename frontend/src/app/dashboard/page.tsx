"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/auth/AuthModal";
import ContactModal from "@/components/contact/ContactModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EmptyState from "@/components/ui/EmptyState";
import {
  productService,
  DBJersey,
  FALLBACK_CATALOG,
} from "@/services/productService";
import { orderService, DBOrder } from "@/services/orderService";
import { userService, DBUser } from "@/services/userService";
import { getSafeImageSrc } from "@/lib/imageUtils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { isWhite, toggleTheme } = useTheme();
  const { openCart } = useCart();
  const { toast } = useToast();

  const userRole = user?.role || "customer";
  const isAdmin = userRole === "admin";

  // Navigation Tab
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const activeTab = selectedTab || (isAdmin ? "admin_products" : "vault");
  const setActiveTab = (
    tab:
      | "vault"
      | "orders"
      | "settings"
      | "admin_products"
      | "admin_inventory"
      | "admin_orders"
      | "admin_users"
      | "admin_settings",
  ) => {
    setSelectedTab(tab);
  };

  // Admin view toggle (optional preview)
  const [adminCollectorPreview, setAdminCollectorPreview] = useState(false);

  // Live Catalog state from MongoDB for Admin placement controller
  const [adminJerseys, setAdminJerseys] =
    useState<DBJersey[]>(FALLBACK_CATALOG);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Live Orders state from MongoDB
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Live Registered Users directory from MongoDB (Admin)
  const [usersList, setUsersList] = useState<DBUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modals & Action States
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);
  const [editingJersey, setEditingJersey] = useState<DBJersey | null>(null);
  const [deleteModalKit, setDeleteModalKit] = useState<DBJersey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<
    "url" | "upload" | "preset"
  >("preset");
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // User Directory Modals & Action States
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "blocked"
  >("all");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [editingUser, setEditingUser] = useState<DBUser | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    phone: "",
  });

  const [blockingUser, setBlockingUser] = useState<DBUser | null>(null);
  const [blockDurationDays, setBlockDurationDays] = useState<number>(7);
  const [isBlocking, setIsBlocking] = useState(false);

  const [deleteModalUser, setDeleteModalUser] = useState<DBUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Kit Form State (for both Add and Edit)
  const [kitForm, setKitForm] = useState({
    code: "",
    name: "",
    club: "",
    season: "24/25 MATCH SPEC",
    price: "Rs. 2,500",
    stock: 25,
    category: "club" as
      | "club"
      | "retro"
      | "special"
      | "vintage"
      | "nation"
      | "national",
    league: "La Liga",
    imageSrc: "/images/barca-jersey.svg",
    edition: "HERITAGE VAULT EDITION",
    sizesAvailable: ["S", "M", "L", "XL"] as ("S" | "M" | "L" | "XL" | "XXL")[],
    showOnLanding: false,
    landingOrder: 4,
    showInShop: true,
    featured: false,
    description: "",
  });

  // 3D Test Stage Parallax inside Publisher/Editor Modal
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Toggle Switches State (Collector)
  const [switches, setSwitches] = useState({
    authAlerts: true,
    restock: true,
    reserve: false,
    codPay: true,
  });

  // Collector Profile & Settings State
  const [profileName, setProfileName] = useState(user?.name || "Collector");
  const [profileEmail] = useState(user?.email || "collector@thejerseyhub.com");
  const [profilePhone, setProfilePhone] = useState(
    user?.phone || "+977 9800000000",
  );
  const [preferredSize, setPreferredSize] = useState<
    "S" | "M" | "L" | "XL" | "XXL"
  >("L");
  const [favoriteClub, setFavoriteClub] = useState("FC Barcelona");
  const [shippingAddress, setShippingAddress] = useState({
    street: "Street 04, Heritage Avenue",
    city: "Kathmandu",
    postalCode: "44600",
    country: "Nepal",
    instructions: "Call upon arrival / Deliver at gate.",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Store & System Settings (Admin)
  const [storeSettings, setStoreSettings] = useState({
    currency: "NPR (Rs.)",
    shippingRate: "FREE (Inside Valley) / Rs. 150 (Outside)",
    announcement:
      "[LIVE] 2026 RETRO ARCHIVE DROP LIVE NOW // FREE COD ON ALL KITS",
    nextDropDate: "2026-08-26",
    maintenanceMode: false,
  });

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const displayName = user?.name ? user.name.toUpperCase() : "COLLECTOR";

  // Refresh real catalog products from MongoDB
  const refreshAdminJerseys = async () => {
    const data = await productService.getAllAdminJerseys();
    if (data && data.length > 0) {
      setAdminJerseys(data);
    }
  };

  // Refresh real orders from MongoDB
  const refreshOrders = async () => {
    setLoadingOrders(true);
    if (isAdmin) {
      const data = await orderService.getAllOrders();
      setOrders(data || []);
    } else {
      const data = await orderService.getMyOrders();
      setOrders(data || []);
    }
    setLoadingOrders(false);
  };

  // Refresh real registered users from MongoDB (Admin)
  const refreshUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    const data = await userService.getAllUsers();
    setUsersList(data || []);
    setLoadingUsers(false);
  };

  useEffect(() => {
    let isSubscribed = true;
    productService.getAllAdminJerseys().then((data) => {
      if (isSubscribed && data && data.length > 0) {
        setAdminJerseys(data);
      }
    });

    if (isAdmin) {
      orderService.getAllOrders().then((data) => {
        if (isSubscribed) setOrders(data || []);
      });
      userService.getAllUsers().then((data) => {
        if (isSubscribed) setUsersList(data || []);
      });
    } else {
      orderService.getMyOrders().then((data) => {
        if (isSubscribed) setOrders(data || []);
      });
    }

    return () => {
      isSubscribed = false;
    };
  }, [isAdmin]);

  const handleToggle = (key: keyof typeof switches) => {
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.info(`Setting updated: ${key.toUpperCase()}`);
  };

  // Update order status in MongoDB
  const handleUpdateOrderStatus = async (
    orderId: string,
    statusUpdate: {
      orderStatus?: DBOrder["orderStatus"];
      paymentStatus?: DBOrder["paymentStatus"];
    },
  ) => {
    const res = await orderService.updateOrderStatus(orderId, statusUpdate);
    if (res.success) {
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === orderId || ord.id === orderId
            ? { ...ord, ...statusUpdate }
            : ord,
        ),
      );
      toast.success(`Order ${orderId.slice(-6).toUpperCase()} status updated`);
    } else {
      toast.error(res.message || "Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const res = await orderService.deleteOrder(orderId);
    if (res.success) {
      setOrders((prev) =>
        prev.filter((ord) => (ord._id || ord.id) !== orderId),
      );
      toast.success(`Order ${orderId.slice(-6).toUpperCase()} deleted`);
    } else {
      toast.error(res.message || "Failed to delete order");
    }
  };

  // Collector Save Settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: profileName, phone: profilePhone });
    toast.success("Profile credentials and preferences updated successfully!");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("New passwords do not match. Please verify.");
      return;
    }
    toast.success("Security token and password updated securely!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Admin Quick Toggles (MongoDB Atlas sync)
  const handlePlacementToggle = async (
    kitId: string,
    field: "showOnLanding" | "showInShop" | "featured",
    currentVal: boolean,
  ) => {
    const newVal = !currentVal;
    setAdminJerseys((prev) =>
      prev.map((k) =>
        k._id === kitId || k.id === kitId || k.code === kitId
          ? { ...k, [field]: newVal }
          : k,
      ),
    );

    const res = await productService.updatePlacement(kitId, {
      [field]: newVal,
    });
    if (res.success) {
      toast.success(
        `${field.toUpperCase()} synced to MongoDB: ${newVal ? "ON" : "OFF"}`,
      );
    } else {
      toast.error(res.message || "Failed to update placement");
    }
  };

  const handleOrderChange = async (kitId: string, newOrder: number) => {
    setAdminJerseys((prev) =>
      prev.map((k) =>
        k._id === kitId || k.id === kitId || k.code === kitId
          ? { ...k, landingOrder: newOrder }
          : k,
      ),
    );
    await productService.updatePlacement(kitId, { landingOrder: newOrder });
    toast.info(`Orbital slot set to Slot ${newOrder + 1}`);
  };

  // Admin: Open Edit Modal for a Kit
  const handleStartEdit = (kit: DBJersey) => {
    setEditingJersey(kit);
    setKitForm({
      code: kit.code,
      name: kit.name,
      club: kit.club,
      season: kit.season,
      price: kit.price,
      stock: kit.stock || 25,
      category: kit.category,
      league: kit.league,
      imageSrc: kit.imageSrc,
      edition: kit.edition || "HERITAGE VAULT EDITION",
      sizesAvailable: kit.sizesAvailable || ["S", "M", "L", "XL"],
      showOnLanding: kit.showOnLanding,
      landingOrder: kit.landingOrder,
      showInShop: kit.showInShop,
      featured: kit.featured,
      description: kit.description || "",
    });
    setImageInputMode("url");
    setIsPublisherOpen(true);
  };

  // Admin: Open Custom Deletion Modal
  const handleDeleteClick = (kit: DBJersey) => {
    setDeleteModalKit(kit);
  };

  // Admin: Confirm deletion execution in MongoDB Atlas
  const handleConfirmDelete = async () => {
    if (!deleteModalKit) return;
    setIsDeleting(true);
    const kitKey =
      deleteModalKit._id || deleteModalKit.id || deleteModalKit.code;
    const kitCode = deleteModalKit.code;
    const res = await productService.deleteJersey(kitKey);
    setIsDeleting(false);

    if (res.success) {
      setAdminJerseys((prev) =>
        prev.filter((k) => (k._id || k.id || k.code) !== kitKey),
      );
      setDeleteModalKit(null);
      toast.success(`[${kitCode}] erased permanently from MongoDB Atlas`);
    } else {
      toast.error(res.message || "Failed to remove item");
    }
  };

  // Admin: Save Add or Edit Kit
  const handleSaveKitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitForm.code || !kitForm.name || !kitForm.club) {
      toast.error("Please fill in Code, Name, and Club");
      return;
    }

    if (editingJersey) {
      const kitKey =
        editingJersey._id || editingJersey.id || editingJersey.code;
      const res = await productService.updateJersey(kitKey, kitForm);
      if (res.success) {
        toast.success(
          `[${kitForm.code}] updated successfully in MongoDB Atlas!`,
        );
        setIsPublisherOpen(false);
        setEditingJersey(null);
        refreshAdminJerseys();
      } else {
        toast.error(res.message || "Failed to save changes");
      }
    } else {
      const res = await productService.createJersey(kitForm);
      if (res.success) {
        toast.success(`🎉 [${kitForm.code}] published to MongoDB Atlas!`);
        setIsPublisherOpen(false);
        refreshAdminJerseys();
      } else {
        toast.error(res.message || "Failed to publish kit");
      }
    }
  };

  // File Upload Handler (processes image and strips background cleanly)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (!result) return;

      setIsRemovingBg(true);
      const bgRes = await productService.removeBackground(result);
      setIsRemovingBg(false);

      if (bgRes.success && bgRes.data?.image) {
        setKitForm((prev) => ({ ...prev, imageSrc: bgRes.data!.image }));
        toast.success("Jersey image loaded to 3D stage");
      } else {
        setKitForm((prev) => ({ ...prev, imageSrc: result }));
        toast.info("Jersey image loaded to 3D stage");
      }
    };
    reader.readAsDataURL(file);
  };

  // Web URL Cutout Handler (fetches and isolates jersey from URL)
  const handleWebUrlCutout = async (urlToProcess?: string) => {
    const targetUrl = (urlToProcess || kitForm.imageSrc || "").trim();
    if (
      !targetUrl ||
      (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://"))
    ) {
      return;
    }

    setIsRemovingBg(true);
    const bgRes = await productService.removeBackground(targetUrl);
    setIsRemovingBg(false);

    if (bgRes.success && bgRes.data?.image) {
      setKitForm((prev) => ({ ...prev, imageSrc: bgRes.data!.image }));
      toast.success("Jersey isolated from Web URL successfully!");
    } else {
      setKitForm((prev) => ({ ...prev, imageSrc: targetUrl }));
      toast.info("Image loaded from URL");
    }
  };

  // 3D Test Stage Hover Physics
  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rY = x * 30;
    const rX = y * -20;
    const sX = x * -35;
    const sY = 30 + y * -20;

    previewRef.current.style.transform = `perspective(800px) rotateY(${rY}deg) rotateX(${rX}deg) scale(1.05)`;
    previewRef.current.style.filter = `drop-shadow(${sX}px ${sY}px 30px rgba(255,85,0,0.4)) brightness(1.05)`;
  };

  const handlePreviewMouseLeave = () => {
    if (!previewRef.current) return;
    previewRef.current.style.transform =
      "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    previewRef.current.style.filter =
      "drop-shadow(0 15px 25px rgba(0,0,0,0.3))";
  };

  // Filtered jerseys for admin search
  const displayedAdminJerseys = adminJerseys.filter((k) => {
    if (!catalogSearch) return true;
    const q = catalogSearch.toLowerCase();
    return (
      k.name.toLowerCase().includes(q) ||
      k.club.toLowerCase().includes(q) ||
      k.code.toLowerCase().includes(q) ||
      k.season.toLowerCase().includes(q)
    );
  });

  // Filtered users for admin user directory search
  const displayedUsers = usersList.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q))
    );
  });

  const landingKitsCount = adminJerseys.filter((k) => k.showOnLanding).length;
  const shopKitsCount = adminJerseys.filter((k) => k.showInShop).length;

  return (
    <main
      className={`min-h-screen w-full transition-colors duration-500 pb-20 md:pb-8 ${
        isWhite
          ? "theme-white bg-[#faf7f0] text-[#0c0c0c]"
          : "theme-black bg-[#060606] text-white"
      }`}
    >
      {/* Tactile Film Grain */}
      <div className="film-grain" style={{ opacity: isWhite ? 0.28 : 0.18 }} />

      {/* ── Top Status Header ──────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 w-full h-11 backdrop-blur-md border-b px-3 sm:px-8 flex items-center justify-between font-mono text-[8.5px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.16em] uppercase select-none transition-colors ${
          isWhite
            ? "bg-[#faf7f0]/95 border-black/10 text-black"
            : "bg-[#070707]/95 border-white/10 text-white"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Link href="/" className="font-bold text-[#ff5500] hover:underline">
            [THEJERSEYHUB]
          </Link>
          <span className="opacity-30">•</span>
          {isAdmin ? (
            <span className="flex items-center gap-1.5 text-[#ff5500] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
              ROOT ADMIN ENGINE // ATLAS SYNC
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              COLLECTOR VAULT ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/shop"
            className="text-[#ff5500] font-bold hover:underline flex items-center gap-1"
          >
            <span>SHOP</span>
            <span>→</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="hover:text-[#ff5500] transition-colors cursor-pointer"
          >
            [{isWhite ? "CHALK" : "NOIR"}]
          </button>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-red-500 font-bold hover:underline cursor-pointer"
          >
            [EXIT]
          </button>
        </div>
      </header>

      {/* ── Main Dashboard Layout ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-8 py-5 sm:py-8 flex gap-6 sm:gap-8 items-start">
        {/* Left Vertical Icon Dock (Desktop / Tablet) */}
        <aside
          className={`hidden md:flex w-14 sm:w-16 rounded-3xl p-3 sm:p-4 border flex-col items-center justify-between shrink-0 h-[700px] sticky top-16 z-30 self-start transition-all ${
            isWhite
              ? "bg-white/80 border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
              : "bg-[#101014] border-white/10 shadow-2xl"
          }`}
        >
          {/* User Initial Avatar Badge */}
          <div
            className={`w-9 h-9 rounded-2xl font-mono font-bold text-xs flex items-center justify-center shadow-md ${
              isAdmin
                ? "bg-[#ff5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.5)] ring-2 ring-[#ff5500]/30"
                : "bg-[#ff5500] text-white"
            }`}
          >
            {isAdmin ? "ADM" : displayName[0] || "C"}
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col gap-4 text-sm">
            <Link
              href="/shop"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#ff5500]/10 text-[#ff5500] hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer shadow-sm"
              title="Shop Marketplace"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </Link>

            <span className="w-4 h-[1px] bg-black/10 dark:bg-white/10 mx-auto" />

            {/* Admin Icons */}
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab("admin_products");
                    setAdminCollectorPreview(false);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "admin_products" && !adminCollectorPreview
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="3D Placement & Catalog"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("admin_inventory");
                    setAdminCollectorPreview(false);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "admin_inventory" && !adminCollectorPreview
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="Inventory & Stock"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("admin_orders");
                    setAdminCollectorPreview(false);
                    refreshOrders();
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "admin_orders" && !adminCollectorPreview
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="Dispatch & Orders"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("admin_users");
                    setAdminCollectorPreview(false);
                    refreshUsers();
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "admin_users" && !adminCollectorPreview
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="Collectors Directory"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("admin_settings");
                    setAdminCollectorPreview(false);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "admin_settings" && !adminCollectorPreview
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="Store Settings"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </>
            ) : (
              /* Collector User Icons */
              <>
                <button
                  onClick={() => setActiveTab("vault")}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "vault"
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="Collector Vault"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("orders");
                    refreshOrders();
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="Order Archive"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </button>

                <button
                  onClick={openCart}
                  className="w-9 h-9 rounded-xl flex items-center justify-center opacity-40 hover:opacity-100 transition-all cursor-pointer"
                  title="Shopping Bag"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-[#ff5500] text-white shadow-sm"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  title="Collector Profile & Settings"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setContactModalOpen(true)}
            className="w-8 h-8 rounded-xl opacity-40 hover:opacity-100 flex items-center justify-center text-xs font-mono"
            title="Contact Support"
          >
            ?
          </button>
        </aside>

        {/* ── Main Content Area ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          {/* ========================================================= */}
          {/* ── ADMIN VIEW: ROOT COMMAND DECK ───────────────────────── */}
          {/* ========================================================= */}
          {isAdmin && !adminCollectorPreview ? (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
              {/* Admin Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-black/10 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#ff5500] text-white font-mono text-[9px] font-bold tracking-widest uppercase">
                      ROOT ADMIN
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] font-mono opacity-50 uppercase truncate">
                      MONGODB ATLAS LIVE CATALOG
                    </span>
                  </div>
                  <h1 className="font-mono text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    Admin Command Deck // {displayName}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    onClick={() => {
                      setEditingJersey(null);
                      setKitForm({
                        code: "",
                        name: "",
                        club: "",
                        season: "24/25 MATCH SPEC",
                        price: "$135.00",
                        stock: 25,
                        category: "club",
                        league: "La Liga",
                        imageSrc: "/images/barca-jersey.svg",
                        edition: "HERITAGE VAULT EDITION",
                        sizesAvailable: ["S", "M", "L", "XL"],
                        showOnLanding: false,
                        landingOrder: adminJerseys.length,
                        showInShop: true,
                        featured: false,
                        description: "",
                      });
                      setIsPublisherOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>+ Publish New Kit</span>
                  </button>
                  <button
                    onClick={() => setAdminCollectorPreview(true)}
                    className="px-3 py-2 rounded-xl font-mono text-[11px] border border-[#ff5500]/40 text-[#ff5500] hover:bg-[#ff5500]/10 transition-colors cursor-pointer"
                  >
                    [PREVIEW COLLECTOR VAULT]
                  </button>
                </div>
              </div>

              {/* 4-Card Placement Matrix */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border font-mono transition-all ${
                    isWhite
                      ? "bg-white/80 border-black/10 shadow-sm"
                      : "bg-[#121216] border-white/10"
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] opacity-50 uppercase block truncate">
                    3D LANDING ORBIT
                  </span>
                  <p className="text-base sm:text-xl font-bold text-[#ff5500] mt-0.5 sm:mt-1 truncate">
                    {landingKitsCount} ACTIVE KITS
                  </p>
                  <span className="text-[9px] text-emerald-500 block">
                    Rendering on Home
                  </span>
                </div>

                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border font-mono transition-all ${
                    isWhite
                      ? "bg-white/80 border-black/10 shadow-sm"
                      : "bg-[#121216] border-white/10"
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] opacity-50 uppercase block truncate">
                    SHOP MARKETPLACE
                  </span>
                  <p className="text-base sm:text-xl font-bold text-[#ff5500] mt-0.5 sm:mt-1 truncate">
                    {shopKitsCount} ARCHIVED
                  </p>
                  <span className="text-[9px] text-emerald-500 block">
                    Available in /shop
                  </span>
                </div>

                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border font-mono transition-all ${
                    isWhite
                      ? "bg-white/80 border-black/10 shadow-sm"
                      : "bg-[#121216] border-white/10"
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] opacity-50 uppercase block truncate">
                    TOTAL CATALOG
                  </span>
                  <p className="text-base sm:text-xl font-bold text-[#ff5500] mt-0.5 sm:mt-1 truncate">
                    {adminJerseys.length} EDITIONS
                  </p>
                  <span className="text-[9px] text-blue-500 block">
                    MongoDB Atlas
                  </span>
                </div>

                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border font-mono transition-all ${
                    isWhite
                      ? "bg-white/80 border-black/10 shadow-sm"
                      : "bg-[#121216] border-white/10"
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] opacity-50 uppercase block truncate">
                    VERCEL PRODUCTION
                  </span>
                  <p className="text-base sm:text-xl font-bold text-emerald-500 mt-0.5 sm:mt-1 truncate">
                    CONNECTED
                  </p>
                  <span className="text-[9px] opacity-60 block">
                    Isomorphic Fallback
                  </span>
                </div>
              </div>

              {/* Admin Navigation Pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b pb-3 border-black/10 dark:border-white/10 font-mono text-[10.5px] sm:text-xs">
                {[
                  {
                    id: "admin_products" as const,
                    label: "3D ORBIT & PLACEMENT",
                  },
                  {
                    id: "admin_inventory" as const,
                    label: "INVENTORY & STOCK",
                  },
                  {
                    id: "admin_orders" as const,
                    label: `CUSTOMER DISPATCH (${orders.length})`,
                  },
                  {
                    id: "admin_users" as const,
                    label: `COLLECTOR DIRECTORY (${usersList.length})`,
                  },
                  { id: "admin_settings" as const, label: "STORE SETTINGS" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === "admin_orders") refreshOrders();
                      if (tab.id === "admin_users") refreshUsers();
                    }}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer border min-h-[38px] ${
                      activeTab === tab.id
                        ? "bg-[#ff5500] text-white border-[#ff5500] font-bold shadow-sm"
                        : isWhite
                          ? "bg-black/5 hover:bg-black/10 border-transparent text-black/75"
                          : "bg-white/5 hover:bg-white/10 border-transparent text-white/75"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Admin Tab 1: 3D Placement & Catalog Manager */}
              {activeTab === "admin_products" && (
                <section
                  className={`p-4 sm:p-6 rounded-3xl border space-y-4 ${
                    isWhite
                      ? "bg-white border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-black/10 dark:border-white/10 font-mono text-xs">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">
                        [CATALOG VISIBILITY & 3D PLACEMENT ENGINE]
                      </h3>
                      <p className="text-[11px] opacity-60 mt-0.5">
                        Add, edit, remove, and toggle live rendering on the 3D
                        Landing Page Carousel and Shop Archive.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Search items..."
                        className={`h-9 px-3 rounded-xl border text-xs outline-none ${
                          isWhite
                            ? "bg-[#faf7f0] border-black/15"
                            : "bg-[#18181e] border-white/15 text-white"
                        }`}
                      />
                      <button
                        onClick={() => {
                          setEditingJersey(null);
                          setIsPublisherOpen(true);
                        }}
                        className="px-3.5 py-2 bg-[#ff5500] text-white font-bold rounded-xl text-xs uppercase cursor-pointer shrink-0"
                      >
                        + Add Kit
                      </button>
                    </div>
                  </div>

                  {displayedAdminJerseys.length === 0 ? (
                    <EmptyState
                      title="No Kit Editions Match Search"
                      description="Try clearing your search query or publish a new kit directly into MongoDB Atlas."
                      actionLabel="+ Publish New Kit"
                      onAction={() => {
                        setEditingJersey(null);
                        setIsPublisherOpen(true);
                      }}
                      secondaryLabel="Clear Search"
                      onSecondaryAction={() => setCatalogSearch("")}
                    />
                  ) : (
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full text-left font-mono text-xs min-w-[780px]">
                        <thead>
                          <tr className="border-b text-[10px] opacity-50 uppercase border-black/10 dark:border-white/10">
                            <th className="pb-3 px-2">IMAGE / CODE</th>
                            <th className="pb-3 px-2">EDITION SPEC</th>
                            <th className="pb-3 px-2">PRICE</th>
                            <th className="pb-3 px-2 text-center">
                              3D LANDING
                            </th>
                            <th className="pb-3 px-2 text-center">
                              ORBIT ORDER
                            </th>
                            <th className="pb-3 px-2 text-center">
                              SHOP ARCHIVE
                            </th>
                            <th className="pb-3 px-2 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {displayedAdminJerseys.map((kit) => {
                            const kitId = kit._id || kit.id || kit.code;
                            return (
                              <tr
                                key={kitId}
                                className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              >
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="relative w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center p-1">
                                      <Image
                                        src={getSafeImageSrc(kit.imageSrc)}
                                        alt={kit.name}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                    <span className="font-bold text-[#ff5500]">
                                      {kit.code}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <p className="font-bold truncate max-w-[200px]">
                                    {kit.name}
                                  </p>
                                  <p className="text-[10px] opacity-50">
                                    {kit.club} • {kit.category.toUpperCase()}
                                  </p>
                                </td>
                                <td className="py-3 px-2 font-bold">
                                  {kit.price}
                                </td>

                                {/* 3D Landing Carousel Toggle */}
                                <td className="py-3 px-2 text-center">
                                  <button
                                    onClick={() =>
                                      handlePlacementToggle(
                                        kitId,
                                        "showOnLanding",
                                        kit.showOnLanding,
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                                      kit.showOnLanding
                                        ? "bg-[#ff5500] text-white border-[#ff5500] shadow-sm"
                                        : isWhite
                                          ? "bg-black/5 hover:bg-black/10 border-black/10 text-black/40"
                                          : "bg-white/5 hover:bg-white/10 border-white/10 text-white/40"
                                    }`}
                                  >
                                    {kit.showOnLanding ? "[3D ACTIVE]" : "OFF"}
                                  </button>
                                </td>

                                {/* Orbit Position Reorder */}
                                <td className="py-3 px-2 text-center">
                                  <select
                                    disabled={!kit.showOnLanding}
                                    value={kit.landingOrder}
                                    onChange={(e) =>
                                      handleOrderChange(
                                        kitId,
                                        Number(e.target.value),
                                      )
                                    }
                                    className={`py-1 px-2 rounded-lg text-xs font-mono border outline-none disabled:opacity-30 cursor-pointer ${
                                      isWhite
                                        ? "bg-[#faf7f0] border-black/15"
                                        : "bg-[#16161a] border-white/15"
                                    }`}
                                  >
                                    {Array.from(
                                      {
                                        length: Math.max(
                                          adminJerseys.length,
                                          12,
                                        ),
                                      },
                                      (_, i) => (
                                        <option key={i} value={i}>
                                          Slot {i + 1}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                </td>

                                {/* Shop Archive Toggle */}
                                <td className="py-3 px-2 text-center">
                                  <button
                                    onClick={() =>
                                      handlePlacementToggle(
                                        kitId,
                                        "showInShop",
                                        kit.showInShop,
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                                      kit.showInShop
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                        : isWhite
                                          ? "bg-black/5 hover:bg-black/10 border-black/10 text-black/40"
                                          : "bg-white/5 hover:bg-white/10 border-white/10 text-white/40"
                                    }`}
                                  >
                                    {kit.showInShop ? "LIVE" : "HIDDEN"}
                                  </button>
                                </td>

                                {/* Edit & Delete Actions */}
                                <td className="py-3 px-2 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleStartEdit(kit)}
                                      className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer font-bold text-[10px]"
                                      title="Edit Kit Details"
                                    >
                                      [EDIT]
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClick(kit)}
                                      className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer font-bold text-[10px]"
                                      title="Delete from MongoDB"
                                    >
                                      [DEL]
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* Admin Tab 2: Inventory & Stock Management */}
              {activeTab === "admin_inventory" && (
                <section
                  className={`p-4 sm:p-6 rounded-3xl border space-y-4 ${
                    isWhite
                      ? "bg-white border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-4 border-black/10 dark:border-white/10 font-mono text-xs">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">
                        [INVENTORY ALLOCATION & SIZES]
                      </h3>
                      <p className="text-[11px] opacity-60 mt-0.5">
                        Real-time stock units and size matrix across catalog.
                      </p>
                    </div>
                    <span className="text-[#ff5500] font-bold">
                      {adminJerseys.length} TOTAL ITEMS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {adminJerseys.map((kit) => (
                      <div
                        key={kit.code}
                        className={`p-4 rounded-2xl border font-mono text-xs space-y-2.5 ${
                          isWhite
                            ? "bg-[#faf7f0] border-black/10"
                            : "bg-[#141418] border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-[#ff5500]/10 text-[#ff5500] font-bold text-[9.5px]">
                            {kit.code}
                          </span>
                          <span
                            className={`font-bold ${kit.stock && kit.stock < 10 ? "text-amber-500" : "text-emerald-500"}`}
                          >
                            {kit.stock || 25} UNITS IN STOCK
                          </span>
                        </div>

                        <p className="font-bold truncate">{kit.name}</p>

                        <div className="flex items-center gap-1 text-[10px] opacity-70">
                          <span>SIZES:</span>
                          {(kit.sizesAvailable || ["S", "M", "L", "XL"]).map(
                            (sz) => (
                              <span
                                key={sz}
                                className="px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 font-bold"
                              >
                                {sz}
                              </span>
                            ),
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                          <span className="font-bold text-[#ff5500]">
                            {kit.price}
                          </span>
                          <button
                            onClick={() => handleStartEdit(kit)}
                            className="text-[#ff5500] hover:underline font-bold text-[10.5px] cursor-pointer"
                          >
                            Update Stock →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Admin Tab 3: Customer Orders (Real MongoDB Orders) */}
              {activeTab === "admin_orders" && (
                <section
                  className={`p-4 sm:p-6 rounded-3xl border space-y-4 ${
                    isWhite
                      ? "bg-white border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs border-b pb-3 border-black/10 dark:border-white/10">
                    <span className="font-bold tracking-wider">
                      [CUSTOMER DISPATCH & FULFILLMENT]
                    </span>
                    <span className="opacity-50">
                      {orders.length} ACTIVE ORDERS
                    </span>
                  </div>

                  {loadingOrders ? (
                    <div className="py-12 text-center font-mono text-xs opacity-60">
                      Querying live dispatch orders from MongoDB Atlas...
                    </div>
                  ) : orders.length === 0 ? (
                    <EmptyState
                      title="No Customer Orders Yet"
                      description="When collectors place orders in the shop or through express cash-on-delivery checkout, they will appear here live with dispatch controls."
                      actionLabel="Explore Marketplace"
                      actionHref="/shop"
                      secondaryLabel="Refresh Orders"
                      onSecondaryAction={refreshOrders}
                    />
                  ) : (
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full text-left font-mono text-xs min-w-[540px]">
                        <thead>
                          <tr className="border-b text-[10px] opacity-50 uppercase border-black/10 dark:border-white/10">
                            <th className="pb-3 px-2">ORDER ID</th>
                            <th className="pb-3 px-2">COLLECTOR</th>
                            <th className="pb-3 px-2">SPECIFICATION</th>
                            <th className="pb-3 px-2">TOTAL</th>
                            <th className="pb-3 px-2 text-right">
                              FULFILLMENT
                            </th>
                            <th className="pb-3 px-2 text-right">PAYMENT</th>
                            <th className="pb-3 px-2 text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {orders.map((order) => {
                            const orderId = order._id || order.id || "ORD";
                            const customerObj =
                              typeof order.user === "object"
                                ? order.user
                                : null;
                            const customerName =
                              customerObj?.name ||
                              order.shippingAddress?.fullName ||
                              "Collector";
                            const customerEmail =
                              customerObj?.email || "verified@user";
                            const itemSpec = order.items?.[0]
                              ? `${order.items[0].name} (${order.items[0].size})`
                              : "Match Spec Kit";

                            return (
                              <tr
                                key={orderId}
                                className="hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                <td className="py-3 px-2 font-bold text-[#ff5500]">
                                  #{orderId.slice(-6).toUpperCase()}
                                </td>
                                <td className="py-3 px-2">
                                  <p className="font-bold">{customerName}</p>
                                  <p className="text-[9.5px] opacity-50 truncate max-w-[140px]">
                                    {customerEmail}
                                  </p>
                                </td>
                                <td className="py-3 px-2 text-[11px] truncate max-w-[180px]">
                                  {itemSpec}
                                </td>
                                <td className="py-3 px-2 font-bold">
                                  ${order.totalAmount}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <select
                                    value={order.orderStatus}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(orderId, {
                                        orderStatus: e.target
                                          .value as DBOrder["orderStatus"],
                                      })
                                    }
                                    className={`py-1 px-2 rounded-lg text-[11px] font-mono border outline-none cursor-pointer ${
                                      order.orderStatus === "delivered"
                                        ? "text-emerald-500 border-emerald-500/30"
                                        : order.orderStatus === "shipped"
                                          ? "text-blue-500 border-blue-500/30"
                                          : "text-[#ff5500] border-[#ff5500]/30"
                                    } ${isWhite ? "bg-[#faf7f0]" : "bg-[#16161a]"}`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">
                                      Processing
                                    </option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <select
                                    value={order.paymentStatus}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(orderId, {
                                        paymentStatus: e.target
                                          .value as DBOrder["paymentStatus"],
                                      })
                                    }
                                    className={`py-1 px-2 rounded-lg text-[11px] font-mono border outline-none cursor-pointer ${
                                      order.paymentStatus === "paid"
                                        ? "text-emerald-500 border-emerald-500/30"
                                        : order.paymentStatus === "failed"
                                          ? "text-red-500 border-red-500/30"
                                          : "text-[#ff5500] border-[#ff5500]/30"
                                    } ${isWhite ? "bg-[#faf7f0]" : "bg-[#16161a]"}`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                  </select>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(orderId)}
                                    className="text-red-500 hover:underline font-bold text-[10.5px] cursor-pointer"
                                  >
                                    DELETE
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* Admin Tab 4: Collectors Directory (Real MongoDB Users) */}
              {activeTab === "admin_users" && (
                <section
                  className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                    isWhite
                      ? "bg-white border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-black/10 dark:border-white/10 font-mono text-xs">
                    <div>
                      <span className="font-bold">
                        [COLLECTORS DIRECTORY & PERMISSIONS]
                      </span>
                      <p className="text-[10px] opacity-60 mt-0.5">
                        {usersList.length} REGISTERED DATABASE ACCOUNTS
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Filter Pills */}
                      <div className="flex rounded-xl border p-0.5 border-black/10 dark:border-white/10 text-[10px]">
                        {(["all", "active", "blocked"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setUserStatusFilter(st)}
                            className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all cursor-pointer ${
                              userStatusFilter === st
                                ? "bg-[#ff5500] text-white"
                                : "opacity-60 hover:opacity-100"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search collector..."
                        className={`h-9 px-3 rounded-xl border text-xs outline-none ${
                          isWhite
                            ? "bg-[#faf7f0] border-black/15"
                            : "bg-[#18181e] border-white/15 text-white"
                        }`}
                      />

                      <button
                        onClick={() => {
                          setNewUserForm({
                            name: "",
                            email: "",
                            password: "",
                            phone: "",
                          });
                          setIsCreateUserOpen(true);
                        }}
                        className="px-3.5 py-2 bg-[#ff5500] text-white font-bold rounded-xl text-xs uppercase cursor-pointer shrink-0 shadow-sm"
                      >
                        + Create Collector
                      </button>

                      <button
                        onClick={refreshUsers}
                        className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-[10px] font-bold cursor-pointer hover:bg-black/5"
                        title="Refresh Directory"
                      >
                        ↻
                      </button>
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="py-12 text-center font-mono text-xs opacity-60">
                      Querying live registered user directory from MongoDB
                      Atlas...
                    </div>
                  ) : displayedUsers.filter((u) =>
                      userStatusFilter === "all"
                        ? true
                        : userStatusFilter === "blocked"
                          ? u.isBlocked
                          : !u.isBlocked,
                    ).length === 0 ? (
                    <EmptyState
                      title="No Collectors Found"
                      description="No registered user accounts match the current filter query in MongoDB Atlas."
                      actionLabel="+ Create Collector"
                      onAction={() => {
                        setNewUserForm({
                          name: "",
                          email: "",
                          password: "",
                          phone: "",
                        });
                        setIsCreateUserOpen(true);
                      }}
                      secondaryLabel="Clear Search"
                      onSecondaryAction={() => {
                        setUserSearch("");
                        setUserStatusFilter("all");
                      }}
                    />
                  ) : (
                    <div className="space-y-2.5 font-mono text-xs">
                      {displayedUsers
                        .filter((u) =>
                          userStatusFilter === "all"
                            ? true
                            : userStatusFilter === "blocked"
                              ? u.isBlocked
                              : !u.isBlocked,
                        )
                        .map((col) => {
                          const userId = col._id || col.id || "";
                          return (
                            <div
                              key={userId || col.email}
                              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                col.isBlocked
                                  ? "border-red-500/30 bg-red-500/5"
                                  : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold truncate">
                                    {col.name}
                                  </p>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      col.role === "admin"
                                        ? "bg-[#ff5500] text-white"
                                        : "bg-black/10 dark:bg-white/10"
                                    }`}
                                  >
                                    {col.role}
                                  </span>
                                  {col.isBlocked && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500 text-white animate-pulse">
                                      BLOCKED{" "}
                                      {col.blockedUntil
                                        ? `UNTIL ${new Date(col.blockedUntil).toLocaleDateString()}`
                                        : "PERMANENT"}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] opacity-50 truncate mt-0.5">
                                  {col.email} • Phone: {col.phone || "N/A"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingUser(col);
                                    setEditUserForm({
                                      name: col.name,
                                      phone: col.phone || "",
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 text-[10px] cursor-pointer hover:bg-black/5 font-bold"
                                  title="Edit Name and Phone"
                                >
                                  [EDIT]
                                </button>

                                <button
                                  onClick={() => {
                                    setBlockingUser(col);
                                    setBlockDurationDays(col.isBlocked ? 0 : 7);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                    col.isBlocked
                                      ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                                      : "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                                  }`}
                                  title="Configure Timed Block"
                                >
                                  [
                                  {col.isBlocked
                                    ? "UNBLOCK / MANAGE"
                                    : "BLOCK ACCOUNT"}
                                  ]
                                </button>

                                <button
                                  onClick={() => setDeleteModalUser(col)}
                                  className="px-2.5 py-1 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
                                  title="Delete User and Cascade Records"
                                >
                                  [DEL]
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </section>
              )}

              {/* Admin Tab 5: Store & System Settings */}
              {activeTab === "admin_settings" && (
                <section
                  className={`p-5 sm:p-8 rounded-3xl border space-y-6 ${
                    isWhite
                      ? "bg-white border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="border-b pb-4 border-black/10 dark:border-white/10">
                    <h3 className="font-mono text-sm sm:text-base font-bold">
                      [STORE ENGINE CONFIGURATION]
                    </h3>
                    <p className="text-xs opacity-60 mt-0.5">
                      Configure store parameters, global announcements, and
                      dispatch rules.
                    </p>
                  </div>

                  <div className="space-y-4 max-w-xl font-mono text-xs">
                    <div>
                      <label className="block text-[10px] uppercase opacity-60 mb-1">
                        Global Announcement Banner
                      </label>
                      <input
                        type="text"
                        value={storeSettings.announcement}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            announcement: e.target.value,
                          })
                        }
                        className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                          isWhite
                            ? "bg-[#faf7f0] border-black/10"
                            : "bg-[#16161a] border-white/10"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">
                          Currency Code
                        </label>
                        <input
                          type="text"
                          value={storeSettings.currency}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              currency: e.target.value,
                            })
                          }
                          className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                            isWhite
                              ? "bg-[#faf7f0] border-black/10"
                              : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">
                          Shipping Policy
                        </label>
                        <input
                          type="text"
                          value={storeSettings.shippingRate}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              shippingRate: e.target.value,
                            })
                          }
                          className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                            isWhite
                              ? "bg-[#faf7f0] border-black/10"
                              : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toast.success(
                          "Store engine parameters saved successfully!",
                        );
                      }}
                      className="px-6 py-3 bg-[#ff5500] text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
                    >
                      Save Store Settings
                    </button>
                  </div>
                </section>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* ── COLLECTOR VIEW: PERSONAL VAULT & SETTINGS ───────────── */
            /* ========================================================= */
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
              {/* Collector Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b pb-4 border-black/10 dark:border-white/10">
                <div>
                  <h1 className="font-mono text-lg sm:text-xl lg:text-2xl font-bold tracking-[0.12em] sm:tracking-[0.14em]">
                    VAULT // {displayName}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-mono opacity-50 mt-0.5 truncate">
                    COLLECTOR ID:{" "}
                    {user?.id?.slice(-8).toUpperCase() || "TJH-COL-8902"} •
                    VERIFIED MEMBER
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveTab("vault")}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "vault"
                        ? "bg-[#ff5500] text-white"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    Vault Deck
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "settings"
                        ? "bg-[#ff5500] text-white"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    Profile & Settings
                  </button>
                </div>
              </div>

              {/* Collector View: Tab 1 (Vault Deck) */}
              {activeTab === "vault" && (
                <div className="space-y-6 sm:space-y-8">
                  {/* Top 3-Column Intelligence Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Column 1: Switches */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                            isWhite
                              ? "bg-white/80 border-black/10"
                              : "bg-[#121216] border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[8.5px] sm:text-[9px] text-[#ff5500] font-bold uppercase">
                              {switches.authAlerts ? "ON" : "OFF"}
                            </span>
                            <button
                              onClick={() => handleToggle("authAlerts")}
                              className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                                switches.authAlerts
                                  ? "bg-[#ff5500]"
                                  : "bg-black/20 dark:bg-white/20"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                  switches.authAlerts
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                          <p className="font-mono text-[9.5px] sm:text-[10px] font-bold">
                            AUTH ALERTS
                          </p>
                          <p className="font-mono text-[8px] sm:text-[8.5px] opacity-50 uppercase">
                            MATCH VERIFY
                          </p>
                        </div>

                        <div
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                            isWhite
                              ? "bg-white/80 border-black/10"
                              : "bg-[#121216] border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[8.5px] sm:text-[9px] text-[#ff5500] font-bold uppercase">
                              {switches.restock ? "ON" : "OFF"}
                            </span>
                            <button
                              onClick={() => handleToggle("restock")}
                              className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                                switches.restock
                                  ? "bg-[#ff5500]"
                                  : "bg-black/20 dark:bg-white/20"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                  switches.restock
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                          <p className="font-mono text-[9.5px] sm:text-[10px] font-bold">
                            RESTOCK
                          </p>
                          <p className="font-mono text-[8px] sm:text-[8.5px] opacity-50 uppercase">
                            WISHLIST
                          </p>
                        </div>

                        <div
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                            isWhite
                              ? "bg-white/80 border-black/10"
                              : "bg-[#121216] border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[8.5px] sm:text-[9px] text-[#ff5500] font-bold uppercase">
                              {switches.reserve ? "ON" : "OFF"}
                            </span>
                            <button
                              onClick={() => handleToggle("reserve")}
                              className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                                switches.reserve
                                  ? "bg-[#ff5500]"
                                  : "bg-black/20 dark:bg-white/20"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                  switches.reserve
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                          <p className="font-mono text-[9.5px] sm:text-[10px] font-bold">
                            RESERVE
                          </p>
                          <p className="font-mono text-[8px] sm:text-[8.5px] opacity-50 uppercase">
                            LIVE DROPS
                          </p>
                        </div>

                        <div
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                            isWhite
                              ? "bg-white/80 border-black/10"
                              : "bg-[#121216] border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[8.5px] sm:text-[9px] text-[#ff5500] font-bold uppercase">
                              {switches.codPay ? "ON" : "OFF"}
                            </span>
                            <button
                              onClick={() => handleToggle("codPay")}
                              className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                                switches.codPay
                                  ? "bg-[#ff5500]"
                                  : "bg-black/20 dark:bg-white/20"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                  switches.codPay
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                          <p className="font-mono text-[9.5px] sm:text-[10px] font-bold">
                            COD PAY
                          </p>
                          <p className="font-mono text-[8px] sm:text-[8.5px] opacity-50 uppercase">
                            DELIVERY
                          </p>
                        </div>
                      </div>

                      {/* Live In-Transit Order Card */}
                      {orders.length > 0 ? (
                        <div
                          className={`p-4 rounded-2xl border font-mono text-xs transition-all ${
                            isWhite
                              ? "bg-white/90 border-[#ff5500]/30 shadow-sm"
                              : "bg-[#121216] border-[#ff5500]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-[#ff5500] font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                              {orders[0].orderStatus.toUpperCase()}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-[#ff5500]/10 text-[#ff5500] font-bold">
                              [LIVE]
                            </span>
                          </div>
                          <p className="font-bold text-xs">
                            ORDER #{orders[0]._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-[10px] opacity-60 mt-0.5">
                            {orders[0].items?.[0]?.name || "Match Spec Kit"} • $
                            {orders[0].totalAmount}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`p-4 rounded-2xl border text-center font-mono text-[10.5px] opacity-60 ${
                            isWhite
                              ? "bg-black/5 border-black/10"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          No active dispatches in transit.
                        </div>
                      )}
                    </div>

                    {/* Column 2: Progress Wheel */}
                    <div className="space-y-4">
                      {(() => {
                        const collectorTotalSpent = orders.reduce(
                          (sum, ord) =>
                            sum +
                            (ord.orderStatus !== "cancelled"
                              ? ord.totalAmount || 0
                              : 0),
                          0,
                        );
                        const userPoints =
                          Math.floor(collectorTotalSpent) +
                          (profileName ? 50 : 0);
                        const currentTier =
                          userPoints >= 1000
                            ? 4
                            : userPoints >= 500
                              ? 3
                              : userPoints >= 200
                                ? 2
                                : 1;
                        const tierTitle =
                          currentTier === 4
                            ? "ARCHIVE ICON 04"
                            : currentTier === 3
                              ? "PRO LEVEL 03"
                              : currentTier === 2
                                ? "CLUB MEMBER 02"
                                : "ROOKIE 01";
                        const nextTierTitle =
                          currentTier === 4
                            ? "MAX LEVEL"
                            : currentTier === 3
                              ? "TIER 04 ICON"
                              : currentTier === 2
                                ? "TIER 03 PRO"
                                : "TIER 02 MEMBER";
                        const tierFloor =
                          currentTier === 1
                            ? 0
                            : currentTier === 2
                              ? 200
                              : currentTier === 3
                                ? 500
                                : 1000;
                        const tierGoal =
                          currentTier === 1
                            ? 200
                            : currentTier === 2
                              ? 500
                              : currentTier === 3
                                ? 1000
                                : 1000;
                        const progressPercent =
                          currentTier === 4
                            ? 100
                            : Math.min(
                                100,
                                Math.max(
                                  0,
                                  Math.round(
                                    ((userPoints - tierFloor) /
                                      (tierGoal - tierFloor)) *
                                      100,
                                  ),
                                ),
                              );
                        const pointsRemaining = Math.max(
                          0,
                          tierGoal - userPoints,
                        );
                        const strokeOffset =
                          251.2 - (251.2 * progressPercent) / 100;

                        return (
                          <div
                            className={`p-5 sm:p-6 rounded-3xl border text-center transition-all ${
                              isWhite
                                ? "bg-white/80 border-black/10"
                                : "bg-[#121216] border-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono mb-2 sm:mb-3">
                              <span className="opacity-60">
                                [COLLECTOR TIER]
                              </span>
                              <span className="text-[#ff5500] font-bold">
                                • {tierTitle}
                              </span>
                            </div>

                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto my-2 flex items-center justify-center">
                              <svg
                                className="w-full h-full -rotate-90"
                                viewBox="0 0 100 100"
                              >
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  className="text-black/10 dark:text-white/10"
                                  fill="transparent"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="#ff5500"
                                  strokeWidth="8"
                                  strokeDasharray="251.2"
                                  strokeDashoffset={strokeOffset}
                                  strokeLinecap="round"
                                  fill="transparent"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-mono text-lg sm:text-xl font-bold">
                                  {progressPercent}%
                                </span>
                                <span className="font-mono text-[7.5px] sm:text-[8px] opacity-50 uppercase">
                                  TO {nextTierTitle}
                                </span>
                              </div>
                            </div>

                            <p className="font-mono text-[8.5px] sm:text-[9px] opacity-50 mt-2 sm:mt-3">
                              {currentTier === 4
                                ? "VAULT VIP ACCESS GRANTED // PRIVATE DROPS ACTIVE"
                                : `${pointsRemaining} PTS TO UNLOCK NEXT VAULT TIER ALLOCATION (${userPoints} PTS TOTAL)`}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Drop Card */}
                      <div
                        className={`p-4 rounded-2xl border font-mono text-xs transition-all ${
                          isWhite
                            ? "bg-white/80 border-black/10"
                            : "bg-[#121216] border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="opacity-60">
                            [NEXT SCHEDULED DROP]
                          </span>
                          <span className="text-[#ff5500] font-bold">
                            • 26 AUG
                          </span>
                        </div>
                        <p className="font-bold text-xs">
                          MAN UTD 98/99 TREBLE
                        </p>
                        <p className="text-[10px] opacity-50 truncate">
                          ALLOCATION : 25 UNITS // SHARP
                        </p>
                      </div>
                    </div>

                    {/* Column 3: Featured Spec */}
                    <div
                      className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between relative transition-all ${
                        isWhite
                          ? "bg-white/80 border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
                          : "bg-[#121216] border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="opacity-60 truncate">
                          FEATURED SPEC: FC BARCELONA
                        </span>
                        <span className="font-bold text-[#ff5500] shrink-0">
                          $125.00
                        </span>
                      </div>

                      <div className="relative w-full h-36 sm:h-44 my-3 flex items-center justify-center">
                        <Image
                          src="/images/barca-jersey.svg"
                          alt="Barcelona 125th Anniversary"
                          fill
                          className="object-contain drop-shadow-2xl"
                        />
                      </div>

                      <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5 font-mono text-xs">
                        <div>
                          <p className="font-bold text-xs truncate">
                            FC BARCELONA 125TH ANNIVERSARY
                          </p>
                          <p className="text-[9.5px] opacity-50">
                            24/25 HOME MATCH SPEC // [01/FCB]
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-emerald-500 text-[10px] font-bold">
                            [VERIFIED]
                          </span>
                          <Link
                            href="/shop"
                            className="px-3 py-1 rounded-lg bg-[#ff5500] text-white text-[10px] font-bold uppercase tracking-wider"
                          >
                            [INSPECT]
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vault Collection Grid */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between font-mono text-xs border-b pb-2 border-black/10 dark:border-white/10">
                      <span className="font-bold tracking-wider">
                        [VAULT COLLECTION // ACTIVE SPECIFICATIONS]
                      </span>
                      <Link
                        href="/shop"
                        className="text-[#ff5500] hover:underline"
                      >
                        + Discover More
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {adminJerseys.slice(0, 4).map((kit) => (
                        <div
                          key={kit.code}
                          className={`p-3 sm:p-4 rounded-2xl border font-mono text-xs flex flex-col justify-between relative transition-all ${
                            isWhite
                              ? "bg-white border-black/10 shadow-sm"
                              : "bg-[#14141a] border-white/10"
                          }`}
                        >
                          <div className="relative w-full h-28 sm:h-32 my-1 flex items-center justify-center">
                            <Image
                              src={getSafeImageSrc(kit.imageSrc)}
                              alt={kit.club}
                              fill
                              className="object-contain drop-shadow-md"
                            />
                          </div>

                          <div className="mt-2 space-y-1">
                            <p className="font-bold text-xs truncate">
                              {kit.club}
                            </p>
                            <p className="text-[9px] opacity-50 truncate">
                              {kit.name}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                              <span className="text-[#ff5500] font-bold text-xs">
                                {kit.price}
                              </span>
                              <Link
                                href="/shop"
                                className="text-[9px] font-bold text-[#ff5500] hover:underline"
                              >
                                [VIEW]
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Collector View: Tab 2 (Real Orders History) */}
              {activeTab === "orders" && (
                <section
                  className={`p-5 sm:p-8 rounded-3xl border space-y-4 ${
                    isWhite
                      ? "bg-white border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs border-b pb-3 border-black/10 dark:border-white/10">
                    <span className="font-bold tracking-wider">
                      [PERSONAL DISPATCH & ORDER ARCHIVE]
                    </span>
                    <span className="opacity-50">{orders.length} ENTRIES</span>
                  </div>

                  {loadingOrders ? (
                    <div className="py-12 text-center font-mono text-xs opacity-60">
                      Querying personal orders from MongoDB Atlas...
                    </div>
                  ) : orders.length === 0 ? (
                    <EmptyState
                      title="Your Order History is Vacant"
                      description="You haven't placed any match-spec kit orders yet. Browse our curated collection in the marketplace to acquire authentic editions."
                      actionLabel="Browse Marketplace"
                      actionHref="/shop"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs min-w-[500px]">
                        <thead>
                          <tr
                            className={`border-b text-[10px] opacity-50 uppercase ${
                              isWhite
                                ? "border-black/10 bg-black/5"
                                : "border-white/10 bg-white/5"
                            }`}
                          >
                            <th className="p-3 sm:p-3.5">ORDER REF</th>
                            <th className="p-3 sm:p-3.5">SPECIFICATION</th>
                            <th className="p-3 sm:p-3.5">DATE</th>
                            <th className="p-3 sm:p-3.5">PRICE</th>
                            <th className="p-3 sm:p-3.5 text-right">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {orders.map((row) => (
                            <tr
                              key={row._id}
                              className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <td className="p-3 sm:p-3.5 font-bold text-[#ff5500]">
                                #{row._id.slice(-6).toUpperCase()}
                              </td>
                              <td className="p-3 sm:p-3.5 truncate max-w-[160px]">
                                {row.items?.[0]?.name || "Match Spec Kit"}
                              </td>
                              <td className="p-3 sm:p-3.5 opacity-60 text-[11px]">
                                {new Date(row.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3 sm:p-3.5 font-bold">
                                ${row.totalAmount}
                              </td>
                              <td className="p-3 sm:p-3.5 text-right font-bold text-[#ff5500]">
                                [{row.orderStatus.toUpperCase()}]
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* Collector View: Tab 3 (Comprehensive Profile & Settings) */}
              {activeTab === "settings" && (
                <div className="space-y-8">
                  {/* Section A: Identity & Sizing */}
                  <section
                    className={`p-5 sm:p-8 rounded-3xl border space-y-6 ${
                      isWhite
                        ? "bg-white border-black/10 shadow-sm"
                        : "bg-[#101014] border-white/10"
                    }`}
                  >
                    <div className="border-b pb-4 border-black/10 dark:border-white/10">
                      <h3 className="font-mono text-sm sm:text-base font-bold">
                        [COLLECTOR IDENTITY & SIZING]
                      </h3>
                      <p className="text-xs opacity-60 mt-0.5">
                        Manage your account credentials, size preferences, and
                        club affiliation.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSaveProfile}
                      className="space-y-4 max-w-2xl font-mono text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            Email Address (Read-only)
                          </label>
                          <input
                            type="email"
                            disabled
                            value={profileEmail}
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none opacity-60 cursor-not-allowed ${
                              isWhite
                                ? "bg-black/5 border-black/10"
                                : "bg-white/5 border-white/10"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            Favorite Club
                          </label>
                          <input
                            type="text"
                            value={favoriteClub}
                            onChange={(e) => setFavoriteClub(e.target.value)}
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Preferred Size Pill Matrix */}
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-2">
                          Preferred Jersey Fit / Size
                        </label>
                        <div className="flex gap-2">
                          {(["S", "M", "L", "XL", "XXL"] as const).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setPreferredSize(sz)}
                              className={`w-11 h-10 rounded-xl font-bold border transition-all cursor-pointer ${
                                preferredSize === sz
                                  ? "bg-[#ff5500] text-white border-[#ff5500] shadow-sm"
                                  : isWhite
                                    ? "bg-black/5 hover:bg-black/10 border-black/10 text-black/70"
                                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#ff5500] text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
                      >
                        Save Identity & Sizing
                      </button>
                    </form>
                  </section>

                  {/* Section B: Delivery & Shipping Address */}
                  <section
                    className={`p-5 sm:p-8 rounded-3xl border space-y-6 ${
                      isWhite
                        ? "bg-white border-black/10 shadow-sm"
                        : "bg-[#101014] border-white/10"
                    }`}
                  >
                    <div className="border-b pb-4 border-black/10 dark:border-white/10">
                      <h3 className="font-mono text-sm sm:text-base font-bold">
                        [SHIPPING & DISPATCH COORDINATES]
                      </h3>
                      <p className="text-xs opacity-60 mt-0.5">
                        Default address used for instant Cash on Delivery (COD)
                        dispatches.
                      </p>
                    </div>

                    <div className="space-y-4 max-w-2xl font-mono text-xs">
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              street: e.target.value,
                            })
                          }
                          className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                            isWhite
                              ? "bg-[#faf7f0] border-black/10"
                              : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                city: e.target.value,
                              })
                            }
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.postalCode}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                postalCode: e.target.value,
                              })
                            }
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.country}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                country: e.target.value,
                              })
                            }
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">
                          Courier Delivery Instructions
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.instructions}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              instructions: e.target.value,
                            })
                          }
                          className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                            isWhite
                              ? "bg-[#faf7f0] border-black/10"
                              : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toast.success(
                            "Delivery coordinates updated successfully!",
                          );
                        }}
                        className="px-6 py-3 bg-[#ff5500] text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
                      >
                        Update Delivery Coordinates
                      </button>
                    </div>
                  </section>

                  {/* Section C: Security & Password */}
                  <section
                    className={`p-5 sm:p-8 rounded-3xl border space-y-6 ${
                      isWhite
                        ? "bg-white border-black/10 shadow-sm"
                        : "bg-[#101014] border-white/10"
                    }`}
                  >
                    <div className="border-b pb-4 border-black/10 dark:border-white/10">
                      <h3 className="font-mono text-sm sm:text-base font-bold">
                        [SECURITY & ENCRYPTED CREDENTIALS]
                      </h3>
                      <p className="text-xs opacity-60 mt-0.5">
                        Change your session authentication password.
                      </p>
                    </div>

                    <form
                      onSubmit={handlePasswordChange}
                      className="space-y-4 max-w-xl font-mono text-xs"
                    >
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                            isWhite
                              ? "bg-[#faf7f0] border-black/10"
                              : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase opacity-60 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                              isWhite
                                ? "bg-[#faf7f0] border-black/10"
                                : "bg-[#16161a] border-white/10"
                            }`}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#ff5500] text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
                      >
                        Update Security Token
                      </button>
                    </form>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Kit Publisher & Editor Modal (with Multi-Source Upload & 3D Test Stage) ── */}
      {isPublisherOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            setIsPublisherOpen(false);
            setEditingJersey(null);
          }}
        >
          <div
            className={`relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 transition-all duration-200 border ${
              isWhite
                ? "bg-[#faf8f5] border-black/10 text-[#0f0f0f] shadow-2xl"
                : "bg-[#111114] border-white/10 text-white shadow-2xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsPublisherOpen(false);
                setEditingJersey(null);
              }}
              className={`absolute top-5 right-5 z-30 w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer font-mono text-xs border ${
                isWhite
                  ? "bg-black/5 hover:bg-black/10 text-black border-black/10"
                  : "bg-white/5 hover:bg-white/10 text-white border-white/10"
              }`}
            >
              ✕
            </button>

            <div className="mb-6 border-b pb-4 border-black/10 dark:border-white/10">
              <span className="font-mono text-[10px] tracking-widest uppercase opacity-40 font-semibold block mb-1">
                {editingJersey
                  ? "ADMIN CATALOG // EDIT SPECIFICATION"
                  : "ADMIN CATALOG // NEW SPECIFICATION"}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {editingJersey
                  ? `Edit [${kitForm.code}] ${kitForm.name}`
                  : "Publish Match-Issue Kit"}
              </h2>
              <p className="text-xs opacity-50 mt-0.5">
                Configure jersey metadata, landing orbit visibility, and live
                inventory allocation in MongoDB Atlas.
              </p>
            </div>

            <form onSubmit={handleSaveKitForm} className="space-y-6">
              {/* Image Input Selection & Live 3D Test Stage */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Form Controls for Image */}
                <div className="md:col-span-7 space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] uppercase opacity-50 mb-2 font-semibold tracking-wider">
                      1. Image Source Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "preset" as const, label: "Archive Preset" },
                        { id: "url" as const, label: "Web URL Link" },
                        { id: "upload" as const, label: "File Upload" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setImageInputMode(mode.id)}
                          className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer border text-[10px] font-semibold ${
                            imageInputMode === mode.id
                              ? isWhite
                                ? "bg-black text-white border-black"
                                : "bg-white text-black border-white"
                              : isWhite
                                ? "bg-black/5 hover:bg-black/10 border-black/10 text-black/70"
                                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode A: Preset Selector */}
                  {imageInputMode === "preset" && (
                    <div className="space-y-2">
                      <label className="block text-[10px] opacity-50">
                        Select Transparent Cutout Preset:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            name: "FC Barcelona",
                            src: "/images/barca-jersey.svg",
                          },
                          {
                            name: "Real Madrid",
                            src: "/images/real-jersey.svg",
                          },
                          {
                            name: "Arsenal Cannon",
                            src: "/images/arsenal-jersey.svg",
                          },
                          {
                            name: "Man United Devil",
                            src: "/images/manchester-united-jersey.svg",
                          },
                        ].map((preset) => (
                          <button
                            key={preset.src}
                            type="button"
                            onClick={() =>
                              setKitForm({ ...kitForm, imageSrc: preset.src })
                            }
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                              kitForm.imageSrc === preset.src
                                ? "border-[#ff5500] bg-[#ff5500]/10 text-[#ff5500] font-bold"
                                : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <span className="text-xs">👕</span>
                            <span className="truncate text-[10px]">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode B: Web Image URL with Auto-Cutout */}
                  {imageInputMode === "url" && (
                    <div className="space-y-2">
                      <label className="block text-[10px] opacity-50">
                        Enter or Paste Web Image URL:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={kitForm.imageSrc}
                          onChange={(e) =>
                            setKitForm({ ...kitForm, imageSrc: e.target.value })
                          }
                          onPaste={(e) => {
                            const pasted = e.clipboardData.getData("text");
                            if (
                              pasted &&
                              (pasted.startsWith("http://") ||
                                pasted.startsWith("https://"))
                            ) {
                              handleWebUrlCutout(pasted);
                            }
                          }}
                          placeholder="https://example.com/jersey.jpg"
                          className={`flex-1 h-10 px-3.5 rounded-xl border text-xs outline-none transition-colors ${
                            isWhite
                              ? "bg-white border-black/15 focus:border-black/40 text-black"
                              : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                          }`}
                        />
                        <button
                          type="button"
                          disabled={isRemovingBg || !kitForm.imageSrc}
                          onClick={() => handleWebUrlCutout()}
                          className="px-3 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 font-mono text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                        >
                          {isRemovingBg ? "Extracting..." : "Process"}
                        </button>
                      </div>
                      <p className="text-[9px] opacity-40 font-mono">
                        Pasting a URL automatically fetches the photo and strips
                        its background.
                      </p>
                    </div>
                  )}

                  {/* Mode C: Local File Upload */}
                  {imageInputMode === "upload" && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] opacity-50">
                        Upload Jersey Image from Device:
                      </label>
                      <label
                        className={`w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all relative overflow-hidden ${
                          isRemovingBg ? "pointer-events-none opacity-60" : ""
                        } ${
                          isWhite
                            ? "border-black/15 hover:border-black/30 bg-black/[0.02]"
                            : "border-white/15 hover:border-white/30 bg-white/[0.02]"
                        }`}
                      >
                        {isRemovingBg ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-mono opacity-80">
                              Preparing transparent cutout...
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-medium">
                              Click to select or drag & drop jersey image
                            </span>
                            <span className="text-[9px] opacity-40 mt-1 font-mono">
                              Accepts JPG, PNG, WebP, SVG
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isRemovingBg}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Right: Live 3D Test Stage */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <span className="font-mono text-[9px] uppercase opacity-50 font-semibold tracking-wider mb-2">
                    [3D SPEC PREVIEW // HOVER TO TILT]
                  </span>

                  <div
                    onMouseMove={handlePreviewMouseMove}
                    onMouseLeave={handlePreviewMouseLeave}
                    className={`relative w-full h-48 sm:h-56 rounded-2xl border flex items-center justify-center p-4 overflow-hidden cursor-crosshair transition-all ${
                      isWhite
                        ? "bg-black/[0.02] border-black/10"
                        : "bg-black/30 border-white/10"
                    }`}
                  >
                    <div
                      ref={previewRef}
                      className="relative w-36 h-44 transition-transform duration-75"
                      style={{
                        transformStyle: "preserve-3d",
                        filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.3))",
                      }}
                    >
                      <Image
                        src={getSafeImageSrc(kitForm.imageSrc)}
                        alt="3D Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[8px] opacity-40 uppercase mt-1">
                    Inherits 3D Parallax Orbit on Landing
                  </span>
                </div>
              </div>

              {/* Kit Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <label className="block text-[10px] uppercase opacity-50 mb-1">
                    Kit Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={kitForm.code}
                    onChange={(e) =>
                      setKitForm({
                        ...kitForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. 13/JUV-9798"
                    className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                      isWhite
                        ? "bg-white border-black/15 focus:border-black/40 text-black"
                        : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase opacity-50 mb-1">
                    Kit Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={kitForm.name}
                    onChange={(e) =>
                      setKitForm({ ...kitForm, name: e.target.value })
                    }
                    placeholder="e.g. JUVENTUS 97/98 CENTENARIO PINK"
                    className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                      isWhite
                        ? "bg-white border-black/15 focus:border-black/40 text-black"
                        : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase opacity-50 mb-1 font-semibold">
                    Club / Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={kitForm.club}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isNational =
                        /portugal|argentina|brazil|france|england|germany|italy|spain|netherlands|japan|croatia/i.test(
                          val,
                        );
                      const isPremier =
                        /arsenal|manchester|chelsea|liverpool|tottenham|city/i.test(
                          val,
                        );
                      const isSerieA = /milan|juventus|inter|roma|napoli/i.test(
                        val,
                      );
                      const isLaLiga =
                        /madrid|barcelona|atletico|sevilla|valencia/i.test(val);
                      const isBundesliga =
                        /bayern|dortmund|leverkusen|leipzig/i.test(val);
                      const isLigue1 = /psg|paris|marseille|monaco|lyon/i.test(
                        val,
                      );

                      let newLeague = kitForm.league;
                      let newCat = kitForm.category;

                      if (isNational) {
                        newLeague = "International / National Teams";
                        newCat = "nation";
                      } else if (isPremier) {
                        newLeague = "Premier League";
                      } else if (isSerieA) {
                        newLeague = "Serie A";
                      } else if (isLaLiga) {
                        newLeague = "La Liga";
                      } else if (isBundesliga) {
                        newLeague = "Bundesliga";
                      } else if (isLigue1) {
                        newLeague = "Ligue 1";
                      }

                      setKitForm({
                        ...kitForm,
                        club: val,
                        league: newLeague,
                        category: newCat,
                      });
                    }}
                    placeholder="e.g. PORTUGAL or FC BARCELONA"
                    className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                      isWhite
                        ? "bg-white border-black/15 focus:border-black/40 text-black"
                        : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase opacity-50 mb-1 font-semibold">
                    Category / Type *
                  </label>
                  <select
                    value={kitForm.category}
                    onChange={(e) =>
                      setKitForm({
                        ...kitForm,
                        category: e.target.value as
                          | "club"
                          | "retro"
                          | "special"
                          | "vintage"
                          | "nation",
                      })
                    }
                    className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors cursor-pointer ${
                      isWhite
                        ? "bg-white border-black/15 text-black"
                        : "bg-[#18181c] border-white/10 text-white"
                    }`}
                  >
                    <option value="club">Club Match Kit</option>
                    <option value="nation">
                      National Team / International
                    </option>
                    <option value="retro">Retro Archive</option>
                    <option value="vintage">Vintage Classic</option>
                    <option value="special">Special / Anniversary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase opacity-50 mb-1 font-semibold">
                    League / Competition *
                  </label>
                  <select
                    value={kitForm.league}
                    onChange={(e) =>
                      setKitForm({ ...kitForm, league: e.target.value })
                    }
                    className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors cursor-pointer ${
                      isWhite
                        ? "bg-white border-black/15 text-black"
                        : "bg-[#18181c] border-white/10 text-white"
                    }`}
                  >
                    <option value="La Liga">La Liga (Spain)</option>
                    <option value="Premier League">
                      Premier League (England)
                    </option>
                    <option value="Serie A">Serie A (Italy)</option>
                    <option value="Bundesliga">Bundesliga (Germany)</option>
                    <option value="Ligue 1">Ligue 1 (France)</option>
                    <option value="International / National Teams">
                      International / National Teams
                    </option>
                    <option value="UEFA Champions League">
                      UEFA Champions League
                    </option>
                    <option value="Vintage Archive">Vintage Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase opacity-50 mb-1 font-semibold">
                    Season / Spec
                  </label>
                  <input
                    type="text"
                    value={kitForm.season}
                    onChange={(e) =>
                      setKitForm({ ...kitForm, season: e.target.value })
                    }
                    placeholder="97/98 MATCH SPEC"
                    className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                      isWhite
                        ? "bg-white border-black/15 focus:border-black/40 text-black"
                        : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase opacity-50 mb-1 font-semibold">
                    Price / Valuation (NPR Rs.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={kitForm.price}
                    onChange={(e) =>
                      setKitForm({ ...kitForm, price: e.target.value })
                    }
                    placeholder="Rs. 2,500"
                    className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                      isWhite
                        ? "bg-white border-black/15 focus:border-black/40 text-black"
                        : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                    }`}
                  />
                </div>
              </div>

              {/* Placement & Visibility Checkboxes */}
              <div
                className={`p-4 rounded-2xl border font-mono text-xs space-y-3 ${
                  isWhite
                    ? "bg-black/[0.02] border-black/10"
                    : "bg-white/[0.02] border-white/10"
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-50 block tracking-wider">
                  [PLACEMENT & STORE VISIBILITY]
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100">
                    <input
                      type="checkbox"
                      checked={kitForm.showOnLanding}
                      onChange={(e) =>
                        setKitForm({
                          ...kitForm,
                          showOnLanding: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#ff5500] rounded"
                    />
                    <span>Show on 3D Landing Carousel</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100">
                    <input
                      type="checkbox"
                      checked={kitForm.showInShop}
                      onChange={(e) =>
                        setKitForm({ ...kitForm, showInShop: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#ff5500] rounded"
                    />
                    <span>Show in Shop Archive</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100">
                    <input
                      type="checkbox"
                      checked={kitForm.featured}
                      onChange={(e) =>
                        setKitForm({ ...kitForm, featured: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#ff5500] rounded"
                    />
                    <span>Featured in Vault</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPublisherOpen(false);
                    setEditingJersey(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#ff5500] hover:bg-[#ff661a] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {editingJersey
                    ? "Save Changes to MongoDB →"
                    : "Publish to MongoDB Atlas →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className={`w-full border-t py-6 px-4 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] opacity-60 ${
          isWhite
            ? "border-black/10 bg-[#f4efe5]"
            : "border-white/10 bg-[#070709]"
        }`}
      >
        <span>© 2026 [THEJERSEYHUB] COLLECTOR VAULT & ADMIN ENGINE</span>
        <button
          onClick={() => setContactModalOpen(true)}
          className="hover:text-[#ff5500] cursor-pointer"
        >
          [CONTACT DESK]
        </button>
      </footer>

      {/* ── Mobile Persistent Bottom Action Bar ──────────────────────── */}
      <div className="md:hidden fixed bottom-3 inset-x-3.5 z-40">
        <div
          className={`backdrop-blur-2xl rounded-2xl p-2 border shadow-2xl flex items-center justify-around transition-all ${
            isWhite
              ? "bg-[#faf7f0]/95 border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.15)] text-black"
              : "bg-[#101014]/95 border-white/15 shadow-[0_15px_45px_rgba(0,0,0,0.9)] text-white"
          }`}
        >
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  setActiveTab("admin_products");
                  setAdminCollectorPreview(false);
                }}
                className={`py-1.5 px-3 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "admin_products"
                    ? "bg-[#ff5500] text-white"
                    : "opacity-60"
                }`}
              >
                <span>3D ORBIT</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("admin_inventory");
                  setAdminCollectorPreview(false);
                }}
                className={`py-1.5 px-3 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "admin_inventory"
                    ? "bg-[#ff5500] text-white"
                    : "opacity-60"
                }`}
              >
                <span>STOCK</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("admin_orders");
                  setAdminCollectorPreview(false);
                  refreshOrders();
                }}
                className={`py-1.5 px-3 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "admin_orders"
                    ? "bg-[#ff5500] text-white"
                    : "opacity-60"
                }`}
              >
                <span>DISPATCH</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("vault")}
                className={`py-1.5 px-3 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "vault"
                    ? "bg-[#ff5500] text-white"
                    : "opacity-60"
                }`}
              >
                <span>VAULT</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-1.5 px-3 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-[#ff5500] text-white"
                    : "opacity-60"
                }`}
              >
                <span>SETTINGS</span>
              </button>
              <Link
                href="/shop"
                className="py-1.5 px-3 rounded-xl opacity-60 font-mono text-[10px] font-bold"
              >
                <span>SHOP</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode="login"
        theme={isWhite ? "white" : "black"}
        onClose={() => setAuthModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        theme={isWhite ? "white" : "black"}
        onClose={() => setContactModalOpen(false)}
      />

      {/* ── Custom Editorial Delete Confirmation Modal ──────────────── */}
      <ConfirmModal
        isOpen={!!deleteModalKit}
        title="Confirm Permanent Deletion"
        badgeText="MONGODB ATLAS SAFEGUARD"
        highlightText={
          deleteModalKit
            ? `[${deleteModalKit.code}] ${deleteModalKit.name}`
            : undefined
        }
        message="Are you sure you want to permanently erase this edition specification from the database? This action will immediately remove it from all 3D landing orbits, marketplace archives, and collector queries."
        confirmLabel="Erase Edition"
        cancelLabel="Keep in Vault"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalKit(null)}
      />

      {/* ── Admin: Create Collector Modal ───────────────────────────── */}
      {isCreateUserOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsCreateUserOpen(false)}
        >
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 font-mono text-xs border transition-all duration-200 ${
              isWhite
                ? "bg-[#faf8f5] border-black/15 text-black shadow-2xl"
                : "bg-[#111114] border-white/10 text-white shadow-2xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-black/10 dark:border-white/10">
              <span className="font-bold text-xs uppercase opacity-50 tracking-wider">
                [CREATE COLLECTOR ACCOUNT]
              </span>
              <button
                onClick={() => setIsCreateUserOpen(false)}
                className="opacity-50 hover:opacity-100 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsCreatingUser(true);
                const res = await userService.createUserByAdmin(newUserForm);
                setIsCreatingUser(false);
                if (res.success) {
                  toast.success(
                    `✓ Collector account created for ${newUserForm.name}!`,
                  );
                  setIsCreateUserOpen(false);
                  refreshUsers();
                } else {
                  toast.error(res.message || "Failed to create user");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] uppercase opacity-50 mb-1">
                  Full Name (Capitalized)
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newUserForm.name}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, name: e.target.value })
                  }
                  className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                    isWhite
                      ? "bg-white border-black/15 focus:border-black/40 text-black"
                      : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase opacity-50 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={newUserForm.email}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, email: e.target.value })
                  }
                  className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                    isWhite
                      ? "bg-white border-black/15 focus:border-black/40 text-black"
                      : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase opacity-50 mb-1">
                  10-Digit Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9812345678"
                  value={newUserForm.phone}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, phone: e.target.value })
                  }
                  className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                    isWhite
                      ? "bg-white border-black/15 focus:border-black/40 text-black"
                      : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase opacity-50 mb-1">
                  Password (Uppercase, Number, Special)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Strong@123"
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, password: e.target.value })
                  }
                  className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                    isWhite
                      ? "bg-white border-black/15 focus:border-black/40 text-black"
                      : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2 bg-[#ff5500] hover:bg-[#ff661a] text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isCreatingUser ? "Creating..." : "Create Account →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Admin: Edit Collector Modal (Name & Phone) ─────────────── */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setEditingUser(null)}
        >
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 font-mono text-xs border transition-all duration-200 ${
              isWhite
                ? "bg-[#faf8f5] border-black/15 text-black shadow-2xl"
                : "bg-[#111114] border-white/10 text-white shadow-2xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-black/10 dark:border-white/10">
              <span className="font-bold text-xs uppercase opacity-50 tracking-wider">
                [EDIT COLLECTOR]
              </span>
              <button
                onClick={() => setEditingUser(null)}
                className="opacity-50 hover:opacity-100 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const userId = editingUser._id || editingUser.id;
                if (!userId) return;
                setIsUpdatingUser(true);
                const res = await userService.updateUser(userId, editUserForm);
                setIsUpdatingUser(false);
                if (res.success) {
                  toast.success(`✓ Updated details for ${editUserForm.name}!`);
                  setEditingUser(null);
                  refreshUsers();
                } else {
                  toast.error(res.message || "Failed to update user");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] uppercase opacity-50 mb-1">
                  Email Address (Read-Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full h-10 px-3 rounded-xl border border-black/10 dark:border-white/10 opacity-50 bg-black/5 dark:bg-white/5 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase opacity-50 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) =>
                    setEditUserForm({ ...editUserForm, name: e.target.value })
                  }
                  className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                    isWhite
                      ? "bg-white border-black/15 focus:border-black/40 text-black"
                      : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase opacity-50 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={editUserForm.phone}
                  onChange={(e) =>
                    setEditUserForm({ ...editUserForm, phone: e.target.value })
                  }
                  className={`w-full h-10 px-3 rounded-xl border outline-none transition-colors ${
                    isWhite
                      ? "bg-white border-black/15 focus:border-black/40 text-black"
                      : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="px-5 py-2 bg-[#ff5500] hover:bg-[#ff661a] text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isUpdatingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Admin: Timed Block Modal (durationDays) ──────────────────── */}
      {blockingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setBlockingUser(null)}
        >
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 font-mono text-xs border transition-all duration-200 ${
              isWhite
                ? "bg-[#faf8f5] border-black/15 text-black shadow-2xl"
                : "bg-[#111114] border-white/10 text-white shadow-2xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-black/10 dark:border-white/10">
              <span className="font-bold text-xs uppercase opacity-50 tracking-wider">
                [SECURITY // ACCOUNT ACCESS]
              </span>
              <button
                onClick={() => setBlockingUser(null)}
                className="opacity-50 hover:opacity-100 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p className="mb-4 opacity-70 leading-relaxed">
              Configure access block for{" "}
              <strong className="font-bold">{blockingUser.name}</strong> (
              {blockingUser.email}). Blocked users cannot log in or make
              protected orders until the block period expires.
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-[10px] uppercase opacity-50 font-semibold tracking-wider">
                Select Block Duration:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { days: 0, label: "🟢 Unblock (Active)" },
                  { days: 1, label: "⏱️ 1 Day" },
                  { days: 3, label: "⏱️ 3 Days" },
                  { days: 7, label: "⏱️ 7 Days" },
                  { days: 30, label: "⏱️ 30 Days" },
                  { days: 365, label: "⛔ 1 Year" },
                ].map((dur) => (
                  <button
                    key={dur.days}
                    type="button"
                    onClick={() => setBlockDurationDays(dur.days)}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-semibold text-left transition-all cursor-pointer ${
                      blockDurationDays === dur.days
                        ? "border-[#ff5500] bg-[#ff5500]/10 text-[#ff5500] font-bold"
                        : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockingUser(null)}
                className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBlocking}
                onClick={async () => {
                  const userId = blockingUser._id || blockingUser.id;
                  if (!userId) return;
                  setIsBlocking(true);
                  const res = await userService.toggleBlockWithDuration(
                    userId,
                    blockDurationDays,
                  );
                  setIsBlocking(false);
                  if (res.success) {
                    toast.success(
                      blockDurationDays === 0
                        ? `✓ ${blockingUser.name} unblocked successfully!`
                        : `⛔ ${blockingUser.name} blocked for ${blockDurationDays} days`,
                    );
                    setBlockingUser(null);
                    refreshUsers();
                  } else {
                    toast.error(res.message || "Failed to update block status");
                  }
                }}
                className="px-5 py-2 bg-[#ff5500] hover:bg-[#ff661a] text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all"
              >
                {isBlocking
                  ? "Applying..."
                  : blockDurationDays === 0
                    ? "Lift Block"
                    : `Apply ${blockDurationDays}-Day Block`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin: Delete Collector Confirm Modal ────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteModalUser}
        title="Permanently Delete Collector Account"
        badgeText="CASCADING MONGODB DELETION"
        highlightText={
          deleteModalUser
            ? `${deleteModalUser.name} (${deleteModalUser.email})`
            : undefined
        }
        message="Are you sure you want to permanently delete this customer account? According to security rules, this will permanently remove their User document, active Cart, and all historical Order records from MongoDB."
        confirmLabel="Erase Collector & Orders"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeletingUser}
        onConfirm={async () => {
          if (!deleteModalUser) return;
          const userId = deleteModalUser._id || deleteModalUser.id;
          if (!userId) return;
          setIsDeletingUser(true);
          const res = await userService.deleteUser(userId);
          setIsDeletingUser(false);
          if (res.success) {
            toast.success(
              `✓ Account and associated records erased for ${deleteModalUser.name}`,
            );
            setDeleteModalUser(null);
            refreshUsers();
          } else {
            toast.error(res.message || "Failed to delete user");
          }
        }}
        onCancel={() => setDeleteModalUser(null)}
      />
    </main>
  );
}
