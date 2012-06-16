/*

The MIT License (MIT)
Copyright (c) 2011 Derek Ingrouville, Julien Lord, Muthucumaru Maheswaran

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
*/

$(document).ready(function() {
	/* There's something to be said for moving all these off into
	 * a single Object instead of multiple Arrays.
	 * Left to the TODO pile for now
	 */ 
	var _codedKeys = [16, 17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 144, 155, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 157]; //pjs thing
	var _text_areas		= new Array();
	var _remote_vars	= new Array();
	var _loaded_fonts	= new Array();
	var _pmx 			= -1;
	var _pmy 			= -1;
	/* Initialise callback checks to false */
	/* TODO: Maybe template this file and have twisted insert these values on the fly? */
	var _keys			= new Array();
	_keys['TYP']		= "NONE";
	_keys['PRE']		= "NONE";
	
	var _cb 			= new Array();
	_cb['CLICK'] 		= false;
	_cb['MMOVE'] 		= false;
	_cb['MDRAG'] 		= false;
	_cb['MDRAGOUT']		= false;
	_cb['MDOWN'] 		= false;
	_cb['DROP']			= false;
	_cb['RESIZE']		= false;
	/* Callbacks for keys can be everything or individual keys */
	_cb['KEYST']		= false;
	_cb['KEYSP']		= false;
	_cb['KEYSR']		= false;
	
	var ws = new WebSocket(ws_server);
	// var root_canvas = document.getElementById("root");
	// var context = root_canvas.getContext("2d");

	// This will need to be more flexible.
	var canvas = document.getElementById("root");
	var parent = canvas.parentNode;
	/* Not sure I actually need this for my purpose.
	canvas.addEventListener('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
	}, false);
	*/
	
	// attaching the Processing engine to the canvas
	p = new Processing(canvas);
	p.noLoop();
	
	ws.onmessage = function(evt) {
		handleEvent("("+evt.data+")", p);
	}
	ws.onopen = function(evt) {
		var str = "EVENT SETUP " + document.width + " " + document.height + "\n";
		ws.send(str);
		$('#conn_status').html('<b>Connected</b>');
		sendExpose(ws);
	}
	ws.onerror = function(evt) {
		$('#conn_status').html('<b>Error</b>');
	}
	ws.onclose = function(evt) {
		//clearCanvas(p);
		$('#conn_status').html('<b>Closed</b>');
	}
	$(function() {
		$( ".draggable" ).draggable({cancel: "canvas, textarea"});
		$( "div.draggable, canvas" ).disableSelection();
	});
	function clearCanvas(p) {
		p.background(255);
	}
	function pollRemoteValue(name) {
		if (name in _remote_vars) {
			ws.send("POLL " + name + " " + _remote_vars[name] + "\n");
		} else {
			ws.send("POLL " + name + " NULL\n");
		}
	}
	function setRemoteVariable(name, newValue) {
		/* NB This will overwrite existing variables with the same name */
		_remote_vars[name] = value;
	}
	
	function handleEvent(cmd, p) {
		cmd = eval(cmd);
		//p.println(cmd.name + ", args: " + cmd.args);
		
		switch(cmd.name) {
			case "TXT":
				p.text(cmd.args[0], cmd.args[1], cmd.args[2]);
			break;
			case "ARC":
				p.arc(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3], cmd.args[4], cmd.args[5]);
			break;
			case "ELIP":
				p.ellipse(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
			break;
			case "LI2D":
				p.line(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
			break;
			case "PO2D":
				p.point(cmd.args[0], cmd.args[1]);
			break;
			case "QUAD":
				p.quad(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3], cmd.args[4], cmd.args[5], cmd.args[6], cmd.args[7]);
			break;
			case "RECT":
				p.rect(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
			break;
			case "TRI":
				p.triangle(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3], cmd.args[4], cmd.args[5]);
			break;
			case "BG":
				p.background(cmd.args[0], cmd.args[1], cmd.args[2]);
			break;
			case "CM_D":
			case "CM_F":
				/* NB there's now redundancy since we don't need to cast arguments anymore */
				p.colorMode(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
			break;
			case "ST_D":
			case "ST_F":
				p.stroke(cmd.args[0], cmd.args[1], cmd.args[2]);
			break;
			case "FI_D":
			case "FI_F":
				p.fill(cmd.args[0], cmd.args[1], cmd.args[2]);
			break;
			case "STW":
				p.strokeWeight(cmd.args[0]);
			break;
			case "NOST":
				p.noStroke();
			break;
			case "NOFI":
				p.noFill();
			break;
			case "PUSH_STYLE":
				p.pushStyle();
			break;
			case "POP_STYLE":
				p.popStyle();
			break;
			case "SIZE":
				p.size(cmd.args[0], cmd.args[1]);
				$(canvas).parent().width(cmd.args[0]);
				$(canvas).parent().height(cmd.args[1]);
			break;
			case "ELIP_MODE":
				p.ellipseMode(cmd.args[0]);
			break;
			case "RECT_MODE":
				p.rectMode(cmd.args[0]);
			break;
			case "ST_CAP":
				p.strokeCap(cmd.args[0]);
			break;
			case "ST_JOIN":
				p.strokeJoin(cmd.args[0]);
			break;
			case "BEGIN_SHAPE":
				p.beginShape(cmd.args[0]);
			break;
			case "END_SHAPE":
				p.endShape(cmd.args[0]);
			break;
			case "VERTEX":
				p.vertex(cmd.args[0], cmd.args[1]);
			break;
			case "LOAD_FONT":
				var f = p.loadFont(cmd.args[0], cmd.args[1]);
				_loaded_fonts[cmd.args[0]] = f;
				p.textFont(f);
			break;
			case "TXT_FONT":
				var f = _loaded_fonts[cmd.args[0]];
				if (f == null) {
					f = p.loadFont(cmd.args[0], cmd.args[1]);
				}
				p.textFont(f);
			break;
			case "PUSH_MAT":
				p.pushMatrix();
			break;
			case "POP_MAT":
				p.popMatrix();
			break;
			case "TRANSL_2i":
			case "TRANSL_2f":
				p.translate(cmd.args[0], cmd.args[1]);
			break;
			case "ROTATE":
				p.rotate(cmd.args[0]);
			break;
			case "CLEAR":
				/* TODO: evaluate if this command even makes sense...*/
				clearCanvas(p);
			break;
			case "REG_CB":
				for(i in cmd.args) {
				var event = cmd.args[i];
					if (event in _cb) {
						_cb[event] = true;
						if ( event === 'DROP' ) {
							canvas.addEventListener('dragover', dropHelper, false);
							canvas.addEventListener('drop', dropListener, false);
						}
					}
				}
			break;
			case "CB_KEY_T":
				if (cmd.args[0] === "ALL") {
					_cb['KEYST'] = true;
				} else {
					_cb['KEYST'] = cmd.args;
				}
			break;
			case "CB_KEY_T_STOP":
				if (cmd.args.length > 1)
					_keys['TYP'] = cmd.args;
				else
					_keys['TYP'] = cmd.args[0];
			break;
			case "CB_KEY_P":
				if (cmd.args[0] === "ALL") {
					_cb['KEYSP'] = true;
				} else {
					_cb['KEYSP'] = cmd.args;
				}
			break;
			case "CB_KEY_P_STOP":
				if (cmd.args.length > 1)	
					_keys['PRE'] = cmd.args;
				else
					_keys['PRE'] = cmd.args[0];
			break;
			case "CB_KEY_R":
				if (cmd.args[0] === "ALL") {
					_cb['KEYSR'] = true;
				} else {
					_cb['KEYSR'] = cmd.args;
				}
			break;
			case "VAR":
				setRemoteVariable(cmd.args[0], cmd.args[1]);
			break;
			case "NEW_TXT_AREA":
				/* Create a floating TextArea. Position is relative to the main display. */
				/* Add the new TextArea to the list of defined TextAreas before returning. */
				var root = $("#root");
				var str = "<textarea id='"+cmd.args[0]+"'";
				str += (cmd.args[5] == 1) ? " readonly/>" : "/>";
				$(root).parent().append(str);
				var txt_area = $("#"+cmd.args[0]);
				var o = new Object;
				o.left = $(root).offset().left + cmd.args[1];
				o.top = $(root).offset().top + cmd.args[2]; 
				$(txt_area).offset(o);
				$(txt_area).width(cmd.args[3]);
				$(txt_area).height(cmd.args[4]);
				_text_areas[cmd.args[0]] = txt_area;
				// $(txt_area).keypress( p.keyPressed() );
				// $(txt_area).keyup( p.keyReleased() );
			break;
			case "TXT_AREA_CSS":
				var id 	= cmd.args[0];
				var n	= cmd.args[1];
				var v	= cmd.args[2];
				if (id in _text_areas) {
					var txt_area = _text_areas[id];
					$(txt_area).css(n, v);
				}
			break;
			case "OVERWRITE":
				if (cmd.args[0] in _text_areas) {
					$("#"+cmd.args[0]).text(cmd.args[1]);
				}
			break;
			case "APPEND":
				if (cmd.args[0] in _text_areas) {
					var t = $("#"+cmd.args[0]).text();
					$("#"+cmd.args[0]).text(t + cmd.args[1]);
				}
			break;
			case "PRELOAD":
				// $("body").prepend("<div class='preload' style='font-family:"+cmd.args[0]+";'>preloaded: "+cmd.args[0]+"</div>");
				// $(".preload").hide();
			break;
			default:
				p.println("Received an unknown command:: " + cmd.name + " " + cmd.args);
		}
	}
	/* NB All these send methods could (should) be added to the WebSocket prototype and called directly instead */
	/* Leaving that as a TODO for now */
	function sendExpose(ws) {
		ws.send("EVENT EXPOSE\n")
	}
	function sendClick(ws, x, y, b) {
		if (!_cb['CLICK']) {
			return false;
		}
		var str = "EVENT CLICK " + x + " " + y + " " + b + "\n"
		ws.send(str);
		
	}
	function sendMouseDown(ws, x, y, b) {
		if (!_cb['MDOWN']) {
			return false;
		}
		var str = "EVENT MDOWN " + x + " " + y + " " + b + "\n"
		ws.send(str)
	}
	function sendMouseDrag(ws, x, y, dx, dy, b) {
		if (!_cb['MDRAG']) {
			return false;
		}
		var str = "EVENT MDRAG " + x + " " + y + " " + dx + " " + dy + " " + b + "\n"
		ws.send(str)
	}
	function sendMouseDragOut(ws, x, y, dx, dy, b) {
		/* cancel the drag regardless of sending the message back */
		p.__mousePressed = false;
		p.mouseReleased();
		if (!_cb['MDRAGOUT']) {
			return false;
		}
		var str = "EVENT MDRAGOUT " + x + " " + y + " " + dx + " " + dy + " " + b + "\n"
		ws.send(str)
	}
	function sendMouseMove(ws, x, y, dx, dy) {
		if (!_cb['MMOVE']) {
			return false;
		}
		var str = "EVENT MMOVE " + x + " " + y + " " + dx + " " + dy + "\n"
		ws.send(str)
	}
	function sendKeyTyped(ws, keycode) {
		if (_cb['KEYST'] === false) return false;
		if (_cb['KEYST'] === true || _cb['KEYST'].indexOf(keycode) != -1) {
			var str = "EVENT KEYTYPED " + keycode + "\n";
			ws.send(str);
		}
	}
	function sendKeyPressed(ws, keycode) {
		if (_cb['KEYSP'] === false) return false;
		if (_cb['KEYSP'] === true || _cb['KEYSP'].indexOf(keycode) != -1) {
			var str = "EVENT KEYPRESSED " + keycode + "\n";
			ws.send(str);
		}
	}
	function sendKeyReleased(ws, keycode) {
		if (_cb['KEYSR'] === false) return false;
		if (_cb['KEYSR'] === true || _cb['KEYSR'].indexOf(keycode) != -1 ) {
			var str = "EVENT KEYRELEASED " + keycode + "\n";
			ws.send(str);
		}
	}
	function sendResize(ws, width, height) {
		if (!_cb['RESIZE']) {
			return false;
		}
		var str = "EVENT RESIZE " + width + " " + height + "\n";
		ws.send(str);
	}
	function dropHelper(e) {
		if (!_cb['DROP']) {
			return false;
		}
		e.stopPropagation();
		e.preventDefault();
	}
	function dropListener(e) {
		if (!_cb['DROP']) {
			return false;
		}
		e.stopPropagation();
		e.preventDefault();
		
		var files = e.dataTransfer.files;
		
		
		for(var i=0,f; f = files[i]; i++) {
			var reader = new FileReader();
			/* Code based on www.html5rocks.com tutorial */
			function errorHandler(e) {
				switch(e.target.error.code) {
				  case e.target.error.NOT_FOUND_ERR:
					alert("File not found.");
					break;
				  case e.target.error.NOT_READABLE_ERR:
				  	alert("File is not readable.");
				  	break;
				  case e.target.error.ABORT_ERR:
				  	break;
				  default:
				  	alert("Unknown error occurred.");
				};
			}
			/* TODO Use this if we create a loading bar widget */
			function updateProgress(e) {
				if (e.lengthComputable) {
					var percentLoaded = Math.round((e.loaded / e.total) * 100);
					if (percentLoaded < 100) {
						//Do something?
					}		
				 }
			}	
			
			
			reader.onloadstart = (function(file) {
			  return function(e) {
				/* Send the INIT message */
				var str = ""
				var fname = file.name.replace(/ /g, "_"); //swap spaces for underscores
				if (file.type.match('text.*')) {
					str = "EVENT DROP INIT " + fname + " " + file.type + " " + file.size + "\n";
				} else {
					str = "EVENT DROP64 INIT " + fname + " " + file.type + " " + file.size + "\n";
				}					
				ws.send(str);
			  };
			})(f);
			reader.onprogress = updateProgress;
			reader.onabort = function(e) {
				/*TODO create an ABORT event on hlib? */
				alert("File read cancelled.");
			};
			reader.onerror = errorHandler;
			
			/* File transfer for binary file types is done in Base64 encoding 	*/
			/* File type is a BEST GUESS approach. It might not be right. 		*/
			/* Expect that at the application side and be ready to decode as	*/
			/* needed. The event fired is different, so files can be treated 	*/
			/* differently easily. This is a temporary workaround until sending	*/
			/* binary files ius fixed in Chrome (probably v15 or 16)			*/
			reader.onload = (function(file) {
			  return function(e) {
				if (e.target.readyState == FileReader.DONE) {
					/* The file is loaded entirely in local storage */
					var chunk_size = 1048576; /* 1 Meg chunk size */
					var chunk_counter = 0;
					var fname = file.name.replace(/ /g, "_"); //swap spaces for underscores
					if (file.type.match('text.*')) {
						/* Text files don't need encoding. */
						var payload = e.target.result;
						for (var start = 0; start < payload.length; start += chunk_size+1) {
							var chunk = payload.substr(start, chunk_size);
							var str = "EVENT DROP CHUNK " + fname + " " + file.type + " " + file.size + " " + chunk.length + " " + chunk_counter + "\n";
							ws.send(str);
							ws.send(chunk);
							chunk_counter++
						}
						/* Send the END message */
						var str = "EVENT DROP END " + fname + " " + file.type + " " + file.size + "\n";
						ws.send(str);
					} else {
						/* Doesn't seem like a text file. Base64 encode it */
						var payload = Base64.encode(e.target.result);
						for (var start = 0; start < payload.length; start += chunk_size+1) {
							var chunk = payload.substr(start, chunk_size);
							var str = "EVENT DROP64 CHUNK " + fname + " " + file.type + " " + file.size + " " + payload.length + " " + chunk.length + " " + chunk_counter + "\n";
							ws.send(str);
							ws.send(chunk);
							chunk_counter++
						}
						/* Send the END message */
						var str = "EVENT DROP64 END " + fname + " " + file.type + " " + file.size + " " + payload.length + "\n";
						ws.send(str);
					}
				}
			  };				
			})(f);
			/* NB:: w3c spec says readAsArrayBuffer is the way to go and readAsBinaryString is deprecated. */
			/* BUT!
			 * Chrome 14 doesn't yet support sending ArrayBuffers as websocket data. This means we're sticking to 
			 * binaryString for now. It also means that file transfers only work with text data for now. */	
			//reader.readAsArrayBuffer(f);
			reader.readAsBinaryString(f);
		}
	}
	/* These should probably only be defined if callbacks exist 		*/
	/* Requires generating these methods on-demand on the server-side 	*/
	/* if and only a callback has been registered for the action.		*/
	/* This would help lighten network load for sure.					*/
	p.mouseReleased = function() {
		//this.println("Released (up/click)("+this.mouseX+","+this.mouseY+"), button: " + this.mouseButton);
		sendClick(ws, this.mouseX, this.mouseY, this.mouseButton);
	};
	
	p.mousePressed = function() {
		//this.println("Pressed (down) ("+this.mouseX+","+this.mouseY+"), button: " + this.mouseButton);
		sendMouseDown(ws, this.mouseX, this.mouseY, this.mouseButton);
	};
	p.mouseDragged = function() {
		/* Disable mouseDrag inside text areas to allow selection of text. */ 
		for (i in _text_areas) {
			var area = $(_text_areas[i]);
			var x_min = $(area).position().left;
			var x_max = x_min + $(area).width();
			var y_min = $(area).position().top;
			var y_max = y_min + $(area).height();
			if (this.mouseX >= x_min && this.mouseX <= x_max && 
				this.mouseY >= y_min && this.mouseY <= y_min) {
					return false;
				}
		}
		sendMouseDrag(ws, this.mouseX, this.mouseY, this.mouseX - this.pmouseX, this.mouseY - this.pmouseY, this.mouseButton);
		if ( this.mouseX >= this.width || this.mouseX <= 0 || this.mouseY >= this.height || this.mouseY <= 0 ) {
			sendMouseDragOut(ws, this.mouseX, this.mouseY, this.mouseX - this.pmouseX, this.mouseY - this.pmouseY, this.mouseButton);
		}
		return true;
	}
	p.mouseMoved = function() {
		sendMouseMove(ws, this.mouseX, this.mouseY, this.mouseX - this.pmouseX, this.mouseY - this.pmouseY);
	}
/*
 * Processing-based keyboard event model stuff. Keeping it 
 * around in case I change my mind later, but I think attaching to the
 * parentNode is a better solution.
 * 
	p.keyPressed = function(e) {
		var k = this.key;
		var c = this.keyCode; 
		if (e != undefined) {
			if (e.keyCode in _codedKeys) {
				k = p.CODED;
			} else {
				k = e.keyCode;
			}
			c = e.keyCode;
		}
		
		sendKeyPressed(ws, k, c);
	}
	p.keyTyped = function(e) {
		var k = this.key;
		var c = this.keyCode; 
		if (e != undefined) {
			if (e.keyCode in _codedKeys) {
				k = p.CODED;
			} else {
				k = e.keyCode;
			}
			c = e.keyCode;
		}
		sendKeyTyped(ws, k, c);
	}
	p.keyReleased = function(e) {
		var k = this.key;
		var c = this.keyCode; 
		if (e != undefined) {
			if (e.keyCode in _codedKeys) {
				k = p.CODED;
			} else {
				k = e.keyCode;
			}
			c = e.keyCode;
		}
		sendKeyReleased(ws, k, c);
	}
*/
	/* Used in conjunction, this delays the resize event firing to prevent multiple events */
	/* adapted from: http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed */
	$(window).resize( function() {
		waitForFinalEvent(function(){
			sendResize(ws, $(window).width(), $(window).height());
		}, 500, "winResize");
		
	});
	var waitForFinalEvent = (function () {
	  var timers = {};
	  return function (callback, ms, uniqueId) {
		if (!uniqueId) {
		  uniqueId = "Don't call this twice without a uniqueId";
		}
		if (timers[uniqueId]) {
		  clearTimeout (timers[uniqueId]);
		}
		timers[uniqueId] = setTimeout(callback, ms);
	  };
	})();
	
	var press = function(e) {
		/* TODO: Is more information sending needed/relevant? */
		/* If we ever want to tramsmit the actual character, use String.fromCharCode(k) */
		var k = e.which || e.keyCode;
		// NB changes \r to \n to
		if (k==13) k = 10;
		sendKeyTyped(ws, k);
		if (  _keys['TYP'] === "ALL" || _keys['TYP'].indexOf(k) != -1) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		} else {
			return true;
		}
	}
	
	var down = function(e) {
		/* TODO: Is more information sending needed/relevant? */
		var k = e.which || e.keyCode;
		sendKeyPressed(ws, k);
		if ( _keys['PRE'] === "ALL" || _keys['PRE'].indexOf(k) != -1 ) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		} else {
			return true;
		}
	}
	
	var release = function(e) {
		/* TODO: Is more information sending needed/relevant? */
		var k = e.which || e.keyCode;
		sendKeyReleased(ws, k);
		return true;
	}
	
	parent.addEventListener('keydown', down, false);
	parent.addEventListener('keypress', press, false);
	parent.addEventListener('keyup', release, false);
	
	/* Adds mouse tracking beyond the boundaries of the canvas */
	$(document).mousemove(function(e) {
		var x;
		var y;
		if (_pmx === -1) _pmx = x;
		if (_pmy === -1) _pmy = y;
		if (e.pageX != undefined && e.pageY != undefined) {
			x = e.pageX;
			y = e.pageY;
		}
		else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		
		x -= $(canvas).offset().left;
		y -= $(canvas).offset().top;
		
		sendMouseMove(ws, x, y, _pmx, _pmy);
		if ( p.__mousePressed === true ) {
			/* Additional checking in case the dragout was too fast for processing to pick up */
			var rect = canvas.getBoundingClientRect();
			if ( x >= rect.width || x <= 0 || y >= rect.height || y <= 0) {
				sendMouseDragOut(ws, x, y, _pmx, _pmy);
			}
		}
		_pmx=x;
		_pmy=y;
	});
});
