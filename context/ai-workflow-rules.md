> ⛔ **MANDATORY**: These workflow rules are mandatory for every implementation session. You MUST follow every rule without exception. You MUST NOT skip steps, combine unrelated work, or invent behavior not defined in the context files.

# AI Workflow Rules

## Approach

You MUST build this project incrementally using a spec-driven workflow. Context files (in a `context/` folder at repo root) define what to build, how to build it, and the current state of progress. A `context/feature-specs/` subfolder contains numbered files for each feature unit — each file tracks that feature from start to end. You MUST always implement against these specs — you MUST NOT infer or invent behavior from scratch. The app MUST remain runnable after each completed feature unit.

## Scoping Rules

- You MUST work on one feature unit at a time — one numbered file in `context/feature-specs/` (e.g. `01-design-system.md`, `02-auth-module.md`)
- You MUST prefer small, verifiable increments over large speculative changes
- You MUST NOT combine unrelated system boundaries in a single implementation step
- Each feature unit file MUST be completed, verified, and marked done before starting the next one

## When to Split Work

You MUST split an implementation step if it combines:

- Frontend UI changes and backend API changes in the same step without separate verification
- Multiple unrelated feature domains (e.g. billing logic and supplier management)
- Behavior not clearly defined in the context files or feature-spec
- A full vertical slice that cannot be verified end to end quickly

If a change cannot be verified end to end quickly, the scope is too broad — you MUST split it.

## Handling Missing Requirements

- You MUST NOT invent product behavior not defined in the context files
- If a requirement is ambiguous, you MUST resolve it in the relevant context file before implementing
- If a requirement is missing, you MUST add it as an open question in `context/feature-specs/<current-file>.md` before continuing
- No implementation begins until the corresponding feature-spec file is reviewed and locked

> ⛔ **HARD CONSTRAINT**: You MUST NEVER invent, assume, or infer features or behavior that are not explicitly defined in the context files. When in doubt, ask — do not guess.

## Protected Files

You MUST NOT modify the following unless explicitly instructed:

- (None currently — will be added as the project grows and shared infrastructure is established)

## Keeping Docs in Sync

You MUST update the relevant context file whenever implementation changes:

- System architecture or boundaries → `context/architecture.md`
- Storage model decisions → `context/architecture.md`
- Code conventions or standards → `context/code-standards.md`
- Feature scope → `context/project-overview.md`
- Feature progress → `context/feature-specs/<NN-feature-name>.md`
- UI theme or color tokens → `context/ui-context.md`

## Before Moving to the Next Unit

You MUST verify every item below before moving to the next feature unit. All items are mandatory:

- [ ] The current feature unit works end to end within its defined scope
- [ ] No invariant defined in `context/architecture.md` was violated
- [ ] The corresponding file in `context/feature-specs/` reflects the completed work (status marked as done)
- [ ] `npm run build` passes (frontend)
- [ ] `pytest` passes (backend) — if backend changes were part of the unit
- [ ] Both repos are in a committable state with passing tests

---

> ⛔ **REMINDER**: No implementation step proceeds without following this workflow. No behavior may be invented. No feature unit may be skipped or combined. These rules are mandatory and non-negotiable.