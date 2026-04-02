import { redirect } from "next/navigation"

import { auth, signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function LoginPage() {
  const session = await auth()
  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] p-4">
      <form
        action={async (formData) => {
          "use server"
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/",
          })
        }}
        className="w-full max-w-md space-y-4 rounded-xl border bg-background p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold">Jolene Sign In</h1>
          <p className="text-sm text-muted-foreground">Use HOD credentials to access dashboard.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue="hod@goip.local"
            required
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            defaultValue="password"
            required
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </div>
        <Button className="w-full">Sign In</Button>
      </form>
    </div>
  )
}
