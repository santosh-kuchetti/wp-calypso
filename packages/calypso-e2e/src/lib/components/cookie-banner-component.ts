import { Page, Locator } from 'playwright';

const selectors = {
	acceptCookie: '.a8c-cookie-banner__ok-button',
};

/**
 * Represents the cookie banner shown on pages when not logged in.
 */
export class CookieBannerComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page } page The underlying page.
	 * @param {Locator} editor Locator or FrameLocator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Accept and clear the cookie notice.
	 */
	async acceptCookie(): Promise< void > {
		const locator = this.editor.locator( selectors.acceptCookie );

		// Whether the cookie banner appears is not deterministic.
		// If it is not present, exit early.
		if ( ( await locator.count() ) === 0 ) {
			return;
		}

		await locator.click();
	}
}
