chrome.runtime.onMessage.addListener((request) => {
  if (request.message == "openCoursePage") {
    const button = document.createElement("button");
    button.setAttribute(
      "onclick",
      "loadmydiv('academics/common/StudentCoursePage')"
    );
    button.click();
  }

  if (request.message == "openDigitalAssignmentUpload") {
    const button = document.createElement("button");
    button.setAttribute("onclick", "loadmydiv('examinations/StudentDA')");
    button.click();
  }

  if (request.message == "openExamSchedule") {
    const button = document.createElement("button");
    button.setAttribute("onclick", "loadmydiv('examinations/StudExamSchedule')");
    button.click();
  }

  if (request.message == "openMarksView") {
    const button = document.createElement("button");
    button.setAttribute("onclick", "loadmydiv('examinations/StudentMarkView')");
    button.click();
  }

  if (request.message == "openAcademicCalendar") {
    const button = document.createElement("button");
    button.setAttribute("onclick", "loadmydiv('academics/common/CalendarPreview')");
    button.click();
  }

  if (request.message == "openClassAttendance") {
    const button = document.createElement("button");
    button.setAttribute("onclick", "loadmydiv('academics/common/StudentAttendance')");
    button.click();
  }

  if (request.message == "openTimeTable") {
    const button = document.createElement("button");
    button.setAttribute("onclick", "loadmydiv('academics/common/StudentTimeTable')");
    button.click();
  }

  if (request.message == "openEventRegistration") {
    const button = document.createElement("button");
    button.setAttribute("onclick", "loadmydiv('event/swf/loadEventRegistration')");
    button.click();
  }

});
