let course = "";
let facultySlotName = "";
let fileRename = {};

const downloadIt = request => {
  console.log(request.message);

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

const returnMessage = MessageToReturn => {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {
      message: MessageToReturn
    });
  });
};

//to not interfere with other downloads
const getLocation = href => {
  let l = document.createElement("a");
  l.href = href;
  return l;
};

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

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (
    getLocation(item.url).hostname == "vtopbeta.vit.ac.in" ||
    (getLocation(item.url).hostname == "27.251.102.132" &&
      course &&
      facultySlotName)
  ) {
    const title = getDownloadFileName(item.filename, item.url);
    suggest({
      filename: "VIT Downloads/" + course + "/" + facultySlotName + "/" + title
    });
  }
});

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

chrome.extension.onMessage.addListener(request => {
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
    downloadIt(request);
  }
});
