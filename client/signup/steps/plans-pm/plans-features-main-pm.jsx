import {
	chooseDefaultCustomerType,
	findPlansKeys,
	getPlan,
	getPopularPlanSpec,
	isFreePlan,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TERM_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	PLAN_PERSONAL,
	GROUP_WPCOM,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import { getTld } from 'calypso/lib/domains';
import PlanFeatures from 'calypso/my-sites/plan-features';
import PlanFeaturesComparison from 'calypso/my-sites/plan-features-comparison';
import PlanTypeSelector from 'calypso/my-sites/plans-features-main/plan-type-selector';
import PlanFAQ from 'calypso/my-sites/plans-features-main/plansStepFaq';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import {
	getSitePlan,
	getSiteSlug,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';

import 'calypso/my-sites/plans-features-main/style.scss';

export class PlansFeaturesMainPM extends Component {
	showPricingGrid() {
		const {
			basePlansPath,
			customerType,
			discountEndDate,
			domainName,
			flowName,
			isInSignup,
			isJetpack,
			isLandingPage,
			isLaunchPage,
			onUpgradeClick,
			plansWithScroll,
			redirectTo,
			selectedFeature,
			selectedPlan,
			shouldShowPlansFeatureComparison,
			siteId,
			withDiscount,
		} = this.props;

		const plans = this.getPlans();

		if ( shouldShowPlansFeatureComparison ) {
			return (
				<div
					className={ classNames(
						'plans-features-main__group',
						'is-wpcom',
						`is-customer-${ customerType }`,
						{
							'is-scrollable': plansWithScroll,
						}
					) }
					data-e2e-plans="wpcom"
				>
					<PlanFeaturesComparison
						basePlansPath={ basePlansPath }
						discountEndDate={ discountEndDate }
						domainName={ domainName }
						flowName={ flowName }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
						isReskinned={ true }
						onUpgradeClick={ onUpgradeClick }
						plans={ plans }
						popularPlanSpec={ getPopularPlanSpec( {
							flowName,
							customerType,
							isJetpack,
							availablePlans: plans,
						} ) }
						redirectTo={ redirectTo }
						selectedFeature={ selectedFeature }
						selectedPlan={ selectedPlan }
						siteId={ siteId }
						withDiscount={ withDiscount }
						visiblePlans={ plans }
						withScroll={ plansWithScroll }
					/>
				</div>
			);
		}
		return (
			<div
				className={ classNames(
					'plans-features-main__group',
					'is-wpcom',
					`is-customer-${ customerType }`,
					{
						'is-scrollable': plansWithScroll,
					}
				) }
				data-e2e-plans="wpcom"
			>
				{ this.renderSecondaryFormattedHeader() }
				<PlanFeatures
					redirectToAddDomainFlow={ false }
					domainAndPlanPackage={ false }
					basePlansPath={ basePlansPath }
					disableBloggerPlanWithNonBlogDomain={ false }
					domainName={ domainName }
					nonDotBlogDomains={ this.filterDotBlogDomains() }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					onUpgradeClick={ onUpgradeClick }
					plans={ plans }
					redirectTo={ redirectTo }
					visiblePlans={ plans }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					discountEndDate={ discountEndDate }
					withScroll={ plansWithScroll }
					popularPlanSpec={ getPopularPlanSpec( {
						flowName,
						customerType,
						isJetpack,
						availablePlans: plans,
					} ) }
					flowName={ flowName }
					siteId={ siteId }
					isInVerticalScrollingPlansExperiment={ true }
					kindOfPlanTypeSelector={ this.props.planTypeSelector }
					isPlansInsideStepper={ false }
				/>
			</div>
		);
	}
	renderSecondaryFormattedHeader() {
		let headerText;
		let subHeaderText;

		if ( ! headerText ) {
			return null;
		}

		return (
			<FormattedHeader
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				compactOnMobile
				isSecondary
			/>
		);
	}
	filterDotBlogDomains() {
		const domains = this.props?.domains || [];
		return domains.filter( function ( domainInfo ) {
			if ( domainInfo.type === 'WPCOM' ) {
				return false;
			}

			const domainName = domainInfo?.domain || '';
			return ! 'blog'.startsWith( getTld( domainName ) );
		} );
	}
	getPlanBillingPeriod( intervalType, defaultValue = null ) {
		const plans = {
			monthly: TERM_MONTHLY,
			yearly: TERM_ANNUALLY,
			'2yearly': TERM_BIENNIALLY,
			'3yearly': TERM_TRIENNIALLY,
		};

		return plans[ intervalType ] || defaultValue || TERM_ANNUALLY;
	}

	getPlans() {
		const { intervalType, selectedPlan, hideFreePlan } = this.props;

		const term = this.getPlanBillingPeriod( intervalType, getPlan( selectedPlan )?.term );
		let plans = [
			findPlansKeys( { group: GROUP_WPCOM, type: TYPE_FREE } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PERSONAL } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PREMIUM } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_BUSINESS } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_ECOMMERCE } )[ 0 ],
		].filter( ( el ) => el );

		if ( hideFreePlan ) {
			plans = plans.filter( ( planSlug ) => ! isFreePlan( planSlug ) );
		}
		return plans;
	}

	getPlanTypeSelector() {
		const { planTypeSelectorProps, shouldHideMonthlyToggle } = this.props;
		const plans = this.getPlans();
		if ( shouldHideMonthlyToggle === false ) {
			return <PlanTypeSelector { ...planTypeSelectorProps } kind="interval" plans={ plans } />;
		}
	}

	render() {
		const { siteId } = this.props;

		return (
			<div className={ classNames( 'plans-features-main' ) }>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<div className="plans-features-main__notice" />
				{ this.getPlanTypeSelector() }
				{ this.showPricingGrid() }
				<PlanFAQ />
			</div>
		);
	}
}

PlansFeaturesMainPM.propTypes = {
	basePlansPath: PropTypes.string,
	customerType: PropTypes.string,
	domainAndPlanPackage: PropTypes.string,
	flowName: PropTypes.string,
	hideFreePlan: PropTypes.bool,
	hidePersonalPlan: PropTypes.bool,
	hidePremiumPlan: PropTypes.bool,
	intervalType: PropTypes.oneOf( [ 'monthly', 'yearly' ] ),
	isChatAvailable: PropTypes.bool,
	isAllPaidPlansShown: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	isReskinned: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	plansWithScroll: PropTypes.bool,
	planTypes: PropTypes.array,
	planTypeSelector: PropTypes.string,
	isPlansInsideStepper: PropTypes.bool,
	redirectTo: PropTypes.string,
	redirectToAddDomainFlow: PropTypes.bool,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	shouldHideMonthlyToggle: PropTypes.bool,
	shouldShowPlansFeatureComparison: PropTypes.bool,
	showFAQ: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
};

PlansFeaturesMainPM.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	hidePersonalPlan: false,
	hidePremiumPlan: false,
	intervalType: 'yearly',
	isChatAvailable: false,
	isPlansInsideStepper: false,
	isReskinned: false,
	plansWithScroll: false,
	planTypeSelector: 'interval',
	showFAQ: true,
	shouldHideMonthlyToggle: false,
	shouldShowPlansFeatureComparison: true,
	siteId: null,
	siteSlug: '',
};

export default connect( ( state, props ) => {
	const shouldHideMonthlyToggle = props.shouldHideMonthlyToggle;
	const shouldShowPlansFeatureComparison = props.shouldShowPlansFeatureComparison;
	const siteId = props.site?.ID;
	const sitePlan = getSitePlan( state, siteId );
	const sitePlanSlug = sitePlan?.product_slug;
	const siteSlug = getSiteSlug( state, siteId );
	const eligibleForWpcomMonthlyPlans = isEligibleForWpComMonthlyPlan( state, siteId );

	let customerType = chooseDefaultCustomerType( {
		currentCustomerType: props.customerType,
		selectedPlan: props.selectedPlan,
		sitePlan,
	} );
	// Make sure the plans for the default customer type can be purchased.
	if (
		! props.customerType &&
		customerType === 'personal' &&
		! canUpgradeToPlan( state, siteId, PLAN_PERSONAL )
	) {
		customerType = 'business';
	}

	const planTypeSelectorProps = {
		basePlansPath: props.basePlansPath,
		customerType: customerType,
		eligibleForWpcomMonthlyPlans: eligibleForWpcomMonthlyPlans,
		hidePersonalPlan: props.hidePersonalPlan,
		isInSignup: props.isInSignup,
		isPlansInsideStepper: props.isPlansInsideStepper,
		intervalType: props.intervalType,
		siteSlug,
	};

	return {
		isJetpack: isJetpackSite( state, siteId ),
		isMultisite: isJetpackSiteMultiSite( state, siteId ),
		planTypeSelectorProps,
		shouldHideMonthlyToggle,
		shouldShowPlansFeatureComparison,
		siteId,
		siteSlug,
		sitePlanSlug,
	};
} )( localize( PlansFeaturesMainPM ) );
