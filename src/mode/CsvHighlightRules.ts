/**
 * Copyright (c) 2010, Ajax.org B.V.
 * Copyright (c) 2015-2018, David Holmes
 * Licensed under the 3-Clause BSD license. See the LICENSE file for details.
 */
import { TextHighlightRules } from "./TextHighlightRules";

/**
 *
 */
export class CsvHighlightRules extends TextHighlightRules {
    /**
     *
     */
    constructor() {
        super();
        // regexp must not have capturing parentheses. Use (?:) instead.
        // regexps are ordered -> the first match is used
        this.$rules = {
            "start": [
                {
                    token: "variable", // single line
                    regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'
                },
                {
                    token: "string", // single line
                    regex: '"',
                    next: "string"
                },
                {
                    token: "constant.numeric", // hex
                    regex: "0[xX][0-9a-fA-F]+\\b"
                },
                {
                    token: "constant.numeric", // float
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                },
                {
                    token: "constant.language.boolean",
                    regex: "(?:true|false)\\b"
                },
                {
                    token: "text", // single quoted strings are not allowed
                    regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
                },
                {
                    token: "comment", // comments are not allowed, but who cares?
                    regex: "\\/\\/.*$"
                },
                {
                    token: "comment.start", // comments are not allowed, but who cares?
                    regex: "\\/\\*",
                    next: "comment"
                },
                {
                    token: "paren.lparen",
                    regex: "[[({]"
                },
                {
                    token: "paren.rparen",
                    regex: "[\\])}]"
                },
                {
                    token: "text",
                    regex: "\\s+"
                }
            ],
            "string": [
                {
                    token: "constant.language.escape",
                    regex: /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/
                },
                {
                    token: "string",
                    regex: '"|$',
                    next: "start"
                },
                {
                    defaultToken: "string"
                }
            ],
            "comment": [
                {
                    token: "comment.end", // comments are not allowed, but who cares?
                    regex: "\\*\\/",
                    next: "start"
                },
                {
                    defaultToken: "comment"
                }
            ]
        };
    }
}

