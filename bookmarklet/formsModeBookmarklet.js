let btn, bookmarkletAs = null;

let bookmarkletJS = "javascript:void((function(){let%20nfmScript=null;nfmScript=document.getElementById('nordFormsModeBookletScript');if(nfmScript){nordFormsModeBML.reset();nfmScript.parentNode.removeChild(nfmScript);}else{nfmScript=document.createElement('script');nfmScript.setAttribute('src','https://andrewnordlund.github.io/bookmarklets/nordFormsMode-bml.js');nfmScript.setAttribute('id','nordFormsModeBookletScript');document.head.appendChild(nfmScript);}})());"


function init () {
	setupBtnHandler();
	populateBookmarkletTags();
} // End of init

function populateBookmarkletTags () {
	console.log ("Setting bookmarklet ahrefs...");
	bookmarkletAs = document.querySelectorAll("a.bookmarkletLink");
	for (let i = 0; i <  bookmarkletAs.length; i++) {
		console.log ("Setting href...");
		bookmarkletAs[i].setAttribute("href", bookmarkletJS);
	}
} // End of populateBookmarkletTags

function setupBtnHandler () {
	btn = document.getElementById("submitBtn");
	btn.addEventListener("click", function (ev) {
		console.log ("Preventing default");
		ev.preventDefault();
	}, false);
} // End of setupBtnHandler

init();
