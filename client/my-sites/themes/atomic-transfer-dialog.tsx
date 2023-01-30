import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import {
	acceptAtomicTransferDialog,
	dismissAtomicTransferDialog,
	activate as activateTheme,
} from 'calypso/state/themes/actions';
import {
	getCanonicalTheme,
	getThemeForAtomicTransferDialog,
	isExternallyManagedTheme,
	shouldShowAtomicTransferDialog,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Theme } from 'calypso/types';

interface AtomicTransferDialogProps {
	siteId?: number;
	showEligibility: boolean;
	theme: Theme;
	isMarketplaceProduct?: boolean;
	dispatchAcceptAtomicTransferDialog: typeof acceptAtomicTransferDialog;
	dispatchDismissAtomicTransferDialog: typeof dismissAtomicTransferDialog;
	dispatchRecordTracksEvent: typeof recordTracksEvent;
	onAcceptAtomicTransfer: Function;
}

class AtomicTransferDialog extends Component< AtomicTransferDialogProps > {
	handleAccept() {
		const { siteId, theme } = this.props;
		if ( ! siteId ) {
			return;
		}
		this.props.dispatchAcceptAtomicTransferDialog( theme.id );
		return this.props.onAcceptAtomicTransfer( {
			siteId,
			themeId: theme.id,
		} );
	}

	handleDismiss() {
		return this.props.dispatchDismissAtomicTransferDialog();
	}

	render() {
		const { showEligibility, isMarketplaceProduct } = this.props;

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
		const themeId = getThemeForAtomicTransferDialog( state );

		if ( ! siteId ) {
			return {};
		}

		return {
			siteId,
			theme: themeId && getCanonicalTheme( state, siteId, themeId ),
			showEligibility: shouldShowAtomicTransferDialog( state, themeId ),
			isMarketplaceProduct: isExternallyManagedTheme( state, themeId ),
		};
	},
	{
		dispatchAcceptAtomicTransferDialog: acceptAtomicTransferDialog,
		dispatchDismissAtomicTransferDialog: dismissAtomicTransferDialog,
		dispatchActivateTheme: activateTheme,
		dispatchRecordTracksEvent: recordTracksEvent,
	}
)( localize( AtomicTransferDialog ) );
