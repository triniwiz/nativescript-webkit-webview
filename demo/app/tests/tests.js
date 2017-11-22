var Webkit = require("nativescript-webkit").Webkit;
var webkit = new Webkit();

describe("greet function", function() {
    it("exists", function() {
        expect(webkit.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(webkit.greet()).toEqual("Hello, NS");
    });
});