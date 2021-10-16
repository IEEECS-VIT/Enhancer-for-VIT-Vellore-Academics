// Listener for messages from background

function setTheme(number) {
  let url = chrome.runtime.getURL(
    "styles/general/dark_" + number.toString() + ".css"
  );
  while (true) {
    if (
      document.head.lastChild.href &&
      document.head.lastChild.href.startsWith("chrome")
    ) {
      document.head.lastChild.remove();
    } else {
      break;
    }
  }
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  document.head.appendChild(link);
  link.setAttribute("href", url);

  url = chrome.runtime.getURL("styles/font/font.css");
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  document.head.appendChild(link);
  link.setAttribute("href", url);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message.startsWith("style")) {
    console.log("theme set")
    const index = request.message.split("style:")[1];
    setTheme(index);
    chrome.storage.local.set({ currentTheme: index });
    console.log("done");
  }

  if (request.message === "ShowLoading") {
  } else if (request.from) {
    alert(request.message);
  }
});

chrome.storage.local.get(["currentTheme"], function (result) {
  console.log("result found", result);
  if (result && result.currentTheme) setTheme(result.currentTheme);
});
