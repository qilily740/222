const COOKIE_NAME = '__Host-iris222';
const SESSION_SECONDS = 60 * 60 * 24 * 3650;

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers: {
    'cache-control': 'no-store, no-cache, must-revalidate',
    'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'content-type': 'text/html; charset=utf-8',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    ...headers,
  }});
}

function loginPage(message = '') {
  const error = message ? `<p class="error" role="alert">${message}</p>` : '';
  return response(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Iris · 验证</title><style>
*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;background:#f6f5f3;color:#282623;font:16px/1.5 system-ui,-apple-system,"PingFang SC",sans-serif}.card{width:min(100%,360px);padding:32px 26px;border:1px solid #e8e5e1;border-radius:20px;background:#fff;box-shadow:0 12px 36px #312b2010}h1{margin:0 0 8px;font-size:24px;font-weight:500}p{margin:0 0 22px;color:#777}.error{margin:12px 0 0;color:#a43f3f;font-size:14px}input,button{width:100%;height:48px;border-radius:12px;font:inherit}input{border:1px solid #d8d4ce;padding:0 14px;outline:none}input:focus{border-color:#928677}button{margin-top:14px;border:0;background:#393632;color:white;cursor:pointer}button:disabled{opacity:.65}.status{min-height:1.4em;margin-top:12px;color:#a43f3f;font-size:14px}
</style><main class="card"><h1>Iris</h1><p>请输入访问密码</p><form id="unlock"><input name="password" type="password" inputmode="numeric" autocomplete="current-password" aria-label="访问密码" required autofocus><button>进入</button><div class="status" role="status">${error}</div></form></main><script>
const form=document.querySelector('#unlock'),field=form.elements.password,status=form.querySelector('.status'),button=form.querySelector('button');form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;status.textContent='正在验证…';try{const body=new URLSearchParams({password:field.value}),result=await fetch('/__iris222/login',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body,credentials:'same-origin',cache:'no-store'});if(result.ok){location.replace('/');return}status.textContent=result.status===429?'尝试次数过多，请稍后再试。':'密码不正确，请重试。';field.value='';field.focus()}catch{status.textContent='验证服务暂时不可用，请检查网络后重试。'}finally{button.disabled=false}});
</script></html>`);
}

function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function fromBase64Url(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

async function signature(expiresAt, keyText) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(keyText), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`iris-222:${expiresAt}`)));
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function authorized(request, env) {
  const cookies = request.headers.get('cookie') || '';
  const encoded = new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`).exec(cookies)?.[1] || '';
  const [expiresAt, supplied] = encoded.split('.');
  if (!/^\d{10,13}$/.test(expiresAt || '') || !supplied || Number(expiresAt) <= Date.now() || !env.IRIS_222_SIGNING_KEY) return false;
  try {
    const expected = await signature(expiresAt, env.IRIS_222_SIGNING_KEY);
    return equalBytes(fromBase64Url(supplied), fromBase64Url(expected));
  } catch { return false; }
}

async function login(request, env) {
  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
  if (!env.IRIS_222_PASSWORD || !env.IRIS_222_SIGNING_KEY) return new Response('Authentication is not configured', { status: 503, headers: { 'cache-control': 'no-store' } });
  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  const rate = await env.LOGIN_RATE_LIMITER.limit({ key: clientIp });
  if (!rate.success) return new Response('Too many attempts', { status: 429, headers: { 'cache-control': 'no-store', 'retry-after': '60' } });
  const form = await request.formData().catch(() => null);
  const submitted = String(form?.get('password') || '').slice(0, 256);
  const [expectedHash, submittedHash] = await Promise.all([env.IRIS_222_PASSWORD, submitted].map(value => crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
  if (!equalBytes(new Uint8Array(expectedHash), new Uint8Array(submittedHash))) return new Response('Incorrect password', { status: 401, headers: { 'cache-control': 'no-store' } });
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const token = `${expiresAt}.${await signature(expiresAt, env.IRIS_222_SIGNING_KEY)}`;
  return new Response(null, { status: 204, headers: {
    'cache-control': 'no-store',
    'set-cookie': `${COOKIE_NAME}=${token}; Max-Age=${SESSION_SECONDS}; Path=/; Secure; HttpOnly; SameSite=Lax`,
  }});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/__iris222/login') {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST', 'cache-control': 'no-store' } });
      return login(request, env);
    }
    if (url.pathname === '/__iris222/logout') {
      return new Response(null, { status: 303, headers: {
        location: '/', 'cache-control': 'no-store',
        'set-cookie': `${COOKIE_NAME}=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax`,
      }});
    }
    if (!await authorized(request, env)) {
      const acceptsHtml = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
      return acceptsHtml ? loginPage() : new Response('Authentication required', { status: 401, headers: { 'cache-control': 'no-store' } });
    }
    const upstream = await fetch(request);
    const headers = new Headers(upstream.headers);
    if (url.pathname === '/' || url.pathname.endsWith('.html')) headers.set('cache-control', 'private, no-store');
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
  },
};
