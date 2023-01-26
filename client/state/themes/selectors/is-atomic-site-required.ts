import { isExternallyManagedTheme } from './is-externally-managed-theme';
import 'calypso/state/themes/init';

/**
 */
export function isAtomicSiteRequired( state = {}, themeId: string ): boolean {
	return isExternallyManagedTheme( state, themeId );
}
