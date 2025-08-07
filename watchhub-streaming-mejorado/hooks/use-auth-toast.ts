"use client"

import { useToast } from "@/components/ui/toast-custom"
import { useAuthRedirect } from "@/hooks/use-auth-protection"

export function useAuthToast() {
  const { showToast } = useToast()
  const { redirectToLogin } = useAuthRedirect()

  const showAuthRequiredToast = (action: string = "realizar esta acción") => {
    showToast(`Debes iniciar sesión para ${action}`, "error")
    // Pequeño delay para que el usuario vea el toast antes de redirigir
    setTimeout(() => {
      redirectToLogin()
    }, 1500)
  }

  return { showAuthRequiredToast }
}
