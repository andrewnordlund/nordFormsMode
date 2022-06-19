if (typeof (nordFormsModeBML) == "undefined") {
	var nordFormsModeBML = {};
}

/*
Let's think this through.

As a Content Script, this can be loaded, then wait for a notification to execute.

But as a bookmarklet, or following in WAVE's model, the script can be inserted into a page as a <script> tag.  As such, it has to execute right away.

But then how does it get cleaned up?

So:
In a bookmarklet:
	The bookmarklet logic should check for the existance of the script (check for the id, or anything with class=nordFormsMode....).
	If it's there: remove everything.
	If it's not there:  Insert the script.

As an add-on:
	The content script can listen for messages from the background script.  When it hears "run" (or whatever), it can inject the script, which will automagically run.
	The same content script can clean up by either: looking for everything added by the script, like the above bookmark; or inject another script to do the cleanup.
	Hmmm....The only reason you need another script is if you need to get it to run code

	Oh schmidt!  How can the script tell the content script that it's done running?  The Contnet Script needs to tell the background script what colour to change the icon....

	You could try creating an event and dispatching it; then listen for it in the content script

Hold on...there's a third option:
	Have a separate script that deals with the document as a separate content script.  Could that work?

*/


nordFormsModeBML = {
	dbug : false,
	brk : false,
	output : "",
	run : function (message) {
		//removeMessageListener("nordFormsMode@nordburg.ca:run", listener);
		nordFormsModeBML.output = "";
		//document.addEventListener("load", function () {if (nordFormsModeBML.dbug) console.log ("Reloading!");}, false);
		//first we must see if we're resetting or simming
		//nordFormsModeBML.dbug = true;
		nordFormsModeBML.startTraversing(document.body, false);
		nordFormsModeBML.formsMode = false;
		nordFormsModeBML.readyToLeave = false;
		//if (nordFormsModeBML.output != "")
			//if (nordFormsModeBML.dbug) 
			if (nordFormsModeBML.dbug) console.log ("nordFormsMode::Output: " + nordFormsModeBML.output);
		// If you get here, and there's still no nordStyle, then formsmode was never turned on.
		var spans = document.querySelectorAll("span.nordFormsModeStyle");
		var arias = document.querySelectorAll(".nordAriaFormsModeStyle");
		var arialives = document.querySelectorAll(".nordFormsModeAriaLiveStyle");
		var limitedSupport = document.querySelectorAll(".nordLimitedSupportFormsModeStyle");
		
		if ((spans && spans.length > 0) || (arias && arias.length > 0) || (arialives.length > 0) || (limitedSupport && limitedSupport.length > 0)) {
			if (spans && spans.length > 0) {
				nordFormsModeBML.setIcons("red");
			} else {
				nordFormsModeBML.setIcons("darkgreen");
			}
			var ns = null;
			ns = document.getElementById("nordFormsModeStyle");
			if (!ns) document.head.appendChild(nordFormsModeBML.nordStyle);
		} else {
			//if (nordFormsModeBML.dbug) 
			if (nordFormsModeBML.dbug) console.log ("nordFormsMode::Weird.  Didn't go into forms mode at all.");
			nordFormsModeBML.formsMode = false;
			nordFormsModeBML.readyToLeave = false;
			nordFormsModeBML.simming = false;
			nordFormsModeBML.reset();
			nordFormsModeBML.nordStyle = null;
			nordFormsModeBML.setIcons("green");
			setTimeout(function () {
				if (nordFormsModeBML.dbug) console.log ("It's been green for long enough.  Resetting to blue.");
				nordFormsModeBML.setIcons("blue");
			}, 5000);
		}
	}, // End of run
	startTraversing : function (node, fieldsetChild) {
		var doc = document;
		var dbug = false;
		//var doc = gBrowser.contentDocument;
		var nodeID = "";
		//var origDbug = nordFormsModeBML.dbug;
		//nordFormsModeBML.dbug = false;

		if (node.hasAttribute("id")) nodeID = " (#" +node.getAttribute("id") + ")";
		/*if (node.nodeName.match(/form/i)) {
			nordFormsModeBML.dbug = true;
			console.log ("Turning on dbugging.");
			//console.log ("Turning on dbugging.");
		}*/
		if (nordFormsModeBML.dbug) console.log ("Traversing " + node.nodeName + nodeID + " of nodeType " + node.nodeType + " which has " + node.childNodes.length + " childNodes.\n");
		for (var i = 0; i < node.childNodes.length; i++) {
			if (nordFormsModeBML.brk && nordFormsModeBML.dbug) console.log ("Continueing from way after breaking from textarea/select. - next iter.");
			var thisNode = node.childNodes[i];
			if (thisNode.nodeType == 1) {	// It's a <node>
				//if (thisNode.nodeName.match(/input/i)) nordFormsModeBML.dbug = true;
				if (thisNode.nodeName.match(/fieldset/i)) {
					if (nordFormsModeBML.formsMode) {
						if (nordFormsModeBML.dbug) console.log ("Dealing with a fieldset.");
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
							if (nordFormsModeBML.dbug) console.log("Got selects of length " + selects.length + ".");
							for (var j = 0; j < selects.length && !hasReadable; j++) {
								if (nordFormsModeBML.isStillFocusable(selects[j])) {
									if (nordFormsModeBML.dbug) console.log("Setting hasReadbale to true because selects.");
									hasReadable = true;
								} else {
									/*
									if (nordFormsModeBML.dbug) console.log("Not setting hasReadable to true because selects[" + j + "]: ");
									if (nordFormsModeBML.dbug) console.log("tabindex: " + (selects[j].hasAttribute("tabindex") ? selects[j].getAttribute("tabindex") : "No tabindex.") + ".");
									if (nordFormsModeBML.dbug) console.log("enabled: " + (selects[j].hasAttribute("enabled") ? selects[j].getAttribute("enabled") : "No enabled.") + ".");
									if (nordFormsModeBML.dbug) console.log("disabled: " + (selects[j].hasAttribute("disabled") ? selects[j].getAttribute("disabled") : "No disabled.") + ".");
									*/
								}
							}
						} else {
							if (nordFormsModeBML.dbug) console.log("didn't Got selects " + selects + ".");
						}
						if (!hasReadable && textareas && textareas.length > 0) {
							for (var j = 0; j < textareas.length && !hasReadable; j++) {
								if (nordFormsModeBML.isStillFocusable(textareas[j])) {
									if (nordFormsModeBML.dbug) console.log("Setting hasReadbale to true because textareas.");
									hasReadable = true;
								}
							}
						}

						if (!hasReadable && inputs && inputs.length > 0) {
							if (nordFormsModeBML.dbug) ("Checking " + inputs.length + " inputs.");
							for (var j = 0; j < inputs.length && !hasReadable; j++) {
								if (nordFormsModeBML.isStillFocusable(inputs[j])) {
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
							if (nordFormsModeBML.dbug) console.log ("Checking " + buttons.length + " buttons.");
							for (var j = 0; j < buttons.length && !hasLimited; j++) {
								if (nordFormsModeBML.isStillFocusable(buttons[j])) {
									hasLimited = true;
								}
							}
						}

						if (nordFormsModeBML.dbug) console.log ("After all this, hasReadable is: " + hasReadable + ".");
						if (hasReadable) {
						} else {
							// red-circle the legend.
							var legends = thisNode.getElementsByTagName("legend");
							if (legends && legends.length > 0) {
								if (nordFormsModeBML.dbug) console.log("Dealing with legend: " + legends[0].getAttribute("id") + ".");
								if (hasLimited) {
									if (nordFormsModeBML.dbug) console.log("Applying data-nordFormsModeAddedLimited");
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
					//if (nordFormsModeBML.dbug) console.log ("Found a fieldset with " + thisNode.childNodes.length + " childNodes.  Looking for legends...\n");
					for (var j = 1; j < thisNode.childNodes.length; j++) {
						if (thisNode.childNodes[j].nodeType == 1) {
							if (thisNode.childNodes[j].nodeName.match(/legend/i)) {
								if (nordFormsModeBML.dbug) console.log ("[" + j + "]Found a legend.\n");
								if (legends) {
									//if (nordFormsModeBML.dbug) console.log ("Found another legend.  Adding class and moving on.");
									if (nordFormsModeBML.formsMode) thisNode.childNodes[j].setAttribute("data-nordFormsModeAddedDontRead", "true");
									//if (!nordFormsModeBML.formsMode) nordFormsModeBML.turnOnFormsMode();
								} else {
									legends = true;
									if (nordFormsModeBML.dbug) console.log ("Setting legends to " + legends + ".\n");
								}
							} else {
								//if (nordFormsModeBML.dbug) console.log ("[" + j + "]Not a legend (" + thisNode.childNodes[j].nodeName + ").\n");
							}
						}
					}
					//}
				} // End of if(fieldset)
				if (!nordFormsModeBML.formsMode) {
					if (thisNode.nodeName.match(/input/i)) {
						var typ = "text";
						if (thisNode.hasAttribute("type")) typ = thisNode.getAttribute("type");
						if (nordFormsModeBML.dbug) console.log ("Found an input of type " + typ + ".");
						if (!typ.match(/submit|button|hidden|image|reset|clear/i)) {
							if (nordFormsModeBML.isStillFocusable(thisNode)) {
								if (nordFormsModeBML.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ".\n");
								if (nordFormsModeBML.dbug) console.log ("***GOING INTO FORMS MODE***\n");
								if (!nordFormsModeBML.formsMode) nordFormsModeBML.turnOnFormsMode();
								continue;
							} else {
								if (nordFormsModeBML.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ", but it's not in the tab order, so staying out of Forms Mode.\n");
							}
						}
					} else if (thisNode.nodeName.match(/textarea|select/i)) {
						if (nordFormsModeBML.isStillFocusable(thisNode)) {
							if (nordFormsModeBML.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ".\n");
							if (nordFormsModeBML.dbug) console.log ("***GOING INTO FORMS MODE***\n");
							if (!nordFormsModeBML.formsMode) nordFormsModeBML.turnOnFormsMode();
							continue;
						} else {
							if (nordFormsModeBML.dbug) console.log ("FOUND an input of type " + thisNode.nodeName + ", but it's not in the tab order, so staying out of Forms Mode.\n");
						}
					}
				} else {
					if (nordFormsModeBML.dbug) console.log (thisNode.nodeName +", ");
				}
				if (nordFormsModeBML.brk) console.log ("Continuing after from breaking from textarea/select.");
				if (thisNode.hasAttribute("type") && thisNode.getAttribute("type").match(/submit/i)) {
					nordFormsModeBML.readyToLeave = true;
					nordFormsModeBML.formsMode = false;
					
				}
			
				if (thisNode.childNodes.length > 0) {
					
					if (!nordFormsModeBML.formsMode || (!thisNode.nodeName.match(/input|textarea|select|script|button$/i) && (!thisNode.hasAttribute("tabindex") || !(thisNode.getAttribute("tabindex").match(/^\d/))))) {
						var traverse = true;
						if (thisNode.nodeName.match(/^details$/i)) {
							//nordFormsModeBML.dbug = true;
							if (nordFormsModeBML.dbug) console.log ("Found details...\n");
							var looking = true;
							for (var j = 0; j < thisNode.childNodes.length && looking; j++) {
								if (thisNode.childNodes[j].nodeName.match(/summary/i)) {
									if (nordFormsModeBML.dbug) console.log ("Found summary....\n");
									looking = false;
									traverse = false;
									/*
									if (thisNode.childNodes[j].hasAttribute("tabindex") && (thisNode.childNodes[j].getAttribute("tabindex").match(/-\d/))) {
										if (nordFormsModeBML.dbug) console.log ("Setting traverse to false.\n");
										traverse = false;
									}
									*/
								}
							}
							if (looking && nordFormsModeBML.dbug) console.log ("Never found a summary.\n");
							if (traverse) nordFormsModeBML.startTraversing(thisNode);
						} else {
							if (nordFormsModeBML.dbug) console.log ("\tAbout to traverse " + thisNode.nodeName + (thisNode.hasAttribute("id") ? "(#" + thisNode.getAttribute("id") + ")" : "") + " which has " + thisNode.childNodes.length + (thisNode.childNodes.length == 1 ? "(" + thisNode.childNodes[0].nodeValue + ")" : "") + ".\n");
							if (traverse) nordFormsModeBML.startTraversing(thisNode);
						}
					}

					// Might fix this.  In an aspx page, the form should end at the submit button.
					if (thisNode.nodeName.match(/^form$/i) && nordFormsModeBML.readyToLeave) {
						nordFormsModeBML.formsMode = false;
						nordFormsModeBML.readyToLeave = false;
					}
				}
			} else if (thisNode.nodeType == 3) {
				// nodeType 3 is text node
				if (nordFormsModeBML.formsMode && thisNode.nodeValue.match(/\S/)) {
					if (nordFormsModeBML.dbug) console.log ("Checking a textNode for readability.\n");
					var readable = nordFormsModeBML.isReadable(thisNode);
					if (nordFormsModeBML.dbug) console.log ("Got readable: " + readable + " of type + " + typeof(readable) + ".");
					if (typeof (readable) == "boolean") {
						if (!readable) {
							if (nordFormsModeBML.dbug) console.log ("It's not readable.\n");
							var newSpan = doc.createElement("span");
							if (node.hasAttribute("data-nordFormsModeAddedLimited")) {
								newSpan.setAttribute("class", "nordLimitedSupportFormsModeStyle");
							} else {
								newSpan.setAttribute("class", "nordFormsModeStyle");
							}
							node.insertBefore(newSpan, thisNode);
							newSpan.appendChild(thisNode);
						} else {
							if (nordFormsModeBML.dbug) console.log ("It is readable.  Leave it alone.\n");
						}
					} else {
						if (readable == "limited") {
							if (nordFormsModeBML.dbug) console.log ("It has limited.\n");
							var newSpan = doc.createElement("span");
							//if (node.hasAttribute("data-nordFormsModeAddedLimited")) {
								newSpan.setAttribute("class", "nordLimitedSupportFormsModeStyle");
							//} else {
							//	newSpan.setAttribute("class", "nordFormsModeStyle");
							//}
							node.insertBefore(newSpan, thisNode);
							newSpan.appendChild(thisNode);
						} else if (readable == "aria") {
							if (nordFormsModeBML.dbug) console.log ("It has aria.\n");
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
			if (nordFormsModeBML.brk && nordFormsModeBML.dbug) console.log ("Continueing from way after breaking from textarea/select.");
		}
		if (nordFormsModeBML.dbug) console.log ("Finished traversing " + node.nodeName + nodeID + ".\n");
		if (nordFormsModeBML.brk && nordFormsModeBML.dbug) console.log ("Continueing from way after breaking from textarea/select. - the bottom.");
		/*if (node.nodeName.match(/form/i)) {
			nordFormsModeBML.dbug = false;
			console.log ("Turning off dbugging.");
			//console.log ("Turning on dbugging.");
		}*/
		//nordFormsModeBML.dbug = origDbug;
	}, // End of startTraversing
	isReadable : function (node) {
		var returnValue = false;
		if (node.nodeType == 3) node = node.parentNode;
		if (nordFormsModeBML.dbug) console.log ("isReadable::Got either the tag in question: " + node.nodeName + ".\n");
		if (!nordFormsModeBML.formsMode) return true;
		if (nordFormsModeBML.dbug) console.log ("isReadable::And we are in Forms Mode.  Checking for aria-live\n");
		// is in forms mode:
		// What's it's tabindex value?

		if ((node.hasAttribute("aria-live") && node.getAttribute("aria-live").match(/^polite|assertive$/i)) || (node.hasAttribute("role") && node.getAttribute("role").match(/^alert|status$/))) {
			node.classList.add("nordFormsModeAriaLiveStyle");
			/*
			if (node.hasAttribute("class")) {
				node.setAttribute("class", node.getAttribute("class") + " nordFormsModeAriaLiveStyle");
			} else {
				node.setAttribute("class", "nordFormsModeAriaLiveStyle");
			}
			*/
			if (nordFormsModeBML.dbug) console.log("isReadable::returning true because it's an aria-live region.");
			return true;
		}
		if (nordFormsModeBML.dbug) console.log ("isReadable::Checking for nordFormsModeAddedDontRead\n");
		if (node.hasAttribute("data-nordFormsModeAddedDontRead")) {
			if (nordFormsModeBML.dbug) console.log("isReadable::returning false because it has data-nordFormsModeAddedDontRead.");
			return false;
		} else if (node.hasAttribute("data-nordFormsModeAddedLimited")) {
			// Should I add the class here?
			if (nordFormsModeBML.dbug) console.log ("isReadable::returning limited becayse there's a nordFormsModeAddedLimited\n");
			return "limited";
		} else {
			if (nordFormsModeBML.dbug) console.log ("isReadable::Is it a label?\n");
			if (node.nodeName.match(/label/i)) {
				if (nordFormsModeBML.dbug) console.log ("isReadable::Found a label.\n");
				var el = null;
				el = nordFormsModeBML.getLabelsFormControl(node);
				if (el) {
					if (nordFormsModeBML.dbug) console.log ("isReadable::Inspecting element.\n");
					if (nordFormsModeBML.isStillFocusable(el)) {
						if (nordFormsModeBML.dbug) console.log ("isReadable::returning true because either there's no tabindex, or it's not -\d.\n");
						return true;
					} else {
						if (nordFormsModeBML.dbug) console.log ("isReadable::returning False because it has " + el.getAttribute("tabindex") + ".\n");
						return false;
					}
				} else {
					if (node.hasAttribute("tabindex") && node.getAttribute("tabindex").match(/^\d+$/)) {
						if (nordFormsModeBML.dbug) console.log ("isReadable::Did not get element, but the label has a tabindex of " + node.getAttribute("tabindex") + "\n");
						return true;
					} else {
						if (nordFormsModeBML.dbug) console.log ("isReadable::Did not get element and tabindex ain't makin' it readable.\n");
						return false;
					}
				}
			} else {
				if (nordFormsModeBML.dbug) console.log ("isReadable::Not a label.\n");
			}
			if (node.hasAttribute("id")) {
				var id = node.getAttribute("id");
				if (nordFormsModeBML.dbug) console.log ("isReadable::Has an id: " + id + ".\n");
				var alabelledby, adescribedby = Array();
				//id = id.replace( /(:|\.|\[|\]|\-|\{|\}| |\s|\=)/g, "\\$1" );
				id = CSS.escape(id);
				try {
					alabelledby = document.querySelectorAll("[aria-labelledby~=" + id + "]");
					adescribedby = document.querySelectorAll("[aria-describedby~=" + id + "]");
				}
				catch (ex) {
					console.error("id:" + id + "\nex: " + ex.message + ".");
				}
				//console.log ("Got this far.");
				var readable = false;
				if (alabelledby.length + adescribedby.length > 0) {
					if (nordFormsModeBML.dbug) console.log ("isReadable::alabelledby: " + alabelledby.length + ", adescribedby: " + adescribedby.length + ".\n");
					for (var i = 0; i < alabelledby.length; i++) {
						if (nordFormsModeBML.isStillFocusable(alabelledby[i])) {
							if (alabelledby[i].nodeName.match(/(legend)/i)) {
								readable = "limited";
							} else {
								readable = "aria";
							}
							break;
						}
					}
					if (nordFormsModeBML.dbug) console.log ("Thus element is aria-describedby by " + adescribedby.length + " elements.");
					for (var i = 0; i < adescribedby.length; i++) {
						if (nordFormsModeBML.isStillFocusable(adescribedby[i])) {
							if (adescribedby[i].nodeName.match(/(legend)/i)) {
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
						if (!nordFormsModeBML.formsMode) nordFormsModeBML.turnOnFormsMode();
						*/
					}
					return readable;
				}
			} else {
				if (nordFormsModeBML.dbug) console.log ("isReadable::And it doesn't have an id..\n");
			}
			if (!nordFormsModeBML.isStillFocusable(node)) {
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
			return nordFormsModeBML.isReadable(node.parentNode);
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
				if (nordFormsModeBML.dbug) console.log ("getLabelsFormControl::Has a for of value " + node.getAttribute("for") + ".\n");
				el = document.getElementById(node.getAttribute("for"));
				if (nordFormsModeBML.dbug) console.log ("getLabelsFormControl::el is now " + el + ".\n");
				// In the even that el is null, check for aria stuff.
				if (!el && node.hasAttribute("id")) {
					var id = node.getAttribute("id");
					if (nordFormsModeBML.dbug) console.log("Label " + id + " doesn't seem to have an element.  It's for doesn't exist.  Checking aria properties.");
					var alabelledby = document.querySelectorAll("[aria-labelledby=" + id + "]");
					if (nordFormsModeBML.dbug) console.log("alabelledby.length: " + alabelledby.length + ".");
					if (alabelledby.length >0) return alabelledby[0];
					var adescribedby = document.querySelectorAll("[aria-describedby=" + id + "]");
					if (nordFormsModeBML.dbug) console.log("adescribedby.length: " + adescribedby.length + ".");
					if (adescribedby.length >0) return adescribedby[0];
				}
			} else {
				// Must be implicit
				if (nordFormsModeBML.dbug) console.log ("getLabelsFormControl::Did not get a for.  Must be implicit.\n");
				for (var i = 0; i < node.childNodes.length; i++) {
					if (node.childNodes[i].nodeType == 1) {
						if (node.childNodes[i].nodeName.match(/input|select|textarea/i)) {
							if (nordFormsModeBML.dbug) console.log ("getLabelsFormControl::Found implicit node of type " + node.childNodes[i].nodeName + ".\n");
							el = node.childNodes[i];
						}
					}
				}
			}
		}
		//if (nordFormsModeBML.dbug) console.log ("For label " + nordFormsModeCD.getNodeText(node) + " got element
		return el;
	}, // End of getLabelsFormControl
	getNodeText : function(n) {
		var returnValue = "";
		if (n == "undefined") {
			returnValue = "";
		} else {
			for (var i=0; i < n.childNodes.length; i++) {
				if (n.childNodes[i].nodeType == 3 || n.childNodes[i].nodeType == 4) {
					returnValue += n.childNodes[i].nodeValue;
				} else if (n.childNodes[i].nodeType == 1) {
					returnValue += nordFormsModeBML.getNodeText(n.childNodes[i]);
				}
			}
		}
		return returnValue;
	}, // End of getNodeText
	turnOnFormsMode : function () {
		nordFormsModeBML.formsMode = true;
		if (nordFormsModeBML.dbug) console.log ("Turning on Forms mode.");
		nordFormsModeBML.nordStyle = document.createElement("style");
		nordFormsModeBML.nordStyle.setAttribute("type", "text/css");
		nordFormsModeBML.nordStyle.setAttribute("id", "nordFormsModeStyle");
		nordFormsModeBML.nordStyle.innerHTML = ".nordFormsModeStyle { border: 4px #AA0000 solid;}";
		nordFormsModeBML.nordStyle.innerHTML += ".nordFormsModeAriaLiveStyle { border: 4px #00AA00 dotted;}";
		nordFormsModeBML.nordStyle.innerHTML += ".nordAriaFormsModeStyle { border: 4px #00AA00 dashed;}";
		nordFormsModeBML.nordStyle.innerHTML += ".nordLimitedSupportFormsModeStyle { border: 4px #AA0000 double; background-color: #FFFF00;}";
		//nordFormsModeBML.setIconsRed();
		//document.head.appendChild(nordFormsModeBML.nordStyle);
	}, // End of turnOnFormsMode
}

// nordFormsModeBML.run();  <-- This should be run elsewhere
