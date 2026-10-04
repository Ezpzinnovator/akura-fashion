
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET: Fetch active products
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch products error:", error.message);
      return NextResponse.json(
        { error: "Could not load products." },
        { status: 500 }
      );
    }

    return NextResponse.json(products ?? [], { status: 200 });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading products." },
      { status: 500 }
    );
  }
}

// POST: Add a product (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || admin?.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid product data." },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const image_url =
      typeof body.image_url === "string"
        ? body.image_url.trim()
        : "";

    const price = Number(body.price);
    const stock = Number(body.stock);

    const sizes = Array.isArray(body.sizes)
      ? body.sizes
          .filter(
            (item: unknown) =>
              typeof item === "string" && item.trim().length > 0
          )
          .map((item: string) => item.trim())
      : [];

    const colors = Array.isArray(body.colors)
      ? body.colors
          .filter(
            (item: unknown) =>
              typeof item === "string" && item.trim().length > 0
          )
          .map((item: string) => item.trim())
      : [];

    const is_active = body.is_active !== false;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Enter a valid price greater than zero." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a whole number, zero or higher." },
        { status: 400 }
      );
    }

    if (image_url) {
      try {
        const parsedUrl = new URL(image_url);
        if (
          !["http:", "https:"].includes(parsedUrl.protocol) ||
          image_url.length > 2048
        ) {
          throw new Error("Invalid URL");
        }
      } catch {
        return NextResponse.json(
          {
            error:
              "Enter a valid image URL starting with http:// or https://.",
          },
          { status: 400 }
        );
      }
    }

    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        category,
        description: description || null,
        price,
        image_url: image_url || null,
        sizes,
        colors,
        stock,
        is_active,
      })
      .select("id, name, category, price, stock, is_active")
      .single();

    if (insertError) {
      console.error("Product insert error:", insertError.message);
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the product." },
      { status: 500 }
    );
  }
}
