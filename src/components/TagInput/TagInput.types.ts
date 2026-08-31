export interface TagInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
  error?: string;
  hint?: string;
  allowDuplicates?: boolean;
  maxTags?: number;
  separators?: string[];
  validate?: (tag: string) => boolean | string;
  className?: string;
  fullWidth?: boolean;
  /**
   * Autocomplete source. When provided, a dropdown of matching entries is
   * shown below the field as the user types - useful for tag pickers backed
   * by history or a known taxonomy. Free-text entry via `separators` still
   * works alongside suggestions. Already-added tags are filtered out
   * automatically (unless `allowDuplicates` is set).
   */
  suggestions?: string[];
  /** Called with the current input text on every keystroke - use this to fetch/filter `suggestions` asynchronously. */
  onSearch?: (query: string) => void;
  /** Message shown when `suggestions` is provided but nothing matches the current input. */
  suggestionsEmptyText?: string;
}
