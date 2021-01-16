const { authenticate, xbl, live } = require('../src');

(async () => {
	const dummyDeviceToken = await xbl.EXPERIMENTAL_createDummyWin32DeviceToken();
	console.log(dummyDeviceToken);
	authenticate(
		process.env.XBL_TEST_EMAIL || '',
		process.env.XBL_TEST_PASSWORD || '',
		{
			deviceToken: dummyDeviceToken.Token,
			optionalDisplayClaims: ['mgt'],
			raw: false
		}
	)
		.then(console.log)
		.catch(console.error);
})();
