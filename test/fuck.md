# Current State

5/8 tests passing. Main issues:
1. useState doesn't update DOM (state changes but DOM doesn't reflect it)
2. Context values not propagating
3. Input value updates not working

## The Real Problem

We have clean separation:
- mount.ts builds virtual trees
- dom-sync.ts handles DOM operations
- runtime.ts orchestrates

But text nodes are just strings in the virtual tree. When we update:
- Old tree: `['Count: 0']`
- New tree: `['Count: 1']`

We have no way to find the actual DOM text node to update it.

## Solutions Tried
1. Update text node via parentNode - doesn't work, strings don't have parentNode
2. patchChildren with childNodes[i] - doesn't work reliably
3. TextNode wrapper objects - too much overhead

## The Fix We Need
Store DOM references WITH the virtual nodes. When we create a text node, store its reference. When we patch, use that reference.

This breaks clean separation but fuck it, it needs to work.