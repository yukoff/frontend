function renderBenchmark() {

}


$(function() {

//    var data = [ { x: -1893456000, y: 92228531 }, { x: -1577923200, y: 106021568 }, { x: -1262304000, y: 123202660 }, { x: -946771200, y: 132165129 }, { x: -631152000, y: 151325798 }, { x: -315619200, y: 179323175 }, { x: 0, y: 203211926 }, { x: 315532800, y: 226545805 }, { x: 631152000, y: 248709873 }, { x: 946684800, y: 281421906 }, { x: 1262304000, y: 308745538 } ];
    var data = [];
    var graph = new Rickshaw.Graph( {
        element: document.querySelector(".chart"),
        width: 580,
        height: 250,
        series: [ {
            color: 'steelblue',
            data: data
        } ]
    } );

    var axes = new Rickshaw.Graph.Axis.Time( { graph: graph } );

    graph.render();

    $.ajax({
        url: '/admin/performance/data.json'
    }).done(function(data) {
        window.d = data;
        window.ft = _(data)
            .filter(function(benchmark) { return benchmark.benchmarkName === 'gu.FrontsAll'; } )
            .map(function(benchmark) {
                console.log(benchmark);
                return {
                    timestamp: benchmark.timestamp,
                    tests: _.indexBy(benchmark.benchmarkData.per_page_values, 'name')
                };
            })

    })

});

