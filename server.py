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

@app.route('/stops', methods=['POST'])
def get_stops(name=None):
    route_stops = []
    for stop in stops_c.find({'properties.ROUTES':{'$regex':request.form['route']}},{"_id":0,"properties.STOPNAME":1,"properties.LONG":1,"properties.LAT":1}):
        route_stops.append(stop)

    stops_json = json.dumps(route_stops)
    return stops_json

#this populates our bus routes whenever the server is started up. 
def populate_routes():
    bus_routes = []
    for route in  routes_c.find({},{"_id" : 0, "properties.ROUTE": 1}).sort("properties.ROUTE", 1): 
        bus_routes.append(route)

    global bus_routes_json
    bus_routes_json = json.dumps(bus_routes)

if __name__ == '__main__':
    populate_routes()
    app.run(debug=True,host='0.0.0.0')


# for stop in stops_c.find({"properties.ROUTES": "BV"}, {"_id":0,"properties.STOPNAME":1,"properties.LONG":1,"properties.LAT":1}):
#     print(stop)

# for route in  routes_c.find({},{"_id" : 0, "properties.ROUTE": 1}): 
#     route_name = route['properties']['ROUTE']
#     if (stops_c.find({"properties.ROUTES": route_name}, {"_id":0,"properties.STOPNAME":1,"properties.LONG":1,"properties.LAT":1}).count() is 0):
#         print(route_name)

