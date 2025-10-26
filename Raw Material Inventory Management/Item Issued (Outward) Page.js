var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var itemPageDBName = "ITEMS";
var itemPageRelationName = "OUTWARD";
var itemPageRelationName_item = "ITEMS-TABLE"
var connToken = "90934969|-31949254450284285|90959800";

$('#IssueNo').focus();

function disableCtrl(ctrl) {
    $('#new').prop("disabled", ctrl);
    $('#save').prop("disabled", ctrl);
    $('#edit').prop("disabled", ctrl);
    $('#change').prop("disabled", ctrl);
    $('#reset').prop("disabled", ctrl);
}

function disableNav(ctrl) {
    $('#first').prop("disabled", ctrl);
    $('#prev').prop("disabled", ctrl);
    $('#next').prop("disabled", ctrl);
    $('#last').prop("disabled", ctrl);
}

function disableForm(bValue) {
    $('#IssueNo').prop("disabled", bValue);
    $('#IssueDate').prop("disabled", bValue);
    $('#ItemID').prop("disabled", bValue);
    $('#QtyIssued').prop("disabled", bValue);
}

function initItemForm() {
    localStorage.removeItem("first_rec_no");
    localStorage.removeItem("last_rec_no");
    localStorage.removeItem("curr_rec_no");

    disableCtrl(true);
    disableNav(true);
    disableForm(true);
    $('#new').prop("disabled", false);
}

function validateData() {
    var IssueNo, IssueDate, ItemID, QtyIssued;
    IssueNo = $("#IssueNo").val();
    IssueDate = $("#IssueDate").val();
    ItemID = $("#ItemID").val();
    QtyIssued = $("#QtyIssued").val();

    if (IssueNo === "") {
        alert("Item ID missing");
        $("#IssueNo").focus();
        return "";
    }
    if (IssueDate === "") {
        alert("Item Name missing");
        $("#IssueDate").focus();
        return "";
    }
    if (ItemID === "") {
        alert("Opening Stock missing");
        $("#ItemID").focus();
        return "";
    }
    if (QtyIssued === "") {
        alert("Unit of measurement is missing");
        $("#QtyIssued").focus();
        return "";
    }

    var jsonStrObj = {
        IssueNo: IssueNo,
        IssueDate: IssueDate,
        ItemID: ItemID,
        QtyIssued: QtyIssued,
    };
    return JSON.stringify(jsonStrObj);
}

function saveRecNo2LS(jsonObj) {
    var lvData = JSON.parse(jsonObj.data);
    localStorage.setItem("curr_rec_no", lvData.rec_no);
}




function makeDataFormEmpty() {
    $("#IssueNo").val("");
    $("#IssueDate").val("");
    $("#ItemID").val("");
    $("#QtyIssued").val("");
}

function resetForm() {
    disableCtrl(true);
    disableNav(false);

    var getCurRequest = createGET_BY_RECORDRequest(connToken, itemPageDBName, itemPageRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getCurRequest, jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({ async: true });

    if (isOnlyOneRecordPresent() || isNoRecordPresentLS()) {
        disableNav(true);
    }

    $("#new").prop("disabled", false);
    if (isNoRecordPresentLS()) {
        makeDataFormEmpty();
        $("#edit").prop("disabled", true);
    } else {
        $("#edit").prop("disabled", false);
    }
    disableForm(true);
}

function changeData() {
    jsonObj = validateData();
    var updateRequest = createUPDATERecordRequest(connToken, jsonObj, itemPageDBName, itemPageRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({ async: false });
    var jsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });
    console.log(jsonObj);
    resetForm();
    $("#IssueNo").focus();
    $("#edit").focus();
}

function getPrev() {
    var r = getCurrRecNoFromLS();
    if (r === 1) {
        $("#prev").prop("disabled", true);
        $("#first").prop("disabled", true);
    }
    var getPrevRequest = createPREV_RECORDRequest(connToken, itemPageDBName, itemPageRelationName, r);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getPrevRequest, jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({ async: true });
    var r = getCurrRecNoFromLS();
    if (r === 1) {
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
    }
    $("#save").prop("disabled", true);
}

function fillData(jsonObj) {
    saveRecNo2LS(jsonObj);
    var record = JSON.parse(jsonObj.data).record;
    $("#IssueDate").val(record.IssueDate);
    $("#ItemID").val(record.ItemID);
    $("#QtyIssued").val(record.QtyIssued);
}

function getItemIdAsJsonObj() {
    var IssueNo = $("#IssueNo").val();
    var jsonStr = {
        IssueNo: IssueNo
    };
    return JSON.stringify(jsonStr);
}

function getItemFromItemID() {
    var itemIDJsonObj = getItemIdAsJsonObj();
    var getRequest = createGET_BY_KEYRequest(connToken, itemPageDBName, itemPageRelationName, itemIDJsonObj);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });
    if (result.status == 400) {
        disableForm(false);
        disableCtrl(true);
        disableNav(true);
        $("#save").prop("disabled", false);
        $("#reset").prop("disabled", false);

    } else if (result.status == 200) {
        $("#IssueNo").prop("disabled", true);
        fillData(result);

        if (getCurrRecNoFromLS() === getLastRecNoFromLS()) {
            disableNav(true);
            $("#first").prop("disabled", false);
            $("#prev").prop("disabled", false);
            disableCtrl(true);
            $("#new").prop("disabled", false);
            $("#edit").prop("disabled", false);
            $("#reset").prop("disabled", false);
        } else if (getCurrRecNoFromLS() === getFirstRecNoFromLS()) {
            disableNav(true);
            $("#next").prop("disabled", false);
            $("#last").prop("disabled", false);
            disableCtrl(true);
            $("#new").prop("disabled", false);
            $("#edit").prop("disabled", false);
            $("#reset").prop("disabled", false);
        } else {
            disableNav(false);
            disableCtrl(true);
            $("#new").prop("disabled", false);
            $("#edit").prop("disabled", false);
            $("#reset").prop("disabled", false);
        }
        $("#IssueDate").focus();
    }
}


function isOnlyOneRecordPresent() {
    if (isNoRecordPresentLS()) {
        return false;
    }
    if (getFirstRecNoFromLS() === getLastRecNoFromLS()) {
        return true;
    }
    return false;
}

function getLastRecNoFromLS() {
    return localStorage.getItem("last_rec_no");
}

function getFirstRecNoFromLS() {
    return localStorage.getItem("first_rec_no");
}

function isNoRecordPresentLS() {
    if (getFirstRecNoFromLS() === "0" && getLastRecNoFromLS() === "0") {
        return true;
    }
    return false;
}

function setFirstRecNo2LS(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined) {
        localStorage.setItem("first_rec_no", "0");
    } else {
        localStorage.setItem("first_rec_no", data.rec_no);
    }
}

function editData() {
    disableForm(false);
    $("#IssueNo").prop("disabled", true);
    $("#IssueDate").focus();

    disableNav(true);
    disableCtrl(true);
    $("#change").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function saveData() {
    var jsonStrObj = validateData();
    if (jsonStrObj === "") {
        return "";
    }
    var putRequest = createPUTRequest(connToken, jsonStrObj, itemPageDBName, itemPageRelationName);
    jQuery.ajaxSetup({ async: false });
    var jsonObj = executeCommand(putRequest, jpdbIML);
    jQuery.ajaxSetup({ async: true });
    if (isNoRecordPresentLS()) {
        setFirstRecNo2LS(jsonObj);
    }
    setLastRecNo2LS(jsonObj);
    setCurrRecNo2LS(jsonObj);
    resetForm();
    ifItemIDExists_saveQuantity_to_ItemsTable();
}

function getItemIdAsJsonObj_item() {
    var ItemID = $("#ItemID").val();
    var jsonStr = {
        ItemID: ItemID
    };
    return JSON.stringify(jsonStr);
}

function getQtyIssuedAsJsonObj() {
    var QtyIssued = $("#QtyIssued").val();
    var jsonStr = {
        QtyIssued: QtyIssued
    };
    return JSON.stringify(jsonStr);
}


function putQtyIssued(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    var QtyIssuedJsonObj = getQtyIssuedAsJsonObj();
    var updateRequest = createUPDATERecordRequest(connToken, QtyIssuedJsonObj, itemPageDBName, itemPageRelationName_item, data.rec_no);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });
}


function ifItemIDExists_saveQuantity_to_ItemsTable() {
    var itemIDJsonObj = getItemIdAsJsonObj_item();
    var getRequest = createGET_BY_KEYRequest(connToken, itemPageDBName, itemPageRelationName_item, itemIDJsonObj);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });
    if (result.status === 200) {
        putQtyIssued(result);
    }

}

function getNext() {
    var r = getCurrRecNoFromLS();

    var getNextRequest = createNEXT_RECORDRequest(connToken, itemPageDBName, itemPageRelationName, r);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getNextRequest, jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({ async: true });

    $("#save").prop("disabled", true);
}


function newForm() {
    makeDataFormEmpty();

    disableForm(false);
    $("#IssueNo").focus();
    disableNav(true);
    disableCtrl(true);

    $("#save").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function getCurrRecNoFromLS() {
    return localStorage.getItem("curr_rec_no")
}

function setCurrRecNo2LS(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    localStorage.setItem("curr_rec_no", data.rec_no);
}

function showData(jsonObj) {
    if (jsonObj.status === 400) {
        return;
    }
    var data = (JSON.parse(jsonObj.data)).record;
    setCurrRecNo2LS(jsonObj);

    $('#IssueNo').val(data.IssueNo);
    $('#IssueDate').val(data.IssueDate);
    $('#ItemID').val(data.ItemID);
    $('#QtyIssued').val(data.QtyIssued);

    disableNav(false);
    disableForm(true);

    $('#save').prop("disabled", true);
    $('#change').prop("disabled", true);
    $('#reset').prop("disabled", true);

    $('#new').prop("disabled", false);
    $('#edit').prop("disabled", false);

    if (getCurrRecNoFromLS() === getLastRecNoFromLS()) {
        $("#next").prop("disabled", true);
        $("#last").prop("disabled", true);
    }

    if (getCurrRecNoFromLS() === getFirstRecNoFromLS()) {
        $("#prev").prop("disabled", true);
        $("#first").prop("disabled", true);
        return;
    }
}

function getFirst() {
    var getFirstRequest = createFIRST_RECORDRequest(connToken, itemPageDBName, itemPageRelationName);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getFirstRequest, jpdbIRL);
    showData(result);
    setFirstRecNo2LS(result);
    jQuery.ajaxSetup({ async: true });
    if (result.status == 200) {
        $('#IssueNo').prop("disabled", true);
        $('#first').prop("disabled", true);
        $('#prev').prop("disabled", true);
        $('#next').prop("disabled", false);
        $('#save').prop("disabled", true);
    }
}

function setLastRecNo2LS(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined) {
        localStorage.setItem("last_rec_no", "0");
    } else {
        localStorage.setItem("last_rec_no", data.rec_no);
    }
}

function getLast() {
    var getLastRequest = createLAST_RECORDRequest(connToken, itemPageDBName, itemPageRelationName);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getLastRequest, jpdbIRL);
    showData(result);
    setLastRecNo2LS(result);
    jQuery.ajaxSetup({ async: true });
    if (result.status == 200) {
        $('#first').prop("disabled", false);
        $('#prev').prop("disabled", false);
        $('#last').prop("disabled", true);
        $('#next').prop("disabled", true);
        $('#save').prop("disabled", true);
    }
}

function getItemName() {
    var itemIDJsonObj = getItemIdAsJsonObj_item();
    var getRequest = createGET_BY_KEYRequest(connToken, itemPageDBName, itemPageRelationName_item, itemIDJsonObj);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });
    // console.log(typeof(data.ItemName));

    if (result.status == 400) {
        alert("Item not Present");
        $('#QtyIssued').prop("disabled", true);
        $('#ItemID').focus();
        $('#new').prop("disabled", false);
    }
    if (result.status == 200) {
        var data = (JSON.parse(result.data)).record;
        let newValue = $('#ItemID').val() + "-" + data.ItemName; 
        $('#ItemID').val(newValue);
        $('#QtyIssued').prop("disabled", false);
        $('#QtyIssued').focus();

    }
}

initItemForm();
getFirst();
getLast();
