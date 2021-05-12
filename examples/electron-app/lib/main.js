const { app, BrowserWindow, ipcMain } = require('electron');
const { live, xbl } = require('@xboxreplay/xboxlive-auth');
const { join } = require('path');
const { URL } = require('url');

let mainWindow = null;
let authenticateWindow = null;

const createInitialWindow = () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: true,
			preload: join(__dirname, 'preload.js')
		}
	});

	mainWindow.loadFile(`${__dirname}/assets/index.html`);
};

const createAuthorizeWindow = () => {
	authenticateWindow = new BrowserWindow({
		width: 482,
		height: 640,
		webPreferences: {
			contextIsolation: true
		}
	});

	authenticateWindow.loadURL(live.getAuthorizeUrl());
	authenticateWindow.webContents.on('will-redirect', (_, url) => {
		const urlInstance = new URL(url);

		if (urlInstance.pathname === '/oauth20_desktop.srf') {
			const hash = urlInstance.hash.slice(1);
			const response = {};

			for (const part of new URLSearchParams(hash)) {
				if (part[0] === 'expires_in') {
					response[part[0]] = Number(part[1]);
				} else response[part[0]] = part[1];
			}

			authenticateWindow.close();
			authenticateWindow = null;

			mainWindow.webContents.send('response', {
				action: 'getAuthorizeUrl',
				details: response
			});
		}
	});
};

app.whenReady().then(createInitialWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	const hasWindows = BrowserWindow.getAllWindows().length !== 0;
	if (hasWindows === false) createInitialWindow();
});

ipcMain.on('request', async (_, data) => {
	const { action, details } = data;

	if (action === 'getAuthorizeUrl') {
		createAuthorizeWindow();
		return;
	}

	if (action === 'exchangeToken') {
		const { rpsTicket } = details;

		let userTokenResponse = null;
		let XSTSTokenResponse = null;

		let success = false;
		let response = null;

		userTokenResponse = await xbl
			.exchangeRpsTicketForUserToken(rpsTicket, 't')
			.catch(_ => null);

		if (userTokenResponse !== null) {
			XSTSTokenResponse = await xbl
				.exchangeTokenForXSTSToken(userTokenResponse.Token)
				.catch(_ => null);
		}

		success = XSTSTokenResponse !== null;

		if (success === true) {
			response = XSTSTokenResponse;
		}

		mainWindow.webContents.send('response', {
			action: 'exchangeToken',
			details: { success, response }
		});
	}
});
