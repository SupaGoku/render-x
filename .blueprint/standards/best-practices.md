# Project Best Practices

## Error Handling

### Strategy

- Throw domain-specific `Error` instances with clear, actionable messages (e.g., `throw new Error('render-x: missing container node')`).
- Guard all public entry points (`render`, `createPortal`, hooks) with argument validation and fail fast when invariants break.
- Ensure hook scheduler reports double-invocation issues in development using strict-mode toggles.

### Logging

- Bubble fatal conditions to the host app via thrown errors; rely on `console.error` with the `render-x` prefix for non-fatal diagnostics.
- Avoid logging during core render loops to keep benchmarks stable; aggregate debug info behind a feature-flagged devtools hook.

## State Management

- Keep hook state internal to the scheduler; expose only pure helpers for userland state.
- Prefer immutable updates for reconcilable state to simplify diffing and avoid accidental mutations across renders.

## API Design

### Public Surface

- Export minimal entry points from `@render-x/jsx` (JSX runtime, types) and `@render-x/dom` (render, createRoot, portals).
- Document all exports with JSDoc and mark experimental APIs using `@deprecated` until stabilized.

### Error Responses

- Normalize thrown errors with `render-x:` prefixed codes to help consumers match on `message` and `name`.

## Security

### Required Practices

- Sanitize any host DOM insertion to prevent script injection when portals target arbitrary nodes.
- Do not eval or dynamically compile user strings; rely on compile-time JSX transforms.
- Ensure builds strip dev-only assertions from production bundles to avoid leaking internals.

## Performance

### Guidelines

- Budget every release to stay under 5KB gzipped per package; enforce via Rollup analyze step.
- Maintain Tinybench regression tests for render throughput, hook update speed, and portal mount latency.
- Use microtask scheduling for hooks to keep interactions under 5ms; avoid macro-task timers in core paths.

## Accessibility

### Requirements

- Provide guidance for portal use ensuring focus management and aria attributes follow WCAG 2.1 AA.
- Include examples demonstrating live region updates and keyboard trapping for modal portals.
- Encourage consumers to test with screen readers after integrating Render-X components.

## Documentation

- Keep setup recipes in VitePress docs covering bundler config, TypeScript setup, and migration steps.
- Update roadmap items with release notes after each milestone; link to benchmark deltas and bundle-size diffs.

## Testing

- Mandate unit coverage for reconciler operations, hook invariants, and DOM events using Vitest + happy-dom.
- Include integration tests comparing React/Render-X component outputs to ensure JSX parity.
- Automate size-regression checks in CI with Rollup bundle analyzer.

## Release Management

- Use Changesets for coordinated releases of `@render-x/jsx` and `@render-x/dom`.
- Publish canary tags on every merge to main; promote to stable only after benchmarks and size budgets pass.
