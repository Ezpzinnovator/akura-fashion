"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

const fallbackImage =
  "https://placehold.co/800x1000/DBEAFE/102A43?text=AKURA";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        const products: Product[] = await response.json();

        const foundProduct = products.find(
          (item) => item.id === id
        );

        if (!foundProduct) {
          throw new Error("Product not found.");
        }

        setProduct(foundProduct);

        setSelectedSize(foundProduct.sizes?.[0] ?? "");
        setSelectedColor(foundProduct.colors?.[0] ?? "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  function addToBag() {
    if (!product) return;

    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    if (product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (product.colors.length > 0 && !selectedColor) {
      alert("Please select a color.");
      return;
    }

    const cartItem: CartItem = {
      key: `${product.id}__${selectedSize}__${selectedColor}`,
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    };

    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem("akura-cart") || "[]"
    );

    const existingIndex = existingCart.findIndex(
      (item) => item.key === cartItem.key
    );

    if (existingIndex >= 0) {
      existingCart[existingIndex].quantity = Math.min(
        existingCart[existingIndex].quantity + quantity,
        product.stock
      );
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem(
      "akura-cart",
      JSON.stringify(existingCart)
    );

    alert("Product added to your bag!");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EFF6FF] text-[#102A43]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#627D98]">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#EFF6FF] text-[#102A43]">
        <header className="border-b border-[#BFDBFE] bg-[#EFF6FF]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-[0.18em]"
            >
              AKURA<span className="text-[#3B82F6]">.</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.12em] text-[#3B82F6]"
            >
              BACK TO SHOP
            </Link>
          </div>
        </header>

        <section className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#3B82F6]">
              AKURA
            </p>

            <h1 className="mt-4 text-3xl font-semibold">
              Product not found
            </h1>

            <p className="mt-3 text-sm text-[#627D98]">
              {error || "This product may no longer be available."}
            </p>

            <Link
              href="/"
              className="mt-7 inline-block bg-[#3B82F6] px-7 py-3.5 text-xs font-semibold tracking-[0.15em] text-white transition hover:bg-[#1D4ED8]"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const subtotal = product.price * quantity;

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
            ← BACK TO SHOP
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="overflow-hidden bg-[#DBEAFE]">
            <img
              src={product.image_url || fallbackImage}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#3B82F6]">
              {product.category}
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-xl font-semibold">
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            {product.description && (
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#627D98]">
                {product.description}
              </p>
            )}

            <div className="mt-6">
              {product.stock <= 0 ? (
                <p className="text-xs font-semibold tracking-[0.12em] text-red-600">
                  OUT OF STOCK
                </p>
              ) : product.stock <= 5 ? (
                <p className="text-xs font-semibold tracking-[0.12em] text-[#B45309]">
                  ONLY {product.stock} LEFT
                </p>
              ) : (
                <p className="text-xs font-medium text-green-700">
                  IN STOCK
                </p>
              )}
            </div>

            {product.sizes.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.16em]">
                    SIZE
                  </span>

                  <span className="text-xs text-[#627D98]">
                    {selectedSize || "SELECT"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 border px-4 py-3 text-xs font-medium transition ${
                        selectedSize === size
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

            {product.colors.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.16em]">
                    COLOR
                  </span>

                  <span className="text-xs text-[#627D98]">
                    {selectedColor || "SELECT"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`border px-4 py-3 text-xs font-medium transition ${
                        selectedColor === color
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

            {product.stock > 0 && (
              <div className="mt-7">
                <span className="mb-3 block text-[10px] font-bold tracking-[0.16em]">
                  QUANTITY
                </span>

                <div className="flex w-fit items-center border border-[#BFDBFE]">
                  <button
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(current - 1, 1)
                      )
                    }
                    className="px-5 py-3 text-lg hover:bg-[#DBEAFE]"
                  >
                    −
                  </button>

                  <span className="min-w-12 text-center text-sm">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(current + 1, product.stock)
                      )
                    }
                    className="px-5 py-3 text-lg hover:bg-[#DBEAFE]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={addToBag}
              disabled={product.stock <= 0}
              className="mt-8 w-full bg-[#3B82F6] py-4 text-xs font-semibold tracking-[0.2em] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {product.stock <= 0
                ? "OUT OF STOCK"
                : "ADD TO BAG +"}
            </button>

            <div className="mt-8 border-t border-[#BFDBFE] pt-6">
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#627D98]">
                  Product
                </span>

                <span>{product.category}</span>
              </div>

              <div className="flex justify-between border-t border-[#BFDBFE] py-3 text-xs">
                <span className="text-[#627D98]">
                  Availability
                </span>

                <span>
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Sold out"}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#BFDBFE] py-3 text-xs">
                <span className="text-[#627D98]">
                  Subtotal
                </span>

                <span className="font-semibold">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
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