let seriesTest = [];
let graphs = [[]];
let graphData = [];
let sortGraphData;
let dates = [];
let preassures = [];
let data = []

var colors = Highcharts.getOptions().colors;

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

    seriesTest = [];

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
            let preassures = [];
            let rows = values[i].split('\r\n');

            for (let i in rows) {
                let rowValues = rows[i].split('\t');
                let date = new Date(rowValues[0]);
                let utcDate = Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
                let preassure = rowValues[2];
                if (!(isNaN(preassure))) {
                    graphData.push([utcDate, Number(preassure)])
                    // preassures.push(Number(preassure));
                    // graphData.push({
                    //     'date': date,
                    //     'preassure': Number(preassure),
                    //     // 'preassure': Number(preassure.split('E')[0]),
                    //     // 'multi': preassure.split('E')[1],
                    // });
                }
            }
            seriesTest.push({
                name: `Series ${i}`,
                data: preassures
            });
        }
        // Ornedar graphData
        sortGraphData = graphData.sort((a, b, ) => {
            return a.date - b.date
        })

        // createTable()
        renderGraph()
        // graphData = [];
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

    // data = graphData.map(element => element.preassure);
    // dates = graphData.map(element => 
    //     Date.UTC(element.date.getYear(),element.date.getMonth(), element.date.getDate(), element.date.getHours(),element.date.getMinutes(),element.date.getSeconds()))
        // multis = graphData.map(element => element.multi)
    dates = graphData.map(element => new Date(element[0]));
    

    console.time('line');
    Highcharts.stockChart('graphCanvas', {

        // series: seriesTest,

        series: [{
            data: graphData,
            lineWidth: 0.5,
            name: 'Hourly data points',
            zoneAxis: 'x',

            zones: [{
                value: Date.UTC(2022, 1),
                color: colors[1]
            }, {
                value: Date.UTC(2022, 3),
                color: colors[4]
            }, {
                value: Date.UTC(2022, 11),
                color: colors[4]
            }, {
                color: colors[5]
            }]            
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
            // categories: dates,
            labels: {
                rotation: -45
            },
            type: 'logarithmic',
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