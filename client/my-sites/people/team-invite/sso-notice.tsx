import { useTranslate } from 'i18n-calypso';
import { ReactChild, ReactChildren } from 'react';
import { useDispatch } from 'react-redux';
import FeatureExample from 'calypso/components/feature-example';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { activateModule } from 'calypso/state/jetpack/modules/actions';

interface Props {
	siteId: number;
	children?: ReactChild | ReactChildren;
}
export default function SsoNotice( props: Props ) {
	const _ = useTranslate();
	const dispatch = useDispatch();

	const { siteId, children } = props;

	function enableSSO() {
		dispatch( activateModule( siteId, 'sso' ) );
	}

	return (
		<div className="invite-people__action-required">
			<Notice
				status="is-warning"
				showDismiss={ false }
				text={ _( 'Inviting users requires WordPress.com sign in' ) }
			>
				<NoticeAction onClick={ enableSSO }>{ _( 'Enable' ) }</NoticeAction>
			</Notice>
			<FeatureExample>{ children }</FeatureExample>
		</div>
	);
}
