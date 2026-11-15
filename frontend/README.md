# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Local backend integration

The frontend requests `/api/v1` and the Vite development server proxies those calls to the
Spring Boot backend at `http://localhost:8081`. Start PostgreSQL and the backend first, then run
`npm run dev` from this directory. For local HTTP development, start Spring Boot with
`SESSION_COOKIE_SECURE=false` so the browser can send its HttpOnly session cookie. Keep the
backend's secure-cookie setting enabled in HTTPS deployments. Set `VITE_API_BASE_URL` only when
the API is hosted at a different origin; that origin must allow the frontend origin and credentialed
requests.

Administrator login uses the backend's configured admin account; there are no frontend demo
credentials or public registration. The backend can create its first administrator with the
one-time bootstrap settings described in `../backend/src/main/resources/README.md`.

Public catalogue, observations, articles, glossary, sources, datasets, and search are read from the
backend. The existing browser editorial content is retained only as a transfer source: an
administrator can explicitly choose **Transfer saved local content** on the Articles page. It
checks all server slugs first, skips existing records, and does not overwrite server content.
Successful donations and admin edits are stored by the backend. Synthetic teaching observations
remain separate from backend observations and are shown only when the explorer's explicit teaching
examples option is enabled.
