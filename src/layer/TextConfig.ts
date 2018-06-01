/**
 * Copyright (c) 2010, Ajax.org B.V.
 * Copyright (c) 2015-2018, David Holmes
 * Licensed under the 3-Clause BSD license. See the LICENSE file for details.
 */
import { LayerConfig } from "./LayerConfig";

export interface TextConfig extends LayerConfig {

    firstRow: number;

    lastRow: number;

    characterWidth: number;
}

