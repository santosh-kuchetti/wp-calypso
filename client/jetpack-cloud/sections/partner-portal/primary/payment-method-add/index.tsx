import {
	ReloadSetupIntentId,
	StripeHookProvider,
	StripeSetupIntentIdProvider,
	useStripe,
	useStripeSetupIntentId,
} from '@automattic/calypso-stripe';
import { Card, Button } from '@automattic/components';
import { CheckoutProvider, CheckoutSubmitButton } from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { CardElement, useElements } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AssignLicenseStepProgress from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-step-progress';
import CreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-loading';
import PaymentMethodImage from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/payment-method-image';
import {
	useReturnUrl,
	useIssueMultipleLicenses,
} from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { assignNewCardProcessor } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/assignment-processor-functions';
import { getStripeConfiguration } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/get-stripe-configuration';
import { useCreateStoredCreditCardMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/hooks/use-create-stored-credit-card';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { fetchStoredCards } from 'calypso/state/partner-portal/stored-cards/actions';
import getSites from 'calypso/state/selectors/get-sites';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

function PaymentMethodAdd( { selectedSite }: { selectedSite?: SiteDetails | null } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();
	const {
		reload: reloadSetupIntentId,
		setupIntentId: stripeSetupIntentId,
		error: setupIntentError,
	} = useStripeSetupIntentId();
	const stripeMethod = useCreateStoredCreditCardMethod( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );
	const paymentMethods = useMemo(
		() => [ stripeMethod ].filter( isValueTruthy ),
		[ stripeMethod ]
	);
	const useAsPrimaryPaymentMethod = useSelect( ( select ) =>
		select( 'credit-card' ).useAsPrimaryPaymentMethod()
	);

	const sites = useSelector( getSites );

	const returnQueryArg = useMemo(
		() => ( getQueryArg( window.location.href, 'return' ) || '' ).toString(),
		[ window.location.href, getQueryArg ]
	);

	const products = useMemo(
		() => ( getQueryArg( window.location.href, 'products' ) || '' ).toString(),
		[]
	);

	const siteId = useMemo(
		() => ( getQueryArg( window.location.href, 'site_id' ) || '' ).toString(),
		[]
	);

	const source = useMemo(
		() => ( getQueryArg( window.location.href, 'source' ) || '' ).toString(),
		[]
	);

	const [ issueMultipleLicense, isIssuingMultipleLicenses ] = useIssueMultipleLicenses(
		products ? products.split( ',' ) : [],
		siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null
	);

	useReturnUrl( ! paymentMethodRequired );

	const onGoToPaymentMethods = () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_partner_portal_payment_method_card_go_back_click' )
		);
	};

	const handleChangeError = useCallback(
		( { transactionError }: { transactionError: string | null } ) => {
			reduxDispatch(
				errorNotice(
					transactionError ||
						translate( 'There was a problem assigning that payment method. Please try again.' ),
					{ id: 'payment-method-failure' }
				)
			);
			// We need to regenerate the setup intent if the form was submitted.
			reloadSetupIntentId();
		},
		[ reduxDispatch, translate, reloadSetupIntentId ]
	);

	const showSuccessMessage = useCallback(
		( message ) => {
			reduxDispatch(
				successNotice( message, { isPersistent: true, displayOnNextPage: true, duration: 5000 } )
			);
		},
		[ reduxDispatch ]
	);

	const successCallback = useCallback( () => {
		// returnQueryArg - will make sure the license issuing flow will be resumed
		// when the user already has a license issued but not assigned, and will
		// assign the license after adding a payment method.
		//
		// product - will make sure there will be a license issuing for that product
		if ( returnQueryArg || products ) {
			reduxDispatch(
				fetchStoredCards( {
					startingAfter: '',
					endingBefore: '',
				} )
			);
		} else {
			page( partnerPortalBasePath( '/payment-methods' ) );
		}
	}, [ returnQueryArg, products, reduxDispatch ] );

	useEffect( () => {
		if ( ! paymentMethodRequired && products ) {
			issueMultipleLicense();
		}
		// Do not update the dependency array with issueMultipleLicense since
		// it gets changed on every product change, which triggers this `useEffect` to run infinitely.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ paymentMethodRequired ] );

	useEffect( () => {
		if ( stripeLoadingError ) {
			reduxDispatch( errorNotice( stripeLoadingError.message ) );
		}
	}, [ stripeLoadingError, reduxDispatch ] );

	useEffect( () => {
		if ( setupIntentError ) {
			reduxDispatch( errorNotice( setupIntentError.message ) );
		}
	}, [ setupIntentError, reduxDispatch ] );

	const elements = useElements();

	const getPreviousPageLink = () => {
		if ( products ) {
			return addQueryArgs(
				{
					products,
					...( siteId && { site_id: siteId } ),
					...( source && { source } ),
				},
				partnerPortalBasePath( '/issue-license' )
			);
		}
		return partnerPortalBasePath( '/payment-methods/' );
	};

	return (
		<Main wideLayout className="payment-method-add">
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<SidebarNavigation />

			{ ( !! returnQueryArg || products ) && (
				<AssignLicenseStepProgress currentStep="addPaymentMethod" selectedSite={ selectedSite } />
			) }

			<div className="payment-method-add__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Methods' ) }</CardHeading>
			</div>

			<CheckoutProvider
				onPaymentComplete={ () => {
					onPaymentSelectComplete( {
						successCallback,
						translate,
						showSuccessMessage,
						reloadSetupIntentId,
					} );
				} }
				onPaymentError={ handleChangeError }
				paymentMethods={ paymentMethods }
				paymentProcessors={ {
					card: ( data: unknown ) => {
						reduxDispatch( removeNotice( 'payment-method-failure' ) );
						return assignNewCardProcessor(
							{
								useAsPrimaryPaymentMethod,
								translate,
								stripe,
								stripeConfiguration,
								stripeSetupIntentId,
								cardElement: elements?.getElement( CardElement ) ?? undefined,
								reduxDispatch,
							},
							data
						);
					},
				} }
				initiallySelectedPaymentMethodId="card"
				isLoading={ isStripeLoading }
			>
				<Card className="payment-method-add__wrapper">
					<CardHeading>{ translate( 'Credit card details' ) }</CardHeading>

					<div className="payment-method-add__content">
						<div className="payment-method-add__form">
							{ 0 === paymentMethods.length && <CreditCardLoading /> }

							{ paymentMethods && paymentMethods[ 0 ] && paymentMethods[ 0 ].activeContent }

							{ useAsPrimaryPaymentMethod && (
								<p className="payment-method-add__notice">
									<small>
										{ translate(
											'By storing your primary payment method you agree to have it charged automatically each month.'
										) }
									</small>
								</p>
							) }

							<div className="payment-method-add__navigation-buttons">
								<Button
									className="payment-method-add__back-button"
									href={ getPreviousPageLink() }
									disabled={ isStripeLoading || isIssuingMultipleLicenses }
									onClick={ onGoToPaymentMethods }
								>
									{ translate( 'Go back' ) }
								</Button>

								<CheckoutSubmitButton className="payment-method-add__submit-button" />
							</div>
						</div>
						<div className="payment-method-add__image">
							<PaymentMethodImage />
						</div>
					</div>
				</Card>
			</CheckoutProvider>
		</Main>
	);
}

export default function PaymentMethodAddWrapper( {
	selectedSite,
}: {
	selectedSite?: SiteDetails | null;
} ) {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<StripeSetupIntentIdProvider fetchStipeSetupIntentId={ getStripeConfiguration }>
				<PaymentMethodAdd selectedSite={ selectedSite } />
			</StripeSetupIntentIdProvider>
		</StripeHookProvider>
	);
}

function onPaymentSelectComplete( {
	successCallback,
	translate,
	showSuccessMessage,
	reloadSetupIntentId,
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
	reloadSetupIntentId: ReloadSetupIntentId;
} ) {
	showSuccessMessage( translate( 'Your payment method has been added successfully.' ) );
	// We need to regenerate the setup intent if the form was submitted.
	reloadSetupIntentId();
	successCallback();
}
