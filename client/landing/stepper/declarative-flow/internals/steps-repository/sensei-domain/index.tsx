/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE, PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { SenseiStepContainer } from '../components/sensei-step-container';
import type { Step } from '../../types';

import './style.scss';

const SenseiDomain: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const [ siteTitle, domain, productsList ] = useSelect( ( select ) => {
		return [
			select( ONBOARD_STORE ).getSelectedSiteTitle(),
			select( ONBOARD_STORE ).getSelectedDomain(),
			select( PRODUCTS_LIST_STORE ).getProductsList(),
		];
	} );
	const { setDomain } = useDispatch( ONBOARD_STORE );

	const onSkip = () => {
		setDomain( domain );
		submit?.( { domain: domain } );
	};

	const onAddDomain = ( selectedDomain: typeof domain ) => {
		setDomain( selectedDomain );
		submit?.( { domain: selectedDomain } );
	};

	const domainSuggestion = domain?.domain_name ?? siteTitle;

	return (
		<SenseiStepContainer stepName="senseiDomain" recordTracksEvent={ recordTracksEvent }>
			<CalypsoShoppingCartProvider>
				<FormattedHeader
					id="choose-a-domain-header"
					headerText="Choose a domain"
					subHeaderText={
						<>
							{ __( 'Make your course site shine with a custom domain. Not sure yet ?' ) }
							<button
								className="button navigation-link step-container__navigation-link has-underline is-borderless"
								onClick={ onSkip }
							>
								{ __( 'Decide later.' ) }
							</button>
						</>
					}
					align="center"
				/>
				<div className="container domains__step-content domains__step-content-domain-step">
					<RegisterDomainStep
						vendor="sensei"
						key="domainForm"
						suggestion={ domainSuggestion }
						domainsWithPlansOnly={ true }
						isSignupStep={ true }
						includeWordPressDotCom
						onAddDomain={ onAddDomain }
						onSkip={ onSkip }
						products={ productsList }
						useProvidedProductsList
						align="left"
						isWideLayout={ true }
						basePath=""
					/>
					<div className="domains__domain-side-content-container">
						<div className="domains__domain-side-content domains__free-domain">
							<ReskinSideExplainer onClick={ onSkip } type="free-domain-explainer" />
						</div>
						<div className="domains__domain-side-content">
							<ReskinSideExplainer onClick={ onSkip } type="use-your-domain" />
						</div>
					</div>
				</div>
			</CalypsoShoppingCartProvider>
		</SenseiStepContainer>
	);
};

export default SenseiDomain;
