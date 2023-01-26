import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import {
	acceptEligibilityWarningDialog,
	dismissEligibilityWarningDialog,
	activate as activateTheme,
} from 'calypso/state/themes/actions';
import {
	getCanonicalTheme,
	getThemeForEligibilityWarning,
	shouldShowEligibilityWarning,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './auto-loading-homepage-modal.scss';

interface Props {
	siteId?: number;
	showEligibility: boolean;
	theme: {
		author: string;
		author_uri: string;
		id: string;
		name: string;
	};
	dispatchAcceptEligibilityWarningDialog: typeof acceptEligibilityWarningDialog;
	dispatchDismissEligibilityWarningDialog: typeof dismissEligibilityWarningDialog;
	dispatchActivateTheme: typeof activateTheme;
	dispatchRecordTracksEvent: typeof recordTracksEvent;
}
class EligibilityWarningModal extends Component< Props > {
	handleAccept() {
		const { siteId, theme } = this.props;
		if ( ! siteId ) {
			return;
		}
		this.props.dispatchAcceptEligibilityWarningDialog( theme.id );
		return this.props.dispatchActivateTheme( theme.id, siteId );
	}

	handleDismiss() {
		return this.props.dispatchDismissEligibilityWarningDialog();
	}

	render() {
		const { showEligibility } = this.props;

		const isMarketplaceProduct = true;

		return (
			<Dialog
				additionalClassNames="plugin-details-cta__dialog-content"
				additionalOverlayClassNames="plugin-details-cta__modal-overlay"
				isVisible={ showEligibility }
				onClose={ () => this.handleDismiss() }
				showCloseIcon={ true }
			>
				<EligibilityWarnings
					currentContext="plugin-details"
					isMarketplace={ isMarketplaceProduct }
					standaloneProceed
					onProceed={ () => this.handleAccept() }
					backUrl="#"
				/>
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const themeId = getThemeForEligibilityWarning( state );

		if ( ! siteId ) {
			return {};
		}

		return {
			siteId,
			theme: themeId && getCanonicalTheme( state, siteId, themeId ),
			showEligibility: shouldShowEligibilityWarning( state, themeId ),
		};
	},
	{
		dispatchAcceptEligibilityWarningDialog: acceptEligibilityWarningDialog,
		dispatchDismissEligibilityWarningDialog: dismissEligibilityWarningDialog,
		dispatchActivateTheme: activateTheme,
		dispatchRecordTracksEvent: recordTracksEvent,
	}
)( localize( EligibilityWarningModal ) );
