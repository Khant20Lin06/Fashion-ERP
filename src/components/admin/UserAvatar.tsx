import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type UserAvatarProps = {
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

/** Admin user avatar with photo or initials fallback — used across the User Management table and profile. */
export function UserAvatar({ name, photoUrl, size = "default" }: UserAvatarProps) {
  return (
    <Avatar size={size}>
      {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
