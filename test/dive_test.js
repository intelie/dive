describe('Dive', function () {
    var theSkyIsBlue = true;
    var hellFreezesOver = false;

    it("renders simple elements", function() {
        expect(Dive.b().outerHTML).toEqual("<b></b>");
        _.each([null, undefined, false, true], function(content) {
            expect(Dive.b(content).outerHTML).toEqual("<b></b>");
            expect(Dive.b({}, content).outerHTML).toEqual("<b></b>");
        });
        expect(Dive.b(0).outerHTML).toEqual("<b>0</b>");
        expect(Dive.b("a").outerHTML).toEqual("<b>a</b>");
        expect(Dive.b({}, "a").outerHTML).toEqual("<b>a</b>");

        expect(Dive.b({ when: hellFreezesOver }, "a")).toEqual(null);
        expect(Dive.b({ when: undefined }, "a")).toEqual(null);
        expect(Dive.b({ when: theSkyIsBlue }, "a").outerHTML)
            .toEqual("<b>a</b>");
    });

    it("parses a single options argument correctly", function() {
        expect(Dive.b({ when: hellFreezesOver})).toEqual(null);
        expect(Dive.b({ when: undefined })).toEqual(null);
        expect(Dive.b({ css: '.hey#you'}).outerHTML)
            .toEqual('<b class="hey" id="you"></b>');
    });

    it("accepts selector-syntax argument to Dive() function", function() {
        expect(Dive('.to.be').outerHTML).toEqual('<div class="to be"></div>');
        expect(Dive('b.to.be').outerHTML).toEqual('<b class="to be"></b>');
        expect(Dive('b.to#be', { css: '.hey#you' }).outerHTML)
            .toEqual('<b class="hey to" id="you be"></b>');

        expect(Dive('b.to > #be > a.you', { css: '.hey' }, 'hello')
               .outerHTML).toEqual('<b class="to"><div id="be">' +
                                   '<a class="hey you">hello</a>' +
                                   '</div></b>');
    });

    it("weeds out null elements", function() {
        expect(Dive.div(
            Dive.span({ when: hellFreezesOver }, "a")
        ).outerHTML).toEqual("<div></div>");

        expect(Dive.div(
            Dive.span({ when: hellFreezesOver }, "a"),
            Dive.span("b"),
            Dive.span({ when: hellFreezesOver }, "c")
        ).outerHTML).toEqual("<div><span>b</span></div>");

        expect(Dive.div(
            Dive.b("a"),
            Dive.map(function(i) {
                return (i && Dive.i(i)) || null;
            }, [1, 2, undefined, 3, 0]),
            Dive.b("c")
        ).outerHTML).toEqual("<div><b>a</b><i>1</i><i>2</i><i>3</i><b>c</b></div>");
    });

    it("maps values through functions and expands dom nodes in-place", function() {
        expect(Dive.div(
            Dive.map(function(k) { return Dive.b(k); }, ['c', 'd']),
            Dive.map(function(k) { return Dive.b(k); }, ['d', 'e'])
        ).outerHTML).toEqual("<div><b>c</b><b>d</b><b>d</b><b>e</b></div>");

        expect(Dive.div(
            Dive.mapSome(Dive.b, [0, 1, null, 2])
        ).outerHTML).toEqual("<div><b>0</b><b>1</b><b>2</b></div>");

        expect(Dive.span(Dive.map(Dive.b, [1, 2]))
               .outerHTML).toEqual("<span><b>1</b><b>2</b></span>");

        var mapToI = Dive.map(function(i) { return Dive.b({ when: i }, i); });
        expect(Dive.div(
            mapToI([1, null, 2])
        ).outerHTML).toEqual("<div><b>1</b><b>2</b></div>");
    });

    it("takes n elements from a collection", function() {
        expect(Dive.take(3, [null, undefined, 0, 1])).toEqual([null, undefined, 0]);

        var take2 = Dive.take(2);
        expect(take2([1, 2, 3, 4])).toEqual([1, 2]);

        expect(Dive.take(null, [1, 2])).toEqual([1, 2]);
        expect(Dive.take(undefined, [1, 2])).toEqual([1, 2]);
    });

    it("repeats a value n times", function() {
        expect(Dive.div(Dive.repeat(3, Dive.b('a'))).outerHTML)
            .toEqual('<div><b>a</b><b>a</b><b>a</b></div>');
    });

    it("pipe values through transformations", function() {
        expect(Dive.div(
            Dive.pipe([0, 'a', 1, 'b', null],
                      Dive.mapSome(function(c) { return c + c; }),
                      Dive.take(3),
                      Dive.filter(Dive.identity),
                      Dive.map(function(c) { return Dive.span('a' + c); })
        )).outerHTML).toEqual("<div><span>aaa</span><span>a2</span></div>");
    });

    it("renders a table", function() {
        var table = Dive.table(
            { css: '.hey#you' },
            Dive.thead(
                Dive.tr({ when: true },
                        Dive.th({ when: undefined }),
                        Dive.map(function(c) {
                            return Dive.th(c);
                        }, [1, 2])
                       )),
            Dive.tbody(
                Dive.pipe(['a', 'b', 'c'],
                          Dive.take(2),
                          Dive.map(function(row) {
                              return Dive.tr(
                                  Dive.td(this.$index),
                                  Dive.td(row)
                              );
                          })))
        );

        expect(table.outerHTML)
            .toEqual('<table class="hey" id="you">' +
                     '<thead><tr><th>1</th><th>2</th></tr></thead>' +
                     '<tbody>' +
                     '<tr><td>0</td><td>a</td></tr>' +
                     '<tr><td>1</td><td>b</td></tr>' +
                     '</tbody></table>');
    });

    it("prepends and appends content through optional settings", function() {
        expect(Dive.b({ prependContent: '<div></div>' }).outerHTML)
            .toEqual('<b><div></div></b>');
        expect(Dive.b({ appendContent: '<div></div>' }).outerHTML)
            .toEqual('<b><div></div></b>');
        expect(Dive.b({ prependContent: '<div></div>',
                        appendContent: '<div class="hey"></div>',
                        css: '.hey' }).outerHTML)
            .toEqual('<b class="hey"><div></div><div class="hey"></div></b>');

        expect(Dive.b({ prependContent: '<div></div>' }, "a").outerHTML)
            .toEqual('<b><div></div>a</b>');
        expect(Dive.b({ appendContent: '<div></div>' }, "a").outerHTML)
            .toEqual('<b>a<div></div></b>');
        expect(Dive.b({ prependContent: '<div></div>',
                        appendContent: '<span></span>' }, "a")
               .outerHTML).toEqual('<b><div></div>a<span></span></b>');
    });

    it("sets attributes on an element through options", function() {
        expect(Dive.b({ attr: { value: 1 } }).outerHTML)
            .toEqual('<b value="1"></b>');
        var el = Dive.b({ attr: { value: '1', class: 'hey you' },
                          data: { hey: 2 } });
        expect(el.className).toEqual('hey you');
        expect(el.getAttribute('value')).toEqual('1');
        expect(el.getAttribute('data-hey')).toEqual('2');

        var el1 = Dive.b({ attr: { value: '1' }, value: '2', href: '3'});
        expect(el1.getAttribute('value')).toEqual('2');
        expect(el1.getAttribute('href')).toEqual('3');

        var el2 = Dive.b({ style: { float: 'left', overflow: 'auto' }});
        expect(el2.getAttribute('style'))
            .toEqual('float: left; overflow: auto; ');
    });

    it("binds partial options to a Dive.div function", function() {
        var divefn = Dive.bindOptions({ css: '.hey' }, Dive.div);
        expect(divefn().outerHTML).toEqual('<div class="hey"></div>');

        var divefn2 = Dive.bindOptions({ prependContent: 'he' }, Dive.div);
        expect(divefn2('y').outerHTML).toEqual('<div>hey</div>');

        var divefn3 = Dive.bindOptions({ css: '.hello' }, Dive.div);
        divefn3 = Dive.bindOptions({ css: '#hello' }, divefn3);
        divefn3 = Dive.bindOptions({ prependContent: 'w' }, divefn3);
        divefn3 = Dive.bindOptions({ appendContent: 'd' }, divefn3);
        expect(divefn3('orl').outerHTML).toEqual('<div id="hello">world</div>');
    });

    it("updates and retrieves a cell's value", function() {
        var cell = Dive.cell(3);
        expect(cell()).toEqual(3);
        cell(5);
        expect(cell()).toEqual(5);
    });

    it("registers lazy cell deps. in a cell function's context", function() {
        var cell1 = Dive.cell('a');
        expect(cell1()).toEqual('a');
        var cell1L = Dive.cellf('lazy', function() { return cell1() + 'b'; });

        expect(cell1L()).toEqual('ab');
        cell1('b'); expect(cell1L()).toEqual('bb');
        cell1('a'); expect(cell1L()).toEqual('ab');

        var spy = jasmine.createSpy(),
            cell2 = Dive.cell(1),
            cell2L = Dive.cellf('lazy', function() {
                spy();
                return cell1() + cell2();
            });

        expect(spy.callCount).toEqual(1);
        cell1('b'); cell2(4); cell1('c');
        expect(spy.callCount).toEqual(1);
        expect(cell2L()).toEqual('c4');
        cell2L();
        expect(spy.callCount).toEqual(2);

        cell1('z'); cell2(9);
        expect(cell2L()).toEqual('z9');
    });

    it("registers eager cell deps. in a cell function's context", function() {
        var cell1 = Dive.cell('a');
        expect(cell1()).toEqual('a');
        var cell1E = Dive.cellf(function() { return cell1() + 'b'; });

        expect(cell1E()).toEqual('ab');
        cell1('b'); expect(cell1E()).toEqual('bb');
        cell1('a'); expect(cell1E()).toEqual('ab');

        var spy = jasmine.createSpy(),
            cell2 = Dive.cell(1),
            cell2E = Dive.cellf(function() {
                spy();
                return cell1() + cell2();
            });

        expect(spy.callCount).toEqual(1);
        cell1('b'); cell2(4); cell1('c');
        expect(spy.callCount).toEqual(4);
        expect(cell2E(1)).toEqual('c4');
        expect(spy.callCount).toEqual(4);
        cell2E(2);
        expect(spy.callCount).toEqual(4);

        cell1('z');
        cell2(9);
        expect(cell2E()).toEqual('z9');
    });

    it("registers repeated cell deps", function() {
        var cell = Dive.cell(1),
            cellf = Dive.cellf(function() { return cell() + cell(); });

        expect(cellf()).toEqual(2);
    });

    it("registers nested function cell deps", function() {
        var cell1 = Dive.cell(1),
            cell2 = Dive.cell(2),
            cella = Dive.cell('a'),
            cellf1 = Dive.cellf(function() { return cell1() + 10 + cell2(); }),
            cellf2 = Dive.cellf(function() {
                return 'number: ' + cellf1() + ' letter: ' + cella();
            });

        expect(cellf1()).toEqual(13);
        expect(cellf2()).toEqual('number: 13 letter: a');
        cell1(3);
        expect(cellf2()).toEqual('number: 15 letter: a');
        cella('b'); cell2(4);
        expect(cellf2()).toEqual('number: 17 letter: b');
    });

    it("registers batch function cell deps", function() {
        var celli = Dive.cell(1),
            cellx = Dive.cell(10),
            cellc = Dive.cell(100),
            spy = jasmine.createSpy(),
            cellf = Dive.cellf('batch', function() {
                spy();
                return celli() + cellx() + cellc();
            });

        expect(spy.callCount).toEqual(1);
        expect(cellf()).toEqual(111);
        celli(2); cellx(20); cellc(200);
        setTimeout(function() {
            expect(spy.callCount).toEqual(2);
            celli(3);
            setTimeout(function() { expect(spy.callCount).toEqual(2); });
        });
    });
});
