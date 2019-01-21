if (typeof (nordFormsModeCS) == "undefined") {
	var nordFormsModeCS = {};
}

//console.log("Loading/Running nordFormsModeCS.");
var listener = function (message, sender, sendResponse) {
	//console.log ("Got message " + message.task + ".");
	//console.log ("Got dbug " + message.dbug + ".");
	//chrome.runtime.onMessage.removeListener(listener);
	nordFormsModeCS.dbug = message.dbug;
	if (message.task.match(/run/)) {
		var ns = null;
		ns = document.getElementById("nordFormsModeStyle");
		if (ns) {
			ns.parentNode.removeChild(ns);
			if (nordFormsModeCS.dbug) console.log("run::removing nordStyle.");
		
			nordFormsModeCS.reset();
			nordFormsModeCS.formsMode = false;
			nordFormsModeCS.readyToLeave = false;
			nordFormsModeCS.nordStyle = null;
			nordFormsModeCS.setIcons("blue");
		} else {
			nordFormsModeCS.run(message);
		}
		//nordFormsModeCS.reset(message);
	} else if (message.task.match(/getStatus/i)) {
		//console.log ("So now gonna getStatus();");
		nordFormsModeCS.getStatus();
	}
};
/*
addMessageListener("nordFormsMode@nordburg.ca:run", listener); 
addMessageListener("nordFormsMode@nordburg.ca:reset", listener);
addMessageListener("nordFormsMode@nordburg.ca:getStatus", listener);
*/

nordFormsModeCS = {
	dbug : false,
	brk : false,
	output : "",
	run : function (message) {
		//removeMessageListener("nordFormsMode@nordburg.ca:run", listener);
		nordFormsModeCS.output = "";
		//document.addEventListener("load", function () {if (nordFormsModeCS.dbug) console.log ("Reloading!");}, false);
		//first we must see if we're resetting or simming
		//nordFormsModeCS.dbug = false;
		nordFormsModeCS.startTraversing(document.body, false);
		nordFormsModeCS.formsMode = false;
		nordFormsModeCS.readyToLeave = false;
		//if (nordFormsModeCS.output != "")
			//if (nordFormsModeCS.dbug) 
			if (nordFormsModeCS.dbug) console.log ("nordFormsMode::Output: " + nordFormsModeCS.output);
		// If you get here, and there's still no nordStyle, then formsmode was never turned on.
		var spans = document.querySelectorAll("span.nordFormsModeStyle");
		var arias = document.querySelectorAll(".nordAriaFormsModeStyle");
		var arialives = document.querySelectorAll(".nordFormsModeAriaLiveStyle");
		var limitedSupport = document.querySelectorAll(".nordLimitedSupportFormsModeStyle");
		
		if ((spans && spans.length > 0) || (arias && arias.length > 0) || (arialives.length > 0) || (limitedSupport && limitedSupport.length > 0)) {
			if (spans && spans.length > 0) {
				nordFormsModeCS.setIcons("red");
			} else {
				nordFormsModeCS.setIcons("darkgreen");
			}
			var ns = null;
			ns = document.getElementById("nordFormsModeStyle");
			if (!ns) document.head.appendChild(nordFormsModeCS.nordStyle);
		} else {
			//if (nordFormsModeCS.dbug) 
			if (nordFormsModeCS.dbug) console.log ("nordFormsMode::Weird.  Didn't go into forms mode at all.");
			nordFormsModeCS.formsMode = false;
			nordFormsModeCS.readyToLeave = false;
			nordFormsModeCS.simming = false;
			nordFormsModeCS.reset();
			nordFormsModeCS.nordStyle = null;
			nordFormsModeCS.setIcons("green");
			setTimeout(function () {
				console.log ("It's been green for long enough.  Resetting to blue.");
				nordFormsModeCS.setIcons("blue");
			}, 5000);
		}
	}, // End of run
	startTraversing : function (node, fieldsetChild) {
		var doc = document;
		var dbug = false;
		//var doc = gBrowser.contentDocument;
		var nodeID = "";
		//var origDbug = nordFormsModeCS.dbug;
		//nordFormsModeCS.dbug = false;

		if (node.hasAttribute("id")) nodeID = " (#" +node.getAttribute("id") + ")";
		/*if (node.nodeName.match(/form/i)) {
			nordFormsModeCS.dbug = true;
			console.log ("Turning on dbugging.");
			//console.log ("Turning on dbugging.");
		}*/
		if (nordFormsModeCS.dbug) console.log ("Traversing " + node.nodeName + nodeID + " of nodeType " + node.nodeType + " which has " + node.childNodes.length + " childNodes.\n");
		for (var i = 0; i < node.childNodes.length; i++) {
			if (nordFormsModeCS.brk && nordFormsModeCS.dbug) console.log ("Continueing from way after breaking from textarea/select. - next iter.");
			var thisNode = node.childNodes[i];
			if (thisNode.nodeType == 1) {	// It's a <node>
				//if (thisNode.nodeName.match(/input/i)) nordFormsModeCS.dbug = true;
				if (thisNode.nodeName.match(/fieldset/i)) {
					if (nordFormsModeCS.formsMode) {
						if (nordFormsModeCS.dbug) console.log ("Dealing with a fieldset.");
						// Look for multiple legends and red-circle all but the first.  but only if in forms mode.
						// Hang on...let's say you're _not_ in forms mode, so you skip this step, but you go into
						// forms mode part way through.  Maybe you could do this at the end of traversing this.
						
						// Look for inputs.  If none, red-circle the legend.  If there are, check if any are readable.
						var hasReadable = false;
						var hasLimited = false;
						var inputs = thisNode.getElementsByTagName("input");
						var textareas = thisNode.getElementsByTagName("textarea");
						var selects = thisNode.getElementsByTagName("select");
						var buttons = thisNode.getElementsByTagName("buttons");

						if (selects && selects.length > 0) {
							if (nordFormsModeCS.dbug) console.log("Got selects of length " + selects.length + ".");
							for (var j = 0; j < selects.length && !hasReadable; j++) {
								if (nordFormsModeCS.isStillFocusable(selects[j])) {
									if (nordFormsModeCS.dbug) console.log("Setting hasReadbale to true because selects.");
									hasReadable = true;
								} else {
									/*
									if (nordFormsModeCS.dbug) console.log("Not setting hasReadable to true because selects[" + j + "]: ");
									if (nordFormsModeCS.dbug) console.log("tabindex: " + (selects[j].hasAttribute("tabindex") ? selects[j].getAttribute("tabindex") : "No tabindex.") + ".");
									if (nordFormsModeCS.dbug) console.log("enabled: " + (selects[j].hasAttribute("enabled") ? selects[j].getAttribute("enabled") : "No enabled.") + ".");
									if (nordFormsModeCS.dbug) console.log("disabled: " + (selects[j].hasAttribute("disabled") ? selects[j].getAttribute("disabled") : "No disabled.") + ".");
									*/
								}
							}
						} else {
							if (nordFormsModeCS.dbug) console.log("didn't Got selects " + selects + ".");
						}
						if (!hasReadable && textareas && textareas.length > 0) {
							for (var j = 0; j < textareas.length && !hasReadable; j++) {
								if (nordFormsModeCS.isStillFocusable(textareas[j])) {
									if (nordFormsModeCS.dbug) console.log("Setting hasReadbale to true because textareas.");
									hasReadable = true;
								}
							}
						}

						if (!hasReadable && inputs && inputs.length > 0) {
							if (nordFormsModeCS.dbug) ("Checking " + inputs.length + " inputs.");
							for (var j = 0; j < inputs.length && !hasReadable; j++) {
								if (nordFormsModeCS.isStillFocusable(inputs[j])) {
									// If we get here then still possibly has a readable thing.  Check the type.

									var type = (inputs[j].hasAttribute("type") ? inputs[j].getAttribute("type") : "text");
									if (type.match(/hidden/i)) {
										// No matter what, at this point, don't set hasReadable to true.
									} else if (type.match(/submit|button|image|reset|clear/i)) {
										// Somehow set it limited
										hasLimited = true;
									} else {
										// type = number, text, email, etc. etc. etc.
										hasReadable = true;
									}
								}
							}
						}
						// If hasReadable is still false, then buttons won't change that, but they may invoke hasLimited
						if (!hasReadable && buttons && buttons.length > 0) {
							if (nordFormsModeCS.dbug) console.log ("Checking " + buttons.length + " buttons.");
							for (var j = 0; j < buttons.length && !hasLimited; j++) {
								if (nordFormsModeCS.isStillFocusable(buttons[j])) {
									hasLimited = true;
								}
							}
						}

						if (nordFormsModeCS.dbug) console.log ("After all this, hasReadable is: " + hasReadable + ".");
						if (hasReadable) {
						} else {
							// red-circle the legend.
							var legends = thisNode.getElementsByTagName("legend");
							if (legends && legends.length > 0) {
								if (nordFormsModeCS.dbug) console.log("Dealing with legend: " + legends[0].getAttribute("id") + ".");
								if (hasLimited) {
									if (nordFormsModeCS.dbug) console.log("Applying data-nordFormsModeAddedLimited");
									legends[0].setAttribute("data-nordFormsModeAddedLimited", "true");
								} else {
									legends[0].setAttribute("data-nordFormsModeAddedDontRead", "true");
								}
								//if (legends[0].hasAttribute("class")) {
								//} else {
								//	legends[0].setAttribute("class", "nordAriaFormsModeStyle");
								//}
							}
						}
					}  // End of isInFormsMode?

					var legends = false;
					//if (nordFormsModeCS.dbug) console.log ("Found a fieldset with " + thisNode.childNodes.length + " childNodes.  Looking for legends...\n");
					for (var j = 1; j < thisNode.childNodes.length; j++) {
						if (thisNode.childNodes[j].nodeType == 1) {
							if (thisNode.childNodes[j].nodeName.match(/legend/i)) {
								if (nordFormsModeCS.dbug) console.log ("[" + j + "]Found a legend.\n");
								if (legends) {
									//if (nordFormsModeCS.dbug) console.log ("Found another legend.  Adding class and moving on.");
									if (nordFormsModeCS.formsMode) thisNode.childNodes[j].setAttribute("data-nordFormsModeAddedDontRead", "true");
									//if (!nordFormsModeCS.formsMode) nordFormsModeCS.turnOnFormsMode();
								} else {
									legends = true;
									if (nordFormsModeCS.dbug) console.log ("Setting legends to " + legends + ".\n");
								}
							} else {
								//if (nordFormsModeCS.dbug) console.log ("[" + j + "]Not a legend (" + thisNode.childNodes[j].nodeName + ").\n");
							}
						}
					}
					//}
				} // End of if(fieldset)
				if (!nordFormsModeCS.formsMode) {
					if (thisNode.nodeName.match(/input/i)) {
						var typ = "text";
						if (thisNode.hasAttribute("type")) typ = thisNode.getAttribute("type");
						if (nordFormsModeCS.dbug) console.log ("Found an input of type " + typ + ".");
						if (!typ.match(/submit|button|hidden|image|reset|clear/i)) {
							if (nordFormsModeCS.isStillFocusable(thisNode)) {
								if (nordFormsModeCS.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ".\n");
								if (nordFormsModeCS.dbug) console.log ("***GOING INTO FORMS MODE***\n");
								if (!nordFormsModeCS.formsMode) nordFormsModeCS.turnOnFormsMode();
								continue;
							} else {
								if (nordFormsModeCS.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ", but it's not in the tab order, so staying out of Forms Mode.\n");
							}
						}
					} else if (thisNode.nodeName.match(/textarea|select/i)) {
						if (nordFormsModeCS.isStillFocusable(thisNode)) {
							if (nordFormsModeCS.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ".\n");
							if (nordFormsModeCS.dbug) console.log ("***GOING INTO FORMS MODE***\n");
							if (!nordFormsModeCS.formsMode) nordFormsModeCS.turnOnFormsMode();
							continue;
						} else {
							if (nordFormsModeCS.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ", but it's not in the tab order, so staying out of Forms Mode.\n");
						}
					}
				} else {
					if (nordFormsModeCS.dbug) console.log (thisNode.nodeName +", ");
				}
				if (nordFormsModeCS.brk) console.log ("Continuing after from breaking from textarea/select.");
				if (thisNode.hasAttribute("type") && thisNode.getAttribute("type").match(/submit/i)) {
					nordFormsModeCS.readyToLeave = true;
					nordFormsModeCS.formsMode = false;
					
				}
			
				if (thisNode.childNodes.length > 0) {
					
					if (!nordFormsModeCS.formsMode || (!thisNode.nodeName.match(/input|textarea|select|script|button$/i) && (!thisNode.hasAttribute("tabindex") || !(thisNode.getAttribute("tabindex").match(/^\d/))))) {
						var traverse = true;
						if (thisNode.nodeName.match(/^details$/i)) {
							//nordFormsModeCS.dbug = true;
							if (nordFormsModeCS.dbug) console.log ("Found details...\n");
							var looking = true;
							for (var j = 0; j < thisNode.childNodes.length && looking; j++) {
								if (thisNode.childNodes[j].nodeName.match(/summary/i)) {
									if (nordFormsModeCS.dbug) console.log ("Found summary....\n");
									looking = false;
									traverse = false;
									/*
									if (thisNode.childNodes[j].hasAttribute("tabindex") && (thisNode.childNodes[j].getAttribute("tabindex").match(/-\d/))) {
										if (nordFormsModeCS.dbug) console.log ("Setting traverse to false.\n");
										traverse = false;
									}
									*/
								}
							}
							if (looking && nordFormsModeCS.dbug) console.log ("Never found a summary.\n");
							if (traverse) nordFormsModeCS.startTraversing(thisNode);
						} else {
							if (nordFormsModeCS.dbug) console.log ("\tAbout to traverse " + thisNode.nodeName + (thisNode.hasAttribute("id") ? "(#" + thisNode.getAttribute("id") + ")" : "") + " which has " + thisNode.childNodes.length + (thisNode.childNodes.length == 1 ? "(" + thisNode.childNodes[0].nodeValue + ")" : "") + ".\n");
							if (traverse) nordFormsModeCS.startTraversing(thisNode);
						}
					}

					// Might fix this.  In an aspx page, the form should end at the submit button.
					if (thisNode.nodeName.match(/^form$/i) && nordFormsModeCS.readyToLeave) {
						nordFormsModeCS.formsMode = false;
						nordFormsModeCS.readyToLeave = false;
					}
				}
			} else if (thisNode.nodeType == 3) {
				// nodeType 3 is text node
				if (nordFormsModeCS.formsMode && thisNode.nodeValue.match(/\S/)) {
					if (nordFormsModeCS.dbug) console.log ("Checking a textNode for readability.\n");
					var readable = nordFormsModeCS.isReadable(thisNode);
					if (nordFormsModeCS.dbug) console.log ("Got readable: " + readable + " of type + " + typeof(readable) + ".");
					if (typeof (readable) == "boolean") {
						if (!readable) {
							if (nordFormsModeCS.dbug) console.log ("It's not readable.\n");
							var newSpan = doc.createElement("span");
							if (node.hasAttribute("data-nordFormsModeAddedLimited")) {
								newSpan.setAttribute("class", "nordLimitedSupportFormsModeStyle");
							} else {
								newSpan.setAttribute("class", "nordFormsModeStyle");
							}
							node.insertBefore(newSpan, thisNode);
							newSpan.appendChild(thisNode);
						} else {
							if (nordFormsModeCS.dbug) console.log ("It is readable.  Leave it alone.\n");
						}
					} else {
						if (readable == "limited") {
							if (nordFormsModeCS.dbug) console.log ("It has limited.\n");
							var newSpan = doc.createElement("span");
							//if (node.hasAttribute("data-nordFormsModeAddedLimited")) {
								newSpan.setAttribute("class", "nordLimitedSupportFormsModeStyle");
							//} else {
							//	newSpan.setAttribute("class", "nordFormsModeStyle");
							//}
							node.insertBefore(newSpan, thisNode);
							newSpan.appendChild(thisNode);
						} else if (readable == "aria") {
							if (nordFormsModeCS.dbug) console.log ("It has aria.\n");
							var newSpan = doc.createElement("span");
							//if (node.hasAttribute("data-nordFormsModeAddedLimited")) {
								newSpan.setAttribute("class", "nordAriaFormsModeStyle");
							//} else {
							//	newSpan.setAttribute("class", "nordFormsModeStyle");
							//}
							node.insertBefore(newSpan, thisNode);
							newSpan.appendChild(thisNode);
						}
					}
				}
			}
			if (nordFormsModeCS.brk && nordFormsModeCS.dbug) console.log ("Continueing from way after breaking from textarea/select.");
		}
		if (nordFormsModeCS.dbug) console.log ("Finished traversing " + node.nodeName + nodeID + ".\n");
		if (nordFormsModeCS.brk && nordFormsModeCS.dbug) console.log ("Continueing from way after breaking from textarea/select. - the bottom.");
		/*if (node.nodeName.match(/form/i)) {
			nordFormsModeCS.dbug = false;
			console.log ("Turning off dbugging.");
			//console.log ("Turning on dbugging.");
		}*/
		//nordFormsModeCS.dbug = origDbug;
	}, // End of startTraversing
	isReadable : function (node) {
		var returnValue = false;
		if (node.nodeType == 3) node = node.parentNode;
		if (nordFormsModeCS.dbug) console.log ("isReadable::Got either the tag in question: " + node.nodeName + ".\n");
		if (!nordFormsModeCS.formsMode) return true;
		if (nordFormsModeCS.dbug) console.log ("isReadable::And we are in Forms Mode.  Checking for aria-live\n");
		// is in forms mode:
		// What's it's tabindex value?

		if (node.hasAttribute("aria-live") && node.getAttribute("aria-live").match(/^polite|assertive$/i)) {
			if (node.hasAttribute("class")) {
				node.setAttribute("class", node.getAttribute("class") + " nordFormsModeAriaLiveStyle");
			} else {
				node.setAttribute("class", "nordFormsModeAriaLiveStyle");
			}
			if (nordFormsModeCS.dbug) console.log("isReadable::returning true because it's an aria-live region.");
			return true;
		}
		if (nordFormsModeCS.dbug) console.log ("isReadable::Checking for nordFormsModeAddedDontRead\n");
		if (node.hasAttribute("data-nordFormsModeAddedDontRead")) {
			if (nordFormsModeCS.dbug) console.log("isReadable::returning false because it has data-nordFormsModeAddedDontRead.");
			return false;
		} else if (node.hasAttribute("data-nordFormsModeAddedLimited")) {
			// Should I add the class here?
			if (nordFormsModeCS.dbug) console.log ("isReadable::returning limited becayse there's a nordFormsModeAddedLimited\n");
			return "limited";
		} else {
			if (nordFormsModeCS.dbug) console.log ("isReadable::Is it a label?\n");
			if (node.nodeName.match(/label/i)) {
				if (nordFormsModeCS.dbug) console.log ("isReadable::Found a label.\n");
				var el = null;
				el = nordFormsModeCS.getLabelsFormControl(node);
				if (el) {
					if (nordFormsModeCS.dbug) console.log ("isReadable::Inspecting element.\n");
					if (nordFormsModeCS.isStillFocusable(el)) {
						if (nordFormsModeCS.dbug) console.log ("isReadable::returning true because either there's no tabindex, or it's not -\d.\n");
						return true;
					} else {
						if (nordFormsModeCS.dbug) console.log ("isReadable::returning False because it has " + el.getAttribute("tabindex") + ".\n");
						return false;
					}
				} else {
					if (node.hasAttribute("tabindex") && node.getAttribute("tabindex").match(/^\d+$/)) {
						if (nordFormsModeCS.dbug) console.log ("isReadable::Did not get element, but the label has a tabindex of " + node.getAttribute("tabindex") + "\n");
						return true;
					} else {
						if (nordFormsModeCS.dbug) console.log ("isReadable::Did not get element and tabindex ain't makin' it readable.\n");
						return false;
					}
				}
			} else {
				if (nordFormsModeCS.dbug) console.log ("isReadable::Not a label.\n");
			}
			if (node.hasAttribute("id")) {
				var id = node.getAttribute("id");
				if (nordFormsModeCS.dbug) console.log ("isReadable::Has an id: " + id + ".\n");
				var alabelledby, adescribedby = Array();
				id = id.replace( /(:|\.|\[|\]|\-|\{|\})/g, "\\$1" );
				try {
					alabelledby = document.querySelectorAll("[aria-labelledby~=" + id + "]");
					adescribedby = document.querySelectorAll("[aria-describedby~=" + id + "]");
				}
				catch (ex) {
					console.error("id:" + id + "\nex: " + ex.message + ".");
				}
				var readable = false;
				if (alabelledby.length + adescribedby.length > 0) {
					if (nordFormsModeCS.dbug) console.log ("isReadable::alabelledby: " + alabelledby.length + ", adescribedby: " + adescribedby.length + ".\n");
					for (var i = 0; i < alabelledby.length; i++) {
						if (nordFormsModeCS.isStillFocusable(alabelledby[i])) {
							if (alabelledby[i].nodeName.match(/(legend|fieldset)/i)) {
								readable = "limited";
							} else {
								readable = "aria";
							}
							break;
						}
					}
					if (nordFormsModeCS.dbug) console.log ("Thus element is aria-describedby by " + adescribedby.length + " elements.");
					for (var i = 0; i < adescribedby.length; i++) {
						if (nordFormsModeCS.isStillFocusable(adescribedby[i])) {
							if (adescribedby[i].nodeName.match(/(legend|fieldset)/i)) {
								readable = "limited";
							} else {
								readable = "aria";
							}
							break;
						}
					}
					if (readable) {
						// GOSH NO!  Don't add the class.  Or if you do, only do it once.
						/*
						if (node.hasAttribute("class")) {
							node.setAttribute("class", node.getAttribute("class") + " nordAriaFormsModeStyle");
						} else {
							node.setAttribute("class", "nordAriaFormsModeStyle");
						}
						if (!nordFormsModeCS.formsMode) nordFormsModeCS.turnOnFormsMode();
						*/
					}
					return readable;
				}
			} else {
				if (nordFormsModeCS.dbug) console.log ("isReadable::And it doesn't have an id..\n");
			}
			if (!nordFormsModeCS.isStillFocusable(node)) {
				return false;
			} else {
				if (node.nodeName.match(/^(a|legend|button)$/i)) {
					return true;
				} else if (node.nodeName.match(/^label$/i)) {
					// Shoulda dealt with this above
				}
			}
		}
		if (!node.nodeName.match(/body/i)) {
			return nordFormsModeCS.isReadable(node.parentNode);
		} else {
			return false;
		}
	}, // End of isReadable
	isStillFocusable : function (el) {
		var rv = true;
		if (
		(el.hasAttribute("tabindex") && !el.getAttribute("tabindex").match(/^-\d/)) || 			// there's a tabindex and it's not negative
		(el.hasAttribute("enabled") && !el.getAttribute("enabled").match(/false|disabled/g)) || 	// has an enabled attribute and it's not false
		(el.hasAttribute("disabled") && !el.getAttribute("disabled").match(/disabled|true/i)) /*|| 	// has a disabled attribute and it's not true
		(!el.hasAttribute("tabindex") && !el.hasAttribute("enabled") && !el.hasAttribute("disabled"))*/  // Not sure why this is commented out
														//has tabindex but not enabled or disabled
		) rv = false;
		return rv;
	}, // End of isStillFocusable
	getLabelsFormControl : function (node) {
		var el = null;
		if (node.nodeName.match(/label/i)) {
			if (node.hasAttribute("for")) {
				if (nordFormsModeCS.dbug) console.log ("getLabelsFormControl::Has a for of value " + node.getAttribute("for") + ".\n");
				el = document.getElementById(node.getAttribute("for"));
				if (nordFormsModeCS.dbug) console.log ("getLabelsFormControl::el is now " + el + ".\n");
				// In the even that el is null, check for aria stuff.
				if (!el && node.hasAttribute("id")) {
					var id = node.getAttribute("id");
					if (nordFormsModeCS.dbug) console.log("Label " + id + " doesn't seem to have an element.  It's for doesn't exist.  Checking aria properties.");
					var alabelledby = document.querySelectorAll("[aria-labelledby=" + id + "]");
					if (nordFormsModeCS.dbug) console.log("alabelledby.length: " + alabelledby.length + ".");
					if (alabelledby.length >0) return alabelledby[0];
					var adescribedby = document.querySelectorAll("[aria-describedby=" + id + "]");
					if (nordFormsModeCS.dbug) console.log("adescribedby.length: " + adescribedby.length + ".");
					if (adescribedby.length >0) return adescribedby[0];
				}
			} else {
				// Must be implicit
				if (nordFormsModeCS.dbug) console.log ("getLabelsFormControl::Did not get a for.  Must be implicit.\n");
				for (var i = 0; i < node.childNodes.length; i++) {
					if (node.childNodes[i].nodeType == 1) {
						if (node.childNodes[i].nodeName.match(/input|select|textarea/i)) {
							if (nordFormsModeCS.dbug) console.log ("getLabelsFormControl::Found implicit node of type " + node.childNodes[i].nodeName + ".\n");
							el = node.childNodes[i];
						}
					}
				}
			}
		}
		//if (nordFormsModeCS.dbug) console.log ("For label " + nordFormsModeCD.getNodeText(node) + " got element
		return el;
	}, // End of getLabelsFormControl
	reset : function () {
		//removeMessageListener("nordFormsMode@nordburg.ca:reset", listener);
		var spans = document.querySelectorAll("span.nordFormsModeStyle");
		if (nordFormsModeCS.dbug) console.log ("Resetting " + spans.length + " spans.");
		for (var i =0; i < spans.length; i++) {
			var text = document.createTextNode(nordFormsModeCS.getNodeText(spans[i]));
			spans[i].parentNode.insertBefore(text, spans[i]);
			spans[i].parentNode.removeChild(spans[i]);
		}
		var limitedSupport = document.querySelectorAll(".nordLimitedSupportFormsModeStyle");
		for (var i = 0; i < limitedSupport.length; i++) {
			var text = document.createTextNode(nordFormsModeCS.getNodeText(limitedSupport[i]));
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
			var text = document.createTextNode(nordFormsModeCS.getNodeText(arias[i]));
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
			var text = document.createTextNode(nordFormsModeCS.getNodeText(arias[i]));
			arias[i].parentNode.insertBefore(text, arias[i]);
			arias[i].parentNode.removeChild(arias[i]);
			/*
			if (arias[i].getAttribute("class") == "nordFormsModeAriaLiveStyle") {
				arias[i].removeAttribute("class");
			} else {
				arias[i].setAttribute("class", arias[i].getAttribute("class").replace(" nordFormsModeAriaLiveStyle", ""));
			}
			*/
		}
		
		//nordFormsModeCS.setIcons("blue");
	}, // End of reset
	getNodeText : function(n) {
		var returnValue = "";
		if (n == "undefined") {
			returnValue = "";
		} else {
			for (var i=0; i < n.childNodes.length; i++) {
				if (n.childNodes[i].nodeType == 3 || n.childNodes[i].nodeType == 4) {
					returnValue += n.childNodes[i].nodeValue;
				} else if (n.childNodes[i].nodeType == 1) {
					returnValue += nordFormsModeCS.getNodeText(n.childNodes[i]);
				}
			}
		}
		return returnValue;
	}, // End of getNodeText
	turnOnFormsMode : function () {
		nordFormsModeCS.formsMode = true;
		if (nordFormsModeCS.dbug) console.log ("Turning on Forms mode.");
		nordFormsModeCS.nordStyle = document.createElement("style");
		nordFormsModeCS.nordStyle.setAttribute("type", "text/css");
		nordFormsModeCS.nordStyle.setAttribute("id", "nordFormsModeStyle");
		nordFormsModeCS.nordStyle.innerHTML = ".nordFormsModeStyle { border: 4px #AA0000 solid;}";
		nordFormsModeCS.nordStyle.innerHTML += ".nordFormsModeAriaLiveStyle { border: 4px #00AA00 dotted;}";
		nordFormsModeCS.nordStyle.innerHTML += ".nordAriaFormsModeStyle { border: 4px #00AA00 dashed;}";
		nordFormsModeCS.nordStyle.innerHTML += ".nordLimitedSupportFormsModeStyle { border: 4px #AA0000 double; background-color: #FFFF00;}";
		//nordFormsModeCS.setIconsRed();
		//document.head.appendChild(nordFormsModeCS.nordStyle);
	}, // End of turnOnFormsMode
	setIcons : function (color) {
		if (nordFormsModeCS.dbug) console.log ("Okay, finished in the CS, gonna send " + color + " back to the chrome script.");
		browser.runtime.sendMessage({"color" : color});
		//sendAsyncMessage("nordFormsMode@nordburg.ca:setIcons", {"color" : color});
	}, // End of setIcons
	getStatus : function () {
		var doc = document;

		var nordFormsModeStyle = doc.getElementById("nordFormsModeStyle");
		var spans = doc.querySelectorAll("span.nordFormsModeStyle");
		var arias = doc.querySelectorAll(".nordAriaFormsModeStyle");
		var arialives = doc.querySelectorAll(".nordFormsModeAriaLiveStyle");
		var limitedSupport = doc.querySelectorAll(".nordLimitedSupportFormsModeStyle");
		if (nordFormsModeStyle != null || (spans != null && spans.length > 0) || (arias != null && arias.length > 0) || (arialives != null && arialives.length > 0) || limitedSupport != null && limitedSupport.length > 0) {
			//if (nordFormsModeCS.dbug) 
			console.log("Found evidence of nordForms mode simming.");
			nordFormsModeCS.simming = true;
			if (spans != null && spans.length > 0) {
				nordFormsModeCS.setIcons("red");
			} else {
				nordFormsModeCS.setIcons("darkgreen");
			}
		} else {
			//if (nordFormsModeCS.dbug) 
				//console.log("Didn't find evidence of nordForms mode simming.");
			nordFormsModeCS.simming = false;	// Uh-oh.  What to do with this?
			nordFormsModeCS.setIcons("blue");
		}
	}, // End of getStatus
	addAListener : function () {
		console.log("Adding message listener.");
		console.log("Added message listener.");
	} // End of addAListener
}

//chrome.runtime.onConnect.addListener(nordFormsModeCS.addAListener);
chrome.runtime.onMessage.addListener(listener);
