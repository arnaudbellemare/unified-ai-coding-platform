export async function GET() {
  return Response.json({ 
    message: 'Ultra simple API working!',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV
  })
}
