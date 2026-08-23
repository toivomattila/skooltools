# Skool Tools

Skool Tools is a small, static directory for practical tools, templates, and
workflows made for Skool communities.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal. The production build can be
previewed with:

```bash
npm run build
npm run preview
```

## Checks

```bash
npm run format
npm run lint
npm run build
```

## Launch a tool

The `/launch` page uses a small, Product Hunt-inspired URL-first flow. Submit
one direct HTTPS URL and Convex checks the address, fetches its public HTML
metadata, and publishes a directory entry automatically when the page responds.
There is no human review queue, voting, comments, profiles, or payment flow in
this version.

The app keeps the researched static tools and merges published Convex tools into
the homepage featured set and directory. If Convex is not configured, the
static site still renders and the launch page explains what is missing.

## Convex development

Set the Vite client URL in a local, uncommitted environment file:

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

Use the selected development deployment while building backend features:

```bash
npx convex dev
```

For a one-time schema/function sync, use:

```bash
npx convex dev --once
```

Deploy the backend to the production deployment only when ready to release:

```bash
npx convex deploy --yes
```

The production Vercel project must have `VITE_CONVEX_URL` set to the production
Convex deployment URL before building. Do not commit environment files or
deployment keys.

## Deploy to Vercel

The app is a standard Vite static build. Vercel uses the `dist` directory
created by `npm run build`. The included `vercel.json` sends direct route
requests back to the app shell so `/tools` and `/launch` work when opened
directly.

With the Vercel CLI installed and authenticated:

```bash
npm install --global vercel
vercel link --project skooltools
vercel --prod
```

If the project has not been linked before, `vercel link` will ask which team
should own it.

## Add a tool

The researched static directory content lives in
[`src/data/tools.ts`](src/data/tools.ts). Add a new object to the `tools` array
and keep it within the `Tool` shape:

```ts
{
  slug: 'member-wins-log',
  name: 'Member wins log',
  description: 'Keep a simple record of the progress members share.',
  category: 'Creator utilities',
  status: 'placeholder',
}
```

Use `status: 'listed'` for a researched directory entry and include an HTTPS
`url`. Use `status: 'placeholder'` for a planned entry; placeholders do not
need a URL and do not show a Visit link. Set `featured: true` to show an entry
on the home page. The available categories are defined in the same file.
