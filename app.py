from flask import Flask, jsonify
from flask_cors import CORS
import networkx as nx
import random

app = Flask(__name__)
CORS(app)

# -----------------------------
# Mine Graph
# -----------------------------

mine = nx.Graph()

edges = [
    ("A1","A2"),
    ("A2","A3"),
    ("A2","B2"),
    ("B1","B2"),
    ("A1","B1"),
    ("B2","Exit")
]

mine.add_edges_from(edges)

# -----------------------------
# Zone Names
# -----------------------------

zone_info = {

"A1":{"name":"Drilling Section"},
"A2":{"name":"Ventilation Tunnel"},
"A3":{"name":"Equipment Bay"},
"B1":{"name":"Worker Passage"},
"B2":{"name":"Gas Monitoring Zone"},
"Exit":{"name":"Emergency Exit"}

}

# -----------------------------
# Workers
# -----------------------------

workers = {

"Worker1":"A1",
"Worker2":"B2"

}

# -----------------------------
# Hazards
# -----------------------------

hazards = {}

# -----------------------------
# API ROUTES
# -----------------------------

@app.route("/map")
def get_map():

    return jsonify({
        "edges": list(mine.edges()),
        "workers": workers,
        "hazards": hazards,
        "zones": zone_info
    })


@app.route("/move_workers")
def move_workers():

    for w in workers:

        current = workers[w]

        neighbors = list(mine.neighbors(current))

        workers[w] = random.choice(neighbors)

    return jsonify(workers)


@app.route("/trigger_hazard")
def trigger_hazard():

    hazards.clear()

    hazards["B2"] = {
        "type":"Methane Gas Leak",
        "severity":100
    }

    return jsonify(hazards)


@app.route("/spread_hazard")
def spread_hazard():

    new_hazards = {}

    for node in hazards:

        for neighbor in mine.neighbors(node):

            if neighbor not in hazards:

                new_hazards[neighbor] = {
                    "type":"Gas Spread",
                    "severity":60
                }

    hazards.update(new_hazards)

    return jsonify(hazards)


@app.route("/evacuate/<worker>")
def evacuate(worker):

    start = workers.get(worker)

    try:

        path = nx.shortest_path(mine,start,"Exit")

    except:

        path = []

    return jsonify({
        "worker":worker,
        "route":path
    })


if __name__ == "__main__":
    app.run(debug=True)