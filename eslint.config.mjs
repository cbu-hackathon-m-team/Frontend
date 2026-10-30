import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
import query from "@tanstack/eslint-plugin-query";
import { plugin as shadcn } from "@shadcn/lint";
import designSystem from "./scripts/design-system-rules.mjs";
export default defineConfig([
  globalIgnores(["dist/**", "coverage/**", ".playwright-cli/**", "output/playwright/**"]),
  ...tseslint.configs.recommended,
  hooks.configs.flat.recommended,
  ...query.configs["flat/recommended"],
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { shadcn, "design-system": designSystem },
    settings: { shadcn: { note: "Use the tokens and component rules in frontend/DESIGN.md and /design-system." } },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}", "**/test/**"],
    // components.json에서 공통 컴포넌트와 globals.css·typography.css를 읽는다.
    // 기존 위반은 파일·규칙별 eslint-suppressions.json에 기록하고 새 위반은 차단한다.
    rules: {
      "design-system/toggle-group-direction": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-unknown-classes": ["error", { allow: ["recharts-cartesian-axis-tick-value"] }],
      "shadcn/no-restyle": ["error", {
        allow: ["layout"],
        contracts: [
          { pattern: "^(Card|CardHeader|CardContent|CardFooter|Field|FieldGroup|FieldSet|InputGroupAddon|Table|TableHeader|TableBody|TableRow|TableCell|TableHead)$", allow: ["layout", "spacing"] },
          { pattern: "^(CardTitle|CardDescription|FieldLabel|FieldLegend)$", allow: ["layout", "type-*", "text-interface-*"] },
          { pattern: "^(Spinner|Skeleton|Avatar|AvatarImage|AvatarFallback)$", allow: ["layout", "size-*"] },
        ],
      }],
      "shadcn/no-arbitrary-values": ["error", { allow: ["layout"] }],
      "shadcn/no-inline-styles": "error",
      "shadcn/require-static-classes": "error",
    },
  },
  {
    // 공통 컴포넌트는 자신의 모양·크기·상태 스타일을 정의할 수 있다.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "shadcn/no-restyle": "off",
      "shadcn/no-arbitrary-values": "off",
      "shadcn/require-static-classes": "off",
    },
  },
  {
    files: ["src/components/ui/progress.tsx"],
    rules: { "shadcn/no-inline-styles": ["error", { allow: ["transform"] }] },
  },
  {
    // 전시 구현만 외형을 직접 구성한다. 문서 UI·새 파일에는 일반 규칙을 유지한다.
    files: ["src/pages/design-system/_components/interaction-states.tsx"],
    rules: {
      "shadcn/no-restyle": "off",
      "shadcn/require-static-classes": "off",
    },
  },
  {
    // CSS module references and imported class constants are static; the plugin cannot resolve them.
    files: ["src/pages/design-system/index.tsx", "src/pages/design-system/_components/core-specimens.tsx"],
    rules: { "shadcn/require-static-classes": "off" },
  },
  {
    // Token swatches and measured specimens render the catalog value itself; ordinary layout uses classes.
    files: ["src/pages/design-system/index.tsx"],
    rules: { "shadcn/no-inline-styles": ["error", { allow: ["borderColor", "background", "height", "width", "borderRadius"] }] },
  },
  { files: ["**/*.{ts,tsx}"], rules: { "@typescript-eslint/consistent-type-imports": "error" } },
  {
    // 이식한 디자인 코드의 기존 진단 수준을 유지한다. 타입/미사용 검사는 tsc로 검증한다.
    files: ["src/pages/**/index.tsx", "src/pages/design-system/**/*.{ts,tsx}",
      "src/components/{dashboard,exchange,history,settings,strategy,system,ui}/**/*.tsx",
      "src/lib/data/*.ts", "src/hooks/use-mobile.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/globals": "warn",
    },
  },
]);
