"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { buildNativeScrollbarClassName } from "@/components/ui/native-scrollbar.classes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreatePromotion, useUpdatePromotion } from "../hooks/usePromotions"
import type { Promotion, PromotionDiscountType } from "../types"

type PromotionFormValues = {
  code: string
  name: string
  description: string
  discountType: PromotionDiscountType
  discountValue: string
  minimumPurchase: string
  maximumDiscountAmount: string
  startDate: string
  endDate: string
  usageLimit: string
  isActive: boolean
}

type PromotionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion?: Promotion
}

function defaultValuesFor(promotion: Promotion | undefined): PromotionFormValues {
  return {
    code: promotion?.code ?? "",
    name: promotion?.name ?? "",
    description: promotion?.description ?? "",
    discountType: promotion?.discountType ?? "PERCENTAGE",
    discountValue: promotion?.discountValue ?? "",
    minimumPurchase: promotion?.minimumPurchase ?? "",
    maximumDiscountAmount: promotion?.maximumDiscountAmount ?? "",
    startDate: promotion?.startDate ?? "",
    endDate: promotion?.endDate ?? "",
    usageLimit: promotion?.usageLimit ? String(promotion.usageLimit) : "",
    isActive: promotion?.status !== "INACTIVE",
  }
}

/**
 * Create/edit dialog for a Promotion. code, discountType, discountValue,
 * and startDate are immutable after creation (the real
 * UpdatePromotionDto has no such fields) — those inputs are disabled,
 * not hidden, when editing, so the still-real value stays visible.
 */
export function PromotionFormDialog({ open, onOpenChange, promotion }: PromotionFormDialogProps) {
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion(promotion?.id ?? "")
  const isEditing = !!promotion

  const form = useForm<PromotionFormValues>({ defaultValues: defaultValuesFor(promotion) })
  const discountType = form.watch("discountType")

  useEffect(() => {
    if (open) form.reset(defaultValuesFor(promotion))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, promotion])

  function onSubmit(values: PromotionFormValues) {
    if (isEditing) {
      updatePromotion.mutate(
        {
          name: values.name,
          description: values.description || undefined,
          minimumPurchase: values.minimumPurchase || undefined,
          maximumDiscountAmount: values.maximumDiscountAmount || undefined,
          endDate: values.endDate || undefined,
          usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
          status: values.isActive ? "ACTIVE" : "INACTIVE",
        },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }
    createPromotion.mutate(
      {
        code: values.code,
        name: values.name,
        description: values.description || undefined,
        discountType: values.discountType,
        discountValue: values.discountValue,
        minimumPurchase: values.minimumPurchase || undefined,
        maximumDiscountAmount: values.maximumDiscountAmount || undefined,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  const isPending = createPromotion.isPending || updatePromotion.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={buildNativeScrollbarClassName("max-h-[90vh]")}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Promotion" : "New Promotion"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                rules={{ required: "Code is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SUMMER10" className="font-mono" disabled={isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Summer Sale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                rules={{ required: "Discount value is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{discountType === "PERCENTAGE" ? "Discount %" : "Discount Amount"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={discountType === "PERCENTAGE" ? 100 : undefined}
                        disabled={isEditing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="minimumPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Purchase</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maximumDiscountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Discount Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} placeholder="No limit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min={1} placeholder="Unlimited" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
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
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEditing ? "Save Changes" : "Create Promotion"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
