import { CardHeader, Button, Flex } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { closeSmall, chevronUp, lineSolid, commentContent, page, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useCallback } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { HELP_CENTER_STORE } from '../stores';
import type { Header } from '../types';

export function ArticleTitle() {
	const location = useLocation();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const title = location.state?.title || params.get( 'title' ) || '';

	return (
		<>
			<Icon icon={ page } />
			<span className="help-center-header__article-title">{ title }</span>
		</>
	);
}

const SupportModeTitle = () => {
	const { __ } = useI18n();
	const { search } = useLocation();
	const params = new URLSearchParams( search );

	const mode = params.get( 'mode' );
	switch ( mode ) {
		case 'CHAT':
			return (
				<>
					<Icon icon={ commentContent } />
					{ __( 'Start live chat', __i18n_text_domain__ ) }
				</>
			);
		case 'EMAIL': {
			return <>{ __( 'Send us an email', __i18n_text_domain__ ) }</>;
		}
		case 'FORUM': {
			return <>{ __( 'Ask in our community forums', __i18n_text_domain__ ) }</>;
		}
		default: {
			return <>{ __( 'Help Center', __i18n_text_domain__ ) }</>;
		}
	}
};

const HelpCenterHeader = ( { isMinimized = false, onMinimize, onMaximize, onDismiss }: Header ) => {
	const unreadCount = useSelect( ( select ) => select( HELP_CENTER_STORE ).getUnreadCount() );
	const classNames = classnames( 'help-center__container-header' );
	const { __ } = useI18n();
	const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount;

	const handleClick = useCallback(
		( event ) => {
			if ( isMinimized && event.target === event.currentTarget ) {
				onMaximize?.();
			}
		},
		[ isMinimized, onMaximize ]
	);

	return (
		<CardHeader className={ classNames }>
			<Flex onClick={ handleClick }>
				<p
					id="header-text"
					className="help-center-header__text"
					onClick={ handleClick }
					onKeyUp={ handleClick }
					role="presentation"
				>
					{ isMinimized ? (
						<Switch>
							<Route path="/" exact>
								{ __( 'Help Center', __i18n_text_domain__ ) }
							</Route>
							<Route path="/contact-options">
								{ __( 'Contact Options', __i18n_text_domain__ ) }
							</Route>
							<Route path="/inline-chat">{ __( 'Live Chat', __i18n_text_domain__ ) }</Route>
							<Route path="/contact-form" component={ SupportModeTitle }></Route>
							<Route path="/post" component={ ArticleTitle }></Route>
							<Route path="/success">{ __( 'Message Submitted', __i18n_text_domain__ ) }</Route>
						</Switch>
					) : (
						__( 'Help Center', __i18n_text_domain__ )
					) }
					{ isMinimized && unreadCount > 0 && (
						<span className="help-center-header__unread-count">{ formattedUnreadCount }</span>
					) }
				</p>
				<div>
					{ isMinimized ? (
						<Button
							className="help-center-header__maximize"
							label={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
							icon={ chevronUp }
							tooltipPosition="top left"
							onClick={ onMaximize }
							onTouchStart={ onMaximize }
						/>
					) : (
						<Button
							className="help-center-header__minimize"
							label={ __( 'Minimize Help Center', __i18n_text_domain__ ) }
							icon={ lineSolid }
							tooltipPosition="top left"
							onClick={ onMinimize }
							onTouchStart={ onMinimize }
						/>
					) }

					<Button
						className="help-center-header__close"
						label={ __( 'Close Help Center', __i18n_text_domain__ ) }
						tooltipPosition="top left"
						icon={ closeSmall }
						onClick={ onDismiss }
						onTouchStart={ onDismiss }
					/>
				</div>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterHeader;
