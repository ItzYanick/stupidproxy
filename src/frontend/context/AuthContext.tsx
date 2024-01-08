import { createContext, useState } from 'react'

export const AuthContext = createContext<IAuthContext>({
  token: '',
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthProvider = (props: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('token') !== null
  )
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  const login = (jwtToken: string) => {
    setIsLoggedIn(true)
    setToken(jwtToken)
    localStorage.setItem('token', jwtToken)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setToken('')
    localStorage.removeItem('token')
  }

  const value = {
    isLoggedIn,
    token,
    login,
    logout,
  }

  return <AuthContext.Provider value={value} {...props} />
}
