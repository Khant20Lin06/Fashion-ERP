import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchWorkflow, fetchWorkflows, saveWorkflow, updateWorkflowStatus } from "../api/workflow.api"
import type { WorkflowEdge, WorkflowNode, WorkflowStatus } from "../types"

export function useWorkflows() {
  return useQuery({ queryKey: ["admin", "workflows"], queryFn: fetchWorkflows })
}

export function useWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "workflows", id],
    queryFn: () => fetchWorkflow(id as string),
    enabled: !!id,
  })
}

export function useSaveWorkflow(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => saveWorkflow(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workflows"] })
      toast.success("Workflow saved")
    },
    onError: () => toast.error("Failed to save workflow"),
  })
}

export function useUpdateWorkflowStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkflowStatus }) => updateWorkflowStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workflows"] })
      toast.success("Workflow status updated")
    },
    onError: () => toast.error("Failed to update workflow status"),
  })
}
