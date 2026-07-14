# AI Memory

Office Craft values:

Consistency

Predictability

Reusability

Scalability

Maintainability

Incremental evolution

The project intentionally avoids

rapid rewrites

experimental UI

large refactors

architecture churn

The preferred workflow is

inspect

↓

understand

↓

extend

↓

test

↓

commit

not

generate

↓

replace

↓

regret

Every feature should look like it was built by the same team.

Even if years apart.

The documentation is the project's permanent memory.

Not any individual AI conversation.

## Resources API Contract

As of 2026-07-11, the Resources API provides a shared `capacity` field and
optional `color`, `licensePlate`, and `fuelType` fields. It does not provide
legacy `equipment` or `engineCc` fields. Keep the frontend DTO, form payload,
and resource detail UI aligned with this response shape.

## Calendar Callback Rule

`CalendarView` calls `onMonthChange` from an effect. Its parent must provide a
stable callback and must not replace the current month state with an equivalent
value, otherwise React enters a maximum-update-depth render loop.

## Storage Upload Rule

As of 2026-07-13, resource photos and booking proofs upload directly from the
browser to Supabase Storage using the API-issued Supabase JWT. The proofs API
accepts JSON metadata only: persist the object path (not a public URL) in
`booking_proofs`, then resolve private proof paths to signed URLs for display.

## Public Configuration Rule

As of 2026-07-14, API and Supabase browser configuration lives in Vite
`VITE_*` environment variables. Use `.env` locally, and configure the same
variables in Lovable and Vercel; never restore deployment-specific defaults to
`src/lib/env.ts`. Keep `env.ts` as the shared typed adapter rather than
duplicating `import.meta.env` access across clients and components.
