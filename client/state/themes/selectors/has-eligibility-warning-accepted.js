import 'calypso/state/themes/init';

/**
 */
export function hasEligibilityWarningAccepted( state, themeId ) {
	return (
		state.themes.themeHasEligibilityWarning?.themeId === themeId &&
		state.themes.themeHasEligibilityWarning?.accepted
	);
}
