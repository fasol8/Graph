const btnSelectFile = document.querySelector("#fileTxt");
const graphCanvas = document.querySelector("#graph");
const tableBody = document.querySelector("#tableData");
const zipFile = document.getElementById("fileZip");

let readers = [];
let series = [];
let dataZip = [];

const readFileAsText = (file) => {
  return new Promise(function (resolve, reject) {
    let fr = new FileReader();
    fr.onload = function () {
      resolve(fr.result);
    };
    fr.onerror = function () {
      reject(fr);
    };
    fr.readAsText(file);
  });
};

const getFileRows = (content) => {
  return content.split("\r\n");
};

const parseRow = (row) => {
  let values = row.split("\t");
  if (!isNaN(values[2])) {
    let objectDate = new Date(values[0]);
    return [objectDate, Number(values[2]), objectDate.getFullYear()];
  }
};

const initReaders = (files) => {
  for (let i = 0; i < files.length; i++) {
    readers.push(readFileAsText(files[i]));
  }
};

const sortData = (dataSet) => {
  return dataSet.sort((date1, date2) => date1[0] - date2[0]);
};

const formatDate = (value) => {
  var tzoffset = new Date(value).getTimezoneOffset() * 60000; //offset in milliseconds
  var localISOTime = new Date(value - tzoffset).toISOString();
  return localISOTime.slice(0, 19).replace("T", " ");
};

btnSelectFile.addEventListener(
  "change",
  function (evt) {
    series = [];
    readers = [];
    initReaders(evt.currentTarget.files);

    Promise.all(readers).then((files) => {
      files.forEach((file) => {
        let rows = getFileRows(file);
        rows.forEach((row) => {
          let point = parseRow(row);
          if (point != null) series.push(point);
        });
      });
      renderGraph(sortData(series));
    });
  },
  false
);

const readTextFileContent = (file) => {
  if (!file.dir && file.name.endsWith(".txt")) {
    return file.async("text").then((content) => ({
      fileName: file.name,
      content: content.replace(/[^\x20-\x7E\t\r\n]/g, ""),
    }));
  }
};

const loadZipContents = (arrayBuffer) => {
  const zip = new JSZip();
  return zip.loadAsync(arrayBuffer);
};

async function processZipContents(contents) {
  let textFilePromises = [];
  contents.forEach((relativePath, file) =>
    textFilePromises.push(readTextFileContent(file))
  );
  const textFiles = await Promise.all(textFilePromises);
  return textFiles;
}

const readFileContents = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const contents = await loadZipContents(arrayBuffer);
      const textFiles = await processZipContents(contents);
      resolve(textFiles);
    };

    reader.onerror = () => {
      reject(new Error("Error reading file: " + file.name));
    };

    reader.readAsArrayBuffer(file);
  });
};

const processZipFiles = (textFiles) => {
  let series = [];
  textFiles.flat().forEach((file) => {
    let rows = getFileRows(file.content);
    rows.forEach((row) => {
      let point = parseRow(row);
      if (point != null) series.push(point);
    });
  });
  renderGraph(sortData(series));
};

async function processFiles(files) {
  const filePromises = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePromise = readFileContents(file);
    filePromises.push(filePromise);
  }

  const textFiles = await Promise.all(filePromises);
  processZipFiles(textFiles);
  return textFiles;
}

zipFile.addEventListener("change", function (event) {
  const files = event.target.files;
  processFiles(files);
});

const downloadFile = () => {
  const link = document.createElement("a");
  const content = series
    .map((element) => `${formatDate(element[0])}\t \t${element[1]}`)
    .join("\r\n");
  const file = new Blob([content], { type: "text/plain" });
  link.href = URL.createObjectURL(file);
  link.download = prompt("Elija un nombre de archivo");
  link.click();
  URL.revokeObjectURL(link.href);
};

const renderGraph = (dataSet) => {
  let yearData = dataSet.map((element) => element[2]);
  let yearFirts = yearData[0];
  let yearLast = yearData[yearData.length - 1];

  let utcFormattedDataHelp = dataSet.map((element) => formatDate(element[0]));

  Highcharts.chart("graphCanvas", {
    title: {
      text: "Programa para recuperacion y lectura de la bitacora de vacio del equipo de XPS ",
    },
    subtitle: {
      text:
        utcFormattedDataHelp[0] +
        " => " +
        utcFormattedDataHelp[utcFormattedDataHelp.length - 1],
    },
    xAxis: {
      title: { text: "Date" },
      type: "datetime",
      labels: {
        format: "{value:%b %e}",
      },
      dateTimeLabelFormats: {
        month: "%e. %b",
        year: "%Y",
      },
    },
    yAxis: {
      title: { text: "Presion (mbar)" },
      type: "logarithmic",
    },
    series: [
      {
        name: "Bitacora de vacio",
        data: dataSet,
        lineWidth: 0.5,
        pointIntervalUnit: "month",
        zoneAxis: "x",
        zones: [
          {
            // INICIO AÑO
            value: Date.UTC(yearFirts, 1),
            color: "#F86624",
          },
          {
            value: Date.UTC(yearFirts, 2),
            color: "#1E1E24",
          },
          {
            value: Date.UTC(yearFirts, 3),
            color: "#662E9B",
          },
          {
            value: Date.UTC(yearFirts, 4),
            color: "#43BCCD",
          },
          {
            value: Date.UTC(yearFirts, 5),
            color: "#FFA987",
          },
          {
            value: Date.UTC(yearFirts, 6),
            color: "#6D9F71",
          },
          {
            value: Date.UTC(yearFirts, 7),
            color: "#CB48b7",
          },
          {
            value: Date.UTC(yearFirts, 8),
            color: "#08BDBD",
          },
          {
            value: Date.UTC(yearFirts, 9),
            color: "#FF9914",
          },
          {
            value: Date.UTC(yearFirts, 10),
            color: "#04724D",
          },
          {
            value: Date.UTC(yearFirts, 11),
            color: "#A7A2A9",
          },
          {
            value: Date.UTC(yearFirts, 12),
            color: "#42253B",
          },
          {
            // ULTIMO AÑO
            value: Date.UTC(yearLast, 1),
            color: "#F86624",
          },
          {
            value: Date.UTC(yearLast, 2),
            color: "#1E1E24",
          },
          {
            value: Date.UTC(yearLast, 3),
            color: "#662E9B",
          },
          {
            value: Date.UTC(yearLast, 4),
            color: "#43BCCD",
          },
          {
            value: Date.UTC(yearLast, 5),
            color: "#FFA987",
          },
          {
            value: Date.UTC(yearLast, 6),
            color: "#6D9F71",
          },
          {
            value: Date.UTC(yearLast, 7),
            color: "#CB48b7",
          },
          {
            value: Date.UTC(yearLast, 8),
            color: "#08BDBD",
          },
          {
            value: Date.UTC(yearLast, 9),
            color: "#FF9914",
          },
          {
            value: Date.UTC(yearLast, 10),
            color: "#04724D",
          },
          {
            value: Date.UTC(yearLast, 11),
            color: "#A7A2A9",
          },
          {
            value: Date.UTC(yearLast, 12),
            color: "#42253B",
          },
        ],
      },
    ],
    chart: {
      zoomType: "x",
      height: 50 + "%",
      resetZoomButton: {
        theme: {
          fill: "white",
          stroke: "silver",
          r: 0,
          states: {
            hover: {
              fill: "#41739D",
              style: {
                color: "white",
              },
            },
          },
        },
      },
    },
  });
};
