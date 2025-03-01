import { delay } from 'lodash';
import { ATOMIC_TRANSFER_REQUEST } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAtomicTransfer, setAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSite } from 'calypso/state/sites/actions';

export const requestTransfer = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/transfers/latest`,
			apiVersion: '1.2',
		},
		action
	);

export const receiveTransfer =
	( { siteId }, transfer ) =>
	( dispatch ) => {
		dispatch( setAtomicTransfer( siteId, transfer ) );

		const status = transfer.status;
		if ( status !== transferStates.ERROR && status !== transferStates.COMPLETED ) {
			delay( () => dispatch( fetchAtomicTransfer( siteId ) ), 10000 );
		}

		if ( status === transferStates.COMPLETED ) {
			dispatch(
				recordTracksEvent( 'calypso_atomic_transfer_complete', {
					transfer_id: transfer.atomic_transfer_id,
				} )
			);

			// Update the now-atomic site to ensure plugin page displays correctly.
			dispatch( requestSite( siteId ) );
		}
	};

registerHandlers( 'state/data-layer/wpcom/sites/atomic/transfer/index.js', {
	[ ATOMIC_TRANSFER_REQUEST ]: [
		dispatchRequest( {
			fetch: requestTransfer,
			onSuccess: receiveTransfer,
			onError: () => {},
		} ),
	],
} );
