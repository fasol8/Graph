let graphData = [];
let sortGraphData;
let dates = [];
let preassures = [];
let data = []

const btnSelectFile = document.querySelector('#fileTxt');
const graphCanvas = document.querySelector('#graph');
const tableBody = document.querySelector("#tableData");

function readFileAsText(file) {
    return new Promise(function(resolve, reject) {
        let fr = new FileReader();

        fr.onload = function() {
            resolve(fr.result);
        };

        fr.onerror = function() {
            reject(fr);
        };

        fr.readAsText(file);
    });
}

// Manejar múltiples cargas de archivos
document.getElementById("fileTxt").addEventListener("change", function(ev) {
    let files = ev.currentTarget.files;
    let readers = [];

    // Abortar si no hubo archivos seleccionados
    if (!files.length) return;

    // Almacenar promesas en matriz
    for (let i = 0; i < files.length; i++) {
        readers.push(readFileAsText(files[i]));
    }

    // Activar promesas
    Promise.all(readers).then((values) => {
        // Los valores serán una matriz que contiene un elemento.
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        for (var i = 0; i < values.length; i++) {
            let rows = values[i].split('\r\n');

            for (let i in rows) {
                let rowValues = rows[i].split('\t');
                let date = rowValues[0];
                let preassure = rowValues[2];
                if (!(isNaN(preassure))) {
                    graphData.push({
                        'date': date,
                        'preassure': Number(preassure),
                        // 'preassure': Number(preassure.split('E')[0]),
                        // 'multi': preassure.split('E')[1],
                    });
                }
            }
        }
        // Ornedar graphData
        sortGraphData = graphData.sort((a, b, ) => {
            return a.date - b.date
        })

        // createTable()
        renderGraph()
        graphData = [];
        sortGraphData = [];
    });
}, false);

const createTable = () => {
    let dataHtml = ''
    for (var element of sortGraphData) {
        dataHtml += `<tr><td>${element.date}</td><td>${element.preassure}</td></tr>`
            // dataHtml += `<tr><td>${element.date}</td><td>${element.preassure} E${element.multi}</td></tr>`
    }
    tableBody.innerHTML = dataHtml
}

const renderGraph = () => {

    data = graphData.map(element => element.preassure);
    dates = graphData.map(element => element.date)
        // multis = graphData.map(element => element.multi)

    console.time('line');
    Highcharts.chart('graphCanvas', {

        series: [{
            data: data,
            lineWidth: 0.5,
            name: 'Hourly data points'
        }],

        chart: {
            zoomType: 'x',
            resetZoomButton: {
                theme: {
                    fill: 'white',
                    stroke: 'silver',
                    r: 0,
                    states: {
                        hover: {
                            fill: '#41739D',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                }
            }
        },

        title: {
            text: 'Programa para recuperacion y lectura de la bitacora de vacío del equipo de XPS '
        },

        subtitle: {
            text: 'Total de puntos: ' + graphData.length
        },

        xAxis: {
            categories: dates,
            labels: {
                rotation: -45
            },
            type: 'datetime',
            // WORK
            // dateTimeLabelFormats: {
            //     month: '%e. %b',
            //     year: '%b'
            // },
            title: {
                text: 'Date'
            }
        },

        yAxis: {
            title: {
                text: 'Presion (mbar)'
            },
            // min: 0,
            // max: 10,
        },

        accessibility: {
            screenReaderSection: {
                beforeChartFormat: '<{headingTagName}>{chartTitle}</{headingTagName}><div>{chartSubtitle}</div><div>{chartLongdesc}</div><div>{xAxisDescription}</div><div>{yAxisDescription}</div>'
            }
        },

        tooltip: {
            // valueDecimals: 2
            // headerFormat: '<b>{series.name}</b><br>',
            // pointFormat: '{point.x:}: {point.y:.2f} E '
        },
    });
    console.timeEnd('line');
}