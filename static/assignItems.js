
var jsonString = document.getElementById("itemsMap").textContent.replaceAll("\'", "\"")
var data = JSON.parse(jsonString);

var friends = data.friends.FRIENDS
var lineItems = data.LINE_ITEMS

console.log(friends)
console.log(lineItems)



for(let i = 0; i < friends.length; i++){
    let header = document.createElement("h1");
    header.innerHTML = 'Enter ' + friends[i][0] + '\'s items.'
    document.body.appendChild(header)

    let quantityHeader = document.createElement("th");
    quantityHeader.innerHTML = "TOTAL QUANTITY"

    let descHeader = document.createElement("th");
    descHeader.innerHTML = "DESCRIPTION"

    let priceOfEachHeader = document.createElement("th");
    priceOfEachHeader.innerHTML = "PRICE OF EACH"

    let usersQuantityHeader = document.createElement("th");
    usersQuantityHeader.innerHTML = friends[i][0] + '\'s Quantity'

    let row = document.createElement("tr");
    row.appendChild(quantityHeader)
    row.appendChild(descHeader)
    row.appendChild(priceOfEachHeader)
    row.appendChild(usersQuantityHeader)

    let table = document.createElement("table");
    table.id = "table" + i;
    table.appendChild(row);
    document.body.appendChild(table)


    for(let y = 0; y < lineItems.length; y++){
        
        var lineItem = table.insertRow(); 

        var quantityCell = lineItem.insertCell()
        quantityCell.innerHTML = lineItems[y][0]
        quantityCell.width = "10vw"

        var descCell = lineItem.insertCell()
        descCell.innerHTML = lineItems[y][1]
        quantityCell.width = "60px"

        var priceEachCell = lineItem.insertCell()
        priceEachCell.innerHTML = lineItems[y][2]
        priceEachCell.width = "10vw"

        var priceCell = lineItem.insertCell()
        priceCell.innerHTML = "0"
        priceCell.contentEditable = "true"
        priceCell.width = "10vw"

        // var deleteCell = lineItem.insertCell()
        // var deleteButton = document.createElement("button")
        // deleteButton.addEventListener('click', function () {
        //     this.closest('tr').remove();
        //     }, false);
        // deleteButton.style.backgroundColor = "red"
        // deleteButton.style.width = "20%"
        // deleteButton.style.height = "15px"
        // deleteButton.class = "fa fa-close"
        // deleteCell.appendChild(deleteButton)
    }


}

function saveItemSelections(){
    console.log("DAFAQ")
    friendsAndItems = {}

    for(let i = 0; i < friends.length; i++){
        var table = document.getElementById("table" + i)
        var lineItems =[]
        for (j = 1; j < table.rows.length; j++) {
            // GET THE CELLS COLLECTION OF THE CURRENT ROW.
            var objCells = table.rows.item(j).cells;
            
            if(objCells.item(3).innerHTML != null && objCells.item(3).innerHTML != 0){
                // userQuantity, desc, priceOfEach
                lineItems.push([objCells.item(3).innerHTML, objCells.item(1).innerHTML, objCells.item(2).innerHTML])
            }
        }
        var userID = friends[i][1]
        friendsAndItems[userID] = lineItems
    }


    emitFriendsAndItmes(friendsAndItems);

}


let submit = document.createElement("button");
submit.innerHTML = "Submit me!";
submit.onclick = function(){
    saveItemSelections();
};
document.body.appendChild(submit)




var xhr = null;
getXmlHttpRequestObject = function () {
    if (!xhr) {
        // Create a new XMLHttpRequest object 
        xhr = new XMLHttpRequest();
    }
    return xhr;
};

function emitFriendsAndItmes(output) {
    xhr = getXmlHttpRequestObject();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log(xhr.status);
          console.log(xhr.responseText);
          window.location.href = "/success";
        }};
  
    // asynchronous requests
    xhr.open("POST", "/assignItems", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(output));
  }