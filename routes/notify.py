from flask import jsonify, request
from models import db, Notify

def row_to_dict(row):
    return {'id': row.id, 'text': row.text, 'timestamp':row.timestamp}

def init_routes(app):
    @app.route("/notify/getall", methods=["GET"])
    def get_all_notify():
        try:
            notifys = Notify.query.all()
            result = []
            for row in notifys:
                result.append(row_to_dict(row))
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"err": e}), 404

    @app.route('/notify/delete', methods=["DELETE"])
    def delete_notify():
        try:
            body = request.get_json()
            select_row = Notify.query.filter_by(id=body["id"]).first()
            db.session.delete(select_row)
            db.session.commit()
            return jsonify({"code": 0}), 200
        except Exception as e:
            return jsonify({"err": e}), 404