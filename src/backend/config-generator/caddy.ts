export const generateServerConfig = (tunnels: Tunnel[]): string => {
  let config = ''

  config += '{\n'
  if (process.env.CADDY_TESTING === 'true') {
    config +=
      '  acme_ca https://acme-staging-v02.api.letsencrypt.org/directory\n'
  }
  config += `  email ${process.env.CADDY_EMAIL}\n`
  config += '}\n'

  config += `${process.env.PUBLIC_DOMAIN} {\n`
  config += `  reverse_proxy localhost:${process.env.API_BIND}\n`
  config += '}\n'

  for (let i = 0; i < tunnels.length; i++) {
    const tunnel = tunnels[i]
    const isHTTP = tunnel.type === 'http' || tunnel.type === 'https'
    if (!isHTTP) continue

    config += `${tunnel.type}://${tunnel.hostname} {\n`
    config += `  reverse_proxy ${process.env.RATHOLE_BIND_HTTP}:${tunnel.port}\n`
    config += '}\n'
  }
  return config
}
