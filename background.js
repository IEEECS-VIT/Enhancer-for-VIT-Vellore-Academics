let course = "";
let faculty_slotname = "";
let fileRename = {};

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

chrome.extension.onMessage.addListener((request, sender) => {
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

const downloadIt = request => {
  course = request.message[2];
  faculty_slotname = request.message[3];
  for (let i = 0; i < request.message[0].length; i++) {
    let url = request.message[0][i];
    let file_name = request.message[1][i];
    fileRename[url] = file_name;
    chrome.downloads.download({
      url: request.message[0][i],
      conflictAction: "uniquify"
    });
  }
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

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (
    getLocation(item.url).hostname == "vtopbeta.vit.ac.in" ||
    (getLocation(item.url).hostname == "27.251.102.132" &&
      course &&
      faculty_slotname)
  ) {
    let fname = item.filename;
    let title = "";
    let count = 0;
    for (let i = 0; i < fname.length; i++) {
      if (fname[i] == "_") {
        count += 1;
      }
      if (count == 5) {
        if (fileRename[item.url] == "") {
          title = fname.substr(i + 1, fname.length);
          break;
        } else {
          title = fileRename[item.url] + fname.substr(i, fname.length);
          break;
        }
      }
    }
    if (course && faculty_slotname) {
      suggest({
        filename:
          "VIT Downloads/" + course + "/" + faculty_slotname + "/" + title
      });
    }
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
