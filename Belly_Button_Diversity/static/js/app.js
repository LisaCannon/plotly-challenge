function buildMetadata(sample) {
    // url to point to app route
    var url = "/metadata/"+sample;
    console.log("this is the url ",url);
    //use d3.json to get metadata for selected sample
    d3.json(url).then((sample) => {
      console.log("meta samp ", sample);
      //find the panel where metadata will be displayed
      var panelText = d3.select("#sample-metadata");
      panelText.html("");
      //go through the objects in the dictionary to display each key/value pair on a line
      Object.entries(sample).forEach(([key, value]) => {
        row = panelText.append("h6").text(key +": "+ value);
      });
    
    // BONUS: Build the Gauge Chart of belly button scrubs per week
    //Set the pull as a pointer for the gauge chart 
    pullList = [0,0,0,0,0,0,0,0,0,0];
    scrubs = sample.WFREQ;
    //any scrubs above 8 go in the 8+ group
    if (scrubs > 8) {scrubs = 8};
    pullList[scrubs] = 0.1;

    //
    var gaugeDiv = document.getElementById("gauge");

    var traceA = {
      type: "pie",
      showlegend: false,
      hole: 0.4,
      rotation: 90,
      values: [100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100/9, 100],
      text: ["0", "1", "2", "3", "4","5","6","7","8+", ""],
      direction: "clockwise",
      textinfo: "text",
      textposition: "inside",
      pull: pullList,
      marker: {
        colors: [
          "rgba(14, 127, 0, .5)",
          "rgba(110, 154, 22, .5)",
          "rgba(150, 170, 32, .5)",
          "rgba(170, 202, 42, .5)",
          "rgba(190, 209, 95, .5)",
          "rgba(202, 209, 120, .5)",
          "rgba(210, 206, 145, .5)",
          "rgba(220, 216, 179, .5)",
          "rgba(232, 226, 202, .5)",
          "rgba(255, 255, 255, 0)"
        ]
      },
      labels: ["0", "1", "2", "3", "4","5","6","7","8+", ""],
      hoverinfo: "label"
    };
    var degrees = sample.WFREQ*180/9;
    var radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = -1 * radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
      
    var layout = {
      title: 'Number of Scrubs per Week',
      xaxis: {visible: false, range: [-1, 1]},
      yaxis: {visible: false, range: [-1, 1]}
    };
      
    var data = [traceA];
      
    Plotly.plot(gaugeDiv, data, layout, {staticPlot: true});
  });
  }

    // BONUS: Build the Gauge Chart

function buildCharts(sample) {
  //Pie chart of sample data for selected subject
  //url for the sample
  var url = "/samples/"+sample;
  d3.json(url).then(function(samp) {
    //keep only the top 10 bacteria present.
    var val = samp.sample_values.slice(0,10);
    var lab = samp.otu_labels.slice(0,10);
    var sIds = samp.otu_ids.slice(0,10);

    var trace1 = {values: val,
                labels: sIds,
                hoverinfo: lab,
                hovertext:lab,
                type: "pie"};
    var dataPie = [trace1];
   
Plotly.newPlot("pie", dataPie);

// bubble chart of sample data for selected subject
//vary size by amount a sample observed
var sSize = samp.sample_values.map(s => s/2);
//vary color by sample value
var sColor = samp.otu_ids.map(s => `hsl(${s/3000*100},100,40)`);
var trace2 = {
    x: samp.otu_ids,
    y: samp.sample_values,
    hoverinfo: lab,
    hovertext:lab,
    mode: 'markers',
    marker: {
      size: sSize,
      color: sColor}
};
dataBubble = [trace2];
var layout = {
  xaxis: {title:"OTU IDs"},
  yaxis: {title:"Sample Value"}
}

Plotly.newPlot("bubble",dataBubble,layout);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")       
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    console.log("First Sample ", firstSample);
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected 
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();


