
var jsonString = document.getElementById("recieptMap").textContent.replaceAll("\'", "\"")
console.log(jsonString)

var data = JSON.parse(jsonString);

console.log(data)

var lineItems = data.LINE_ITEMS

var table = document.getElementById("TABLE");

for(let y = 0; y < lineItems.length; y++){
    
    var lineItem = table.insertRow(); 

    var quantityCell = lineItem.insertCell()
    quantityCell.innerHTML = lineItems[y][0]
    quantityCell.contentEditable = "true"
    quantityCell.width = "10vw"

    var descCell = lineItem.insertCell()
    descCell.innerHTML = lineItems[y][1]
    descCell.contentEditable = "true"
    quantityCell.width = "60px"

    var priceEachCell = lineItem.insertCell()
    priceEachCell.innerHTML = lineItems[y][2]
    priceEachCell.contentEditable = "true"
    priceEachCell.width = "10vw"

    var priceCell = lineItem.insertCell()
    priceCell.innerHTML = parseFloat(lineItems[y][2]) * parseFloat(lineItems[y][0])
    priceCell.contentEditable = "true"
    priceCell.width = "10vw"

    var deleteCell = lineItem.insertCell()
    var deleteButton = document.createElement("button")
    deleteButton.addEventListener('click', function () {
        this.closest('tr').remove();
        }, false);
    deleteButton.style.backgroundColor = "red"
    deleteButton.style.width = "20%"
    deleteButton.style.height = "15px"
    deleteButton.class = "fa fa-close"
    deleteCell.appendChild(deleteButton)
}

console.log()
var subTotalRow = table.insertRow(); 
var subDesc = subTotalRow.insertCell()
subDesc.innerHTML = 'SUBTOTAL (no tip no tax)'
subDesc.contentEditable = "true"
subDesc.width = "60px"

var subAmount = subTotalRow.insertCell()
subAmount.innerHTML = Number((parseFloat(data.TOTAL) - parseFloat(data.TAX)).toFixed(2)) + '$'
subAmount.contentEditable = "true"
subAmount.width = "60px"

var taxRow = table.insertRow(); 
var taxDesc = taxRow.insertCell()
taxDesc.innerHTML = 'TAX'
taxDesc.contentEditable = "true"
taxDesc.width = "60px"

var taxAmount = taxRow.insertCell()
taxAmount.innerHTML = data.TAX+ '$'
taxAmount.contentEditable = "true"
taxAmount.width = "60px"

var totalRow = table.insertRow(); 
var totalDesc = totalRow.insertCell()
totalDesc.innerHTML = 'TOTAL (no tip)'
totalDesc.contentEditable = "true"
totalDesc.width = "60px"

var totalAmount = totalRow.insertCell()
totalAmount.innerHTML = data.TOTAL+ '$'
totalAmount.contentEditable = "true"
totalAmount.width = "60px"

var tipRow = table.insertRow(); 
var tipDesc = tipRow.insertCell()
tipDesc.innerHTML = 'TIP %'
tipDesc.contentEditable = "true"
tipDesc.width = "60px"

var tipAmount = tipRow.insertCell()
tipAmount.contentEditable = "true"
tipAmount.width = "60px"


var table = document.getElementById("postReciept");

function updateReciept(){

    var lineItems = []
    myTab = document.getElementById('TABLE');
    // LOOP THROUGH EACH ROW OF THE TABLE AFTER HEADER.
    for (i = 1; i < myTab.rows.length - 4; i++) {

        // GET THE CELLS COLLECTION OF THE CURRENT ROW.
        var objCells = myTab.rows.item(i).cells;

        var lineItem = []
        // LOOP THROUGH EACH CELL OF THE CURENT ROW TO READ CELL VALUES.
        for (var j = 0; j < objCells.length - 1; j++) {
            lineItem.push(objCells.item(j).innerHTML);
        }
        lineItems.push(lineItem)
    }
    var objCells = myTab.rows.item(myTab.rows.length - 4).cells;

    output = {}
    output["LINE_ITEMS"] = lineItems

    var objCells = myTab.rows.item(myTab.rows.length - 2).cells;
    output["TOTAL"] = objCells.item(1).innerHTML

    objCells = myTab.rows.item(myTab.rows.length - 4).cells;
    output["SUBTOTAL"] = objCells.item(1).innerHTML

    objCells = myTab.rows.item(myTab.rows.length - 3).cells;
    output["TAX"] = objCells.item(1).innerHTML

    objCells = myTab.rows.item(myTab.rows.length - 1).cells;
    output["TIP"] = objCells.item(1).innerHTML

    console.log(output)
    emitNewReciept(output)
}





var xhr = null;
getXmlHttpRequestObject = function () {
    if (!xhr) {
        // Create a new XMLHttpRequest object 
        xhr = new XMLHttpRequest();
    }
    return xhr;
};

function emitNewReciept(output) {
    xhr = getXmlHttpRequestObject();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log(xhr.status);
          console.log(xhr.responseText);
          window.location.href = "/friends";
        }};

    // asynchronous requests
    xhr.open("POST", window.location.href, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(output));
}