define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var JavaScriptMode = require("./JavaScriptMode").Mode;
var ScalaHighlightRules = require("./scala_highlight_rules").ScalaHighlightRules;

var Mode = function() {
    var newThis = new JavaScriptMode();
    newThis.HighlightRules = ScalaHighlightRules;
    return newThis;
};
oop.inherits(Mode, JavaScriptMode);

(function() {

    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/scala";
}).call(Mode.prototype);

exports.Mode = Mode;
});
