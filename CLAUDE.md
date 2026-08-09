# Project Notes

## Shopify Theme Gotchas

- **Schema text settings:** Never use `"default": ""` (empty string) on a `text` type setting. Shopify schema validation rejects it. Omit the `default` key entirely if the field should start blank.
