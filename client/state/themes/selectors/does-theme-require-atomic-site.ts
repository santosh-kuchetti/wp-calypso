import { isExternallyManagedTheme } from './is-externally-managed-theme';
import 'calypso/state/themes/init';

/**
 */
export function doesThemeRequireAtomicSite( state = {}, themeId: string ): boolean {
	return isExternallyManagedTheme( state, themeId );
}
