import 'calypso/state/themes/init';
import { AppState } from 'calypso/types';

/**
 */
export function shouldShowAtomicTransferDialog( state: AppState, themeId: string ) {
	return (
		state.themes.themeHasAtomicTransferDialog?.themeId === themeId &&
		state.themes.themeHasAtomicTransferDialog?.show
	);
}
