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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash } from 'lucide-react'

import useAuth from '../hooks/useAuth'

export default function DashboardTunnels() {
  const { token } = useAuth()
  const [tunnels, setTunnels] = useState<Tunnel[]>([])
  const [clients, setClients] = useState<Client[]>([])

  function deleteTunnel(id: number) {
    window
      .fetch(`/api/v1/tunnel/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => updateTunnels())
  }

  const updateTunnels = useCallback(() => {
    window
      .fetch('/api/v1/tunnel', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.json())
      .then((data) => setTunnels(data.tunnels))
  }, [token])

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

  useEffect(() => {
    updateTunnels()
    updateClients()
  }, [updateTunnels, updateClients])

  // ToDo: replace 0.0.0.0 with public IP of server

  return (
    <>
      <DialogNewTunnel
        callback={() => {
          updateClients()
          updateTunnels()
        }}
        clients={clients}
      />
      <Table>
        <TableCaption>A list of your tunnels</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Public</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tunnels.map((tunnel) => {
            const publicAddr = `${tunnel.type}://${
              tunnel.type === 'http' || tunnel.type === 'https'
                ? tunnel.hostname
                : `0.0.0.0:${tunnel.port}`
            }`
            return (
              <TableRow key={tunnel.id}>
                <TableCell>{tunnel.description}</TableCell>
                <TableCell>{publicAddr}</TableCell>
                <TableCell>
                  {clients.find((client) => client.id === tunnel.client)
                    ?.name ?? 'unknown? - Please delete this tunnel'}
                </TableCell>
                <TableCell>{tunnel.target}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this tunnel?')
                      ) {
                        deleteTunnel(tunnel.id)
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

/*
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => alert('not implemented')}
                  >
                    Edit
                  </Button>
                  */

function DialogNewTunnel(props: { callback: () => void; clients: Client[] }) {
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [hostnameDisabled, setHostnameDisabled] = useState(true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const description = e.currentTarget.descriptionInp.value
    const client = parseInt(e.currentTarget.clientSel.value)
    const type = e.currentTarget.typeSel.value
    const hostname = hostnameDisabled
      ? 'none'
      : e.currentTarget.hostnameInp.value
    const target = e.currentTarget.targetInp.value

    if (!description || !client || !type || !target) {
      alert('Please fill out all fields')
      return
    }

    window
      .fetch('/api/v1/tunnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          client,
          type,
          hostname,
          target,
        }),
      })
      .then((res) => {
        if (res.ok) {
          setIsOpen(false)
          props.callback()
        } else {
          alert('Failed to create tunnel')
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
            <DialogTitle>Create a new Tunnel</DialogTitle>
            <DialogDescription>
              A tunnel allows you to expose a service running on your computer
              to the internet.
            </DialogDescription>
          </DialogHeader>

          <Input
            id="descriptionInp"
            placeholder="Description"
            className="my-4"
            autoFocus
          />
          <Select name="clientSel">
            <SelectTrigger className="my-4">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              {props.clients.map((client) => (
                <SelectItem key={client.id} value={String(client.id)}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            name="typeSel"
            onValueChange={(e) => {
              if (e === 'http' || e === 'https') {
                setHostnameDisabled(false)
              } else {
                setHostnameDisabled(true)
              }
            }}
          >
            <SelectTrigger className="my-4">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tcp">TCP</SelectItem>
              <SelectItem value="udp">UDP</SelectItem>
              <SelectItem value="http" disabled>
                HTTP
              </SelectItem>
              <SelectItem value="https" disabled>
                HTTPS
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            id="hostnameInp"
            placeholder="Hostname"
            className="my-4"
            disabled={hostnameDisabled}
          />
          <Input id="targetInp" placeholder="Target" className="my-4" />

          <DialogFooter>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
