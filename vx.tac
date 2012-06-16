from twisted.application import internet, service
from twisted.internet.protocol import ServerFactory, Protocol
from twisted.web import server

# Vx All
from vxcontroller import vx

# WebSocket
from websocket import WebSocketHandler, WebSocketSite
from twisted.web.static import File

# HTTP
from http import VxHTTPResource

# VX Server
from vxserver import VxFactory

# Configuration

import sys
print(sys.version)

iface = 'localhost'

# vxServer configuration parameters
vxPort = 9090

# HTTP server configuration parameters
httpPort = 8080

# WebSocket server configuration parameters
websocketPort = 7070

#Root dir for static content
static_dir = 'jqueryui'

topService = service.MultiService()

# VX Service
factory = VxFactory()
tcpService = internet.TCPServer(vxPort, factory, interface=iface)
tcpService.setServiceParent(topService)

# HTTP Service
httpRoot = VxHTTPResource()
httpRoot.setStaticRoot(static_dir)
httpSite = server.Site(httpRoot)
vx.setHttpRoot(httpRoot)
httpService = internet.TCPServer(httpPort, httpSite, interface=iface)
httpService.setServiceParent(topService)


# WebSocket Service
root = File('.')
site = WebSocketSite(root)
vx.setWebSocketSite(site)
websocketService = internet.TCPServer(websocketPort, site)
websocketService.setServiceParent(topService)

# application variable is used by twistd
application = service.Application("VX Server")
topService.setServiceParent(application)
