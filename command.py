
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

_zero 	= frozenset(["CLEAR","NOST","NOFI","PUSH_STYLE","POP_STYLE","PUSH_MAT", "POP_MAT"]);
_one 	= frozenset(["STW", "ELIP_MODE", "RECT_MODE", "ST_CAP", "ST_JOIN", "BEGIN_SHAPE", "END_SHAPE","ROTATE","REG_CB"]);
_two 	= frozenset(["PO2D", "SIZE", "VERTEX", "CR_FONT", "TXT_FONT", "LOAD_FONT", "TRANSL_2i", "TRANSL_2f", "VAR"]);
_three	= frozenset(["BG", "ST_D", "ST_F", "FI_D", "FI_F"]);
_four	= frozenset(["RECT", "LI2D", "ELIP", "CM_D", "CM_F"]);
_six 	= frozenset(["ARC", "TRI"]);
_eight	= frozenset(["QUAD"]);


# NB This module is essentially DEPRECATED at this point.
#	 JSON formatting has made this module irrelevant

class Command(object):
	def __init__(self, cmd):
		pass

def process(cmd):
	
	print "This shouldn't be called anymore, I think." + str(cmd)
	if ( '{' in cmd ):
		return cmd
	params = cmd.split(' ')
	name = params.pop(0)
	
	handler = lookupHandler(name)
	command = handler(params)
	
	command['raw'] = cmd
	command['name'] = name
	return command
	
def TXT_Handler(params):
	text = ' '.join(params[2:])
	command = {}
	
	command['x'] = params[0]
	command['y'] = params[1]
	command['text'] = text
	
	# print "TXT::"+str(command)
	return command
	
def ZERO_Handler(params):
	command = {}
	
	return command
def ONE_Handler(params):
	command = {}
	
	command['w'] = params[0]
	
	return command
def TWO_Handler(params):
	command = {}
	
	command['x'] = params[0]
	command['y'] = params[1]
	
	return command
def THREE_Handler(params):
	command = {}
	
	command['r'] = params[0]
	command['g'] = params[1]
	command['b'] = params[2]
	
	return command
				
def FOUR_Handler(params):
	command = {}
	
	command['x'] = params[0]
	command['y'] = params[1]
	command['width'] = params[2]
	command['height'] = params[3]

	return command
def SIX_Handler(params):
	command = {}
	
	command['x'] = params[0]
	command['y'] = params[1]
	command['width'] = params[2]
	command['height'] = params[3]
	command['start'] = params[4]
	command['stop'] = params[5]

	return command
def EIGHT_Handler(params):
	command = {}
	
	command['x0'] = params[0]
	command['y0'] = params[1]
	command['x1'] = params[2]
	command['y1'] = params[3]
	command['x2'] = params[4]
	command['y2'] = params[5]
	command['x3'] = params[6]
	command['y3'] = params[7]
	
	return command

def lookupHandler(name):
	if (name == "TXT"):
		return TXT_Handler
	if (name in _zero):
		return ZERO_Handler
	if (name in _one):
		return ONE_Handler
	if (name in _two):
		return TWO_Handler
	if (name in _three):
		return THREE_Handler
	if (name in _four ):
		return FOUR_Handler
	if (name in _six):
		return SIX_Handler
	if (name in _eight):
		return EIGHT_Handler
	
	
		
