"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import {
  variantUomMappingFormSchema,
  type VariantUomMappingFormInput,
  type VariantUomMappingFormValues,
} from "../schemas/product.schema"
import { useUoms } from "../hooks/useUoms"
import {
  useCreateVariantUom,
  useDeleteVariantUom,
  useSetVariantUomStatus,
  useUpdateVariantUom,
  useVariantUoms,
} from "../hooks/useVariantUoms"
import type { ProductVariant, Uom, VariantUomMapping } from "../types"

type VariantUomManagerProps = {
  variants: ProductVariant[]
}

type VariantDialogState = {
  variant: ProductVariant
  mapping?: VariantUomMapping
}

const usageTypeOptions = [
  { value: "BOTH", label: "Sales + Purchase" },
  { value: "SALES", label: "Sales Only" },
  { value: "PURCHASE", label: "Purchase Only" },
] as const

export function VariantUomManager({ variants }: VariantUomManagerProps) {
  const persistedVariants = useMemo(
    () => variants.filter((variant) => /^[0-9a-f-]{36}$/i.test(variant.id)),
    [variants],
  )
  const [dialogState, setDialogState] = useState<VariantDialogState | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alternate UOM Mappings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Base UOM is chosen during product creation. After the product is saved, add pack, box, carton, or other
          alternate transactional units per variant here.
        </p>

        {persistedVariants.length === 0 ? (
          <EmptyState
            title="Save the product first"
            description="Variant-level alternate UOM mappings become available after the product and its variants have persistent IDs."
          />
        ) : (
          <div className="grid gap-4">
            {persistedVariants.map((variant) => (
              <VariantUomCard
                key={variant.id}
                variant={variant}
                onCreate={() => setDialogState({ variant })}
                onEdit={(mapping) => setDialogState({ variant, mapping })}
              />
            ))}
          </div>
        )}

        {dialogState ? (
          <VariantUomDialog
            open={!!dialogState}
            onOpenChange={(open) => {
              if (!open) setDialogState(null)
            }}
            variant={dialogState.variant}
            mapping={dialogState.mapping}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

function VariantUomCard({
  variant,
  onCreate,
  onEdit,
}: {
  variant: ProductVariant
  onCreate: () => void
  onEdit: (mapping: VariantUomMapping) => void
}) {
  const { data, isLoading, isError, refetch } = useVariantUoms(variant.id)
  const { mutate: deleteMapping } = useDeleteVariantUom(variant.id)
  const { mutate: setStatus } = useSetVariantUomStatus(variant.id)

  if (isError) {
    return <ErrorState message={`Couldn't load UOM mappings for ${variant.sku}.`} onRetry={refetch} />
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{variant.sku}</p>
          <p className="text-sm text-muted-foreground">
            Base UOM: {variant.baseUom?.name ?? variant.baseUomId ?? "Not configured"}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCreate}>
          <Plus /> Add Alternate UOM
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading mappings...</p>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No mappings yet" description="This variant currently sells and purchases only in its base UOM." />
      ) : (
        <div className="grid gap-3">
          {data.map((mapping) => (
            <div key={mapping.id} className="flex items-start justify-between gap-3 rounded-lg border bg-card/60 p-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{mapping.uomName ?? mapping.uomCode ?? mapping.uomId}</p>
                  <Badge variant={mapping.isBase ? "secondary" : mapping.isActive ? "default" : "outline"}>
                    {mapping.isBase ? "Base" : mapping.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{mapping.usageType}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  1 {mapping.uomCode ?? "unit"} = {mapping.conversionFactorToBase} base units
                </p>
                {mapping.barcode ? <p className="font-mono text-xs text-muted-foreground">{mapping.barcode}</p> : null}
              </div>

              {!mapping.isBase ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Variant UOM actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(mapping)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatus({ id: mapping.id, isActive: !mapping.isActive })}>
                      {mapping.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => deleteMapping(mapping.id)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VariantUomDialog({
  open,
  onOpenChange,
  variant,
  mapping,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: ProductVariant
  mapping?: VariantUomMapping
}) {
  const { data: uoms } = useUoms()
  const createVariantUom = useCreateVariantUom(variant.id)
  const updateVariantUom = useUpdateVariantUom(mapping?.id ?? "", variant.id)
  const isEditing = !!mapping

  const availableUoms = useMemo(
    () => (uoms ?? []).filter((uom) => !variant.baseUom || uom.category === variant.baseUom.category),
    [uoms, variant.baseUom],
  )

  const form = useForm<VariantUomMappingFormInput, unknown, VariantUomMappingFormValues>({
    resolver: zodResolver(variantUomMappingFormSchema),
    defaultValues: {
      uomId: mapping?.uomId ?? "",
      conversionFactorToBase: mapping?.conversionFactorToBase ?? "1.0000",
      usageType: mapping?.usageType ?? "BOTH",
      barcode: mapping?.barcode ?? "",
      isActive: mapping?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        uomId: mapping?.uomId ?? "",
        conversionFactorToBase: mapping?.conversionFactorToBase ?? "1.0000",
        usageType: mapping?.usageType ?? "BOTH",
        barcode: mapping?.barcode ?? "",
        isActive: mapping?.isActive ?? true,
      })
    }
  }, [form, mapping, open])

  function onSubmit(values: VariantUomMappingFormValues) {
    const mutation = isEditing ? updateVariantUom : createVariantUom
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${variant.sku} UOM` : `Add UOM for ${variant.sku}`}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="uomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UOM</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a UOM" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUoms.map((uom: Uom) => (
                        <SelectItem key={uom.id} value={uom.id}>
                          {uom.name} ({uom.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing ? (
                    <p className="text-xs text-muted-foreground">UOM identity is fixed after creation. Update factor, usage, or barcode instead.</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="conversionFactorToBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversion Factor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 12.0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usageTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional barcode for this pack UOM" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="font-normal">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createVariantUom.isPending || updateVariantUom.isPending}>
                {isEditing ? "Save Changes" : "Create Mapping"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
