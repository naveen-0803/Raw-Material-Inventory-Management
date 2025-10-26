var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var itemPageDBName = "ITEMS";
var itemPageRelationName = "ITEMS-TABLE";
var connToken = "90934969|-31949254450284285|90959800";

$('#ItemID').focus();

function disableCtrl(ctrl){
    $('#new').prop("disabled", ctrl);
    $('#save').prop("disabled", ctrl);
    $('#edit').prop("disabled", ctrl);
    $('#change').prop("disabled", ctrl);
    $('#reset').prop("disabled", ctrl);
}

function disableNav(ctrl){
    $('#first').prop("disabled", ctrl);
    $('#prev').prop("disabled", ctrl);
    $('#next').prop("disabled", ctrl);
    $('#last').prop("disabled", ctrl);
}

function disableForm(bValue){
    $('#ItemID').prop("disabled", bValue);
    $('#ItemName').prop("disabled", bValue);
    $('#OpeningStock').prop("disabled", bValue);
    $('#UoM').prop("disabled", bValue);
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
    var ItemID, ItemName, OpeningStock, UoM;
    ItemID = $("#ItemID").val();
    ItemName = $("#ItemName").val();
    OpeningStock = $("#OpeningStock").val();
    UoM = $("#UoM").val();

    if (ItemID === "") {
        alert("Item ID missing");
        $("#ItemID").focus();
        return "";
    }
    if (ItemName === "") {
        alert("Item Name missing");
        $("#ItemName").focus();
        return "";
    }
    if (OpeningStock === "") {
        alert("Opening Stock missing");
        $("#OpeningStock").focus();
        return "";
    }
    if (UoM === "") {
        alert("Unit of measurement is missing");
        $("#UoM").focus();
        return "";
    }

    var jsonStrObj = {
        ItemID: ItemID,
        ItemName: ItemName,
        OpeningStock: OpeningStock,
        UoM: UoM,
    };
    return JSON.stringify(jsonStrObj);
}

function saveRecNo2LS(jsonObj) {
    var lvData = JSON.parse(jsonObj.data);
    localStorage.setItem("curr_rec_no", lvData.rec_no);
}

function fillData(jsonObj) {
    saveRecNo2LS(jsonObj);
    var record = JSON.parse(jsonObj.data).record;
    $("#ItemName").val(record.ItemName);
    $("#OpeningStock").val(record.OpeningStock);
    $("#UoM").val(record.UoM);
}

function getItemIdAsJsonObj() {
    var ItemID = $("#ItemID").val();
    var jsonStr = {
        ItemID: ItemID
    };
    return JSON.stringify(jsonStr);
}
function makeDataFormEmpty() {
    $("#ItemID").val("");
    $("#ItemName").val("");
    $("#OpeningStock").val("");
    $("#UoM").val("");
}

function resetForm() {
    disableCtrl(true);
    disableNav(false);

    var getCurRequest = createGET_BY_RECORDRequest(connToken, itemPageDBName, itemPageRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getCurRequest, jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({async: true});

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
    jQuery.ajaxSetup({async: false});
    var jsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({async: true});
    console.log(jsonObj);
    resetForm();
    $("#ItemID").focus();
    $("#edit").focus();
}

function getPrev() {
    var r = getCurrRecNoFromLS();
    if (r === 1)
    {
        $("#prev").prop("disabled", true);
        $("#first").prop("disabled", true);
    }
    var getPrevRequest = createPREV_RECORDRequest(connToken, itemPageDBName, itemPageRelationName, r);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getPrevRequest, jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({async: true});
    var r = getCurrRecNoFromLS();
    if (r === 1) {
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
    }
    $("#save").prop("disabled", true);
}

function getItemFromItemID() {
    var itemIDJsonObj = getItemIdAsJsonObj();
    var getRequest = createGET_BY_KEYRequest(connToken, itemPageDBName, itemPageRelationName, itemIDJsonObj);
    jQuery.ajaxSetup({async: false});
    var result = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({async: true});
    if (result.status == 400) {
        disableForm(false);
        disableCtrl(true);
        disableNav(true);
        $("#save").prop("disabled", false);
        $("#reset").prop("disabled", false);

    } else if (result.status == 200) {
        $("#ItemID").prop("disabled", true);
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
        $("#ItemName").focus();
    }
}

function getFirst() {
    var getFirstRequest = createFIRST_RECORDRequest(connToken, itemPageDBName, itemPageRelationName);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getFirstRequest, jpdbIRL);
    showData(result);
    setFirstRecNo2LS(result);
    jQuery.ajaxSetup({async: true});
    $('#ItemID').prop("disabled", true);
    $('#first').prop("disabled", true);
    $('#prev').prop("disabled", true);
    $('#next').prop("disabled", false);
    $('#save').prop("disabled", true);
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
    $("#ItemID").prop("disabled", true);
    $("#ItemName").focus();

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
    jQuery.ajaxSetup({async: false});
    var jsonObj = executeCommand(putRequest, jpdbIML);
    jQuery.ajaxSetup({async: true});
    if (isNoRecordPresentLS()) {
        setFirstRecNo2LS(jsonObj);
    }
    setLastRecNo2LS(jsonObj);
    setCurrRecNo2LS(jsonObj);
    resetForm();
}

function getNext() {
    var r = getCurrRecNoFromLS();

    var getNextRequest = createNEXT_RECORDRequest(connToken, itemPageDBName, itemPageRelationName, r);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getNextRequest, jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({async: true});

    $("#save").prop("disabled", true);
}


function newForm() {
    makeDataFormEmpty();

    disableForm(false);
    $("#ItemID").focus();
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

    $('#ItemID').val(data.ItemID);
    $('#ItemName').val(data.ItemName);
    $('#OpeningStock').val(data.OpeningStock);
    $('#UoM').val(data.UoM);

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
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getFirstRequest, jpdbIRL);
    showData(result);
    setFirstRecNo2LS(result);
    jQuery.ajaxSetup({async: true});
    if (result.status == 200) {
        $('#Receipt_No').prop("disabled", true);
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
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getLastRequest, jpdbIRL);
    showData(result);
    setLastRecNo2LS(result);
    jQuery.ajaxSetup({async: true});
    if (result.status == 200) {
        $('#first').prop("disabled", false);
        $('#prev').prop("disabled", false);
        $('#last').prop("disabled", true);
        $('#next').prop("disabled", true);
        $('#save').prop("disabled", true);
    }  
}

initItemForm();
getFirst();
getLast();
