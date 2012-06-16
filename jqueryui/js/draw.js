function drawRectangle(x, y, width, height) {
	var root_canvas = document.getElementById("root");
	var context = root_canvas.getContext("2d");
	context.fillRect(x, y, width, height);
}

function drawText(x, y, text) {
	var root_canvas = document.getElementById("root");
	var context = root_canvas.getContext("2d");
	context.font = "bold 12px sans-serif";
	context.fillText(text, x, y);
}

function handleEvent(cmd) {
	$('#output').text(cmd);
	
	items = cmd.split(' ')
	if (items[0] == "TXT") {
		drawText(items[1], items[2], items[3])
	} else if (items[0] == "RECT") {
		drawRectangle(items[1], items[2], items[3], items[4])
	} else if (items[0] == "CLEAR") {
		clearCanvas()
	}
}

function sendExpose(ws) {
	ws.send("EVENT EXPOSE\n")
}

function sendClick(ws, x, y) {
	
	str = "EVENT CLICK " + x + " " + y + "\n"
	ws.send(str)
}

function clearCanvas() {
	var root_canvas = document.getElementById("root");
	root_canvas.width = root_canvas.width;
}

$(document).ready(function() {
		
		var ws = new WebSocket(ws_server);
		var root_canvas = document.getElementById("root");
		var context = root_canvas.getContext("2d");
		root_canvas.addEventListener("click", OnClick, false);
		
		ws.onmessage = function(evt) {
			  handleEvent(evt.data)
		}
		ws.onopen = function(evt) {
				$('#conn_status').html('<b>Connected</b>');
				sendExpose(ws)
		}
		ws.onerror = function(evt) {
				$('#conn_status').html('<b>Error</b>');
		}
		ws.onclose = function(evt) {
				clearCanvas()
				$('#conn_status').html('<b>Closed</b>');
		}
		
		function OnClick(e) {

			var x;
			var y;

			if (e.pageX != undefined && e.pageY != undefined) {
					x = e.pageX;
					y = e.pageY;
			}
			else {
					x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}

			x -= root_canvas.offsetLeft;
			y -= root_canvas.offsetTop;

			sendClick(ws, x, y)
		}
});
