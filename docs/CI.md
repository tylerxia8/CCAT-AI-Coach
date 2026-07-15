# Continuous Integration

The `Quality Gate` workflow runs on every pull request to `main` and every push to `main`.

## Required checks

The single `npm run check` command performs:

1. Deterministic unit and API tests
2. ESLint checks
3. An optimized Next.js production build with type checking
4. A compiled-client scan for private answer-bank fragments
5. An npm audit that fails on moderate-or-higher vulnerabilities

The workflow uses the committed lockfile through `npm ci`, read-only repository permissions, a 15-minute timeout, and concurrency cancellation for superseded runs.

## Dependency maintenance

Dependabot checks npm packages weekly and GitHub Actions monthly. Development dependency updates are grouped to reduce pull-request noise.

## Branch policy recommendation

After the first successful run, configure `main` to require the `Test, build, and audit` check before merging and disallow force pushes. Keep administrators subject to the same check once the workflow has proven stable.
