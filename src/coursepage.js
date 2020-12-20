/**
 * @module CoursePage
 */

let regNo;

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
 * @function getDownloadLink
 * @param {String} hrefContent href present in the checkboxes
 * @param {String} regNo Registration Number of the User
 */
const getDownloadLink = (hrefContent, regNo) => {
  const url = hrefContent.substring(
    hrefContent.indexOf("'") + 1,
    hrefContent.lastIndexOf("'")
  );
  const now = new Date();
  const params =
    "authorizedID=" + regNo + "&x=" + encodeURIComponent(now.toUTCString());
  return "https://vtop.vit.ac.in/vtop/" + url.trim() + "?" + params;
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
  if (linkElement.outerText.indexOf("_") === -1) {
    const description = jQuery(linkElement)
      .closest("td")
      .prev()[0]
      .innerText.trim();

    const date = jQuery(linkElement)
      .closest("td")
      .prev()
      .prev()
      .prev()[0]
      .innerText.trim();

    let title = (
      (index + 1).toString() +
      "-" +
      description +
      "-" +
      date
    ).replace(/[/:*?"<>|]/g, "_");

    return { url: getDownloadLink(linkElement.href, regNo), title: title };
  }

  return {
    url: getDownloadLink(linkElement.href, regNo),
    title: (index + 1).toString() + "-"
  };
};

/**
 * @function getCourseInfo
 * Returns the coursename and faculty details
 */
function getCourseInfo() {
  const detailsTable = jQuery(jQuery(".table")[0]).find("td");

  const course =
    detailsTable[8].innerText.trim() + "-" + detailsTable[9].innerText.trim();

  const facultySlotName = (
    detailsTable[12].innerText.trim() +
    "-" +
    detailsTable[13].innerText.trim()
  ).replace(/[/:*?"<>|]/g, "-");

  return { course, facultySlotName };
}

/**
 * @function downloadFiles
 * @param {String} type
 * accepted type: ["all", "selected"]
 * Aggregates download data and pulls the trigger
 */
const downloadFiles = type => {
  const syllabusButton = jQuery(".btn-primary")[0];
  const syllabusLink =
    syllabusButton.innerText.trim() === "Download"
      ? syllabusButton.href
      : false;

  let allLinks = [...jQuery(".sexy-input")];
  allLinks = allLinks
    .map((checkbox, index) => {
      if (checkbox["checked"] || type === "all") {
        return getLinkInfo(
          jQuery(jQuery(".sexy-input")[index]).siblings()[0],
          index
        );
      }
      return null;
    })
    .filter(value => value);

  if (syllabusLink && type === "all") {
    allLinks.push({ title: "Syllabus", url: syllabusLink });
  }
  const { course, facultySlotName } = getCourseInfo();

  return triggerDownloads({
    linkData: allLinks,
    course: course,
    facultySlotName: facultySlotName
  });
};

/**
 * @function modifyCoursePage
 * Called when the course page is loaded, adds the checkboxes and buttons
 */
const modifyCoursePage = () => {
  // add selectAll checkbox
  const { course, facultySlotName } = getCourseInfo();
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
  jQuery(".btn-link:not(:contains('Web Material'))").each((index, elem) => {
    jQuery(elem)
      .click(e => {
        e.preventDefault();
        return triggerDownloads({
          linkData: [getLinkInfo(elem, index)],
          course,
          facultySlotName
        });
      })
      .parent()
      .prepend(
        jQuery("<input/>", {
          type: "checkbox",
          class: "sexy-input"
          // "data-index": index.toString()
        })
      );
  });

  // projects page modification
  if (jQuery(".btn-primary").length != 2) {
    jQuery(".btn-primary")
      .last()
      .remove();
  }
  // add new buttons

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
  jQuery("#main-section").append(
    jQuery("<p/>").html(
      '<center>CoursePage Download Manager - Made with ♥, <a href="https://www.github.com/Presto412" target="_blank">Priyansh Jain</a></center>'
    )
  );

  jQuery.unblockUI();
};

// Listener for messages from background
chrome.runtime.onMessage.addListener(request => {
  // alert("Contentscript has received a message from from background script: '" + request.message + "'");
  if (request.message === "ReloadFacultyPage") {
    try {
      chrome.storage.local.get(["facultyHTML"], function (result) {
        if (!result) {
          throw new Error("Invalid");
        }
        jQuery("#main-section").html(result.facultyHTML);
        jQuery.unblockUI();
      });
    } catch (error) {
      console.log(error);
    }
  } else if (request.message === "StoreFacultyPage") {
    try {
      let html = jQuery("#main-section")[0].outerHTML;
      chrome.storage.local.set({ facultyHTML: html });
    } catch (error) {
      console.log(error);
    }
  } else if (request.message === "CoursePageLoaded") {
    try {
      jQuery(document).ready(() => {
        // gets the registration number
        regNo =
          jQuery(".VTopHeaderStyle")[0]
            .innerText.replace("(STUDENT)", "")
            .trim() || "";
        modifyCoursePage();
      });
    } catch (error) {
      console.log(error);
    }
  }
});
