# Accessibility

## The short version

**eidos-ui does not claim a WCAG conformance level, and cannot.** That is not
modesty about the work below - it is what the standard says. WCAG 2.2
[§5.2.2 Full pages](https://www.w3.org/TR/WCAG22/#cc2):

> Conformance (and conformance level) is for full web page(s) only, and
> cannot be achieved if part of a web page is excluded.

A component library is not a web page. Conformance is a property of the thing
you build; this library is one input to it. Anyone telling you their component
library "is WCAG AA" is describing something the standard has no way to mean.

What this library can do - and what the rest of this document evidences - is
**hold up its end**: ship components that do not make a conforming page
harder to build, and be specific about which criteria it takes responsibility
for and which remain yours.

## Scope and results

Against **WCAG 2.2 Level AA**, across **475 stories** covering **58
components**.

|                     |                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| axe-core violations | **7**, all documented exemptions (below)                                                                                                                                                                         |
| Story tests         | 528 (`npm test`)                                                                                                                                                                                                 |
| Rules at zero       | `label`, `button-name`, `nested-interactive`, `target-size`, `aria-allowed-attr`, `aria-valid-attr-value`, `link-in-text-block`, `scrollable-region-focusable`, `aria-required-children`, `aria-prohibited-attr` |

These numbers are not hand-maintained. `scripts/check-a11y-baseline.js` drives
axe over every story on each `npm run verify`, and fails the build if any rule
count rises. If this table is ever wrong, the build is already red.

## The 7 remaining nodes

All are **disabled** controls, which
[SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) exempts:

> Text or images of text that are part of an inactive user interface
> component ... have no contrast requirement.

| Component     | Element                    | Ratio |
| ------------- | -------------------------- | ----- |
| `Chip`        | disabled chip label        | 1.60  |
| `ColorPicker` | label of a disabled picker | 3.04  |
| `InlineEdit`  | disabled value             | 2.56  |
| `OTPInput`    | disabled label             | 2.63  |
| `OTPInput`    | disabled hint              | 2.34  |
| `TagInput`    | disabled chips (x2)        | 2.06  |

Each is verified against the source rather than assumed from its colour: all
seven resolve to `--text-disabled`, or sit under a `--disabled` modifier
applying `opacity: 0.5`/`0.6`. That distinction is worth drawing carefully,
because a muted grey is not by itself evidence that a control is inactive.

They stay **counted** in the baseline rather than tagged out. A visible,
explained 7 is more honest than a hidden 0.

## Criteria verified beyond axe

axe covers roughly a third of WCAG success criteria. The rest of the AA set
that applies to a component is covered as follows.

| SC                               | Level | How it was verified                                                                                  |
| -------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| 1.4.4 Resize Text                | AA    | Every story re-rendered at 200% root font size; no horizontal overflow                               |
| 1.4.10 Reflow                    | AA    | Every story at 320x640. No component has an intrinsic minimum width that overflows                   |
| 1.4.12 Text Spacing              | AA    | Required spacing overrides injected; no clipped or overlapping content                               |
| 1.4.13 Content on Hover or Focus | AA    | `Tooltip` is dismissible on Escape, hoverable, and persistent - pinned by a story test               |
| 2.1.1 Keyboard                   | A     | Focus sweep over ~2350 tab stops; `Input`'s buttons and `DataGrid`'s drag handle made reachable      |
| 2.1.2 No Keyboard Trap           | A     | Same sweep; the only traps are modal dialogs, all escapable                                          |
| 2.2.1 Timing Adjustable          | A     | `Snackbar` pauses auto-dismiss on hover and focus - pinned by a story test                           |
| 2.4.3 Focus Order                | A     | Focus enters, is trapped in modal dialogs, and returns to the opener - pinned per overlay            |
| 2.4.7 Focus Visible              | AA    | Every tab stop across 5712 samples; ambiguous cases confirmed by screenshotting focused vs unfocused |
| 2.4.11 Focus Not Obscured        | AA    | `elementFromPoint` sweep over every tab stop                                                         |
| 2.5.3 Label in Name              | A     | Every named control compared against its visible text                                                |
| 2.5.7 Dragging Movements         | AA    | `DataGrid` row reorder has a keyboard path via a focusable drag handle                               |
| 2.5.8 Target Size (Minimum)      | AA    | axe, plus a deliberate choice to meet 24x24 rather than rely on the spacing exception                |
| 3.3.1 Error Identification       | A     | All 8 components with an `error` prop set `aria-invalid` and associate the message                   |

## What remains yours

These are page- or application-level and cannot be satisfied by a component:

- **1.3.5 Identify Input Purpose** - pass `autocomplete` to `Input`; it is
  forwarded, but only you know a field collects the user's own name.
- **2.4.1 Bypass Blocks**, **2.4.2 Page Titled**, **2.4.5 Multiple Ways**,
  **3.1.1 Language of Page**, **3.2.3 Consistent Navigation**,
  **3.2.4 Consistent Identification**, **3.2.6 Consistent Help** - all
  properties of a page or a site.
- **1.2.x Time-based Media** - the library ships no audio or video.
- **3.3.3 Error Suggestion**, **3.3.4 Error Prevention** - the components
  render and associate the error text you supply; whether it is _useful_ is
  yours.
- **Content you pass in.** A `Button` cannot fix an unclear label, and an
  `<img>` handed to `Avatar` needs your `alt`.
- **Theming.** Custom palettes are validated for contrast at runtime (see the
  `ThemeEditor` docs), but a theme that overrides tokens directly in CSS
  bypasses that.

## What has _not_ been done

Stated plainly, because an omission presented as a gap is honest and an
omission left unmentioned is not:

- **No testing with real assistive technology.** No VoiceOver, NVDA or JAWS
  pass has been run. Everything above verifies the accessibility _tree_ and
  the DOM programmatically, which is strong evidence and not the same thing.
  Screen readers disagree with each other and with the spec in practice.
- **No testing with real users.**
- **No independent audit.** All of this is self-assessment.

If you need a conformance claim for procurement, these three are the gap
between this document and one.

## Running the checks yourself

```bash
npm run verify        # includes the full axe sweep over every story
npm test              # 528 story + unit tests, including the a11y behaviours
```

Per-component findings are also in Storybook's **Accessibility** panel, beside
each component's Controls.
