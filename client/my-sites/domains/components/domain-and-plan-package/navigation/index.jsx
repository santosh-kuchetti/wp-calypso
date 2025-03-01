import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function DomainAndPlanPackageNavigation( props ) {
	const translate = useTranslate();

	const goBack = () => {
		window.history.go( -1 );
	};

	const step = props.step ? props.step : 1;

	return (
		<div className="domain-and-plan-package-navigation">
			<div className="domain-and-plan-package-navigation__back">
				<Button borderless="true" onClick={ goBack }>
					<Gridicon icon="chevron-left" />
					<span>{ translate( 'Back' ) }</span>
				</Button>
			</div>
			<ol className="domain-and-plan-package-navigation__steps">
				<li className={ step === 1 ? 'domain-and-plan-package-navigation__active' : '' }>
					{ step === 2 && <Gridicon icon="checkmark" /> }
					{ translate( 'Select a domain' ) }
					<Gridicon icon="chevron-right" />
				</li>
				<li className={ step === 2 ? 'domain-and-plan-package-navigation__active' : '' }>
					{ translate( 'Select a plan' ) }
					<Gridicon icon="chevron-right" />
				</li>
				<li>{ translate( 'Complete your purchase' ) }</li>
			</ol>
		</div>
	);
}
