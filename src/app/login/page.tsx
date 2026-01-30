'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { useAuth, useUser } from '@/firebase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { BookOpenCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && user) {
      router.push('/dashboard')
    }
  }, [isMounted, user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase auth is not initialized.',
      })
      return
    }

    const loginEmail =
      email.includes('@') ? email : `${email}@example.com`
    setIsLoading(true)

    try {
      await createUserWithEmailAndPassword(auth, loginEmail, password)
      toast({
        title: 'Account Created & Logged In',
        description: 'Redirecting to your dashboard...',
      })
      router.push('/dashboard')
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, loginEmail, password)
          toast({
            title: 'Login Successful',
            description: 'Redirecting to your dashboard...',
          })
          router.push('/dashboard')
        } catch (signInError: any) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Incorrect password. Please check and try again.',
          })
        }
      } else if (error.code === 'auth/weak-password') {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description:
            'The password is too weak. It must be at least 6 characters long.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: error.message,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted || isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return null // Avoid rendering the login page while redirecting
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpenCheck className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-headline">
            VidyaVerse Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
