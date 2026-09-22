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

Against **WCAG 2.2 Level AA**, across **496 stories** covering **58
components**.

|                     |                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| axe-core violations | **7**, all documented exemptions (below)                                                                                                                                                                         |
| Rules at zero       | `label`, `button-name`, `nested-interactive`, `target-size`, `aria-allowed-attr`, `aria-valid-attr-value`, `link-in-text-block`, `scrollable-region-focusable`, `aria-required-children`, `aria-prohibited-attr` |

These numbers are not hand-maintained. Every build re-runs the audit across
every story and fails if any rule's count has risen, **and** fails if the
figures written here disagree with what the audit measured. If this table is
ever wrong, the build is already red.

**Overlays are audited open.** axe only sees what is rendered, so a panel that
is closed in every story is a panel whose ARIA is never checked - "zero" would
then mean "never looked". Stories that hold a menu, submenu and dropdown open
are part of the audited set, which is what makes
`aria-required-children: 0` above a measurement rather than an artefact of
when the screenshot was taken.

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

| SC                               | Level | How it was verified                                                                                       |
| -------------------------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| 1.4.4 Resize Text                | AA    | Every story re-rendered at 200% root font size; no horizontal overflow                                    |
| 1.4.10 Reflow                    | AA    | Every story at 320x640. No component has an intrinsic minimum width that overflows                        |
| 1.4.12 Text Spacing              | AA    | Required spacing overrides injected; no clipped or overlapping content                                    |
| 1.4.13 Content on Hover or Focus | AA    | `Tooltip` is dismissible on Escape, hoverable, and persistent - pinned by a story test                    |
| 2.1.1 Keyboard                   | A     | Two parts, below - reachability by sweep, operability by story test                                       |
| 2.1.2 No Keyboard Trap           | A     | Same sweep; the only traps are modal dialogs, all escapable                                               |
| 2.2.1 Timing Adjustable          | A     | `Snackbar` pauses auto-dismiss on hover and focus - pinned by a story test                                |
| 2.4.3 Focus Order                | A     | Focus enters, is trapped in modal dialogs, and returns to the opener - pinned per overlay, menus included |
| 2.4.7 Focus Visible              | AA    | Every tab stop across 5712 samples; ambiguous cases confirmed by screenshotting focused vs unfocused      |
| 2.4.11 Focus Not Obscured        | AA    | `elementFromPoint` sweep over every tab stop                                                              |
| 2.5.3 Label in Name              | A     | Every named control compared against its visible text                                                     |
| 2.5.7 Dragging Movements         | AA    | `DataGrid` row reorder has a keyboard path via a focusable drag handle                                    |
| 2.5.8 Target Size (Minimum)      | AA    | axe, plus a deliberate choice to meet 24x24 rather than rely on the spacing exception                     |
| 3.3.1 Error Identification       | A     | All 8 components with an `error` prop set `aria-invalid` and associate the message                        |

### 2.1.1 is two claims, and they need different evidence

**Reachability** - can you get to the control? - is what the focus sweep
measures: ~2350 tab stops enumerated and checked. That is how `Input`'s clear
and password-reveal buttons and `DataGrid`'s drag handle were found.

**Operability** - once there, does a key do anything? - is not something that
sweep can answer, in either direction:

- A control that is **not a tab stop at all** is invisible to it. `Menu`'s
  items were `<li onClick>` with no `tabIndex` and no key handler, so menu
  items in `Menu`, `ContextMenu`, `SplitButton` and `Table`/`DataGrid` row
  actions could only be used with a mouse - and an enumeration of tab stops
  could not have found them, because they never appeared in it.
- A control that **is** a tab stop can still do nothing when activated; the
  sweep checks that focus lands and is visible, not that Enter works.

Operability is therefore pinned by story tests that drive the component with a
keyboard, which is what now covers the menus: a single tab stop per menu,
arrow keys to move with wrapping, `Home`/`End`, `Enter`/`Space` to activate,
`ArrowRight` to open a submenu, focus moved in on open and returned to the
trigger on close.

This is also how `Select` was found to be unusable by keyboard, and fixed.
`ArrowDown`, `ArrowUp`, `Enter` and `Space` updated a flag that reached nothing,
because the underlying overlay kept the real open state to itself. So the list
never appeared, `Enter` still committed the option at that invisible index, and
selecting dropped focus onto `<body>`. axe reported none of it, because the
state only existed after a keypress. `Select` now follows the ARIA
select-only-combobox pattern (arrow keys, `Enter`, `Space` open it; `Escape`
closes it; focus stays on the field throughout), pinned by a story test.

`CommandPalette`'s custom trigger was the same shape and is also fixed. Passing
`trigger={<YourNode />}` wrapped it in an element that announced itself as a
button, took focus, and did nothing when activated - in the one configuration
the documentation demonstrates. The wrapper now measures what it was given: a
non-interactive child makes it a real control with a key handler, an interactive
one leaves it as plain layout, so there is no second tab stop and no nested
button. Pinned by a story test.

No gaps of this kind are currently known. That is a statement about what has
been driven and measured, not a guarantee - the two above were found by
operating components rather than by scanning them, and both had been shipping
for some time.

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

<!-- storybook:end -->
<!--
     Everything below is for someone working in this repository. The
     Storybook rendering of this file stops at the marker above, because a
     reader there has installed the package and cannot run any of it.
-->

## Running the checks yourself

```bash
npm run verify        # includes the full axe sweep over every story
npm test              # story + unit tests, including the a11y behaviours
```

`scripts/check-docs.js` compares the story count and the violation total stated
above against `scripts/a11y-baseline.json`, so this document cannot drift from
the audit. The baseline is re-recorded with
`node scripts/check-a11y-baseline.js --update`, which is also what you run when
adding stories changes the audited count.

Per-component findings are also in Storybook's **Accessibility** panel, beside
each component's Controls.
