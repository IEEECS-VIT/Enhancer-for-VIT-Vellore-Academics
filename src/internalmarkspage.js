
/**
 * @function modifyInternalMarksPage
 * Called when the Internal Page is loaded, shows averages and totals
*/

const modifyInternalMarksPage = () => {
        
    jQuery(".tableHeader-level1").map(function() {
        
        var newTableHeader = this.innerHTML.split('\n');   
        // Adds Class Average Weightage Header
        newTableHeader.splice(9, 0, "<td>Class Average Weightage</td>");
        this.innerHTML = newTableHeader.join('');

    }).get();

    jQuery(".tableContent-level1").map(function() {
        
        var newTableContent = this.innerHTML.split('\n');
        var maxMark = newTableContent[3].replace( /[^\d.]/g, '' );
        var weightage = newTableContent[4].replace( /[^\d.]/g, '' );
        var classAverage = newTableContent[8].replace( /[^\d.]/g, '' );
        var classAverageWeightage = classAverage * weightage / maxMark;

        // Adds Class Average Weightage Score
        newTableContent.splice(9, 0, "<td><output>"+ classAverageWeightage.toFixed(2) +"</output></td>");

        this.innerHTML = newTableContent.join('');
        return;

    }).get();


    jQuery('.customTable-level1 > tbody').map(function() {
        
        var totalClassWeightage = 0, totalUserWeightage = 0, totalMaxMark = 0, totalWeightage = 0, totalScoredMark = 0, totalClassAverage = 0;

        // Calculates the total score for each category
        jQuery(this).find(".tableContent-level1").map(function() {
            
            var tableContent = this.innerHTML.split('<td>');

            var maxMark = tableContent[3].replace( /[^\d.]/g, '' );
            var weightage = tableContent[4].replace( /[^\d.]/g, '' );
            var scoredMark = tableContent[6].replace( /[^\d.]/g, '' );
            var userWeightage = tableContent[7].replace( /[^\d.]/g, '' );
            var classAverage = tableContent[8].replace( /[^\d.]/g, '' );
            var classWeightage = tableContent[9].replace( /[^\d.]/g, '' );
            
            totalMaxMark += parseFloat(maxMark);
            totalWeightage += parseFloat(weightage);
            totalScoredMark += parseFloat(scoredMark);
            totalClassAverage += parseFloat(classAverage);
            totalUserWeightage += parseFloat(userWeightage);
            totalClassWeightage += parseFloat(classWeightage);
        })       
        
        // Adds the row to display row
        this.innerHTML += `
        <tr class='tableContent-level1' style='background: #efd2a5;' >
            <td></td>
            <td><b>Total:</b></td>
            <td>` + totalMaxMark.toFixed(2) + `</td>
            <td>` + totalWeightage.toFixed(2) + `</td>
            <td></td>
            <td>` + totalScoredMark.toFixed(2) + `</td>
            <td style='font-weight: 700' >` + totalUserWeightage.toFixed(2) + `</td>
            <td>` + totalClassAverage.toFixed(2) + `</td>
            <td style='font-weight: 700' >` + totalClassWeightage.toFixed(2) + `</td>
            <td></td>
            <td></td>
        </tr>`;

    }).get();

    jQuery.unblockUI();
};

chrome.runtime.onMessage.addListener(request => {
    // alert("Contentscript has received a message from from background script: '" + request.message + "'");
    if (request.message === "MarkViewPage") {
        try {            
            modifyInternalMarksPage();            
        } catch (error) {
            console.log(error);
        }
    }
});  