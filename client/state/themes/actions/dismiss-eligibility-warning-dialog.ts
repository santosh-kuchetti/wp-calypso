import { THEME_DISMISS_ELIGIBILITY_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function dismissEligibilityWarningDialog() {
	return {
		type: THEME_DISMISS_ELIGIBILITY_WARNING,
	};
}
