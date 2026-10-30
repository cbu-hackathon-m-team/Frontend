# Hapalin product presentation

Open /ppt for the 15-slide service introduction. Hash links such as /ppt#10 open a specific slide.

The story introduces website-project creation and management: project ideas, naming and descriptions, an overview, search, card/list views, recent changes, a hands-on sample, workspace settings and continuing saved work. Slide 14 clearly separates current project-management features from planned editing, publishing and collaboration. There is no design-system or implementation-stack pitch.

## Presentation controls

- Arrow keys, Page Up/Down and Space move between slides; Home/End move to the first/last.
- Controls appear when the pointer reaches the bottom 24px edge, stay reachable while the pointer is on the controls, and hide after it leaves. Keyboard focus also reveals them.
- No top-corner labels, chapter labels, persistent slide footer or progress bar are rendered.
- Fullscreen targets the document so native Radix portal dialogs remain visible. Browser restrictions may require F11.
- This is a web presentation. There is no print/PDF control or print-export stylesheet.

## Product interactions

Slide 6 has a visible “사이트 가기” link to the landing page in a separate tab. Slide 3 switches between project-use examples. Slide 7 filters project names. Slide 8 changes card/list layout. Slide 10 supports sample creation, search, view switching and project previews. Native inputs, tabs and dialogs retain their keyboard behavior; their keys do not advance the deck.

Sample state stays in memory and resets on reload. The deck does not read or write real workspace data, call an API or change appearance settings. Slide 13 opens the actual landing, login and dashboard in new tabs.

## Visual implementation

The [Hapalin reference](https://www.behance.net/gallery/252139887/Hapalin-) informs the scale hierarchy, image overlaps and alternating dark, blue and soft-gradient scenes. The live [Toss homepage](https://toss.im/) was inspected across the intro, transfer transition and asset-management section. It informs benefit-led headings, quiet space, a dominant product visual and restrained movement. Their service content and metrics are not reused.

The deck uses the current semantic colors, Geist typography, reference gradients and native Card, Field, Input, SearchBar, ToggleGroup, Tabs, Dialog, Alert and sidebar components. Existing local landing artwork is used only in illustrative project-use cards. Shared component colors, type and variants remain owned by the design system.

Scene composition alternates between an asymmetric image collage, reverse layouts, centered forms, a wide product overview, an overlapping detail card, a saved-state graphic and a two-stage roadmap. Editorial backgrounds use existing palette and gradient tokens; native UI keeps its shared light/dark appearance.

Page navigation uses two native View Transition snapshots: a background and a fixed-size content viewport. The old background stays opaque beneath the incoming surface, avoiding a dark dip. The background blends over 400ms and content exits over 200ms, then settles over 500ms with a scoped deceleration curve. Its brief initial opacity handoff avoids competing headlines while the small horizontal movement slows to rest. These scene durations derive from the existing control and panel tokens. Outline/Home/End jumps use a neutral 200ms dissolve. Decorations and pointer motion pause during capture and resume from the captured pose. Inputs received before capture coalesce into its latest destination. Once the current visual transition is committed, relative requests accumulate without skipping it; after it finishes, only the latest queued destination starts. Reversing an uncommitted step to the current page cancels without an intermediate flash. Unmount invalidates all queued work. Unsupported captures use a short opacity/24px entrance. Local tab content also has a brief opacity change. Blue and soft scenes have slowly moving gradient light fields, vector layer stacks, luminous curved horizons and traced connector paths. The saved-state illustration retains its shaded sphere. The drawing technique was inspected in `C:/likelion-tuk/frontend/src/components/home/track-grid.tsx` and `home.module.css`: SVG contours, token-painted surfaces, layered rim light and CSS masking. No source component, logo, device frame or editor UI was copied. Each SVG owns unique paint IDs; the scenery remains decorative and separate from the working UI. The title gradient moves across its letters. Fine-pointer movement adds a small perspective shift to the hero artwork and layered depth to the image collage, with updates coalesced through one requestAnimationFrame. Image artwork lifts or zooms slightly using the 150ms shared hover token; parallax settles over the 300ms structural token. Slim illuminated frames replace the earlier folder-shaped backplates. Native interactive controls retain their system behavior. Offscreen scenes pause their CSS animations. Reduced-motion bypasses capture, disables animations and removes parallax/hover movement. No canvas, WebGL or animation dependency is added. Portrait layouts stack the content and scroll within the current slide.

All changes are scoped to the presentation route and its stylesheet. Production hosting must serve the Vite SPA entry for /ppt.
