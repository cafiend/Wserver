
# The MIT License (MIT)
# Copyright (c) 2011 Derek Ingrouville, Julien Lord, Muthucumaru Maheswaran

# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:

# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
# CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from datetime import datetime

from twisted.internet import task
from websocket import WebSocketHandler, WebSocketSite
from twisted.python import log

import vxcontroller
import json
class VxWebSocketHandler(WebSocketHandler):
	def __init__(self, transport):
		WebSocketHandler.__init__(self, transport)

	def __del__(self):
		log.msg('Deleting websocket handler')

	def frameReceived(self, frame):
		path = self.transport._request.path
		vxcontroller.vx.pushVxEvent(path, frame)
		
	def binaryFrameReceived(self, data):
		log.msg("What the s**t is this?? >%s<" % data)

	def connectionMade(self):
		log.msg('Connected to client.')
		path = self.transport._request.path
		vxcontroller.vx.registerWebSocketHandler(path, self)
		# On connection establishment, send a single SETUP event to the client
		# vxcontroller.vx.pushVxEvent(path, "EVENT SETUP\n")

	def connectionLost(self, reason):
		log.msg('Lost websocket connection')
		path = self.transport._request.path
		vxcontroller.vx.unregisterWebSocketHandler(path)
	
	def closeConnection(self):
		log.msg('Closing websocket connection')
		self.transport.loseConnection()
	
	def sendEvent(self, event):
		# log.msg("webSocketServer::Sending Event %s to Browser" % event)
		self.transport.write(json.dumps(event))
