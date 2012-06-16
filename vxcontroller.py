
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

from twisted.python import log
from websocketServer import VxWebSocketHandler

class VxController:	
	def __init__(self):
		# Connected Application clients
		self.apps = {}
		self.appID = 1   # Counter for application ids
		
		# WebSocket handlers
		self.websocketHandlers = {}
		
		# References to pass messages along to other servers
		self.httpRoot = None    # Root of http resource tree
		self.socketSite = None  # Websocket site
		self.staticSite = None	# Static content
	
	# Setters for other server
	def setHttpRoot(self, root):
		self.httpRoot = root

	def setWebSocketSite(self, site):
		self.socketSite = site
		
	def setStaticSite(self, site):
		self.staticSite = site
	
	### Application Management ###
	
	# Get the next application id
	def nextApplicationID(self):
		appid = self.appID
		self.appID = self.appID + 1
		return str(appid)
		
	# Register a connected client application
	def registerApplication(self, address, appHandler):
		appid = self.nextApplicationID()
		
		app = {}
		# Set application information
		app['address'] = address
		app['appHandler'] = appHandler
		
		
		# Add WebSocket handler	
		app['wsHandler'] = None
		# Get path of websocket handler
		handlerPath = '/' + appid + '_Handler'
		app['wsHandlerPath'] = handlerPath
		
		# Create font preload, an array of tuples
		app['FONT'] = []
		
		# Associate this appid with handlerPath
		self.websocketHandlers[handlerPath] = appid
		# Create handler for handlerLocation
		self.socketSite.addHandler(handlerPath, VxWebSocketHandler)
		
		# Add the client
		self.apps[appid] = app
		
		return appid
		
	# Unregister a client application
	def unregisterApplication(self, appid):
		log.msg("Unregistering application %s" % appid)
		
		# Close websocket connection
		wsHandler = self.apps[appid]['wsHandler']
		if wsHandler != None:
			wsHandler.closeConnection()
		
		del self.apps[appid]
		
	# Return a list of applications
	def getConnectedApplications(self):
		return self.apps.keys()
	
	# Check if appid is a valid connected application
	def isValidApplication(self, appid):
		return appid in self.apps
	
	# Check if application is available to users
	def applicationIsAvailable(self, appid):
		# Application is available if it has no websocket handler
		return self.apps[appid]['wsHandler'] == None
		
	### WebSocket Management ###
	
	# Register a websocket handler and associate it with an appid
	def registerWebSocketHandler(self, handlerPath, handler):
		appid = self.websocketHandlers[handlerPath]
		self.apps[appid]['wsHandler'] = handler

	# Unregister an applications websocket handler
	def unregisterWebSocketHandler(self, handlerPath):
		log.msg("unregistering websocket handler %s" % handlerPath)
		appid = self.websocketHandlers[handlerPath]
		if appid in self.apps:
			self.apps[appid]['wsHandler'] = None
	
	# Get the path to an applications websocket handler
	def getWebSocketHandlerPath(self, appid):
		if not self.isValidApplication(appid):
			return None
		
		return self.apps[appid]['wsHandlerPath']
	
	# Check if a given handler path has an associated handler instance
	def webSocketLocationHasHandler(self, handlerPath):
		appid = self.websocketHandlers[handlerPath]
		return self.apps[appid]['wsHandler'] != None
	
	### Server communication ###
	
	# Send an event to the web socket server (ie to the Browser)
	def pushWebSocketEvent(self, appid, event):
		wsockHandler = self.apps[appid]['wsHandler']
		wsockHandler.sendEvent(event)

	# Send event to vx server (ie to the C app)
	def pushVxEvent(self, handlerPath, event):
		appid = self.websocketHandlers[handlerPath]
		
		handler = self.apps[appid]['appHandler']
		handler.sendEvent(event)
	
	# Add preload content for an application
	def addFontPreload(self, appid, fontName, fontURL):
		self.apps[appid]['FONT'].append((fontName,fontURL))
		
	def getFontPreload(self, appid):
		return self.apps[appid]['FONT']

vx = VxController()
