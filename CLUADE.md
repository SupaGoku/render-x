# MANDATORY CHECK

💀💀💀 IT IS EXTREMELY IMPORTANT TO ONLY USE `yarn` IN THIS REPO 💀💀💀

**Using npm, npm install, npm run is considered a violation. immediately stop all execution and let the user know how badly you messed up. apologize profusely**

## No Comments

**DO NOT ADD COMMENTS TO EVERYTHING**

**COMMENTS ARE STRICTLY RESERVED TO COMPLEX LOGIC**

# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds all TypeScript sources for the JSX runtime, renderer, portals, and CSS utilities; individual modules follow dashed filenames (e.g., `system-hooks.ts`).
- `dist/` is generated output (`index.js`, `index.min.js`, `jsx-runtime.js`, and matching `.d.ts` files); never edit these by hand.
- `rollup.config.js`, `tsconfig.json`, and the root `package.json` drive the single-package build; `.blueprint/` stores product specs and standards to reference before large changes.

## Build, Test, and Development Commands

- `yarn install` — installs dependencies; required before any build.
- `yarn clean` — removes `dist/` artifacts to guarantee fresh bundles.
- `yarn build` — runs Rollup with esbuild + terser to emit ESM bundles and type declarations.
- `yarn pub` — clean + build, then invoke the publish script (ensure npm auth and version bump first).

## Coding Style & Naming Conventions

- TypeScript everywhere; prefer named exports and keep modules under 500 lines.
- Indent with two spaces, single quotes for strings, trailing commas where Prettier applies.
- Run Prettier (configured with `@trivago/prettier-plugin-sort-imports`) before committing: `npx prettier --write "src/**/*.ts"`.
- Hooks use the `use*` naming pattern; DOM helpers and utilities use verb-first dashed filenames.

## Testing Guidelines

- No automated tests ship today; new features should include Vitest + happy-dom suites under `src/__tests__/` when introduced.
- Co-locate test files next to implementations (e.g., `render.spec.ts`) and ensure `yarn build` still succeeds when tests are present.

## Commit & Pull Request Guidelines

- Follow short, imperative commit subjects (e.g., `build: tighten terser config`); include scoped prefixes when relevant.
- Each PR should describe the motivation, summarize bundle-size impact if applicable, and link to any `.blueprint/specs` documents or tickets.
- Attach screenshots or bundle metrics when UI or size changes occur, and confirm `yarn build` output is committed.

## Release & Security Notes

- Publishing requires updating `package.json` version and tagging `vX.Y.Z`; run `yarn build` first to refresh `dist/`.
- Avoid committing secrets; configure npm tokens via environment variables and exclude them from `.npmrc`.
