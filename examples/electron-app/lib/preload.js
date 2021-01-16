const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('XRBridge', {
	send: data => {
		ipcRenderer.send('request', data);
	},
	receive: (channel, fn) => {
		if (channel === 'response') {
			ipcRenderer.on(channel, (_, ...args) => fn(...args));
		}
	}
});
