---
name: test-generator
description: Generates Vitest unit tests for Vue 3 and TypeScript code. Use this skill whenever the user wants to write tests, generate test files, add test coverage, test a component/composable/store module, or asks anything like "write tests for this", "generate specs", "add unit tests", "test this component", "how do I test this composable", or "improve my test coverage". Trigger even if the user just pastes code and asks broadly how to improve it — testing is often the right answer.
---

# Test Generator — Vue 3 / TypeScript (Vitest)

Generate thorough, idiomatic **Vitest** tests for **Vue 3** (Composition API, `<script setup>`) and plain TypeScript modules.

---

## Prerequisites (component & SFC tests)

If the project does not already have them, add dev dependencies:

- `@vue/test-utils` — `mount`, `shallowMount`, stubs, `findComponent`
- `jsdom` — DOM when `environment` is `jsdom` (Vitest will prompt or fail clearly if missing)

Pure TypeScript tests can use Vitest’s default **`node`** environment (matches many Vite configs).

---

## Workflow

1. **Understand the code** — Read the file(s) provided. Identify:
   - Type: Vue SFC, composable (`useX` function), Pinia store, plain TS module, or server-side helper
   - Dependencies: `ref`/`computed`/`watch`, injected `provide`/`inject`, Vue Router, HTTP client (e.g. axios), async flows
   - Public API: props, emits, exposed methods, exported functions

2. **Plan the test suite** — Before writing, outline:
   - Which behaviours need a `describe` block
   - Happy-path cases
   - Edge cases (empty input, `null`/`undefined`, boundary values)
   - Error cases (rejected promises, thrown errors, failed requests)
   - Async flows (`async`/`await`, `vi.waitFor`, `flushPromises` from `@vue/test-utils`)

3. **Generate the test file** — Follow the conventions below, then write the full file.

4. **Show tests in chat** — Display the generated test file in a code block so the user can review it.

5. **Save to disk** — Write to the correct path (see Naming below), aligned with the project’s Vitest `include` patterns (e.g. `**/*.test.ts`).

---

## Spec / test file conventions

### Naming

| Source file | Test file (common) |
|-------------|-------------------|
| `Foo.vue` | `Foo.test.ts` or `Foo.spec.ts` (next to the component, or under `__tests__/` if the project prefers) |
| `useFoo.ts` (composable) | `useFoo.test.ts` |
| `foo.ts` (plain module) | `foo.test.ts` |

Place the test file **next to** the source file unless the user or repo convention says otherwise.

### Imports (typical)

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
```

- **Plain TS / composables with no DOM:** no Test Utils needed; use `node` environment.
- **Vue SFCs:** use `@vue/test-utils` and **`jsdom`** for that file or globally in `vitest.config` / `vite.config` `test.environment`.

### Per-file environment (when the project defaults to `node`)

At the **very top** of a component test file:

```typescript
// @vitest-environment jsdom
```

### Structure template

```typescript
describe('MyModule', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should <expected behaviour> when <condition>', () => {
		// ...
	});

	describe('methodName()', () => {
		it('should <happy path>', () => { /* ... */ });
		it('should <edge case>', () => { /* ... */ });
		it('should <error path>', () => { /* ... */ });
	});
});
```

---

## Vue-specific patterns

### Component with `<script setup>`

```typescript
// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import MyCard from './MyCard.vue';

it('renders title from props', () => {
	const wrapper = mount(MyCard, {
		props: { title: 'Rookie' }
	});
	expect(wrapper.text()).toContain('Rookie');
});
```

Use **`flushPromises()`** after actions that trigger `async` setup or watchers:

```typescript
await wrapper.find('button').trigger('click');
await flushPromises();
expect(wrapper.emitted('save')).toBeTruthy();
```

### Stubbing children / async components

```typescript
const wrapper = mount(Parent, {
	global: {
		stubs: { HeavyChild: true }
	}
});
```

### Testing `defineEmits`

```typescript
const wrapper = mount(Child, { props: { modelValue: '' } });
await wrapper.find('input').setValue('hello');
expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello']);
```

### Composable (`useX`) — no mount

Call the composable inside a tiny **wrapper component** if it must run inside `setup()`, or test extracted pure functions separately.

```typescript
import { ref } from 'vue';
import { useCounter } from './useCounter';

// If useCounter uses only refs and no inject:
it('increments', () => {
	const { count, inc } = useCounter();
	expect(count.value).toBe(0);
	inc();
	expect(count.value).toBe(1);
});
```

If the composable uses **`inject`**, `mount` a test parent that `provide`s the keys.

### Mocking HTTP (axios, etc.)

```typescript
vi.mock('../api/client', () => ({
	getTeams: vi.fn().mockResolvedValue({ data: { teams: [] } })
}));
```

Prefer mocking the module the component imports, not implementation details deep inside private helpers.

### Router / Pinia

- **Router:** pass `global: { plugins: [router] }` with a test router instance, or stub `useRouter` / `useRoute` with `vi.mock('vue-router')`.
- **Pinia:** `import { createPinia, setActivePinia } from 'pinia'` in `beforeEach`, then `setActivePinia(createPinia())` before mounting or calling store actions.

---

## Plain TypeScript patterns

```typescript
import { chunkIds } from './chunkIds';

it('returns empty chunks for empty input', () => {
	expect(chunkIds([], 10)).toEqual([]);
});
```

Use **`vi.fn()`** for callbacks and **`vi.useFakeTimers()`** when testing timers.

---

## Test coverage checklist

- [ ] Creation / mount (components) or first call (composables)
- [ ] Each public function or user-visible behaviour — happy path
- [ ] Edge cases: `null`, `undefined`, empty string/array
- [ ] Async: promises settled, `flushPromises` where needed
- [ ] Emits and prop updates (components)
- [ ] Mocks restored (`vi.clearAllMocks` / `vi.restoreAllMocks` in `afterEach` when appropriate)
- [ ] HTTP or external modules: success and failure paths

---

## Quality rules

- **One main assertion focus per `it`** — keep tests easy to diagnose.
- **Descriptive names** — `it('returns an empty list when teams is null')` not `it('works')`.
- **Avoid magic values** — use named constants or clear variables for fixtures.
- **Reset state** — `beforeEach` for fresh pinia, cleared mocks, new `mount`.
- **No `any` unless unavoidable** — keep types in tests.
- **Test behaviour, not private internals** — prefer public API, emitted events, and rendered output.

---

## Output

1. Show the complete test file in a TypeScript (or Vue SFC) code block in chat.
2. Save the file to disk at the path that matches project conventions.
3. Briefly summarise:
   - Number of `describe` / `it` blocks
   - Mocking strategy (HTTP, router, pinia)
   - Any gaps where the user should supply real API payloads or routes
