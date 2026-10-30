# Saved scenarios

A saved scenario is a known path through a factory, kept beside its definition
so that a change to the factory definition that breaks it fails `validate`. You
write them: when you change a factory definition, when the person describes a
path the factory must keep allowing (or refusing), or when they ask for one.
Nothing else creates them.

## Where they go

In the factory's model definition,
`models/@swamp/stagecraft/factory/<factory>.yaml`, as the `scenarios:` list
under `globalArguments:`, beside `definition:` and `tracker:`. Each example in
[examples/](examples/) has its own `scenarios:` block, written in with its
definition; no two scenarios in a factory share a name.

```yaml
globalArguments:
  tracker: board
  definition:
    ...
  scenarios:
    - scenario: plan-waits-for-approval
      ...
```

## One scenario

One entry in the list, shown here on its own:

```yaml
scenario: plan-waits-for-approval
description:
  A reviewed plan waits for a person's approval, then goes on to implement.
externalRefs: { builtin: 'ext-12' }
steps:
  - record: { artifact: plan }
    payload:
      summary: Add list
      steps: [{ description: Add list, files: [x.ts] }]
      testingStrategy: Unit tests
      versionBump: { needed: true, reason: New method }
  - move: submit
  - record: { artifact: plan-review }
    payload: { findings: [] }
  - move: approve
    expect: { refused: "awaiting approval 'plan-approval'" }
  - wait: 1800
    note: The person reads the plan and the review
  - approve: plan-approval
  - move: approve
  - expect: { stage: implement }
```

`scenario` is a lowercase name; `description` and `externalRefs` (the work
item's ticket references, which some let values read) are optional. The work
item starts at the initial stage. Each step is one engine call, one verb:

| Step                                          | What it does                                                |
| --------------------------------------------- | ----------------------------------------------------------- |
| `record: { artifact: <name> }` with `payload` | Record an artifact, as `record_artifact` does.              |
| `record: { evidence: <name> }` with `payload` | Record evidence, as `record_evidence` does.                 |
| `approve: <gate id>` / `decline: <gate id>`   | A person's decision on a human-approval gate.               |
| `move: <transition>`                          | Take a transition, as `advance` does.                       |
| `move: <transition>` with `manual: true`      | A person's go for a manual transition (`confirm=true`).     |
| `override: { stage: <stage>, note: <text> }`  | A person grants one more entry into a stage past its limit. |
| `wait: <seconds>`                             | Time passes, for cooldowns and waits.                       |
| `expect: { stage: <stage> }`, as its own step | The work item must be at that stage.                        |

Any step but a `wait` can carry `expect: { refused: "<text>" }`: the step must
be refused, and the refusal must contain the text. Quote a distinctive part of
the gate's message, so the scenario pins it; `""` accepts any refusal. Any step
can carry a `note` saying why it is there.

The clock moves one second per engine call, plus each `wait`. Records and
automatic moves are an agent's; approvals, declines, overrides, manual moves and
evidence a person records (`recordedBy: person`) are a person's. Payloads must
pass the definition's schemas, as they would in a real work item. Write the
steps from the definition: the transitions out of each stage, the gates on them,
and the payload schemas.

## A walk the person copied from the studio

The studio's Simulate mode lets a person step a work item through by hand from
any frame of a scenario, and **Copy as scenario** gives them that walk as one
entry to paste to you, already indented for the `scenarios:` list:

```yaml
- scenario: plan-churn-walk
  description: Branched from plan-churn at step 15.
  steps:
    ...
    - move: approve
      expect: { refused: "transition 'approve' is not ready: ..." }
    - expect: { stage: plan }
```

It is a draft. Give it a name that says what the path shows, rewrite the
description in those terms, shorten each `expect: { refused }` to a distinctive
part of the refusal (it holds the engine's whole message), drop steps that do
not matter to the path, and ask the person what they meant it to pin if that is
not clear. Then add it to the factory's `scenarios:` list and run `validate`, as
for any scenario you write.

## After writing one

Run `validate` and fix what it reports:

```sh
swamp model method run <factory> validate
```

It runs every scenario in the factory's `scenarios:` list and names each step
that did not do what its scenario said, as
`scenarios.<index> (<name>) step <n> (<label>): <message>`; step 1 is the first
in `steps`. A scenario that is not well formed (an unknown key, two verbs in a
step, a name used twice) stops every factory method before it runs, with swamp's
`Global arguments validation failed: ... at "scenarios.<path>"`. A step that
should pass but was refused means the scenario or the definition is wrong: read
the refusal, then ask the person which one if it is not clear. Never weaken an
`expect` to make `validate` pass without the person's word, since the scenario
may be catching a real break.
