const triggerDownloads = downloads => {
  // alert("Contentscript is sending a message to background script: '" + contentScriptMessage  + "'");
  chrome.extension.sendMessage({
    message: downloads
  });
};

const selectAllLinks = () => {
  let links = [...document.getElementsByClassName("sexy-input")];
  links.forEach(link => {
    link["checked"] = document.getElementById("selectAll")["checked"];
  });
};

const getLinkInfo = (linkElement, index) => {
  // observational, reference table above has below property
  if (linkElement.parentElement.outerText.indexOf("_") === -1) {
    const description =
      linkElement.parentElement.parentElement.previousElementSibling.innerText;
    const date =
      linkElement.parentElement.parentElement.previousElementSibling
        .previousElementSibling.previousElementSibling.innerText;
    let title = (index + 1).toString() + "-" + description + "-" + date;
    title = title.replace(/[/:*?"<>|]/g, "_");
    return { url: linkElement.value, title: title };
  }
  return {
    url: linkElement.value,
    title: ""
  };
};

const downloadFiles = type => {
  const detailsTable = document
    .getElementsByClassName("table")[0]
    .getElementsByTagName("td");

  const syllabusLink =
    document.getElementsByClassName("btn btn-primary")[0].innerText ===
    "Download"
      ? document.getElementsByClassName("btn btn-primary")[0].href
      : false;

  let allLinks = [...document.getElementsByClassName("sexy-input")];

  const course = detailsTable[7].innerText + "-" + detailsTable[8].innerText;
  let facultySlotName =
    detailsTable[12].innerText + "-" + detailsTable[11].innerText;
  facultySlotName = facultySlotName.replace(/[/]/g, "-");

  allLinks = allLinks
    .map((link, index) => {
      if (link["checked"] || type === "all") {
        return getLinkInfo(link, index);
      }
      return null;
    })
    .filter(value => value);

  if (syllabusLink && type === "all") {
    allLinks.push({ title: "Syllabus", url: syllabusLink });
  }

  return triggerDownloads({
    linkData: allLinks,
    course: course,
    facultySlotName: facultySlotName
  });
};

const modifyPage = () => {
  // add selectAll checkbox
  jQuery("<label />")
    .html("<em>&nbsp;Select All</em>")
    .prepend(
      jQuery("<input/>", {
        type: "checkbox",
        class: "sexy-input",
        id: "selectAll"
      }).click(() => selectAllLinks())
    )
    .appendTo(jQuery(".table-responsive")[0]);

  // add checkboxes
  jQuery(".btn-link:not(:contains('Web Material'))").prepend(
    jQuery("<input/>", {
      type: "checkbox",
      class: "sexy-input"
    })
  );

  // add new buttons
  jQuery(".btn-primary")
    .last()
    .remove();

  jQuery("<input/>", {
    type: "button",
    class: "btn btn-primary",
    style: "margin:4px;padding:3px 16px;font-size:13px;background-color:black;",
    value: "Download All Files",
    id: "downloadAll"
  })
    .click(() => downloadFiles("all"))
    .insertAfter(jQuery(".btn-primary").last());

  jQuery("<input/>", {
    type: "button",
    class: "btn btn-primary",
    style: "margin:4px;padding:3px 16px;font-size:13px;background-color:black;",
    value: "Download Selected Files",
    id: "downloadSelected"
  })
    .click(() => downloadFiles("selected"))
    .insertAfter(jQuery("#downloadAll"));

  // add credits
  jQuery("#page-wrapper").append(
    jQuery("<p/>").html(
      '<center>CoursePage Download Manager- Made with ♥, <a href="https://www.github.com/Presto412" target="_blank">Priyansh Jain</a></center>'
    )
  );

  jQuery.unblockUI();
};

chrome.runtime.onMessage.addListener(request => {
  // alert("Contentscript has received a message from from background script: '" + request.message + "'");
  if (request.message === "ClearCookie?") {
    try {
      if (
        document.getElementsByTagName("h1")[0].innerHTML === " Not Authorized "
      ) {
        chrome.extension.sendMessage({
          message: "YesClearCookiePls"
        });
      }
    } catch (error) {}
  } else if (request.message === "ReloadFacultyPage") {
    try {
      chrome.storage.local.get(["facultyHTML"], function(result) {
        if (!result) {
          throw new Error("Invalid");
        }
        jQuery("#page-wrapper").html(result.facultyHTML);
        jQuery.unblockUI();
      });
    } catch (error) {
      console.log("faced error", error);
    }
  } else if (request.message === "StoreFacultyPage") {
    try {
      let html = jQuery("#page-wrapper .container")[0].outerHTML;
      chrome.storage.local.set({ facultyHTML: html });
    } catch (error) {
      console.log("faced error", error);
    }
  } else if (request.message === "ShowLoading") {
    jQuery.blockUI({
      message: "<h1> Wait for it...</h1>"
    });
  } else {
    try {
      modifyPage();
    } catch (error) {
      console.log(error);
    }
  }
});
