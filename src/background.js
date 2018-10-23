/**
 * @module Background
 */

let course = "";
let facultySlotName = "";
let fileRename = {};

/**
 * @function triggerDownloads
 * @param {Object} request
 * Triggers downloads received from content-script
 */
const triggerDownloads = request => {
  course = request.message.course;
  facultySlotName = request.message.facultySlotName;
  request.message.linkData.forEach(link => {
    fileRename[link.url] = link.title;
    chrome.downloads.download({
      url: link.url,
      conflictAction: "overwrite"
    });
  });
};

/**
 * @function returnMessage
 * @param {String} MessageToReturn
 * Sends a message to the content script
 */
const returnMessage = MessageToReturn => {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {
      message: MessageToReturn
    });
  });
};

//to not interfere with other downloads
/**
 * @function getLocation
 * @param {String} href
 * Creates a link so hostname can be collected
 */
const getLocation = href => {
  let l = document.createElement("a");
  l.href = href;
  return l;
};

/**
 * @function getDownloadFileName
 * @param {String} fname
 * @param {String} url
 * Returns appropriate file title if required.
 */
const getDownloadFileName = (fname, url) => {
  let title = "";
  let count = 0;
  console.log("fname is", fname);

  for (let i = 0; i < fname.length; i++) {
    if (fname[i] === "_") {
      count += 1;
    }
    if (count === 5) {
      const filePrefix = fileRename[url] || "";
      title =
        filePrefix === ""
          ? fname.substr(i + 1, fname.length)
          : filePrefix + fname.substr(i, fname.length);
      break;
    }
  }
  return title;
};

/**
 * Listener for changing the file name on download
 */
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (
    getLocation(item.url).hostname == "vtopbeta.vit.ac.in" ||
    (getLocation(item.url).hostname == "27.251.102.132" &&
      course &&
      facultySlotName)
  ) {
    const title = getDownloadFileName(item.filename, item.url);
    console.log(
      "Filename is:",
      "VIT Downloads/" + course + "/" + facultySlotName + "/" + title
    );
    suggest({
      filename: "VIT Downloads/" + course + "/" + facultySlotName + "/" + title
    });
  }
});

/**
 * Listener for tab updates
 */
chrome.tabs.onUpdated.addListener(() => {
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true
    },
    function(tabs) {
      let id = tabs[0].id;
      returnMessage("ClearCookie?");
    }
  );
});

/**
 * Fires before every request
 */
chrome.webRequest.onBeforeRequest.addListener(
  details => {
    let link = details["url"];
    if (
      link.indexOf("processbackToFilterCourse") !== -1 ||
      link.indexOf("processViewStudentCourseDetail") !== -1
    ) {
      returnMessage("ShowLoading");
    }
  },
  {
    urls: ["*://vtopbeta.vit.ac.in/vtop/*"]
  }
);

/**
 * Fires after the completion of a request
 */
chrome.webRequest.onCompleted.addListener(
  details => {
    let link = details["url"];
    if (link.indexOf("processViewStudentCourseDetail") !== -1) {
      returnMessage("CoursePageLoaded");
    } else if (link.indexOf("processbackToFilterCourse") !== -1) {
      returnMessage("ReloadFacultyPage");
    } else if (link.indexOf("getSlotIdForCoursePage") !== -1) {
      returnMessage("StoreFacultyPage");
    }
  },
  {
    urls: ["*://vtopbeta.vit.ac.in/vtop/*"]
  }
);

/**
 * Fires when a message is received from the content script
 */
chrome.extension.onMessage.addListener(request => {
  console.log("Message recd: ", request.message);

  // alert("Background script has received a message from contentscript:'" + request.message + "'");
  if (request.message == "YesClearCookiePls") {
    chrome.cookies.remove(
      {
        url: "https://vtopbeta.vit.ac.in/vtop/",
        name: "JSESSIONID"
      },
      function() {
        chrome.tabs.getSelected(null, function(tab) {
          let code =
            "window.opener.location = 'https://vtopbeta.vit.ac.in/vtop/'; window.close();";
          chrome.tabs.executeScript(tab.id, {
            code: code
          });
        });
      }
    );
  } else {
    triggerDownloads(request);
  }
});
