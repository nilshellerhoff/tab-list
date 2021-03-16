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
			chrome.tabs.get(tabid, function(tab) {
				chrome.tabs.highlight({'tabs': tab.index, windowId: tab.windowId}, function() {});
				// close popup window - chrome does this automatically, firefox does not
				window.close();
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
			url: tab.url,
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

function isFirefox() {
	if (navigator.userAgent.search("Firefox") != -1) {
		return true;
	}
	return false;
}

function filterTabs(value) {
	// loop through all tabs and hide those which do not match
	var tabs = document.getElementsByClassName("tab-row");
	for (i=0; i<tabs.length; i++) {
		txtValue = tabs[i].dataset.tabtitle + tabs[i].dataset.taburl
		if (txtValue.toUpperCase().indexOf(value.toUpperCase()) > -1) {
			tabs[i].style.display = '';
		} else {
			tabs[i].style.display = 'none';
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {
	getTabs();

	// focus search field
	document.getElementById("search").focus();

	// clear search field on x + initiate search
	document.getElementById("clear-search").addEventListener('click', function() {
		document.getElementById("search").value = ""
		filterTabs(document.getElementById("search").value);
	});

	// search on change of search value
	document.getElementById("search").addEventListener("keyup", function() {
		filterTabs(document.getElementById("search").value);
	});
});

