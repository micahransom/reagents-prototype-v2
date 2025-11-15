import { Suspense } from 'react'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

