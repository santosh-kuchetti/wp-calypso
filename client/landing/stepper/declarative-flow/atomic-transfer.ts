import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';
import WaitForAtomic from './internals/steps-repository/wait-for-atomic';
import ErrorStep from './internals/steps-repository/error-step';
import ProcessingStep, { ProcessingResult } from './internals/steps-repository/processing-step';

const atomicTransfer: Flow = {
	name: 'atomic-transfer',
	useSteps() {
		return [
			{ slug: 'waitForAtomic', component: WaitForAtomic },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'error', component: ErrorStep },
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, 'free-post-setup', flowName, currentStep );
			console.log( currentStep, providedDependencies, params );

			switch ( currentStep ) {
				case 'processing':
					console.log( providedDependencies?.finishedWaitingForAtomic );
					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return window.location.replace( `/home/${ providedDependencies?.siteSlug }` );
					}

					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					return navigate( 'initiate' );
				case 'waitForAtomic':
					return navigate( 'processing' );
				case 'initiate':
					return navigate( 'waitForAtomic' );
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default atomicTransfer;
