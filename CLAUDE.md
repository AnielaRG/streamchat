# StreamChat — project rules for AI assistants

Real-time chat UI: React + TypeScript + Tailwind v4 + Radix/shadcn + Redux Toolkit, streaming over SSE.

## Commands

- `npm run dev` — web (5173) + API (8787) together
- `npm run typecheck && npm run lint && npm test` — must pass before every commit
- `npm run build` — production build

## Conventions

- Function components, named exports, no `any`, no default exports except `App`.
- Styling: Tailwind utilities only, merge classes with `cn()` from `@/lib/utils`. No CSS files besides `index.css`.
- UI primitives live in `src/components/ui` (shadcn style, Radix underneath). Add new ones with `npx shadcn@latest add <name>`.
- Feature code in `src/features/<name>` (slice, types, tests). Hooks in `src/hooks`. Pure helpers in `src/lib`.
- State: Redux Toolkit slices only; typed hooks `useAppDispatch` / `useAppSelector` from `@/store`.
- Streaming: tokens arrive as SSE frames `data: {"token": "..."}`; end marker `data: [DONE]`. Parse with `createSseParser`.
- Components that re-render per token must be wrapped in `React.memo` with stable props.
- Accessibility: interactive icons need `aria-label`, message list is `role="log"` with `aria-live="polite"`.
- Every reducer / hook / parser gets a Vitest test. Components get a smoke test at most.

## Working style

- One component or one concern per change; small diffs; conventional commits (`feat:`, `fix:`, `test:`, `docs:`).
- Do not add dependencies without saying why.
