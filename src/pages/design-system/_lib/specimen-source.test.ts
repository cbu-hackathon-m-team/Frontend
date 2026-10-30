import { describe, expect, it } from "vitest"
import ts from "typescript"
import path from "node:path"
import { componentCatalog } from "../_data/catalog"
import { specimenSource } from "./specimen-source"
import core from "../_components/core-specimens.tsx?raw"
import extended from "../_components/extended-specimens.tsx?raw"

describe("copyable specimen source", () => {
  it("typechecks every published example including its imports and local dependencies", () => {
    const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, "tsconfig.json")!
    const config = ts.readConfigFile(configPath, ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath))
    parsed.options.types = [...(parsed.options.types ?? []), "node"]
    const sources = new Map(componentCatalog.map((item) => {
      const name = item[2]
      const source = core.includes(`export function ${name}(`) ? core : extended
      return [path.resolve("src", `__example_${name}.tsx`).replaceAll("\\", "/"), specimenSource(source, name)] as const
    }))
    const host = ts.createCompilerHost(parsed.options)
    const original = host.getSourceFile.bind(host)
    host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
      const text = sources.get(file.replaceAll("\\", "/"))
      return text === undefined ? original(file, languageVersion, onError, shouldCreateNewSourceFile)
        : ts.createSourceFile(file, text, languageVersion, true, ts.ScriptKind.TSX)
    }
    const program = ts.createProgram([...sources.keys()], parsed.options, host)
    const errors = ts.getPreEmitDiagnostics(program)
    expect(errors.map((error) => `${error.file?.fileName}: ${ts.flattenDiagnosticMessageText(error.messageText, "\n")}`)).toEqual([])
    expect(new Set(componentCatalog.map((item) => item[0])).size).toBe(sources.size)
  }, 60000)
})
