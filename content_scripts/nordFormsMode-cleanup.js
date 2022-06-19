if (typeof (nordFormsModeBML) == "undefined") {
	var nordFormsModeBML = {};
}

nordFormsModeBML = {
	reset : function () {
		//removeMessageListener("nordFormsMode@nordburg.ca:reset", listener);
		var spans = document.querySelectorAll("span.nordFormsModeStyle");
		if (nordFormsModeBML.dbug) console.log ("Resetting " + spans.length + " spans.");
		for (var i =0; i < spans.length; i++) {
			var text = document.createTextNode(nordFormsModeBML.getNodeText(spans[i]));
			spans[i].parentNode.insertBefore(text, spans[i]);
			spans[i].parentNode.removeChild(spans[i]);
		}
		var limitedSupport = document.querySelectorAll(".nordLimitedSupportFormsModeStyle");
		for (var i = 0; i < limitedSupport.length; i++) {
			var text = document.createTextNode(nordFormsModeBML.getNodeText(limitedSupport[i]));
			limitedSupport[i].parentNode.insertBefore(text, limitedSupport[i]);
			limitedSupport[i].parentNode.removeChild(limitedSupport[i]);
		}
		var dontreads = document.querySelectorAll("[data-nordFormsModeAddedDontRead]");
		for (var i = 0; i < dontreads.length; i++) {
			dontreads[i].removeAttribute("data-nordFormsModeAddedDontRead");
		}
		var limiteds = document.querySelectorAll("[data-nordFormsModeAddedLimited]");
		for (var i = 0; i < limiteds.length; i++) {
			limiteds[i].removeAttribute("data-nordFormsModeAddedLimited");
		}
		var arias = document.querySelectorAll(".nordAriaFormsModeStyle");
		for (var i = 0; i < arias.length; i++) {
			var text = document.createTextNode(nordFormsModeBML.getNodeText(arias[i]));
			arias[i].parentNode.insertBefore(text, arias[i]);
			arias[i].parentNode.removeChild(arias[i]);
			/*
			if (arias[i].getAttribute("class") == "nordAriaFormsModeStyle") {
				arias[i].removeAttribute("class");
			} else {
				arias[i].setAttribute("class", arias[i].getAttribute("class").replace(" nordAriaFormsModeStyle", ""));
			}
			*/
		}
		var arias = document.querySelectorAll(".nordFormsModeAriaLiveStyle");
		for (var i = 0; i < arias.length; i++) {
			arias[i].classList.remove("nordFormsModeAriaLiveStyle");
			/*
			var text = document.createTextNode(nordFormsModeBML.getNodeText(arias[i]));
			arias[i].parentNode.insertBefore(text, arias[i]);
			arias[i].parentNode.removeChild(arias[i]);
			if (arias[i].getAttribute("class") == "nordFormsModeAriaLiveStyle") {
				arias[i].removeAttribute("class");
			} else {
				arias[i].setAttribute("class", arias[i].getAttribute("class").replace(" nordFormsModeAriaLiveStyle", ""));
			}
			*/
		}
		
		//nordFormsModeBML.setIcons("blue");
	} // End of reset
}
