import { Button, Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { flowRight as compose, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryWordadsSettings from 'calypso/components/data/query-wordads-settings';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import SectionHeader from 'calypso/components/section-header';
import SupportInfo from 'calypso/components/support-info';
import { protectForm } from 'calypso/lib/protect-form';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { getWordadsSettings } from 'calypso/state/selectors/get-wordads-settings';
import isSavingWordadsSettings from 'calypso/state/selectors/is-saving-wordads-settings';
import { isJetpackSite, getCustomizerUrl } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { dismissWordAdsSuccess } from 'calypso/state/wordads/approve/actions';
import { saveWordadsSettings } from 'calypso/state/wordads/settings/actions';

class AdsFormSettings extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
	};

	state = {};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( { wordadsSettings, site } ) {
		if ( ( isEmpty( this.state ) && wordadsSettings ) || site?.ID !== this.props.site?.ID ) {
			this.setState( {
				...this.defaultSettings(),
				...wordadsSettings,
			} );
		}
	}

	handleChange = ( event ) => {
		const name = event.currentTarget.name;
		const value = event.currentTarget.value;

		this.setState( {
			[ name ]: value,
		} );
	};

	handleToggle = ( event ) => {
		const name = event.currentTarget.name;

		this.setState( {
			[ name ]: ! this.state[ name ],
		} );
	};

	handleDisplayToggle = ( name ) => () => {
		this.setState( ( prevState ) => ( {
			display_options: {
				...prevState.display_options,
				[ name ]: ! this.state.display_options[ name ],
			},
		} ) );
	};

	handleCompactToggle = ( name ) => () => {
		this.setState( {
			[ name ]: ! this.state[ name ],
		} );
	};

	handleSubmit = ( event ) => {
		const { site } = this.props;
		event.preventDefault();

		this.props.saveWordadsSettings( site.ID, this.packageState() );

		this.props.markSaved();
	};

	defaultSettings() {
		return {
			optimized_ads: false,
			paypal: '',
			show_to_logged_in: 'yes',
			tos: 'signed',
			display_options: {},
			ccpa_enabled: false,
			ccpa_privacy_policy_url: '',
			custom_adstxt_enabled: false,
			custom_adstxt: '',
			jetpack_module_enabled: false,
		};
	}

	packageState() {
		return {
			optimized_ads: this.state.optimized_ads,
			paypal: this.state.paypal,
			show_to_logged_in: this.state.show_to_logged_in,
			tos: this.state.tos ? 'signed' : '',
			display_options: this.state.display_options,
			ccpa_enabled: this.state.ccpa_enabled,
			ccpa_privacy_policy_url: this.state.ccpa_privacy_policy_url,
			custom_adstxt_enabled: this.state.custom_adstxt_enabled,
			custom_adstxt: this.state.custom_adstxt,
			jetpack_module_enabled: this.state.jetpack_module_enabled,
		};
	}

	showAdsToOptions() {
		const { translate } = this.props;

		if ( this.props.siteIsJetpack ) {
			return (
				<ToggleControl
					checked={ !! this.state.jetpack_module_enabled }
					disabled={ this.props.isLoading }
					onChange={ this.handleCompactToggle( 'jetpack_module_enabled' ) }
					label={ translate( 'Enable ads and display an ad below each post' ) }
				/>
			);
		}

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Ads Visibility' ) }</FormLegend>
				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="yes"
						checked={ 'yes' === this.state.show_to_logged_in }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
						label={ translate( 'Run ads for all users' ) }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="no"
						checked={ 'no' === this.state.show_to_logged_in }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
						label={ translate( 'Run ads only for logged-out users (less revenue)' ) }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="pause"
						checked={ 'pause' === this.state.show_to_logged_in }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
						label={ translate( 'Pause ads (no revenue)' ) }
					/>
				</FormLabel>
			</FormFieldset>
		);
	}

	additionalAdsOption() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Additional Ads' ) }</FormLegend>
				<FormLabel>
					<FormCheckbox
						name="optimized_ads"
						checked={ !! this.state.optimized_ads }
						onChange={ this.handleToggle }
						disabled={ this.props.isLoading }
					/>
					<span>
						{ translate( 'Show optimized ads. ' ) }
						<a target="_blank" rel="noopener noreferrer" href="https://wordads.co/optimized-ads/">
							{ translate( 'Learn More' ) }
						</a>
					</span>
				</FormLabel>
			</FormFieldset>
		);
	}

	displayOptions() {
		const { translate } = this.props;

		const isDisabled =
			this.props.isLoading || ( this.props.siteIsJetpack && ! this.state.jetpack_module_enabled );

		return (
			<div>
				<FormFieldset className="ads__settings-display-toggles">
					<FormLegend>{ translate( 'Display ads below posts on' ) }</FormLegend>
					<ToggleControl
						checked={ !! this.state.display_options?.display_front_page }
						disabled={ isDisabled }
						onChange={ this.handleDisplayToggle( 'display_front_page' ) }
						label={ translate( 'Front page' ) }
					/>
					<ToggleControl
						checked={ !! this.state.display_options?.display_post }
						disabled={ isDisabled }
						onChange={ this.handleDisplayToggle( 'display_post' ) }
						label={ translate( 'Posts' ) }
					/>
					<ToggleControl
						checked={ !! this.state.display_options?.display_page }
						disabled={ isDisabled }
						onChange={ this.handleDisplayToggle( 'display_page' ) }
						label={ translate( 'Pages' ) }
					/>
					<ToggleControl
						checked={ !! this.state.display_options?.display_archive }
						disabled={ isDisabled }
						onChange={ this.handleDisplayToggle( 'display_archive' ) }
						label={ translate( 'Archives' ) }
					/>
				</FormFieldset>
				<FormFieldset className="ads__settings-display-toggles">
					<FormLegend>{ translate( 'Additional ad placements' ) }</FormLegend>
					<ToggleControl
						checked={ !! this.state.display_options?.enable_header_ad }
						disabled={ isDisabled }
						onChange={ this.handleDisplayToggle( 'enable_header_ad' ) }
						label={ translate( 'Top of each page' ) }
					/>
					<ToggleControl
						checked={ !! this.state.display_options?.second_belowpost }
						disabled={ isDisabled }
						onChange={ this.handleDisplayToggle( 'second_belowpost' ) }
						label={ translate( 'Second ad below post' ) }
					/>
					{ ! this.props.siteIsJetpack && (
						<ToggleControl
							checked={ !! this.state.display_options?.sidebar }
							disabled={ isDisabled }
							onChange={ this.handleDisplayToggle( 'sidebar' ) }
							label={ translate( 'Sidebar' ) }
						/>
					) }
				</FormFieldset>
			</div>
		);
	}

	paymentOptions() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="paypal">{ translate( 'PayPal E-mail Address' ) }</FormLabel>
				<FormTextInput
					name="paypal"
					id="paypal"
					value={ this.state.paypal || '' }
					onChange={ this.handleChange }
					disabled={ this.props.isLoading }
				/>
				<FormSettingExplanation>
					{ translate(
						'Earnings will be paid to the PayPal account on file. A PayPal account in good standing with the ability to accept funds must be maintained in order to receive earnings.' +
							' You can verify which PayPal features are available to you by looking up your country on the {{a}}PayPal website{{/a}}.',
						{
							components: {
								a: (
									<a
										href="https://www.paypal.com/us/webapps/mpp/country-worldwide"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	acceptCheckbox() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel>
					<FormCheckbox
						name="tos"
						checked={ !! this.state.tos }
						onChange={ this.handleToggle }
						disabled={ this.props.isLoading || 'signed' === this.state.tos }
					/>
					<span>
						{ translate(
							'I have read and agree to the {{a}}Automattic Ads Terms of Service{{/a}}. {{br/}}I agree to post only {{b}}family-friendly content{{/b}} and will not purchase non-human traffic.',
							{
								components: {
									a: (
										<a
											href="https://wordpress.com/automattic-ads-tos/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
									br: <br />,
									b: (
										<a
											href="https://wordads.co/2012/09/06/wordads-is-for-family-safe-sites/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</span>
				</FormLabel>
			</FormFieldset>
		);
	}

	privacy() {
		const { translate } = this.props;

		const isDisabled =
			this.props.isLoading || ( this.props.siteIsJetpack && ! this.state.jetpack_module_enabled );

		return (
			<div>
				<FormSectionHeading>{ translate( 'Privacy and Consent' ) }</FormSectionHeading>
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Enables a targeted advertising opt-out link in US states where this is legally required.'
						) }
						link="https://wordpress.com/support/us-privacy-laws-and-your-wordpress-com-site/"
					/>
					<ToggleControl
						checked={ !! this.state.ccpa_enabled }
						disabled={ isDisabled }
						onChange={ this.handleCompactToggle( 'ccpa_enabled' ) }
						label={ translate( 'Enable targeted advertising to site visitors in all US states.' ) }
					/>

					<div className="ads__child-settings">
						<FormSettingExplanation>
							{ translate(
								'Some US states have laws that require offering site visitors an opt-out from having their data used to personalize ads. Targeted advertising is off in certain states unless you enable it.'
							) }
						</FormSettingExplanation>
					</div>
				</FormFieldset>

				{ this.state.ccpa_enabled && (
					<div className="ads__child-settings">
						<FormFieldset>
							<FormLabel>{ translate( 'Do Not Sell Link' ) }</FormLabel>
							<span>
								{ translate(
									'If you enable targeted advertising in all US states you are required to place a "Do Not Sell or Share My Personal Information" link on every page of your site where targeted advertising will appear. You can use the {{a}}Do Not Sell Link Widget{{/a}}, or the {{code}}[privacy-do-not-sell-link]{{/code}} shortcode to automatically place this link on your site. Note: the link will always display to logged in administrators regardless of geolocation.',
									{
										components: {
											a: (
												<a
													href={ this.props.widgetsUrl }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
											code: <code />,
										},
									}
								) }
							</span>
							<FormSettingExplanation>
								{ translate(
									'Failure to add this link will result in non-compliance with privacy laws in some US states.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="ccpa-privacy-policy-url">
								{ translate( 'Privacy Policy URL' ) }
							</FormLabel>
							<FormTextInput
								name="ccpa_privacy_policy_url"
								id="ccpa-privacy-policy-url"
								value={ this.state.ccpa_privacy_policy_url || '' }
								onChange={ this.handleChange }
								disabled={ isDisabled }
								placeholder="https://"
							/>
							<FormSettingExplanation>
								{ translate(
									'Adds a link to your privacy policy to the bottom of the sale opt-out notice popup (optional).'
								) }
							</FormSettingExplanation>
						</FormFieldset>
					</div>
				) }
			</div>
		);
	}

	adstxt() {
		const { translate } = this.props;

		const isDisabled =
			this.props.isLoading || ( this.props.siteIsJetpack && ! this.state.jetpack_module_enabled );

		return (
			<div>
				<FormSectionHeading>{ translate( 'Ads.txt' ) }</FormSectionHeading>
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Ads.txt (Authorized Digital Sellers) is a mechanism that enables content owners to declare who is authorized to sell their ad inventory. It’s the formal list of advertising partners you support as a publisher.'
						) }
						link="https://jetpack.com/support/ads/"
					/>
					<ToggleControl
						checked={ !! this.state.custom_adstxt_enabled }
						disabled={ isDisabled }
						onChange={ this.handleCompactToggle( 'custom_adstxt_enabled' ) }
						label={ translate( 'Customize your ads.txt file' ) }
					/>
					{ this.state.custom_adstxt_enabled && (
						<>
							<div className="ads__child-settings">
								<FormSettingExplanation>
									{ translate(
										'Ads automatically generates a custom {{link1}}ads.txt{{/link1}} tailored for your site. If you need to add additional entries for other networks please add them in the space below, one per line. {{link2}}Check here for more details{{/link2}}.',
										{
											components: {
												link1: (
													<a
														href={ this.props.siteUrl + '/ads.txt' }
														target="_blank"
														rel="noopener noreferrer"
													/>
												),
												link2: (
													<a
														href="https://jetpack.com/2018/11/09/how-jetpack-ads-members-can-increase-their-earnings-with-ads-txt"
														target="_blank"
														rel="noopener noreferrer"
													/>
												),
											},
										}
									) }
								</FormSettingExplanation>
							</div>
							<div className="ads__child-settings">
								<FormTextarea
									name="custom_adstxt"
									value={ this.state.custom_adstxt }
									onChange={ this.handleChange }
									disabled={ isDisabled }
								/>
							</div>
						</>
					) }
				</FormFieldset>
			</div>
		);
	}

	render() {
		const { isLoading, site, translate } = this.props;

		const isWordAds = this.props.site.options.wordads;

		return (
			<Fragment>
				<QueryWordadsSettings siteId={ site.ID } />

				<SectionHeader label={ translate( 'Ads Settings' ) }>
					<Button
						compact
						primary
						onClick={ this.handleSubmit }
						disabled={ isLoading || ! isWordAds }
					>
						{ isLoading ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>

				<Card>
					<form
						id="wordads-settings"
						onSubmit={ this.handleSubmit }
						onChange={ this.props.markChanged }
					>
						{ this.showAdsToOptions() }

						{ this.displayOptions() }

						{ this.privacy() }

						{ this.props.siteIsJetpack ? this.adstxt() : null }

						<FormSectionHeading>{ translate( 'Payment Information' ) }</FormSectionHeading>
						{ this.paymentOptions() }

						<FormSectionHeading>{ translate( 'Terms of Service' ) }</FormSectionHeading>
						{ this.acceptCheckbox() }
					</form>
				</Card>
			</Fragment>
		);
	}
}

export default compose(
	connect(
		( state ) => {
			const siteId = getSelectedSiteId( state );
			const isJetpack = isJetpackSite( state, siteId );
			const isSavingSettings = isSavingWordadsSettings( state, siteId );
			const wordadsSettings = getWordadsSettings( state, siteId );

			return {
				isLoading: isSavingSettings || ! wordadsSettings,
				site: getSelectedSite( state ),
				siteIsJetpack: isJetpack,
				wordadsSettings,
				widgetsUrl: getCustomizerUrl( state, siteId, 'widgets' ),
				siteUrl: getSiteUrl( state, siteId ),
			};
		},
		{ dismissWordAdsSuccess, saveWordadsSettings }
	),
	localize,
	protectForm
)( AdsFormSettings );
