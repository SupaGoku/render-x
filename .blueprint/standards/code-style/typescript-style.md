# TypeScript Style Guide

## Overview

This document defines the TypeScript code style standards specific to the Render-X project.

## Naming Conventions

### Variables

- **Style:** camelCase
- **Examples:**
  ```ts
  const renderQueue = [];
  const fiberNode = createFiber();
  const bad_variable = [];
  ```

### Functions/Methods

- **Style:** camelCase with arrow function assignments (`const methodName = () => {}`)
- **Async functions:** Prefix with `async` keyword and follow arrow assignment convention.
- **Private methods:** Prefix with `_` within classes to signal developer-only usage; leverage `#` for hard privacy when supported.

### Classes and Interfaces

- **Classes:** PascalCase (`RendererContext`)
- **Interfaces:** Interface name prefixed with `I` only when representing external contracts; otherwise use meaningful PascalCase names (e.g., `RenderContext`).

### Files and Directories

- **Components:** kebab-case (`component-registry.ts`)
- **Utilities:** kebab-case (`hook-scheduler.ts`)

## Formatting

### Indentation

- **Type:** Spaces
- **Size:** 2

### Line Length

- **Maximum:** 120 characters
- **Exceptions:** Literal URLs, import statements, generated code

### Quotes

- **Strings:** single quotes
- **JSX attributes:** single quotes unless interoperability requires double quotes

### Semicolons

- **Policy:** Never; rely on automatic semicolon insertion. Ensure lint rules guard against hazardous ASI edges.

## Import Organization

```ts
// 1. External dependencies
import { performance } from 'node:perf_hooks';

// 2. Internal modules
import { createRoot } from './dom-root';

// 3. Components (if applicable)
import { RenderXProvider } from '../components/provider';

// 4. Styles
import './renderer.css';
```

## Comments and Documentation

### Function Documentation

Use JSDoc for all exported APIs:

```ts
/**
 * Mounts a Render-X component tree into a host node.
 * @param node - The JSX element or component to render.
 * @param container - The target DOM element.
 */
export const render = (node: JSX.Element, container: Element) => {
  // implementation
};
```

### Inline Comments

Avoid inline comments unless documenting complex algorithms. When necessary, prefer block comments describing intent.

## Project-Specific Patterns

- Prefer `interface` declarations for public contracts; use `type` for unions and mapped types only.
- Preserve pure functions for reconciler operations; isolate side effects in host renderer utilities.
- Favor explicit return types on exported functions to guard against unintended inference shifts across TypeScript releases.
- Keep hook implementations free of external dependencies; share utilities through internal modules to enforce zero-dependency packaging.
