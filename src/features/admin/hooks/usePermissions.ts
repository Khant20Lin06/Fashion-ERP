import { useQuery } from "@tanstack/react-query"
import { fetchPermissions } from "../api/permissions.api"

export function usePermissions() {
  return useQuery({ queryKey: ["admin", "permissions"], queryFn: fetchPermissions })
}
