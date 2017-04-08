from flask import Flask, Response, request, redirect, session, url_for, g, abort, render_template, flash
from flask.json import jsonify
import gevent
from gevent import GreenletExit
from gevent.wsgi import WSGIServer
from gevent.queue import Queue
import numpy as np
import pywemo

import datetime, os, time, json

app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
subscriptions = []
timerListeners = []
# a = 0
# b = 5
a = gevent.queue.Queue()
a.put(1)
b = gevent.queue.Queue()
b.put(5)

numHours = 5
def_shape = np.zeros(numHours)
def_shape[2:3] = 1
def_power = gevent.queue.Queue()
def_power.put(def_shape)  # Make sure these are floats!

shape_power = gevent.queue.Queue()
shape_power.put(np.arange(1.,25.,1.))  # Make sure these are floats!


devices = []

# OVERVIEW:
# - Request Handlers
# -- Project-specific handlers
# -- General handlers from template
# - Functions, custom classes, and helpers
# - Flask initialization


############# REQUEST HANDLERS #################

@app.route('/', methods=['GET'])
def home():
    b.get()
    b.put(5)

    if not app.config['ONETHREAD']:
        if app.config['WEMO']:
            gevent.Greenlet.spawn(loopPywemo)
        else:
            gevent.Greenlet.spawn(loopFrontEnd)


    print("I'm handling the front-end!")
    return render_template('home.html',onethread=int(app.config['ONETHREAD']))


# Handler for user updates 
@app.route('/_update_backend')
def add_numbers():
    a_temp = request.args.get('a', 0, type=int)
    b_temp = request.args.get('b', 0, type=int)

    a.get()
    b.get()
    a.put(min(a_temp,b_temp))
    b.put(max(a_temp,b_temp))
    # a = min(a_temp,b_temp)
    # b = max(a_temp,b_temp)

    return jsonify(result=[chr(i+65) for i in range(a.peek()-1,b.peek() )])  # This can take any number of arguments, and will pack them into a json object/dict keyed by argument name


# Handler for listening to backend
@app.route("/subscribe")
def subscribe():
    if app.config['ETHNETWORK']:  # We want to check for new data from the network
        def gen():  # When this function is run, a subscription is added to the queue and 
            q = Queue()
            subscriptions.append(q)
            try:
                while True:
                    result = q.get()  # This will block until an item is available, then loop around and wait for the next item to pop into the queue
                    ev = ServerSentEvent(str(result))
                    yield ev.encode()
            except GeneratorExit: # Or maybe use flask signals
                subscriptions.remove(q)
                print("Generator exited!")
        return Response(gen(), mimetype="text/event-stream")

    else:
        return ('', 204)

# Handler for listening to backend
@app.route("/timer")
def timerHandler():
    if app.config['WEMO']:
        def gen():  # When this function is run, a subscription is added to the queue and 
            q = Queue()
            timerListeners.append(q)
            try:
                while True:
                    result = q.get()  # This will block until an item is available, then loop around and wait for the next item to pop into the queue
                    ev = ServerSentEvent(str(result))
                    yield ev.encode()
            except GeneratorExit: # Or maybe use flask signals
                timerListeners.remove(q)
                print("Generator exited!")
        return Response(gen(), mimetype="text/event-stream")

    else:
        return ('', 204)



### STANDARD STARTUP STUFF - CAN IGNORE FOR NOW
@app.route('/takeaction', methods=['GET'])
def takeaction():
    return ('', 204)

@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html')

@app.route('/ourtech', methods=['GET'])
def abouttech():
    return render_template('abouttech.html')

@app.route('/faqs', methods=['GET'])
def faqs():
    return render_template('FAQs.html')

@app.route('/blog1.html', methods=['GET'])
def blog1():
    return render_template('blog1.html')

@app.route('/blog2.html', methods=['GET'])
def blog2():
    return render_template('blog2.html')



############# FUNCTIONS AND HELPERS ################

class ServerSentEvent(object):

    def __init__(self, data):
        self.data = data
        self.event = None
        self.id = None
        self.desc_map = {
            self.data : "data",
            self.event : "event",
            self.id : "id"
        }

    def encode(self):
        if not self.data:
            return ""
        lines = ["%s: %s" % (v, k) 
                 for k, v in self.desc_map.iteritems() if k]
        
        return "%s\n\n" % "\n".join(lines)

def notify():
    a_temp = a.peek()
    b_temp = b.get()
    if b_temp >= 27:
        b_temp = a_temp

    b.put(b_temp + 1)
    msg = json.dumps({'result':[chr(i+65) for i in range(a.peek()-1,b.peek())] } )
    for sub in subscriptions[:]:
        sub.put(msg)

def resetTimer():
    for tmr in timerListeners:
        tmr.put("resetTimer!")

def checkForNewData(n=5):
    while True:
        try:
            gevent.sleep(n)
            notify()
        except GreenletExit:
            print("loop exited!")
            
def switchLightAtLevel(light, level):
    print("SwitchLightRequest")
    light.turn_on(level=level,transition=0.01,force_update=True)

def toggleSwitch(mySwitch):
    mySwitch.toggle()

def loopFrontEnd():
    while True:
        time.sleep(72)
        print("Done sleeping in simple front-end loop!")
        resetTimer()


def loopPywemo():
    devices = pywemo.discover_devices()
    for d in devices:
        if d.model_name=='Bridge':
            lights = dict(zip(['bedroom','kitchen','bathroom'],d.Lights.values()))
        if d.model_name=='Socket':
            switch = d
            switch.off()

    print(devices)
    # switch = devices[0]
    # lights = dict(zip(['bedroom','kitchen','bathroom'],devices[1].Lights.values()))

    max_brightness = 255;
    while True:
        print("Big loop reset")
        oldSwitchState = False
        shapeable = shape_power.peek()
        deferable = def_power.peek()
        n = max(deferable.shape)
        bulb_output = shapeable / max(shapeable) * max_brightness

        for i in range(n):
            loopLength = 3 # seconds
            startTime = time.time()
            print("pywemo loop at state %s"%i)
            currentSwitchState = bool(deferable[i])
            if currentSwitchState != oldSwitchState:
                try:
                    switch.toggle()                
                    oldSwitchState = currentSwitchState
                except:
                    pass

            try:
                lights['bedroom'].turn_on(level=bulb_output[i],transition=0.01,force_update=True)
            except:
                pass

            dt = time.time() - startTime
            print(dt)
            sleepDuration = max(loopLength - dt,0)
            print(sleepDuration)
            gevent.sleep(sleepDuration)
            # time.sleep(1)
        resetTimer()




########### FLASK MAIN FUNCTION - EXECUTION STARTS HERE #############

if __name__ == '__main__':

    if app.config['ONETHREAD']:  # We don't care about pulling in data from the network, and can ignore updates to the 
        app.run(debug=True)
    else:
        # if app.config['WEMO']:
        #     gevent.Greenlet.spawn(loopPywemo)
        # else:
        #     gevent.Greenlet.spawn(loopFrontEnd)


        # We want to regularly check for new data from the network 
        if app.config['ETHNETWORK']:
            gevent.Greenlet.spawn(checkForNewData)            
        app.debug = True
        server = WSGIServer(("0.0.0.0", 5000), app)   # Note: This won't allow for auto-reloading the app when code changes
        server.serve_forever()
