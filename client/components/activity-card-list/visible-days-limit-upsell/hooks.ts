import { RefObject, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useInView } from 'calypso/lib/use-in-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

export const useTrackUpsellView = (
	siteId: number | null
): RefObject< HTMLAnchorElement | HTMLButtonElement > => {
	const dispatch = useDispatch();

	return useInView< HTMLAnchorElement | HTMLButtonElement >( () => {
		dispatch(
			recordTracksEvent( 'calypso_activitylog_visiblelimit_upsell_view', {
				site_id: siteId ?? undefined,
			} )
		);
	} );
};

export const useTrackUpgradeClick = ( siteId: number | null ): ( () => void ) => {
	const dispatch = useDispatch();

	return useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_activitylog_visiblelimit_upsell_click', {
				site_id: siteId ?? undefined,
			} )
		);
	}, [ dispatch, siteId ] );
};
