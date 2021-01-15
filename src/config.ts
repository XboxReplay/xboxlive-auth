import { name, version } from '../package.json';

export default {
	request: {
		defaultLanguage: 'en-US',
		defaultUserAgent: `XboxReplay; ${name.split('/')[1]}/${version}`
	}
};
