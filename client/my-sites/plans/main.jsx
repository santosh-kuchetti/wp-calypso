import { isEnabled } from '@automattic/calypso-config';
import {
	getPlan,
	getIntervalTypeForTerm,
	PLAN_FREE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { localize, useTranslate } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Banner from 'calypso/components/banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import P2PlansMain from 'calypso/my-sites/plans/p2-plans-main';
import { isTreatmentPlansReorderTest } from 'calypso/state/marketing/selectors';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import {
	getCurrentPlan,
	getECommerceTrialDaysLeft,
	getECommerceTrialExpiration,
	isECommerceTrialExpired,
} from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import PlansHeader from './header';

import './style.scss';

function DomainAndPlanUpsellNotice() {
	const translate = useTranslate();
	const noticeTitle = translate( 'Almost done' );
	const noticeDescription = translate( 'Upgrade today to claim your free domain name!' );
	return (
		<Banner
			title={ noticeTitle }
			description={ noticeDescription }
			icon="star"
			showIcon
			disableHref
		/>
	);
}

class Plans extends Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		redirectToAddDomainFlow: PropTypes.bool,
		domainAndPlanPackage: PropTypes.string,
		intervalType: PropTypes.string,
		customerType: PropTypes.string,
		selectedFeature: PropTypes.string,
		redirectTo: PropTypes.string,
		selectedSite: PropTypes.object,
	};

	static defaultProps = {
		intervalType: 'yearly',
	};

	componentDidMount() {
		this.redirectIfInvalidPlanInterval();

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	}

	componentDidUpdate() {
		this.redirectIfInvalidPlanInterval();
	}

	isInvalidPlanInterval() {
		const { isSiteEligibleForMonthlyPlan, intervalType, selectedSite } = this.props;
		const isWpcomMonthly = intervalType === 'monthly';

		return selectedSite && isWpcomMonthly && ! isSiteEligibleForMonthlyPlan;
	}

	redirectIfInvalidPlanInterval() {
		const { selectedSite } = this.props;

		if ( this.isInvalidPlanInterval() ) {
			page.redirect( '/plans/yearly/' + selectedSite.slug );
		}
	}

	onSelectPlan = ( item ) => {
		const {
			selectedSite,
			context: {
				query: { discount },
			},
		} = this.props;
		const checkoutPath = `/checkout/${ selectedSite.slug }/${ item.product_slug }/`;

		page(
			discount
				? addQueryArgs( checkoutPath, {
						coupon: discount,
				  } )
				: checkoutPath
		);
	};

	renderPlaceholder = () => {
		return (
			<div>
				<DocumentHead title={ this.props.translate( 'Plans', { textOnly: true } ) } />
				<Main wideLayout>
					<div id="plans" className="plans plans__has-sidebar" />
				</Main>
			</div>
		);
	};

	renderPlansMain() {
		const { currentPlan, selectedSite, isWPForTeamsSite } = this.props;

		if ( ! this.props.plansLoaded || ! currentPlan ) {
			// Maybe we should show a loading indicator here?
			return null;
		}

		if ( isEnabled( 'p2/p2-plus' ) && isWPForTeamsSite ) {
			return (
				<P2PlansMain
					selectedPlan={ this.props.selectedPlan }
					redirectTo={ this.props.redirectTo }
					site={ selectedSite }
					withDiscount={ this.props.withDiscount }
					discountEndDate={ this.props.discountEndDate }
				/>
			);
		}

		const hideFreePlan = ! isEnabled( 'onboarding/2023-pricing-grid' );

		return (
			<PlansFeaturesMain
				redirectToAddDomainFlow={ this.props.redirectToAddDomainFlow }
				domainAndPlanPackage={ this.props.domainAndPlanPackage }
				hideFreePlan={ hideFreePlan }
				customerType={ this.props.customerType }
				intervalType={ this.props.intervalType }
				selectedFeature={ this.props.selectedFeature }
				selectedPlan={ this.props.selectedPlan }
				redirectTo={ this.props.redirectTo }
				withDiscount={ this.props.withDiscount }
				discountEndDate={ this.props.discountEndDate }
				site={ selectedSite }
				plansWithScroll={ false }
				showTreatmentPlansReorderTest={ this.props.showTreatmentPlansReorderTest }
			/>
		);
	}

	renderEcommerceTrialPage() {
		const {
			translate,
			moment,
			currentPlan,
			eCommerceTrialDaysLeft,
			eCommerceTrialExpiration,
			isTrialExpired,
			locale,
		} = this.props;

		const trialStart = moment( currentPlan?.subscribedDate );
		const trialEnd = moment( currentPlan?.expiryDate );
		const trialDuration = trialEnd.diff( trialStart, 'days' );

		// Trial progress from 0 to 100
		const trialProgress = ( 1 - eCommerceTrialDaysLeft / trialDuration ) * 100;

		// moment.js doesn't have a format option to display the long form in a localized way without the year
		// https://github.com/moment/moment/issues/3341
		const readableExpirationDate = eCommerceTrialExpiration?.toDate().toLocaleDateString( locale, {
			month: 'long',
			day: 'numeric',
		} );

		return (
			<>
				<BodySectionCssClass bodyClass={ [ 'is-trial-plan' ] } />

				<Card className="plans__trial-card">
					<div className="plans__trial-card-content">
						<p className="plans__card-title">{ translate( 'You’re in a free trial store' ) }</p>
						<p className="plans__card-subtitle">
							{
								// Still need to populate the date correctly
								translate(
									'Your free trial will end in %(daysLeft)d day. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
									'Your free trial will end in %(daysLeft)d days. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
									{
										count: eCommerceTrialDaysLeft,
										args: {
											daysLeft: eCommerceTrialDaysLeft,
											expirationdate: readableExpirationDate,
										},
									}
								)
							}
						</p>
					</div>
					<div className="plans__chart-wrapper">
						<div className="plans__chart" style={ { '--p': trialProgress } }>
							{ eCommerceTrialDaysLeft }
						</div>
						<br />
						<span className="plans__chart-label">
							{ isTrialExpired
								? translate( 'Your free trial has expired' )
								: translate( 'day left in trial', 'days left in trial', {
										count: eCommerceTrialDaysLeft,
								  } ) }
						</span>
					</div>
				</Card>
			</>
		);
	}

	render() {
		const {
			selectedSite,
			translate,
			canAccessPlans,
			currentPlan,
			domainAndPlanPackage,
			is2023OnboardingPricingGrid,
		} = this.props;

		if ( ! selectedSite || this.isInvalidPlanInterval() || ! currentPlan ) {
			return this.renderPlaceholder();
		}

		const currentPlanSlug = selectedSite?.plan?.product_slug;
		const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;

		return (
			<div className={ is2023OnboardingPricingGrid ? 'is-2023-pricing-grid' : '' }>
				{ selectedSite.ID && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<PageViewTracker path="/plans/:site" title="Plans" />
				<QueryContactDetailsCache />
				<QueryPlans />
				<TrackComponentView eventName="calypso_plans_view" />
				<Main
					fullWidthLayout={ is2023OnboardingPricingGrid && ! isEcommerceTrial }
					wideLayout={ ! ( is2023OnboardingPricingGrid && ! isEcommerceTrial ) }
				>
					{ ! canAccessPlans && (
						<EmptyContent
							illustration="/calypso/images/illustrations/illustration-404.svg"
							title={ translate( 'You are not authorized to view this page' ) }
						/>
					) }
					{ canAccessPlans && (
						<>
							<PlansHeader />

							{ domainAndPlanPackage && <DomainAndPlanUpsellNotice /> }
							<div id="plans" className="plans plans__has-sidebar">
								<PlansNavigation path={ this.props.context.path } />
								{ isEcommerceTrial ? this.renderEcommerceTrialPage() : this.renderPlansMain() }
								<PerformanceTrackerStop />
							</div>
						</>
					) }
				</Main>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	const currentPlan = getCurrentPlan( state, selectedSiteId );
	const currentPlanIntervalType = getIntervalTypeForTerm(
		getPlan( currentPlan?.productSlug )?.term
	);
	const is2023OnboardingPricingGrid = isEnabled( 'onboarding/2023-pricing-grid' );
	const eCommerceTrialDaysLeft = Math.round( getECommerceTrialDaysLeft( state, selectedSiteId ) );
	const isTrialExpired = isECommerceTrialExpired( state, selectedSiteId );
	const eCommerceTrialExpiration = getECommerceTrialExpiration( state, selectedSiteId );

	return {
		currentPlan,
		currentPlanIntervalType,
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		selectedSite: getSelectedSite( state ),
		canAccessPlans: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
		isWPForTeamsSite: isSiteWPForTeams( state, selectedSiteId ),
		isSiteEligibleForMonthlyPlan: isEligibleForWpComMonthlyPlan( state, selectedSiteId ),
		showTreatmentPlansReorderTest: isTreatmentPlansReorderTest( state ),
		plansLoaded: Boolean( getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 ) ),
		is2023OnboardingPricingGrid,
		eCommerceTrialDaysLeft,
		isTrialExpired,
		eCommerceTrialExpiration,
	};
} )( localize( withTrackingTool( 'HotJar' )( withLocalizedMoment( Plans ) ) ) );
