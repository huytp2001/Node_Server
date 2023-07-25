from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Node(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    node_id = db.Column(db.Integer, unique=True, nullable=False)
    name = db.Column(db.String(16), unique=True, nullable=False)
    soil = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.Integer, nullable=False)
    
class Data(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	tem = db.Column(db.Float, nullable=False)
	hum = db.Column(db.Float, nullable=False)
	rain = db.Column(db.Integer, nullable=False)
	lux = db.Column(db.Float, nullable=False)
	timestamp = db.Column(db.Integer, nullable=False)
        
class Notify(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	text = db.Column(db.String(80), nullable=False)
	timestamp = db.Column(db.Integer, nullable=False)