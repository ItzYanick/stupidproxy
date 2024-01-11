import path from 'node:path'
import { unlinkSync } from 'node:fs'

import db from '../db'

import * as ratholeConfig from '../config-generator/rathole'
import * as caddyConfig from '../config-generator/caddy'

const binFolderPath = path.join('.', '_bin')
const ratholeBinPath = path.join(binFolderPath, 'rathole')

const configFolderPath = path.join('/tmp', 'stupidproxy')
const ratholeConfigPath = path.join(configFolderPath, 'rathole.toml')
const caddyConfigPath = path.join(configFolderPath, 'Caddyfile')

export const checkForRathole = (): Promise<boolean> => {
  return Bun.file(ratholeBinPath).exists()
}

export const checkForCaddy = (): Promise<boolean> => {
  return Bun.file(path.join(binFolderPath, 'caddy')).exists()
}

export const generateAndSaveServerConfig = (init: boolean = false): void => {
  const tunnels = db.tunnels.findAll()
  Bun.write(ratholeConfigPath, ratholeConfig.generateServerConfig(tunnels))
  Bun.write(caddyConfigPath, caddyConfig.generateServerConfig(tunnels))
  if (!init) {
    reloadCaddy()
  }
}

export const checkRunningRathole = (): Promise<boolean> => {
  return Bun.file(path.join(configFolderPath, 'pid_rathole')).exists()
}

export const checkRunningCaddy = (): Promise<boolean> => {
  return Bun.file(path.join(configFolderPath, 'pid_caddy')).exists()
}

export const runRathole = (): void => {
  checkRunningRathole().then((running) => {
    if (running) {
      console.log('Rathole already running')
      return
    }
    const proc = Bun.spawn([ratholeBinPath, '--server', ratholeConfigPath], {
      onExit: () => {
        console.log('Rathole exited')
        cleanup()
      },
      stdout: 'inherit',
      stderr: 'inherit',
    })
    // write pid to file
    Bun.write(path.join(configFolderPath, 'pid_rathole'), proc.pid.toString())
    console.log('Rathole started')
  })
}

export const runCaddy = (): void => {
  checkRunningCaddy().then((running) => {
    if (running) {
      console.log('Caddy already running')
      return
    }
    const proc = Bun.spawn(
      [path.join(binFolderPath, 'caddy'), 'run', '-c', caddyConfigPath],
      {
        onExit: () => {
          console.log('Caddy exited')
          cleanup()
        },
        stdout: 'inherit',
        stderr: 'inherit',
      }
    )
    // write pid to file
    Bun.write(path.join(configFolderPath, 'pid_caddy'), proc.pid.toString())
    console.log('Caddy started')
  })
}

export const reloadCaddy = (): void => {
  checkRunningCaddy().then((running) => {
    if (!running) {
      console.log('Caddy not running')
      return
    }
    Bun.spawn(
      [path.join(binFolderPath, 'caddy'), 'reload', '-c', caddyConfigPath],
      {
        stdout: 'inherit',
        stderr: 'inherit',
      }
    )
    console.log('Caddy reloaded')
  })
}

const cleanup = (): void => {
  checkRunningRathole()
    .then((running) => {
      console.log('Cleaning up...')
      if (!running) {
        return
      }
      unlinkSync(path.join(configFolderPath, 'pid_rathole'))
      console.log('Rathole stopped')
    })
    .then(() => {
      return checkRunningCaddy()
    })
    .then((running) => {
      if (!running) {
        return
      }
      unlinkSync(path.join(configFolderPath, 'pid_caddy'))
      console.log('Caddy stopped')
    })
    .then(() => {
      console.log('Exiting...')
      process.exit(0)
    })
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('SIGTERM', cleanup)
process.on('uncaughtException', cleanup)
