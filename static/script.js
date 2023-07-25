async function MakeReq(url, method, data) {
    try {
        let response = null;
        if (method != "GET") {
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
            });
        }
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

function getTimeandDate(timestamp) {
    const currentDate = new Date(timestamp * 1000);
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const date = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); 
    return {time: `${hours}:${minutes}`, date: `${date}/${month}`}
}

function getCurrentTimestamp() {
    const currentMilliseconds = Date.now();
    const currentTimestamp = Math.floor(currentMilliseconds / 1000);
    return currentTimestamp;
}

function toggle_section(name) {
    const section = document.getElementById(`section_${name}`);
    const hr_txt = document.getElementById(`${name}_hr_txt`);
    if (section.offsetWidth === 0 && section.offsetHeight === 0) {
        section.style.display = "grid";
        hr_txt.innerText = "Ẩn";
    } else {
        section.style.display = "none";
        hr_txt.innerText = "Hiện";
    }
}

const timeout_milis = 3000;
let lamp_state = false;
function lamp_btn() {
    MakeReq("/send_out", "POST", {"mess": "toggle_lamp"}).then((res) => {
        if(res.code == 0) {
            if (!lamp_state) {
                document.getElementById("lamp_btn").className = "button_on";
                lamp_state = true;
            } else {
                document.getElementById("lamp_btn").className = "button_off";
                lamp_state = false;
            }
            document.getElementById("pump_btn").disabled = true;
            document.getElementById("lamp_btn").disabled = true;
            setTimeout(()=>{
                document.getElementById("pump_btn").disabled = false;
                document.getElementById("lamp_btn").disabled = false;
            }, timeout_milis);
        }
    })
}
let pump_state = false;
function pump_btn() {
    MakeReq("/send_out", "POST", {"mess": "toggle_pump"}).then((res) => {
        if(res.code == 0) {
            if (!pump_state) {
                document.getElementById("pump_btn").className = "button_on";
                pump_state = true;
            } else {
                document.getElementById("pump_btn").className = "button_off";
                pump_state = false;
            }
            document.getElementById("pump_btn").disabled = true;
            document.getElementById("lamp_btn").disabled = true;
            setTimeout(()=>{
                document.getElementById("pump_btn").disabled = false;
                document.getElementById("lamp_btn").disabled = false;
            }, timeout_milis);
        }
    })
}

function isNumberKey(evt) {
    evt = evt || window.event;
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      if (evt.preventDefault) {
        evt.preventDefault();
      } else {
        evt.returnValue = false;
      }
    }
  }

function append_add_node_btn() {
    const add_node = document.createElement("div");
    add_node.className = "node";
    add_node.id = "add_node"
    add_node.innerHTML = `  <p class="node_label">TẠO NODE MỚI</p>
                            <div id="plus_ctn" class="plus_ctn">
                                <p class="plus_sign">+</p>
                            </div>
                            <div id="add_node_ctn" style="display: none;" class="add_node_ctn">
                                <div>
                                    <input id="new_node_name" type="text" placeholder="Node name">
                                </div>
                                <div>
                                    <input id="new_node_id" type="text" placeholder="Node ID" onkeypress="return isNumberKey(event)">
                                </div>
                            </div>
                            `;
    document.getElementById("section_node").appendChild(add_node);
    document.getElementById("add_node").addEventListener("mouseover", ()=>{
        document.getElementById("plus_ctn").style.display = "none";
        document.getElementById("add_node_ctn").style.display = "block";
    })
    document.getElementById("add_node").addEventListener("mouseleave", ()=>{
        document.getElementById("add_node_ctn").style.display = "none";
        document.getElementById("plus_ctn").style.display = "flex";
    })
    document.getElementById("add_node").addEventListener("keydown", (event)=>{
        if (event.key === 'Enter' || event.keyCode === 13) {
            const new_node_name = document.getElementById("new_node_name");
            const new_node_id = document.getElementById("new_node_id");
            if (new_node_name.value == "" || new_node_id.value == "") return;
            MakeReq("/node/create", "POST", {"name": new_node_name.value, "id": new_node_id.value}).then((res)=>{
            if (res.code != 0) return;
                document.getElementById("add_node").remove();
                new Node(new_node_id.value, new_node_name.value, 0.0, "Tưới nhỏ giọt", res.timestamp);
                append_add_node_btn();
            })
        }
    })
}


function remove_and_reinit_canvas() {
    document.getElementById("tem_chart").remove();
    document.getElementById("hum_chart").remove();
    document.getElementById("rain_chart").remove();
    document.getElementById("lux_chart").remove();
    const tem_canvas = document.createElement("canvas");
    const hum_canvas = document.createElement("canvas");
    const rain_canvas = document.createElement("canvas");
    const lux_canvas = document.createElement("canvas");
    tem_canvas.id = "tem_chart";
    hum_canvas.id = "hum_chart";
    rain_canvas.id = "rain_chart";
    lux_canvas.id = "lux_chart";
    const chart_ctn = document.getElementById("chart_ctn");
    chart_ctn.appendChild(tem_canvas);
    chart_ctn.appendChild(hum_canvas);
    chart_ctn.appendChild(rain_canvas);
    chart_ctn.appendChild(lux_canvas);
}

let chart_offset = 0;

function next_day() {
    remove_and_reinit_canvas();
    chart_offset += 86400;
    update_chart(getCurrentTimestamp()-chart_offset);
    const {time,date} = getTimeandDate(getCurrentTimestamp()-chart_offset);
    document.getElementById("chart_day").innerText = date;
}

function previous_day() {
    if (chart_offset == 0) return;
    remove_and_reinit_canvas();
    chart_offset -= 86400;
    update_chart(getCurrentTimestamp()-chart_offset);
    const {time,date} = getTimeandDate(getCurrentTimestamp()-chart_offset);
    document.getElementById("chart_day").innerText = date;
}