"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAllProductsFull } from "../hooks/useProducts"
import { useUoms } from "../hooks/useUoms"
import { useVariantUoms } from "../hooks/useVariantUoms"
import {
  useCreatePriceListItem,
  useDeactivatePriceListItem,
  useDeletePriceList,
  useDeletePriceListItem,
  usePriceListItems,
  usePriceLists,
  useSetPriceListStatus,
} from "../hooks/usePriceLists"
import { PriceListFormDialog } from "./PriceListFormDialog"
import {
  priceListItemFormSchema,
  type PriceListItemFormInput,
  type PriceListItemFormValues,
} from "../schemas/product.schema"
import type { PriceList, PriceListItem, ProductVariant, VariantUomMapping } from "../types"
import { useUpdatePriceListItem } from "../hooks/usePriceLists"

type VariantChoice = {
  productId: string
  productName: string
  variant: ProductVariant
}

type PriceListItemDialogState = {
  item?: PriceListItem
}

export function PriceListWorkspace() {
  const { data: priceLists, isLoading, isError, refetch } = usePriceLists()
  const { data: products } = useAllProductsFull()
  const { mutate: setPriceListStatus } = useSetPriceListStatus()
  const { mutate: deletePriceList } = useDeletePriceList()
  const [selectedPriceListPreference, setSelectedPriceListPreference] = useState<string | undefined>(undefined)
  const [editingPriceList, setEditingPriceList] = useState<PriceList | undefined>(undefined)
  const [priceListDialogOpen, setPriceListDialogOpen] = useState(false)
  const [itemDialogState, setItemDialogState] = useState<PriceListItemDialogState | null>(null)

  const selectedPriceList = useMemo(() => {
    if (!priceLists || priceLists.length === 0) return undefined
    if (selectedPriceListPreference) {
      const matched = priceLists.find((entry) => entry.id === selectedPriceListPreference)
      if (matched) return matched
    }
    return priceLists[0]
  }, [priceLists, selectedPriceListPreference])

  function openCreatePriceList() {
    setEditingPriceList(undefined)
    setPriceListDialogOpen(true)
  }

  function openEditPriceList(priceList: PriceList) {
    setEditingPriceList(priceList)
    setPriceListDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Skeleton className="h-[420px] w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState message="Couldn't load price lists." onRetry={refetch} />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">Price Lists</CardTitle>
            <p className="text-sm text-muted-foreground">Retail, wholesale, branch, and channel-specific selling price books.</p>
          </div>
          <Button size="sm" onClick={openCreatePriceList}>
            <Plus /> New
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!priceLists || priceLists.length === 0 ? (
            <EmptyState
              title="No price lists yet"
              description="Create a price list first, then add variant and UOM-specific selling prices."
            />
          ) : (
            priceLists.map((priceList) => {
              const selected = priceList.id === selectedPriceList?.id
              return (
                <div
                  key={priceList.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => setSelectedPriceListPreference(priceList.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      setSelectedPriceListPreference(priceList.id)
                    }
                  }}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{priceList.name}</p>
                        <Badge variant={priceList.status === "ACTIVE" ? "default" : "outline"}>
                          {priceList.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-0.5 font-mono">{priceList.code}</span>
                        <span>{priceList.currency}</span>
                      </div>
                      {priceList.description ? (
                        <p className="text-sm text-muted-foreground">{priceList.description}</p>
                      ) : null}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Price list actions for ${priceList.name}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditPriceList(priceList)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPriceListStatus({
                              id: priceList.id,
                              isActive: priceList.status !== "ACTIVE",
                            })
                          }
                        >
                          <Power /> {priceList.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => deletePriceList(priceList.id)}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <PriceListItemsPanel
        key={selectedPriceList?.id ?? "empty"}
        priceList={selectedPriceList}
        products={products ?? []}
        dialogState={itemDialogState}
        onCreate={() => setItemDialogState({})}
        onEdit={(item) => setItemDialogState({ item })}
        onCloseDialog={() => setItemDialogState(null)}
      />

      <PriceListFormDialog
        open={priceListDialogOpen}
        onOpenChange={setPriceListDialogOpen}
        priceList={editingPriceList}
      />
    </div>
  )
}

function PriceListItemsPanel({
  priceList,
  products,
  dialogState,
  onCreate,
  onEdit,
  onCloseDialog,
}: {
  priceList: PriceList | undefined
  products: Array<{ id: string; name: string; variants: ProductVariant[] }>
  dialogState: PriceListItemDialogState | null
  onCreate: () => void
  onEdit: (item: PriceListItem) => void
  onCloseDialog: () => void
}) {
  const variantChoices = useMemo<VariantChoice[]>(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          productId: product.id,
          productName: product.name,
          variant,
        })),
      ),
    [products],
  )

  const { data: items, isLoading, isError, refetch } = usePriceListItems(priceList?.id)
  const { data: uoms } = useUoms()
  const { mutate: deactivateItem } = useDeactivatePriceListItem(priceList?.id ?? "")
  const { mutate: deleteItem } = useDeletePriceListItem(priceList?.id ?? "")

  if (!priceList) {
    return (
      <Card>
        <CardContent className="py-16">
          <EmptyState
            title="Select a price list"
            description="Choose a price list from the left to manage effective-dated variant and UOM prices."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">{priceList.name} Prices</CardTitle>
            <p className="text-sm text-muted-foreground">
              One row per variant + UOM + effective date window. Overlapping active windows are rejected by the backend.
            </p>
          </div>
          <Button size="sm" onClick={onCreate}>
            <Plus /> Add Price Row
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : isError ? (
            <ErrorState message="Couldn't load price rows." onRetry={refetch} />
          ) : !items || items.length === 0 ? (
            <EmptyState
              title="No price rows yet"
              description="Add selling prices for each variant and transactional UOM you want this price list to govern."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Valid To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[56px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const variantChoice = variantChoices.find((entry) => entry.variant.id === item.productVariantId)
                  const uomLabel = resolveUomLabel(item, variantChoice?.variant, uoms)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{variantChoice?.variant.sku ?? item.productVariantId}</TableCell>
                      <TableCell>{variantChoice?.productName ?? "-"}</TableCell>
                      <TableCell>{uomLabel}</TableCell>
                      <TableCell>{formatMoney(priceList.currency, item.price)}</TableCell>
                      <TableCell>{toShortDate(item.validFrom)}</TableCell>
                      <TableCell>{item.validTo ? toShortDate(item.validTo) : "Open-ended"}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "ACTIVE" ? "default" : "outline"}>
                          {item.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" aria-label="Price row actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Pencil /> Edit
                            </DropdownMenuItem>
                            {item.status === "ACTIVE" ? (
                              <DropdownMenuItem onClick={() => deactivateItem(item.id)}>
                                <Power /> Deactivate
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem variant="destructive" onClick={() => deleteItem(item.id)}>
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {dialogState ? (
        <PriceListItemDialog
          open={!!dialogState}
          onOpenChange={(open) => {
            if (!open) onCloseDialog()
          }}
          priceList={priceList}
          products={products}
          item={dialogState.item}
        />
      ) : null}
    </>
  )
}

function PriceListItemDialog({
  open,
  onOpenChange,
  priceList,
  products,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  priceList: PriceList
  products: Array<{ id: string; name: string; variants: ProductVariant[] }>
  item?: PriceListItem
}) {
  const isEditing = !!item
  const variantChoices = useMemo<VariantChoice[]>(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          productId: product.id,
          productName: product.name,
          variant,
        })),
      ),
    [products],
  )
  const createItem = useCreatePriceListItem(priceList.id)
  const updateItem = useUpdatePriceListItem(priceList.id, item?.id ?? "")

  const form = useForm<PriceListItemFormInput, unknown, PriceListItemFormValues>({
    resolver: zodResolver(priceListItemFormSchema),
    defaultValues: {
      productVariantId: item?.productVariantId ?? "",
      uomId: item?.uomId ?? "",
      price: item ? item.price.toFixed(2) : "",
      validFrom: item ? toDateInputValue(item.validFrom) : toDateInputValue(new Date().toISOString()),
      validTo: item?.validTo ? toDateInputValue(item.validTo) : "",
      isActive: item ? item.status === "ACTIVE" : true,
    },
  })

  const selectedVariantId = useWatch({
    control: form.control,
    name: "productVariantId",
  })
  const { data: variantMappings } = useVariantUoms(selectedVariantId)
  const selectedVariant = useMemo(
    () => variantChoices.find((entry) => entry.variant.id === selectedVariantId)?.variant,
    [selectedVariantId, variantChoices],
  )

  const availableUoms = useMemo(() => {
    if (!selectedVariant) return []

    const options: Array<{ id: string; label: string }> = []

    if (selectedVariant.baseUomId) {
      options.push({
        id: selectedVariant.baseUomId,
        label: `${selectedVariant.baseUom?.name ?? selectedVariant.baseUomId} (Base)`,
      })
    }

    for (const mapping of (variantMappings ?? []).filter((entry) => entry.isActive && entry.usageType !== "PURCHASE")) {
      options.push({
        id: mapping.uomId,
        label: `${mapping.uomName ?? mapping.uomCode ?? mapping.uomId} (${mapping.conversionFactorToBase}x base)`,
      })
    }

    return options.filter((option, index, list) => list.findIndex((entry) => entry.id === option.id) === index)
  }, [selectedVariant, variantMappings])

  useEffect(() => {
    if (!open) return

    form.reset({
      productVariantId: item?.productVariantId ?? "",
      uomId: item?.uomId ?? "",
      price: item ? item.price.toFixed(2) : "",
      validFrom: item ? toDateInputValue(item.validFrom) : toDateInputValue(new Date().toISOString()),
      validTo: item?.validTo ? toDateInputValue(item.validTo) : "",
      isActive: item ? item.status === "ACTIVE" : true,
    })
  }, [form, item, open])

  useEffect(() => {
    if (!selectedVariant || isEditing) return
    const current = form.getValues("uomId")
    if (!current && selectedVariant.baseUomId) {
      form.setValue("uomId", selectedVariant.baseUomId)
    }
  }, [form, isEditing, selectedVariant])

  function onSubmit(values: PriceListItemFormValues) {
    const mutation = isEditing ? updateItem : createItem
    mutation.mutate(values, {
      onSuccess: () => onOpenChange(false),
    })
  }

  const editingInactiveRow = isEditing && item?.status === "INACTIVE"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Price Row" : `New Price Row for ${priceList.name}`}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="productVariantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product variant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {variantChoices.map((choice) => (
                        <SelectItem key={choice.variant.id} value={choice.variant.id}>
                          {choice.productName} - {choice.variant.sku}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing ? (
                    <p className="text-xs text-muted-foreground">Variant identity is immutable to preserve price history.</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="uomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UOM</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing || availableUoms.length === 0}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a UOM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUoms.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isEditing && availableUoms.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Choose a variant first to load its base and alternate sales UOMs.</p>
                    ) : null}
                    {isEditing ? (
                      <p className="text-xs text-muted-foreground">UOM is fixed after creation. Create a new row if you need another UOM price.</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ({priceList.currency})</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isEditing} />
                    </FormControl>
                    {isEditing ? (
                      <p className="text-xs text-muted-foreground">Effective start date is immutable. Create a new row for a new pricing window.</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid To</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="font-normal">Active</FormLabel>
                    {editingInactiveRow ? (
                      <p className="text-xs text-muted-foreground">Inactive rows cannot be reactivated. Create a new active row instead.</p>
                    ) : null}
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={editingInactiveRow} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                {isEditing ? "Save Changes" : "Create Price Row"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function resolveUomLabel(item: PriceListItem, variant: ProductVariant | undefined, uoms?: Array<{ id: string; name: string; code: string }>) {
  if (!item.uomId) return "Base UOM"
  if (variant?.baseUomId === item.uomId) {
    return variant.baseUom?.name ?? item.uomId
  }

  const masterUom = uoms?.find((entry) => entry.id === item.uomId)
  if (masterUom) {
    return `${masterUom.name} (${masterUom.code})`
  }

  const mapping = variant?.uomMappings?.find((entry: VariantUomMapping) => entry.uomId === item.uomId)
  return mapping?.uomName ?? mapping?.uomCode ?? item.uomId
}

function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`
}

function toShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value))
}

function toDateInputValue(value: string) {
  return value.slice(0, 10)
}
