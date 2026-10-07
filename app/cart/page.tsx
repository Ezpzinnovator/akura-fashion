"use client";

import { useEffect, useState } from "react";
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
};

type CartItem = {
  key: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type CartProduct = CartItem & {
  product: Product;
};

const fallbackImage =
  "https://placehold.co/600x800/DBEAFE/102A43?text=AKURA";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCart() {
      try {
        const savedCart: CartItem[] = JSON.parse(
          localStorage.getItem("akura-cart") || "[]"
        );

        if (!Array.isArray(savedCart) || savedCart.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        const products: Product[] = await response.json();

        const combinedItems: CartProduct[] = savedCart
          .map((cartItem) => {
            const product = products.find(
              (item) => item.id === cartItem.productId
            );

            if (!product) {
              return null;
            }

            return {
              ...cartItem,
              product,
            };
          })
          .filter(
            (item): item is CartProduct => item !== null
          );

        setCartItems(combinedItems);
      } catch (error) {
        console.error("Cart loading error:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  function saveCart(items: CartProduct[]) {
    const simpleCart: CartItem[] = items.map((item) => ({
      key: item.key,
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

    localStorage.setItem(
      "akura-cart",
      JSON.stringify(simpleCart)
    );

    setCartItems(items);
  }

  function updateQuantity(key: string, quantity: number) {
    if (quantity < 1) {
      return;
    }

    const updatedItems = cartItems.map((item) => {
      if (item.key !== key) {
        return item;
      }

      return {
        ...item,
        quantity: Math.min(quantity, item.product.stock),
      };
    });

    saveCart(updatedItems);
  }

  function removeItem(key: string) {
    const updatedItems = cartItems.filter(
      (item) => item.key !== key
    );

    saveCart(updatedItems);
  }

  function clearCart() {
    localStorage.removeItem("akura-cart");
    setCartItems([]);
  }

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EFF6FF] text-[#102A43]">
        <header className="border-b border-[#BFDBFE] bg-[#EFF6FF]">
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-[0.18em]"
            >
              AKURA<span className="text-[#3B82F6]">.</span>
            </Link>
          </div>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-sm text-[#627D98]">
            Loading your bag...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EFF6FF] text-[#102A43]">
      <header className="sticky top-0 z-30 border-b border-[#BFDBFE] bg-[#EFF6FF]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.18em]"
          >
            AKURA<span className="text-[#3B82F6]">.</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.12em] transition hover:text-[#3B82F6]"
          >
            ← CONTINUE SHOPPING
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-10">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#3B82F6]">
            YOUR BAG
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Shopping Bag
            </h1>

            {cartItems.length > 0 && (
              <p className="text-sm text-[#627D98]">
                {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"}
              </p>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center border border-[#BFDBFE] bg-white px-6">
            <div className="max-w-md text-center">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#3B82F6]">
                AKURA
              </p>

              <h2 className="mt-4 text-2xl font-semibold">
                Your bag is empty
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#627D98]">
                Discover something you love and add it
                to your bag.
              </p>

              <Link
                href="/"
                className="mt-7 inline-block bg-[#3B82F6] px-8 py-4 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-[#1D4ED8]"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              {cartItems.map((item) => (
                <article
                  key={item.key}
                  className="border border-[#BFDBFE] bg-white p-4 sm:p-5"
                >
                  <div className="flex gap-5">
                    <div className="w-28 shrink-0 overflow-hidden bg-[#DBEAFE] sm:w-40">
                      <img
                        src={
                          item.product.image_url ||
                          fallbackImage
                        }
                        alt={item.product.name}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <p className="text-[9px] font-bold tracking-[0.25em] text-[#3B82F6]">
                            {item.product.category}
                          </p>

                          <h2 className="mt-2 text-base font-semibold sm:text-lg">
                            {item.product.name}
                          </h2>
                        </div>

                        <p className="text-sm font-semibold">
                          ₹
                          {(
                            item.product.price *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#627D98]">
                        {item.size && (
                          <span>
                            Size:{" "}
                            <strong className="font-medium text-[#102A43]">
                              {item.size}
                            </strong>
                          </span>
                        )}

                        {item.color && (
                          <span>
                            Color:{" "}
                            <strong className="font-medium text-[#102A43]">
                              {item.color}
                            </strong>
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5">
                        <div className="flex items-center border border-[#BFDBFE]">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="px-4 py-2.5 text-lg transition hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >=
                              item.product.stock
                            }
                            className="px-4 py-2.5 text-lg transition hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.key)
                          }
                          className="text-[10px] font-semibold tracking-[0.15em] text-[#627D98] transition hover:text-red-600"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <button
                onClick={clearCart}
                className="text-[10px] font-semibold tracking-[0.15em] text-[#627D98] transition hover:text-red-600"
              >
                CLEAR BAG
              </button>
            </div>

            <aside className="h-fit border border-[#BFDBFE] bg-white p-6 sm:p-7">
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#3B82F6]">
                ORDER SUMMARY
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#627D98]">
                    Items
                  </span>

                  <span>{totalItems}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#627D98]">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between border-t border-[#BFDBFE] pt-4 text-sm">
                  <span className="text-[#627D98]">
                    Shipping
                  </span>

                  <span className="font-medium">
                    FREE
                  </span>
                </div>

                <div className="flex justify-between border-t border-[#BFDBFE] pt-4">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-lg font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                disabled
                className="mt-7 w-full cursor-not-allowed bg-gray-400 py-4 text-xs font-semibold tracking-[0.18em] text-white"
              >
                CHECKOUT — COMING NEXT
              </button>

              <p className="mt-4 text-center text-[10px] leading-5 text-[#627D98]">
                Checkout and secure payment will be
                connected in the next step.
              </p>
            </aside>
          </div>
        )}
      </section>

      <footer className="mt-10 bg-[#102A43] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="text-2xl font-black tracking-[0.18em]"
            >
              AKURA<span className="text-[#60A5FA]">.</span>
            </Link>

            <p className="mt-2 text-xs text-white/60">
              Wear your own story.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.15em] text-white/70 transition hover:text-white"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </footer>
    </main>
  );
}