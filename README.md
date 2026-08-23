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

There is no test runner yet because the v1 app has no data-fetching or
state-heavy behavior. Add one when interactive tools move into the directory.

## Deploy to Vercel

The app is a standard Vite static build. Vercel uses the `dist` directory
created by `npm run build`. The included `vercel.json` sends direct route
requests back to the app shell so `/tools` works when opened directly.

With the Vercel CLI installed and authenticated:

```bash
npm install --global vercel
vercel link --project skooltools
vercel --prod
```

If the project has not been linked before, `vercel link` will ask which team
should own it.

## Add a tool

All directory content lives in [`src/data/tools.ts`](src/data/tools.ts). Add a
new object to the `tools` array and keep it within the `Tool` shape:

```ts
{
  slug: 'member-wins-log',
  name: 'Member wins log',
  description: 'Keep a simple record of the progress members share.',
  category: 'Member experience',
  status: 'placeholder',
  note: 'Coming later',
}
```

Use `status: 'example'` for an idea with enough detail to demonstrate, and
`status: 'placeholder'` for a planned entry. Set `featured: true` to show an
entry on the home page. The available categories are defined in the same file.

This first version intentionally has no backend, authentication, or submission
form. Replace the static array with a CMS or API when the directory needs
curation workflows.
