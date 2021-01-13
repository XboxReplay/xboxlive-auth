/**
 * PLEASE NOTE THAT THIS CODE IS NOT PRODUCTION READY
 */

(() => {
	document.getElementById('signin').addEventListener('click', () => {
		openAuthorizeUrl();
	});

	const openAuthorizeUrl = () => {
		const remote = require('electron').remote;
		const BrowserWindow = remote.BrowserWindow;
		const win = new BrowserWindow({
			height: 600,
			width: 800
		});

		// XboxLiveAuth.getAuthorizeUrl();

		win.loadURL(
			'https://login.live.com/oauth20_authorize.srf?client_id=0000000048093EE3&redirect_uri=https://login.live.com/oauth20_desktop.srf&response_type=token&display=touch&scope=service::user.auth.xboxlive.com::MBI_SSL'
		);

		win.webContents.on('did-navigate', function (_, url) {
			const h = new URL(url).hash || null;

			if (h === null) {
				return;
			}

			const parts = new URLSearchParams(h.slice(1));
			const obj = {};

			for (const p of parts) {
				obj[p[0]] = p[1];
			}

			document.getElementById('response').innerText = JSON.stringify(
				obj,
				null,
				4
			);

			win.close();
		});
	};
})();
