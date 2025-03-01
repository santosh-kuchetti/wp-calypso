import { Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import CardHeading from 'calypso/components/card-heading';
import iconGitHub from '../github.svg';

// todo - just a placeholder for now as the implementation of this
// component falls under another PR.
export const GithubConnectCard = () => {
	const { __ } = useI18n();
	return (
		<Card className="github-hosting-card">
			<img className="github-hosting-icon" src={ iconGitHub } alt="" />
			<CardHeading>{ __( 'Connect Branch' ) }</CardHeading>
		</Card>
	);
};
