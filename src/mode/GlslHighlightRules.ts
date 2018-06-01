/**
 * Copyright (c) 2010, Ajax.org B.V.
 * Copyright (c) 2015-2018, David Holmes
 * Licensed under the 3-Clause BSD license. See the LICENSE file for details.
 */
import { CppHighlightRules } from './CppHighlightRules';

const keywords = (
    "attribute|const|uniform|varying|break|continue|do|for|while|" +
    "if|else|in|out|inout|float|int|void|bool|true|false|" +
    "lowp|mediump|highp|precision|invariant|discard|return|mat2|mat3|" +
    "mat4|vec2|vec3|vec4|ivec2|ivec3|ivec4|bvec2|bvec3|bvec4|sampler2D|" +
    "samplerCube|struct"
);

const buildinConstants = (
    "radians|degrees|sin|cos|tan|asin|acos|atan|pow|" +
    "exp|log|exp2|log2|sqrt|inversesqrt|abs|sign|floor|ceil|fract|mod|" +
    "min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|" +
    "normalize|faceforward|reflect|refract|matrixCompMult|lessThan|" +
    "lessThanEqual|greaterThan|greaterThanEqual|equal|notEqual|any|all|" +
    "not|dFdx|dFdy|fwidth|texture2D|texture2DProj|texture2DLod|" +
    "texture2DProjLod|textureCube|textureCubeLod|" +
    "gl_MaxVertexAttribs|gl_MaxVertexUniformVectors|gl_MaxVaryingVectors|" +
    "gl_MaxVertexTextureImageUnits|gl_MaxCombinedTextureImageUnits|" +
    "gl_MaxTextureImageUnits|gl_MaxFragmentUniformVectors|gl_MaxDrawBuffers|" +
    "gl_DepthRangeParameters|gl_DepthRange|" +
    // The following two are only for MIME x-shader/x-vertex.
    "gl_Position|gl_PointSize|" +
    // The following five are only for MIME x-shader/x-fragment.
    "gl_FragCoord|gl_FrontFacing|gl_PointCoord|gl_FragColor|gl_FragData"
);

export class GlslHighlightRules extends CppHighlightRules {
    constructor() {
        super();

        const keywordMapper = this.createKeywordMapper({
            "variable.language": "this",
            "keyword": keywords,
            "constant.language": buildinConstants
        }, "identifier");

        this.$rules = new CppHighlightRules().$rules;
        this.$rules['start'].forEach(function (rule) {
            if (typeof rule.token === "function")
                rule.token = keywordMapper;
        });
    }
}

