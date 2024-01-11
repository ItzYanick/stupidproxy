import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

import { AuthProvider } from './context/AuthContext'

import Base from './views/base'
import Login from './views/login'
import DashboardLayout from './views/dashboardLayout'
import DashboardIndex from './views/dashboardIndex'
import DashboardTunnels from './views/dashboardTunnels'
import DashboardClients from './views/dashboardClients'
import DashboardSettings from './views/dashboardSettings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Base />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <DashboardIndex />,
      },
      {
        path: 'tunnels',
        element: <DashboardTunnels />,
      },
      {
        path: 'clients',
        element: <DashboardClients />,
      },
      {
        path: 'settings',
        element: <DashboardSettings />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
