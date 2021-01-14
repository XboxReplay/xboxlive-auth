import { name, version } from '../package.json';

export default {
	request: {
		defaultLanguage: 'en-US',
		defaultUserAgent: [
			`Mozilla/5.0 (XboxReplay; ${name.split('/')[1]}/${version})`,
			'AppleWebKit/537.36 (KHTML, like Gecko)',
			'Chrome/71.0.3578.98 Safari/537.36'
		].join(' ')
	}
};
