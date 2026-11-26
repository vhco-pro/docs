---
title: "Design browser extensions"
type: guide
description: "What to read before designing or building a WebExtension for Chrome or Firefox, which agent skills to use, and conventions measured on a shipped extension."
status: active
---

# Design browser extensions

Use this guide before you specify, design, build or review a browser extension: a Chrome
Manifest V3 extension, a Firefox WebExtension, or one codebase for both. It adds
extension-specific sources to the general [frontend design procedure](use-frontend-design-skills.md),
which still applies in full, including its rendered verification and interface review. Browser
extension pages are browser frontends, so the [frontend testing standard](../conventions/frontend-testing.md)
and the [interface colour guideline](../conventions/interface-colour.md) apply too. New extension
interfaces use [VH Midnight](vh-midnight.md) unless the product already has its own identity.

Read the relevant platform sources first, then the pinned skills. These references do not
install a plugin or run any tooling.

## Sources

The browser vendors' own documentation decides behaviour. When a skill disagrees with it,
follow the platform source and report the difference.

- Chrome, [User interface components](https://developer.chrome.com/docs/extensions/develop/ui):
  the surfaces an extension can use (action, popup, side panel, context menu, options page,
  omnibox, notifications) and when each fits.
- Chrome, [Add a popup](https://developer.chrome.com/docs/extensions/develop/ui/add-popup):
  declaring and switching the action popup.
- Chrome, [Support accessibility](https://developer.chrome.com/docs/extensions/how-to/ui/a11y):
  keyboard access, labels and focus in extension pages.
- MDN, [Popups](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups):
  how popups open, close and size themselves. Firefox sizes a popup to its content and grows
  it to at most 800x600 pixels, so set an explicit width on the popup's root.
- Firefox Extension Workshop, [User experience best practices](https://extensionworkshop.com/documentation/develop/user-experience-best-practices/):
  keep the extension focused, put features where users need them, tell users what will happen
  before it happens, use badges sparingly, onboard well and test on real pages.
- MDN, [`background`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background):
  Chrome runs the background as a service worker only, while Firefox runs background scripts
  as a non-persistent document unless told otherwise. Neither keeps state in memory for long;
  read Chrome's [service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
  and keep state in `storage`.
- Chrome, [`commands`](https://developer.chrome.com/docs/extensions/reference/api/commands) and MDN,
  [`commands`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands):
  a suggested shortcut is only a request; `commands.getAll()` reports the shortcut that is
  actually active, or an empty string.
- Chrome, [`permissions`](https://developer.chrome.com/docs/extensions/reference/api/permissions):
  optional permissions requested at runtime from a user gesture.

For control sizing and icon buttons:

- W3C, [Understanding SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
  a pointer target is at least 24x24 CSS pixels, or has enough spacing, with exceptions for
  inline links and equivalent controls.
- Smashing Magazine, [Getting to the bottom of minimum WCAG-conformant interactive element size](https://www.smashingmagazine.com/2024/07/getting-bottom-minimum-wcag-conformant-interactive-element-size/):
  how the 24x24 minimum, the spacing exception and the 44x44 AAA target relate in practice.
- Android, [Material 3 `IconButton`](https://developer.android.com/reference/kotlin/androidx/compose/material3/IconButton.composable):
  a 24x24 icon inside a 48x48 minimum touch target, with a `contentDescription`.
- Primer, [IconButton](https://primer.style/product/components/icon-button/): an icon-only
  button carries an accessible label and shows it as a tooltip.

As a real-world reference for a password manager:

- Bitwarden, [Bringing intuitive workflows and visual updates to the Bitwarden browser extension](https://bitwarden.com/blog/bringing-intuitive-workflows-and-visual-updates-to-the-bitwarden-browser/)
  (first published May 2024, updated after release): a prominent Fill action on vault items,
  one combined copy menu, a compact mode, default, wide and extra-wide widths, and settings that
  restore familiar workflows.
- Bitwarden community, [Browser extension redesign beta](https://community.bitwarden.com/t/browser-extension-redesign-beta/74727):
  the October 2024 beta thread with user feedback and known issues, such as state lost when
  the popup closes.

## Use these agent skills

Read the pinned skill and its references at the same commit. Apply its advice only where it
does not conflict with the platform sources above and the exceptions listed here.

### Chrome extension APIs: Google's `chrome-extensions`

[`chrome-extensions`](https://github.com/GoogleChrome/modern-web-guidance/blob/9e70fa4c808b52364eb85c645e261523231176f6/skills/chrome-extensions/SKILL.md) <!-- renovate: source-ref=main -->
in `GoogleChrome/modern-web-guidance`, Apache-2.0. The `GoogleChrome` organization also hosts
`chrome-extensions-samples` and Lighthouse, whose homepages are on developer.chrome.com, and its
public members include Chrome developer relations staff. GitHub does not show it as a verified
organization. The repository calls itself a preview release, published from
`GoogleChrome/modern-web-guidance-src`.

Use it for Manifest V3 API pitfalls: the ephemeral service worker, `chrome.alarms` instead of
timers, `return true` for async message replies, top-level listeners, offscreen documents,
icons and the Chrome Web Store review checklist. It is Chrome-only and says nothing about
Firefox. Do not follow these parts:

- **Code execution through a Blob URL or `srcdoc` iframe.** Rule 3 calls these ways to bypass
  the extension CSP. Under CSP inheritance, local-scheme documents take the creator's policy, so
  the claim is doubtful, and an extension handling secrets must not run dynamic code at all.
  If code execution is truly required, use a manifest `sandbox` page.
- **Rule 12 on `activeTab`.** Clicking the action grants `activeTab` even when it opens a popup,
  so a popup can script the current tab. The skill's fix (`tabs` plus `host_permissions`, with
  `<all_urls>` in the reference) is far broader than needed. Prefer `activeTab` or a narrow
  optional host permission.
- **Part 2, `CHROMEWEBSTORE.md`.** The skill creates and maintains this file unprompted. Create
  store listing material only when the owner asks to publish.

### Extension UI review: `chrome-extension-ui`

[`chrome-extension-ui`](https://github.com/pproenca/dot-skills/blob/e896b4a746433a88ade6cc0f21d0fcc6c73dfa94/skills/.experimental/chrome-extension-ui/SKILL.md) <!-- renovate: source-ref=master -->
in `pproenca/dot-skills`, MIT. Listing sites name it `chrome-extensions-ux-ui-best-practices`;
the source lives under `.experimental/`. It is a personal collection: its `metadata.json` says
"Chrome Extensions Community", which is not an organization behind it.

Use its 42 rules as a review checklist for surface choice, keyboard access, icon-button labels,
popup size, instant render, side panel width, content-script UI in a shadow root, and
feedback states. Do not follow these parts:

- **`popup-auto-close`** saves every input to `chrome.storage.local` on each keystroke. Never
  persist secrets, unlock fields or form values containing credentials this way.
- **`options-sync-storage`** sends settings to `chrome.storage.sync` by default. Sync only
  settings that are safe to leave the device, and nothing derived from secrets.
- Its colour values. Use VH Midnight or the product's identity instead.

### Rejected skills

- [`quangpl/browser-extension-skills`](https://github.com/quangpl/browser-extension-skills/blob/6c3c0b49322d4beb90a7ca6d266d6df25f8e0c52/skills/extension-ui/SKILL.md)
  (`extension-ui` and its eleven siblings, MIT). Every skill opens with a paid upgrade
  advertisement, and the review report template adds "Powered by Extension Booster" branding.
  `extension-ui` tells the agent to execute instead of explaining, prescribes a Google-blue
  palette and a Tailwind or shadcn stack, and makes a dark-mode toggle mandatory.
- [`samber/cc-skills` `chrome-extension`](https://github.com/samber/cc-skills/blob/7e64f913b8045b822866f2bb7d04195611d0b1cb/skills/chrome-extension/SKILL.md)
  (MIT). Its default state pattern sets `chrome.storage.session` to
  `TRUSTED_AND_UNTRUSTED_CONTEXTS`, which exposes session data to content scripts. It frames a
  content-script fetch relay as a CSP bypass and triggers on "bypass CSP". It also states that
  the service worker cannot push to popup or options pages, which `runtime.sendMessage`
  contradicts.
- [`pproenca/dot-skills` `chrome-extension`](https://github.com/pproenca/dot-skills/blob/e896b4a746433a88ade6cc0f21d0fcc6c73dfa94/skills/.experimental/chrome-extension/SKILL.md)
  (MIT). A code-quality rule set that overlaps Google's skill without adding design guidance.
- No Mozilla-owned agent skill covers extension authoring. The skills in `mozilla-firefox/firefox`
  are for work on Firefox itself. Use MDN and the Extension Workshop above.

## Apply the measured conventions

These conventions come from building the owner's password-manager extension, Baopass, and were
measured in Chromium and Firefox. Check them again in the target browsers before relying on a
browser behaviour.

### Popup layout

- Keep the popup compact, about 360 CSS pixels wide, with an explicit width on its root.
- Put utility actions (settings, lock, refresh) in the header as icon buttons. Give each
  icon-only button a `title` tooltip and an `aria-label`, and a hit area of at least 24x24 CSS
  pixels.
- Bundle icons as inline SVG, for example from [Lucide](https://lucide.dev/license) (ISC; a few
  icons derived from Feather are MIT). Never load icons, fonts or scripts from the network.
- Keep familiar field conventions. A password reveal toggle, copy or clear action sits inside
  the input on the right, not as a separate button below it.
- Full pages, such as the options page or a confirmation window, may keep labelled text
  buttons, with one primary action.

### Shortcuts

Treat `suggested_key` as a request. Chrome 159 left a suggested `Ctrl+Shift+L` unbound
(`chrome.commands.getAll()` returned `""` for it) while `Alt+Shift+L` bound. After installing,
read `commands.getAll()` in each target browser, and show users how to set the shortcut when
it is empty.

### Permission prompts

Chromium silently re-grants an optional host permission the user allowed before, even after
`permissions.remove()`. Firefox prompts again. Do not use the browser's permission prompt as a
per-use confirmation; build your own confirmation step when an action needs one.

### Headed tests

Permission prompts, shortcuts and popups need a headed browser. The agent runs these tests on
a virtual display with real keyboard and pointer input and records the result. The
[frontend testing standard](../conventions/frontend-testing.md) already rules out an owner
walkthrough as a substitute; do not hand these tests to the owner.

## Updates

Update the skill pins and measured behaviour through a reviewed documentation change. A
listing site's popularity count or install number is not a quality rating, and listing sites
can lag behind or mirror the source repository; read the source on GitHub at a commit.
