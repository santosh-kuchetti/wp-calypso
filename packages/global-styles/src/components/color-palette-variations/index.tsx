import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { useState, useMemo, useContext } from 'react';
import { COLOR_PALETTE_VARIATIONS } from '../../variations';
import ColorPaletteVariationPreview from './color-palette-variation-preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface ColorPaletteProps {
	colorPaletteVariation: GlobalStylesObject;
	isActive: boolean;
	selectColorPaletteVariation: () => void;
}

const INITIAL_INDEX = -1;

const ColorPaletteVariation = ( {
	colorPaletteVariation,
	isActive,
	selectColorPaletteVariation,
}: ColorPaletteProps ) => {
	const { base } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		return {
			user: colorPaletteVariation,
			base,
			merged: mergeBaseAndUserConfigs( base, colorPaletteVariation ),
		};
	}, [ colorPaletteVariation, base ] );

	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			selectColorPaletteVariation();
		}
	};

	return (
		<GlobalStylesContext.Provider value={ context }>
			<div
				className={ classnames( 'global-styles-variation__item', {
					'is-active': isActive,
				} ) }
				role="button"
				onClick={ selectColorPaletteVariation }
				onKeyDown={ selectOnEnter }
				tabIndex={ 0 }
				aria-current={ isActive }
			>
				<div className="global-styles-variation__item-preview">
					<ColorPaletteVariationPreview />
				</div>
			</div>
		</GlobalStylesContext.Provider>
	);
};

const ColorPaletteVariations = () => {
	const [ selectedIndex, setSelectedIndex ] = useState( INITIAL_INDEX );
	const { base, setUserConfig } = useContext( GlobalStylesContext );

	const selectVariation = ( variation: GlobalStylesObject ) => {
		setUserConfig( ( current: GlobalStylesObject ) =>
			mergeBaseAndUserConfigs( current, variation )
		);
	};

	const selectColorPaletteVariation = (
		colorPaletteVariation: GlobalStylesObject,
		index: number
	) => {
		setSelectedIndex( index );
		selectVariation( colorPaletteVariation );
	};

	return (
		<div className="color-palette-variations">
			<ColorPaletteVariation
				key="base"
				colorPaletteVariation={ base }
				isActive={ selectedIndex === INITIAL_INDEX }
				selectColorPaletteVariation={ () => selectColorPaletteVariation( base, INITIAL_INDEX ) }
			/>
			{ COLOR_PALETTE_VARIATIONS.map( ( colorPaletteVariation, index ) => (
				<ColorPaletteVariation
					key={ index }
					colorPaletteVariation={ colorPaletteVariation }
					isActive={ selectedIndex === index }
					selectColorPaletteVariation={ () =>
						selectColorPaletteVariation( colorPaletteVariation, index )
					}
				/>
			) ) }
		</div>
	);
};

export default ColorPaletteVariations;
