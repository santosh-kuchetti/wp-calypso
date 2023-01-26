import 'calypso/state/themes/init';
import { AppState } from 'calypso/types';

/**
 */
export function getThemeForEligibilityWarning( state: AppState ) {
	return state.themes.themeHasEligibilityWarning?.themeId;
}
