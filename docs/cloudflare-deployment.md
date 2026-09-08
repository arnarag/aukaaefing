# Cloudflare Workers deployment

The application uses the OpenNext Cloudflare adapter so the existing Next.js
application can run on Cloudflare Workers. Local development is unchanged:

```sh
npm run dev
```

## Local checks

Build the Worker output:

```sh
npm run build:cloudflare
```

Build and run it with the local Workers runtime:

```sh
npm run preview:cloudflare
```

## Cloudflare Workers Builds

Connect this GitHub repository to a **Workers Builds** project and use:

- Production branch: `main`
- Build command: `npm run build:cloudflare`
- Deploy command: `npm run deploy:cloudflare`
- Non-production branch deploy command: `npm run upload:cloudflare`
- Root directory: `/`

The OpenNext CLI should perform both production deploys and non-production
version uploads. Do not replace these with raw `wrangler deploy` or
`wrangler versions upload` commands for this OpenNext application.

Workers Builds creates preview versions for non-production branches and deploys
the production branch to the Worker. Keep branch build triggers enabled for pull
request preview builds.

The first connection requires a Cloudflare user with permission to create or
update the `aukaaefing` Worker. No application environment variables are needed
by the current application.

Do not run the deploy command as a separate GitHub Actions workflow. Workers
Builds owns deployment and receives the required Cloudflare credentials from
the Cloudflare Git integration.

## Configuration basis

This setup follows Cloudflare's official
[OpenNext adapter guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/),
the
[Workers Builds configuration guide](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/),
and OpenNext's Workers Builds guidance.
OpenNext is used because it supports the project's existing Next.js 15 release;
the application does not need a framework upgrade or migration.
