import {
	IAuthUserResponse as AuthUserResponse,
	IUserCredentials as UserCredentials,
	IExchangeUserTokenResponse as ExchangeUserTokenResponse,
	IExchangeRPSTicketResponse as ExchangeRPSTicketResponse
} from './__typings__';

export namespace XboxLiveAuth {
	export { AuthUserResponse as IAuthUserResponse };
	export { UserCredentials as IUserCredentials };
	export { ExchangeUserTokenResponse as IExchangeUserTokenResponse };
	export { ExchangeRPSTicketResponse as IExchangeRPSTicketResponse };

	export function exchangeAccessTokenForUserToken(
		accessToken: string
	): Promise<IExchangeRPSTicketResponse>;

	export function exchangeUserTokenForXSTSIdentity(
		userToken: string,
		XSTSRelyingParty: string
	): Promise<IExchangeRPSTicketResponse>;

	export function authenticate(
		email: string,
		password: string
	): Promise<IAuthUserResponse>;
}
