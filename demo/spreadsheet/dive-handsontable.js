(function() {
window.Dive || (window.Dive = {});
Dive.handsontable = function(options, rows) {
    var el = options.element || Dive.div(),
        $el = $(el);
        //rows = []; rows.push.apply(rows, arguments);

        /*
    for (var i = 0; i < arguments.length; i++) {
        var row = arguments[i];
        rows.push(row);
        for (var j = 0; j < row.length; j++) {
            switch (typeof row[j]) {
                default:
                row[j];
                break;
            }
        }
    }
        */

    $el.handsontable({
        data: rows,
        startRows: 4,
        startCols: 4
    });
    
    return $el.handsontable('getInstance');
};

})();
