from flask import Flask, render_template, request, jsonify
import threading
from sqlalchemy import and_
from flask_migrate import Migrate
from datetime import datetime
import time as t
import serial
import schedule
from models import db, Data, Node, Notify
from routes.node import init_routes as node_routes
from routes.notify import init_routes as notify_routes
import base64
from PIL import Image
from io import BytesIO

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'
app.config['SECRET_KEY'] = 'dangquochuy'
app.config['TEMP'] = 0
app.config['HUM'] = 0
app.config['RAIN'] = 0
app.config['LUX'] = 0
db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

send_flag = threading.Event()
send_data = ""

node_routes(app)
notify_routes(app)

def base64_to_image(base64_str, filename):
	img_data = base64.b64decode(base64_str)
	img = Image.open(BytesIO(img_data))
	img.save(filename, 'JPEG')

def get_avr(arr):
    filtered_arr = [num for num in arr if num != 0]
    if len(filtered_arr) == 0:
        return 0  
    else:
        return round(sum(filtered_arr) / len(filtered_arr), 2)

def get_start_and_end_timestamps(ts):
    start = (ts-int(ts%86400))-(3600*7)
    end = (ts+(86400-int(ts%86400)))-(3600*7)-1
    return start, end

def disease_diagnosis(data_array):
	if len(data_array) == 0 or len(data_array) != 72:
		return []
	diseases = []
	avr_temp = 0.0
	avr_hum = 0.0
	avr_rain = 0.0
	for data in data_array:
		avr_temp = avr_temp + data.tem
		avr_hum = avr_hum + data.hum
		avr_rain = avr_rain + data.rain
	avr_temp = avr_temp / 72
	avr_hum = avr_hum / 72
	avr_rain = avr_rain / 72
	if avr_rain > 100 and avr_temp > 30 and avr_hum > 80:
		diseases.append("Bệnh đốm trắng")
	if avr_hum > 85 and avr_rain > 100:
		diseases.append("Bệnh đốm nâu")
	if avr_temp > 35:
		diseases.append("Bệnh nám cành") 
	if avr_rain > 100:
		diseases.append("Bệnh thối đầu cành")
	if avr_rain > 100 and avr_temp > 25 and avr_hum > 80:
		diseases.append("Bệnh thán thư") 
	return diseases

@app.route("/") # handle index.html file
def index():
	return render_template("index.html")

@app.route("/sensor_stream", methods=["GET"]) # handle sensor data
def stream_data():
	return jsonify({	"tem": app.config['TEMP'], 
		 				"hum": app.config['HUM'], 
						"rain": app.config["RAIN"],   
						"lux": app.config["LUX"]
					}), 200

@app.route("/send_out", methods=["POST"]) # handle send data over serial port
def send_out():
	global send_flag, send_data
	send_flag.set()
	body = request.get_json()
	send_data = body["mess"]
	return jsonify({"code": 0}), 200

@app.route("/diseases_dianogstic", methods=["GET"]) # handle diseases dianogstic
def diseases_dianogstic():
    datas = Data.query.order_by(Data.timestamp.desc()).limit(72).all()
    diseases = disease_diagnosis(datas)
    return jsonify({"diseases": diseases}), 200

@app.route("/chart", methods=["POST"]) # handle chart data
def chart():
	body = request.get_json()
	start, end = get_start_and_end_timestamps(int(body["timestamp"]))
	datas_by_timestamp = Data.query.filter(and_(Data.timestamp >= start, Data.timestamp <= end)).all()
	tem_data = [0] * 24
	hum_data = [0] * 24
	rain_data = [0] * 24
	lux_data = [0] * 24 
	for row in datas_by_timestamp:
		hour = datetime.fromtimestamp(row.timestamp).hour
		tem_data[hour] = row.tem
		hum_data[hour] = row.hum
		rain_data[hour] = row.rain
		lux_data[hour] = row.lux
	return jsonify({	"chart_data": {
							"tem": tem_data, "hum": hum_data, "rain": rain_data, "lux": lux_data
						},
						"chart_stat": {
							"tem": {"max": max(tem_data), "min": min(tem_data), "avr":get_avr(tem_data)},
							"hum": {"max": max(hum_data), "min": min(hum_data), "avr":get_avr(hum_data)},
							"rain": {"max": max(rain_data), "min": min(rain_data), "avr":get_avr(rain_data)},
							"lux": {"max": max(lux_data), "min": min(lux_data), "avr":get_avr(lux_data)}
						}
					}), 200

@app.route("/debug")
def debug():
	notify = Notify(text="HAHA", timestamp=int(t.time()))
	db.session.add(notify)
	db.session.commit()
	return jsonify({"code": 0}), 200

def listen_serial():
	global send_flag, send_data
	camera_data = ""
	print("Start serial thread")
	port = 'COM5'  
	baudrate = 115200       
	ser = serial.Serial(port, baudrate)
	def tx_serial(mess):
		ser.write(mess.encode('utf-8'))
	def get_data_interval():
		tx_serial("give me data")
	# get_data_interval()
	schedule.every(1).hour.do(get_data_interval)
	while True:
		schedule.run_pending()
		line = ""
		if ser.in_waiting > 0:
			line = ser.readline().decode('utf-8').rstrip() # Nhận dữ liệu từ Gateway thông qua USB
			print(line)
			data_array = line.split('|')
			if data_array[0] == "node":
				with app.app_context():
					select_node = Node.query.filter_by(node_id=data_array[1]).first()
					select_node.soil = int(data_array[2])
					select_node.timestamp = int(t.time())
					db.session.commit()
			if data_array[0] == "sensorstream":
				app.config['TEMP'] = data_array[1]
				app.config['HUM'] = data_array[2]
				app.config['RAIN'] = data_array[3]
				app.config['LUX'] = data_array[4]
			if data_array[0] == "sensordata":
				myData = Data(tem=float(data_array[1]), hum=float(data_array[2]), rain=int(data_array[3]), lux=float(data_array[4]), timestamp=int(t.time()))
				with app.app_context():
					db.session.add(myData)
					db.session.commit()
				app.config['TEMP'] = data_array[1]
				app.config['HUM'] = data_array[2]
				app.config['RAIN'] = data_array[3]
				app.config['LUX'] = data_array[4]
			if data_array[0] == "camera":
				print("receive packet")
				camera_data = camera_data + data_array[1]
			if line == "camera_done":
				print("capture done")
				print(camera_data)
				base64_to_image(camera_data, "picture.jpeg")
				camera_data = ""
		if send_flag.is_set():
			tx_serial(send_data)
			send_flag.clear()

if __name__ == "__main__":
	websocket_thread = threading.Thread(target=listen_serial)
	websocket_thread.daemon = True
	websocket_thread.start()
	app.run(host="0.0.0.0", port=5000)




