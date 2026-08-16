# Chex Native

Chex Native builds Android and iOS interfaces with small, shared JavaScript components. The public global is `Chex`.

```js
const count = Chex.signal(0);

const App = () => Chex.div({ style: { padding: 20, gap: 12 } }, [
  Chex.h1('Hello Chex'),
  Chex.p(`Count: ${count.value}`),
  Chex.button({ onClick: () => count.value += 1 }, 'Add one')
]);

Chex.mount(App);
```

Use `Chex.div`, `Chex.button`, `Chex.input`, `Chex.image`, `Chex.select`, and the semantic text helpers `h1`, `h2`, `h3`, `p`, `span`, and `label`. `row` and `column` map to native flex layouts.

`Chex.state()` is also available for compatibility and returns the original `get()` / `set()` API. Existing `venjs`, `venjsX`, and `venX` applications continue to work as aliases while you migrate.

The internal bridge filenames and native class names deliberately remain unchanged for this release, avoiding a breaking project-file/package rename. New projects should use the Chex API and `chex` CLI command.
