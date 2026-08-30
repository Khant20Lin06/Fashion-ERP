import type { GoodsReceipt, PurchaseInvoice, PurchaseOrder, PurchaseReturn } from "../types"

export type InvoiceWorkflowSnapshot = PurchaseInvoice & {
  orderStatus: PurchaseOrder["status"] | "missing_order"
  goodsReceiptCount: number
  orderedQuantity: number
  receivedQuantity: number
  rejectedQuantity: number
  returnedQuantity: number
  returnableQuantity: number
  supplierCreditAmount: number
  receiptCoveragePercent: number
  paymentReadiness:
    | "ready"
    | "awaiting_receipt"
    | "awaiting_posting"
    | "fully_paid"
    | "cancelled_order"
    | "voided_invoice"
    | "missing_order"
  paymentReadinessLabel: string
  paymentBlockedReason?: string
}

export type ReturnableOrderLine = {
  purchaseOrderItemId: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  unitCost: number
  receivedQty: number
  returnedQty: number
  availableQty: number
}

function sumReceiptLines(receipts: GoodsReceipt[]) {
  return receipts.reduce(
    (totals, receipt) => {
      for (const item of receipt.items) {
        totals.received += item.receivedQty
        totals.rejected += item.rejectedQty
      }
      return totals
    },
    { received: 0, rejected: 0 },
  )
}

function getReceiptsForInvoice(invoice: PurchaseInvoice, receipts: GoodsReceipt[]) {
  if (invoice.goodsReceiptIds.length > 0) {
    const receiptIdSet = new Set(invoice.goodsReceiptIds)
    return receipts.filter((receipt) => receiptIdSet.has(receipt.id))
  }

  return receipts.filter((receipt) => receipt.purchaseOrderId === invoice.purchaseOrderId)
}

function getActiveReturnsForInvoice(invoiceId: string, returns: PurchaseReturn[]) {
  return returns.filter((entry) => entry.purchaseInvoiceId === invoiceId && entry.status !== "cancelled")
}

export function buildInvoiceWorkflowSnapshots(
  invoices: PurchaseInvoice[],
  orders: PurchaseOrder[],
  receipts: GoodsReceipt[],
  returns: PurchaseReturn[],
): InvoiceWorkflowSnapshot[] {
  return invoices.map((invoice) => {
    const order = orders.find((entry) => entry.id === invoice.purchaseOrderId)
    const linkedReceipts = getReceiptsForInvoice(invoice, receipts)
    const activeReturns = getActiveReturnsForInvoice(invoice.id, returns)
    const receiptTotals = sumReceiptLines(linkedReceipts)
    const orderedQuantity = order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
    const returnedQuantity = activeReturns.reduce(
      (sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const supplierCreditAmount = activeReturns.reduce((sum, entry) => sum + entry.supplierCreditAmount, 0)
    const returnableQuantity = Math.max(0, receiptTotals.received - returnedQuantity)
    const receiptCoveragePercent =
      orderedQuantity > 0 ? Math.min(100, (receiptTotals.received / orderedQuantity) * 100) : linkedReceipts.length > 0 ? 100 : 0

    let paymentReadiness: InvoiceWorkflowSnapshot["paymentReadiness"] = "ready"
    let paymentReadinessLabel = "Ready to pay"
    let paymentBlockedReason: string | undefined

    if (!order) {
      paymentReadiness = "missing_order"
      paymentReadinessLabel = "Missing PO link"
      paymentBlockedReason = "This invoice is not linked to a purchase order."
    } else if (order.status === "cancelled") {
      paymentReadiness = "cancelled_order"
      paymentReadinessLabel = "Cancelled PO"
      paymentBlockedReason = "The source purchase order is cancelled."
    } else if (invoice.status === "voided") {
      paymentReadiness = "voided_invoice"
      paymentReadinessLabel = "Voided invoice"
      paymentBlockedReason = "This purchase invoice has been voided."
    } else if (invoice.status !== "posted") {
      paymentReadiness = "awaiting_posting"
      paymentReadinessLabel = "Awaiting posting"
      paymentBlockedReason = "Post the supplier invoice before paying it."
    } else if (invoice.balanceAmount <= 0) {
      paymentReadiness = "fully_paid"
      paymentReadinessLabel = "Fully settled"
      paymentBlockedReason = "This invoice has no remaining balance."
    } else if (linkedReceipts.length === 0 || receiptTotals.received <= 0) {
      paymentReadiness = "awaiting_receipt"
      paymentReadinessLabel = "Awaiting receipt match"
      paymentBlockedReason = "Record at least one goods receipt before paying this invoice."
    }

    return {
      ...invoice,
      orderStatus: order?.status ?? "missing_order",
      goodsReceiptCount: linkedReceipts.length,
      orderedQuantity,
      receivedQuantity: receiptTotals.received,
      rejectedQuantity: receiptTotals.rejected,
      returnedQuantity,
      returnableQuantity,
      supplierCreditAmount,
      receiptCoveragePercent,
      paymentReadiness,
      paymentReadinessLabel,
      paymentBlockedReason,
    }
  })
}

export function buildReturnableLinesForInvoice(
  invoice: PurchaseInvoice | undefined,
  orders: PurchaseOrder[],
  receipts: GoodsReceipt[],
  returns: PurchaseReturn[],
): ReturnableOrderLine[] {
  if (!invoice) return []

  const order = orders.find((entry) => entry.id === invoice.purchaseOrderId)
  if (!order) return []

  const linkedReceipts = getReceiptsForInvoice(invoice, receipts)
  const activeReturns = getActiveReturnsForInvoice(invoice.id, returns)
  const receiptTotalsByPoItem = new Map<string, number>()
  const returnTotalsByPoItem = new Map<string, number>()

  for (const receipt of linkedReceipts) {
    for (const item of receipt.items) {
      if (!item.purchaseOrderItemId) continue
      receiptTotalsByPoItem.set(
        item.purchaseOrderItemId,
        (receiptTotalsByPoItem.get(item.purchaseOrderItemId) ?? 0) + item.receivedQty,
      )
    }
  }

  for (const purchaseReturn of activeReturns) {
    for (const item of purchaseReturn.items) {
      returnTotalsByPoItem.set(
        item.purchaseOrderItemId,
        (returnTotalsByPoItem.get(item.purchaseOrderItemId) ?? 0) + item.quantity,
      )
    }
  }

  return order.items
    .map((item) => {
      const receivedQty = receiptTotalsByPoItem.get(item.id) ?? 0
      const returnedQty = returnTotalsByPoItem.get(item.id) ?? 0
      return {
        purchaseOrderItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        unitCost: item.unitCost,
        receivedQty,
        returnedQty,
        availableQty: Math.max(0, receivedQty - returnedQty),
      }
    })
    .filter((item) => item.availableQty > 0)
}
