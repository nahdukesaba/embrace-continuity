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
