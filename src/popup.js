// Once the DOM is ready...

window.addEventListener("DOMContentLoaded", function () {
  // document.getElementById("themeSet").onclick = function () {
  //   for (let i of document.getElementsByName("themeSelect")) {
  //     if (i.checked) {
  //       chrome.tabs.query(
  //         { active: true, currentWindow: true },
  //         function (tabs) {
  //           chrome.tabs.sendMessage(tabs[0].id, {
  //             message: "style:" + i.value,
  //           });
  //         }
  //       );
  //       break;
  //     }
  //   }
  // };

  document.getElementById("openDigitalAssignmentUpload").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openDigitalAssignmentUpload",
      });
    });
  };

  document.getElementById("openCoursePage").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openCoursePage",
      });
    });
  };


  document.getElementById("openExamSchedule").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openExamSchedule",
      });
    });
  };

  document.getElementById("openMarksView").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openMarksView",
      });
    });
  };

  document.getElementById("openAcademicCalendar").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openAcademicCalendar",
      });
    });
  };

  document.getElementById("openClassAttendance").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openClassAttendance",
      });
    });
  };

  document.getElementById("openTimeTable").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openTimeTable",
      });
    });
  };

  document.getElementById("openEventRegistration").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "openEventRegistration",
      });
    });
  };

  let flag = true;

  document.getElementById("moreactions").addEventListener("click", function () {
    if (flag) {
      document.getElementsByClassName("none")[0].style.display = "block";
      document.getElementsByClassName("none")[1].style.display = "block";
      document.getElementsByClassName("none")[2].style.display = "block";
      document.getElementsByClassName("none")[3].style.display = "block";
      document.getElementById("content").style.height = "587px";
      document.getElementsByClassName("last")[0].style.marginBottom = "0px";
      document.getElementById("downarrow").style.display = "none";
      document.getElementById("uparrow").style.display = "inline";
      flag = false;
    }
    else {
      document.getElementsByClassName("none")[0].style.display = "none";
      document.getElementsByClassName("none")[1].style.display = "none";
      document.getElementsByClassName("none")[2].style.display = "none";
      document.getElementsByClassName("none")[3].style.display = "none";
      document.getElementById("content").style.height = "360px";
      document.getElementsByClassName("last")[0].style.marginBottom = "12.5px";
      document.getElementById("downarrow").style.display = "inline";
      document.getElementById("uparrow").style.display = "none";
      flag = true;
    }
  });

  let modeFlag = true;
  chrome.storage.sync.get(['mode'], function (result) {
    if (result.mode === "Dark Mode") {
      modeFlag = true;
      document.getElementById("modeText").innerHTML = "Light Mode";
      document.getElementsByTagName("link")[3].setAttribute("href", "styles/general/darkMode.css");
    }
    else {
      modeFlag = false;
      document.getElementById("modeText").innerHTML = "Dark Mode";
      document.getElementsByTagName("link")[3].setAttribute("href", "styles/general/lightMode.css");
    }
  });

  document.getElementById("mode").addEventListener("click", function () {
    if (modeFlag) {
      document.getElementById("modeText").innerHTML = "Light Mode";
      document.getElementsByTagName("link")[3].setAttribute("href", "styles/general/darkMode.css");
      modeFlag = false;
      chrome.storage.sync.set({ mode: "Dark Mode" }, function () {
        console.log('Value is set to ' + value);
      });
      chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            message: "style:" + 5,
          });
        }
      );
    }
    else {
      document.getElementById("modeText").innerHTML = "Dark Mode";
      document.getElementsByTagName("link")[3].setAttribute("href", "styles/general/lightMode.css");
      modeFlag = true;
      chrome.storage.sync.set({ mode: "Light Mode" }, function () {
        console.log('Value is set to ' + value);
      });
      chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            message: "style:" + 0,
          });
        }
      );
    }
  })
});
