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
}
