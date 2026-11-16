# Deployment plan

## Recommended layout

- **Frontend:** Vercel, using the Nitro Vercel preset. Set the Vercel project root to `frontend` and the build command to `npm run build`. Vercel's build environment auto-selects the Vercel Nitro target; a local equivalent is `NITRO_PRESET=vercel npm run build`.
- **Backend:** Railway, using [`backend/Dockerfile`](backend/Dockerfile).
- **Database:** PostgreSQL attached to the Railway project. Apply Flyway V1–V5 at backend startup and restore the verified local project data to the managed database before publishing.

The local database contains 3,586 observations, six mappings, two import batches, seven published articles and eight glossary terms. It also contains one active admin account, which should not be copied to hosting; both import batches currently reference that account. Sanitize those `initiated_by` references to `NULL`, omit `admin_users` and `donations` from the transfer, then bootstrap a fresh admin on the deployed database. The local donations table is empty.

## Required configuration

Set secrets in the hosting dashboards, never in Git:

- Backend: `DB_URL=jdbc:postgresql://<private-host>:<port>/<database>`, `DB_USERNAME`, `DB_PASSWORD`, `APP_CORS_ALLOWED_ORIGINS=<Vercel HTTPS origin>`, `SESSION_COOKIE_SECURE=true`, and `SESSION_COOKIE_SAME_SITE=None` when the API and frontend use different site domains.
- Frontend: `VITE_API_BASE_URL=<Railway HTTPS API origin>` before building.
- Configure the first administrator through the documented one-time bootstrap variables, then disable bootstrap immediately.

The hosting account must be connected before creating services or transferring the local database. No remote database, deployment, or public URL has been created yet.
