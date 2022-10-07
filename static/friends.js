
var list = document.getElementById('friendsMap');
var stringMap = list.innerHTML.replaceAll("\'", "\"")
var users = JSON.parse(stringMap);
var arrayOfUsers = users["NAMES_TO_IDS"]


var options = '';
for (var i = 0; i < arrayOfUsers.length; i++) {
  options += '<option value="' + arrayOfUsers[i][0] + '" />';
}

var dlist = document.getElementById('anrede')
dlist.innerHTML = options;



var xhr = null;
getXmlHttpRequestObject = function () {
    if (!xhr) {
        // Create a new XMLHttpRequest object 
        xhr = new XMLHttpRequest();
    }
    return xhr;
};

function checkUsername(username) {
    xhr = getXmlHttpRequestObject();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log(xhr.status);
          if(xhr.responseText != "Failed"){
            console.log(xhr.responseText)
            doubleArrayForm = JSON.parse(xhr.responseText)

            var newOptions = '';
            for (var i = 0; i < doubleArrayForm.length; i++) {
              newOptions += '<option value="' + doubleArrayForm[i][0] + '" />';
              arrayOfUsers.push(doubleArrayForm[i])
            }
            dlist.innerHTML = dlist.innerHTML + newOptions            
            return;
          }
          alert("The username you entered is not valid!")
        }};

    // asynchronous requests
    xhr.open("POST", "/checkVenmoUsername", true);
    // xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader('Content-type', 'application/string');

    xhr.send(username);
}

var table = document.getElementById("friendsList");


var dataList = document.getElementById('dlist')
dataList.addEventListener('keydown', (e) => {
  eventSource = e.key ? 'input' : 'list';
  if(e.key === 'Enter'){
    checkUsername(e.target.value)
  }
});

dataList.addEventListener('input', (e) => {
  value = e.target.value;
  if (eventSource === 'list') {
    addFriendToTable(value)
    e.target.value = ''
  }
});


function addFriendToTable(name){
  var friendRow = table.insertRow(); 
  var quantityCell = friendRow.insertCell()
  quantityCell.innerHTML = name
  quantityCell.width = "500px"


  var deleteCell = friendRow.insertCell()
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