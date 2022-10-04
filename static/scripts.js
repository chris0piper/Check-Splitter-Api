// scripts.js


// every 1 second, switch the background color, alternating between the two styles
setInterval(function () {
    sam = document.getElementById('fag');
    sam.style.color = (color ? background1 : background2)
    color = !color;
}, 1000);