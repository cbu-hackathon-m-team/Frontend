import { expect, it } from "vitest"
import { freezeStateSelectors, frozenStateAttributes, stateRules } from "./frozen-preview"

it("copies only sample utilities while keeping their overriding rules in order", () => {
  const style = document.createElement("style")
  style.textContent = ".unused { color: red } .sample:hover { color: blue } @media (min-width: 1px) { .override { color: green } .other { color: red } }"
  document.head.append(style)
  try {
    const copied = stateRules(style.sheet!.cssRules, new Set(["sample", "override"]))
    expect(copied).not.toContain(".unused")
    expect(copied).not.toContain(".other")
    expect(copied).toContain("[data-preview-hover]")
    expect(copied).toContain("@media")
    expect(copied.indexOf(".sample")).toBeLessThan(copied.indexOf(".override"))
  } finally { style.remove() }
})

it("preserves animation frames when copying compiled styles", () => {
  const style = document.createElement("style")
  style.textContent = "@keyframes spinner-fade { 0% { opacity: 1; } 100% { opacity: .15; } }"
  document.head.append(style)
  try {
    const copied = stateRules(style.sheet!.cssRules)
    expect(copied).toContain("0%")
    expect(copied).toContain("100%")
    expect(copied).toContain("opacity")
  } finally { style.remove() }
})

it("recognizes escaped responsive utility names when filtering rules", () => {
  const style = document.createElement("style")
  style.textContent = ".\\32 xl\\:text-primary { color: blue } .unrelated { color: red }"
  document.head.append(style)
  try {
    const copied = stateRules(style.sheet!.cssRules, new Set(["\\32 xl\\:text-primary"]))
    expect(copied).toContain("color: blue")
    expect(copied).not.toContain(".unrelated")
  } finally { style.remove() }
})

it("changes only activation selectors and preserves declaration and cascade order", () => {
  const css = '.hover\\:bg-destructive\\/90 { &:hover { background-color: var(--destructive); opacity: .9; } } .dark\\:bg-destructive\\/60 { &:is(.dark *) { background-color: color-mix(in oklab, var(--destructive) 60%, transparent); } }'
  const frozen = freezeStateSelectors(css)
  expect(frozen).toContain(':is([data-preview-hover], [data-preview-hover] *)')
  expect(frozen.replace(':is([data-preview-hover], [data-preview-hover] *)', ':hover')).toBe(css)
  expect(frozen.indexOf('opacity: .9')).toBeLessThan(frozen.indexOf('var(--destructive) 60%'))
})

it("freezes hover and press together, leaving default and live examples alone", () => {
  expect(frozenStateAttributes({ name: "Pressed", className: "" })).toMatchObject({ "data-preview-hover": "", "data-preview-active": "" })
  expect(frozenStateAttributes({ name: "Default", className: "bg-made-up" })["data-preview-hover"]).toBeUndefined()
})

it("preserves escaped variant names such as dark:hover in compiled class selectors", () => {
  const css = '.dark\\:hover\\:bg-input\\/50 { &:is(.dark *) { &:hover { background-color: var(--input); } } }'
  expect(freezeStateSelectors(css)).toBe('.dark\\:hover\\:bg-input\\/50 { &:is(.dark *) { &:is([data-preview-hover], [data-preview-hover] *) { background-color: var(--input); } } }')
})
