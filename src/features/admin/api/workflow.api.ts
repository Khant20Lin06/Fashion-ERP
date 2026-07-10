import { apiClient } from "@/lib/api/client"
import type { Workflow, WorkflowEdge, WorkflowNode, WorkflowStatus } from "../types"
import { mockWorkflows } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchWorkflows(): Promise<Workflow[]> {
  if (USE_MOCK) return delay(mockWorkflows)
  const { data } = await apiClient.get<Workflow[]>("/admin/workflows")
  return data
}

export async function fetchWorkflow(id: string): Promise<Workflow | undefined> {
  if (USE_MOCK) return delay(mockWorkflows.find((w) => w.id === id))
  const { data } = await apiClient.get<Workflow>(`/admin/workflows/${id}`)
  return data
}

export async function saveWorkflow(
  id: string,
  values: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }
): Promise<Workflow> {
  if (USE_MOCK) {
    const existing = mockWorkflows.find((w) => w.id === id)
    if (!existing) throw new Error("Workflow not found")
    return delay({ ...existing, ...values, updatedAt: new Date().toISOString() })
  }
  const { data } = await apiClient.put<Workflow>(`/admin/workflows/${id}`, values)
  return data
}

export async function updateWorkflowStatus(id: string, status: WorkflowStatus): Promise<Workflow> {
  if (USE_MOCK) {
    const existing = mockWorkflows.find((w) => w.id === id)
    if (!existing) throw new Error("Workflow not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<Workflow>(`/admin/workflows/${id}/status`, { status })
  return data
}
