import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LogOut } from 'lucide-react'

import useAuth from '../hooks/useAuth'

export default function DashboardSettings() {
  const { token, logout } = useAuth()

  function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const oldPassword = e.currentTarget.oldPassword.value
    const newPassword = e.currentTarget.newPassword.value
    window
      .fetch('/api/v1/auth/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      .then((res) => {
        if (res.ok) {
          alert('Password changed')
        } else {
          alert('Password change failed')
        }
      })
  }
  return (
    <>
      <Card className="mb-4">
        <form onSubmit={handleChangePassword}>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Current Password"
              type="password"
              name="oldPassword"
              className="mb-4"
            />
            <Input
              placeholder="New Password"
              type="password"
              name="newPassword"
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Change Password</Button>
          </CardFooter>
        </form>
      </Card>
      <Button variant="destructive" onClick={() => logout()}>
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </>
  )
}
