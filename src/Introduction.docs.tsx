import { Source } from '@storybook/addon-docs/blocks';
import { GuideCallout, GuideCode } from './guide-page.docs';

/**
 * The two provider set-up blocks for step 3 of `Introduction.mdx`.
 *
 * These live here rather than inline in the `.mdx` because everything about
 * them was being corrupted by formatting, repeatedly and in two different
 * ways:
 *
 * - **Prettier expands a long `<span>` across lines**, MDX then parses its
 *   child as markdown flow content and wraps it in a `<p>`, and Storybook's
 *   `.sbdocs p` rule takes over - which turned the 16px "REQUIRED" badge into
 *   a 60px block. Writing the span on one line fixes it exactly until the
 *   next format-on-save.
 * - **Multi-line code samples lose their indentation.** Written as an array
 *   of strings joined with `\n` (itself a workaround for template literals
 *   being mangled), the leading spaces inside those string literals were
 *   still collapsed - `'  return ('` came back as `' return ('`.
 *
 * Neither happens in a `.tsx` file: prettier formats it as TypeScript, JSX
 * children are never re-parsed as markdown, and string contents are left
 * alone. The `.mdx` keeps prose and section structure; anything with
 * significant whitespace or nested JSX belongs here.
 */

const SNACKBAR_SETUP = `import { SnackbarProvider, SnackbarContainer } from 'eidos-ui';

function Root() {
  return (
    <SnackbarProvider>
      <App />
      <SnackbarContainer />
    </SnackbarProvider>
  );
}`;

const SNACKBAR_USAGE = `import { useSnackbar } from 'eidos-ui';

function SaveButton() {
  const { showSuccess, showError } = useSnackbar();

  const onSave = async () => {
    try {
      await save();
      showSuccess('Saved!');
    } catch {
      showError('Failed to save');
    }
  };

  return <button onClick={onSave}>Save</button>;
}`;

const DROPDOWN_SETUP = `import { DropdownProvider, Dropdown } from 'eidos-ui';

function Toolbar() {
  return (
    <DropdownProvider>
      <Dropdown dropdownGroup="toolbar" trigger={<button>File</button>} content={fileMenu} />
      <Dropdown dropdownGroup="toolbar" trigger={<button>Edit</button>} content={editMenu} />
    </DropdownProvider>
  );
}`;

export const SnackbarSetup = () => (
  <div>
    <GuideCallout title="Snackbar" badge="Required" tone="required">
      <GuideCode tinted>SnackbarProvider</GuideCode> supplies the context.{' '}
      <GuideCode tinted>SnackbarContainer</GuideCode> is the portal that renders toasts - add it
      once at root.
    </GuideCallout>

    <Source dark language="tsx" code={SNACKBAR_SETUP} />

    <div style={{ fontSize: 12, color: '#475569', margin: '14px 0 10px', lineHeight: 1.6 }}>
      Then use <GuideCode>useSnackbar</GuideCode> anywhere inside the tree:
    </div>

    <Source dark language="tsx" code={SNACKBAR_USAGE} />
  </div>
);

export const DropdownSetup = () => (
  <div style={{ marginTop: 21 }}>
    <GuideCallout title="Dropdown" badge="Optional" tone="optional">
      Works standalone by default. Add <GuideCode>DropdownProvider</GuideCode> only when using{' '}
      <GuideCode>dropdownGroup</GuideCode> - it ensures only one dropdown in a group is open at a
      time.
    </GuideCallout>

    <Source dark language="tsx" code={DROPDOWN_SETUP} />
  </div>
);

// ── Code samples for the reference notes ─────────────────────────────────────
//
// Here rather than in the `.mdx` for the indentation reason above: leading
// spaces inside a multi-line sample survive in a `.tsx` file and do not in an
// `.mdx` one.

export const ICONS_EXAMPLE = `import { Download, Plus, Search } from 'lucide-react';
import { Button } from 'eidos-ui';

<Button preIcon={Download}>Export</Button>`;

export const PEER_DEPS_EXAMPLE = `"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}`;

export const THEMING_EXAMPLE = `:root {
  /* Brand colour */
  --primary-color: #0ea5e9;
  --primary-dark:  #0284c7;
  --primary-light: #7dd3fc;

  /* Border radius */
  --border-radius-md: 6px;
  --border-radius-lg: 8px;

  /* Component heights */
  --component-size-sm: 28px;
  --component-size-md: 36px;
  --component-size-lg: 44px;
}`;

export const DEEP_IMPORTS_EXAMPLE = `// Root barrel - works with any bundler that tree-shakes
import { Button, Input } from 'eidos-ui';

// Deep import - explicit single-component chunk
import { Button } from 'eidos-ui/button';
import { DataGrid } from 'eidos-ui/data-grid';`;
