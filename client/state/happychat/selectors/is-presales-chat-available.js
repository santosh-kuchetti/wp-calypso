import 'calypso/state/happychat/init';

/**
 * Returns if presales chat is available.
 *
 * @param   {object}  state  Global state tree
 * @returns {boolean}        true, when presales is available
 */
export default function isPresalesChatAvailable( state ) {
	return state.happychat?.user?.availability?.presale ?? false;
}
