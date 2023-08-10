export async function get({ params, request }) {
  return Response.redirect('/notes/' + crypto.randomUUID(), 302);
}
