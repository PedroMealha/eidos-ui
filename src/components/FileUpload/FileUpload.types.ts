export interface FileUploadProps {
  /** Accepted file types, passed directly to the input's `accept` attribute (e.g. 'image/*', '.pdf,.docx'). */
  accept?: string;
  /** Allow selecting multiple files. Default: false. */
  multiple?: boolean;
  /** Max file size in bytes. Files exceeding this are rejected with an error. */
  maxSize?: number;
  /** Max number of files when multiple=true. */
  maxFiles?: number;
  /** Called when valid files are accepted. */
  onFilesAccepted?: (files: File[]) => void;
  /** Called when files are rejected (size/type/count exceeded). */
  onFilesRejected?: (files: File[], reason: 'size' | 'type' | 'count') => void;
  /** Hint text shown inside the drop zone. Defaults to a generic "drag & drop or click" message. */
  hint?: string;
  disabled?: boolean;
  className?: string;
}
