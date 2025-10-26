var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var itemPageDBName = "ITEMS";
var itemPageRelationName = "ITEMS-TABLE";
var PageN0 = 1
var PageSize = 1
var createTime = true
var updateTime = true
var connToken = "90934969|-31949254450284285|90959800";


function getTotalNoOfRecords() {

    var getLastRequest = createLAST_RECORDRequest(connToken, itemPageDBName, itemPageRelationName);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getLastRequest, jpdbIRL);
    jQuery.ajaxSetup({async: true});

    var rec_no_data = JSON.parse(result.data);

    return rec_no_data.rec_no;
}

function putFirstRow() {
    var getFirstRequest = createFIRST_RECORDRequest(connToken, itemPageDBName, itemPageRelationName);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getFirstRequest, jpdbIRL);
    jQuery.ajaxSetup({async: true});


    var data = JSON.parse(result.data).record;
    var rec_no_data = JSON.parse(result.data);

    var curr_rec_no = rec_no_data.rec_no;

    const tableBody = document.querySelector("#myTable tbody");

    const row = document.createElement("tr");

    const ItemID = document.createElement("td");
    ItemID.textContent = data.ItemID;
    row.appendChild(ItemID);

    const ItemName = document.createElement("td");
    ItemName.textContent = data.ItemName;
    row.appendChild(ItemName);

    const currentStock = document.createElement("td");
    currentStock.textContent = parseInt(data.OpeningStock) + parseInt(data.QtyReceived) - parseInt(data.QtyIssued);
    row.appendChild(currentStock);


    tableBody.appendChild(row);
    return curr_rec_no;
}

var curr_rec_no = putFirstRow();
var totalNoOfRecords = getTotalNoOfRecords();

while ((totalNoOfRecords - 1) > 0) {

    var getNextRequest = createNEXT_RECORDRequest(connToken, itemPageDBName, itemPageRelationName, curr_rec_no);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getNextRequest, jpdbIRL);
    jQuery.ajaxSetup({async: true});

    var data = JSON.parse(result.data).record;
    var rec_no_data = JSON.parse(result.data);

    var curr_rec_no = rec_no_data.rec_no;

    const tableBody = document.querySelector("#myTable tbody");

    const row = document.createElement("tr");

    const ItemID = document.createElement("td");
    ItemID.textContent = data.ItemID;
    row.appendChild(ItemID);

    const ItemName = document.createElement("td");
    ItemName.textContent = data.ItemName;
    row.appendChild(ItemName);

    const currentStock = document.createElement("td");
    currentStock.textContent = parseInt(data.OpeningStock) + parseInt(data.QtyReceived) - parseInt(data.QtyIssued);
    row.appendChild(currentStock);


    tableBody.appendChild(row);


    totalNoOfRecords--;
}
