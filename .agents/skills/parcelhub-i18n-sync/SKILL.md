---
name: parcelhub-i18n-sync
description: Keep ParcelHub frontend translations synchronized when user-facing UI copy is added, changed, moved, or removed. Use only in the ParcelHub repository for UI work under client/src; do not invoke for unrelated backend-only changes.
---

# ParcelHub i18n sync

Maintain localization as part of the UI change, not as a separate follow-up.
Limit edits to the affected feature and genuinely shared strings.

## Project invariants

- English is the source locale at `client/src/i18n/locales/en.ts`.
- Keep `zh.ts`, `ja.ts`, `fr.ts`, and `de.ts` semantically equivalent to the
  English resource. Their `satisfies TranslationResource` checks must remain.
- Supported language codes are `en`, `zh`, `ja`, `fr`, and `de`. Do not change
  the language selector or cookie behavior unless the UI request requires it.
- Follow the semantic lower-camel-case key conventions in `docs/i18n.md`.
- Use `useTranslation()` for React-owned copy. Use interpolation for dynamic
  values and i18next plural forms (`_one`, `_other`) instead of concatenating
  translated fragments.
- Format dates, times, and numbers with the active `i18n.language`.

## UI-change workflow

Inspect the changed component and its immediate rendered subcomponents for all
user-visible copy, including headings, labels, placeholders, buttons, statuses,
empty/loading/error states, dialogs, confirmation prompts, tooltips, `aria-label`
text, and meaningful image alt text.

For each affected string:

1. Reuse an existing key only when the underlying concept is the same.
2. Otherwise add a feature-owned key to `en.ts` and translate it in all four
   non-English locale files in the same change.
3. Replace client-owned hardcoded copy with `t(...)`. Keep API-provided free-form
   errors unchanged unless the API exposes a stable error code that can be
   mapped safely.
4. Remove obsolete keys only after confirming they have no callers.

Do not sweep unrelated pages merely because other untranslated strings exist;
keep the localization work proportional to the UI change.

## Verification

Run the client production build from the repository root:

```bash
cd client && npm run build
```

The typed locale shape must pass. Also scan the touched UI files for remaining
visible literals and review pluralization, interpolation variables, localized
date formatting, and accessible labels. Update `docs/i18n.md` only when the
conventions, supported locales, or persistence behavior change.
