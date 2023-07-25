from flask import jsonify, request
from models import db, Node
import time as t

def row_to_dict(row):
    return {'node_id': row.node_id, 'name': row.name, 'soil': row.soil, 'timestamp':row.timestamp}

def init_routes(app):
    @app.route("/node/getall", methods=["GET"])
    def get_all_node():
        try:
            nodes = Node.query.all()
            result = []
            for row in nodes:
                result.append(row_to_dict(row))
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"err": e}), 404

    @app.route('/node/create', methods=["POST"])
    def create_node():
        try:
            body = request.get_json()
            name = body["name"]
            id = body["id"]
            node = Node(node_id=id, name=name, soil=0, timestamp=int(t.time()))
            db.session.add(node)
            db.session.commit()
            return jsonify({"code": 0, "timestamp":int(t.time())}), 200
        except Exception as e:
            return jsonify({"err": e}), 404
        
    @app.route('/node/rename', methods=["PUT"])
    def rename_node():
        try:
            body = request.get_json()
            select_row = Node.query.filter_by(node_id=body["id"]).first()
            select_row.name = body["name"]
            db.session.commit()
            return jsonify({"code": 0}), 200
        except Exception as e:
            return jsonify({"err": e}), 404

    @app.route('/node/delete', methods=["DELETE"])
    def delete_node():
        try:
            body = request.get_json()
            select_row = Node.query.filter_by(node_id=body["id"]).first()
            db.session.delete(select_row)
            db.session.commit()
            return jsonify({"code": 0}), 200
        except Exception as e:
            return jsonify({"err": e}), 404