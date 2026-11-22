# truex-kernel-cognition WASM pkg

Checked-in stub so `pnpm install` can resolve
`packages/cognition` → `file:../../crates/truex-kernel-cognition/pkg`.

Replace with a real wasm-pack build:

```bash
cd crates/truex-kernel-cognition
wasm-pack build --target nodejs --features wasm --out-dir pkg
```
