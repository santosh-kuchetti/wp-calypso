import 'calypso/state/themes/init';
import { AppState } from 'calypso/types';

/**
 */
export function getThemeForAtomicTransferDialog( state: AppState ) {
	return state.themes.themeHasAtomicTransferDialog?.themeId;
}
