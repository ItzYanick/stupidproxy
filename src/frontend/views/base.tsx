import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuth from '../hooks/useAuth'

export default function Base() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  return <></>
}
