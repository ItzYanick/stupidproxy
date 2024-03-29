import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

import useAuth from '../hooks/useAuth'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  return (
    <>
      <div className="w-1/2 mx-auto my-2">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/dashboard">
                <img src="/icon_white.svg" className="h-8 mx-4" />
              </Link>
            </NavigationMenuItem>
            <Item to="/dashboard" name="Dashboard" />
            <Item to="/dashboard/tunnels" name="Tunnels" />
            <Item to="/dashboard/clients" name="Clients" />
            <Item to="/dashboard/settings" name="Settings" />
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <hr />
      <div className="w-1/2 mx-auto my-2">
        <Outlet />
      </div>
    </>
  )
}

function Item(props: { to: string; name: string }) {
  const location = useLocation()
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        className={navigationMenuTriggerStyle()}
        active={location.pathname === props.to}
        asChild
      >
        <Link to={props.to}>{props.name}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}
