import { PatternRenderer } from '@automattic/block-renderer';
import { Button } from '@automattic/components';
import classnames from 'classnames';
import EmptyPattern from './empty-pattern';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-list-renderer.scss';

interface PatternListItemProps {
	pattern: Pattern;
	className: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

interface PatternListRendererProps {
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	activeClassName: string;
	emptyPatternText?: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PLACEHOLDER_HEIGHT = 100;
const MAX_HEIGHT_FOR_100VH = 500;

const PatternListItem = ( { pattern, className, onSelect }: PatternListItemProps ) => {
	return (
		<Button
			className={ className }
			title={ pattern.category }
			onClick={ () => onSelect( pattern ) }
		>
			<PatternRenderer
				patternId={ encodePatternId( pattern.id ) }
				viewportWidth={ 1060 }
				minHeight={ PLACEHOLDER_HEIGHT }
				maxHeightFor100vh={ MAX_HEIGHT_FOR_100VH }
			/>
		</Button>
	);
};

const PatternListRenderer = ( {
	patterns,
	selectedPattern,
	activeClassName,
	emptyPatternText,
	onSelect,
}: PatternListRendererProps ) => {
	return (
		<>
			{ emptyPatternText && (
				<EmptyPattern
					className={ classnames( 'pattern-list-renderer__pattern-list-item', {
						[ activeClassName ]: ! selectedPattern,
					} ) }
					text={ emptyPatternText }
					onSelect={ () => onSelect( null ) }
				/>
			) }
			{ patterns.map( ( pattern, index ) => (
				<PatternListItem
					key={ `${ index }-${ pattern.id }` }
					pattern={ pattern }
					className={ classnames( 'pattern-list-renderer__pattern-list-item', {
						[ activeClassName ]: pattern.id === selectedPattern?.id,
					} ) }
					onSelect={ onSelect }
				/>
			) ) }
		</>
	);
};

export default PatternListRenderer;
