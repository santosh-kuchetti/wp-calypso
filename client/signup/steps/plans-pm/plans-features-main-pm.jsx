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
			domainName,
			isInSignup,
			isJetpack,
			isLandingPage,
			isLaunchPage,
			flowName,
			onUpgradeClick,
			selectedFeature,
			selectedPlan,
			withDiscount,
			discountEndDate,
			redirectTo,
			siteId,
			plansWithScroll,
		} = this.props;

		const plans = this.getPlans();

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
					domainName={ domainName }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					onUpgradeClick={ onUpgradeClick }
					plans={ plans }
					flowName={ flowName }
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
					siteId={ siteId }
					isReskinned={ true }
				/>
			</div>
		);
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
	redirectToAddDomainFlow: PropTypes.bool,
	domainAndPlanPackage: PropTypes.string,
	basePlansPath: PropTypes.string,
	hideFreePlan: PropTypes.bool,
	hidePersonalPlan: PropTypes.bool,
	hidePremiumPlan: PropTypes.bool,
	customerType: PropTypes.string,
	flowName: PropTypes.string,
	intervalType: PropTypes.oneOf( [ 'monthly', 'yearly' ] ),
	isChatAvailable: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,

	onUpgradeClick: PropTypes.func,
	redirectTo: PropTypes.string,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	shouldHideMonthlyToggle: PropTypes.bool,
	showFAQ: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	isAllPaidPlansShown: PropTypes.bool,
	plansWithScroll: PropTypes.bool,
	planTypes: PropTypes.array,
	isReskinned: PropTypes.bool,
	isPlansInsideStepper: PropTypes.bool,
	planTypeSelector: PropTypes.string,
};

PlansFeaturesMainPM.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	hidePersonalPlan: false,
	hidePremiumPlan: false,
	intervalType: 'yearly',
	isChatAvailable: false,
	shouldHideMonthlyToggle: false,
	showFAQ: true,
	siteId: null,
	siteSlug: '',
	plansWithScroll: false,
	isReskinned: false,
	planTypeSelector: 'interval',
	isPlansInsideStepper: false,
};

export default connect( ( state, props ) => {
	const siteId = props.site?.ID;
	const sitePlan = getSitePlan( state, siteId );
	const sitePlanSlug = sitePlan?.product_slug;
	const siteSlug = getSiteSlug( state, siteId );
	const eligibleForWpcomMonthlyPlans = isEligibleForWpComMonthlyPlan( state, siteId );
	const shouldHideMonthlyToggle = props.shouldHideMonthlyToggle;

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
		isInSignup: props.isInSignup,
		eligibleForWpcomMonthlyPlans: eligibleForWpcomMonthlyPlans,
		isPlansInsideStepper: props.isPlansInsideStepper,
		intervalType: props.intervalType,
		customerType: customerType,
		hidePersonalPlan: props.hidePersonalPlan,
		siteSlug,
	};

	return {
		isJetpack: isJetpackSite( state, siteId ),
		isMultisite: isJetpackSiteMultiSite( state, siteId ),
		siteId,
		siteSlug,
		sitePlanSlug,
		planTypeSelectorProps,
		shouldHideMonthlyToggle,
	};
} )( localize( PlansFeaturesMainPM ) );
