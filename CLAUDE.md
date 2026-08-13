# CLAUDE.md — htgffurniture

Shopify theme for htgtfurniture.com.com. Read `AGENTS.md` for commands

---

## Deploy topology — read first

| Branch | Meaning |
|---|---|
| `main` | **LIVE.** Two-way synced by the Shopify GitHub integration (`Update from Shopify for theme firstday-shopify-theme-sync/production` commits land here). Currently checked out. |
| `dev` | `shopify-theme-deploy-dev.yml` pushes to a fixed dev theme. |

`.gitattributes` sets `*.json merge=ours` because the theme editor owns production JSON.
Each clone needs `git config merge.ours.driver true` once. `guard-prod-json.yml` fails any
PR into `prod-theme` that modifies or deletes an existing `.json` (new `.json` files are
allowed; an `allow-json` label overrides).

---

## Tooling

- No build step. No Tailwind, no Vite, no bundler. `package.json` is Shopify CLI + `dotenv-cli` + Prettier only.
- `.prettierrc` → `@shopify/prettier-plugin-liquid`, `tabWidth: 2`, double quotes.
- **No Theme Check config exists** (`.theme-check.yml` is absent) and no linter runs in CI.
  Theme Check does still run in-editor via the Shopify Liquid extension, on its default
  rule set, so you will see warnings the repo never agreed to. Treat them as advice.
- No automated tests. Validate with `npm run devonly` across viewports.
- `.shopifyignore` keeps `AGENTS.md` and `docs/**` out of theme push/pull.

---

# How the code works today

## Responsive strategy

**Mobile first, `min-width`, hardcoded per file.** There is no shared breakpoint variable
that CSS actually consumes.

Two generations coexist.

**1. Be Yours legacy (dominant).** Two breakpoints, repeated literally in ~354 files:

- `750px` — mobile → tablet. Appears in 166 files as `min-width`, 138 as `max-width: 749px`.
- `990px` — tablet → desktop. 71 files `min-width`, 43 as `max-width: 989px`.

`snippets/base.css.liquid:1017` is representative:

```css
@media screen and (max-width: 749px) { ... }
@media screen and (min-width: 750px) and (max-width: 989px) { ... }
@media screen and (min-width: 990px) { ... }
```

JS mirrors it — `assets/global.js:16`: `mediaQuerySmall: 'screen and (max-width: 749px)'`.

**2. `snippets/fd-ui-kit.liquid` design system.** Declares a four-tier scale as custom
properties (`--breakpoint-sm: 0px`, `--breakpoint-md: 768px`, `--breakpoint-lg: 992px`,
`--breakpoint-xl: 1280px`, with column counts in comments). Only `992px` is actually used,
and only inside `fd-ui-kit.liquid` itself to flip the `--font-title-*` / `--font-para-*`
aliases from mobile to desktop values. CSS cannot use a custom property in a media query,
so these tokens are documentation, not mechanism.

Newer bespoke sections pick their own value. `sections/temp-replo-hero.liquid:1050` uses
`@media (max-width: 990px)` — desktop-first, and one off by one from the legacy `989px`.

**Container width.** `--page-width` in `snippets/css-variables.liquid:69`, from
`settings.page_width` (currently `1600`, so `160rem`). `.page-width` in `base.css.liquid:587`
applies it with `50rem`/`5rem` side padding by breakpoint. Bespoke sections override with
their own setting, e.g. `container_max_width_desktop` default `1344px` in the replo hero.

**Grid.** Be Yours' `.grid` / `.grid__item` with modifier classes —
`.grid--3-col-tablet`, `.grid--4-col-desktop`, `.grid--1-col-mobile`, `.grid--gapless`
(`base.css.liquid:1471+`). New sections almost always use flexbox with a gap fed by a
schema setting instead.

## CSS architecture

**Naming: BEM, inconsistently applied.** Be Yours core is clean BEM
(`.grid__item`, `.grid--3-col`, `.card__content`). Newer sections keep block/element but
prefix per section: `.v1-hero-coupon__title`, `.v1-hero-image-wrap-mobile--full`.
There is also a small utility layer: `.visually-hidden`, `.hidden`, `.small-hide`,
`.medium-hide`, `.large-up-hide`, `.focus-none`, `.center`.

**Where tokens live — three layers, in load order from `layout/theme.liquid:219`:**

1. `snippets/css-variables.liquid` — `:root` generated from theme settings. Fonts
   (`--font-body-family` hardcoded to `'sofia-pro'`, `--font-heading-family` to `'gelica'`),
   colors as **R, G, B triplets** (`--color-base-text: 44, 61, 80`, consumed as
   `rgba(var(--color-base-text), 1)`), `--page-width`, card and button tokens,
   `--spacing-sections-desktop` / `-mobile`. Also sets `html { font-size: calc(var(--font-body-scale) * 62.5%) }`, so **1rem = 10px**.
2. `snippets/base.css.liquid` (84 KB) — the Be Yours stylesheet, inlined in a `{% style %}` block.
3. `snippets/custom.css.liquid` (53 KB) + `snippets/new_custom.css.liquid` (17 KB) — overrides.

Then `snippets/fd-global-css.liquid` renders `snippets/fd-ui-kit.liquid` plus twelve
`fd-*.css` component stylesheets.

**`fd-ui-kit.liquid` is the intended design system and is barely adopted.** It defines
brand/product/segment colors (`--color-brand-noon-blue: #476DED`, `--color-segment-kids: #FFB511`),
a radius scale, a 13-step spacing scale (`--spacing-tiny: 4px` … `--spacing-giant: 80px`),
a full mobile/desktop type scale, and `mob-title-*` / `desk-title-*` utility classes.
Measured usage outside the kit itself: `--color-text-on-light-1` in 10 files,
`--color-brand-noon-blue` in 6, `--spacing-md` in 1, `--shadow-outline-primary` in 0, the
`mob-title-*` utilities in 1. Most sections re-declare the same hex values inline.

**How CSS ships.** Four ways, all in use:

- Inlined via `{% render 'name.css' %}` on a snippet whose file is `snippets/name.css.liquid` and whose body is a `{%- style -%}` block (layout-level globals, and 7× `component-rte.css` etc. from sections).
- `{{ 'file.css' | asset_url | stylesheet_tag }}` in 85 files (`sections/benefits.liquid:1`).
- `{% style %}` inside the section — 126 sections. Scoped by `#shopify-section-{{ section.id }}` or a block-id class.
- Raw `<style>` inside the section — 99 sections (`sections/temp-replo-hero.liquid:725`). Not scoped, so these leak globally.

**Units.** `base.css.liquid` is rem-dominant (353 rem vs 249 px), on the 1rem = 10px scale.
Every section-level and schema-driven value is **px** — every padding/margin/font-size
setting is `"type": "range"` with `"unit": "px"`, interpolated as `{{ setting }}px`.

## JavaScript architecture

**Web Components are the primary pattern.** ~60 custom elements across 42 files. Base
classes live in `assets/global.js` (~1900 lines, unminified, `window.theme` namespace) —
`MenuDrawer`, `CartDrawer extends MenuDrawer`, `ModalDialog`, `SliderComponent`,
`VariantSelects`, `ProductForm`, `DeferredMedia`, `QuantityInput`. Section-specific
elements are defined in their own asset or inline in the section.

```js
class MenuDrawer extends HTMLElement {
  constructor() { super(); ... }
}
customElements.define('menu-drawer', MenuDrawer);
```

**Loading.** Everything is a classic script with `defer` — 68 `defer` occurrences in
sections, zero `type="module"`, zero async bundles. `global.js` is loaded from
`layout/theme.liquid:528`.

**Alongside that**, 245 inline `<script>` blocks in sections, mostly IIFEs that re-init on
`shopify:section:load` (`sections/temp-replo-hero.liquid:1499`).

**`window.HomepageSectionRegistry`** (`layout/theme.liquid:530`) is a homegrown lifecycle
registry: `register(sectionId, {init, destroy, rerender})`, debounced 150ms resize
re-render, auto-unregister on `shopify:section:unload`. Use it for new sections that need
JS tied to viewport changes.

**Cart JS is its own system** — `assets/fd-cart-store.js`, `fd-cart-api.js`,
`fd-cart-context.js`, orchestrated by `snippets/firstday-minicart-js.liquid`. Dawn's
`cart.js` / `cart-drawer.js` exist in `assets/` but are **not loaded**. See `docs/cart/CART.md`.

**Third party loaded in `theme.liquid`:** jQuery 3.7.0 (snippet), SweetAlert2, Font Awesome
kit, GTM, Intelligems (render-blocking ESM), Pandectes consent, Kameleoon, Alia, Beam,
Gorgias (conditional), OpenAI pixel, Rebuy. No package-managed frontend dependencies.

## Section and block conventions

**Two generations, again.**

*Legacy Be Yours* — `padding_top` / `padding_bottom` only (113 sections each), labels
via `t:sections.all.padding.*` keys, `step: 4`, `default: 36`. Mobile handled by a later
bolt-on with a different naming scheme: `mobile_padding_top` (5 sections) or
`padding_top_mobile` (19 sections). `sections/image-with-text.liquid:598` shows both
conventions in one schema. There is no horizontal padding setting at all.

*Modern bespoke* — `sections/temp-replo-hero.liquid` is the reference implementation and
matches the house rules below. Every value becomes a CSS custom property in a `style`
attribute on the section root:

```liquid
<section class="v1-hero-section" id="temp-replo-hero" style="
    --section-padding-top-desktop: {{ section.settings.padding_top_desktop }}px;
    --section-padding-right-desktop: {{ section.settings.padding_right_desktop }}px;
    ...
    --headline-font-family: {{ section.settings.headline_font_family }};
    --headline-font-size-desktop: {{ section.settings.headline_font_size_desktop }}px;
    --headline-font-weight: {{ section.settings.headline_font_weight }};
    --headline-font-color: {{ section.settings.headline_font_color }};
  ">
```

**Setting id convention:** `snake_case`, `<element>_<property>_<viewport>`. Viewport suffix
last — `headline_font_size_mobile`, `padding_left_desktop`. Do not use the older
`mobile_padding_top` prefix order in new code.

**Text element settings, per element:**

| Property | Type | Note |
|---|---|---|
| `*_font_family` | `text` | Raw CSS stack, e.g. default `"'gelica', serif"` |
| `*_font_size_desktop` / `_mobile` | `range` | `unit: "px"` |
| `*_font_weight` | `range` | e.g. `min: 300, max: 900, step: 100` |
| `*_font_color` | `color` | hex |

**Grouping.** `{ "type": "header", "content": "..." }` before each cluster, ordered the way
a merchant edits: Section Spacing – Desktop → Section Spacing – Mobile → Section Appearance
→ Layout Gaps → then one header per visual element top to bottom (Hero Image, Top Badge,
Stars Rating, Headline, Description, CTA Button, …).

**Colors are per-section `color` settings, not Shopify color schemes.** 125 sections declare
raw `color` settings; **zero** sections use `"type": "color_scheme"`. Global colors exist in
`settings_schema.json` but only feed `css-variables.liquid`.

**Blocks.** `blocks/` holds 10 theme blocks (`temp-testimonial`, `temp-social-proof`,
`pill-button`, `svg`, `author`, `temp_hero_list_item`, …). Sections opt in with
`"blocks": [{ "type": "@theme" }, { "type": "@app" }]` and render them by looping
`section.blocks` and calling `{% render block %}`, filtering on `block.type`
(`temp-replo-hero.liquid:343`). Blocks scope their own CSS by `block.id`:

```liquid
{%- style -%}
  .v1-hero-list-item-{{ block.id }} .v1-hero-list-text {
    font-size: {{ block.settings.text_size_desktop | default: 16 }}px;
  }
{%- endstyle -%}
<div class="v1-hero-list-item v1-hero-list-item-{{ block.id }}" {{ block.shopify_attributes }}>
```

The bulk of the theme still uses old-style in-schema `blocks` arrays defined per section.

## Liquid conventions

- **`render` only.** 1064 `render` calls. The only two `include` calls left in
  hand-written code are `layout/theme.liquid:246` (`kameleoon-root-script`) and
  `:786` (`smile-initializer`). Do not add new `include`.
- **Whitespace control** is used deliberately in logic (`{%- liquid ... -%}`,
  `{%- if -%}`), and omitted in markup blocks. Multi-assign blocks use the `{%- liquid -%}` tag.
- **Variable naming:** `snake_case`. Local variables in newer sections take a section
  prefix to avoid collisions — `fd_badge_phrases`, `fd_first_phrase`, `hero_headline`.
- **Translations are mixed.** 4294 `t:` schema labels vs 5178 literal English labels;
  591 `| t` calls in body copy. Locale files exist for 13 languages. New bespoke sections
  use literal English labels throughout. Storefront-visible strings that already have a
  `locales/` key should use it (`{{ 'products.product.add_to_cart' | t }}`).
- **Metafields** are read directly in Liquid, never written. Heaviest namespaces:
  `metafields.judgeme.widget` (112), `metafields.reviews.rating` (53),
  `metafields.custom.demographic` (24), `metafields.custom.starter_*`,
  `metafields.custom.blurb`, `metafields.theme.countdown`.

## Accessibility

Be Yours' baseline is intact and worth preserving.

- Skip link — `layout/theme.liquid:671`, `.skip-to-content-link` + `visually-hidden`,
  target `#MainContent` with `role="main" tabindex="-1"`.
- Focus — `base.css.liquid:1286+` implements the full Dawn pattern: `*:focus-visible`
  outline, a `.focused` / `.no-js *:focus` fallback, and `.focus-inset` / `.focus-offset` /
  `.focus-none` variants. `--color-keyboard-focus` is a theme setting.
- `.visually-hidden` in 67 files. `aria-label`, `aria-hidden`, `aria-controls`,
  `aria-expanded`, `aria-current`, `aria-live`, `aria-modal` all in wide use.
- Live regions exist (`#a11y-refresh-page-message`, `cart-live-region-text`).
- `@media (prefers-reduced-motion: reduce)` is respected in `base.css.liquid` and in the
  newer hero animations (`temp-replo-hero.liquid:849`, and the JS checks `matchMedia` too).

---

# How to write NEW code

- Follow `sections/fd-problem-signs.liquid` and its blocks (`fd-problem-sign-card`,
  `fd-media`, `fd-rich-text`). They are the reference set: they satisfy the fixed rules
  below and every block is self-contained.
- **One shell, many layouts.** `fd-problem-signs` carries two different Figma frames from a
  single section via a `content_layout` select (`row` / `stack`) plus a preset each, rather
  than forking. Reach for that before adding a near-duplicate section. `visible_if` hides
  the settings that genuinely only apply to one layout — see
  `sections/temp-dtop-cat-slider.liquid` for the same carousel/grid pattern.
- Presets can seed block settings, not just section settings. Use that to make a preset
  drop in as the real design instead of three copies of placeholder copy.
  `sections/temp-replo-hero.liquid` is the older house style and also fits the rules, but
  its blocks depend on the section for styling.
- **Make theme blocks self-contained.** Style them from inside the block, scoped by
  `block.id`, and read every value as `var(--token, <design default>)`. Custom properties
  inherit, so a parent section that defines those tokens restyles all its blocks at once,
  while the same block dropped into any other `@theme` section still renders correctly.
  This also avoids specificity fights: a section styling with `#id .class` (1,1,0) beats a
  block's `.class .class` (0,2,0), so block-level *declarations* silently lose. Variables
  do not have that problem.
- Feed every schema setting into a CSS custom property on the section root, then style
  against the variable. Never interpolate a setting directly into a CSS rule body.
- Prefer a theme block in `blocks/` over an in-schema block, and reuse an existing one
  before adding another.
- Scope section CSS. Use `{% style %}` (not raw `<style>`) so Shopify scopes it, or prefix
  every selector with the section class.
- Use `{% render %}`, never `{% include %}`.
- New JS: a custom element registered with `customElements.define`, loaded with `defer`.
  If it depends on viewport width, register with `window.HomepageSectionRegistry`.
- Re-initialize on `shopify:section:load` so the theme editor works.
- Keep the accessibility baseline: real headings, `aria-*` on interactive controls,
  `alt` text driven by a setting, `prefers-reduced-motion` guard on any animation.
- Cart work: read `docs/cart/CART.md` first. Use `FDCartApi`, never raw `/cart/*.js`.
- 2-space indent everywhere. Run Prettier on Liquid before committing.

---

# Do not

- **Do not commit to `production`, `main`, or `prod-theme`.** `production` is the live
  branch synced two-way with the live theme by the Shopify GitHub integration. Work on a
  feature branch and open a PR.
- **Do not edit existing `.json` files** on a PR targeting `prod-theme` — the theme editor
  owns them and `guard-prod-json.yml` will fail the build. This includes
  `templates/*.json`, `config/settings_data.json`, and section group JSON.
- **Do not touch `snippets/replo*.liquid`, `snippets/reploChunk.*`, or `sections/replo-*`.**
  892 of the 1242 snippets are Replo-generated. They are app output, not theme code.
  (`sections/temp-replo-hero.liquid` is hand-written despite the name and is in scope.)
- **Do not touch `assets/instant-*` or `sections/instant-*`** — generated page-builder output.
- **Do not add raw `<style>` blocks to sections.** 99 already exist and they leak globally.
- **Do not reach for `!important`.** 601 occurrences in sections already; each one makes
  the next override harder.
- **Do not hardcode a new breakpoint value.** Match the file you are editing: `750px`/`990px`
  for legacy Be Yours code, `992px` if you are building on `fd-ui-kit`. Do not introduce
  a third.
- **Do not re-declare brand hex codes.** If `fd-ui-kit.liquid` has the token, use it.
- **Do not treat the wave snippets as interchangeable.** `snippets/waves.liquid`,
  `snippets/wave-svg.liquid` and `snippets/fd-wave-svg.liquid` are three different curves
  with different viewBoxes. Swapping one for another silently changes the artwork.
- **Do not fork a section into `-v2` / `-v3` / `temp-` copies** to make a variant. 28
  `temp-*` sections and 13 `PBFCM-*` sections already exist with heavy duplication. Add a
  setting or a block instead.
- Do not commit secrets, store IDs, or `config/settings_data.json`.
- Do not assume a Liquid object works because it looks plausible. Nothing in CI will catch
  it, and the in-editor Theme Check does not validate object paths. Verify against shopify.dev.

---

# Open questions

Confirm these before I encode them as conventions.

1. **`shop.metaobjects` is unverified.** `sections/temp-replo-hero.liquid:21` iterates
   `shop.metaobjects.query_parameters.values`. The documented global is `metaobjects`,
   not `shop.metaobjects`; the `shop` object's documented properties do not include
   `metaobjects`. I could not confirm this path on shopify.dev. It may be working by
   accident, silently returning nil, or be an undocumented alias. Worth testing.
2. **`{% render block %}` is unverified.** Used in `temp-replo-hero.liquid:345` to render
   theme blocks from a `section.blocks` loop. shopify.dev documents `{% content_for 'blocks' %}`
   for theme blocks and does not document passing a block object to `render`. Is this
   deliberate (to control ordering by `block.type`), and is it supported long term?
3. **Which branch is canonical?** `main` deploys to the prod theme via Actions, `production`
   is synced two-way by the Shopify GitHub integration, and `prod-theme` also receives
   Shopify sync commits (labelled `CAREMORE PRODUCTION`). Three branches can reach a live
   theme. Where should a normal feature PR be targeted?
4. **Is `fd-ui-kit.liquid` the intended direction or abandoned?** Measured adoption is near
   zero. If it is the target, new sections should consume its tokens instead of exposing
   per-section font/color settings — which directly contradicts fixed rule 3 below.
5. **Breakpoint reconciliation.** Legacy is `750`/`990`; `fd-ui-kit` declares `768`/`992`/`1280`;
   `temp-replo-hero` uses `990`. Which set governs new work?
6. **Should new sections use `t:` translation keys or literal English labels?** The split is
   roughly 45/55 and the newest sections are all literal English.
7. **Fixed rule 2 (padding) conflicts with 113 existing sections** that expose only
   `padding_top` / `padding_bottom` and no horizontal padding. Apply the rule to new
   sections only, or backfill the legacy ones?
8. **No Theme Check config.** Should I add `.theme-check.yml` and wire it into CI?
9. **Fixed rules 2 and 3 trip Theme Check's `ExcessiveSettingsCount`** (default max 40).
   Eight padding values plus four font settings per text element means any section with
   more than about six text elements exceeds it — `sections/fd-problem-signs.liquid` lands
   at 75. The rule is advisory and the section works, but if we want a clean editor we need
   either a `.theme-check.yml` that raises or disables the limit, or fewer per-element
   settings (for example a shared type scale from `fd-ui-kit`). Which?

---

## Section settings

- Universal reusable blocks over one off blocks.
- Every section gets desktop padding top right bottom left and mobile
  padding top right bottom left as separate values.
- Every text element gets font family (text field), font size, font
  weight, font color.
- Group settings with headers, ordered the way a merchant edits.

### `range` settings must satisfy four rules or the push fails

Nothing in this repo catches these before deploy. There is no Theme Check config
and no CI schema check, and in-editor Theme Check does not validate them either.
The first thing that ever complains is `shopify theme push`, which rejects the
whole file. Every padding, font size and max width setting in this theme is a
`range`, so this is the single most common way a new section fails to deploy.

For every `range` setting, given `min`, `max`, `step` and `default`:

1. `step` has **at most 1 decimal digit**. `0.1` is fine, `0.05` is not.
2. `(max - min)` is **evenly divisible by** `step`. 280 to 900 by 8 fails,
   because 620 / 8 is 77.5.
3. `default` sits **on a step from `min`**, so `(default - min) / step` is a
   whole number. min 320 default 620 by step 8 fails.
4. `(max - min) / step` is **101 or fewer**. min 200 max 520 by step 2 fails at
   160 steps.

Design values are fixed and the slider bounds are not, so when a design value
collides with a rule, **move `min`, `max` or `step`, never the `default`.** To
keep 342 on a 2px step, narrow the range to 240–440 rather than rounding the
design to 340.

`sections/fd-problem-signs.liquid` still trips rule 3 on `wave_height`
(min 8, max 120, step 2, default 33).

## Copy voice for customer facing text

- No hyphens, dashes, semicolons, or colons.
- Short paragraphs. More periods, fewer commas.
- Concrete and scannable.
- Features tell. Benefits sell. Emotion closes.
