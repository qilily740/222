# Iris 222 access gate

This Worker checks the shared password on the server before forwarding requests for `iris.suri.us.ci` to the existing GitHub Pages origin. The password and signing key are Worker secrets; neither belongs in this repository or the browser bundle.

## Required Cloudflare setup

1. Add the `suri.us.ci` zone to the Cloudflare account used for this Worker and make sure the `iris.suri.us.ci` DNS record is proxied through Cloudflare. Keep its current GitHub Pages target as the origin.
2. From this directory, set the password as a Worker secret with `npx wrangler secret put IRIS_222_PASSWORD`. Enter the shared password at the hidden prompt; do not put it in a command, config file, or commit.
3. Generate a random signing key locally and set it with `npx wrangler secret put IRIS_222_SIGNING_KEY`. This must be a separate random secret, at least 32 bytes.
4. Deploy with `npx wrangler deploy`.

The gate issues a signed, HttpOnly, Secure, SameSite cookie with a ten-year lifetime, so the password is not requested again during normal use. It is not readable by page JavaScript. Login attempts are limited to five per minute per IP at each Cloudflare location. Clearing the browser's site data removes the cookie and requires the password again. The application does not register a service worker, so it does not have an offline shell that bypasses this gate.

Cloudflare must own or proxy the `suri.us.ci` zone for the route to run. The Worker protects the custom domain entry; the GitHub repository itself remains public if its visibility is public, so this gate does not conceal source code.
