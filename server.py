from flask import *
from pymongo import MongoClient
import json

app = Flask(__name__)

client = MongoClient('mongodb://test:test@ds061651.mongolab.com:61651/rtd')
db = client.rtd

routes_c = db.busroutes
stops_c = db.busstops

global bus_routes_json

@app.route('/')
def return_nice(name=None):  
    global bus_routes_json
    return render_template('index.html', name = name, busRoutes = bus_routes_json)

@app.route('/old')
def return_working(name=None): 
    return render_template('test.html', name = name)

def populate_routes():
    print("HOWDY")
    bus_routes = []

    for route in  routes_c.find({},{"_id" : 0, "properties.ROUTE": 1}): 
        bus_routes.append(route)

    global bus_routes_json
    bus_routes_json = json.dumps(bus_routes)

if __name__ == '__main__':
    populate_routes()
    print bus_routes_json
    app.run(debug=True,host='0.0.0.0')
