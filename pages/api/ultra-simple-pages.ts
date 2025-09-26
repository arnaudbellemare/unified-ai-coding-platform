import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: 'Ultra simple pages API working!',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
  })
}
