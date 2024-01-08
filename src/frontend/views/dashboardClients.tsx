import { useCallback, useEffect, useState } from 'react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash, KeyRound, Eye, EyeOff } from 'lucide-react'

import useAuth from '../hooks/useAuth'

export default function DashboardClients() {
  const { token } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [tokens, setTokens] = useState<Token[]>([])

  const deleteClient = (id: number) => {
    window
      .fetch(`/api/v1/client/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        const token_o = tokens.find((token) => token.client === id)
        window
          .fetch(`/api/v1/auth/token/${token_o?.secret}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            updateClients()
            updateTokens()
          })
      })
  }

  const updateClients = useCallback(() => {
    window
      .fetch('/api/v1/client', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.json())
      .then((data) => setClients(data.clients))
  }, [token])

  const updateTokens = useCallback(() => {
    window
      .fetch('/api/v1/auth/token', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.json())
      .then((data) => setTokens(data.tokens))
  }, [token])

  useEffect(() => {
    updateClients()
    updateTokens()
  }, [updateClients, updateTokens])

  function generateToken(client: number) {
    window
      .fetch('/api/v1/auth/token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
        }),
      })
      .then((res) => {
        if (res.ok) {
          updateTokens()
        } else {
          alert('Failed to generate token')
        }
      })
  }

  return (
    <>
      <DialogNewClient callback={() => updateClients()} />
      <Table className="mt-2">
        <TableCaption>A list of your clients</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const token = tokens.find((token) => token.client === client.id)
            return (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>
                  {token ? (
                    <PasswordField value={token.secret} />
                  ) : (
                    <Button
                      onClick={() => generateToken(client.id)}
                      variant="outline"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this client?')
                      ) {
                        deleteClient(client.id)
                      }
                    }}
                    size="icon"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}

function DialogNewClient(props: { callback: () => void }) {
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    window
      .fetch('/api/v1/client', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: e.currentTarget.nameInput.value,
        }),
      })
      .then((res) => {
        if (res.ok) {
          setIsOpen(false)
          props.callback()
        } else {
          alert('Failed to create client')
        }
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new Client</DialogTitle>
            <DialogDescription>
              You have to place a client behind your NAT so that you can tunnel
              your traffic through it.
            </DialogDescription>
          </DialogHeader>

          <Input id="nameInput" placeholder="Name" className="my-4" autoFocus />

          <DialogFooter>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PasswordField(props: { value: string }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type={isVisible ? 'text' : 'password'}
        value={props.value}
        readOnly
      />
      <Button
        variant="outline"
        onClick={() => setIsVisible(!isVisible)}
        size="icon"
      >
        {isVisible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
