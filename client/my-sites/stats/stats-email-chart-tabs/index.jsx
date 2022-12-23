import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Chart from 'calypso/components/chart';
import Legend from 'calypso/components/chart/legend';
import { DEFAULT_HEARTBEAT } from 'calypso/components/data/query-site-stats/constants';
import memoizeLast from 'calypso/lib/memoize-last';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { QUERY_FIELDS } from 'calypso/state/stats/email-chart-tabs/constants';
import { getLoadingTabs } from 'calypso/state/stats/email-chart-tabs/selectors';
import { requestEmailStats } from 'calypso/state/stats/emails/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatTabs from '../stats-tabs';
import { buildChartData, getQueryDate } from './utility';

import './style.scss';

const ChartTabShape = PropTypes.shape( {
	attr: PropTypes.string,
	gridicon: PropTypes.string,
	legendOptions: PropTypes.arrayOf( PropTypes.string ),
} );

class StatModuleChartTabs extends Component {
	static propTypes = {
		activeLegend: PropTypes.arrayOf( PropTypes.string ),
		activeTab: ChartTabShape,
		availableLegend: PropTypes.arrayOf( PropTypes.string ),
		charts: PropTypes.arrayOf( ChartTabShape ),
		counts: PropTypes.arrayOf(
			PropTypes.shape( {
				comments: PropTypes.number,
				labelDay: PropTypes.string,
				likes: PropTypes.number,
				period: PropTypes.string,
				posts: PropTypes.number,
				visitors: PropTypes.number,
				views: PropTypes.number,
			} )
		),
		isActiveTabLoading: PropTypes.bool,
		onChangeLegend: PropTypes.func.isRequired,
	};

	intervalId = null;

	componentDidMount() {
		if ( this.props.query ) {
			this.startQueryInterval();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.query && prevProps.queryKey !== this.props.queryKey ) {
			this.startQueryInterval();
		}
	}

	onLegendClick = ( chartItem ) => {
		const activeLegend = this.props.activeLegend.slice();
		const chartIndex = activeLegend.indexOf( chartItem );
		let gaEventAction;
		if ( -1 === chartIndex ) {
			activeLegend.push( chartItem );
			gaEventAction = ' on';
		} else {
			activeLegend.splice( chartIndex );
			gaEventAction = ' off';
		}
		this.props.recordGoogleEvent(
			'Stats',
			`Toggled Nested Chart ${ chartItem } ${ gaEventAction }`
		);
		this.props.onChangeLegend( activeLegend );
	};

	startQueryInterval() {
		// NOTE: Unpredictable behavior will arise if DEFAULT_HEARTBEAT < request duration!
		Number.isFinite( this.intervalId ) && clearInterval( this.intervalId );
		this.makeQuery();
		this.intervalId = setInterval( this.makeQuery, DEFAULT_HEARTBEAT );
	}

	makeQuery = () => {
		const { siteId, postId, period, date, quantity } = this.props.query;

		return this.props.requestEmailStats( siteId, postId, period, date, quantity );
	};

	render() {
		const isNewFeatured = config.isEnabled( 'stats/new-main-chart' );

		const { isActiveTabLoading } = this.props;

		//TODO Try to retire `.stats-module` and replace it with `.is-chart-tabs`.
		const classes = [
			'is-chart-tabs',
			{
				'is-loading': isActiveTabLoading,
				'stats-module': ! isNewFeatured,
			},
		];

		/* pass bars count as `key` to disable transitions between tabs with different column count */
		return isNewFeatured ? (
			<div className={ classNames( ...classes ) }>
				<Legend
					activeCharts={ this.props.activeLegend }
					activeTab={ this.props.activeTab }
					availableCharts={ this.props.availableLegend }
					clickHandler={ this.onLegendClick }
					tabs={ this.props.charts }
				/>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<StatsModulePlaceholder className="is-chart" isLoading={ isActiveTabLoading } />

				<Chart barClick={ this.props.barClick } data={ this.props.chartData } minBarWidth={ 35 } />
				<StatTabs
					data={ this.props.counts }
					tabs={ this.props.charts }
					switchTab={ this.props.switchTab }
					selectedTab={ this.props.chartTab }
					activeIndex={ this.props.queryDate }
					activeKey="period"
				/>
			</div>
		) : (
			<Card key={ this.props.chartData.length } className={ classNames( ...classes ) }>
				<Legend
					activeCharts={ this.props.activeLegend }
					activeTab={ this.props.activeTab }
					availableCharts={ this.props.availableLegend }
					clickHandler={ this.onLegendClick }
					tabs={ this.props.charts }
				/>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<StatsModulePlaceholder className="is-chart" isLoading={ isActiveTabLoading } />
				<Chart barClick={ this.props.barClick } data={ this.props.chartData } />
				<StatTabs
					data={ this.props.counts }
					tabs={ this.props.charts }
					switchTab={ this.props.switchTab }
					selectedTab={ this.props.chartTab }
					activeIndex={ this.props.queryDate }
					activeKey="period"
				/>
			</Card>
		);
	}
}

const NO_SITE_STATE = {
	siteId: null,
	counts: [],
	chartData: [],
};

const memoizedQuery = memoizeLast( ( chartTab, date, period, quantity, siteId, postId ) => ( {
	chartTab,
	date,
	period,
	quantity,
	siteId,
	postId,
	statFields: QUERY_FIELDS,
} ) );

const connectComponent = connect(
	( state, { activeLegend, period: { period }, chartTab, queryDate, postId } ) => {
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return NO_SITE_STATE;
		}

		const quantity = 'year' === period ? 10 : 30;
		const counts =
			Object.keys( state.stats.emails.items[ siteId ][ postId ] ).map(
				// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
				( key ) => state.stats.emails.items[ siteId ][ postId ][ key ]
			) || [];
		const chartData = buildChartData( activeLegend, chartTab, counts, period, queryDate );
		const loadingTabs = getLoadingTabs( state, siteId, postId );
		const isActiveTabLoading = loadingTabs.includes( chartTab ) || chartData.length !== quantity;
		const timezoneOffset = getSiteOption( state, siteId, 'gmt_offset' ) || 0;
		const date = getQueryDate( queryDate, timezoneOffset, period, quantity );
		const queryKey = `${ date }-${ period }-${ quantity }-${ siteId }-${ postId }`;
		const query = memoizedQuery( chartTab, date, period, quantity, siteId, postId );

		return {
			chartData,
			counts,
			isActiveTabLoading,
			query,
			queryKey,
			siteId,
		};
	},
	{ recordGoogleEvent, requestEmailStats }
);

export default flowRight(
	localize,
	connectComponent
)( withPerformanceTrackerStop( StatModuleChartTabs ) );
