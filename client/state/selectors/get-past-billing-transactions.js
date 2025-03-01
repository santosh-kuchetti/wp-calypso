import { get } from 'lodash';
import getBillingTransactions from 'calypso/state/selectors/get-billing-transactions';

import 'calypso/state/billing-transactions/init';

/**
 * Returns all past billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @returns {?Array}          An array of past transactions
 */
export default function getPastBillingTransactions( state ) {
	return get( getBillingTransactions( state ), 'past', null );
}
