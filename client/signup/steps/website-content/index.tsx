import { Button, Dialog } from '@automattic/components';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, ChangeEvent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import errorIllustration from 'calypso/assets/images/customer-home/disconnected.svg';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import wpcom from 'calypso/lib/wp';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import { ValidationErrors } from 'calypso/signup/accordion-form/types';
import {
	BBE_STORE_WEBSITE_CONTENT_FILLING_STEP,
	BBE_WEBSITE_CONTENT_FILLING_STEP,
	useTranslatedPageTitles,
} from 'calypso/signup/difm/translation-hooks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import {
	initializePages,
	updateWebsiteContentCurrentIndex,
} from 'calypso/state/signup/steps/website-content/actions';
import {
	getWebsiteContent,
	getWebsiteContentDataCollectionIndex,
	isMediaUploadInProgress,
	WebsiteContentStateModel,
} from 'calypso/state/signup/steps/website-content/selectors';
import { getSiteId } from 'calypso/state/sites/selectors';
import { SiteId } from 'calypso/types';
import { sectionGenerator } from './section-generator';
import type { PageId } from 'calypso/signup/difm/constants';

import './style.scss';

const debug = debugFactory( 'calypso:difm' );

const DialogContent = styled.div`
	padding: 16px;
	p {
		font-size: 1rem;
		color: var( --studio-gray-50 );
	}
`;

const DialogButton = styled( Button )`
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 5px;
	padding: ${ ( props ) => ( props.primary ? '10px 64px' : '10px 32px' ) };
	--color-accent: #117ac9;
	--color-accent-60: #0e64a5;
	.gridicon {
		margin-left: 10px;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	width: 100%;
	height: 90vh;
	h1 {
		font-size: 24px;
	}
`;

const PagesNotAvailable = styled( LoadingContainer )`
	img {
		max-height: 200px;
		padding: 24px;
	}
`;

interface WebsiteContentStepProps {
	additionalStepData: object;
	submitSignupStep: ( step: { stepName: string } ) => void;
	goToNextStep: () => void;
	flowName: string;
	stepName: string;
	positionInFlow: string;
	pageTitles: PageId[];
	siteId: SiteId | null;
	isStoreFlow: boolean;
}

function WebsiteContentStep( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
	pageTitles,
	siteId,
	isStoreFlow,
}: WebsiteContentStepProps ) {
	const [ formErrors, setFormErrors ] = useState< ValidationErrors >( {} );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const websiteContent = useSelector( getWebsiteContent );
	const currentIndex = useSelector( getWebsiteContentDataCollectionIndex );
	const isImageUploading = useSelector( ( state ) =>
		isMediaUploadInProgress( state as WebsiteContentStateModel )
	);
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const translatedPageTitles = useTranslatedPageTitles();
	const context = isStoreFlow
		? BBE_STORE_WEBSITE_CONTENT_FILLING_STEP
		: BBE_WEBSITE_CONTENT_FILLING_STEP;

	useEffect( () => {
		if ( siteId && pageTitles && pageTitles.length > 0 ) {
			const pages = pageTitles.map( ( pageTitle ) => ( {
				id: pageTitle,
				name: translatedPageTitles[ pageTitle ],
			} ) );
			dispatch( initializePages( pages, siteId ) );
		}
	}, [ dispatch, pageTitles, siteId, translatedPageTitles ] );

	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [ dispatch, stepName ] );

	const onSubmit = () => {
		const step = {
			stepName,
			...additionalStepData,
		};
		submitSignupStep( step );
		goToNextStep();
	};

	const onChangeField = useCallback(
		( { target: { name } }: ChangeEvent< HTMLInputElement > ) => {
			setFormErrors( { ...formErrors, [ name ]: null } );
		},
		[ formErrors, setFormErrors ]
	);

	const generatedSectionsCallback = useCallback(
		() =>
			sectionGenerator( {
				translate,
				formValues: websiteContent,
				formErrors: formErrors,
				context,
				onChangeField,
			} ),
		[ translate, websiteContent, formErrors, context, onChangeField ]
	);
	const generatedSections = generatedSectionsCallback();

	const dialogButtons = [
		<DialogButton onClick={ () => setIsConfirmDialogOpen( false ) }>
			{ translate( 'Cancel' ) }
		</DialogButton>,
		<DialogButton primary onClick={ onSubmit }>
			{ translate( 'Submit' ) }
		</DialogButton>,
	];

	return (
		<>
			<Dialog
				isVisible={ isConfirmDialogOpen }
				onClose={ () => setIsConfirmDialogOpen( false ) }
				buttons={ dialogButtons }
			>
				<DialogContent>
					<h1>{ translate( 'Are you ready to submit your content?' ) }</h1>
					<p>
						{ translate(
							'Click the Submit button if you have finished adding content. We will build your new website and then email you within 4 business days with details about your new site.'
						) }
					</p>
				</DialogContent>
			</Dialog>

			<AccordionForm
				generatedSections={ generatedSections }
				onErrorUpdates={ ( errors ) => setFormErrors( errors ) }
				formValues={ websiteContent }
				currentIndex={ currentIndex }
				updateCurrentIndex={ ( currentIndex ) => {
					dispatch( updateWebsiteContentCurrentIndex( currentIndex ) );
				} }
				onSubmit={ () => setIsConfirmDialogOpen( true ) }
				blockNavigation={ isImageUploading }
			/>
		</>
	);
}

function Loader() {
	const translate = useTranslate();
	return (
		<LoadingContainer>
			<h1 className="wp-brand-font">{ translate( 'Loading your site information' ) }</h1>
			<LoadingEllipsis />
		</LoadingContainer>
	);
}

export default function WrapperWebsiteContent(
	props: {
		flowName: string;
		stepName: string;
		positionInFlow: string;
		queryObject: {
			siteSlug?: string;
			siteId?: string;
		};
	} & WebsiteContentStepProps
) {
	const { flowName, stepName, positionInFlow, queryObject } = props;
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSiteId( state, queryObject.siteSlug as string ) );

	const [ pageTitles, setPageTitles ] = useState< PageId[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isStoreFlow, setIsStoreFlow ] = useState( false );

	const headerText = translate( 'Website Content' );
	const subHeaderText = isStoreFlow
		? translate(
				'Provide content for your website build. You can add products later with the WordPress editor.'
		  )
		: translate(
				'Provide content for your website build. You will be able to edit all content later using the WordPress editor.'
		  );

	useEffect( () => {
		async function fetchSelectedPageTitles() {
			try {
				const response: {
					selected_page_titles: PageId[];
					is_website_content_submitted: boolean;
					is_store_flow: boolean;
				} = await wpcom.req.get( {
					path: `/sites/${ queryObject.siteSlug }/do-it-for-me/website-content`,
					apiNamespace: 'wpcom/v2',
				} );

				setIsLoading( false );
				setPageTitles( response.selected_page_titles );
				setIsStoreFlow( response.is_store_flow );

				if ( response.is_website_content_submitted ) {
					debug( 'Website content content already submitted, redirecting to home' );
					page( `/home/${ queryObject.siteSlug }` );
				}
			} catch ( error ) {
				setIsLoading( false );
			}
		}

		fetchSelectedPageTitles();
	}, [ queryObject.siteSlug ] );

	if ( isLoading ) {
		return <Loader />;
	}

	if ( ! ( pageTitles && pageTitles.length ) ) {
		return (
			<PagesNotAvailable>
				<img src={ errorIllustration } alt="" />
				<div>
					{ translate(
						'We could not retrieve your site information. Please {{SupportLink}}contact support{{/SupportLink}}.',
						{
							components: {
								SupportLink: (
									<a className="subtitle-link" rel="noopener noreferrer" href="/help/contact" />
								),
							},
						}
					) }
				</div>
			</PagesNotAvailable>
		);
	}

	return (
		<StepWrapper
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackHeaderText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			stepContent={
				<WebsiteContentStep
					{ ...props }
					pageTitles={ pageTitles }
					isStoreFlow={ isStoreFlow }
					siteId={ siteId }
				/>
			}
			goToNextStep={ false }
			hideFormattedHeader={ false }
			hideBack={ false }
			align="left"
			isHorizontalLayout={ true }
			isWideLayout={ true }
		/>
	);
}
