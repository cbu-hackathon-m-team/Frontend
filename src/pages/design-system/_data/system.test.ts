import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { expect, it } from "vitest"
import { colorPalettes, depthTokens, motionTokens, surfaceTokens, textColorTokens } from "./system"

const css = readFileSync(resolve(process.cwd(), "src/styles/tokens.css"), "utf8")
const exhibitCss = readFileSync(resolve(process.cwd(), "src/pages/design-system/design-system.module.css"), "utf8")
const declarations = (body: string) => Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]))
const defaults = declarations(readFileSync(resolve(process.cwd(), "node_modules/tailwindcss/theme.css"), "utf8"))
const light = { ...defaults, ...declarations(css.match(/:root\s*\{([\s\S]*?)\n\}/)![1]) }
const dark = { ...light, ...declarations(css.match(/\.dark\s*\{([\s\S]*?)\n\}/)![1]) }
const blueOverrides = declarations(css.match(/:root\[data-accent="blue"\]\s*\{([\s\S]*?)\n\}/)![1])
const blueLight = { ...light, ...blueOverrides }
const blueDark = { ...dark, ...blueOverrides, ...declarations(css.match(/\.dark\[data-accent="blue"\]\s*\{([\s\S]*?)\n\}/)![1]) }
const utilities = declarations(css.match(/@theme inline\s*\{([\s\S]*?)\n\}/)![1])

function value(expression: string, theme: Record<string, string>): string {
  return expression.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
    expect(theme[name], `Missing token ${name}`).toBeDefined()
    return value(theme[name], theme)
  })
}

function color(expression: string) {
  return expression.replace(/#([\da-f])([\da-f])([\da-f])\b/gi, "#$1$1$2$2$3$3").replace(/\s+/g, "").toLowerCase()
}

it("keeps every documented text color equal to all four appearance combinations", () => {
  for (const token of textColorTokens) {
    const expression = utilities[`--color-${token.className.slice(5)}`]
    expect(expression, token.className).toBeDefined()
    expect(color(value(expression, light)), `${token.name} light`).toBe(color(token.light))
    expect(color(value(expression, dark)), `${token.name} dark`).toBe(color(token.dark))
    expect(color(value(expression, blueLight)), `${token.name} blue light`).toBe(color(token.blueLight))
    expect(color(value(expression, blueDark)), `${token.name} blue dark`).toBe(color(token.blueDark))
  }
})

it("keeps surface values and palette references connected to both themes", () => {
  for (const token of surfaceTokens) {
    const [name, description] = token.value.split(" · ")
    expect(token.color).toBe(`var(${name})`)
    if (description === "popover") {
      expect(light[name]).toBe("var(--popover)")
      expect(dark[name]).toBe("var(--popover)")
    } else {
      const [, lightColor, darkColor] = description.match(/^light (\S+) \/ dark (\S+)$/)!
      expect(color(value(token.color, light)), `${token.name} light`).toBe(color(lightColor))
      expect(color(value(token.color, dark)), `${token.name} dark`).toBe(color(darkColor))
    }
  }
  for (const palette of colorPalettes) {
    for (const token of palette.colors) {
      expect(token.color).toBe(`var(${token.value})`)
      for (const theme of [light, dark]) expect(value(token.color, theme)).not.toContain("var(")
    }
  }
  for (const token of depthTokens) {
    for (const theme of [light, dark]) expect(value(`var(${token.value})`, theme)).not.toContain("var(")
  }
})

it("keeps documented motion durations and easing connected to the actual preview", () => {
  for (const token of motionTokens) {
    const [duration, easing] = token.value.split(" · ")
    for (const theme of [light, dark]) {
      expect(theme[`--motion-${token.id}`]).toBe(duration)
      expect(theme[`--${easing}`]).toBeDefined()
    }
    expect(exhibitCss).toContain(`[data-motion="${token.id}"] .motionTrack span { transition-duration: var(--motion-${token.id}); transition-timing-function: var(--${easing}); }`)
  }
})

it("resolves every documentation CSS variable and component token in all four appearance combinations", () => {
  const local = declarations(exhibitCss)
  for (const match of exhibitCss.matchAll(/var\((--[\w-]+)/g)) {
    for (const theme of [light, dark, blueLight, blueDark]) {
      // Swatch is supplied by the palette specimen; all other references must be declared.
      if (match[1] !== "--swatch") expect({ ...theme, ...local }[match[1]], match[1]).toBeDefined()
    }
  }
  for (const [name, expression] of Object.entries(utilities)) {
    for (const theme of [light, dark, blueLight, blueDark]) {
      expect(value(expression, theme), name).not.toContain("var(")
    }
  }
})


it("keeps source-palette actions and neutral text readable in both Blue modes", () => {
  const luminance = (hex: string) => {
    const rgb = hex.replace("#", "").match(/../g)!.map(part => parseInt(part, 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
  }
  const contrast = (a: string, b: string) => {
    const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (values[0] + 0.05) / (values[1] + 0.05)
  }
  for (const theme of [blueLight, blueDark]) {
    expect(contrast(theme["--primary"], theme["--primary-foreground"])).toBeGreaterThanOrEqual(4.5)
    for (const name of ["--foreground", "--interface-secondary", "--interface-muted"]) {
      expect(contrast(theme[name], theme["--surface-canvas"])).toBeGreaterThanOrEqual(4.5)
    }
  }
})

it("uses deeper neutral Blue surfaces while preserving the reference accents", () => {
  expect(blueDark["--surface-canvas"]).toBe("#070708")
  expect(blueLight["--surface-canvas"]).toBe("#f7f7f8")
  expect(blueDark["--surface-panel"]).toBe("#1b1b1e")
  expect(blueDark["--primary"]).toBe("#79a8ff")
  expect(blueDark["--gradient-brand"]).toBe("linear-gradient(90deg, #3444f3 0%, #5b8afc 100%)")
})
