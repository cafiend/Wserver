
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

from twisted.web import server, resource, static
from twisted.internet import reactor
from twisted.python import log

from vxcontroller import vx
import re

_mime_types = {'css':'text/css','js':'application/x-javascript','jpeg':'image/jpeg','jpg':'image/jpeg', 'gif':'image/gif','png':'image/png','ttf':'font/truetype','otf':'font/opentype','pde':'application/processing'}

class VxHTTPResource(resource.Resource):
	isLeaf = True
	
	def __init__(self):
		self.static_root = None;
		resource.Resource.__init__(self)
		
	def setStaticRoot(self, dir):
		self.static_root = dir
		
	# Render / - Index
	def render_Root(self, request):
		request.write("<html><body>")
		request.write("<p>Using the default template.</p>")
		request.write("<ul>")
		
		apps = vx.getConnectedApplications()
		
		if len(apps) == 0:
			request.write("No application are connected")
		else:
			# Write each application
			for app in apps:
				request.write("<li>")
				href = '<a href="%(id)s">Application-%(id)s</a>' % {'id':app}
				request.write(href)
				request.write("</li>")

		
		request.write("</ul>")
		request.write("<p>Using the test template.</p>")
		request.write("<ul>")
		
		apps = vx.getConnectedApplications()
		
		if len(apps) == 0:
			request.write("No application are connected")
		else:
			# Write each application
			for app in apps:
				request.write("<li>")
				href = '<a href="/test/%(id)s">Application-%(id)s</a>' % {'id':app}
				request.write(href)
				request.write("</li>")

		
		request.write("</ul>")
		request.write("<p><a href='/html_test.html'>HTML5 Test Page</a></p>")
		request.write("</body></html>")
		request.finish()
		
		# This is the correct way to do this
		return server.NOT_DONE_YET
	
	# Render a connected application
	def render_AvailableApplication(self, request, appid, template='index.template'):
		
		# Get WebSocket Handler for this application
		handler = vx.getWebSocketHandlerPath(appid)
		
		# Get html that will be served
		templateFile = open(template)
		template = templateFile.read()
		templateFile.close()
		
		# Inject correct handler into html
		html = template % {'id':handler, 'appid':appid}
		
		# Write html
		request.write(html)
		
		request.finish()
		
		return server.NOT_DONE_YET
	
	def render_customCSS(self, request):
		'''
		Generates a custom CSS file to create proper @font-face directives
		'''
		appid = request.path.split('/')[1]

		pre = "";
		fonts = vx.getFontPreload(appid)
		for pair in fonts:
			pre = pre + '@font-face{\n\tfont-family:"'+str(pair[0])+'";\n\tsrc: url(' + str(pair[1]) + ');\n}\n'

		request.setHeader("content-type", _mime_types['css'])
		return pre
		
	def render_Preload(self, request, template='test.pde'):
		appid = request.path.split('/')[1]
		
		# pde only needs values for now
		# if Processing-js team gets their act together this might change
		fonts = vx.getFontPreload(appid)
		if len(fonts) == 0:
			return "/* nothing to see here */"
		font_str = ','.join([x[1] for x in fonts])
		
		# Get html that will be served
		templateFile = open(template)
		template = templateFile.read()
		templateFile.close()
		
		# Inject correct handler into html
		html = template % {'fonts':font_str}
		
		request.setHeader("content-type", _mime_types['pde'])
		
		# Write html
		# request.write(html)
		
		# request.finish()
		
		# Why this works, I'm not sure... Something fishy to be investigated later.
		return str(html) #server.NOT_DONE_YET
				
	# Render an application that is in use
	def render_UnavailableApplication(self, request, clientID):
		return"<html><body>Application is already in use</body></html>"
	
	# Render application that has not connected
	def render_UnknownApplication(self, request, clientID):
			return "<html><body>Unknown Application</body></html>"
	
	# Appropriately render an application
	def render_Application(self, request, template='index.template'):
		appid = request.path.split('/')[-1]
		if appid in vx.getConnectedApplications():
			
			if vx.applicationIsAvailable(appid):
				return self.render_AvailableApplication(request, appid, template)
			else:
				return self.render_UnavailableApplication(request, appid)
				
		return self.render_UnknownApplication(request, appid)

	# Render the html template test page
	def render_templateTestPage(self, request):
		
		# Get html that will be served
		templateFile = open('test.template')
		template = templateFile.read()
		templateFile.close()
		
		# Write html
		request.write(template)
		
		request.finish()
		
		return server.NOT_DONE_YET

	#Render all static content
	def render_Static(self, request, filepath):
		f = None
		try:
			f = open(filepath)
		except IOError:
			request.setResponseCode(404)
			return "<html><body>File not found</body></html>"
		content = f.read()
		f.close()
		ext = filepath.split('.')[-1] # get everything after the last period
		request.setHeader("content-type", _mime_types[ext])
		return content
		
	# Hander GET request
	def render_GET(self, request):
		# TODO: Get static file serving working correctly
		
		if request.path == '/html_test.html':
			return self.render_templateTestPage(request)
		elif re.match("/\d+/test\.pde", request.path):
			return self.render_Preload(request);
		elif re.match("/\d+/custom\.css", request.path):
			return self.render_customCSS(request);
		elif re.match("/test/\d+", request.path):
			return self.render_Application(request, "test.template")
		elif re.match("/\d+$", request.path):
			return self.render_Application(request)
		elif re.match(".+\.(css|js|gif|png|jpeg|jpg|ttf|otf|eot|svg)$", request.path):
			f = request.path.split('/', 1)[-1]
			return self.render_Static(request, f)

		return self.render_Root(request)

