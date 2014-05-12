(function() {



var setRenderTarget = function(target) {
    switch (target) {
        case 'DOM':
    }
};

Dive.setRenderTarget = setRenderTarget;


'textarea', 'button', 'ul', 'li',



$(function() {

var c = Dive.cell;
var f = function(formula) {

    //Dive.cellf;
};

var el = Dive.div(),
    table = Dive.handsontable({
    element: el
}, [
    ["Assets", "Books", "Rocks",     "Cats"],
    ["One",    10,      3,           100],
    ["Two",    20,      3,           200],
    ["Three",  30,      3,           300]
]);

$('#table').html(el);
table.view.wt.draw(true);
table.setDataAtCell(0, 0, 'new value');

});
})();
