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

export const generateAndSaveServerConfig = (): void => {
  const tunnels = db.tunnels.findAll()
  Bun.write(ratholeConfigPath, ratholeConfig.generateServerConfig(tunnels))
  Bun.write(caddyConfigPath, caddyConfig.generateServerConfig(tunnels))
}

export const checkRunningRathole = (): Promise<boolean> => {
  return Bun.file(path.join(configFolderPath, 'pid_rathole')).exists()
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
      process.exit()
    })
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('uncaughtException', cleanup)
