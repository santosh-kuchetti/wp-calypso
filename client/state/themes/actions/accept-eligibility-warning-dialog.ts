import { THEME_ACCEPT_ELIGIBILITY_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function acceptEligibilityWarningDialog( themeId: string ) {
	return {
		type: THEME_ACCEPT_ELIGIBILITY_WARNING,
		themeId,
	};
}
