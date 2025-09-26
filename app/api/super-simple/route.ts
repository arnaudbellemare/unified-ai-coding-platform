export async function GET() {
  return new Response('Hello World - Updated', {
    headers: { 'Content-Type': 'text/plain' },
  })
}
