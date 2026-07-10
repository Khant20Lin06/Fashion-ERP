"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchNotifications } from "../api/notifications.api"
import type { Notification } from "../types"

const QUERY_KEY = ["notifications"]

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

/** Optimistically marks notifications as read in the query cache (no backend mutation yet). */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()

  function markRead(ids: string[]) {
    queryClient.setQueryData<Notification[]>(QUERY_KEY, (current) =>
      current?.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
    )
  }

  function markAllRead() {
    queryClient.setQueryData<Notification[]>(QUERY_KEY, (current) =>
      current?.map((n) => ({ ...n, isRead: true }))
    )
  }

  return { markRead, markAllRead }
}
