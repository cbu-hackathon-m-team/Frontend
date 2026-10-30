import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const consumer = "src/__design_lint_probe.tsx";
const findings = async (source, filePath = consumer) => {
  const [result] = await eslint.lintText(source, { filePath });
  assert.equal(result.fatalErrorCount, 0);
  return result.messages.filter(message => /^(shadcn|design-system)\//.test(message.ruleId ?? ""));
};

test("typography check detects and repairs documentation drift from the CSS inventory", () => {
  const fixture = mkdtempSync(path.join(tmpdir(), "hapalin-typography-"));
  try {
    for (const file of ["scripts/generate-typography.mjs", "src/styles/typography.css", "src/components/ui/table.tsx", "src/pages/design-system/_data/typography.generated.ts", "DESIGN.md"]) {
      const target = path.join(fixture, file);
      mkdirSync(path.dirname(target), { recursive: true });
      copyFileSync(new URL(`../${file}`, import.meta.url), target);
    }
    const run = (...args) => spawnSync(process.execPath, [path.join(fixture, "scripts/generate-typography.mjs"), ...args], { encoding: "utf8" });
    assert.equal(run("--check").status, 0);
    const doc = path.join(fixture, "DESIGN.md");
    writeFileSync(doc, readFileSync(doc, "utf8").replace("`type-metric-lg`", "`type-metric-lg-stale`"));
    const stale = run("--check");
    assert.notEqual(stale.status, 0);
    assert.match(stale.stderr, /DESIGN.md typography is stale/);
    assert.equal(run().status, 0);
    assert.equal(run("--check").status, 0);
    const css = path.join(fixture, "src/styles/typography.css");
    writeFileSync(css, readFileSync(css, "utf8").replace("font-size: 32px;", "font-size: 31px;"));
    assert.notEqual(run("--check").status, 0);
    assert.equal(run().status, 0);
    assert.equal(run("--check").status, 0);
    const generated = readFileSync(path.join(fixture, "src/pages/design-system/_data/typography.generated.ts"), "utf8");
    const tokens = JSON.parse(generated.match(/export const typeTokens = ([\s\S]+) as const/)[1]);
    const hero = tokens.find(token => token.className === "type-landing-hero");
    assert.equal(hero.value, "52 / 66 · 600 · -0.025em");
    assert.deepEqual(hero.responsive, [
      { query: "(max-width: 760px)", value: "31 / 44 · 600 · -0.025em" },
      { query: "(max-width: 340px)", value: "28 / 38 · 600 · -0.02em" },
    ]);
  } finally {
    const absolute = path.resolve(fixture);
    assert.equal(path.dirname(absolute), path.resolve(tmpdir()));
    assert.ok(path.basename(absolute).startsWith("hapalin-typography-"));
    rmSync(absolute, { recursive: true });
  }
});

test("current tokens, typography, component variants, and dynamic geometry pass", async () => {
  const messages = await findings(`
    import { Button } from "@/components/ui/button";
    import { CardContent, CardTitle } from "@/components/ui/card";
    export const Example = () => <div className="bg-surface-panel border-boundary-default text-interface-secondary">
      <Button variant="secondary" size="sm" className="w-full mt-4">Save</Button>
      <CardContent className="p-4"><CardTitle className="type-heading-xs text-interface-contrast">Title</CardTitle></CardContent>
      <div className="bg-signal-success w-(--chart-width)" style={{ "--chart-width": "42%" }} />
    </div>;
  `);
  assert.deepEqual(messages, []);
});

test("toggle groups require semantic orientation rather than CSS-only vertical layout", async () => {
  for (const className of ['"flex-col w-full"', '{cn("w-full", "md:flex-col")}', '"flex-col-reverse"']) {
    const messages = await findings(`
      import { ToggleGroup as Group } from "@/components/ui/toggle-group";
      import { cn } from "@/lib/utils";
      export const Example = () => <Group type="single" className=${className} />;
    `);
    assert.ok(messages.some(message => message.ruleId === "design-system/toggle-group-direction"));
  }
  assert.deepEqual(await findings(`
    import { ToggleGroup } from "@/components/ui/toggle-group";
    export const Example = () => <ToggleGroup type="single" orientation="vertical" className="w-full" />;
  `), []);
});

test("all six design rules report violations in new consumer code", async () => {
  const messages = await findings(`
    import { Button } from "@/components/ui/button";
    export const Example = ({ classes }: { classes: string }) => <>
      <Button className="rounded-full bg-purple-500 p-[13px] imaginary-tailwind" style={{ color: "#ff0000" }}>Save</Button>
      <Button className={classes}>Cancel</Button>
    </>;
  `);
  const reported = new Set(messages.map(message => message.ruleId));
  for (const name of ["no-restyle", "no-raw-colors", "no-arbitrary-values", "no-inline-styles", "no-unknown-classes", "require-static-classes"]) {
    assert.ok(reported.has(`shadcn/${name}`), `${name} must actually report a violation`);
  }
});

test("every current typography role and neutral text token passes on component titles", async () => {
  const typography = readFileSync(new URL("../src/styles/typography.css", import.meta.url), "utf8");
  const theme = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
  const roles = [...typography.matchAll(/@utility (type-[\w-]+)/g)].map(match => match[1]);
  const colors = [...theme.matchAll(/--color-(interface-[\w-]+):/g)].map(match => `text-${match[1]}`);
  assert.ok(roles.includes("type-label-md") && roles.includes("type-code-md"));
  assert.ok(colors.includes("text-interface-default") && colors.includes("text-interface-supporting"));
  const messages = await findings(`
    import { CardTitle } from "@/components/ui/card";
    export const Example = () => <>
      ${[...roles, ...colors].map(className => `<CardTitle className="${className}">Title</CardTitle>`).join("\n")}
    </>;
  `);
  assert.deepEqual(messages, []);
});

test("removed token names and legacy title colors are rejected", async () => {
  for (const className of ["type-page-title", "type-button", "type-caption"]) {
    const messages = await findings(`export const Example = () => <span className="${className}">Text</span>;`);
    assert.ok(messages.some(message => message.ruleId === "shadcn/no-unknown-classes"), className);
  }
  for (const className of ["text-tone-200", "text-tone-400", "text-tone-500", "text-tone-600"]) {
    const messages = await findings(`export const Example = () => <span className="${className}">Text</span>;`);
    assert.ok(messages.some(message => message.ruleId === "shadcn/no-raw-colors"), className);
  }
  for (const className of ["text-tone-100", "text-tone-700"]) {
    const messages = await findings(`
      import { CardTitle } from "@/components/ui/card";
      export const Example = () => <CardTitle className="${className}">Title</CardTitle>;
    `);
    assert.ok(messages.some(message => message.ruleId === "shadcn/no-restyle"), className);
  }
  const messages = await findings(`
    import { Button } from "@/components/ui/button";
    export const Example = () => <Button className="type-label-sm">Save</Button>;
  `);
  assert.ok(messages.some(message => message.ruleId === "shadcn/no-restyle"));
});

test("component implementations and specimens have only their documented exceptions", async () => {
  const ui = await eslint.calculateConfigForFile("src/components/ui/button.tsx");
  const specimen = await eslint.calculateConfigForFile("src/pages/design-system/_components/core-specimens.tsx");
  const tests = await eslint.calculateConfigForFile("src/components/ui/button.test.tsx");
  assert.equal(ui.rules["shadcn/no-restyle"][0], 0);
  assert.equal(ui.rules["shadcn/no-arbitrary-values"][0], 0);
  assert.equal(ui.rules["shadcn/require-static-classes"][0], 0);
  assert.equal(ui.rules["shadcn/no-raw-colors"][0], 2);
  assert.equal(ui.rules["shadcn/no-inline-styles"][0], 2);
  assert.equal(specimen.rules["shadcn/no-inline-styles"][0], 2);
  assert.equal(specimen.rules["shadcn/no-raw-colors"][0], 2);
  assert.equal(specimen.rules["shadcn/no-restyle"][0], 2);
  assert.equal(specimen.rules["shadcn/no-arbitrary-values"][0], 2);
  assert.equal(tests.rules["shadcn/no-raw-colors"], undefined);
});

test("specimens reject consumer restyling and have no count-based suppressions", async () => {
  assert.deepEqual(JSON.parse(readFileSync(new URL("../eslint-suppressions.json", import.meta.url), "utf8")), {});
  const messages = await findings(`
    import { Badge } from "@/components/ui/badge";
    export const Example = () => <Badge className="bg-purple-500 text-[11px]">Status</Badge>;
  `, "src/pages/design-system/_components/core-specimens.tsx");
  for (const rule of ["no-restyle", "no-raw-colors", "no-arbitrary-values"]) {
    assert.ok(messages.some(message => message.ruleId === `shadcn/${rule}`), rule);
  }
  const swatches = await findings(`export const Example = () => <div style={{ background: "var(--surface-panel)", padding: 17 }} />;`, "src/pages/design-system/index.tsx");
  assert.ok(swatches.some(message => message.message.includes("padding")));
  assert.ok(!swatches.some(message => message.message.includes("background")));
});

test("geometry exceptions stay in their real consumers and keep color checks", async () => {
  const source = `export const Example = () => <div style={{ transform: "scale(0.5)", color: "red" }} />;`;
  const general = await findings(source);
  const chart = await findings(source, "src/components/ui/progress.tsx");
  assert.ok(general.some(message => message.ruleId === "shadcn/no-inline-styles" && message.message.includes("transform")));
  assert.ok(!chart.some(message => message.ruleId === "shadcn/no-inline-styles" && message.message.includes("transform")));
  assert.ok(chart.some(message => message.ruleId === "shadcn/no-inline-styles" && message.message.includes("color")));
  const docs = await eslint.calculateConfigForFile("src/pages/design-system/_components/code-block.tsx");
  const future = await eslint.calculateConfigForFile("src/pages/design-system/_components/new-component.tsx");
  for (const config of [docs, future]) {
    for (const name of ["no-restyle", "no-inline-styles", "require-static-classes"]) {
      assert.equal(config.rules[`shadcn/${name}`][0], 2);
    }
  }
});
