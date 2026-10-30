# Hapalin design system

A reusable foundation for digital products. The system is independent of any industry: examples use projects, members, settings, and activity. There are no organization-specific identity colors or financial display rules.

## Source of truth

- `src/styles/tokens.css`: semantic colors, surfaces, boundaries, elevation, motion, and Hapalin reference palettes.
- `src/styles/typography.css`: shared typography roles. `pnpm typography:generate` updates both the live catalog and the generated table in this document; `pnpm typography:check` detects drift.
- `src/components/ui/`: shadcn-based component implementations and variants.
- `/design-system`: live foundations, specimens, interaction states, and code examples.
- `src/styles/landing.css`: scoped Framer-reference landing composition.
- `src/styles/public-pages.css`: login composition and decorative brand artwork. It references system tokens; it does not redefine component controls.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Framer-inspired website-builder landing; menus, product film, gallery previews, and a local idea preview |
| `/ppt` | 15-scene Hapalin web presentation; keyboard navigation, hash deep links, outline and fullscreen; no print/export control |
| `/design-system` | Foundations and interactive component documentation |
| `/login` | Standalone frontend login flow; valid required fields set a local preview sign-in flag and continue to `/dashboard`. No backend authentication or credential transmission/storage |
| `/dashboard` | OSSGuard project catalog. Creating a project continues to execution setup, editable tests, confirmation and recorded A/B comparison. The scoped sidebar follows this flow. Aligned execution lanes expose the first differing step and per-step call evidence. Definitions and last-run snapshots persist locally; generic views consume normalized observations and Node-RED is a fixture only. No backend execution, AI generation or email delivery |
| `/dashboard/projects` | Project workspace: create, edit, confirmed delete, search, and sort. Projects persist in this browser under `hapalin.projects.v1`; directly accessible until authentication is connected |
| `/dashboard/activity` | Latest stored change per project; not a complete audit log |
| `/dashboard/settings` | General workspace identity and browser storage information; identity persists under `hapalin.workspace.v1` |
| `/dashboard/settings/members` | Member and role list scaffold; invitations are not connected |
| `/dashboard/settings/plans` | Plan and payment information scaffold; billing actions are not connected |
| `/dashboard/settings/invoices` | Invoice list scaffold with an empty state |
| `/dashboard/settings/appearance` | Shared System / light / dark controls; Blue remains exclusive to the design-system header |

The public pages use the working name Hapalin. This does not imply affiliation with the reference project's creators.

Landing and design-system headers share `HeaderAccountMenu` and the preview sign-in state. Signed-out visitors see Login (plus Start on the landing); signed-in visitors see the same icon-only account trigger. It reuses the dashboard's `WorkspaceAccountMenu` inside `PopoverContent variant="menu"`, with context-specific links: landing shows Dashboard, Design System and Logout; design system shows Dashboard, View Site and Logout, with no self-link or workspace settings. Workspace settings remain exclusive to the dashboard menu. The design-system header retains its dedicated brightness and Blue accent controls in both sign-in states. `src/lib/preview-session.ts` shares this UI flag through `hapalin.preview-session.v1` across navigation, reloads and same-origin tabs; account-menu logout clears it. If storage is unavailable, it lasts for the current page session only. Store no identifiers or passwords. This flag does not authenticate users or protect dashboard routes; replace it with server-backed session state when authentication is connected.

The landing page defaults to Korean, including navigation, feature descriptions, footer, interactive previews and accessible labels. Preserve brand names, technical acronyms, URLs and code identifiers. English keys in `landing-links.json` and feature dispatch stay stable; translate only their displayed labels. Text baked into original reference images and video remains part of that source media. Dialog/Sheet `closeLabel` and the theme control's `language` allow Korean labels on the landing without changing defaults on other routes.

## Color and appearance

Blue accent can be changed only in the `/design-system` header. Landing, login, dashboard account menus and workspace settings keep System / light / dark controls and inherit the saved Blue preference. System / light / dark select brightness. Blue is an independent accent toggle using `data-accent="blue"`. Preferences persist separately as `theme` and `blue-accent`. A legacy `hapalin` theme migrates to dark + Blue.

AppearanceProvider applies the same palette to all routes and synchronizes Blue across tabs. `transitionAppearance` uses the browser View Transition API, as in the source dashboard, to blend complete palettes over `--motion-control` (200ms). Only the captured screen opacity animates; inherited color tokens are not registered or interpolated every frame. Component transitions are disabled only while capturing the new palette so backgrounds, text, borders and icons come from the same complete palette; normal hover behavior resumes as soon as the captures are ready. The transition overlay does not intercept pointer input. A new selection skips the previous transition and invalidates its pending update; only the latest selection commits. Reduced motion and unsupported browsers apply the palette immediately. Keep appearance state shared. Frozen interaction samples copy only the compiled utilities used in their DOM, preserving cascade order without duplicating the entire application stylesheet.

| Combination | Canvas | Character |
| --- | --- | --- |
| Light | #F6F6F6 | Dark text and clear boundaries |
| Dark | #030303 | Light text and restrained contrast |
| Light + Blue | #F7F7F8 | Neutral white/gray surfaces with blue accents |
| Dark + Blue | #070708 | Deeper neutral canvas, #1B1B1E panels, and #79A8FF accents |

Page backgrounds remain solid. Gradients are intentional artwork and reference specimens; never a full-page theme wash. Primary actions use solid source-palette blue (#79A8FF with dark text in dark mode, #2960C4 with white text in light mode). Success, warning, information, and error keep their semantic meanings in every combination. Never use reference blue shades as status substitutes.

Use `bg-surface-*`, `text-interface-*`, `border-boundary-*`, and component variants rather than literal colors. Decorative Hapalin artwork may use the named reference tokens. Charts use `--plot-*` tokens without organization-specific identity.

### Surface and text hierarchy

- Canvas: page background. Panel: content groups. Section/chrome: larger divisions and panel headers.
- Inset/deep: nested content and code. Control/raised: controls and selected ranges. Overlay: menus and dialogs.
- Contrast/primary: important content. Supporting/secondary: descriptions. Muted/subtle: supporting metadata. Disabled: unavailable controls.
- Default boundary: component shell. Subtle: dense dividers. Strong: hover emphasis. Focus: keyboard or field focus.

### Hapalin reference tokens

| Token | Use |
| --- | --- |
| `--hapalin-50` … `--hapalin-950` | Reference blue scale; brand #79A8FF |
| `--hapalin-neutral-100` … `--hapalin-neutral-1000` | Ten reference grays |
| `--gradient-brand` | Signature: #3444F3 → #5B8AFC |
| `--gradient-night` | Navy to cobalt: #181E4C → #2036AB |
| `--gradient-soft` | Elliptical blue center #AECAFE → pale edge #E1E5FC |

Keep the exact signature gradient endpoints for artwork. Small button labels use a contrast-safe solid palette step rather than modifying the reference gradient.

## Typography

Use Geist Variable (`--font-sans`) and Geist Mono Variable (`--font-mono`) from the bundled fonts, with the existing system fallbacks. App and documentation text uses the following `type-*` roles. This table and Foundations are generated from the same CSS definitions. Size and line height are in px.

Keep the imported trading-dashboard roles. Local additions require consumers in product pages or shared component implementations; a catalog row, merge registration or test alone is not a consumer. `type-display-md` is used by login headings and project covers, and all five landing roles are consumed by `landing.css`. Reference palette primitives feed artwork or semantic theme aliases, including Blue secondary and muted text. Do not retain unused marketing roles or no-op styling hooks.

The `type-landing-*` family is reserved for marketing copy on `/`. Each role owns its responsive values in `typography.css`; do not create separate device-named roles for the same purpose. Hero uses 52 / 66, then 32 / 44 at 760px and below, then 28 / 38 at 340px and below. Section headings use 40 / 52, then 28 / 38 at 760px and below. Lead uses 18 / 30, then 16 / 26 at 760px and below; body uses 16 / 26. Korean headings use restrained negative tracking and taller line heights. Large hero and section headings use semibold (600), compact 18px card titles stay at medium (500), and body copy stays regular (400). `landing.css` consumes the same roles with `@apply` at every viewport; do not override their individual font properties. Keep the original display, product, login and shared control roles unchanged. Use deliberate phrase breaks in headlines, `keep-all` for Korean words, balanced headings and natural paragraph wrapping; avoid fixed narrow headline widths that isolate a brand name on mobile.

<!-- typography:start -->
| Role | Class | Size / line height · weight · tracking |
| --- | --- | --- |
| Display M | `type-display-md` | 36 / 48 · 600 · -0.04em |
| Landing Hero | `type-landing-hero` | 52 / 66 · 600 · -0.025em<br>(max-width: 760px): 32 / 44 · 600 · -0.025em<br>(max-width: 340px): 28 / 38 · 600 · -0.02em |
| Landing Heading | `type-landing-heading` | 40 / 52 · 600 · -0.025em<br>(max-width: 760px): 28 / 38 · 600 · -0.02em |
| Landing Title | `type-landing-title` | 18 / 28 · 500 · -0.015em |
| Landing Lead | `type-landing-lead` | 18 / 30 · 400 · -0.01em<br>(max-width: 760px): 16 / 26 · 400 · -0.01em |
| Landing Body | `type-landing-body` | 16 / 26 · 400 · -0.01em |
| Heading XL | `type-heading-xl` | 24 / 24 · 600 · -0.025em |
| Heading L | `type-heading-lg` | 22 / 28 · 600 · -0.025em |
| Heading M | `type-heading-md` | 18 / 24 · 600 · -0.025em |
| Heading S | `type-heading-sm` | 14 / 20 · 600 · -0.025em |
| Heading XS | `type-heading-xs` | 13 / 20 · 500 · 0 |
| Body M | `type-body-md` | 13 / 20 · 400 · 0 |
| Body M Medium | `type-body-md-medium` | 13 / 20 · 500 · 0 |
| Body S | `type-body-sm` | 12 / 16 · 400 · 0 |
| Body XS | `type-body-xs` | 11 / 20 · 400 · 0 |
| Body XS Medium | `type-body-xs-medium` | 11 / 20 · 500 · 0 |
| Label XL | `type-label-xl` | 15 / 22 · 500 · 0 |
| Label L | `type-label-lg` | 14 / 21 · 500 · 0 |
| Label M | `type-label-md` | 13 / 20 · 500 · 0 |
| Label S | `type-label-sm` | 12 / 16 · 500 · 0 |
| Label XS | `type-label-xs` | 11 / 16 · 500 · 0 |
| Eyebrow XS | `type-eyebrow-xs` | 11 / 16 · 700 · 0.025em |
| Caption XS | `type-caption-xs` | 10 / 14 · 500 · 0.025em |
| Metric L | `type-metric-lg` | 22 / 33 · 700 · -0.025em |
| Metric L Semibold | `type-metric-lg-semibold` | 22 / 33 · 600 · -0.025em |
| Metric M | `type-metric-md` | 15 / 20 · 600 · 0 |
| Metric S | `type-metric-sm` | 12 / 18 · 600 · 0 |
| Metric S Tight | `type-metric-sm-tight` | 12 / 16 · 600 · 0 |
| Code M | `type-code-md` | 13 / 20 · 400 · 0 |
| Code S | `type-code-sm` | 12 / 20 · 400 · 0 |
<!-- typography:end -->

The Framer-reference landing has a scoped composition in `landing.css` and consumes the responsive landing typography roles above. Login headings and project covers use Display M. Decorative letter specimens and the brand wordmark remain local artwork. Keep Korean headings together where possible and verify wrapping at mobile widths.

The standalone `/ppt` canvas scales editorial headings with its viewport and uses the same font families, semibold heading weight and restrained Korean tracking. These presentation headings are local composition, not shared UI roles. Cards, fields, tabs, buttons, navigation and dialog content retain their existing component typography and semantic appearance. Full-scene brand gradients are presentation artwork; they do not redefine app surfaces or theme aliases.

Presentation titles and leads enter independently using the existing motion tokens: a short upward settling motion, with the lead following the title by 100ms. Separate measured capture rectangles preserve typography across layouts; the destination is measured after React commits it. Semantic headings remain intact, and reduced motion bypasses the animation. These rules stay scoped to `/ppt`.

## Layout, sizing, and motion

Use the shared 4px spacing rhythm for normal layout. Login uses a full-height 45/55 brand/form split without the site header, a 360px form, and a brightness menu in the footer. Below 900px the brand panel hides and a small wordmark appears above the form; mobile gutters are 24px. Home and design-system links remain available.

The login brand artwork uses CSS transform/opacity motion for its dot fields and soft light; reduced-motion preferences keep it static. Home navigation uses the shared ghost Button variant.

`Button` variants are `default`, `secondary`, `outline`, `ghost`, `destructive`, and `link`; there is no Danger-Ghost variant. Default/sm actions remain 32px high, including the current compact Framer-reference landing CTAs. `Button size="lg"` is 44px and is used for login submission or explicitly larger actions. Default fields are 36px; login fields are 44px. Keep component styling inside variants.

Radii derive from `--radius` (8px): compact 4px, controls 6px, panels 8px, and large panels 12px. Large presentation artwork may use its own documented composition geometry. Elevation uses `--elevation-control`, `--elevation-panel`, and `--elevation-overlay`. App and design-system headers keep their subtle bottom divider with no drop shadow. Light palettes use shorter, softer shared overlay shadows; Blue light also reduces control, panel and theme-switch shadows. Used dark elevation values are unchanged.

Use motion tokens by purpose: `--motion-responsive` (150ms) for hover, focus, selection feedback and small control/icon reactions; `--motion-control` (200ms) for complete appearance changes and compact overlay transitions; `--motion-panel` (300ms) for panel expansion. Tailwind's default transition duration points to `--motion-responsive`, and explicit control timings use that same token. Keep the source floating sidebar's 250ms slide and Sheet's 500ms opening / 300ms closing; these are structural movement, not hover feedback. Loading indicators and decorative loops retain their own cycles. Respect reduced motion. Do not introduce automatic animation that delays content or blocks navigation.

Presentation navigation captures the background and a fixed-size content viewport separately. Snapshot groups retain a timed, stationary animation so their child motion is not torn down early; do not replace that lifetime with `animation: none`. The old background remains opaque while the new surface blends over 400ms (two control intervals). Content leaves over 200ms and settles over 500ms (panel + control), using a scoped deceleration curve and a short visibility handoff to keep opposing headlines from competing. Adjacent scenes have restrained directional movement; outline/Home/End jumps use a neutral dissolve. Artwork and hover transitions pause during capture so the live page resumes at the captured pose. Inputs before capture coalesce into its latest destination. Once a transition is visible, later inputs queue behind its completed pose rather than interrupting the capture; only the latest queued destination is animated. Reversed pending steps cancel without a flash, and unmount invalidates queued work. Unsupported browsers use the directional entrance fallback; reduced motion navigates immediately. Decorative geometry stays separate from working controls, uses reference palette tokens and radius-derived frames, and never intercepts pointer input.

Apply these durations to existing animated feedback. Menu-item highlighting that follows pointer or arrow-key navigation stays immediate; popup entrance/exit uses 200ms. Keep passive surfaces passive rather than adding hover animation to every element. The floating rail retains its source geometry and slide; its buttons follow the shared 150ms hover token.

## Components and interaction

- Dashboard routes share `DashboardLayout`: source shell from `C:/trading-dashboard`, 240px sidebar, 52px header, workspace breadcrumbs, and aligned responsive content insets. The header has no vertical separator beside its sidebar toggle. The sidebar structural boundary uses `boundary-subtle`. Projects use compact metadata cards with optional table view; decorative covers are omitted. Brightness controls, workspace settings, site-home, design-system and logout links live in the account menu; workspace navigation contains projects and recent changes. Selected-project navigation contains overview, validation runs, tests and execution settings. Result details belong to validation runs, retain its active navigation item, and identify the project in the breadcrumb. The console uses the existing shell and component variants. The account uses `PopoverContent variant="menu"` (224px, no outer padding), with 12px identity padding and 6px control/action section padding. Do not add marketing artwork or placeholder metrics to app pages. Page roadmap and reference evidence are in `../docs/dashboard-structure.md`.
- A collapsed desktop sidebar exposes the source dashboard's 12px left-edge trigger below the header. Its rail preserves the original geometry and motion: 250ms transform-only movement with cubic-bezier(0.25,0.1,0.25,1), -150% off-screen translation, no opacity fade, and a 16px transparent bridge toward the header. Edge departure checks for panel entry after 30ms, then starts the 300ms close grace period; panel departure starts that grace period directly and clears its tooltip immediately. Keyboard users can activate the trigger with Enter, Space or an arrow key, and close with Escape. The rail stays open while its account popover is open and closes on navigation. Mobile uses the existing Sheet instead. `ui/sidebar-hover-panel.tsx` preserves 40px buttons, 20px icons, 12px button corners, 16px outer corners, surface-overlay/80, and the source shadow-overlay / dark shadow-2xl treatment. `SidebarHoverButton` consumes the same `navItemClasses` tokens as expanded navigation. Tooltips use the source 10px side gap. `SidebarHoverAccountContent` uses the source 224px popover width, 16px side gap and -48px vertical alignment, with no orphaned exit animation. Pointer opening keeps focus on the trigger; keyboard opening keeps normal Popover focus behavior. Reduced-motion styling and the existing keyboard dismissal rules remain shared. Both sidebar forms reuse `WorkspaceAccountMenu`, including its source-style avatar identity row, grouped navigation actions and separate logout row. Rail geometry and slide match the source; button feedback uses the shared 150ms token, with app-specific colors and menu destinations. Closed off-canvas navigation is inert and excluded from the accessibility tree.

- Compose existing Button, Field, InputGroup, Card, Badge, Switch, Accordion, and feedback components.
- Secondary buttons use `button-secondary`, `button-secondary-border`, and `button-secondary-hover`. Blue mixes primary into the panel at 8% (rest), 14% (hover), and 25% into the default boundary; other accents retain the original neutral colors.
- Vertical ToggleGroup lists use `orientation="vertical"`; the component owns direction, independent item corners and arrow-key navigation. Horizontal groups retain joined ends. CSS-only `flex-col` on ToggleGroup is rejected by the local design-system lint rule.
- Toggle and ToggleGroup selection belongs to the shared Toggle variants and persists on hover and pointer leave. Outline selection uses the same `interaction-selected` / `interface-contrast` tokens as product navigation and tabs; its hover alone uses neutral `interaction-button-hover`, so it cannot masquerade as selection. Default keeps `accent` / `accent-foreground` selection. Hover must not dim ordinary toggle labels. Glass retains its existing selected surface and boundary. Toggles transition colors only over `motion-responsive` (150ms), with no geometry animation and no transition under reduced motion. Interaction state includes Selected + hover specimens.
- Landing navigation uses `NavigationMenuTrigger variant="text"`: transparent in every pointer state, with emphasis through text color and keyboard focus.
- Forms use associated FieldLabel and native required validation. Password visibility has an accessible toggle.
- Card uses Header, Title, Description, Content, and Footer when appropriate.
- Badge variants: default, secondary, destructive, outline, success, warning, error, muted.
- `SidebarMenuButton variant="product"` controls shared navigation states and uses `type-body-md-medium` (13px / 20px, 500). Its size options change geometry without adding generic `text-sm` / `text-xs` overrides. Default and outline variants retain their original size typography.
- All `SidebarMenuButton` variants share the navigation's `--motion-responsive` (150ms) transition and easing, including hover background and text colors. Account and workspace triggers must not switch colors instantly while product navigation fades.
- Status toggles use `status-success-*` / `status-warning-*` colors and named shadow tokens. Their hover duration follows `--motion-responsive`; overlays use the shared `scrim` token.
- `Skeleton shape="default|pill|square"` owns loading geometry.
- Empty / PageError support page and panel variants.
- Ordinary links navigate to real pages or existing section anchors. Preview interactions explicitly communicate their scope.
- Keep success, empty, loading, missing, and error states distinct. Unavailable values display as —.
- Loading placeholders preserve final geometry. Do not insert artificial loading delays.
- Dialog and Sheet close buttons use `focus-control`: keyboard focus is visible, pointer-only focus has no ring. Keyboard focus must remain visible; icon-only actions require accessible names. Tables retain headers and overflow inside their containers.
- Enabled links, buttons, menu items and selection controls use a pointer cursor. Text fields retain the text cursor; disabled controls and resize handles retain their own behavior.

## Lint and verification

OSSGuard project screens use repository/ref/SHA → one direct dependency update → reviewed HTTP tests → run details. Keep the pipeline separate from observed business calls. `RequestComparison` aligns A/B calls, highlights the first recorded difference, and opens matching evidence on selection. Unknown journals are not zero calls. `ValidationDetail` separates business comparison, file/package changes, and execution logs. On mobile, use a test selector and a two-column pipeline; constrain horizontal scrolling to the call diagram. Do not infer internal spans or durations. Reference decisions and verification scope: `../docs/ossguard-dashboard.md`.

All six shadcn consumer rules remain active: no-restyle, no-raw-colors, no-arbitrary-values, no-inline-styles, no-unknown-classes, require-static-classes. `eslint-suppressions.json` stays empty. Shared component implementations own their styles; consumer styling uses variants and semantic tokens. Lint does not establish that hover/focus timing, menu handoff, keyboard behavior, or rendered geometry is correct; those require interaction tests and browser checks.

Intentional exceptions are scoped: frozen interaction previews replay component classes; static CSS module references require resolution allowances; token swatches permit only value/geometry presentation. Three inline exceptions cover chart palette generation, Prism highlighting, and a static CSS-module copy-button class. Do not add broad suppressions to make lint pass.

Run `pnpm build`, `pnpm lint`, `pnpm test`, and `pnpm test:design-lint`. Verify the landing, login, and design system at desktop/mobile sizes and all four appearance combinations. Check overflow, visible states, navigation, form validation, and theme persistence in a browser.

### Hapalin reference evidence

Reference: https://www.behance.net/gallery/252139887/Hapalin- . The public embed confirms the project identity, but the gallery and editable PPT were not accessible during this update. The supplied palette slide explicitly labels #79A8FF and the signature endpoints #3444F3 / #5B8AFC; these are exact reference values. The supplied rendered slides were sampled for visual reconstruction: the bright blue background is approximately #2465F7, the dark slide runs approximately #181E4C → #2036AB vertically, and the light cards have a blue center around #AECAFE with pale edges around #E1E5FC. Raster compression can alter those samples; they are not claimed as original PPT gradient stop settings.

The source uses distinct treatments: solid blue identity, a horizontal indigo-to-blue signature, a vertical navy-to-cobalt background, and a soft elliptical blue-to-periwinkle card. The four compact specimens show these separately. App page backgrounds stay solid. The palette slide's black background was sampled at #111111; the app's dark Blue surfaces are deliberately darker at the user's request: #070708 canvas, #1B1B1E panel, #141416 chrome and #27272A controls. These app surfaces adapt the reference rather than change its palette swatches. Navy-to-cobalt remains dedicated artwork. Signature gradient endpoints remain unchanged.


## Settings navigation

Entering `/dashboard/settings` or its child routes replaces workspace navigation with settings groups and a return link, following the source trading dashboard's context switch. General, Members, Plans and Invoices belong to the workspace group; Appearance belongs to personal settings. Expanded desktop, mobile Sheet and collapsed hover rail share these destinations. Child pages include a parent settings breadcrumb. General keeps the existing validated browser-local workspace form. Members, plans and invoices are frontend scaffolds with honest empty states and disabled external actions; there are no fabricated people, subscriptions, invoices or successful invitation/payment actions.

References: [Framer workspace members](https://www.framer.com/help/articles/checking-the-total-and-billed-editors-in-your-workspace/), [plans and invoices](https://www.framer.com/help/articles/subscriptions-and-charges/), and the settings context branch in `C:/trading-dashboard/frontend/src/components/dashboard/sidebar.tsx`.

## Validation comparison workspace

Project overview separates the latest verdict, dependency change and preparation checklist. Validation runs show only the latest locally retained snapshot until a history API exists. Result details separate business comparison, change evidence and execution logs. `RunSummary` derives counts from recorded outcomes; `AssertionComparison` pairs baseline/candidate values against each approved expectation, prioritizing changes and unavailable evidence. Missing observations stay neutral and never become zero. The HTTP/external-call diagram keeps collected transitions on desktop and aligned A/B nodes without horizontal scrolling when the comparison card is narrower than 680px. Test names wrap; shared filters and empty-filter feedback remain available on mobile. Preserve the existing component variants and semantic tokens. Reference decisions: `dashboard-design-decisions.md`.
