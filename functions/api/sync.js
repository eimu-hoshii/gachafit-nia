/**
 * Cloudflare Pages Functions - KV同期エンドポイント (/api/sync)
 * Cloudflareダッシュボードで KV Namespace を作成し、変数名「GACHAFIT_KV」としてバインドすると動作します。
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const syncKey = request.headers.get('X-Sync-Key');

  if (!syncKey || syncKey.length < 4) {
    return new Response(JSON.stringify({ error: 'Invalid X-Sync-Key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!env.GACHAFIT_KV) {
    return new Response(
      JSON.stringify({ error: 'KV Namespace GACHAFIT_KV is not bound' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const raw = await env.GACHAFIT_KV.get(`user_${syncKey}`);
  if (!raw) {
    return new Response(JSON.stringify({ history: {}, customExercises: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(raw, {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const syncKey = request.headers.get('X-Sync-Key');

  if (!syncKey || syncKey.length < 4) {
    return new Response(JSON.stringify({ error: 'Invalid X-Sync-Key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!env.GACHAFIT_KV) {
    return new Response(
      JSON.stringify({ error: 'KV Namespace GACHAFIT_KV is not bound' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const bodyText = await request.text();
  await env.GACHAFIT_KV.put(`user_${syncKey}`, bodyText);

  return new Response(
    JSON.stringify({ ok: true, updatedAt: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
