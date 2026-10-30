# OSSGuard web presentation

`/ppt` is a 12-slide introduction aligned with the shortened 3:50 script. `/ppt#4` opens the Pydantic reproduction case.

## Story and script timing

| Slides | Script section | Content |
| --- | --- | --- |
| 1–2 | 0:00–0:25 · Introduction | OSSGuard and updates that can silently break existing work |
| 3–4 | 0:25–1:20 · Reproduced problem | Order/shipping flow, Pydantic equality change, unchanged HTTP/stock responses and a missing shipping request |
| 5–10 | 1:20–3:00 · Verification | Repository/version choice, business criteria, human approval, copies, Docker, WireMock, control baseline, evidence, AI explanation and email |
| 11–12 | 3:00–3:50 · Differentiation and closing | The connected verification flow, AI's limited role, Python MVP and evidence for the update decision |

Copy follows the project specification in `docs/OSSGuard_MVP_구현계획_기능명세서.md` and the supplied presentation script. Product behavior describes the intended verification flow. The interactive comparison illustrates the reproduction described in the supplied script; it does not submit a live production run. Actual inventory database writes and real shipping are outside the example. AI judges no outcomes independently: approved criteria determine the verdict, and AI explains the recorded evidence.

## Controls and interactions

- Arrow keys, Page Up/Down and Space move between slides; Home/End jump to the first/last.
- Hash navigation, outline, document fullscreen and keyboard focus behavior are preserved.
- Controls appear at the bottom edge or on keyboard focus. No persistent corner labels, footer, progress bar or print/export control.
- Slide 12 opens the landing, the existing dashboard example or the supplied YouTube demo video in new tabs.
- Slide 4 uses native tabs to compare paid/unpaid orders. Tab arrow keys stay local to the example. This state stays in memory; no job is submitted and no workspace data is written.

## Visuals

Existing blue, dark and soft scene palettes, separate View Transition layers for background/copy, queued navigation, pointer parallax, gradient light fields and decorative vector scenes remain. Layouts use text, open comparison rows, process diagrams and one tabbed result example; the previous unrelated project-management forms/cards have been removed. Reduced-motion preferences disable transitions and parallax; portrait layouts stack and scroll inside the current slide.

The deck keeps Geist / Geist Mono, semantic status colors, Hapalin scene palettes, shared Tabs/Button components and motion tokens. The 12-slide sequence combines three pairs without dropping the script's key points:

- Slide 6 combines business inputs/expectations and user approval, including direct/project tests and AI drafts.
- Slide 7 combines temporary copies, separate Docker environments, installed-version checks and the identical request. Its diagram branches from one GitHub source into two environments.
- Slide 10 combines saved dependency changes and execution evidence with AI explanation and an email summary. Approved criteria determine the verdict.

Slide 4 keeps the Pydantic comparison and gives the missing shipping request more weight than unchanged response values. Slide 8 keeps WireMock and the outbound request journal separate. Slide 9 distinguishes regressions, execution failures, baseline failures and missing evidence. Slide 11 shows the connected verification flow and the Python MVP scope.

The wording pass uses familiar Korean descriptions for source code, startup failures and test outcomes. Numeric comparisons share rows for labels and values so arrows align with the values. Shipping counts and units share a baseline; comparison columns stay fixed, and the WireMock diagram uses equally sized nodes with a centered connector. Repeated footnotes are folded into the main explanation instead of adding small decorative copy.

The local landing page informs the execution diagram and readable `pyproject.toml` diff. The presentation uses its own larger type and native layouts. Input/expectation columns, comparison rows and connectors remain aligned; explanatory footer caveats are not added.

Layout references: [Pitch's presentation design principles](https://pitch.com/blog/presentation-design-tips) for whitespace and emphasis, and [Linear's interface refinement](https://linear.app/now/behind-the-latest-design-refresh) for restrained separators and supporting content. Their branding and graphics are not incorporated.

## Script review

The four sections of the shortened script are covered in order. The Pydantic case now follows the order/shipping problem immediately (slide 4), before verification setup starts (slide 5). The introduction emphasizes silent breakage (slide 2) and uses “remaining stock in the response” consistently, without implying a verified database write. Pydantic's model/dictionary equality change is documented in its [official migration guide](https://docs.pydantic.dev/2.12/migration/).

The current script describes the Pydantic case as reproduced. The deck follows that supplied account and labels the figures as a reproduction case. Editing this presentation does not independently rerun the integrated backend execution.

Photos are local 1920 × 1280 development and warehouse images. Their source/license references are in `public/images/presentation/README.md`; brand glyphs reuse `public/images/ossguard/`. Photos illustrate context, not evidence. Result values are editable HTML, not screenshots.

Production hosting must serve the Vite SPA entry for `/ppt`.
