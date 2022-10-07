
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


dlist.addEventListener('keydown', (e) => {
  eventSource = e.key ? 'input' : 'list';
});

dlist.addEventListener('input', (e) => {
  value = e.target.value;
  if (eventSource === 'list') {
    alert('CLICKED! ' + value);
  }
});