# Contributing

Thanks for your interest in eidos-ui.

## Feedback and bug reports: yes, please

[Open an issue](https://github.com/PedroMealha/eidos-ui/issues) for bugs, questions, or ideas.
Helpful things to include in a bug report:

- the `eidos-ui` version (`npm ls eidos-ui`)
- your React version, and whether the app is server-rendered
- a minimal reproduction, or just the component and the props involved
- what you expected, and what happened instead

Suggestions about API shape, naming, accessibility, or documentation are every bit as welcome as
defect reports.

## Pull requests: not accepted

This is a single-maintainer project and the code side is deliberately kept that way. Please don't
invest time in a pull request - it will be closed unmerged regardless of its quality. That isn't a
judgement of the work, and closing it after you'd already written it would waste your effort, which
is why it's stated up front.

The reason is consistency. The library's value comes from every component sharing one API
vocabulary, one set of variant and size names, one documentation structure, and one styling
approach. Holding that together across the whole library is considerably easier with a single author
than with a review process.

If you need behaviour the library doesn't have:

- **Open an issue describing the use case.** This is the most useful thing you can do - it's how the
  roadmap actually gets set.
- **Override it locally.** Every design token is a CSS custom property and every component exposes
  `eidos-<name>` class names, so appearance can be changed without touching library source. See the
  Theming section of the README.
- **Fork it.** The licence is MIT, so diverging is entirely permitted if you need to.
