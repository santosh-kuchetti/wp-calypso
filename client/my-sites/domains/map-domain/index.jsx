import { withShoppingCart } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import MapDomainStep from 'calypso/components/domains/map-domain-step';
import TrademarkClaimsNotice from 'calypso/components/domains/trademark-claims-notice';
import HeaderCake from 'calypso/components/header-cake';
import Notice from 'calypso/components/notice';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import wpcom from 'calypso/lib/wp';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

export class MapDomain extends Component {
	static propTypes = {
		initialQuery: PropTypes.string,
		query: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isSiteUpgradeable: PropTypes.bool,
		isSiteOnPaidPlan: PropTypes.bool.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	isMounted = false;

	state = {
		isBusyMapping: false,
		errorMessage: null,
		suggestion: null,
		showTrademarkClaimsNotice: false,
	};

	goBack = () => {
		const { selectedSite, selectedSiteSlug } = this.props;

		if ( ! selectedSite ) {
			page( '/domains/add' );
			return;
		}

		if ( selectedSite.is_vip ) {
			page( domainManagementList( selectedSiteSlug ) );
			return;
		}

		page( '/domains/add/' + selectedSiteSlug );
	};

	addDomainToCart = async ( suggestion ) => {
		const { selectedSiteSlug } = this.props;

		try {
			await this.props.shoppingCartManager.addProductsToCart( [
				domainRegistration( {
					productSlug: suggestion.product_slug,
					domain: suggestion.domain_name,
				} ),
			] );
		} catch {
			// Nothing needs to be done here. CartMessages will display the error to the user.
			return;
		}
		this.isMounted && page( '/checkout/' + selectedSiteSlug );
	};

	handleRegisterDomain = ( suggestion ) => {
		const trademarkClaimsNoticeInfo = get( suggestion, 'trademark_claims_notice_info' );
		if ( ! isEmpty( trademarkClaimsNoticeInfo ) ) {
			this.setState( {
				suggestion,
				showTrademarkClaimsNotice: true,
			} );
			return;
		}

		this.addDomainToCart( suggestion );
	};

	handleMapDomain = ( domain ) => {
		const { selectedSite, selectedSiteSlug, translate } = this.props;

		this.setState( {
			errorMessage: null,
			isBusyMapping: true,
		} );

		// For VIP sites we handle domain mappings differently
		// We don't go through the usual checkout process
		// Instead, we add the mapping directly
		if ( selectedSite.is_vip ) {
			wpcom.req
				.post( `/sites/${ selectedSite.ID }/vip-domain-mapping`, { domain } )
				.then(
					() => {
						page( domainManagementList( selectedSiteSlug ) );
					},
					( error ) => {
						this.setState( { errorMessage: error.message } );
					}
				)
				.finally( () => {
					this.setState( { isBusyMapping: false } );
				} );
			return;
		} else if ( this.props.isSiteOnPaidPlan ) {
			wpcom.req
				.post( `/sites/${ selectedSite.ID }/add-domain-mapping`, { domain } )
				.then(
					() => {
						this.props.successNotice(
							translate( 'Domain mapping added! Please make sure to follow the next steps below.' ),
							{
								isPersistent: true,
								duration: 10000,
							}
						);
						page( domainManagementEdit( selectedSiteSlug, domain ) );
					},
					( error ) => {
						this.setState( { errorMessage: error.message } );
					}
				)
				.finally( () => {
					this.setState( { isBusyMapping: false } );
				} );
			return;
		}

		page( '/checkout/' + selectedSiteSlug + '/domain-mapping:' + domain );
	};

	componentDidMount() {
		this.isMounted = true;
		this.checkSiteIsUpgradeable();
	}

	componentDidUpdate() {
		this.checkSiteIsUpgradeable();
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	checkSiteIsUpgradeable() {
		if ( this.props.selectedSite && ! this.props.isSiteUpgradeable ) {
			page.redirect( '/domains/add/mapping' );
		}
	}

	rejectTrademarkClaim = () => {
		this.setState( { showTrademarkClaimsNotice: false } );
	};

	acceptTrademarkClaim = () => {
		const { suggestion } = this.state;
		this.addDomainToCart( suggestion );
	};

	trademarkClaimsNotice = () => {
		const { suggestion } = this.state;
		const domain = get( suggestion, 'domain_name' );
		const trademarkClaimsNoticeInfo = get( suggestion, 'trademark_claims_notice_info' );

		return (
			<TrademarkClaimsNotice
				basePath={ this.props.path }
				domain={ domain }
				onGoBack={ this.rejectTrademarkClaim }
				onAccept={ this.acceptTrademarkClaim }
				onReject={ this.rejectTrademarkClaim }
				trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
			/>
		);
	};

	render() {
		if ( this.state.showTrademarkClaimsNotice ) {
			return this.trademarkClaimsNotice();
		}

		const { domainsWithPlansOnly, initialQuery, productsList, selectedSite, translate } =
			this.props;

		const { errorMessage } = this.state;

		return (
			<span>
				<QueryProductsList />

				<HeaderCake onClick={ this.goBack }>{ translate( 'Map a Domain' ) }</HeaderCake>

				{ errorMessage && <Notice status="is-error" text={ errorMessage } showDismiss={ false } /> }

				<MapDomainStep
					domainsWithPlansOnly={ domainsWithPlansOnly }
					initialQuery={ initialQuery }
					isBusyMapping={ this.state.isBusyMapping }
					products={ productsList }
					selectedSite={ selectedSite }
					onRegisterDomain={ this.handleRegisterDomain }
					onMapDomain={ this.handleMapDomain }
					analyticsSection="domains"
				/>
			</span>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			selectedSite: getSelectedSite( state ),
			selectedSiteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
			isSiteUpgradeable: isSiteUpgradeable( state, selectedSiteId ),
			isSiteOnPaidPlan: isSiteOnPaidPlan( state, selectedSiteId ),
			productsList: getProductsList( state ),
		};
	},
	{
		successNotice,
	}
)( withCartKey( withShoppingCart( localize( MapDomain ) ) ) );
