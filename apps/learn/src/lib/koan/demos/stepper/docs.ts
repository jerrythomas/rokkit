export const stepperDocs = `## Multi-step progress indicator

Stepper shows where the user is in a sequenced flow — sign-ups,
checkouts, wizards, onboarding. Steps can be completed, active, or
pending. Click any completed step to revisit. Linear mode locks the
user to forward-only progression.

## Basic example

Bind \`current\` to the active step index. Each step in the \`steps\`
array provides a \`text\` label and optional \`completed\` flag:

\`\`\`svelte
<script>
  let active = $state(0)
  const steps = [
    { text: 'Account',  completed: true },
    { text: 'Profile',  completed: false },
    { text: 'Confirm',  completed: false }
  ]
</script>

<Stepper {steps} bind:current={active} />
<Button onclick={() => active++}>Next</Button>
\`\`\`

## Step object fields

- **\`text\`** — label shown below (or beside) the circle
- **\`label\`** — custom text *inside* the circle (default: step number)
- **\`completed\`** — whether the step is finished (renders the check)
- **\`disabled\`** — prevents clicking
- **\`stages\`** — number of sub-stages (renders progress dots)

## Configuration

- **\`linear\`** — only allow forward progression. Combined with
  \`onclick\`, lets you gate by validation.
- **\`orientation\`** — \`horizontal\` (default) or \`vertical\`.
- **\`icons\`** — override the completed-state icon.

## Sub-stages

Set \`stages: 3\` on a step to render 3 progress dots within that
step. Bind \`currentStage\` to track the active sub-stage. Useful when
a single conceptual step has internal substeps (e.g. multi-page
form within a single wizard stage).

## Snippets

- **\`content\`** — snippet for the per-step content area, when the
  Stepper drives a full wizard layout

## Events

- **\`onclick(stepIndex)\`** — fires when a step circle is clicked.
  Combine with \`linear\` and your own validation to control transitions.
`
