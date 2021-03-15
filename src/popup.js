function getTabs() {
	chrome.tabs.query({currentWindow: true}, function(tabs) {
		appendTabs(tabs);
	});
}

function addCloseEvents() {
	// close tabs on click
	var tabs = document.getElementsByClassName("close-click")
	for (i=0; i<tabs.length; i++) {
		tabs[i].addEventListener('click', function() {
			var tabid = Number(this.dataset.tabid);
			chrome.tabs.remove(tabid);

			// when we close a tab we need to remove the tab from the list
			removeTab(tabid);
		});
	}
}

function addFocusEvents() {
	// focus tabs on click
	var tabs = document.getElementsByClassName("focus-click")
	for (i=0; i<tabs.length; i++) {
		tabs[i].addEventListener('click', function() {
			var tabid = Number(this.dataset.tabid);
			console.log("tabid " + tabid);
			chrome.tabs.get(tabid, function(tab) {
				chrome.tabs.highlight({'tabs': tab.index, windowId: tab.windowId}, function() {});
			  });
		});
	}
}

function removeTab(tabid) {
	el = document.querySelector("tr[data-tabid='" + tabid + "']");
	el.remove();
}

function getFaviconUrl(tab) {
	if (isFirefox()) {
		return tab.favIconUrl;
	}
	return "chrome://favicon/" + tab.url;
}

function appendTabs(tabs) {
	var html = "";
	tabs.forEach(function(tab) {
		html += renderTemplate("tab-template", {
			tabid : tab.id,
			favicon : getFaviconUrl(tab),
			title: escapeHtml(tab.title)
		});
	});
	document.getElementById("tablist").innerHTML = html;
	addFocusEvents();
	addCloseEvents();
}

function renderTemplate(id, args) {
	var string = document.getElementById(id).innerHTML;
	for (var key in args) {
		string = string.replaceAll("{" + key + "}", args[key]);
	}
	return string;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function isFirefox(){
	if (navigator.userAgent.search("Firefox") != -1) {
		return true;
	}
	return false;
}

document.addEventListener('DOMContentLoaded', function() {
	getTabs();

	// focus search field
	document.getElementById("search").focus();

	// clear search field on x 
	document.getElementById("clear-search").addEventListener('click', function() {
		document.getElementById("search").value = ""
	});
});

