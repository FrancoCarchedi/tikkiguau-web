
import { AuthForm } from './components/auth-form'

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-xl bg-slate-900 px-4 py-2 text-xl font-bold tracking-tight text-white">
            TikkiGuau
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Ingresá tus credenciales para continuar
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <AuthForm />
        </div>
      </div>
    </main>
  )
}
