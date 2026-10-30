import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import ts from "typescript"
import { expect, it } from "vitest"
import { interactionInventory } from "./interaction-inventory"
import { interactionPatterns, interactionExhibitExamples } from "./interaction-patterns"

it("exhibits shared rules while keeping component-specific behavior in Components", () => {
  const covered = new Set(interactionPatterns.flatMap(pattern => pattern.rules.map(rule => rule.id)))
  expect(interactionExhibitExamples.filter(rule => !covered.has(rule.id)).map(rule => rule.id)).toEqual([])
  expect(interactionPatterns.length).toBeLessThan(interactionInventory.length / 2)
  for (const pattern of interactionPatterns) {
    expect(pattern.preview.states.length, pattern.name).toBeGreaterThan(1)
    expect(pattern.rules).toContainEqual(expect.objectContaining({ id: pattern.preview.id }))
  }
  expect(interactionPatterns.every(pattern => !("group" in pattern))).toBe(true)
  expect(interactionPatterns.some(pattern => pattern.name === "Local row selection")).toBe(false)
  expect(interactionInventory.some(rule => rule.id === "project-list")).toBe(false)
  expect(interactionPatterns.find(pattern => pattern.name === "Row emphasis")?.rules.map(rule => rule.id)).toContain("activity-metric")
  for (const id of ["project-card", "activity-metric", "workspace-empty"]) expect(covered.has(id), id).toBe(true)
  for (const id of ["calendar-day", "calendar-selection", "slider", "checkbox", "breadcrumb"]) expect(covered.has(id), id).toBe(false)
  expect(interactionPatterns.find(pattern => pattern.name === "Stronger boundary")?.rules.map(rule => rule.id)).toEqual(expect.arrayContaining(["input", "input-group", "panel", "detail-panel"]))
  for (const id of ["button-outline", "button-link", "otp", "context-item", "menubar-item", "nav-link", "item-default"]) expect(covered.has(id), id).toBe(false)
  expect(interactionPatterns.flatMap(pattern => pattern.cases).every(example => example.rule.usage.file && !example.state.invalid)).toBe(true)
})

const sourceRoot = resolve(process.cwd(), "src/components")
const visualState = /(?:hover|focus|active|selected|checked|disabled|invalid|open)[^\s"'`]*:(?:bg-|border-|text-|opacity-|ring-|scale-|underline)/

it("keeps every shared component's visual interaction classes in the source inventory", () => {
  const sources = new Set(interactionInventory.map(rule => rule.source))
  const missing: string[] = []
  for (const file of readdirSync(resolve(sourceRoot, "ui"))) {
    if (!file.endsWith(".tsx") || file.endsWith(".test.tsx")) continue
    const source = readFileSync(resolve(sourceRoot, "ui", file), "utf8")
    if (visualState.test(source) && !sources.has(`ui/${file}`)) missing.push(file)
  }
  expect(missing, "Shared state styles missing from Interaction state").toEqual([])
})

it("includes all variants declared by shared variant factories", () => {
  for (const file of ["button", "badge", "tabs", "toggle", "select", "item", "sidebar"]) {
    const path = resolve(sourceRoot, "ui", `${file}.tsx`)
    const tree = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const variants = new Set<string>()
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && node.expression.getText(tree) === "cva" && node.arguments[0] && visualState.test(node.arguments[0].getText(tree))) {
        const collect = (child: ts.Node) => {
          if (ts.isPropertyAssignment(child) && child.name.getText(tree) === "variant" && ts.isObjectLiteralExpression(child.initializer)) {
            for (const property of child.initializer.properties) {
              if (ts.isPropertyAssignment(property)) variants.add(property.name.getText(tree).replace(/["']/g, ""))
            }
          }
          ts.forEachChild(child, collect)
        }
        if (node.arguments[1]) collect(node.arguments[1])
      }
      ts.forEachChild(node, visit)
    }
    visit(tree)
    expect(variants.size, `${file} variant factory not found`).toBeGreaterThan(0)
    for (const variant of variants) {
      expect(interactionInventory.some(rule => rule.source === `ui/${file}.tsx` && (rule.variant === variant || rule.id === `${file}-${variant}`)), `${file}/${variant} missing`).toBe(true)
    }
  }
})

it("keeps provenance, unique identifiers, and an unmodified default state for every rule", () => {
  expect(new Set(interactionInventory.map(rule => rule.id)).size).toBe(interactionInventory.length)
  for (const rule of interactionInventory) {
    expect(rule.states[0]).toEqual({ name: "Default", className: "" })
    expect(new Set(rule.states.map(state => state.name)).size).toBe(rule.states.length)
    if (rule.source.startsWith("ui/") || rule.source.startsWith("pages/design-system/")) {
      const root = rule.source.startsWith("pages/") ? resolve(process.cwd(), "src") : sourceRoot
      expect(() => readFileSync(resolve(root, rule.source), "utf8"), rule.source).not.toThrow()
    }
  }
})

it("includes every ActionButton theme and StatusToggle color", () => {
  for (const [file, objectName] of [["action-button", "themes"], ["status-toggle", "COLOR_VARIANTS"]]) {
    const path = resolve(sourceRoot, "ui", `${file}.tsx`)
    const tree = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const names: string[] = []
    function visit(node: ts.Node) {
      if (ts.isVariableDeclaration(node) && node.name.getText(tree) === objectName && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
        for (const property of node.initializer.properties) if (ts.isPropertyAssignment(property)) names.push(property.name.getText(tree))
      }
      ts.forEachChild(node, visit)
    }
    visit(tree)
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(interactionInventory.some(rule => rule.source === `ui/${file}.tsx` && (rule.theme === name || rule.variant === name)), `${file}/${name} missing`).toBe(true)
  }
})
