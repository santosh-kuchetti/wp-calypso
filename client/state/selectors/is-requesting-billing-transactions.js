import { get } from 'lodash';

import 'calypso/state/billing-transactions/init';

/**
 * Returns true if we are currently making a request to get the billing transactions.
 * False otherwise.
 *
 * @param  {Object}   state  Global state tree
 * @returns {boolean}         Whether the billing transactions are being requested
 */
export default function isRequestingBillingTransactions( state ) {
	return get( state, 'billingTransactions.requesting', false );
}
