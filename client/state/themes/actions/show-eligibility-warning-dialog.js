import { THEME_SHOW_ELIGIBILITY_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function showEligibilityWarningDialog( themeId ) {
	return {
		type: THEME_SHOW_ELIGIBILITY_WARNING,
		themeId,
	};
}
