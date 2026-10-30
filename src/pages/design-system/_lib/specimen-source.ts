// These controlled specimen modules keep declarations at column zero. Include
// their local dependencies and only the imports used by the rendered example.
export function specimenSource(source: string, name: string): string {
  const starts = [...source.matchAll(/^(?:export )?(?:function|const) (\w+)/gm)]
  const declarations = new Map(starts.map((match, index) => [
    match[1], source.slice(match.index, starts[index + 1]?.index ?? source.length).trim(),
  ]))
  if (!declarations.has(name)) throw new Error(`Missing specimen: ${name}`)
  const included = new Set<string>()
  const visit = (key: string) => {
    if (included.has(key)) return
    included.add(key)
    const declaration = declarations.get(key)!
    for (const dependency of declarations.keys()) {
      if (dependency !== key && new RegExp(`\\b${dependency}\\b`).test(declaration)) visit(dependency)
    }
  }
  visit(name)
  const body = [...included].reverse().map((key) => declarations.get(key)).join("\n\n")
  // Match code references, not labels such as "Select all" or "Square".
  const uses = (identifier: string) => new RegExp(`(?:<|[:=({,|&]\\s*)${identifier}\\b|\\b${identifier}\\s*(?:\\.|\\(|\\[)`).test(body)
  const imports: string[] = []
  for (const match of source.matchAll(/^import\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["'];?/gm)) {
    const [, type, binding, path] = match
    if (binding.startsWith("{")) {
      const names = binding.slice(1, -1).split(",").map((part) => part.trim()).filter(Boolean)
      const used = names.filter((part) => uses(part.split(/\s+/).at(-1)!))
      if (used.length) imports.push(`import ${type ?? ""}{ ${used.join(", ")} } from "${path}"`)
    } else {
      const localName = binding.trim().split(/\s+/).at(-1)!
      if (uses(localName)) imports.push(match[0])
    }
  }
  return `${imports.join("\n")}\n\n${body}`
}
