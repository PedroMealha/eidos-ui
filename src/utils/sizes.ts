/**
 * Shared size scale used across every sized component in the library
 * (Button, Input, form controls, badges, ...). Unlike color, this is a
 * structural design token tied to shared CSS custom properties
 * (`--component-size-sm`, `--component-size-md`, `--component-size-lg`),
 * not a per-component semantic choice - so it's intentionally a single
 * shared type rather than one independent type per component.
 */
export type ComponentSizeProps = 'sm' | 'md' | 'lg';
