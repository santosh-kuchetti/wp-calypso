import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React, { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { SenseiStepProgress } from '../components/sensei-step-progress';
import PurposeItem from './purpose-item';
import type { Step } from '../../types';
import './style.scss';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

export const purposeOptions = [
	{
		id: 'sell_courses',
		label: __( 'Sell courses and generate income' ),
		plugin: { slug: 'woocommerce', id: 'woocommerce/woocommerce' },
	},
	{
		id: 'provide_certification',
		label: __( 'Provide certification' ),
		plugin: {
			slug: 'sensei-certificates',
			id: 'sensei-certificates/woothemes-sensei-certificates',
		},
	},
	{
		id: 'educate_students',
		label: __( 'Educate students' ),
		description: null,
	},
	{
		id: 'train_employees',
		label: __( 'Train employees' ),
		description: null,
	},
];

type PurposeFormState = {
	selected: string[];
	other: string;
};

const SenseiPurpose: Step = ( { navigation: { submit } } ) => {
	const [ progress, setProgress ] = useState< number >( 0 );

	// Stall for a few seconds while the atomic transfer is going on.
	useEffect( () => {
		const tick = async () => {
			if ( progress < 110 ) {
				await wait( 1500 );
				setProgress( ( progress ) => progress + 33 );
			}
		};
		tick();
	}, [ progress ] );

	const waiting = progress < 110;

	const [ { selected, other }, setPurpose ] = useState< PurposeFormState >( {
		selected: [],
		other: '',
	} );

	const isEmpty = ! selected.length;

	const toggleItem = ( id: string ) => {
		const wasSelected = selected.includes( id );
		const newSelection = wasSelected
			? selected.filter( ( item ) => item !== id )
			: [ id, ...selected ];
		setPurpose( ( purposeFormState ) => ( {
			...purposeFormState,
			selected: newSelection,
		} ) );
	};

	const submitPage = async () => {
		submit?.();
	};

	const title = __( 'Choose the purpose of your site' );

	return (
		<SenseiStepContainer
			stepName="senseiPurpose"
			className="sensei-step-green"
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					headerText={ title }
					subHeaderText={ __(
						'Select your goals for offering courses, and we will help you set everything up.'
					) }
				></FormattedHeader>
			}
		>
			{ waiting && (
				<SenseiStepProgress
					progress={ {
						percentage: progress,
						title: __( 'Order was completed successfully' ),
						subtitle: __( 'Preparing your new site' ),
					} }
				/>
			) }
			{ ! waiting && (
				<>
					<DocumentHead title={ title } />
					<div className="sensei-setup-wizard__purpose-container">
						<ul className="sensei-setup-wizard__purpose-list">
							{ purposeOptions.map( ( { id, label, description } ) => (
								<PurposeItem
									key={ id }
									label={ label }
									checked={ selected.includes( id ) }
									onToggle={ () => toggleItem( id ) }
								>
									{ description && (
										<span className="sensei-setup-wizard__purpose-description">
											{ description }
										</span>
									) }
								</PurposeItem>
							) ) }

							<PurposeItem
								label={ __( 'Other' ) }
								checked={ selected.includes( 'other' ) }
								onToggle={ () => toggleItem( 'other' ) }
							>
								<TextControl
									className="sensei-setup-wizard__text-control"
									value={ other }
									placeholder={ __( 'Description' ) }
									onChange={ ( value ) =>
										setPurpose( ( formState ) => ( {
											...formState,
											other: value,
										} ) )
									}
								/>
							</PurposeItem>
						</ul>
						<div className="sensei-setup-wizard__actions sensei-setup-wizard__actions--full-width">
							<button disabled={ isEmpty } onClick={ submitPage } className="sensei-button">
								{ __( 'Continue' ) }
							</button>
						</div>
					</div>
				</>
			) }
		</SenseiStepContainer>
	);
};

export default SenseiPurpose;
