import path from 'node:path'
import { unlinkSync } from 'node:fs'

import decompress from 'decompress'

import db from '../db'
import { generateServerConfig } from '../config-generator/rathole'

const ratholeFolderPath = path.join('.', '_rathole')
const ratholePath = path.join(ratholeFolderPath, 'rathole')

const version = 'v0.5.0'

const apiUrl = 'https://api.github.com/repos/rapiz1/rathole'

export const checkForRathole = (): Promise<boolean> => {
  return Bun.file(ratholePath).exists()
}

export const checkLatestRelease = async (): Promise<boolean> => {
  const response = await fetch(`${apiUrl}/releases/latest`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await response.json()
  return json.tag_name === version
}

export const downloadRathole = async (): Promise<void> => {
  console.log('Downloading rathole...')

  //download
  const zipPath = path.join(ratholeFolderPath, 'rathole.zip')
  const res = await fetch(
    `https://github.com/rapiz1/rathole/releases/download/${version}/rathole-x86_64-unknown-linux-gnu.zip`
  )
  Bun.write(zipPath, await res.arrayBuffer())

  //extract
  await decompress(zipPath, ratholeFolderPath)

  // delete zip
  unlinkSync(zipPath)
}

export const generateConfig = (): void => {
  const tunnels = db.tunnels.findAll()
  const config = generateServerConfig(tunnels)
  Bun.write(path.join(ratholeFolderPath, 'config.toml'), config)
}

export const checkRunningRathole = (): Promise<boolean> => {
  return Bun.file(path.join(ratholeFolderPath, 'pid')).exists()
}

export const runRathole = (): void => {
  checkRunningRathole().then((running) => {
    if (running) {
      console.log('Rathole already running')
      return
    }
    const proc = Bun.spawn(
      [ratholePath, '--server', path.join(ratholeFolderPath, 'config.toml')],
      {
        onExit: () => {
          cleanup()
        },
        stdout: 'inherit',
        stderr: 'inherit',
      }
    )
    // write pid to file
    Bun.write(path.join(ratholeFolderPath, 'pid'), proc.pid.toString())
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
      unlinkSync(path.join(ratholeFolderPath, 'pid'))
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
