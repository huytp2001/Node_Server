setInterval(() => { // Update sensor value every 10s
    MakeReq('/sensor_stream', "GET", {}).then((res)=>{
        document.getElementById("tem").innerText = res.tem;
        document.getElementById("hum").innerText = res.hum;
        document.getElementById("rain").innerText = res.rain;
        document.getElementById("lux").innerText = res.lux;
    })
}, 10000);

setInterval(() => {
    MakeReq("/node/getall", "GET", {}).then((res) => { // Update node value every 1 min
        for (let node of res) {
            const {time, date} = getTimeandDate(node.timestamp);
            document.getElementById(`${node.node_id}soil`).innerText = node.soil;
            document.getElementById(`${node.node_id}time`).innerText = `${time} ${date}`;
        }
    })
}, 60000);

