"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchNotifications, markNotificationRead } from "../api/notifications.api"

const QUERY_KEY = ["notifications"]

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// Real backend has no bulk "mark all read" endpoint — only
// PATCH /notifications/:id/read, one at a time (same gap already
// documented in Phase 10's admin Notification Center).
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
