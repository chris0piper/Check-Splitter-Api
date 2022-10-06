
console.log("am i even being hit?")

var jsonString = document.getElementById("recieptMap").textContent.replaceAll("\'", "\"")
var data = JSON.parse(jsonString);

console.log(data.TOTAL)

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

var table = document.getElementById("postReciept");

function updateReciept(){

    var lineItems = []
    myTab = document.getElementById('TABLE');
    // LOOP THROUGH EACH ROW OF THE TABLE AFTER HEADER.
    for (i = 1; i < myTab.rows.length; i++) {

        // GET THE CELLS COLLECTION OF THE CURRENT ROW.
        var objCells = myTab.rows.item(i).cells;

        var lineItem = []
        // LOOP THROUGH EACH CELL OF THE CURENT ROW TO READ CELL VALUES.
        for (var j = 0; j < objCells.length - 1; j++) {
            lineItem.push(objCells.item(j).innerHTML);
        }
        lineItems.push(lineItem)
    }
    output = {}
    output["LINE_ITEMS"] = lineItems
    output["TOTAL"] = "6969.69"
    output["TAX"] = "69.69"
    output["SUBTOTAL"] = "696.69"
    output["SUS"] = "TRUE"
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