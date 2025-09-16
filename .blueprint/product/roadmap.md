# Product Roadmap

## Phase 1: Minimal Runtime
**Goal:** Ship a production-ready JSX renderer and DOM binding that compiles under 5KB gzipped.
**Success Criteria:** render throughput ≥ 8k ops/sec on mid-tier laptop; bundle diff vs React ≥ -90KB.

### Features

- [ ] Core fiberless reconciler - Implement diffing algorithm with keyed child support `L`
- [ ] Hook scheduler parity - Provide `useState`, `useEffect`, `useMemo`, and `useRef` semantics `M`
- [ ] Signals-based state propagation - Introduce fine-grained signal primitives for partial rerenders `M`
- [ ] TypeScript declaration suite - Generate `.d.ts` coverage for public APIs `S`
- [ ] Rollup build pipeline - Produce ESM, CJS, and type bundles with size budgets enforced `M`
- [ ] Playground harness - Create Vite-based sandbox for manual QA and docs snippets `S`

### Dependencies

- TypeScript compiler configuration finalized
- Benchmark fixture setup ready for regression testing

## Phase 2: Differentiated Surface
**Goal:** Deliver advanced capabilities that distinguish Render-X from micro-framework peers.
**Success Criteria:** Portal integration time ≤ 2 days for pilot teams; hydration bug reports <2 per release.

### Features

- [ ] Portal targeting layer - Support rendering into arbitrary DOM nodes with hydration guards `M`
- [ ] Streaming SSR adapter - Provide `renderToString` and stream hydration entry points `M`
- [ ] Strict-mode diagnostics - Expose lifecycle tracing and effect double-invoke checks `S`
- [ ] Changesets release workflow - Automate dual-package versioning and changelog generation `S`
- [ ] Migration cookbook - Document React interoperability patterns and conversion recipes `S`

### Dependencies

- Phase 1 runtime APIs stable
- Documentation framework baseline from Phase 1 playground

## Phase 3: Scale & Tooling
**Goal:** Harden the ecosystem for multi-team adoption and long-term maintenance.
**Success Criteria:** <1% regression in render benchmarks across releases; ≥3 external integrations published.

### Features

- [ ] Devtools hook interface - Define plugin API for profiler/logging extensions `M`
- [ ] Tinybench regression suite - Automate performance tracking across core operations `S`
- [ ] Accessibility testing guides - Provide checklists and examples for portal-heavy flows `S`
- [ ] Governance model - Publish contribution guidelines, RFC process, and security policy `S`
- [ ] CDN-ready dist artifacts - Offer prebuilt UMD bundles with integrity hashes `M`

### Dependencies

- Continuous integration lanes with coverage and benchmarks
- Community feedback channel established via discussions
