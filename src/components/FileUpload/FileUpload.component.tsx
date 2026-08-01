import React, { useState, useRef } from 'react';
import { Upload, X, CircleAlert, FileText } from 'lucide-react';
import type { FileUploadProps } from './FileUpload.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isFileTypeAccepted(file: File, acceptedTypes: string[]): boolean {
	return acceptedTypes.some((type) => {
		const trimmed = type.trim();
		// Extension match: ".pdf", ".docx"
		if (trimmed.startsWith('.')) {
			return file.name.toLowerCase().endsWith(trimmed.toLowerCase());
		}
		// Wildcard MIME group: "image/*", "video/*"
		if (trimmed.endsWith('/*')) {
			const baseType = trimmed.slice(0, -2);
			return file.type.startsWith(`${baseType}/`);
		}
		// Exact MIME type: "application/pdf"
		return file.type === trimmed;
	});
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FileUpload({
	accept,
	multiple = false,
	maxSize,
	maxFiles,
	onFilesAccepted,
	onFilesRejected,
	hint,
	disabled = false,
	className = '',
}: FileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);

	// ── Validation ─────────────────────────────────────────────────────────────

	const validateAndAccept = (fileList: FileList | File[]) => {
		const incoming = Array.from(fileList);

		if (maxFiles !== undefined && incoming.length > maxFiles) {
			setError(`Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`);
			onFilesRejected?.(incoming, 'count');
			return;
		}

		if (accept) {
			const acceptedTypes = accept.split(',').map((t) => t.trim());
			const invalid = incoming.filter((f) => !isFileTypeAccepted(f, acceptedTypes));
			if (invalid.length > 0) {
				setError('One or more files have an unsupported type');
				onFilesRejected?.(incoming, 'type');
				return;
			}
		}

		if (maxSize !== undefined) {
			const oversized = incoming.filter((f) => f.size > maxSize);
			if (oversized.length > 0) {
				setError(`File size exceeds the ${formatBytes(maxSize)} limit`);
				onFilesRejected?.(oversized, 'size');
				return;
			}
		}

		setError(null);
		setFiles(incoming);
		onFilesAccepted?.(incoming);
	};

	// ── Drag handlers ──────────────────────────────────────────────────────────

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!disabled) setIsDragging(true);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		// Prevent default to allow the drop event to fire
		e.preventDefault();
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		// Only clear the dragging state when leaving the zone entirely,
		// not when moving over a child element inside it.
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setIsDragging(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		if (disabled) return;
		const { files: dropped } = e.dataTransfer;
		if (dropped.length > 0) validateAndAccept(dropped);
	};

	// ── Click / keyboard ───────────────────────────────────────────────────────

	const handleZoneClick = () => {
		if (!disabled) inputRef.current?.click();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleZoneClick();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			validateAndAccept(e.target.files);
		}
		// Reset the input value so the same file(s) can be re-selected
		e.target.value = '';
	};

	// ── File list management ───────────────────────────────────────────────────

	const handleRemoveFile = (index: number) => {
		const remaining = files.filter((_, i) => i !== index);
		setFiles(remaining);
		onFilesAccepted?.(remaining);
	};

	// ── CSS classes ────────────────────────────────────────────────────────────

	const rootClasses = ['eidos-file-upload', className].filter(Boolean).join(' ');

	const zoneClasses = [
		'eidos-file-upload-zone',
		isDragging && 'eidos-file-upload-zone--dragging',
		disabled && 'eidos-file-upload-zone--disabled',
	]
		.filter(Boolean)
		.join(' ');

	// Build the auto-generated hint from the constraints when no hint is provided
	const autoHint = [
		accept ? `Accepted: ${accept}` : null,
		maxSize ? `Max size: ${formatBytes(maxSize)}` : null,
		maxFiles && multiple ? `Up to ${maxFiles} files` : null,
	]
		.filter(Boolean)
		.join(' · ');

	const displayHint = hint ?? (autoHint.length > 0 ? autoHint : null);

	return (
		<div
			className={rootClasses}
			role="region"
			aria-label="File upload"
			aria-disabled={disabled || undefined}
		>
			<div
				className={zoneClasses}
				onClick={handleZoneClick}
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onKeyDown={handleKeyDown}
				role="button"
				tabIndex={disabled ? -1 : 0}
				aria-label="Upload files — click or drag and drop"
				aria-disabled={disabled || undefined}
			>
				<div className="eidos-file-upload-icon" aria-hidden="true">
					<Upload />
				</div>

				<div className="eidos-file-upload-text">
					<p className="eidos-file-upload-title">
						<em>Click to upload</em> or drag and drop
					</p>
					{displayHint && (
						<p className="eidos-file-upload-hint">{displayHint}</p>
					)}
				</div>

				{/* Hidden native input — triggered programmatically via click() */}
				<input
					ref={inputRef}
					type="file"
					accept={accept}
					multiple={multiple}
					disabled={disabled}
					onChange={handleFileChange}
					className="eidos-file-upload-input-hidden"
					tabIndex={-1}
					aria-hidden="true"
				/>
			</div>

			{error && (
				<p className="eidos-file-upload-error" role="alert">
					<CircleAlert aria-hidden="true" />
					{error}
				</p>
			)}

			{files.length > 0 && (
				<ul className="eidos-file-upload-list" aria-label="Selected files">
					{files.map((file, index) => (
						<li key={`${file.name}-${index}`} className="eidos-file-upload-item">
							<div className="eidos-file-upload-item-info">
								<FileText aria-hidden="true" />
								<span className="eidos-file-upload-item-name">{file.name}</span>
								<span className="eidos-file-upload-item-size">{formatBytes(file.size)}</span>
							</div>
							<button
								type="button"
								className="eidos-file-upload-item-remove"
								onClick={() => handleRemoveFile(index)}
								aria-label={`Remove ${file.name}`}
							>
								<X />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

FileUpload.displayName = 'FileUpload';
