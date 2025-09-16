# Spec Summary (Lite)

Ship signal primitives (`createSignal`, `computed`, `effect`) that interop with HookHost so only components reading a changed value rerender, then wrap them in `createStateContext`, `StateProvider`, and `useStateContext` helpers so adopters get React-like ergonomics (including optional selectors). Provide typings, tests, and docs proving partial updates, selector stability, and benchmark the reduction in unnecessary renders versus the current hook-based flow.
