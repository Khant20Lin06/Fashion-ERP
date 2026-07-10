"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SKUPreview } from "@/components/products/SKUPreview"
import { productFormSchema, type ProductFormValues } from "../schemas/product.schema"
import { useCategories } from "../hooks/useCategories"
import { useBrands, useCollections } from "../hooks/useBrands"
import { useCreateProduct, useUpdateProduct } from "../hooks/useProductMutation"
import { checkSkuAvailability } from "../api/product.api"
import { ImageUploader } from "./ImageUploader"
import { PricingPanel } from "./PricingPanel"
import { VariantManager } from "./VariantManager"
import type { Product, ProductImage, ProductVariant } from "../types"

type ProductFormProps = {
  product?: Product
}

const genderOptions = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "unisex", label: "Unisex" },
]

const seasonOptions = [
  { value: "spring_summer", label: "Spring/Summer 2026" },
  { value: "autumn_winter", label: "Autumn/Winter 2026" },
  { value: "all_season", label: "All Season" },
]

/** Multi-section create/edit form: Basic Info, Pricing, Images, Variants. */
export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { data: collections } = useCollections()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(product?.id ?? "")

  const [images, setImages] = useState<ProductImage[]>(product?.images ?? [])
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? [])
  const [skuAvailable, setSkuAvailable] = useState<boolean | undefined>(undefined)
  const [checkingSku, setCheckingSku] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      type: product?.type ?? "simple",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      collectionId: product?.collectionId,
      description: product?.description ?? "",
      season: product?.season ?? "spring_summer",
      gender: product?.gender ?? "unisex",
      sku: product?.sku ?? "",
      status: product?.status ?? "draft",
      costPrice: product?.pricing.costPrice ?? 0,
      sellingPrice: product?.pricing.sellingPrice ?? 0,
      discountPrice: product?.pricing.discountPrice,
      wholesalePrice: product?.pricing.wholesalePrice,
      taxRate: product?.pricing.taxRate ?? 0,
    },
  })

  const sku = form.watch("sku")
  const brandId = form.watch("brandId")
  const categoryId = form.watch("categoryId")

  useEffect(() => {
    if (!sku) {
      setSkuAvailable(undefined)
      return
    }
    setCheckingSku(true)
    const timeout = setTimeout(() => {
      checkSkuAvailability(sku, product?.id).then((available) => {
        setSkuAvailable(available)
        setCheckingSku(false)
        if (!available) {
          form.setError("sku", { message: "This SKU is already in use" })
        } else {
          form.clearErrors("sku")
        }
      })
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku, product?.id])

  function handleAutoGenerateSku() {
    const brandCode = (brands ?? []).find((b) => b.id === brandId)?.name.slice(0, 4).toUpperCase() ?? "BRD"
    const categoryCode = (categories ?? []).find((c) => c.id === categoryId)?.name.slice(0, 2).toUpperCase() ?? "GN"
    const sequence = String(Math.floor(Math.random() * 900) + 100)
    form.setValue("sku", `${brandCode}-${categoryCode}-${sequence}`, { shouldValidate: true })
  }

  function onSubmit(values: ProductFormValues) {
    // Images and variants are tracked in local state here and would be
    // submitted alongside `values` once a real multipart/JSON backend exists.
    const payload: ProductFormValues = { ...values, variants }

    if (isEditing) {
      updateProduct.mutate(payload, {
        onSuccess: () => router.push("/dashboard/products"),
      })
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => router.push("/dashboard/products"),
      })
    }
  }

  const isPending = createProduct.isPending || updateProduct.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Nike Classic Tee" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="variant">Variant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(categories ?? []).map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(brands ?? []).map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection</FormLabel>
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select collection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(collections ?? []).map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genderOptions.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seasonOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Product description…" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>SKU</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="e.g. NIKE-TS-BLK-M-001" className="font-mono" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={handleAutoGenerateSku}>
                          Auto-generate
                        </Button>
                      </div>
                      <SKUPreview sku={field.value} isDuplicate={!skuAvailable && !!sku} isChecking={checkingSku} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="mt-4">
            <VariantManager
              variants={variants}
              onChange={setVariants}
              productId={product?.id ?? "new"}
              brandCode={(brands ?? []).find((b) => b.id === brandId)?.name.slice(0, 4).toUpperCase() ?? "BRD"}
              categoryCode={(categories ?? []).find((c) => c.id === categoryId)?.name.slice(0, 2).toUpperCase() ?? "GN"}
              basePricing={{ costPrice: form.watch("costPrice"), sellingPrice: form.watch("sellingPrice") }}
            />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader images={images} onChange={setImages} label="Main & Gallery Images" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            <PricingPanel
              value={{
                costPrice: form.watch("costPrice"),
                sellingPrice: form.watch("sellingPrice"),
                discountPrice: form.watch("discountPrice"),
                wholesalePrice: form.watch("wholesalePrice"),
                taxRate: form.watch("taxRate"),
              }}
              onChange={(pricing) => {
                form.setValue("costPrice", pricing.costPrice)
                form.setValue("sellingPrice", pricing.sellingPrice)
                form.setValue("discountPrice", pricing.discountPrice)
                form.setValue("wholesalePrice", pricing.wholesalePrice)
                form.setValue("taxRate", pricing.taxRate)
              }}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
