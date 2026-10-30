import { type InteractionState } from "./interaction-inventory"
import { interactionExamples, type InteractionExample } from "./interaction-examples"

// Individual component behavior belongs in Components, not the shared-state catalog.
const componentSpecificIds = new Set([
  "breadcrumb", "code-disclosure", "checkbox", "radio", "switch", "slider",
  "calendar-day", "calendar-selection", "calendar-dropdown",
  "status-emerald", "status-amber",
  "copy",
])
export const interactionExhibitExamples = interactionExamples.filter(rule => !componentSpecificIds.has(rule.id))

interface PatternDefinition {
  name: string
  ids: string[]
  states?: string[]
  value: string
}

// Keep the source inventory; exhibit each behavior once, with its consumers attached.
const definitions: PatternDefinition[] = []
function pattern(name: string, ids: string, value: string, states?: string[]) {
  definitions.push({ name, ids: ids.split(" "), value, states })
}

pattern("Primary fill", "button-default action-white", "primary → primary/90 · disabled interface-secondary / 80%", ["Default", "Hover", "Focus", "Disabled"])
pattern("Secondary fill", "button-secondary settings-secondary action-zinc", "button-secondary → button-secondary-hover")
pattern("Destructive fill", "button-destructive", "destructive/60 → destructive/90 (dark)")
pattern("Ghost overlay", "button-ghost header-button settings-ghost search-clear", "interaction-button-hover")
pattern("Subtle fill", "toggle-glass pagination select-ghost", "interaction-button-hover / interaction-subtle")
pattern("Raised fill", "select-glass date-apply", "interaction-subtle → interaction-raised")
pattern("Semantic tint", "action-rose action-orange", "semantic fill 10% · border 30%")
pattern("Control highlight", "select-item combobox-item dropdown-item date-item", "interaction-hover-control / contrast/8")
pattern("Row emphasis", "table member-row settings-row project-row activity-row activity-metric", "hover 4% · selected 6%")
pattern("Summary hover", "stats-item", "hover 4% · background only")
pattern("Navigation selection", "sidebar-product sidebar-brand sidebar-account", "hover 8% · selected / open 10%")
pattern("Selected tab", "tab-default tab-ghost", "selected 10% (default) / 8% (ghost)")
pattern("Selected indicator", "tab-line", "border-contrast · text-interface-contrast")
pattern("Stronger boundary", "input input-group input-group-unit search select-default combobox-default textarea combobox-ghost panel stats-panel detail-panel date-range date-presets date-clock", "boundary-default → strong → focus (fields)")
pattern("Fill + boundary", "project-card workspace-empty", "hover / selected 4% · boundary-strong")

const feedbackNames = new Set(["Disabled", "Invalid", "Active + invalid", "Loading"])

export interface InteractionPattern {
  id: string
  name: string
  value: string
  rules: InteractionExample[]
  preview: InteractionExample
  cases: { rule: InteractionExample; state: InteractionState; label: string }[]
}

export const interactionPatterns: InteractionPattern[] = definitions.map(definition => {
  const rules = definition.ids.map(id => {
    const rule = interactionExhibitExamples.find(example => example.id === id)
    if (!rule) throw new Error(`Missing interaction example: ${id}`)
    return rule
  })
  const representative = rules[0]
  const states = representative.states.filter(state => state.name !== "Pressed" && (definition.states ? definition.states.includes(state.name) : !feedbackNames.has(state.name)))
  if (states.length < 2) throw new Error(`Missing comparison states: ${definition.name}`)
  const cases = states.map(state => ({ rule: representative, state, label: state.name }))
  if (definition.name === "Secondary fill") {
    const action = rules.find(rule => rule.id === "action-zinc")
    const loading = action?.states.find(state => state.loading)
    if (action && loading) cases.push({ rule: action, state: loading, label: "Loading" })
  }
  const ghostTab = rules.find(rule => rule.id === "tab-ghost")
  const selectedGhostTab = ghostTab?.states.find(state => state.name === "Selected")
  if (ghostTab && selectedGhostTab) cases.push({ rule: ghostTab, state: selectedGhostTab, label: "Selected / 8%" })
  return {
    id: `pattern-${representative.id}`, name: definition.name,
    value: definition.value, rules,
    preview: { ...representative, states }, cases,
  }
})

