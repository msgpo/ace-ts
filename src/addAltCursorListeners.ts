/**
 * Copyright (c) 2010, Ajax.org B.V.
 * Copyright (c) 2015-2018, David Holmes
 * Licensed under the 3-Clause BSD license. See the LICENSE file for details.
 */
import { Editor } from './Editor';
import { addListener } from "./lib/event";

export function addAltCursorListeners(this: void, editor: Editor) {
    const el: HTMLTextAreaElement = editor.textInput.getElement();
    let altCursor = false;
    addListener(el, "keydown", function (e: KeyboardEvent) {
        const altDown = (e.keyCode === 18) && !(e.ctrlKey || e.shiftKey || e.metaKey);
        if (editor.$blockSelectEnabled && altDown) {
            if (!altCursor) {
                editor.renderer.setMouseCursor("crosshair");
                altCursor = true;
            }
        }
        else if (altCursor) {
            reset();
        }
    });

    addListener(el, "keyup", reset);
    addListener(el, "blur", reset);
    function reset() {
        if (altCursor) {
            editor.renderer.setMouseCursor("");
            altCursor = false;
            // TODO disable menu poping up
            // e && e.preventDefault()
        }
    }
}

