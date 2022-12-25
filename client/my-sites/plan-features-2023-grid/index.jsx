import {
	planMatches,
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getPlanClass,
	isFreePlan,
	isMonthly,
	TERM_MONTHLY,
	isPremiumPlan,
	isEcommercePlan,
	isWpcomEnterpriseGridPlan,
	FEATURE_CUSTOM_DOMAIN,
	PLAN_FREE,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { compact, get, map, reduce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import vipLogo from 'calypso/assets/images/onboarding/vip-logo.svg';
import wooLogo from 'calypso/assets/images/onboarding/woo-logo.svg';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import PlanPill from 'calypso/components/plans/plan-pill';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	getPlan,
	getPlanBySlug,
	getPlanRawPrice,
	getPlanSlug,
	getDiscountedRawPrice,
} from 'calypso/state/plans/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
} from 'calypso/state/sites/plans/selectors';
import PlanFeatures2023GridActions from './actions';
import PlanFeatures2023GridHeaderPrice from './header-price';
import { PlanFeaturesItem } from './item';
import './style.scss';

const noop = () => {};

export class PlanFeatures2023Grid extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}

	render() {
		const { isInSignup, planProperties, translate } = this.props;
		const tableClasses = classNames(
			'plan-features-2023-grid__table',
			`has-${ planProperties.length }-cols`
		);
		const planClasses = classNames( 'plan-features', {
			'plan-features--signup': isInSignup,
		} );
		const planWrapperClasses = classNames( {
			'plans-wrapper': isInSignup,
		} );

		return (
			<div className={ planWrapperClasses }>
				<QueryActivePromotions />
				<div className={ planClasses }>
					<div ref={ this.contentRef } className="plan-features-2023-grid__content">
						<div>
							<table className={ tableClasses }>
								<caption className="plan-features-2023-grid__screen-reader-text screen-reader-text">
									{ translate( 'Available plans to choose from' ) }
								</caption>
								<tbody>
									<tr>{ this.renderPlanLogos() }</tr>
									<tr>{ this.renderPlanHeaders() }</tr>
									<tr>{ this.renderPlanSubHeaders() }</tr>
									<tr>{ this.renderPlanPriceGroup() }</tr>
									<tr>{ this.renderTopButtons() }</tr>
									{ this.renderPlanFeatureRows() }
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderPlanPriceGroup() {
		const { basePlansPath, planProperties, isReskinned, flowName, is2023OnboardingPricingGrid } =
			this.props;

		return map( planProperties, ( properties ) => {
			const {
				annualPricePerMonth,
				availableForPurchase,
				currencyCode,
				current,
				discountPrice,
				planConstantObj,
				planName,
				relatedMonthlyPlan,
				isMonthlyPlan,
				isPlaceholder,
				hideMonthly,
				rawPrice,
				rawPriceAnnual,
				rawPriceForMonthlyPlan,
			} = properties;

			const classes = classNames( 'plan-features-2023-grid__table-item', {
				'has-border-top': ! isReskinned,
			} );
			const billingTimeFrame = planConstantObj.getBillingTimeFrame();

			return (
				<th scope="col" key={ planName } className={ classes }>
					<PlanFeatures2023GridHeaderPrice
						availableForPurchase={ availableForPurchase }
						basePlansPath={ basePlansPath }
						billingTimeFrame={ billingTimeFrame }
						current={ current }
						currencyCode={ currencyCode }
						discountPrice={ discountPrice }
						hideMonthly={ hideMonthly }
						isPlaceholder={ isPlaceholder }
						rawPrice={ rawPrice }
						rawPriceAnnual={ rawPriceAnnual }
						rawPriceForMonthlyPlan={ rawPriceForMonthlyPlan }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						annualPricePerMonth={ annualPricePerMonth }
						isMonthlyPlan={ isMonthlyPlan }
						flow={ flowName }
						planName={ planName }
						is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					/>
				</th>
			);
		} );
	}

	renderPlanLogos() {
		const { planProperties, translate, isInSignup } = this.props;

		return map( planProperties, ( properties ) => {
			const { planName } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header-logo',
				getPlanClass( planName )
			);
			const tableItemClasses = classNames( 'plan-features-2023-grid__table-item', {
				'popular-plan-parent-class': isPremiumPlan( planName ),
			} );

			return (
				<th scope="col" key={ planName } className={ tableItemClasses }>
					{ isPremiumPlan( planName ) && (
						<div className="plan-features-2023-grid__popular-badge">
							<PlanPill isInSignup={ isInSignup }>{ translate( 'Popular' ) }</PlanPill>
						</div>
					) }
					<header className={ headerClasses }>
						{ isEcommercePlan( planName ) && (
							<div className="plan-features-2023-grid__plan-logo">
								<img src={ wooLogo } alt="WooCommerce logo" />{ ' ' }
							</div>
						) }
						{ isWpcomEnterpriseGridPlan( planName ) && (
							<div className="plan-features-2023-grid__plan-logo">
								<img src={ vipLogo } alt="Enterprise logo" />{ ' ' }
							</div>
						) }
					</header>
				</th>
			);
		} );
	}

	renderPlanHeaders() {
		const { planProperties } = this.props;

		return map( planProperties, ( properties ) => {
			const { planName, planConstantObj } = properties;
			const headerClasses = classNames(
				'plan-features-2023-grid__header',
				getPlanClass( planName )
			);

			return (
				<th scope="col" key={ planName } className="plan-features-2023-grid__table-item">
					<header className={ headerClasses }>
						<h4 className="plan-features-2023-grid__header-title">
							{ planConstantObj.getTitle() }
						</h4>
					</header>
				</th>
			);
		} );
	}

	renderPlanSubHeaders() {
		const { planProperties } = this.props;

		return map( planProperties, ( properties ) => {
			const { planName, tagline } = properties;

			return (
				<th scope="col" key={ planName } className="plan-features-2023-grid__table-item">
					<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
				</th>
			);
		} );
	}

	handleUpgradeClick( singlePlanProperties ) {
		const { onUpgradeClick: ownPropsOnUpgradeClick } = this.props;
		const { cartItemForPlan, planName } = singlePlanProperties;

		if ( ownPropsOnUpgradeClick && ownPropsOnUpgradeClick !== noop && cartItemForPlan ) {
			ownPropsOnUpgradeClick( cartItemForPlan );
			return;
		}

		if ( isFreePlan( planName ) ) {
			ownPropsOnUpgradeClick( null );
		}

		return `/checkout`;
	}

	renderTopButtons() {
		const { isInSignup, isLaunchPage, planProperties, flowName } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				availableForPurchase,
				current,
				planName,
				primaryUpgrade,
				isPlaceholder,
				planConstantObj,
				popular,
			} = properties;
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

			return (
				<td key={ planName } className={ classes }>
					<PlanFeatures2023GridActions
						availableForPurchase={ availableForPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
						flowName={ flowName }
					/>
				</td>
			);
		} );
	}

	getLongestFeaturesList() {
		const { planProperties } = this.props;

		return reduce(
			planProperties,
			( longest, properties ) => {
				const currentFeatures = Object.keys( properties.features );
				return currentFeatures.length > longest.length ? currentFeatures : longest;
			},
			[]
		);
	}

	renderPlanFeatureRows() {
		return (
			<>
				<tr className="plan-features-comparison__row">{ this.renderPlanFeatureColumns() }</tr>
			</>
		);
	}

	renderAnnualPlansFeatureNotice( feature ) {
		const { translate } = this.props;

		if ( ! feature.availableOnlyForAnnualPlans || feature.availableForCurrentPlan ) {
			return '';
		}

		return (
			<span className="plan-features-2023-grid__item-annual-plan">
				{ translate( 'Included with annual plans' ) }
			</span>
		);
	}

	renderFeatureItem( feature, index ) {
		const classes = classNames( 'plan-features-2023-grid__item-info', {
			'is-annual-plan-feature': feature.availableOnlyForAnnualPlans,
			'is-available': feature.availableForCurrentPlan,
		} );

		return (
			<>
				<PlanFeaturesItem
					key={ index }
					annualOnlyContent={ this.renderAnnualPlansFeatureNotice( feature ) }
					isFeatureAvailable={ feature.availableForCurrentPlan }
				>
					<span className={ classes }>
						<span className="plan-features-2023-grid__item-title">
							{ feature.getTitle( this.props.domainName ) }
						</span>
					</span>
				</PlanFeaturesItem>
			</>
		);
	}

	renderPlanFeatures( features, planName, mapIndex ) {
		const { selectedFeature } = this.props;

		return map( features, ( currentFeature, featureIndex ) => {
			const classes = classNames( '', getPlanClass( planName ), {
				'is-last-feature': featureIndex + 1 === features.length,
				'is-highlighted':
					selectedFeature && currentFeature && selectedFeature === currentFeature.getSlug(),
				'is-bold': currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN,
			} );

			return (
				<div key={ `${ currentFeature.getSlug() }-${ featureIndex }` } className={ classes }>
					{ this.renderFeatureItem( currentFeature, mapIndex ) }
				</div>
			);
		} );
	}

	renderPlanFeatureColumns() {
		const { planProperties } = this.props;
		let previousPlanName = 'Free';
		let currentPlanName = 'Free';

		return map( planProperties, ( properties, mapIndex ) => {
			const { planName, features, product_name_short } = properties;
			previousPlanName = currentPlanName;
			currentPlanName = product_name_short;
			const planFeatureTitle = [ PLAN_FREE, PLAN_ENTERPRISE_GRID_WPCOM ].includes( planName )
				? ''
				: `Everything in ${ previousPlanName }, plus:`;
			const classes = classNames(
				'plan-features-2023-grid__item',
				'plan-features-2023-grid__common-title',
				getPlanClass( planName )
			);

			return (
				<td key={ `${ planName }-${ mapIndex }` } className="plan-features-2023-grid__table-item">
					<div className={ classes }>{ mapIndex === 0 ? <>&nbsp;</> : planFeatureTitle }</div>
					{ this.renderPlanFeatures( features, planName, mapIndex ) }
				</td>
			);
		} );
	}
}

PlanFeatures2023Grid.propTypes = {
	basePlansPath: PropTypes.string,
	isInSignup: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	popularPlan: PropTypes.object,
	visiblePlans: PropTypes.array,
	planProperties: PropTypes.array,
	selectedFeature: PropTypes.string,
	purchaseId: PropTypes.number,
	flowName: PropTypes.string,
	siteId: PropTypes.number,
};

PlanFeatures2023Grid.defaultProps = {
	basePlansPath: null,
	isInSignup: true,
	siteId: null,
	onUpgradeClick: noop,
};

export const calculatePlanCredits = ( state, siteId, planProperties ) =>
	planProperties
		.map( ( { planName, availableForPurchase } ) => {
			if ( ! availableForPurchase ) {
				return 0;
			}
			const annualDiscountPrice = getPlanDiscountedRawPrice( state, siteId, planName );
			const annualRawPrice = getSitePlanRawPrice( state, siteId, planName );
			if ( typeof annualDiscountPrice !== 'number' || typeof annualRawPrice !== 'number' ) {
				return 0;
			}

			return annualRawPrice - annualDiscountPrice;
		} )
		.reduce( ( max, credits ) => Math.max( max, credits ), 0 );

const hasPlaceholders = ( planProperties ) =>
	planProperties.filter( ( planProps ) => planProps.isPlaceholder ).length > 0;

/* eslint-disable wpcalypso/redux-no-bound-selectors */
export default connect(
	( state, ownProps ) => {
		const { placeholder, plans, isLandingPage, siteId, visiblePlans, popularPlanSpec } = ownProps;
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;

		let planProperties = compact(
			map( plans, ( plan ) => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, undefined );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isMonthlyPlan = isMonthly( plan );
				const showMonthly = ! isMonthlyPlan;
				const availableForPurchase = true;
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;
				const popular = popularPlanSpec && planMatches( plan, popularPlanSpec );

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = true;

				const features = planConstantObj.getPlanCompareFeatures();

				let planFeatures = getPlanFeaturesObject( features );
				if ( placeholder || ! planObject ) {
					isPlaceholder = true;
				}

				planFeatures = getPlanFeaturesObject(
					planConstantObj.get2023PricingGridSignupWpcomFeatures()
				);

				const rawPrice = getPlanRawPrice( state, planProductId, showMonthlyPrice );
				const discountPrice = getDiscountedRawPrice( state, planProductId, showMonthlyPrice );

				let annualPricePerMonth = discountPrice || rawPrice;
				if ( isMonthlyPlan ) {
					// Get annual price per month for comparison
					const yearlyPlan = getPlanBySlug( state, getYearlyPlanByMonthly( plan ) );
					if ( yearlyPlan ) {
						const yearlyPlanDiscount = getDiscountedRawPrice(
							state,
							yearlyPlan.product_id,
							showMonthlyPrice
						);
						annualPricePerMonth =
							yearlyPlanDiscount ||
							getPlanRawPrice( state, yearlyPlan.product_id, showMonthlyPrice );
					}
				}

				const monthlyPlanKey = findPlansKeys( {
					group: planConstantObj.group,
					term: TERM_MONTHLY,
					type: planConstantObj.type,
				} )[ 0 ];
				const monthlyPlanProductId = getPlanFromKey( monthlyPlanKey )?.getProductId();
				// This is the per month price of a monthly plan. E.g. $14 for Premium monthly.
				const rawPriceForMonthlyPlan = getPlanRawPrice( state, monthlyPlanProductId, true );
				const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.() || [];
				if ( annualPlansOnlyFeatures.length > 0 ) {
					planFeatures = planFeatures.map( ( feature ) => {
						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							feature.getSlug()
						);

						return {
							...feature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
						};
					} );
				}

				// Strip annual-only features out for the site's /plans page
				if ( isPlaceholder ) {
					planFeatures = planFeatures.filter(
						( { availableForCurrentPlan = true } ) => availableForCurrentPlan
					);
				}

				const rawPriceAnnual =
					null !== discountPrice
						? discountPrice * 12
						: getPlanRawPrice( state, planProductId, false );

				const tagline = planConstantObj.getPlanTagline();
				const product_name_short =
					PLAN_ENTERPRISE_GRID_WPCOM === plan
						? planConstantObj.getPathSlug()
						: planObject.product_name_short;

				return {
					availableForPurchase,
					cartItemForPlan: getCartItemForPlan( getPlanSlug( state, planProductId ) ),
					currencyCode: getCurrentUserCurrencyCode( state ),
					discountPrice,
					features: planFeatures,
					isLandingPage,
					isPlaceholder,
					planConstantObj,
					planName: plan,
					planObject: planObject,
					popular,
					productSlug: get( planObject, 'product_slug' ),
					product_name_short,
					hideMonthly: false,
					primaryUpgrade: popular || plans.length === 1,
					rawPrice,
					rawPriceAnnual,
					rawPriceForMonthlyPlan,
					relatedMonthlyPlan,
					annualPricePerMonth,
					isMonthlyPlan,
					tagline,
				};
			} )
		);

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( ( p ) => visiblePlans.indexOf( p.planName ) !== -1 );
		}

		const purchaseId = getCurrentPlanPurchaseId( state, siteId );

		return {
			planProperties,
			purchaseId,
			siteType,
			hasPlaceholders: hasPlaceholders( planProperties ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeatures2023Grid ) );
/* eslint-enable wpcalypso/redux-no-bound-selectors */
