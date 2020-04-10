const email = process.env.XBL_EMAIL || '';
const password = process.env.XBL_PASSWORD || '';
const { authenticate } = require('../src');

const successCase = () =>
	authenticate(email, password)
		.then(response => {
			const match = {
				userXUID: 'string',
				userHash: 'string',
				XSTSToken: 'string',
				expiresOn: 'string'
			};

			for (const key of Object.keys(match)) {
				if (typeof response[key] !== match[key]) {
					throw new Error('successCase - FAILED');
				}
			}
		})
		.catch(err => {
			console.error(err);
			process.exit(1);
		});

const failureCase_credentials = () =>
	authenticate('fake@xboxreplay.net', 'xxxxxx')
		.then(() => {
			console.error(new Error('failureCase_credentials - FAILED'));
			process.exit(1);
		})
		.catch(() => {});

const failureCase_XSTSRelyingParty = () =>
	authenticate(email, password, {
		XSTSRelyingParty: 'https://xsts.xboxreplay.net/'
	})
		.then(() => {
			console.error(new Error('failureCase_XSTSRelyingParty - FAILED'));
			process.exit(1);
		})
		.catch(() => {});

Promise.all([
	successCase(),
	failureCase_credentials(),
	failureCase_XSTSRelyingParty()
]).then(() => {
	process.exit(0);
});
