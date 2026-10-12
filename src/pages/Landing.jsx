import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  ShoppingBag,
  Zap,
  Star,
  TrendingUp,
  X,
  PackageX,
  Headphones,
  Armchair,
  PenTool,
  Cpu,
} from "lucide-react";
import { seedProducts, seedOrders, CATEGORIES } from "@/lib/seed";
import { formatCurrency, cn } from "@/lib/utils";
import { getProductImage } from "@/components/orders/productImages";
import landingLogo from "@/components/images/landing_logo.png";

/* ─── Best-selling logic: count total quantity sold per product across orders ─── */
function getBestSellers(products, orders, count = 4) {
  const salesMap = {};
  orders.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        const pid = item.productId || item.id;
        salesMap[pid] = (salesMap[pid] || 0) + (item.quantity || 1);
      });
    }
  });
  return [...products]
    .filter((p) => p.status === "active")
    .sort((a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0))
    .slice(0, count);
}

/* ─── Category icons mapping ─── */
const CATEGORY_ICONS = {
  Electronics: Cpu,
  Accessories: Headphones,
  Furniture: Armchair,
  Stationery: PenTool,
};

/* ─── Hero Slideshow ─── */
function HeroSlideshow({ products }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % products.length),
    [products.length]
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + products.length) % products.length),
    [products.length]
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  if (products.length === 0) return null;
  const product = products[current];
  const imageSrc = getProductImage(product);

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 shadow-2xl shadow-indigo-900/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-40 w-40 rounded-full bg-violet-400/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center gap-6 p-8 sm:p-12 md:flex-row md:gap-12 lg:p-16">
        {/* Text */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
            <Zap size={12} className="text-amber-300" />
            Featured Product
          </span>
          <h2
            key={product.id + "-name"}
            className="animate-fade-up text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
          >
            {product.name}
          </h2>
          <p
            key={product.id + "-desc"}
            className="animate-fade-up mt-3 max-w-md text-sm text-indigo-100/80 leading-relaxed sm:text-base"
          >
            {product.description || "Premium quality product available now."}
          </p>
          <div
            key={product.id + "-price"}
            className="animate-fade-up mt-5 flex items-baseline gap-2"
          >
            <span className="text-3xl font-extrabold text-white">
              {formatCurrency(product.price)}
            </span>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              In Stock
            </span>
          </div>
        </div>

        {/* Image */}
        <div className="relative flex h-48 w-48 shrink-0 items-center justify-center sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72">
          <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm" />
          {imageSrc ? (
            <img
              key={product.id + "-img"}
              src={imageSrc}
              alt={product.name}
              className="animate-fade-up relative z-10 h-full w-full object-contain p-6 drop-shadow-2xl"
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center text-white/60">
              <PackageX size={48} />
              <span className="mt-1 text-xs">No image</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-md transition hover:bg-white/25 hover:text-white"
        aria-label="Previous product"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-md transition hover:bg-white/25 hover:text-white"
        aria-label="Next product"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === current
                ? "w-7 bg-white"
                : "w-2 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Landing Product Card (read-only, triggers login popup) ─── */
function LandingProductCard({ product, onClickCard }) {
  const imageSrc = getProductImage(product);
  const isOutOfStock = product.stock <= 0 || product.status === "inactive";

  return (
    <div
      onClick={() => onClickCard(product)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-300",
        isOutOfStock
          ? "cursor-not-allowed opacity-60 border-slate-200"
          : "cursor-pointer hover:-translate-y-1 hover:shadow-xl",
        "border-slate-200/80 hover:border-indigo-300"
      )}
    >
      {/* Category badge */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs backdrop-blur-md">
          {product.category}
        </span>
      </div>

      {/* Stock badge */}
      <div className="absolute right-3 top-3 z-10">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-md",
            isOutOfStock
              ? "bg-rose-100/90 text-rose-700"
              : product.stock < 10
                ? "bg-amber-100/90 text-amber-700"
                : "bg-emerald-100/90 text-emerald-700"
          )}
        >
          {isOutOfStock
            ? "Out of Stock"
            : product.stock < 10
              ? `${product.stock} left`
              : "In Stock"}
        </span>
      </div>

      {/* Product Image */}
      <div className="relative mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50/90 p-3">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <PackageX size={36} />
            <span className="mt-1 text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col">
        <div className="mb-1">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed min-h-[32px]">
            {product.description || "High quality inventory product."}
          </p>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Unit Price
            </span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onClickCard(product);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200",
              isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
            )}
          >
            <ShoppingBag size={14} />
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Login Popup Modal ─── */
function LoginPopup({ product, onClose, onLogin }) {
  const imageSrc = product ? getProductImage(product) : null;

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="animate-fade-up relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-indigo-900/15 backdrop-blur-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>

          {/* Product preview */}
          <div className="flex flex-col items-center bg-gradient-to-b from-indigo-50/80 to-white px-6 pt-8 pb-5">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <PackageX size={32} className="text-slate-300" />
              )}
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">
              {product.name}
            </h3>
            <p className="mt-1 text-center text-sm font-semibold text-indigo-600">
              {formatCurrency(product.price)}
            </p>
          </div>

          {/* Login CTA */}
          <div className="px-6 pb-7 pt-4">
            <div className="mb-5 rounded-xl border border-amber-200/60 bg-amber-50/70 p-3.5 text-center">
              <p className="text-sm font-medium text-amber-800">
                  Please log in to place an order
              </p>
              <p className="mt-1 text-xs text-amber-600/80">
                Create an account or sign in to start shopping
              </p>
            </div>

            <button
              onClick={onLogin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-700 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
            >
              <LogIn size={16} />
              Log in to Order
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Don't have an account?{" "}
              <button
                onClick={onLogin}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ icon: Icon, title, subtitle, accentColor = "indigo" }) {
  const colorMap = {
    indigo: "from-indigo-600 to-violet-600",
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-pink-500",
  };
  const bgMap = {
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          bgMap[accentColor]
        )}
      >
        <Icon size={20} />
      </div>
      <div>
        <h2
          className={cn(
            "bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl",
            colorMap[accentColor]
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [loginProduct, setLoginProduct] = useState(null);

  const products = seedProducts;
  const orders = seedOrders;

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === "active"),
    [products]
  );

  // Slideshow: pick a diverse set of featured products
  const slideshowProducts = useMemo(
    () => activeProducts.filter((p) => p.stock > 0).slice(0, 6),
    [activeProducts]
  );

  // Best sellers
  const bestSellers = useMemo(
    () => getBestSellers(products, orders, 4),
    [products, orders]
  );

  // Products grouped by category
  const productsByCategory = useMemo(() => {
    const grouped = {};
    CATEGORIES.forEach((cat) => {
      const items = activeProducts.filter((p) => p.category === cat);
      if (items.length > 0) grouped[cat] = items;
    });
    return grouped;
  }, [activeProducts]);

  function handleProductClick(product) {
    if (product.stock <= 0 || product.status === "inactive") return;
    setLoginProduct(product);
  }

  function handleGoToLogin() {
    navigate("/login");
  }

  // Category accent colors
  const categoryColors = {
    Electronics: "indigo",
    Accessories: "emerald",
    Furniture: "amber",
    Stationery: "rose",
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-indigo-200/10 blur-3xl" />

      {/* ─── Navigation Bar ─── */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={landingLogo}
              alt="Dekko Isho Mart Logo"
              className="h-10 w-10 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Dekko Isho Mart
              </h1>

            </div>
          </div>

          <button
            onClick={handleGoToLogin}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-700 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Log in</span>
          </button>
        </div>
      </nav>

      {/* ─── Page Content ─── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Hero Slideshow */}
        <HeroSlideshow products={slideshowProducts} />

        {/* Stats Bar */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Products", value: activeProducts.length, icon: ShoppingBag },
            { label: "Categories", value: CATEGORIES.length, icon: Star },
            { label: "Orders Placed", value: orders.length, icon: TrendingUp },
            { label: "Happy Customers", value: "500+", icon: Zap },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-sm transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Best Selling Section ─── */}
        <section className="mt-12">
          <SectionHeader
            icon={TrendingUp}
            title="Best Selling"
            subtitle="Our most popular products loved by customers"
            accentColor="amber"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bestSellers.map((product) => (
              <div key={product.id} className="relative">
                <div className="absolute -right-1 -top-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30">
                  <Star size={12} className="fill-white text-white" />
                </div>
                <LandingProductCard
                  product={product}
                  onClickCard={handleProductClick}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ─── Category Sections ─── */}
        {Object.entries(productsByCategory).map(([category, items]) => {
          const CatIcon = CATEGORY_ICONS[category] || ShoppingBag;
          return (
            <section key={category} className="mt-12">
              <SectionHeader
                icon={CatIcon}
                title={category}
                subtitle={`Explore our ${category.toLowerCase()} collection`}
                accentColor={categoryColors[category] || "indigo"}
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <LandingProductCard
                    key={product.id}
                    product={product}
                    onClickCard={handleProductClick}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* ─── Footer ─── */}
        <footer className="mt-16 border-t border-slate-200/60 pt-8 pb-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={landingLogo}
                alt="Dekko Isho Mart"
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span className="text-sm font-semibold text-slate-700">
                Dekko Isho Mart
              </span>
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Dekko Isho Mart. All rights reserved.
            </p>
            
          </div>
        </footer>
      </div>

      {/* ─── Login Popup ─── */}
      <LoginPopup
        product={loginProduct}
        onClose={() => setLoginProduct(null)}
        onLogin={handleGoToLogin}
      />
    </main>
  );
}
