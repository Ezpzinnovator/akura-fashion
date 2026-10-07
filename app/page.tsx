"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  sizes: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  tag?: string;
};

type Selection = {
  size: string;
  color: string;
};

type CartItem = {
  key: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

const fallbackImage =
  "https://placehold.co/600x750/DBEAFE/102A43?text=AKURA";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [selections, setSelections] = useState<Record<string, Selection>>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        const data: Product[] = await response.json();
        setProducts(data);

        const defaults: Record<string, Selection> = {};
        data.forEach((product) => {
          defaults[product.id] = {
            size: product.sizes?.[0] ?? "",
            color: product.colors?.[0] ?? "",
          };
        });
        setSelections(defaults);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  
const categories = useMemo(() => {
  return [
    "All",
    ...Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      )
    ),
  ];
}, [products]);
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const searchText = search.trim().toLowerCase();
      const matchesSearch =
        !searchText ||
        product.name.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        (product.description ?? "").toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  const cartProducts = cart
    .map((item) => ({
      item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter(
      (
        entry
      ): entry is { item: CartItem; product: Product } =>
        entry.product !== undefined
    );

  const total = cartProducts.reduce(
    (sum, { item, product }) => sum + product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function updateSelection(
    productId: string,
    field: keyof Selection,
    value: string
  ) {
    setSelections((current) => ({
      ...current,
      [productId]: {
        size: current[productId]?.size ?? "",
        color: current[productId]?.color ?? "",
        [field]: value,
      },
    }));
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) return;

    const selection = selections[product.id] ?? {
      size: product.sizes?.[0] ?? "",
      color: product.colors?.[0] ?? "",
    };

    if (product.sizes?.length > 0 && !selection.size) {
      alert("Please select a size.");
      return;
    }

    if (product.colors?.length > 0 && !selection.color) {
      alert("Please select a color.");
      return;
    }

    const size = selection.size;
    const color = selection.color;
    const key = `${product.id}__${size}__${color}`;

    setCart((current) => {
      const existing = current.find((item) => item.key === key);

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }

      return [
        ...current,
        {
          key,
          productId: product.id,
          size,
          color,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(key: string) {
    setCart((current) => current.filter((item) => item.key !== key));
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.key !== key) return item;

          const product = products.find(
            (product) => product.id === item.productId
          );

          const maxStock = product?.stock ?? 99;
          const nextQuantity = Math.min(
            Math.max(item.quantity + delta, 1),
            maxStock
          );

          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function categoryHighlight(name: string, index: number) {
    const backgrounds = ["#DBEAFE", "#BFDBFE", "#93C5FD"];
    const subtitles = [
      "EVERYDAY ESSENTIALS",
      "LAYER YOUR LOOK",
      "THE FINISHING TOUCH",
    ];

    return {
      name,
      subtitle: subtitles[index % subtitles.length],
      bg: backgrounds[index % backgrounds.length],
    };
  }

  return (
    <main className="min-h-screen bg-[#EFF6FF] text-[#102A43]">
      <div className="bg-[#102A43] px-4 py-2.5 text-center text-[10px] font-medium tracking-[0.22em] text-white sm:text-xs">
        FREE SHIPPING ON ORDERS ABOVE ₹1,999
      </div>

      <header className="sticky top-0 z-30 border-b border-[#BFDBFE] bg-[#EFF6FF]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#home"
            className="text-2xl font-black tracking-[0.18em] text-[#102A43]"
          >
            AKURA<span className="text-[#3B82F6]">.</span>
          </a>

          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.16em] md:flex">
            <a href="#shop" className="transition hover:text-[#3B82F6]">
              Shop
            </a>
            <a href="#shop" className="transition hover:text-[#3B82F6]">
              Categories
            </a>
            <a href="#about" className="transition hover:text-[#3B82F6]">
              Our Story
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById("search")?.focus()}
              aria-label="Search products"
              className="text-xl transition hover:text-[#3B82F6]"
            >
              ⌕
            </button>

            <button
              onClick={() => setShowCart(true)}
              className="text-xs font-semibold transition hover:text-[#3B82F6] sm:text-sm"
            >
              BAG ({cartCount})
            </button>
          </div>
        </div>
      </header>

      {showCart && (
        <div
          className="fixed inset-0 z-50 bg-[#102A43]/50"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="ml-auto flex h-full w-full max-w-md flex-col bg-[#EFF6FF] p-5 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-7 flex items-center justify-between border-b border-[#BFDBFE] pb-5">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#3B82F6]">
                  AKURA
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Your Bag ({cartCount})
                </h2>
              </div>

              <button
                onClick={() => setShowCart(false)}
                aria-label="Close shopping bag"
                className="text-3xl text-[#102A43] hover:text-[#3B82F6]"
              >
                ×
              </button>
            </div>

            {cartProducts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span className="text-5xl text-[#93C5FD]">♧</span>
                <h3 className="mt-5 text-lg font-semibold">Your bag is empty</h3>
                <p className="mt-2 text-sm text-[#486581]">
                  Discover something that expresses you.
                </p>
                <button
                  onClick={() => setShowCart(false)}
                  className="mt-6 bg-[#3B82F6] px-7 py-3 text-xs font-semibold tracking-[0.15em] text-white transition hover:bg-[#1D4ED8]"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-5 overflow-y-auto">
                {cartProducts.map(({ item, product }) => (
                  <div
                    key={item.key}
                    className="flex gap-4 border-b border-[#BFDBFE] pb-5"
                  >
                    <img
                      src={product.image_url || fallbackImage}
                      alt={product.name}
                      className="h-24 w-20 bg-[#DBEAFE] object-cover"
                    />

                    <div className="flex flex-1 flex-col justify-center">
                      <h3 className="text-sm font-semibold">{product.name}</h3>
                      <p className="mt-1 text-xs text-[#486581]">
                        {product.category}
                      </p>

                      {item.size && (
                        <p className="mt-1 text-xs text-[#627D98]">
                          Size: <span className="font-medium">{item.size}</span>
                        </p>
                      )}

                      {item.color && (
                        <p className="mt-1 text-xs text-[#627D98]">
                          Color:{" "}
                          <span className="font-medium">{item.color}</span>
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>

                        <div className="flex items-center border border-[#BFDBFE]">
                          <button
                            onClick={() => changeQuantity(item.key, -1)}
                            className="px-2 py-1 text-sm hover:bg-[#DBEAFE]"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQuantity(item.key, 1)}
                            className="px-2 py-1 text-sm hover:bg-[#DBEAFE]"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="mt-2 w-fit text-xs text-[#3B82F6] underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cartProducts.length > 0 && (
              <div className="border-t border-[#BFDBFE] pt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#486581]">Subtotal</span>
                  <span className="font-semibold">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="mb-5 text-xs text-[#627D98]">
                  Shipping and taxes calculated at checkout.
                </p>

                <button
                  disabled
                  className="w-full cursor-not-allowed bg-[#102A43] py-4 text-xs font-semibold tracking-[0.2em] text-white opacity-60"
                >
                  CHECKOUT COMING SOON
                </button>

                <p className="mt-3 text-center text-[10px] text-[#627D98]">
                  Secure checkout will be enabled in a later step.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      <section
        id="home"
        className="relative flex min-h-[520px] items-center overflow-hidden bg-[#DBEAFE] px-6 py-20 sm:min-h-[600px] sm:px-10 md:min-h-[650px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#DBEAFE] via-[#DBEAFE]/95 to-[#93C5FD]/40" />

        <div className="relative mx-auto w-full max-w-7xl">
          <p className="mb-6 text-[10px] font-bold tracking-[0.35em] text-[#2563EB] sm:text-xs">
            THE NEW EXPRESSION
          </p>

          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-8xl">
            Wear your
            <br />
            own <span className="text-[#3B82F6]">story.</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#334E68] sm:text-base">
            Everyday essentials. Bold identities. Discover clothing inspired by
            the things you love.
          </p>

          <a
            href="#shop"
            className="mt-9 inline-flex items-center gap-4 bg-[#3B82F6] px-8 py-4 text-[10px] font-semibold tracking-[0.2em] text-white transition hover:bg-[#1D4ED8] sm:text-xs"
          >
            EXPLORE COLLECTION
            <span className="text-base">↗</span>
          </a>
        </div>

        <div className="absolute bottom-8 right-8 hidden text-right text-[10px] font-medium tracking-[0.25em] text-[#486581] md:block">
          AKURA / EST. 2026
        </div>

        <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[35px] border-[#3B82F6]/10 md:h-[500px] md:w-[500px]" />
        <div className="pointer-events-none absolute -bottom-10 -right-6 h-52 w-52 rounded-full border border-[#3B82F6]/20 md:h-[350px] md:w-[350px]" />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-[#3B82F6]">
            FIND YOUR STYLE
          </p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Shop by category
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#627D98]">
            Categories below are loaded from your products, so new categories
            like Shoes, Caps or Collectibles can appear automatically.
          </p>
        </div>

        {categories.length > 1 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories
              .filter((item) => item !== "All")
              .map((item, index) => {
                const highlight = categoryHighlight(item, index);

                return (
                  <button
                    key={item}
                    onClick={() => {
                      setCategory(item);
                      document.getElementById("shop")?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                    style={{ backgroundColor: highlight.bg }}
                    className={`group flex min-h-32 flex-col items-center justify-center px-2 py-6 text-center transition hover:shadow-md ${
                      category === item ? "ring-2 ring-[#3B82F6]" : ""
                    }`}
                  >
                    <span className="text-sm font-semibold sm:text-xl">
                      {item}
                    </span>
                    <span className="mt-2 text-[7px] font-medium tracking-[0.15em] text-[#334E68] sm:text-[10px]">
                      {highlight.subtitle}
                    </span>
                    <span className="mt-3 text-sm text-[#2563EB] transition group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                );
              })}
          </div>
        ) : (
          <p className="text-center text-sm text-[#627D98]">
            Add products in Supabase to create categories.
          </p>
        )}
      </section>

      <section
        id="shop"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-[#3B82F6]">
              CURATED FOR YOU
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured collection
            </h2>
            <p className="mt-2 text-xs text-[#627D98]">
              Discover the latest from Akura.
            </p>
          </div>

          <input
            id="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border-b border-[#93C5FD] bg-transparent px-2 py-3 text-sm outline-none transition placeholder:text-[#829AB1] focus:border-[#3B82F6] sm:max-w-xs"
          />
        </div>

        <div className="mb-9 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`border px-5 py-2.5 text-[10px] font-semibold tracking-wide transition sm:text-xs ${
                category === item
                  ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                  : "border-[#BFDBFE] bg-transparent text-[#334E68] hover:border-[#3B82F6] hover:text-[#2563EB]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && (
          <p className="py-12 text-center text-sm text-[#627D98]">
            Loading Akura collection...
          </p>
        )}

        {error && (
          <p className="py-12 text-center text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const selection = selections[product.id] ?? {
                  size: product.sizes?.[0] ?? "",
                  color: product.colors?.[0] ?? "",
                };

                const requiresSize = product.sizes?.length > 0;
                const requiresColor = product.colors?.length > 0;

                return (
                  <article key={product.id} className="group min-w-0">
                    <div className="overflow-hidden bg-[#DBEAFE]">
                      <div className="relative">
                        <img
                          src={product.image_url || fallbackImage}
                          alt={product.name}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {product.tag && (
                          <span className="absolute left-3 top-3 bg-[#EFF6FF] px-2 py-1 text-[8px] font-bold tracking-[0.12em] text-[#1E40AF] sm:text-[9px]">
                            {product.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-[10px] text-[#627D98] sm:text-xs">
                            {product.category}
                          </p>
                        </div>

                        <p className="whitespace-nowrap text-sm font-semibold">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {product.description && (
                        <p className="mt-3 text-xs leading-5 text-[#627D98]">
                          {product.description}
                        </p>
                      )}

                      {requiresSize && (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-[0.14em]">
                              SIZE
                            </span>
                            <span className="text-[10px] text-[#627D98]">
                              {selection.size || "SELECT"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                              <button
                                key={size}
                                onClick={() =>
                                  updateSelection(product.id, "size", size)
                                }
                                className={`min-w-11 border px-3 py-2 text-xs font-medium transition ${
                                  selection.size === size
                                    ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                                    : "border-[#BFDBFE] hover:border-[#3B82F6]"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {requiresColor && (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-[0.14em]">
                              COLOR
                            </span>
                            <span className="text-[10px] text-[#627D98]">
                              {selection.color || "SELECT"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                              <button
                                key={color}
                                onClick={() =>
                                  updateSelection(product.id, "color", color)
                                }
                                className={`border px-3 py-2 text-xs font-medium transition ${
                                  selection.color === color
                                    ? "border-[#3B82F6] bg-[#DBEAFE] text-[#1D4ED8]"
                                    : "border-[#BFDBFE] hover:border-[#3B82F6]"
                                }`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="mt-5 w-full bg-[#3B82F6] py-3.5 text-[10px] font-semibold tracking-[0.14em] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-gray-500"
                      >
                        {product.stock <= 0
                          ? "OUT OF STOCK"
                          : "ADD TO BAG +"}
                      </button>

                      {product.stock > 0 && product.stock <= 5 && (
                        <p className="mt-2 text-center text-[10px] font-medium text-[#B45309]">
                          Only {product.stock} left
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-[#627D98]">
                  No products found. Try another search or category.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="mt-4 text-xs font-semibold text-[#3B82F6] underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section
        id="about"
        className="bg-[#DBEAFE] px-5 py-20 text-center sm:py-24"
      >
        <p className="mb-4 text-[10px] font-bold tracking-[0.3em] text-[#2563EB]">
          THE AKURA APPROACH
        </p>
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Made for the way you express yourself.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#334E68]">
          A considered collection of everyday wear and culture-inspired
          designs. Find your style, make it yours.
        </p>
        <a
          href="#shop"
          className="mt-8 inline-block border border-[#3B82F6] px-7 py-3.5 text-[10px] font-semibold tracking-[0.18em] text-[#1D4ED8] transition hover:bg-[#3B82F6] hover:text-white"
        >
          DISCOVER AKURA
        </a>
      </section>

      <section className="bg-[#EFF6FF] px-5 py-16 text-center sm:py-20">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-[#3B82F6]">
          STAY IN THE LOOP
        </p>
        <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Something new is coming.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#627D98]">
          Keep an eye out for fresh drops, new collections and more from
          Akura.
        </p>
      </section>

      <footer className="bg-[#102A43] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 sm:flex-row">
          <div>
            <a
              href="#home"
              className="text-2xl font-black tracking-[0.18em]"
            >
              AKURA<span className="text-[#60A5FA]">.</span>
            </a>
            <p className="mt-3 text-xs text-white/60">Wear your own story.</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <h3 className="mb-4 text-[10px] font-bold tracking-[0.2em] text-[#93C5FD]">
                EXPLORE
              </h3>
              <div className="flex flex-col gap-3 text-xs text-white/70">
                <a href="#shop" className="hover:text-white">
                  Shop
                </a>
                <a href="#shop" className="hover:text-white">
                  Categories
                </a>
                <a href="#about" className="hover:text-white">
                  Our Story
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-[10px] font-bold tracking-[0.2em] text-[#93C5FD]">
                HELP
              </h3>
              <div className="flex flex-col gap-3 text-xs text-white/70">
                <a
                  href="mailto:hello@akuraclothing.com"
                  className="hover:text-white"
                >
                  Contact
                </a>
                <a href="#about" className="hover:text-white">
                  About Us
                </a>
                <a href="#home" className="hover:text-white">
                  Back to Top ↑
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/15 pt-5 text-[9px] tracking-[0.12em] text-white/45 sm:text-[10px]">
          © 2026 AKURA CLOTHING. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </main>
  );
}
