import { ProductForm } from "@/features/products/components/ProductForm"

export const metadata = {
  title: "New Product · Fashion ERP/POS",
}

export default function CreateProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Product</h1>
        <p className="text-sm text-muted-foreground">Create a new product in your catalog.</p>
      </div>

      <ProductForm />
    </div>
  )
}
