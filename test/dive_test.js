describe('Dive', function () {
    var theSkyIsBlue = true;
    var hellFreezesOver = false;

    it("renders simple elements", function() {
        expect(Dive.b().outerHTML).toEqual("<b></b>");
        expect(Dive.b(null).outerHTML).toEqual("<b></b>");
        expect(Dive.b(undefined).outerHTML).toEqual("<b></b>");
        expect(Dive.b("a").outerHTML).toEqual("<b>a</b>");
        expect(Dive.b({}, "a").outerHTML).toEqual("<b>a</b>");
        expect(Dive.b({ when: hellFreezesOver }, "a")).toEqual(null);
        expect(Dive.b({ when: undefined }, "a")).toEqual(null);
        expect(Dive.b({ when: theSkyIsBlue }, "a").outerHTML).toEqual("<b>a</b>");
    });
    
    it("weeds out null elements", function() {
        expect(Dive.div(
            Dive.span({ when: hellFreezesOver }, "a")
        ).outerHTML).toEqual("<div></div>");
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
            Dive.mapSome(Dive.b, [1, null, 2])
        ).outerHTML).toEqual("<div><b>1</b><b>2</b></div>");
        
        expect(Dive.span(Dive.map(Dive.b, [1, 2]))
               .outerHTML).toEqual("<span><b>1</b><b>2</b></span>");
    });
    
    it("partially applies a map (or filter, take) if given one argument", function() {
        var mapToI = Dive.map(function(i) { return Dive.b({ when: i }, i); });
        expect(Dive.div(
            mapToI([1, null, 2])
        ).outerHTML).toEqual("<div><b>1</b><b>2</b></div>");
    });
    
    it("threads values through transformations", function() {
        expect(Dive.div(
            Dive.thread([0, 'a', 1, 'b', null],
                        Dive.mapSome(function(c) { return c + c; }),
                        Dive.take(3),
                        Dive.filter(Dive.identity),
                        Dive.map(function(c) { return Dive.span('a' + c); })
        )).outerHTML).toEqual("<div><span>aaa</span><span>a2</span></div>");
    });
});
