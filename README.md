# bunw

Bun shortcuts for faster execution.

See [Transpiler cache makes CLIs like tsc up to 2x faster](https://bun.sh/blog/bun-v1.0.15#transpiler-cache-makes-clis-like-tsc-up-to-2x-faster) for more information.

### Install

```bash
  pnpm i -D bunw
```

### Usage

#### For `prettier`

```bash
  bprettier --write ./src
```

#### For `tsc`

```bash
  btsc -w
```

#### For any

```bash
  bunw prettier
  bunw tsc
  # ...
```

### License

MIT
