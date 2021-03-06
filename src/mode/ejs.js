/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */


define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var HtmlHighlightRules = require("./HtmlHighlightRules").HtmlHighlightRules;
var JavaScriptHighlightRules = require("./JavaScriptHighlightRules").JavaScriptHighlightRules;

var EjsHighlightRules = function(start, end) {
    var newThis = new HtmlHighlightRules();
    EjsHighlightRules_OldConstructor.call(newThis, start, end);
    return newThis;
};
function EjsHighlightRules_OldConstructor(start, end) {
    if (!start)
        start = "(?:<%|<\\?|{{)";
    if (!end)
        end = "(?:%>|\\?>|}})";

    for (var i in this.$rules) {
        this.$rules[i].unshift({
            token : "markup.list.meta.tag",
            regex : start + "(?![>}])[-=]?",
            push  : "ejs-start"
        });
    }
    
    this.embedRules(JavaScriptHighlightRules, "ejs-");
    
    this.$rules["ejs-start"].unshift({
        token : "markup.list.meta.tag",
        regex : "-?" + end,
        next  : "pop"
    }, {
        token: "comment",
        regex: "//.*?" + end,
        next: "pop"
    });

    this.$rules["ejs-no_regex"].unshift({
        token : "markup.list.meta.tag",
        regex : "-?" + end,
        next  : "pop"
    }, {
        token: "comment",
        regex: "//.*?" + end,
        next: "pop"
    });
    
    this.normalizeRules();
};


oop.inherits(EjsHighlightRules, HtmlHighlightRules);

exports.EjsHighlightRules = EjsHighlightRules;


var oop = require("../lib/oop");
var HtmlMode = require("./HtmlMode").Mode;
var JavaScriptMode = require("./JavaScriptMode").Mode;
var CssMode = require("./CssMode").Mode;

var Mode = function() {
    var newThis = new HtmlMode();
    newThis.HighlightRules = EjsHighlightRules;    
    newThis.createModeDelegates({
        "js-": JavaScriptMode,
        "css-": CssMode,
        "ejs-": JavaScriptMode
    });
    return newThis;
};
oop.inherits(Mode, HtmlMode);

(function() {

    this.$id = "ace/mode/ejs";
}).call(Mode.prototype);

exports.Mode = Mode;
});