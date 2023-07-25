class Node {
    constructor(id, name, soil, status, timestamp) {
        this.id = id;
        this.name = name;
        this.soil = soil;
        this.status = status;
        this.timestamp = timestamp;
        this.render();
        this.event_listener();
    }

    render() {
        const {time, date} = getTimeandDate(this.timestamp);
        const node_div = document.createElement("div");
        node_div.className = "node";
        node_div.id = `${this.id}node`;
        node_div.innerHTML = `
            <div class="node_header">
                <button id="${this.id}camera" class="node_round_btn"><span class="material-symbols-outlined">photo_camera</span></button>
                <p id="${this.id}node_name" class="node_label" style="flex-basis: 80%;">${this.name}</p>
                <div style="margin-left: auto;">
                    <button id="${this.id}setting" class="node_round_btn"><span class="material-symbols-outlined">settings</span></button>
                </div>
            </div>
            <div id="${this.id}node_ctn" class="two_col_node">
                <div class="col">
                    <p>Độ ẩm đất:</p>
                    <p>Trạng thái:</p>
                    <p>Thời gian:</p>
                </div>
                <div class="col">
                    <p><span id="${this.id}soil">${this.soil}</span>%</p>
                    <p id="${this.id}status">${this.status}</p>
                    <p id="${this.id}time">${time} ${date}</p>
                </div>
            </div>
            <div id="${this.id}setting_ctn" style="display: none; padding-top: 10px;">
                <div id="${this.id}rename_ctn" class="button_ctn">
                    <button id="${this.id}rename" style="height: 40px;">ĐỔI TÊN NODE</button>
                </div>
                <div style="display:none;"class="button_ctn" id="${this.id}rename_input_ctn">
                    <input id="${this.id}rename_input" class="rename_input" type="text" placeholder="New name">
                </div>
                <div class="button_ctn">
                    <button id="${this.id}delete" style="height: 40px;">XÓA NODE</button>
                </div>
            </div>
        `
        document.getElementById("section_node").appendChild(node_div);
    }

    event_listener() {
        const camera_btn = document.getElementById(`${this.id}camera`);
        const node = document.getElementById(`${this.id}node`);
        const setting_btn = document.getElementById(`${this.id}setting`);
        const node_ctn = document.getElementById(`${this.id}node_ctn`);
        const setting_ctn = document.getElementById(`${this.id}setting_ctn`);
        const delete_btn = document.getElementById(`${this.id}delete`);
        const rename_btn = document.getElementById(`${this.id}rename`);
        const rename_btn_ctn = document.getElementById(`${this.id}rename_ctn`);
        const rename_input_ctn = document.getElementById(`${this.id}rename_input_ctn`);
        const rename_input = document.getElementById(`${this.id}rename_input`);
        setting_btn.addEventListener("click", () => {
            node_ctn.style.display = "none";
            setting_ctn.style.display = "block";
        })
        node.addEventListener("mouseleave", () => {
            setting_ctn.style.display = "none";
            node_ctn.style.display = "flex";
            rename_input_ctn.style.display = "none";
            rename_btn_ctn.style.display = "block";
        })
        delete_btn.addEventListener("click", () => {
            MakeReq("/node/delete", "DELETE", {"id": `${this.id}`}).then((res)=>{
                if (res.code == 0) {
                    node.remove();
                }
            })
        })
        rename_btn.addEventListener("click", () => {
            rename_btn_ctn.style.display = "none";
            rename_input_ctn.style.display = "block";
        })
        rename_input.addEventListener("keydown", (event)=>{
            if (event.key === 'Enter' || event.keyCode === 13) {
                if (rename_input.value == "") return;
                MakeReq("/node/rename", "PUT", {"id": this.id, "name": rename_input.value}).then((res)=>{
                    if (res.code == 0) {
                        document.getElementById(`${this.id}node_name`).innerText = rename_input.value;
                        rename_input.value = "";
                        rename_input_ctn.style.display = "none";
                        rename_btn_ctn.style.display = "block";
                    }
                })
            }
        })
        camera_btn.addEventListener("click", () => {
            MakeReq("/send_out", "POST", {"mess": "take_picture"}).then((res) => {
                
            })
        })
    }
}





