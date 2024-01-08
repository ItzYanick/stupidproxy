import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import useAuth from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { isLoggedIn, login } = useAuth()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const username = e.currentTarget.username.value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const password = e.currentTarget.password.value

    const res: Response = await window.fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      const data = await res.json()
      login(data.token)
    } else {
      alert('Login failed')
    }
  }

  useEffect(() => {
    document.title = 'stupidproxy - Login'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard')
    }
  }, [isLoggedIn, navigate])

  return (
    <div className="h-screen grid content-center place-content-center">
      <Card className="w-96">
        <CardHeader>
          <img src="/icon_white.svg" alt="Logo" className="w-16 h-16 mx-auto" />
        </CardHeader>
        <hr />
        <CardContent className="mt-4">
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Username"
              id="username"
              className="mb-2"
              autoFocus
            />
            <Input
              type="password"
              placeholder="Password"
              id="password"
              className="mb-2"
            />
            <Button>Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
