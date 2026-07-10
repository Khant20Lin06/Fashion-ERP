import { LoginForm } from "@/features/auth"
import { BarChart3 } from "lucide-react"

export const metadata = {
  title: "Sign In · Fashion ERP/POS",
}

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left branding section */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="size-6" />
          Fashion ERP/POS
        </div>
        <div className="max-w-md space-y-3">
          <h1 className="text-3xl font-semibold text-balance">
            Run your entire retail operation from one platform.
          </h1>
          <p className="text-sm text-primary-foreground/80">
            Inventory, POS, purchasing, finance, and analytics — unified for
            fashion retailers, wholesalers, and franchise networks.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Fashion ERP/POS. All rights reserved.
        </p>
      </div>

      {/* Right login form section */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
