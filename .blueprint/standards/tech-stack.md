# Technology Choices and Rationale

## Core Languages & Tooling

- **TypeScript 5.5 (strict mode):** Primary language for both packages. Enables JSX factory typing, discriminated unions for hook internals, and exhaustive switch checks. Enforce `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **ES2022 target:** Output modern JavaScript while providing downlevel builds via Rollup for CJS consumers.

## Package Layout

- **@render-x/jsx:** Contains JSX runtime (`jsx`, `jsxs`, `Fragment`) and type declarations. Ships as pure TypeScript -> ESM/CJS with zero DOM dependencies.
- **@render-x/dom:** Hosts reconciler, scheduler, and DOM bridge. Depends only on platform DOM APIs.

## Build & Bundling

- **Rollup 4.x:** Primary bundler. Configure separate configs for each package with shared plugins.
  - `@rollup/plugin-typescript` for transpilation.
  - `rollup-plugin-terser` for production minification and size budgets.
  - Output: `esm`, `cjs`, and `.d.ts` bundles.
- **Esbuild 0.23:** Secondary tool for playground builds and quick benchmarks.

## Testing & Quality

- **Vitest 2.x + happy-dom:** Unit/integration tests for hooks, reconciliation, and DOM operations.
- **Tinybench 2.x:** Performance regression suite executed in CI.
- **ESLint (typescript-eslint) + Prettier (optional):** Enforce code style when integrated; respect project formatting rules (2 spaces, single quotes, no semicolons).

## Documentation & Demos

- **VitePress 2.x:** Generate API docs, migration guides, and benchmark dashboards.
- **Vite 5.x playground:** Interactive examples instrumented for bundle-size reporting.

## Release & Automation

- **Changesets 3.x:** Version orchestration across packages with automated changelog entries.
- **GitHub Actions:** CI matrix (lint, test, size check, benchmark). Publish workflow pushes to npm with provenance attestations.
- **pnpm 9.x workspaces:** Manage dependencies and link packages locally with deterministic lockfile.

## Optional Integrations

- **Happy DOM snapshot tooling:** For deterministic portal rendering assertions.
- **Bundle Analyzer:** Rollup plugin (visualizer) for verifying tree-shaking effectiveness before release.

## Non-Goals

- No server-side datastore; consumers supply persistence.
- No external runtime dependencies—keep packages framework-agnostic and zero dependency.
