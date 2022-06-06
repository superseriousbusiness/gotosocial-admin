"use strict";

const Promise = require("bluebird");
const React = require("react");
const oauthLib = require("./oauth");

module.exports = function Auth({setOauth}) {
	const [ instance, setInstance ] = React.useState("");

	React.useEffect(() => {
		let isStillMounted = true;
		// check if current domain runs an instance
		let thisUrl = new URL(window.location.origin);
		thisUrl.pathname = "/api/v1/instance";
		fetch(thisUrl.href)
			.then((res) => res.json())
			.then((json) => {
				if (json && json.uri) {
					if (isStillMounted) {
						setInstance(json.uri);
					}
				}
			})
			.catch((e) => {
				console.error("caught", e);
				// no instance here
			});
		return () => {
			// cleanup function
			isStillMounted = false;
		};
	}, []);

	function doAuth() {
		if (typeof instance === "undefined" || instance === null) {
			return;
		}

		let instanceUri = instance.trim();
		if (!instanceUri.toLowerCase().startsWith("https://")) {
			let inputUri = null;
			try {
				inputUri = new URL(instanceUri);
				inputUri.protocol = "https";
			} catch (e) {
				inputUri = new URL("https://"+instanceUri);
			}

			if (inputUri instanceof URL) {
				instanceUri = inputUri.toString();
			}
		}
		
		let oauth = oauthLib({
			instance: instance,
			client_name: "GoToSocial Admin Panel",
			scope: ["admin"],
			website: window.location.href
		});
		setOauth(oauth);

		return Promise.try(() => {
			return oauth.register();
		}).then(() => {
			return oauth.authorize();
		});
	}

	function updateInstance(e) {
		if (e.key == "Enter") {
			doAuth();
		} else {
			setInstance(e.target.value);
		}
	}

	return (
		<section className="login">
			<h1>OAUTH Login:</h1>
			<form onSubmit={(e) => e.preventDefault()}>
				<label htmlFor="instance">Instance: </label>
				<input value={instance} onChange={updateInstance} id="instance" placeholder="https://gts.instance.xyz"/>
				<button onClick={doAuth}>Authenticate</button>
			</form>
		</section>
	);
};
