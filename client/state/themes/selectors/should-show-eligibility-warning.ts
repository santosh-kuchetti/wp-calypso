import 'calypso/state/themes/init';
import { AppState } from 'calypso/types';

/**
 */
export function shouldShowEligibilityWarning( state: AppState, themeId: string ) {
	return (
		state.themes.themeHasEligibilityWarning?.themeId === themeId &&
		state.themes.themeHasEligibilityWarning?.show
	);
}
