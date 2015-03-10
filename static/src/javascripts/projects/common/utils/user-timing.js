define(function () {
    var perf = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;

    function mark(label) {
        if (perf && 'mark' in perf) {
            perf.mark('gu.' + label);
        }

        if (window.console && window.console.timeStamp) {
        	console.timeStamp('gu.' + label);
        }
    }

    return {
        mark: mark
    };
});