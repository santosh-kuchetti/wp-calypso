import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const SeoSettingsHelpCard = ( {
	disabled,
	hasAdvancedSEOFeature,
	siteId,
	siteIsJetpack,
	translate,
} ) => {
	const seoHelpLink = siteIsJetpack
		? 'https://jetpack.com/support/seo-tools/'
		: 'https://wpbizseo.wordpress.com/';

	return (
		<div id="seo">
			<SettingsSectionHeader title={ translate( 'Search engine optimization' ) } />
			{ hasAdvancedSEOFeature && (
				<Card className="seo-settings__help">
					<p>
						{ translate(
							'{{b}}WordPress.com has great SEO{{/b}} out of the box. All of our themes are optimized ' +
								"for search engines, so you don't have to do anything extra. However, you can tweak " +
								"these settings if you'd like more advanced control. Read more about what you can do " +
								"to {{a}}optimize your site's SEO{{/a}}.",
							{
								components: {
									a: <a href={ seoHelpLink } />,
									b: <strong />,
								},
							}
						) }
					</p>

					{ siteIsJetpack && (
						<SupportInfo
							text={ translate(
								'To help improve your search page ranking, you can customize how the content titles' +
									' appear for your site. You can reorder items such as ‘Site Name’ and ‘Tagline’,' +
									' and also add custom separators between the items.'
							) }
							link="https://jetpack.com/support/seo-tools/"
						/>
					) }
					{ siteIsJetpack && (
						<JetpackModuleToggle
							siteId={ siteId }
							moduleSlug="seo-tools"
							label={ translate( 'Enable SEO Tools to optimize your site for search engines' ) }
							disabled={ disabled }
						/>
					) }
				</Card>
			) }
		</div>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const hasAdvancedSEOFeature =
		siteHasFeature( state, siteId, FEATURE_ADVANCED_SEO ) &&
		( ! siteIsJetpack || get( getJetpackModules( state, siteId ), 'seo-tools.available', false ) );

	return {
		siteId,
		siteIsJetpack,
		hasAdvancedSEOFeature,
	};
} )( localize( SeoSettingsHelpCard ) );
