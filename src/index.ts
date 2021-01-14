export { authenticate as LiveAuthenticate } from './core/live';

export {
	EXPERIMENTAL_createDummyWin32DeviceToken,
	exchangeRpsTicketForUserToken,
	exchangeTokensForXSTSToken,
	exchangeTokenForXSTSToken
} from './core/xboxlive';

//#region typings

export type LiveCredentials = {
	email: string;
	password: string;
};

export type LiveAuthResponse = {
	token_type: 'bearer';
	expires_in: number;
	access_token: string;
	refresh_token?: string;
	scope: string;
	user_id: string;
};

export type LivePreAuthMatchedParameters = {
	PPFT: string;
	urlPost: string;
};

export type LivePreAuthResponse = {
	cookie: string;
	matches: LivePreAuthMatchedParameters;
};

export type XBLExchangeRpsTicketResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xui: Array<{
			uhs: string;
		}>;
	};
};

export type XBLExchangeTokensOptions = {
	XSTSRelyingParty?: string;
	optionalDisplayClaims?: string[];
	sandboxId?: string;
};

export type XBLExchangeTokensResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xui: Array<
			Record<string, string> & {
				xid: string;
				uhs?: string;
			}
		>;
	};
};

export type XBLDummyDeviceTokenResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xdi: {
			did: 'F50CDD8781FF4476';
			dcs: string;
		};
	};
};

/**
 * If specified, `titleToken` requires a `deviceToken` pair
 */
export type XBLTokens = {
	userTokens: string[];
	deviceToken?: string;
	titleToken?: string;
};

//#endregion
//#region public methods

//#endregion
