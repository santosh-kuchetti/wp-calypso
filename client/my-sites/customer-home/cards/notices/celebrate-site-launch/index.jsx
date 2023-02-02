import { ConfettiAnimation, Gridicon } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import launchedIllustration from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import {
	NOTICE_CELEBRATE_SITE_LAUNCH,
	NOTICE_CELEBRATE_SITE_SETUP_COMPLETE,
} from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';
import { requestSiteChecklistTaskUpdate } from 'calypso/state/checklist/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import getSiteTaskList from 'calypso/state/selectors/get-site-task-list';
import isSiteChecklistComplete from 'calypso/state/selectors/is-site-checklist-complete';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const CelebrateSiteLaunch = ( { isSiteSetupComplete, pendingSiteSetupTasks, siteId } ) => {
	const [ modalIsOpen, setModalIsOpen ] = useState( true );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );

	const skipSiteSetup = () => {
		// Mark all pending tasks as completed.
		pendingSiteSetupTasks.forEach( ( task ) =>
			dispatch( requestSiteChecklistTaskUpdate( siteId, task.id ) )
		);

		// Dismisses the site setup complete celebratory notice.
		dispatch(
			savePreference(
				`dismissible-card-${ NOTICE_CELEBRATE_SITE_SETUP_COMPLETE }-${ siteId }`,
				true
			)
		);
	};

	return (
		<>
			<CelebrateNotice
				actionText={
					isSiteSetupComplete ? translate( "Show me what's next" ) : translate( 'Show site setup' )
				}
				description={
					isSiteSetupComplete
						? translate(
								"Don't forget to share your hard work with everyone. Keep up the momentum with some guidance on what to do next."
						  )
						: translate(
								"Don't forget to share your hard work with everyone. Then keep working through your site setup list."
						  )
				}
				noticeId={ NOTICE_CELEBRATE_SITE_LAUNCH }
				title={ translate( 'You launched your site!' ) }
				illustration={ launchedIllustration }
				showSkip={ true }
				skipText={ isSiteSetupComplete ? translate( 'Dismiss' ) : translate( 'Skip site setup' ) }
				onSkip={ ! isSiteSetupComplete ? skipSiteSetup : null }
				tracksEventExtras={ { is_site_setup_complete: isSiteSetupComplete } }
			/>

			{ modalIsOpen && (
				<Modal
					onRequestClose={ () => setModalIsOpen( false ) }
					// contentLabel={ label }
					// overlayClassName={ backdropClassName } // We use flex here which react-modal doesn't
					className="launched__modal"
					// htmlOpenClassName="ReactModal__Html--open"
					// role="dialog"
					// shouldCloseOnEsc
				>
					<ConfettiAnimation />
					<div className="launched__modal-content">
						<div className="launched__modal-text">
							<h1 className="launched__modal-heading">
								{ translate( 'Congrats, your site is live!' ) }
							</h1>
							<p className="launched__modal-body">
								{ translate(
									'Your site is live. Now you can head over to your site and share it with the world or keep working on it.'
								) }
							</p>
						</div>
						<div className="launched__modal-actions">
							<div className="launched__modal-site">
								<p className="launched__modal-domain">totoroadventures.wordpress.com</p>

								<Button href={ siteSlug } isPrimary>
									{ translate( 'View Site' ) }
								</Button>
							</div>
							<Button className="launched__modal-customize">
								<Gridicon icon="domains" size={ 16 } />
								<span>Customize your domain</span>
							</Button>
						</div>
					</div>
				</Modal>
			) }
		</>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isSiteSetupComplete = isSiteChecklistComplete( state, siteId );
	let pendingSiteSetupTasks = [];
	if ( ! isSiteSetupComplete ) {
		const tasks = getSiteTaskList( state, siteId ).getAll();
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		pendingSiteSetupTasks = tasks.filter( ( task ) => ! task.isCompleted );
	}
	return {
		isSiteSetupComplete,
		pendingSiteSetupTasks,
		siteId,
	};
} )( CelebrateSiteLaunch );
