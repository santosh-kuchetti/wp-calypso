import 'calypso/state/themes/init';

/**
 */
export function hasAtomicTransferDialogAccepted( state, themeId ) {
	return (
		state.themes.themeHasAtomicTransferDialog?.themeId === themeId &&
		state.themes.themeHasAtomicTransferDialog?.accepted
	);
}
