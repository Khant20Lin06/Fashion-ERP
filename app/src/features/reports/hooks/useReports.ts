import { useQuery } from "@tanstack/react-query"
import {
  fetchCategorySales,
  fetchPaymentMethodSales,
  fetchSalesDetailRows,
  fetchSalesMetrics,
  fetchSalesRevenueTrend,
} from "../api/sales-report.api"
import {
  fetchInventoryAging,
  fetchInventoryMetrics,
  fetchInventoryReportRows,
  fetchStockDistribution,
  fetchStockMovementTrend,
} from "../api/inventory-report.api"
import {
  fetchCostChangeAnalysis,
  fetchPurchaseReportMetrics,
  fetchPurchaseTrend,
  fetchSupplierComparison,
  fetchSupplierPerformanceRows,
} from "../api/purchase-report.api"
import {
  fetchColorAnalysis,
  fetchCustomerGrowth,
  fetchCustomerInsightMetrics,
  fetchCustomerSegments,
  fetchProductPerformanceMetrics,
  fetchProductRankings,
  fetchPurchaseFrequency,
  fetchSizeAnalysis,
  fetchSpendingDistribution,
} from "../api/customer-report.api"
import {
  fetchExpenseBreakdown,
  fetchFinancialOverview,
  fetchMarginAnalysis,
  fetchProfitTrend,
} from "../api/finance-report.api"
import type { Granularity } from "../types"

// --- Sales Reports ---

export function useSalesMetrics() {
  return useQuery({ queryKey: ["reports", "sales", "metrics"], queryFn: fetchSalesMetrics })
}

export function useSalesRevenueTrend(granularity: Granularity) {
  return useQuery({
    queryKey: ["reports", "sales", "revenue-trend", granularity],
    queryFn: () => fetchSalesRevenueTrend(granularity),
  })
}

export function useCategorySales() {
  return useQuery({ queryKey: ["reports", "sales", "by-category"], queryFn: fetchCategorySales })
}

export function usePaymentMethodSales() {
  return useQuery({ queryKey: ["reports", "sales", "by-payment-method"], queryFn: fetchPaymentMethodSales })
}

export function useSalesDetailRows() {
  return useQuery({ queryKey: ["reports", "sales", "detail"], queryFn: fetchSalesDetailRows })
}

// --- Inventory Reports ---

export function useInventoryMetrics() {
  return useQuery({ queryKey: ["reports", "inventory", "metrics"], queryFn: fetchInventoryMetrics })
}

export function useStockDistribution(dimension: "warehouse" | "category" | "brand") {
  return useQuery({
    queryKey: ["reports", "inventory", "distribution", dimension],
    queryFn: () => fetchStockDistribution(dimension),
  })
}

export function useStockMovementTrend() {
  return useQuery({ queryKey: ["reports", "inventory", "movement-trend"], queryFn: fetchStockMovementTrend })
}

export function useInventoryAging() {
  return useQuery({ queryKey: ["reports", "inventory", "aging"], queryFn: fetchInventoryAging })
}

export function useInventoryReportRows() {
  return useQuery({ queryKey: ["reports", "inventory", "detail"], queryFn: fetchInventoryReportRows })
}

// --- Purchase Reports ---

export function usePurchaseReportMetrics() {
  return useQuery({ queryKey: ["reports", "purchase", "metrics"], queryFn: fetchPurchaseReportMetrics })
}

export function useSupplierPerformanceRows() {
  return useQuery({ queryKey: ["reports", "purchase", "supplier-performance"], queryFn: fetchSupplierPerformanceRows })
}

export function usePurchaseTrend() {
  return useQuery({ queryKey: ["reports", "purchase", "trend"], queryFn: fetchPurchaseTrend })
}

export function useSupplierComparison() {
  return useQuery({ queryKey: ["reports", "purchase", "supplier-comparison"], queryFn: fetchSupplierComparison })
}

export function useCostChangeAnalysis() {
  return useQuery({ queryKey: ["reports", "purchase", "cost-change"], queryFn: fetchCostChangeAnalysis })
}

// --- Customer Reports ---

export function useCustomerInsightMetrics() {
  return useQuery({ queryKey: ["reports", "customer", "metrics"], queryFn: fetchCustomerInsightMetrics })
}

export function useCustomerSegments() {
  return useQuery({ queryKey: ["reports", "customer", "segments"], queryFn: fetchCustomerSegments })
}

export function useCustomerGrowth() {
  return useQuery({ queryKey: ["reports", "customer", "growth"], queryFn: fetchCustomerGrowth })
}

export function usePurchaseFrequency() {
  return useQuery({ queryKey: ["reports", "customer", "purchase-frequency"], queryFn: fetchPurchaseFrequency })
}

export function useSpendingDistribution() {
  return useQuery({ queryKey: ["reports", "customer", "spending-distribution"], queryFn: fetchSpendingDistribution })
}

// --- Product Reports ---

export function useProductPerformanceMetrics() {
  return useQuery({ queryKey: ["reports", "products", "metrics"], queryFn: fetchProductPerformanceMetrics })
}

export function useProductRankings() {
  return useQuery({ queryKey: ["reports", "products", "rankings"], queryFn: fetchProductRankings })
}

export function useSizeAnalysis() {
  return useQuery({ queryKey: ["reports", "products", "size-analysis"], queryFn: fetchSizeAnalysis })
}

export function useColorAnalysis() {
  return useQuery({ queryKey: ["reports", "products", "color-analysis"], queryFn: fetchColorAnalysis })
}

// --- Financial Reports ---

export function useFinancialOverview() {
  return useQuery({ queryKey: ["reports", "finance", "overview"], queryFn: fetchFinancialOverview })
}

export function useProfitTrend() {
  return useQuery({ queryKey: ["reports", "finance", "profit-trend"], queryFn: fetchProfitTrend })
}

export function useExpenseBreakdown() {
  return useQuery({ queryKey: ["reports", "finance", "expense-breakdown"], queryFn: fetchExpenseBreakdown })
}

export function useMarginAnalysis() {
  return useQuery({ queryKey: ["reports", "finance", "margin-analysis"], queryFn: fetchMarginAnalysis })
}
