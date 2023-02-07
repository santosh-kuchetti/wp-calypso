import { WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
	getUserPurchases,
} from 'calypso/state/purchases/selectors';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SiteCopyOptions {
	disabled: boolean;
}

function useSafeSiteHasFeature( siteId: number | undefined, feature: string, disabled = false ) {
	const dispatch = useReduxDispatch();
	useEffect( () => {
		if ( ! siteId || disabled ) {
			return;
		}
		dispatch( fetchSiteFeatures( siteId ) );
	}, [ dispatch, siteId, disabled ] );

	return useSelector( ( state ) => {
		if ( ! siteId ) {
			return false;
		}
		return siteHasFeature( state, siteId, feature );
	} );
}

export const useSiteCopy = (
	site: Pick< SiteExcerptData, 'ID' | 'site_owner' | 'plan' > | undefined,
	options: SiteCopyOptions = { disabled: false }
) => {
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasCopySiteFeature = useSafeSiteHasFeature(
		site?.ID,
		WPCOM_FEATURES_COPY_SITE,
		options.disabled
	);
	const { isRequesting: isRequestingSiteFeatures } = useSelector( ( state ) => {
		const siteFeatures = getSiteFeatures( state, site?.ID );
		return siteFeatures ? siteFeatures : { isRequesting: true };
	} );
	const isAtomic = useSelect(
		( select ) => site && ! options.disabled && select( SITE_STORE ).isSiteAtomic( site?.ID )
	);
	const plan = site?.plan;
	const isSiteOwner = site?.site_owner === userId;

	useQueryUserPurchases( options.disabled );
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingUserPurchases( state ) || ! hasLoadedUserPurchasesFromServer( state )
	);

	const purchases = useSelector( ( state ) => getUserPurchases( state ) );

	const { setPlanCartItem, setProductCartItems } = useDispatch( ONBOARD_STORE );

	const shouldShowSiteCopyItem = useMemo( () => {
		return hasCopySiteFeature && isSiteOwner && plan && isAtomic && ! isLoadingPurchases;
	}, [ hasCopySiteFeature, isSiteOwner, plan, isLoadingPurchases, isAtomic ] );

	const startSiteCopy = useCallback( () => {
		if ( ! shouldShowSiteCopyItem ) {
			return;
		}
		clearSignupDestinationCookie();
		setPlanCartItem( { product_slug: plan?.product_slug as string } );

		const marketplacePluginProducts = ( purchases || [] )
			.filter(
				( purchase ) =>
					purchase.productType === 'marketplace_plugin' && purchase.siteId === site?.ID
			)
			.map( ( purchase ) => ( { product_slug: purchase.productSlug } ) );

		setProductCartItems( marketplacePluginProducts );
	}, [ plan, setPlanCartItem, purchases, shouldShowSiteCopyItem, setProductCartItems, site?.ID ] );

	return useMemo(
		() => ( {
			shouldShowSiteCopyItem,
			startSiteCopy,
			isFetching: isLoadingPurchases || isRequestingSiteFeatures,
		} ),
		[ isLoadingPurchases, isRequestingSiteFeatures, shouldShowSiteCopyItem, startSiteCopy ]
	);
};

export const withSiteCopy = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { shouldShowSiteCopyItem, startSiteCopy } = useSiteCopy( props.site );
		return (
			<Wrapped
				{ ...props }
				shouldShowSiteCopyItem={ shouldShowSiteCopyItem }
				startSiteCopy={ startSiteCopy }
			/>
		);
	},
	'withSiteCopy'
);
