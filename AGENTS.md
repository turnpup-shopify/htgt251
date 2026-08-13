# Repository Guidelines

## Project Structure & Module Organization
- `layout/` holds the base layouts (`theme.liquid` entry).
- `sections/` contains configurable page sections; pair schema JSON with Liquid markup.
- `snippets/` stores reusable Liquid fragments; `templates/` defines page-level templates.
- `assets/` keeps theme scripts, styles, SVGs, and static files; prefer compiled/minified outputs.
- `config/` holds theme settings; `config/settings_data.json` is environment-local and ignored on pulls.
- `locales/` provides translation JSON files; align keys with Liquid usage.
- `scripts/` is reserved for automation; keep additions cross-platform.

## Build, Test, and Development Commands
- tbd

## Coding Style & Naming Conventions
- Use 2-space indentation across Liquid, JSON, and JavaScript.
- Name sections/snippets descriptively (e.g., `product-upsell.liquid`); keep schema titles human-readable.
- Prefer `render` over legacy `include` in Liquid.
- Keep inline scripts minimal; move shared JS/CSS to `assets/`.
- Preserve translation key consistency; avoid hard-coded copy where a `locales/` entry exists.

## Testing Guidelines
- No automated tests yet;
- Watch console and theme editor for Liquid errors, missing assets, or translation fallbacks.
- Before pushing, verify section settings and blocks still save in the theme editor.

## Commit & Pull Request Guidelines
- Write imperative, concise commit subjects (e.g., `Add PDP size guide section`); group related changes per commit.
- PRs should include: summary, affected templates/sections, screenshots or screencasts for desktop/mobile, and the Shopify theme ID or store URL used.

## Security & Configuration Tips
- tbd
- Do not commit generated `config/settings_data.json`; share setting presets via documentation or theme backups instead.
- Avoid embedding secrets or store-specific IDs in assets or Liquid; prefer settings or metafields.

## Cart Drawer
- tbd