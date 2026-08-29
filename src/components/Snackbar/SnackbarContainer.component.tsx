import React from 'react';
import { createPortal } from 'react-dom';
import { useSnackbarContext } from './Snackbar.context';
import { SnackbarComponent } from './Snackbar.component';

export const SnackbarContainer: React.FC = () => {
	const { snackbars, removeSnackbar } = useSnackbarContext();

	if (snackbars.length === 0) {
		return null;
	}

	return createPortal(
		<div className={'eidos-snackbar-container'}>
			{snackbars.map((snackbar, index) => (
				<div
					key={snackbar.id}
					className={'eidos-snackbar-wrapper'}
					style={{
						top: `${index * 70}px`,
						// Stack newer snackbars above older ones, relative to the
						// container's own layer rather than a hardcoded ceiling.
						zIndex: `calc(var(--z-index-snackbar) - ${index})`,
					}}
				>
					<SnackbarComponent snackbar={snackbar} onClose={removeSnackbar} />
				</div>
			))}
		</div>,
		document.body
	);
};

SnackbarContainer.displayName = 'SnackbarContainer';
