function draw_chart(chart_id, label, data, color, max_value) {
    const chart = document.getElementById(`${chart_id}`).getContext('2d');
    const chart_data = {
        labels: ["0h", "1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h"],
        datasets: [{
            label: label,
            data: data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2
        }]
    };
    myChart = new Chart(chart, {
        type: 'bar',
        data: chart_data,
        options: {
            responsive: false,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: max_value
                }
            }
        }
    });
}


function update_chart(ts) {
    MakeReq("/chart", "POST", {"timestamp": `${ts}`}).then((res)=>{
        draw_chart("tem_chart", "Temperature (*C)", res.chart_data.tem, "rgba(235, 106, 47, 0.5)", 60);
        draw_chart("hum_chart", "Humidity (%)", res.chart_data.hum, "rgba(14, 75, 156, 0.5)", 100);
        draw_chart("rain_chart", "Rain percent (%)", res.chart_data.rain, "rgba(9, 214, 204, 0.5)", 100);
        draw_chart("lux_chart", "Light level (lx)", res.chart_data.lux, "rgba(226, 230, 18, 0.5)", 1000);
        document.getElementById("max_tem").innerText = res.chart_stat.tem.max;
        document.getElementById("min_tem").innerText = res.chart_stat.tem.min;
        document.getElementById("avr_tem").innerText = res.chart_stat.tem.avr;
        document.getElementById("max_hum").innerText = res.chart_stat.hum.max;
        document.getElementById("min_hum").innerText = res.chart_stat.hum.min;
        document.getElementById("avr_hum").innerText = res.chart_stat.hum.avr;
        document.getElementById("max_rain").innerText = res.chart_stat.rain.max;
        document.getElementById("min_rain").innerText = res.chart_stat.rain.min;
        document.getElementById("avr_rain").innerText = res.chart_stat.rain.avr;
        document.getElementById("max_lux").innerText = res.chart_stat.lux.max;
        document.getElementById("min_lux").innerText = res.chart_stat.lux.min;
        document.getElementById("avr_lux").innerText = res.chart_stat.lux.avr;
    })
}




