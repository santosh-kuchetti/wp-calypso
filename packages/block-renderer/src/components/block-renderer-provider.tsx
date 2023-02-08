import { useMemo } from 'react';
import useBlockRendererSettings from '../hooks/use-block-renderer-settings';
import BlockRendererContext from './block-renderer-context';

export interface Props {
	siteId: number | string;
	stylesheet?: string;
	children: JSX.Element;
}

const useBlockRendererContext = ( siteId: number | string, stylesheet: string ) => {
	const { data: settings } = useBlockRendererSettings( siteId, stylesheet );

	const context = useMemo( () => {
		return {
			isReady: !! settings,
			settings: settings ?? {},
		};
	}, [ settings ] );

	return context;
};

const BlockRendererProvider = ( { siteId, stylesheet = '', children }: Props ) => {
	const context = useBlockRendererContext( siteId, stylesheet );

	if ( ! context.isReady ) {
		return null;
	}

	return (
		<BlockRendererContext.Provider value={ context }>{ children }</BlockRendererContext.Provider>
	);
};

export default BlockRendererProvider;
