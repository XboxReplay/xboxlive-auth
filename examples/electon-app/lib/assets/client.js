(() => {
	const responseContainer = document.getElementById('response');
	const signInButton = document.getElementById('signin');
	const signInText = 'Sign in with Xbox Live';
	const signInLoadingText = 'Signin in, please wait';

	signInButton.innerText = signInText;
	signInButton.addEventListener('click', () => {
		window.XRBridge.send({ action: 'getAuthorizeUrl' });
	});

	window.XRBridge.receive('response', data => {
		const { action, details } = data;

		if (action === 'getAuthorizeUrl') {
			signInButton.setAttribute('disabled', 'disabled');
			signInButton.innerText = signInLoadingText;
			window.XRBridge.send({
				action: 'exchangeToken',
				details: { rpsTicket: details.access_token }
			});

			return;
		}

		if (action === 'exchangeToken') {
			signInButton.removeAttribute('disabled');
			signInButton.innerText = signInText;

			if (details.success === true) {
				signInButton.style.display = 'none';
				responseContainer.innerHTML = `
					<p>
						Welcome, <strong>${details.response.DisplayClaims.xui[0].gtg}<strong>!
					</p>
				`;
			} else
				responseContainer.innerHTML = `<p>Something went wrong...</p>`;
		}
	});
})();
