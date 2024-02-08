import type { APIRoute } from "astro"

export const GET: APIRoute = (c) => {
  return new Response('a')
}