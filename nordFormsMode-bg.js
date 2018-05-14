var nordFormsMode= {
	dbug : false,
	//inited : false,
	runFormsMode : function (tab) {
		try {
			var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
			gettingActiveTab.then((tabs) => {
				if (nordFormsMode.dbug) console.log ("About to call the content script.");
				browser.tabs.sendMessage(tabs[0].id, {"task": "run", "dbug": nordFormsMode.dbug});
			});
		}
		catch (ex) {
			console.error("Talking to the content script didna work: " + ex.toString() + ".");
		}
	},
	getStatus : function (tab) {

	},
	changeIcon : function (request, sender, sendResponse) {
		if (nordFormsMode.dbug) console.log ("About to call the change the icon.");
		browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
		
			switch (request.color) {
				case "blue":
					browser.browserAction.setIcon({path: "icons/nordFormsMode-19.png", tabId: tabs[0].id});
					break;
				case "green":
					browser.browserAction.setIcon({path: "icons/nordFormsMode-good-19.png", tabId: tabs[0].id});
					break;
				case "red":
					browser.browserAction.setIcon({path: "icons/nordFormsMode-running-19.png", tabId: tabs[0].id});
					break;
				case "darkgreen":
					browser.browserAction.setIcon({path: "icons/nordFormsMode-ariaonly-19.png", tabId: tabs[0].id});
					break;
			}
		});
	} // End of changeIcon
}

browser.browserAction.onClicked.addListener(nordFormsMode.runFormsMode);
browser.runtime.onMessage.addListener(nordFormsMode.changeIcon);
