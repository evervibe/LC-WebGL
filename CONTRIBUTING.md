# Contributing

Thanks for helping with LCWebGL. A few rules to keep contributions easy to review:

- Keep changes small and focused. One feature/fix per branch.
- Run the data pipeline when changing parsers: `npm run data` and include sample output in `public/data/` for tests.
- Keep TypeScript types strict. Avoid `any` unless justified with a comment.
- Run linter before opening a PR: `npm run lint`.
- Add a short entry in `CHANGELOG.md` for non-trivial changes.

Local dev checklist

```bash
cd LCWebGL
npm install
npm run mock-api   # optional
npm run dev
```

If you touch binary assets in `public/3rdparty/` or `legacy-assets/`, prefer adding small test assets or document why a large file must be tracked.
