import { Request, Response } from 'express'

import { generateClientConfig } from '../config-generator/rathole'

export const generate = (req: Request, res: Response) => {
  res.send(generateClientConfig(req.user.client))
}
