import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type EmployeeAvatarProps = {
  name: string
  photoUrl?: string
  size?: "sm" | "default" | "lg"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Employee avatar with photo or initials fallback — used across tables, cards, and profile headers. */
export function EmployeeAvatar({ name, photoUrl, size = "default" }: EmployeeAvatarProps) {
  return (
    <Avatar size={size}>
      {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
