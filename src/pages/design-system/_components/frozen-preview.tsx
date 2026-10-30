import { useLayoutEffect } from "react"
import type { InteractionState } from "../_data/interaction-inventory"

const pseudoStates = /(?<!\\):(focus-visible|focus-within|focus|hover|active)\b/g

// Reuse the browser's compiled utility rules, including dark/media/layer priority.
// Only their activation selector changes; no color, border, or shadow is copied.
export function freezeStateSelectors(css: string) {
  return css.replace(pseudoStates, (_, state: string) =>
    `:is([data-preview-${state}], [data-preview-${state}] *)`)
}

export function stateRules(rules: CSSRuleList, classes?: Set<string>): string {
  return Array.from(rules).map(rule => {
    if (rule.type === CSSRule.KEYFRAMES_RULE) return rule.cssText
    // Keep non-state utilities too: a later dark/background rule may win over hover.
    if (rule instanceof CSSStyleRule) {
      if (classes && !Array.from(rule.selectorText.matchAll(/\.((?:\\(?:[\da-fA-F]{1,6}\s?|.)|[\w-])+)/g)).some(match => classes.has(match[1]))) return ""
      return freezeStateSelectors(rule.cssText)
    }
    if ("cssRules" in rule) {
      const children = stateRules((rule as CSSGroupingRule).cssRules, classes)
      return children ? `${rule.cssText.slice(0, rule.cssText.indexOf("{"))}{${children}}` : ""
    }
    return ""
  }).join("\n")
}

export function FrozenPreviewStyles() {
  useLayoutEffect(() => {
    const style = document.createElement("style")
    style.dataset.frozenPreviewStyles = ""
    function refresh() {
      // Copy only utilities used by the frozen samples, not the entire application CSS.
      const classes = new Set(Array.from(document.querySelectorAll("[data-frozen-preview] *")).flatMap(node => Array.from(node.classList, name => CSS.escape(name))))
      const rules = Array.from(document.styleSheets).filter(sheet => sheet.ownerNode !== style).map(sheet => {
        try { return stateRules(sheet.cssRules, classes) } catch { return "" }
      }).join("\n")
      style.textContent = `@scope ([data-frozen-preview]) { ${rules} }`
    }
    refresh()
    document.head.append(style)
    import.meta.hot?.on("vite:afterUpdate", refresh)
    return () => { style.remove(); import.meta.hot?.off("vite:afterUpdate", refresh) }
  }, [])
  return null
}

export function frozenStateAttributes(state: InteractionState) {
  return {
    "data-frozen-preview": "",
    "data-preview-hover": ["Hover", "Highlighted", "Pressed"].includes(state.name) ? "" : undefined,
    "data-preview-active": state.name === "Pressed" ? "" : undefined,
    "data-preview-focus": ["Focus", "Highlighted"].includes(state.name) ? "" : undefined,
    "data-preview-focus-visible": state.name === "Focus" ? "" : undefined,
    "data-preview-focus-within": ["Focus", "Focus within"].includes(state.name) ? "" : undefined,
  }
}
