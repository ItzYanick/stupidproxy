declare type IAuthContext = {
  token: string
  isLoggedIn: boolean
  login: (token: string) => void
  logout: () => void
}
