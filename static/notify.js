class Notify {
    constructor(id, text, timestamp) {
        this.cutoff_threshold = 60;
        this.id = id;
        this.text = text;
        this.timestamp = timestamp;
        this.render();
        this.event_listener();
    }
    render() {
        const {time, date} = getTimeandDate(this.timestamp);
        const notify_div = document.createElement("div");
        const hr_tag = document.createElement('div');
        notify_div.className = "notify_line";
        notify_div.id=`${this.id}notify`;
        hr_tag.className = "notify_hr";
        hr_tag.id = `${this.id}hr`;
        notify_div.innerHTML = `
            <div>
                <p>${time}</p>
                <p>${date}</p>
            </div>
            <div class="notify_text" id="${this.id}notify_text">${this.text}</div>
            <div style="margin-left: auto;">
                <button class="round_btn" id="${this.id}del_notify_btn">-</button>
            </div>
        `
        hr_tag.innerHTML = `<hr>`
        document.getElementById("notify_ctn").appendChild(notify_div);
        document.getElementById("notify_ctn").appendChild(hr_tag);
    }
    event_listener() {
        const notify_text = document.getElementById(`${this.id}notify_text`);
        const del_notify_btn = document.getElementById(`${this.id}del_notify_btn`);
        if (notify_text.innerText.length > this.cutoff_threshold) {
            notify_text.innerText = `${this.text.slice(0,this.cutoff_threshold)}...`;
        }
        del_notify_btn.style.display = "none";
        notify_box.addEventListener("mouseover", () => {
            notify_text.innerText = this.text;
            del_notify_btn.style.display = "block";
        })
        notify_box.addEventListener("mouseout", () => {
            if (notify_text.innerText.length > this.cutoff_threshold) {
                notify_text.innerText = `${this.text.slice(0,this.cutoff_threshold)}...`;
            }
            del_notify_btn.style.display = "none";
        })
        del_notify_btn.addEventListener("click", () => {
            MakeReq("/notify/delete", "DELETE", {"id": `${this.id}`}).then((res) => {
                if (res.code == 0) {
                    document.getElementById(`${this.id}notify`).remove();
                    document.getElementById(`${this.id}hr`).remove();
                }
            })
        })
    }
}



