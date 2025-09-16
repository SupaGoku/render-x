# Technical Stack

## Primary Language
- **Choice:** TypeScript 5.5
- **Rationale:** Native JSX factory typing, strict mode ergonomics, and widespread tooling support.
- **Notes:** Enable `strict`, `noUncheckedIndexedAccess`, and incremental build output for editor feedback.

## Application Framework
- **Choice:** Custom Render-X runtime (library-first) v0.1.0
- **Rationale:** Purpose-built renderer targeting minimal footprint while preserving React-like ergonomics.
- **Notes:** Split into `@render-x/jsx` factory helpers and `@render-x/dom` runtime to keep installs modular.

## Database System
- **Choice:** n/a
- **Rationale:** Library distribution does not persist state server-side.
- **Notes:** Example integrations will rely on consumer-managed storage only.

## Testing Framework
- **Choice:** Vitest 2.x with happy-dom
- **Rationale:** Fast TypeScript-native test runner with isolated JSX DOM simulation and watch mode.
- **Notes:** Bundle snapshot tests via `@render-x/testing` helpers once available.

## Build System
- **Choice:** Rollup 4.x
- **Rationale:** Tree-shakeable ESM/CJS bundles, precise output control for sub-5KB runtime targets.
- **Notes:** Use `@rollup/plugin-typescript` for type stripping and `rollup-plugin-terser` for output minification.

## Package Manager
- **Choice:** pnpm 9.x (workspace mode)
- **Rationale:** Efficient monorepo linking for dual packages, deterministic lockfiles, and node_modules dedupe.
- **Notes:** Configure `packageManager` field and `pnpm-workspace.yaml` spanning `packages/jsx` and `packages/dom`.

## Deployment Solution
- **Choice:** GitHub Actions + npm registry publishing
- **Rationale:** Automated semantic releases with canary tags for renderer primitives.
- **Notes:** Include provenance attestations and `npm publish --access public` gating via release workflow.

## Code Repository URL
- **URL:** https://github.com/render-x/render-x (private until launch)
- **Notes:** Mirror to GitLab for backup; protect main branch with required checks.

## Additional Technologies
- **Bundler Assist:** Esbuild 0.23 for type tests and playground builds.
- **Benchmarking:** Tinybench 2.x for regression tracking under 5ms render targets.
- **Documentation:** VitePress 2.x for API docs and migration guides.
- **Release Tooling:** Changesets 3.x for version orchestration across packages.
