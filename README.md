# stupidproxy

A simple reverse proxy server that can be used to bypass NAT or firewalls.
A client (behind NAT) connects to a server (public IP) and the server forwards the traffic to the client.

It is using [rathole](https://github.com/rapiz1/rathole) for the NAT traversal and [caddy](https://caddyserver.com/) as a http/https reverse proxy.

A similar software is [boringproxy](https://boringproxy.io/) but it can't forward udp traffic that is why I created this.

## Usage

Instructions will be added soon.

## Credits

- [rathole](https://github.com/rapiz1/rathole) for the NAT traversal
- [caddy](https://caddyserver.com/) for the http/https reverse proxy
- [boringproxy](https://boringproxy.io/) for the inspiration
- [shadcn/ui](https://ui.shadcn.com/) for the web components
- [Lucide](https://lucide.dev/) for the icons
- [tailwindcss](https://tailwindcss.com/) for the css framework
- [vite](https://vitejs.dev/) for the build tool
- [bun](https://bun.dev) for this cool JavaScript runtime
