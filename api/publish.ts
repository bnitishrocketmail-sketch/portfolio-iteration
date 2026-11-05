/* /api/publish (5 Nov) — the Controls tab's Publish button (Controls04.tsx) posts both modes' values, where they differ from
   the code's defaults, with Nitish's publish password. This checks the password against PUBLISH_KEY, then writes them to
   src/lab/04-profile/published.json on main through GitHub's contents API with GITHUB_TOKEN (a fine-grained token for this
   one repo, contents read and write). Both live only in the Vercel project's environment variables. The commit sets off
   the usual Vercel build, and the values come out baked into the site (tokens.ts). Same values as the file already has →
   no commit, so an idle press costs nothing. Runs as a Vercel Function on the Node runtime (Web handler). */
import { createHash, timingSafeEqual } from 'node:crypto';

const REPO = 'bnitishrocketmail-sketch/portfolio-iteration', FILE = 'src/lab/04-profile/published.json', BRANCH = 'main';
type Values = Record<string, string>;
type Published = { at: string | null; dark: Values; light: Values };

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest();
/* a mode's values: custom-property names to short strings, at most 400 of them, sorted so the file and the comparison are stable */
function clean(v: unknown): Values | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out: Values = {};
  const entries = Object.entries(v as Record<string, unknown>);
  if (entries.length > 400) return null;
  for (const [k, val] of entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!/^--[a-z0-9-]{1,60}$/i.test(k) || typeof val !== 'string' || val.length > 120) return null;
    out[k] = val;
  }
  return out;
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.PUBLISH_KEY, token = process.env.GITHUB_TOKEN;
  if (!key || !token) return json(503, { error: 'Publishing isn’t set up yet: PUBLISH_KEY and GITHUB_TOKEN are needed in the Vercel project’s environment variables.' });
  let body: { key?: unknown; dark?: unknown; light?: unknown };
  try { body = (await request.json()) as typeof body; } catch { return json(400, { error: 'The request wasn’t JSON.' }); }
  if (typeof body?.key !== 'string' || !timingSafeEqual(digest(body.key), digest(key))) return json(401, { error: 'Wrong password.' });
  const dark = clean(body.dark), light = clean(body.light);
  if (!dark || !light) return json(400, { error: 'The values didn’t look like control values.' });

  const gh = (query: string, init: RequestInit = {}) => fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}${query}`, {
    ...init, headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'imakeuimove-publish', ...(init.headers ?? {}) },
  });
  const cur = await gh(`?ref=${BRANCH}`);
  if (!cur.ok) return json(502, { error: `GitHub wouldn’t read the file (${cur.status}) — check that the token can read this repo’s contents.` });
  const file = (await cur.json()) as { sha: string; content: string };
  let prev: Published | null = null;
  try { prev = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')); } catch { /* a fresh file, then */ }
  if (prev && JSON.stringify(clean(prev.dark)) === JSON.stringify(dark) && JSON.stringify(clean(prev.light)) === JSON.stringify(light)) return json(200, { ok: true, unchanged: true, at: prev.at });

  const next: Published = { at: new Date().toISOString(), dark, light };
  const nd = Object.keys(dark).length, nl = Object.keys(light).length;
  const put = await gh('', {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: `Published from the site: ${nd} dark, ${nl} light value${nd + nl === 1 ? '' : 's'} set off the code’s defaults`, content: Buffer.from(JSON.stringify(next, null, 2) + '\n', 'utf8').toString('base64'), sha: file.sha, branch: BRANCH }),
  });
  if (!put.ok) return json(502, { error: put.status === 409 ? 'The file changed under us — try once more.' : `GitHub wouldn’t write the file (${put.status}) — check that the token can write this repo’s contents.` });
  const res = (await put.json()) as { commit: { sha: string; html_url: string } };
  return json(200, { ok: true, sha: res.commit.sha.slice(0, 7), url: res.commit.html_url, at: next.at });
}

export function GET(): Response { return json(405, { error: 'POST only.' }); }
