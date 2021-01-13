//#region typings

export type LiveAuthenticateResponse = {
	token_type: 'bearer';
	expires_in: number;
	access_token: string;
	refresh_token?: string;
	scope: string;
	user_id: string;
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

/**
 * If specified, `titleToken` requires a `deviceToken` pair
 */
export type XBLTokens = {
	userTokens: string[];
	deviceToken?: string;
	titleToken?: string;
};

//#endregion
