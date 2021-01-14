const {
	LiveAuthenticate,
	exchangeRpsTicketForUserToken,
	EXPERIMENTAL_createDummyWin32DeviceToken,
	exchangeTokensForXSTSToken
} = require('../src');

LiveAuthenticate({
	email: '',
	password: ''
}).then(async res => {
	const { Token: userToken } = await exchangeRpsTicketForUserToken(
		res.access_token
	);

	const {
		Token: deviceToken
	} = await EXPERIMENTAL_createDummyWin32DeviceToken();

	await exchangeTokensForXSTSToken({
		userTokens: [userToken],
		deviceToken
	})
		.then(console.log)
		.catch(console.error);
});
