/**
 * `import 'eidos-ui/lucide-icons'` - registers every Lucide icon, so any
 * icon prop resolves any Lucide name as a string (`icon="arrow-right"`).
 *
 * Opt-in on purpose: it puts the whole icon set (~1,800 icons) in the
 * importing bundle. Prefer passing components, or `registerIcons` with only
 * the icons you use.
 *
 * Listed in `package.json` `sideEffects`. It exports nothing, so a bundler
 * that believed the package side-effect free would drop the import entirely -
 * and every string icon would then quietly fall through to the CSS-class
 * branch of `renderIcon` and render an empty `<i>`.
 */
import { icons } from 'lucide-react';
import { registerIcons } from '../utils/iconRegistry';

registerIcons(icons);
