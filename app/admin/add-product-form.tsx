
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddProductForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [stock, setStock] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          description,
          price,
          image_url: imageUrl,
          sizes: sizes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          colors: colors
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          stock,
          is_active: isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to add product.");
      }

      setSuccess("Product added successfully!");

      setName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setSizes("");
      setColors("");
      setStock("0");
      setIsActive(true);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <section className="mt-7 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">
        Add New Product
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter the details of your new clothing product.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Product Name *
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Akura Essential Tee"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category *
            </label>
            <input
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="T-Shirts"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Price (INR) *
            </label>
            <input
              className={inputClass}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="899"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Stock Quantity *
            </label>
            <input
              className={inputClass}
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              step="1"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product, material and fit..."
              rows={4}
              maxLength={5000}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Image URL
            </label>
            <input
              className={inputClass}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/product.jpg"
            />
            <p className="mt-1 text-xs text-slate-500">
              Paste a publicly accessible image URL. Image uploading
              will be added separately.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Available Sizes
            </label>
            <input
              className={inputClass}
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="S, M, L, XL"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate sizes with commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Available Colors
            </label>
            <input
              className={inputClass}
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="Black, White, Blue"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate colors with commas.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-blue-700"
          />
          Make this product visible in the store
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </section>
  );
}
