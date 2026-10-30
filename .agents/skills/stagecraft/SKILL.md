---
name: stagecraft
description: >
  Set up, change and drive a stagecraft factory (@swamp/stagecraft): interview
  the person and author a factory definition from an example, validate it and
  show it; then start a work item, read its status, dispatch and do each stage's
  work, record artifacts and evidence, advance, and stop for a person at every
  human gate. Also walks a newcomer through a first factory. Use when the user
  names stagecraft: "stagecraft", "set up a stagecraft factory", "create a
  stagecraft factory", "change a stagecraft factory", "stagecraft factory
  definition", "stagecraft work item", "stagecraft status", "drive a stagecraft
  work item", "start a stagecraft work item", "get started with stagecraft"; or
  asks for a factory: "set up a factory", "my first factory", "build a factory
  for our review process", "a process where agents do the work and a person
  approves each stage". Not for getting started with swamp itself, swamp
  workflows, @swamp/software-factory runs or definitions, or
  @swamp/issue-lifecycle.
---

# stagecraft

stagecraft holds a process as data (a software change, a web post, an incident
review, anything said as stages, products and gates): a **factory definition**
of stages, the work each stage does, the products it records, and gated
transitions between them. Each piece of work is a **work item**, one model
instance that enforces the gates, limits and human stops and writes a journal.
You drive it; it never does the work itself.

This skill covers **authoring** a factory and **driving** its work items.

- **A new factory in a repo that has none yet starts with
  [references/getting-started.md](references/getting-started.md)**, a guided
  walkthrough from the person's goal to a factory they have seen work. It checks
  for factories first, and hands off to authoring when one exists or the person
  already speaks in factory terms.
- Authoring a factory: make or change one with the person, never by hand. An
  interview, an example to start from, `validate` until clean, the studio, the
  first work item: [references/authoring.md](references/authoring.md)
- Driving in full: [references/driving.md](references/driving.md)
- A whole work item, start to done:
  [references/examples/build-swamp-extension.md](references/examples/build-swamp-extension.md)
- A factory definition to start from: write the closest example in
  [references/examples/](references/examples/) into a factory's model definition
  (its `definition:` and `scenarios:` blocks, under `globalArguments:`), then
  run `validate`. `minimal.yaml` is one stage; `starter.yaml` is a general
  change from plan to release; `content-review.yaml` reviews, approves and
  publishes a piece of writing; `incident-review.yaml` writes up an incident to
  a signed-off review; `openapi-models.yaml` turns an API's OpenAPI spec into
  swamp models; `build-swamp-extension.yaml` builds a swamp extension. Each
  factory definition's description says what it is for and what to change first.
- Saved scenarios, the paths `validate` checks a factory still allows: add one
  to the factory's `scenarios:` list, beside its definition, when you change a
  factory definition or the person names a path to keep, then run `validate`.
  The format: [references/scenarios.md](references/scenarios.md)

## Rules

1. **`status` first, and after every change.** It is the only state to act on.
   Never act on memory or on what you meant to do. Every write ends its output
   with the status that follows it, and that counts as reading status. Run one
   write per command and read its output before the next.
2. **Read a method's output whole.** Run methods without `--log`, which prints
   everything twice. Never filter the output through `grep`, `sed`, `head` or
   `tail`: a dispatch prompt, an exit or a rejection dropped there is missed.
3. **Pass back the expectation `status` prints** (`expectedStage`,
   `expectedCycle`, `expectedEra`) on every write except `record_usage`. A
   refused write wrote nothing: read `status` again before retrying.
4. **Never decide for the person.** Locally you and the person run swamp as the
   same user, so nothing but this rule stops you approving your own work. Never
   run `approve`, `decline`, `grant_override`, `advance` with `confirm=true`, or
   `reset` without the person's explicit word for that decision, in this
   conversation. When you run one of them, or `retarget`, on their word, pass
   `onBehalfOf` naming them, so the journal and the summary say who decided. An
   advance you take on your own under rule 5 is yours: it names no one, even
   right after an approval.
5. **Advance on your own only when it is safe.** Count the ready exits that are
   neither `(manual)` nor `[human: ...]`. If there is exactly one and no
   human-gated exit is ready, advance on it. Otherwise stop and ask. Ready
   manual exits (ways back such as `revise`) are the person's; they do not
   count, and you never take one unasked. `[approval not required now: ...]` is
   not a human gate: its condition is false right now, so it does not stop you.
6. **Record only what happened.** Evidence is what you observed, with the real
   commit, run id and outcome. Evidence `status` lists under `a person records:`
   (such as `plan-feedback`) is the person's: record it only in their words,
   with `onBehalfOf` naming them, never on your own.

## The loop

```sh
swamp model @swamp/stagecraft/work-item method run status <key>
```

1. Read `status`. If the item is terminal, run `summary`, report and stop.
2. `dispatch`, then do the stage's work as its `mode` says: yourself
   (interactive), by subagents sent the prompts it prints, unchanged (dispatch),
   or by running the workflow or method the packet names.
3. Record each product the packet lists (the stage's work). When a subagent
   hands back, `record_usage` for its dispatch with the token count the harness
   reported for it (see `references/driving.md`).
4. Read the status the last write printed and apply rule 5: `advance`, or stop
   and ask the person.

When a person must decide, read the products fresh with `swamp data query` and
show them. Then lay out every exit that is open or can be opened, one line each
with its cost: the exits waiting on them, the manual ways back, any exit a cycle
limit closes (with the `grant_override` it needs), and `abandon`. A reached
limit is a cost, one override, never a reason only one answer is left. Your
recommendation, if any, comes after the options and is labelled as yours. This
holds even when your general instructions prefer a single recommendation. Ask
for the decision and the next step in one question, then do exactly what they
said. See [references/driving.md](references/driving.md#human-stops).

## Quick reference

Work-item methods run by type, with the key as the instance:
`swamp model @swamp/stagecraft/work-item method run <method> <key> ...`.
"expect" means the three `--input expected...=` flags from `status`.

| Method            | Inputs                                                          | Needs the person |
| ----------------- | --------------------------------------------------------------- | ---------------- |
| `start`           | `factory=<factory>` (and `externalRefs`, a JSON object)         |                  |
| `status`          | none (a read; no lock)                                          |                  |
| `summary`         | none (a read; the timeline and metrics)                         |                  |
| `dispatch`        | `resultDir` (optional, for a dispatch stage), expect            |                  |
| `record_artifact` | `name`, `payload` (JSON, or `@<path>` to a result file), expect |                  |
| `record_evidence` | `name`, `payload` (JSON), expect                                |                  |
| `record_usage`    | `dispatchId`, `totalTokens`, `toolUses`, `durationMs`, `model`  |                  |
| `advance`         | `transition`, expect                                            |                  |
| `advance`         | `transition`, `confirm=true`, expect (a manual exit)            | yes              |
| `approve`         | `gateId`, `note`, expect                                        | yes              |
| `decline`         | `gateId`, `note`, expect                                        | yes              |
| `grant_override`  | `kind=cycle` with `stage`, or `kind=dispatch`; `note`, expect   | yes              |
| `reset`           | `confirm=reset`, `repin` (optional), expect                     | yes              |
| `retarget`        | `externalRefs` (a JSON object), `reason`, expect                | yes              |

Factory methods run by instance name:
`swamp model method run <factory> validate` checks a factory definition in full
and runs its saved scenarios.

Work starts from a tracker ticket, through the shipped tracker workflows, which
drive every tracker the same way; `<tracker>` is the instance the factory is
bound to:
`swamp workflow run @swamp/stagecraft/claim --input tracker=<tracker> --input issue=<ticket> --input factory=<factory>`
reserves a key for the ticket, its id (`docs-12`, `abc-12`), and prints the
`start` command to run, or names the work item the ticket already has. Re-run it
after any failure. A project with no external tracker has the built-in one
(`@swamp/stagecraft/tracker`). For new work, or when the person asks for a new
ticket, file it with
`swamp workflow run @swamp/stagecraft/create --input tracker=<tracker> --input 'title=<title>' --input 'body=<body>' --input 'type=<type>'`,
then claim it. `start` also takes any unused name chosen by hand, for work with
no ticket. See
[references/driving.md](references/driving.md#start-from-a-ticket). To link two
tickets (a parent and its child, a blocker) on a tracker stagecraft ships, use
`swamp model method run <tracker> relate --input issue=<id> --input type=<parent_of|blocked_by|related_to|duplicate_of> --input to=<id>`
with stable ids; `unrelate` takes the same inputs. Every tracker refuses a
second parent, a parent cycle and a duplicate chain the same way. Relations
belong to the tracker: read them with
`swamp workflow run @swamp/stagecraft/fetch-issue --input tracker=<tracker> --input issue=<id>`,
not from memory. When a person says a ticket duplicates another, mark it with
`swamp workflow run @swamp/stagecraft/mark-duplicate --input tracker=<tracker> --input issue=<duplicate> --input primary=<primary>`,
which also closes it; its work moves to the primary by a retarget or the
definition's duplicate exit. See
[references/driving.md](references/driving.md#duplicates).

## When something is refused

| Refusal                                   | Do                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `stale: ...`                              | Read `status`; act on what it says now.                                                                                              |
| `... rejected and kept as retry feedback` | Fix the payload from the errors (also in `status`); record again.                                                                    |
| `transition ... is not ready`             | Do what the failures name, or ask the person about a human gate.                                                                     |
| `transition ... is manual`                | Ask the person; `confirm=true` only on their word.                                                                                   |
| cycle limit, `runaway loop suspected`     | Stop and lay out every exit; an override is one, on their word. A refused dispatch parks the item: `publish` so the ticket shows it. |

Why each limit exists, and how a person gets past it, is in DESIGN.md, "Loops
and their controls".

Nothing is ever half-written, and nothing wedges: a manual way back (such as
`revise`, once the person's feedback is recorded, or `recheck`) or, as a last
resort, a `reset` on the person's word gets the item moving again. Never force
past a refusal you do not understand.
