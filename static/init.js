MakeReq("/sensor_stream", "GET", {}).then((res) => {
    document.getElementById("tem").innerText = res.tem;
    document.getElementById("hum").innerText = res.hum;
    document.getElementById("rain").innerText = res.rain;
    document.getElementById("lux").innerText = res.lux;
})

MakeReq("/diseases_dianogstic", "GET", {}).then((res) => {
    const disease_ctn = document.getElementById("disease_ctn");
    document.getElementById("disease_num").innerText = res.diseases.length;
    for (let disease of res.diseases) {
        const disease_line = document.createElement('p');
        disease_line.innerText = disease;
        disease_ctn.appendChild(disease_line);    
    }
})

MakeReq("/notify/getall", "GET", {}).then((res) => {
    for (let notify of res) {
        new Notify(notify.id, notify.text, notify.timestamp);
    }
})

MakeReq("/node/getall", "GET", {}).then((res) => {
    for (let node of res) {
        new Node(node.node_id, node.name, node.soil, "Tưới nhỏ giọt", node.timestamp);
    }
    append_add_node_btn();
})

update_chart(getCurrentTimestamp());

const timestamp = getCurrentTimestamp();
const {time,date} = getTimeandDate(timestamp);
document.getElementById("chart_day").innerText = date;