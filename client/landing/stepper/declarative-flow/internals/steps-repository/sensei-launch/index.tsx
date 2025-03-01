import { useCallback, useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector, useDispatch as useRootDispatch } from 'react-redux';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { Progress, SenseiStepProgress } from '../components/sensei-step-progress';
import type { Step } from '../../types';

import './style.scss';

interface InstalledPlugin {
	id: string;
	slug: string;
	active: boolean;
}

const SenseiLaunch: Step = ( { navigation: { submit } } ) => {
	const { __ } = useI18n();
	const site = useSite();
	const siteId = site?.ID;
	const [ retries, setRetries ] = useState< number >( 0 );

	const selectSitePlugins = useCallback(
		( state ) => {
			return siteId ? getPlugins( state, [ siteId ] ) : [];
		},
		[ siteId ]
	);
	const dispatch = useRootDispatch();
	const plugins: InstalledPlugin[] = useSelector( selectSitePlugins );
	const expectedRetries = 15;
	const maxRetries = 40;

	useEffect( () => {
		const intervalId = setInterval( () => {
			const woothemesSensei = plugins.find( ( plugin ) => plugin.slug === 'woothemes-sensei' );
			if ( ! woothemesSensei?.active && retries < maxRetries ) {
				setRetries( retries + 1 );
				dispatch( fetchSitePlugins( siteId ) );
				return;
			}

			setRetries( -1 );
			clearInterval( intervalId );

			setTimeout( () => submit?.(), 800 );
		}, 3000 );

		return () => clearInterval( intervalId );
	}, [ plugins, dispatch, siteId, retries, submit ] );

	const progress: Progress = {
		percentage: ( retries * 100 ) / expectedRetries,
		title: __( 'Installing Sensei' ),
	};

	if ( retries > expectedRetries / 2 || retries < 0 ) {
		progress.title = __( 'Setting up your new Sensei Home' );
	}

	// Slow down progress bar increase during the last steps.
	if ( retries > ( expectedRetries * 2 ) / 3 ) {
		const slowPercentage = 66.6 + ( retries * 15 ) / expectedRetries;
		progress.percentage = slowPercentage > 90 ? 90 : slowPercentage;
	} else if ( retries < 0 ) {
		progress.percentage = 100;
	}

	return (
		<SenseiStepContainer stepName="senseiSetup" recordTracksEvent={ recordTracksEvent }>
			<SenseiStepProgress progress={ progress } />
		</SenseiStepContainer>
	);
};

export default SenseiLaunch;
