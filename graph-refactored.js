const btnSelectFile = document.querySelector('#fileTxt');
const graphCanvas = document.querySelector('#graph');
const tableBody = document.querySelector("#tableData");
const colors = Highcharts.getOptions().colors;

let readers = [];
let series = [];


const readFileAsText = (file) => {
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

const getFileRows = (content) => {
    return content.split('\r\n');
}

const parseRow = (row) => {
    let values = row.split('\t');
    if(!isNaN(values[2])){
        return [new Date(values[0]), Number(values[2])]
    }

}

const initReaders = (files) => {
    for (let i = 0; i < files.length; i++) {
        readers.push(readFileAsText(files[i]));
    }
}

const sortData = (dataSet) => {
    return dataSet.sort((date1, date2) => date1[0] - date2[0]);
}

btnSelectFile.addEventListener("change", function(evt){
        
    initReaders(evt.currentTarget.files);

    Promise.all(readers).then((files) => {
        files.forEach((file) => {
            let rows = getFileRows(file);
            rows.forEach((row) => {
                let point = parseRow(row);
                if(point != null)
                    series.push(point);
            })
        });
        
        renderGraph(sortData(series));
    });

}, false);

const renderGraph = (dataSet) => {
    console.log(dataSet);
    let utcFormattedData = dataSet.map( element => (element[0]));
    let data = dataSet.map( element => (element[1]));
    Highcharts.chart('graphCanvas', {
        title: {
            text: 'Programa para recuperacion y lectura de la bitacora de vacío del equipo de XPS '
        },
        xAxis: {
            categories: utcFormattedData,
            title: { text: 'Date'}
        },
        yAxis: {
            title: {text: 'Presion (mbar)'},
            type: 'logarithmic',
        },
        series: [{
            data: data,
            lineWidth: 0.5,
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
        }
    });
}