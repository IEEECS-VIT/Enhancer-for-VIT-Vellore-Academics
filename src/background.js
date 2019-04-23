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
  // splits after the fifth occurence of '_'
  fname = fname.replace(/([^_]*_){5}/, "");
  const filePrefix = fileRename[url] || "";
  const index = fname[0] === "_" ? 1 : 0;
  const title = filePrefix + fname.substr(index, fname.length);
  return title;
};

/**
 * Listener for changing the file name on download
 */
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (
    (getLocation(item.url).hostname == "vtop.vit.ac.in" ||
      getLocation(item.url).hostname == "27.251.102.132") &&
    course != "" &&
    facultySlotName != ""
  ) {
    const title = getDownloadFileName(item.filename, item.url);
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
      // let id = tabs[0].id;
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
    urls: ["*://vtop.vit.ac.in/*"]
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
    } else if (link.indexOf("doStudentMarkView") !== -1 ) {
      returnMessage("MarkViewPage");
    }

  },
  {
    urls: ["*://vtop.vit.ac.in/*"]
  }
);

/**
 * Fires when a message is received from the content script
 */
chrome.extension.onMessage.addListener(request => {
  // alert("Background script has received a message from contentscript:'" + request.message + "'");
  if (request.action == "xhttp") {
      
    fetch(request.url, {
        method: request.method,        
        body: request.data
    })
    .then(response => response.json()); 

    return true; // prevents the callback from being called too early on return
  }
  if (request.message == "YesClearCookiePls") {
    chrome.cookies.remove(
      {
        url: "https://vtop.vit.ac.in/vtop/",
        name: "JSESSIONID"
      },
      function() {
        chrome.tabs.getSelected(null, function(tab) {
          let code =
            "window.opener.location = 'https://vtop.vit.ac.in/vtop/'; window.close();";
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
