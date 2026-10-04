
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AddProductForm from "./add-product-form";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Verify the logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Verify administrator access
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || admin?.role !== "admin") {
    redirect("/");
  }

  // Fetch products from Supabase
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, category, price, stock, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-blue-100 bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-blue-800">
            AKURA
          </h1>
          <p className="text-xs tracking-wide text-slate-500">
            ADMIN DASHBOARD
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Administrator
        </span>
      </header>

      {/* Dashboard content */}
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome to Akura
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Manage your clothing store from one place.
        </p>

        {/* Account information */}
        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Admin account</p>
            <p className="mt-2 break-all font-semibold text-slate-900">
              {user.email}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Access level</p>
            <p className="mt-2 font-semibold text-blue-700">
              Administrator
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Store status</p>
            <p className="mt-2 font-semibold text-green-600">
              Connected
            </p>
          </div>
        </section>

        {/* Add Product Form */}
        <section className="mt-7 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-slate-900">
            Add New Product
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Add a product to your Akura Clothing inventory.
          </p>

          <AddProductForm />
        </section>

        {/* Product Management */}
        <section className="mt-7 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Product Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View your store inventory and product status.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {products?.length ?? 0} Products
            </span>
          </div>

          {productsError ? (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Could not load products: {productsError.message}
            </p>
          ) : !products || products.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              No products found in your database.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {product.name}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {product.category || "Uncategorized"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {product.stock}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
