# Bunny Edge Script — upload proxy

This script accepts file PUTs from the browser and forwards them to
Bunny Storage with the AccessKey header. The token verification means
only requests minted by your Vercel backend are accepted.

## Why an Edge Script and not a Vercel route

Vercel function body limits (4.5 MB Hobby, 50 MB Pro) make it the wrong
place to receive a 30 MB tender PDF. Bunny edge runtimes accept
multi-GB streamed bodies and let us pipe straight through to Storage
without buffering.

## Deploy

1. **Create a new Edge Script** in the Bunny dashboard
   (CDN → Edge Scripts → Create).

2. **Paste `upload-proxy.ts`** as the script body. Bunny's editor
   accepts TypeScript directly; if your version only takes JavaScript,
   compile locally with `tsc --target es2022 --module esnext` first.

3. **Set environment variables / secrets** in the Edge Script settings:
   ```
   BUNNY_STORAGE_ZONE        synergy-webservices-assets
   BUNNY_STORAGE_REGION      (empty for default DE, or "ny" / "la" / etc.)
   BUNNY_STORAGE_ACCESS_KEY  <storage zone password>
   UPLOAD_TOKEN_SECRET       <same value as on Vercel>
   ALLOWED_ORIGIN            https://synergie.cc,https://www.synergie.cc
   ```

   For local development against the live upload endpoint, also include
   the exact dev origin, for example:
   ```
   ALLOWED_ORIGIN            https://synergie.cc,https://www.synergie.cc,http://localhost:3000
   ```
   Origins must match exactly, including protocol and port, and should not
   include trailing slashes.

   If your Bunny Edge Scripting version uses a different env binding
   (some use `process.env`, some use top-level globals, some use a
   `context.env` parameter), adjust the `getEnv()` shim at the top of
   the script accordingly. The shim already tries the three most
   common patterns.

4. **Create a CDN pull-zone** that routes to the Edge Script:
   - Origin: the Edge Script you just created
   - Hostname: e.g. `upload.synergie.cc` (custom domain), or use the
     default `*.b-cdn.net` host while testing
   - SSL: enable Bunny SSL on the custom hostname

5. **Set the `BUNNY_UPLOAD_ENDPOINT` env var on Vercel** to the public
   URL of step 4.

## Test it

```bash
# 1. Hit Vercel for a token (replace the funnel session ID)
TOKEN_RES=$(curl -s -X POST https://your-funnel.vercel.app/api/upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.pdf","contentType":"application/pdf","size":1024,"funnelSessionId":"test-session-12345"}')

TOKEN=$(echo $TOKEN_RES | jq -r .token)
URL=$(echo $TOKEN_RES | jq -r .uploadUrl)
PATH_=$(echo $TOKEN_RES | jq -r .path)

# 2. PUT to the Bunny edge endpoint
curl -X PUT "$URL/$PATH_" \
  -H "X-Upload-Token: $TOKEN" \
  -H "Content-Type: application/pdf" \
  --data-binary @./somefile.pdf

# 3. Verify the file landed in Storage
curl "https://storage.bunnycdn.com/synergy-webservices-assets/$PATH_" \
  -H "AccessKey: $BUNNY_STORAGE_ACCESS_KEY"
```

## Operational notes

- The script verifies the HMAC signature with `crypto.subtle.verify` —
  constant-time by construction. Don't roll your own comparison.
- The `sizeLimitStream` aborts the upstream PUT mid-stream if the body
  exceeds the token's `maxBytes`. The browser sees a network error and
  the partial upload to Storage is discarded by Bunny.
- CORS is locked to `ALLOWED_ORIGIN` — set this to your funnel hostname,
  not `*`. Otherwise any site could mint an upload from a stolen token.
- Token TTL defaults to 10 min (set in the Vercel route). If you need
  longer for large slow uploads, raise it there.

## Scaling / cost

Edge Script invocations are billed per request (sub-cent). Storage
bandwidth between the script and the Bunny Storage backend is free
(both inside Bunny's network). Outbound bandwidth from Storage to
the worker (the GET in the Trigger.dev task) is also free if the
worker runs in a region Bunny peers with cheaply.

## Failure modes worth knowing

- **`upstream_rejected: 401`** — Storage AccessKey is wrong or the
  storage zone name doesn't match.
- **`upstream_rejected: 404`** — `BUNNY_STORAGE_REGION` is set but
  doesn't match the zone's actual region.
- **CORS error in browser console** — origin not in `ALLOWED_ORIGIN`,
  or preflight is being intercepted upstream of the Edge Script. If testing
  from `http://localhost:3000`, add that exact origin to `ALLOWED_ORIGIN`,
  redeploy the Edge Script, and retry with a fresh upload URL.
- **Upload hangs at 100% then times out** — `duplex: "half"` not
  honored by your runtime. Test by buffering the body fully (replace
  the streaming `body: limited` with `body: await new Response(limited).arrayBuffer()`)
  and confirm. If buffering works, raise an issue with Bunny support
  to enable streaming bodies on your account.
