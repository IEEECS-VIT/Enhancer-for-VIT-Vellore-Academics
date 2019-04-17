
/**
 * @function modifyInternalMarksPage
 * Called when the Internal Page is loaded, shows averages and totals
*/

const modifyInternalMarksPage = () => {
        
    jQuery(".tableHeader-level1").map(function() {
        
        var newTableHeader = this.innerHTML.split('\n');   
        newTableHeader.splice(9, 0, "<td>Class Average Weightage</td>");
        this.innerHTML = newTableHeader.join('');

    }).get();

    jQuery(".tableContent-level1").map(function() {
        
        var newTableContent = this.innerHTML.split('\n');
        var maxMark = newTableContent[3].replace( /[^\d.]/g, '' );
        var weightage = newTableContent[4].replace( /[^\d.]/g, '' );
        var classAverage = newTableContent[8].replace( /[^\d.]/g, '' );
        var classAverageWeightage = classAverage * weightage / maxMark;

        newTableContent.splice(9, 0, "<td><output>"+ classAverageWeightage.toFixed(2) +"</output></td>");

        this.innerHTML = newTableContent.join('');
        return;

    }).get();

    jQuery.unblockUI();
};

chrome.runtime.onMessage.addListener(request => {
    // alert("Contentscript has received a message from from background script: '" + request.message + "'");
    if (request.message === "MarkViewPage") {
        try {
            jQuery(document).ready(() => {
              // gets the registration number
              regNo =
                jQuery(".VTopHeaderStyle")[0]
                  .innerText.replace("(STUDENT)", "")
                  .trim() || "";
                modifyInternalMarksPage();
            });
        } catch (error) {
            console.log(error);
        }
    }
});  