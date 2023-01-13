import { Button } from '@automattic/components';
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { header, footer, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { NavigationButtonAsItem } from './navigator-buttons';
import NavigatorHeader from './navigator-header';

interface Props {
	onSelect: ( name: string ) => void;
	onContinueClick: () => void;
}

const ScreenMain = ( { onSelect, onContinueClick }: Props ) => {
	const translate = useTranslate();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Let’s get creative' ) }
				description={ translate(
					'Use our library of styles and patterns to design your own theme.'
				) }
			/>
			<div className="screen-container__body">
				<ItemGroup>
					<NavigationButtonAsItem
						path="/header"
						icon={ header }
						aria-label={ translate( 'Choose a header' ) }
						onClick={ () => onSelect( 'header' ) }
					>
						<span className="pattern-layout__list-item-text">
							{ translate( 'Choose a header' ) }
						</span>
					</NavigationButtonAsItem>
					<Divider />
					<NavigationButtonAsItem
						path="/footer"
						icon={ footer }
						aria-label={ translate( 'Choose a footer' ) }
						onClick={ () => onSelect( 'footer' ) }
					>
						<span className="pattern-layout__list-item-text">
							{ translate( 'Choose a footer' ) }
						</span>
					</NavigationButtonAsItem>
					<Divider />
					<NavigationButtonAsItem
						path="/homepage"
						icon={ layout }
						aria-label={ translate( 'Design your homepage' ) }
						onClick={ () => onSelect( 'homepage' ) }
					>
						<span className="pattern-layout__list-item-text">
							{ translate( 'Design your homepage' ) }
						</span>
					</NavigationButtonAsItem>
				</ItemGroup>
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" onClick={ onContinueClick } primary>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenMain;
