# Driving a stagecraft work item

How to take a work item from start to done with the two stagecraft model types.
Every command here is checked by `integration/extension/skill_test.ts`: each
names a real method with inputs its schema accepts. The worked example,
[examples/build-swamp-extension.md](examples/build-swamp-extension.md), runs a
whole work item as written.

Placeholders are in angle brackets: `<key>`, `<factory>`, `<stage>`, `<cycle>`,
`<era>` and so on. Replace them, and nothing else.

## Contents

1. [The two model types](#the-two-model-types)
2. [Set up a factory](#set-up-a-factory)
3. [Start a work item](#start-a-work-item)
4. [Start from a ticket](#start-from-a-ticket)
5. [Read status](#read-status)
6. [The loop](#the-loop)
7. [Do the stage's work](#do-the-stages-work)
8. [Record products](#record-products)
9. [Advance: the propulsion rule](#advance-the-propulsion-rule)
10. [Human stops](#human-stops)
11. [Keep the ticket in step](#keep-the-ticket-in-step)
12. [Duplicates](#duplicates)
13. [When something fails](#when-something-fails)
14. [Resuming](#resuming)

## The two model types

- **`@swamp/stagecraft/factory`**, the factory: one instance whose
  `globalArguments` hold its factory definition (stages, work, products,
  transitions, gates), the tracker instance it publishes to, and its saved
  scenarios: `{ definition: {...}, tracker: <instance>, scenarios: [...] }`.
  Method: `validate`.
- **`@swamp/stagecraft/work-item`**: one instance per piece of work, named by a
  key, its ticket's id (`docs-12`), that the tracker's `claim` gives. `start`
  reads the factory's definition and pins a copy, so editing the factory never
  changes a running item; `reset` with `repin=true` adopts the edited
  definition. Every other method works on that copy.

Work-item methods are run by type, with the key as the instance name:

```sh
swamp model @swamp/stagecraft/work-item method run status <key>
```

Run methods without `--log`: swamp prints a method's output without it, and
twice with it. Read the output whole, never through `grep`, `sed`, `head` or
`tail`.

## Set up a factory

Once per factory, in the swamp repo. A new factory is authored with the person
([authoring.md](authoring.md)); for their first,
[getting-started.md](getting-started.md) walks them through it. A factory's
model definition, `models/@swamp/stagecraft/factory/<factory>.yaml`, holds its
factory definition under `globalArguments.definition`. That is the one copy of
the definition: edit it there.

A factory also names the tracker instance its work items publish to, and the
instance must exist first. Its type is the one the definition's `tracker.kind`
needs: the built-in tracker (`@swamp/stagecraft/tracker`) when the definition
names no kind, or Linear (`@swamp/stagecraft/linear`, with its token wired from
a vault) for `kind: linear`. The instance keeps the tracker's settings, such as
the built-in tracker's `prefix`, `statuses` and `types`. With no external
tracker, create the built-in one once per project:

```sh
swamp model create @swamp/stagecraft/tracker board \
  --global-arg prefix=<prefix> --json
swamp model create @swamp/stagecraft/factory <factory> \
  --global-arg tracker=board --json
# agent: write starter into <factory>
```

Then write an example into the factory: put the `definition:` and `scenarios:`
blocks of the closest one in [examples/](examples/) (`minimal`, `starter` or
`build-swamp-extension`) under the factory's `globalArguments:`, right after its
`tracker:` line and before `methods:`, each indented two more spaces. Never
replace a definition that is already there. Then edit it: change what its
description's "Change first" paragraph names, and rewrite the description for
your process. swamp does not check the file when it is saved: it checks the
definition's schema before each factory method runs, and
`swamp model validate <factory>` runs that check alone. `validate` checks the
rest too, and refuses a factory whose tracker instance is missing or of another
kind than the definition's:

```sh
swamp model method run <factory> validate
```

`validate` reports every problem with its path. Fix them all before starting
work. It also runs the factory's saved scenarios, the known paths through it,
from its `scenarios:` list; write one for each path the factory must keep
([scenarios.md](scenarios.md)).

When a person wants to watch your edits to a factory definition or its
scenarios, or to play the scenarios and step a work item through by hand, point
them at the studio: a read-only local page that reloads the factory's model
definition as you save it, plays its saved scenarios on the engine (Simulate),
and shows every work item of the factory by stage (Board), moving the cards as
you drive them, with the ones waiting on a person highlighted. Each view has its
own address, such as `/f/<factory>/board` after the logged URL. They start it
themselves, since it runs until Ctrl-C:
`swamp model create @swamp/stagecraft/studio studio` once, then
`swamp model method run studio serve`, which logs the URL.

A work item's page in the studio has a Ticket tab: the ticket's description,
comments and relations as the tracker last recorded them. The studio never calls
the tracker, so when the person wants it current, run the tracker's
`fetch_issue` for the ticket; they press Refresh.

A walk the person copies from Simulate (Copy as scenario) comes to you as a
scenario entry; see [scenarios.md](scenarios.md), "A walk the person copied from
the studio".

The studio's Copy reference gives the person one line to paste to you. It names
the factory's model definition file, a document path in it, and a readable name,
and for a finding its code and message:

```text
models/@swamp/stagecraft/factory/team.yaml globalArguments.definition.stages.2.transitions.0 (exit submit: plan → review)
models/@swamp/stagecraft/factory/team.yaml globalArguments.definition.stages.2.transitions.0 (exit submit: plan → review) ambiguous-exit: <message>
```

Find the path in the file: under `globalArguments.definition`,
`stages.2.transitions.0` is the first exit of the third stage, and `.gates.1`
after it would be that exit's second gate. Check that the readable name matches
what is there, since the file may have changed since the line was copied. Make
the change the person asks for, then run the factory's `validate` method. The
page re-checks the file when you save it.

### The studio on a deployed serve

When the factories and work items live on a deployed `swamp serve`, not in this
repo, the studio can show those instead. Any local swamp repo will do; `serve`
takes the serve's URL as `server`:

```sh
# background: runs until Ctrl-C, and logs its URL
swamp model method run studio serve --input server=wss://swamp.example.com
```

`server` is a ws, wss, http or https URL with no credentials in it. The studio
reads with the person's own swamp login and grants on that serve, as any
`--server` command does, and only reads: it runs no method there, writes nothing
and takes no lock. It reads only while a studio page is open, every 15 seconds,
slowing to 60 while nothing changes, so a change usually shows within that; a
slow serve can delay it. With no page open it reads nothing. If the first read
fails (a wrong URL, no login, no grant), `serve` stops before it listens and
says why. The page shows the definition as YAML written from the serve's data,
so the file's comments and layout are not there.

`server` cannot be combined with `publicOrigin`: the studio reads with the
person's identity, so it answers on 127.0.0.1 only.

## Start a work item

Work starts from a ticket: file one on the factory's tracker if there is none
(see [Start from a ticket](#start-from-a-ticket)), claim it, and run the `start`
command `claim` prints. The work item's key is the ticket's id (`docs-12`,
`abc-12`), and it does not change if the work does. Since the key does not say
what the work is, `start` takes the work's `title`: the run record keeps it, and
`status`, the summary and the studio show it beside the key.

`start` also takes any unused name, so a person may choose a key by hand for
work with no ticket:

```sh
swamp model @swamp/stagecraft/work-item method run start <key> \
  --input factory=<factory> --input 'title=<title>'
```

swamp reads a value beginning with `@` as a file's path, so pass such a title as
JSON: `--input 'title:json="<title>"'`, the form `claim` prints.

The code links a work item to a ticket only through `externalRefs`, a JSON
object mapping tracker to id, which the command `claim` prints sets.

## Start from a ticket

When the work comes from a tracker ticket (a Linear issue, a built-in tracker's
ticket, or one on a tracker written as a separate extension), start it through
the shipped claim workflow, on the instance the factory is bound to, so the same
ticket never starts twice:

```sh
swamp workflow run @swamp/stagecraft/claim --input tracker=<tracker> \
  --input issue=<ticket> --input factory=<factory>
```

`issue` is the ticket's id or its display identifier (`ABC-12`, `docs-12`).
`claim` answers in the workflow's output, on a line from one of its rounds
(`round-2 │ ...`), in one of these ways:

- **`is claimed as '<key>'. Start it: swamp model ...`**: the ticket had no work
  item, so `claim` reserved a key and recorded it in the adapter's ticket index.
  The key is the ticket's id, lowercased: `abc-12` for Linear's `ABC-12`,
  `docs-12` for a built-in ticket, and the tracker's prefix before a number-only
  id. A later work item on the same ticket adds a number: `abc-12-2`. If another
  work item already has the name (two trackers with one prefix), the tracker
  instance's name is added: `abc-12-linear`. Run the printed `start` command
  exactly as printed; it carries the ticket's `externalRefs` and title.
- **`not started yet. Start it: ...`**: an earlier claim reserved this key but
  its `start` never ran (or failed). Run the printed command. If it fails
  because the reserved factory no longer loads, claim again with another
  `factory`.
- **`is claimed as '<key>', now under factory '<factory>'`**: the reserved
  factory no longer loads, so the reservation moved to the factory you passed,
  under the same key. Run the printed command.
- **`is already started: '<key>' at stage '<stage>'`**: drive that work item.
  The answer names its factory; a different `factory` you passed was not used.
- **`is a duplicate of <primary>; work on <primary> instead`**: the ticket was
  marked a duplicate, so it takes no work. Claim the primary instead (see
  [Duplicates](#duplicates)).

If anything fails between `claim` and `start`, run `claim` again: it hands back
the same key and command. `factory` is only needed when a new key is reserved;
once a ticket's work item has finished, or a retarget moved it to another
ticket, claiming it again reserves a new one. To only look, add
`--input dryRun=true`: `claim` then reports the ticket's work item, or that it
has none, and writes nothing. `claim` never comments on or moves the ticket.
Never choose a key by hand for a ticket's work item; `claim` names it.

To file a new ticket, for new work or when the person asks for one, run the
create workflow on the tracker's instance, then claim the id it prints (the
built-in tracker numbers them: `docs-1`, `docs-2`):

```sh
swamp workflow run @swamp/stagecraft/create --input tracker=<tracker> \
  --input 'title=<title>' --input 'body=<body>' --input 'type=<type>'
```

The type must be one the tracker has (the built-in tracker: its `types`; Linear:
a type its `types` argument maps to a label). When the person wants the ticket
to carry an id from a system with no stagecraft tracker (a Jira ticket such as
`SREMON-2131`), the built-in tracker's own `create` method takes
`--input id=<id>`
(`swamp model method run <tracker> create --input id=<id> ...`, with the same
title, body and type): the ticket shows it as written and its work item's key is
it lowercased. It is a label only; say that nothing syncs with the other system.
Never re-run a `create` that may have gone through: check the tracker first,
since a retry files a second ticket.

## Read status

`status` is the only view of the work item to act on. It is a read method: it
takes no lock and writes nothing. Every write (`start`, `dispatch`, `record_*`,
`approve`, `decline`, `grant_override`, `advance`, `reset`, `retarget`) ends its
output with this same block, as it stands after the write, and that counts as
reading status. A refused write prints only its error: read `status` again.

```sh
swamp model @swamp/stagecraft/work-item method run status <key>
```

```text
team-1 (Add a list method): active at stage 'plan-review' cycle 1
  expect: --input expectedStage=plan-review --input expectedCycle=1 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  exit approve -> implement [human: plan-approval]: not ready: human-approval: awaiting approval 'plan-approval' (0/1) for stage 'plan-review' cycle 1
  exit rework -> plan: not ready: cel: rework needs an open critical or high finding
  exit revise -> plan (manual): not ready: evidence-recorded: evidence 'plan-feedback' has not been recorded
  exit abandon -> abandoned [human: abandon-confirmation]: not ready: ...
  a person records: plan-feedback
  work: dispatch; dispatches this cycle 1 of 2
```

| Line                                  | Meaning                                                                                                                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `active at stage '<stage>' cycle <n>` | Where the item is. `terminal` means it has finished; nothing more can be written.                                                                                    |
| `expect: ...`                         | The expectation. Copy these three `--input` flags into every write except `record_usage`. A write whose expectation no longer matches is refused.                    |
| `exit <name> -> <to>`                 | One way out of the stage, including global ones such as `abandon`.                                                                                                   |
| `(manual)`                            | Only a person can send the item this way, and `advance` needs `confirm=true`.                                                                                        |
| `[human: <gate-id>, ...]`             | The exit has human-approval gates a person must decide now. A person decides them, even once they pass.                                                              |
| `[approval not required now: <id>]`   | A conditional approval whose `when` is false right now: it passes and no one is asked. It can become `[human: ...]` when the data changes.                           |
| `ready` / `not ready: ...`            | Whether `advance` would take it now. Each failure names the gate, what it needed and what it found; a cycle limit shows here too.                                    |
| `a person records: <name>, ...`       | Evidence of this stage that a person gives, such as their feedback. Never record it yourself: record the person's words, on their behalf.                            |
| `work: <mode>; dispatches this cycle` | The stage's work mode, and how many dispatches this stage and cycle has had of its cap; `interruptions I of M` once any was interrupted.                             |
| `open dispatch <id> since ...`        | A dispatch of this stage and cycle with no outcome: work in flight, or work that died. See [Outcomes, restarts and checkpoints](#outcomes-restarts-and-checkpoints). |
| `dispatch not ready: ...`             | The stage's packet cannot be built: a let value failed, a placeholder has no value, or a call's target is not a name swamp accepts. Fix the run data it names.       |
| `rejected <kind> '<name>' (...): ...` | The latest rejection of that product, kept as retry feedback until the product is recorded.                                                                          |

To read a recorded product itself (to show a person, or to check a value), get
its record. Artifacts are `artifact-<name>`, evidence is `evidence-<name>`.
`--select content --single` prints the payload as one object, and fails when the
record is missing or not alone:

```sh
swamp data query 'modelName == "<key>" && name == "artifact-<name>"' --select content --single --json
```

That is the latest version. An earlier one, such as the plan version a ticket
entry says was approved, is read by its number (stagecraft's answer to
issue-lifecycle's `review --input version`):

```sh
swamp data query 'modelName == "<key>" && name == "artifact-<name>" && version == <version>' --select content --single --json
```

## The loop

1. `status`.
2. If the item is terminal, stop and report.
3. `dispatch`, then do the stage's work.
4. Record each product the stage's work records (the packet's `products`), one
   write per command.
5. Read the status the last write printed, and apply the propulsion rule:
   advance, or stop and ask.
6. Repeat.

## Do the stage's work

Start every stage's work, whatever its mode, with `dispatch`:

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

It records the resolved inputs and prompt for later replay, counts toward the
stage's dispatch cap (one refused past it parks the work item for a person; see
"When something fails"), and prints the dispatch id and the packet: the rendered
prompt, then the rest as JSON (`mode`, `subagents`, `values`, `inject`,
`products`, and for workflow and method stages `inputs` with the `workflow` or
`method` to call). `products` lists every artifact and evidence the stage's work
records, each with the `schema` its payload must meet: record each one. Evidence
a person records (`recordedBy: person`, which `status` lists under
`a person records:`) is not in it; see
[Evidence a person records](#evidence-a-person-records). Dispatch once per
attempt at the work, not once per tool call.

For a dispatch stage, pass your scratch directory as `resultDir`. Leave it out
and the engine makes a new temporary directory:

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input resultDir=<scratch-dir> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

Instead of the rendered prompt, the output then prints one prompt per subagent,
each between these two lines:

```text
--- subagent <n> of <total> (<skill>) prompt; send it as it is ---
--- end subagent <n> prompt ---
```

The `(<skill>)` part appears only when the stage lists skills. Each prompt
starts with the rendered prompt and goes on to name the skill to follow, a
`swamp data query` read for each injected product, and a result file for each
product with its schema. The dispatch records these prompts as they were
printed. The status block comes after the last end line, so it is never part of
a prompt.

Then, by `mode`:

- **interactive**: do the work yourself, following the prompt.
- **dispatch**: start one subagent per printed prompt, from this repo's
  directory, and send each its prompt exactly as printed. Copy it from the
  dispatch output; never retype it, shorten it or add to it. Never change a
  reviewer's scope, its severity guidance or its stance. A decision the person
  made (say, that a risk is accepted) belongs in the product under review or in
  an approval note, never in a prompt. Each subagent writes its result to the
  files its prompt names. Record those files as they are (see
  [Record products](#record-products)).
- **workflow** or **method**: run the workflow or model method the packet names
  (its `workflow`, or its `method`'s `modelIdOrName` and `methodName`), with the
  packet's `inputs`. Call exactly that name: the engine filled any placeholders
  in it, so never call the definition's template or build the name yourself.
  Then record the stage's result evidence with the real run id and outcome:
  `{"status":"succeeded","runId":"<run id>"}`, or `failed`. Never record a run
  you did not see finish. (The bundled factory definition has no such stage.)

A factory definition is in one stage at a time, so work that runs in parallel
does so inside one stage. Such a stage names a wrapper workflow whose jobs run
at once, often each nesting another workflow. swamp-extensions' `verify` stage
is one: it runs verify-build and verify-reviews together. Its result evidence
records each part, not only the wrapper:

- The wrapper's own run id and status are `runId` and `status`. The wrapper
  fails if any part failed.
- A part that succeeded has its run id in the wrapper's run record (the `path`
  that `swamp workflow run --json` prints), as the step's `output.runId`.
- A part that failed has none there. Find it with
  `swamp workflow history search <workflow name> --json`, and check that its
  inputs name the same commit.

See DESIGN.md, "Parallel work inside one stage", for the rule and the pattern.

Attach each subagent's usage to its dispatch as soon as it hands back. The
number comes from the harness's report of the subagent, not from anything the
subagent says: a subagent cannot see its own token count, so never ask one (a
reviewer included) to report it. In Claude Code the report is the `<usage>`
block of the subagent's task notification, or of the Agent tool result when the
call was synchronous: `subagent_tokens` is `totalTokens`, and `tool_uses` and
`duration_ms` are `toolUses` and `durationMs`. That is one total, with no
input/output split; give `inputTokens` and `outputTokens` too only when the
harness reports them. Take `model` from the model the Agent call resolved to.
Several subagents on one dispatch each report their own count: record their sum.
`record_usage` takes no expectation, since usage arrives after the item may have
moved on, and each dispatch takes usage once:

```sh
swamp model @swamp/stagecraft/work-item method run record_usage <key> \
  --input dispatchId=<dispatch-id> --input totalTokens=<tokens> \
  --input toolUses=<tool-uses> --input durationMs=<duration-ms> \
  --input model=<model>
```

Interactive work (your own planning, implementing and checking) has no usage you
can see, so do not record any: the summary counts those dispatches as without
usage, by mode, and that is expected.

### Outcomes, restarts and checkpoints

A dispatch is open until it has an outcome. When you know how the work ended,
record it, once: `succeeded`, `failed` or `interrupted`. Like usage, it takes no
expectation:

```sh
swamp model @swamp/stagecraft/work-item method run record_outcome <key> \
  --input dispatchId=<dispatch-id> --input outcome=succeeded
```

A driver that may be restarted (a serve, a runner, a remote worker) names itself
on every dispatch with `driverId`, since swamp gives no actor on remote workers.
At startup and on an interval it runs one scan:

```sh
swamp model @swamp/stagecraft/work-item method run open_dispatches <key> \
  --input driverId=<your-id>
```

Any open dispatch under your id that you are not running now is dead: a restart
killed it. Dispatch again at once, naming its id in `supersedes`, which closes
it as `interrupted`:

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input driverId=<your-id> --input supersedes=<dispatch-id> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

An interrupted dispatch does not count against the dispatch cap. It counts
against the stage's `maxInterruptionsPerCycle` (3 by default), so the scan
cannot loop. Never call a failure an interruption: a failed attempt is `failed`.
The scan cannot see a call that is still running while its remote run died; when
that call fails, supersede its dispatch then.

Long work saves its progress as it goes, so a retry can resume. Write a
checkpoint for the open dispatch as often as it is useful; only the latest
dispatch of the stage and cycle takes one:

```sh
swamp model @swamp/stagecraft/work-item method run record_checkpoint <key> \
  --input dispatchId=<dispatch-id> --input payload='{"session":"<id>","step":4}'
```

Keep checkpoints small. When the state is large, such as an agent session, store
it where it already lives (a branch, a session file) and checkpoint a pointer to
it. The next dispatch of the same stage and cycle prints the latest checkpoint
as `resume`, with the command that reads it; a dispatch stage's subagent prompts
include that read. Resume from it rather than starting over. A workflow or
method stage gets `workItem`, `dispatchId` and `resume` as its `_stagecraft`
input when its `inputsSchema` declares it (see authoring.md); otherwise pass the
packet's values on yourself.

## Record products

Record each artifact and each piece of evidence the stage declares (the packet's
`products`). Give the payload as JSON in single quotes:

```sh
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=<name> --input payload='<json>' \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_evidence <key> \
  --input name=<name> --input payload='<json>' \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

If the payload contains a single quote, put all the inputs in a YAML file (keys
`name`, `payload` as a mapping, and the three expectation keys) and pass that
instead:

```sh
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input-file <path>
```

A subagent's product is never typed out again. Record the result file it wrote,
with `@` and the path from its prompt, so swamp reads the payload from the file:

```sh
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=<name> --input payload=@<result-path> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

You may read the file to show the person. Never edit it. If it is missing, is
not JSON, or is refused by its schema, send the subagent back to fix it (with
SendMessage, or your harness's way of continuing a subagent). Do not repair it
yourself.

When several subagents review into one findings artifact, join their files
mechanically and record the joined file. Each subagent's prompt has it start its
finding ids with its own number, so the join repeats no id. Fields other than
`findings` come from the first file:

```text
jq -s '.[0] + {findings: map(.findings) | add}' <result-path-1> <result-path-2> > <joined-path>
```

Recording the same name again makes a new version; gates and let values read the
latest. A `findings` artifact (a review) holds
`{"findings":[{"id":...,"severity":"critical|high|medium|low","description":...}]}`.
To resolve a finding, record the artifact again with `"resolved":true` and a
`resolutionNote` on it. That changes the product, so any approval bound to the
old version stops counting.

Evidence is a fact about the world, such as a check run or a release. Record
only what you observed, with the values you observed.

### Evidence a person records

Some evidence is a person's, not the work's: the factory definition declares it
`recordedBy: person`, and `status` lists it under `a person records:`. The
bundled definitions' `plan-feedback` is one: `revise` from plan-review needs the
person's feedback on the plan, and the next plan is handed it. Never write it
yourself, and never record it because a gate asks for it. Record it only when
the person gives it, in their words, and on their behalf:

```sh
swamp model @swamp/stagecraft/work-item method run record_evidence <key> \
  --input name=plan-feedback --input payload='{"feedback":"<their words>"}' \
  --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

It counts for the pass it was recorded in, like any evidence a gate reads:
feedback from an earlier pass does not open `revise` again.

## Advance: the propulsion rule

After recording, read the status the write printed and sort the `ready` exits
into two kinds:

- **Yours**: ready, not `(manual)`, and no `[human: ...]`. An
  `[approval not required now: ...]` marker does not make an exit the person's.
- **The person's**: ready and `(manual)`, or ready with `[human: ...]`.

A manual exit with no gates, such as `recheck`, shows `ready` all the time. It
is a way back that is there for the person. Its being ready never counts as a
reason to stop, and never as a reason to take it. The same holds for a manual
exit with gates, such as `complete`, while one of your exits still waits on a
product you record in this stage.

Then:

- **Exactly one exit is yours, and no human-gated exit is ready**: advance on it
  now, without asking.
- **Several exits are yours**, or one is yours and a human-gated exit is also
  ready: stop and ask which to take.
- **None is yours, and a human-approval gate is what stands in the way**: stop
  and ask the person. See [Human stops](#human-stops).
- **None is yours, a manual exit with gates is ready, and you have recorded what
  your exits need** (their failures name products already recorded, such as a
  failed merge): stop and ask the person which way to go.
- **None is yours and no person is needed**: the stage's work is not done. Read
  the failures and do what they name.

Take a manual exit only when the person asks for it.

```sh
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=<transition> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

`advance` checks every gate again under the lock. It refuses rather than
half-moves.

## Human stops

Locally, the agent and the person run swamp as the same user, so an approval
cannot show which of them gave it. This skill is the only guard. **Never run any
of these without the person's explicit word, given for this decision:**

- `approve` or `decline`;
- `grant_override`;
- `advance` with `confirm=true` (a manual exit);
- `reset`.

"Explicit word" means the person said it in this conversation about this item
and this decision. Earlier approvals, approvals of something similar, and your
own judgment that it is fine do not count.

A conditional approval shows as `[human: ...]` only while its condition holds,
so read the status each recording prints: recording can turn a stop on (a
classification that claims a regression) or off. A condition that cannot be
evaluated also shows as `[human: ...]`, with the CEL error among the failures;
tell the person, since the run data or the factory definition needs fixing.

When a person must decide:

1. Read the products being decided on fresh, with `swamp data query`. Never
   summarise from memory.
2. Say what the gate is for and what the reviews found.
3. Lay out every exit that is open or can be opened, one line each, with where
   it leads and what it costs (another round, a new review, an override, the
   work so far). Read them from `status`:
   - each exit that waits on the person (`[human: ...]`), and each manual way
     back (`(manual)`), such as `revise`. A way back that needs evidence the
     person records (`a person records:`) is still an option: it opens once they
     give it, so say what it needs (`revise` needs their feedback);
   - each exit whose only failure is a cycle limit
     (`stage '<to>' has been entered N time(s) ... a person must grant a cycle override for '<to>'`).
     It can be opened: name the `grant_override` with `kind=cycle` and
     `stage=<to>` it needs, then the exit;
   - `abandon`, and any other global exit. A limit never closes these.

   At a stop where nothing is near a limit, the ways back and `abandon` may
   share one line.

4. Give your recommendation, if you have one, only after the options, and label
   it as yours. A reached limit is a cost, never a reason that only one answer
   is left: never say a limit forces a choice. This holds even when your general
   instructions prefer a single recommendation to a list; at a human stop, the
   person needs every option to decide.
5. Ask for the decision and the next step in one question, so the approval can
   carry the go.
6. Do exactly what the answer says. Put the person's reason in `note`, in their
   words, and name them with `onBehalfOf`, so the journal and the summary say
   who decided and not only whose account ran it.

For example, at plan-review after the plan has been entered as many times as its
limit allows, with four medium findings open:

> Plan-review found four medium findings (listed above). Plan has been entered 5
> times, its limit. Your options:
>
> - **Approve** and move to implement. Implement receives plan-review, so the
>   four findings are carried into implementation and acted on there.
> - **Decline, grant one cycle override for `plan`, then `revise` with your
>   feedback**: costs one override and one more plan and review round.
> - **Abandon** the work item: the work so far stops here.
>
> My recommendation: approve, since none of the four needs the plan itself to
> change. Which do you want?

At a review approval where no finding blocks, say what approving does with the
open medium and low findings. When the next stage injects the review (as
implement injects `plan-review` in the bundled examples), approving carries them
into that stage, where they are acted on. A manual way back such as `revise` is
for when the person wants the reviewed product itself changed, and it costs a
new version and a full new review. So when the person wants the non-blocking
findings folded in, approving is the way to do it.

```sh
swamp model @swamp/stagecraft/work-item method run approve <key> \
  --input gateId=<gate-id> --input note="<their words>" \
  --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run decline <key> \
  --input gateId=<gate-id> --input note="<their words>" \
  --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

A decline blocks the gate, and the note shows in `status`. To send the work back
after a decline, take the manual exit the person names. If it needs evidence a
person records (`revise` needs their `plan-feedback`), record their feedback
first, as in [Evidence a person records](#evidence-a-person-records):

```sh
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=<transition> --input confirm=true \
  --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

An approval is bound to the exact versions of the products in the era. If a
product it covered is recorded again, the approval stops counting and the person
must decide again.

## Keep the ticket in step

When the work item was started with `externalRefs` for its tracker, publish it
after each write, through the shipped publish workflow on the tracker instance
its factory was bound to when it started (`<tracker>`; publish refuses any other
instance):

```sh
swamp workflow run @swamp/stagecraft/publish --input tracker=<tracker> \
  --input workItem=<key>
```

A run that stopped, or did not finish in its rounds, fails its last step with
the reason; run it again once the reason is fixed, and it carries on from what
was delivered.

`status` says when the ticket is behind. It reads the tracker's publish cursor,
with no network call, and while events are waiting it prints a line such as:

```text
tracker 'board' behind by 2 event(s): run publish on it
```

Once all are delivered it prints no tracker line. So the loop is: after each
write, read the status it printed, and run `publish` whenever it says the
tracker is behind. `publish` prints no status of its own, so before stopping for
a person run `status` and make sure it no longer says so. If it says
`lag unknown`, run `publish` anyway.

If `status` says `tracker 'board' could not move the ticket to '<key>'`, the
events were delivered but the ticket's status was not. Its reason says what to
fix (often a key missing from the tracker's `statuses` argument, which a person
sets); tell the person, and run `publish` once it is fixed. Later publishes
still deliver new events meanwhile.

`publish` posts a comment for each new event a person on the ticket needs, and
moves the ticket when the stage's status key changes. When the factory
definition declares tracker entries and the tracker keeps them (the built-in
tracker does), it writes those lifecycle entries instead of comments, and sets
the ticket type an entry names. The publish that delivers the work item's start
also assigns the ticket to the person logged in to swamp (on the built-in
tracker; on Linear, the owner of the API key), so there is no separate assign
step; if it cannot, it warns once, and you tell the person. It is the only thing
that writes the ticket's status and type: never call `set_status` or `set_type`
for a work item yourself. Running it again delivers only what is new. A failed
publish never blocks the work item, but the ticket falls behind until it
succeeds, and the ticket may be the team's audit trail: after a failure, run it
again before moving on. An entry the tracker refuses outright is skipped and
logged as a warning; tell the person which one.

When the work belongs to another ticket (for example the ticket turned out to
duplicate another), a person may move the work item there, on their word:

```sh
swamp model @swamp/stagecraft/work-item method run retarget <key> \
  --input 'externalRefs={"builtin":"<id>"}' \
  --input reason="<their words>" --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

`retarget` replaces the whole `externalRefs` map and records who moved it and
why. Nothing else changes: the stage, cycle, products and approvals stay as they
were. The next `publish` finishes the old ticket (what it had not been sent yet,
then a note saying where the work went) and carries on at the new one (a note
saying where it came from, the status, then every later event). The earlier
history stays on the old ticket. The reason is kept in the work item, not posted
on either ticket. That `publish` also moves the ticket index to the new ticket,
so `claim` there finds this work item, and `claim` on the old ticket reserves a
new one. Publish right after a retarget: a `claim` on the new ticket before then
reserves a second work item, and `publish` refuses to move the index onto a
ticket that already has one.

## Duplicates

A duplicate ticket's work belongs to its primary, the ticket it duplicates.
There are two ways to mark one.

**A person marks it** through the tracker workflows (or in the tracker itself):

```sh
swamp workflow run @swamp/stagecraft/mark-duplicate --input tracker=<tracker> \
  --input issue=<duplicate> --input primary=<primary>
```

`mark_duplicate` relates the ticket `duplicate_of` the primary and closes it
(Linear moves a duplicate to its own Duplicate status itself). It moves no work.
If the duplicate has a work item at work, `publish` for it is then refused with
`is a duplicate of <primary>` and both moves; make one, on the person's word:
retarget the work item onto the primary when the primary has no work item (see
[Keep the ticket in step](#keep-the-ticket-in-step)), or take the definition's
duplicate exit when it has one. A work item that has finished still publishes to
the duplicate.

**You find it while working**, in a factory definition with a duplicate mark
(both shipped examples have one, on `plan`). The stage's prompt says what to do:

1. Check whether the primary has a work item without writing anything:
   `claim --input issue=<primary> --input dryRun=true`.
2. Record `duplicate-of` with the primary's stable id, its display id and why,
   and stop for a person to approve `duplicate-confirmation`.
3. Once approved, move the work. The primary has no work item: run `retarget`
   onto the primary's `externalRefs`, then `publish` at once, and carry on with
   the primary's work in the same work item. The primary has one: take the
   `duplicate` exit. After a retarget the exit is closed, so the approved gate
   cannot end what is now the primary's work.

`publish` marks the ticket a duplicate when it delivers the approval: it relates
it `duplicate_of` the primary and closes it, and no later status write reopens
it. A declined approval marks nothing.

## When something fails

A failed write exits non-zero with its reason. Nothing is ever half-written.

| What you see                                                           | What happened                                                                                                                       | What to do                                                                                                                                                                      |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stale: the work item is at stage ...`                                 | Your expectation is out of date. The item moved, or you copied it wrong.                                                            | Read `status` and use its `expect` line. Then decide again: the move may have changed what to do.                                                                               |
| `<kind> '<name>' was rejected and kept as retry feedback:`             | The payload broke its schema. It is kept on the item and shown in `status`.                                                         | Fix the payload using the errors, then record it again. The rejection clears when a valid version is recorded.                                                                  |
| `transition '<name>' is not ready: ...`                                | A gate failed. Nothing moved.                                                                                                       | Read `status`. Do the work the failures name, or ask the person if a human gate is in the way.                                                                                  |
| `transition '<name>' is manual: a person must confirm it`              | You tried a manual exit without `confirm=true`.                                                                                     | Ask the person. Only on their word, run it again with `confirm=true`.                                                                                                           |
| `stage '<to>' has been entered N time(s) in this era, its limit is M`  | The cycle limit of the stage the exit enters.                                                                                       | Stop. Tell them why the stage keeps coming back, and lay out every exit, an override among them.                                                                                |
| `runaway loop suspected: stage ... has had N dispatch(es)`             | The dispatch cap for this stage and cycle. The item is now parked, waiting on a dispatch override, and the journal says so.         | Run `publish` so the ticket shows the park. Stop. The work keeps failing: tell the person what went wrong. Only on their word, grant a dispatch override, then `publish` again. |
| `restart loop suspected: stage ... has had N interrupted dispatch(es)` | The interruption cap for this stage and cycle. The dispatch you superseded is closed, and the item is parked like the dispatch cap. | Run `publish`. Stop. Something keeps killing the work: tell the person what. Only on their word, grant a dispatch override (it lifts this cap too), then `publish` again.       |
| `stale: dispatch N was recorded after this packet was built`           | Another dispatch of this item was recorded while yours was being built. Nothing was written, and nothing parked.                    | Read `status`, check whether that dispatch is yours to wait on, then dispatch again if the work still needs doing.                                                              |
| `stage '<stage>' is not ready to dispatch:`                            | A let value failed, a placeholder has no value, or a call's target is not a name swamp accepts.                                     | Record the product the let value reads, then dispatch again.                                                                                                                    |
| `the work item finished at stage '<stage>'`                            | It has finished.                                                                                                                    | Nothing to do.                                                                                                                                                                  |

Overrides, on the person's word:

```sh
swamp model @swamp/stagecraft/work-item method run grant_override <key> \
  --input kind=cycle --input stage=<stage> --input note="<their words>" \
  --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run grant_override <key> \
  --input kind=dispatch --input note="<their words>" \
  --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

A cycle override names the stage that is being re-entered, which is the target
of the exit, not the current stage. Each grant adds exactly one entry or
dispatch, and grants add up.

### Ways back, so nothing wedges

- **Manual exits.** A well-made factory definition gives a person a way back
  wherever work can be declined or blocked, so a decline never leaves `abandon`
  as the only exit. The bundled factory definition has `revise` after either
  review, `recheck` from implement, and `rework` from release. Take one only on
  the person's word. `revise` after the plan review needs the person's feedback
  recorded first, which a person can always give.
- **Global exits** such as `abandon` are open from every stage, are never closed
  by a cycle limit, and need the person's approval.
- **`reset`** is the last resort. It starts the item over at the initial stage
  in a new era: every product, approval and count from before stops counting,
  though the history is kept. It needs `confirm=reset` and the person's word.
  `repin=true` also adopts the factory's current definition.

```sh
swamp model @swamp/stagecraft/work-item method run reset <key> \
  --input confirm=reset --input onBehalfOf=<person> \
  --input expectedStage=<stage> --input expectedCycle=<cycle> --input expectedEra=<era>
```

Never reset to get past a refusal you do not understand. Read `status` and ask
first.

## Resuming

In a new session, or after anything unexpected, trust `status` and nothing else:
not memory, not the conversation, not what you meant to do. Run it, then go on
from the loop. If a person's decision was pending, ask again; an answer given
before is not a go now unless they say so.
