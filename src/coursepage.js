/**
 * @module CoursePage
 */

/**
 * @function triggerDownloads
 * @param {Object} downloads
 * @param {Object} downloads.linkData
 * @param {Object} downloads.course
 * @param {Object} downloads.facultySlotName
 * Sends message with download information to the background script
 */
const triggerDownloads = downloads => {
  chrome.extension.sendMessage({
    message: downloads
  });
};

/**
 * @function selectAllLinks
 * Selects all the valid links in the course page
 */
const selectAllLinks = () => {
  let value = jQuery("#selectAll").is(":checked");

  jQuery(".sexy-input").prop("checked", value);
};

/**
 * @function getLinkInfo
 * @param {DOMElement} linkElement
 * @param {Number} index
 * retreives link information, and the title
 */
const getLinkInfo = (linkElement, index) => {
  // observational, reference table above has below property
  const linkParent = linkElement.parentElement;
  if (linkParent.outerText.indexOf("_") === -1) {
    const description = jQuery(linkParent)
      .closest("td")
      .prev()[0].innerText.trim();

    const date = jQuery(linkParent)
      .closest("td")
      .prev()
      .prev()
      .prev()[0].innerText.trim();

    let title = (
      (index + 1).toString() +
      "-" +
      description +
      "-" +
      date
    ).replace(/[/:*?"<>|]/g, "_");

    return { url: linkParent.href, title: title };
  }

  return {
    url: linkParent.href,
    title: ""
  };
};

/**
 * @function downloadFiles
 * @param {String} type
 * accepted type: ["all", "selected"]
 * Aggregates download data and pulls the trigger
 */
const downloadFiles = type => {
  const detailsTable = jQuery(jQuery(".table")[0]).find("td");

  const syllabusButton = jQuery(".btn-primary")[0];

  const course = detailsTable[7].innerText.trim() + "-" + detailsTable[8].innerText.trim();

  const facultySlotName = (
    detailsTable[12].innerText.trim() +
    "-" +
    detailsTable[11].innerText.trim()
  ).replace(/[/:*?"<>|]/g, "-");

  const syllabusLink =
    syllabusButton.innerText.trim() === "Download" ? syllabusButton.href : false;

  let allLinks = [...jQuery(".sexy-input")];
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

/**
 * @function modifyPage
 * Called when the course page is loaded, adds the checkboxes and buttons
 */
const modifyPage = () => {
  // add selectAll checkbox
  jQuery("<label />")
    .html("<em>&nbsp;Select All</em>")
    .prepend(
      jQuery("<input/>", {
        type: "checkbox",
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
      '<center>CoursePage Download Manager - Made with ♥, <a href="https://www.github.com/Presto412" target="_blank">Priyansh Jain</a></center>'
    )
  );

  jQuery.unblockUI();
};

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
      console.log(error);
    }
  } else if (request.message === "StoreFacultyPage") {
    try {
      let html = jQuery("#page-wrapper .container")[0].outerHTML;
      chrome.storage.local.set({ facultyHTML: html });
    } catch (error) {
      console.log(error);
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
