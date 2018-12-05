// Listener for messages from background
chrome.runtime.onMessage.addListener(request => {
  // alert("Contentscript has received a message from from background script: '" + request.message + "'");
  if (request.message === "ClearCookie?") {
    try {
      if (jQuery("h1")[0].innerHTML === " Not Authorized ") {
        chrome.extension.sendMessage({
          message: "YesClearCookiePls"
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else if (request.message === "ShowLoading") {
    jQuery.blockUI({
      message: "<h1> Wait for it...</h1>"
    });
  }
});
