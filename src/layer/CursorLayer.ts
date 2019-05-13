/**
 * Copyright (c) 2010, Ajax.org B.V.
 * Copyright (c) 2015-2018, David Holmes
 * Licensed under the 3-Clause BSD license. See the LICENSE file for details.
 */
import { addCssClass, createElement, removeCssClass, setCssClass } from "../lib/dom";
import { AbstractLayer } from './AbstractLayer';
import { LayerConfig } from './LayerConfig';
import { Disposable } from '../Disposable';
import { EditSession } from '../EditSession';
import { PixelPosition } from '../PixelPosition';
import { Position } from '../Position';
import { Interval } from '../Interval';

const PIXEL_POSITION_ZERO = { left: 0, top: 0 };

/**
 * This class is the HTML representation of the CursorLayer.
 */
export class CursorLayer extends AbstractLayer implements Disposable {
    private _session: EditSession;
    private _isCursorVisible = false;
    private _isBlinking = true;
    private _blinkInterval = 1000;
    private _smoothBlinking = false;
    private readonly _blinker = new Interval();
    private _timeoutId: number;
    private _cursors: HTMLDivElement[] = [];
    private _isOverwriteCursor: boolean;
    private _updateCursors: (opacity: boolean) => void;
    private _config: LayerConfig;
    $pixelPos: PixelPosition;

    constructor(parent: HTMLElement) {
        super(parent, "ace_layer ace_cursor-layer");
        addCssClass(this.element, "ace_hidden-cursors");
        this._updateCursors = (opacity: boolean) => this._updateOpacity(opacity);
    }

    dispose(): void {
        this._blinker.release();
        clearTimeout(this._timeoutId);
        super.dispose();
    }

    private _updateVisibility(visible: boolean): void {
        const cursors = this._cursors;
        for (let i = cursors.length; i--;) {
            cursors[i].style.visibility = visible ? "" : "hidden";
        }
    }

    private _updateOpacity(opacity: boolean): void {
        const cursors = this._cursors;
        for (let i = cursors.length; i--;) {
            cursors[i].style.opacity = opacity ? "" : "0";
        }
    }

    setSession(session: EditSession): void {
        this._session = session;
    }

    setBlinking(blinking: boolean): void {
        if (blinking !== this._isBlinking) {
            this._isBlinking = blinking;
            this.restartTimer();
        }
    }

    setBlinkInterval(blinkInterval: number): void {
        if (blinkInterval !== this._blinkInterval) {
            this._blinkInterval = blinkInterval;
            this.restartTimer();
        }
    }

    setSmoothBlinking(smoothBlinking: boolean): void {
        if (smoothBlinking !== this._smoothBlinking) {
            this._smoothBlinking = smoothBlinking;
            setCssClass(this.element, "ace_smooth-blinking", smoothBlinking);
            this._updateCursors(true);
            // TODO: Differs from ACE...
            this._updateCursors = (smoothBlinking ? this._updateOpacity : this._updateVisibility).bind(this);
            this.restartTimer();
        }
    }

    private _addCursor(): HTMLDivElement {
        const cursor: HTMLDivElement = <HTMLDivElement>createElement("div");
        cursor.className = "ace_cursor";
        this.element.appendChild(cursor);
        this._cursors.push(cursor);
        return cursor;
    }

    private _removeCursor(): HTMLDivElement {
        if (this._cursors.length > 1) {
            const cursor = <HTMLDivElement>this._cursors.pop();
            (<Node>cursor.parentNode).removeChild(cursor);
            return cursor;
        }
        return undefined;
    }

    hideCursor(): void {
        this._isCursorVisible = false;
        addCssClass(this.element, "ace_hidden-cursors");
        this.restartTimer();
    }

    showCursor(): void {
        this._isCursorVisible = true;
        removeCssClass(this.element, "ace_hidden-cursors");
        this.restartTimer();
    }

    restartTimer(): void {
        const update = this._updateCursors;

        this._blinker.off();

        clearTimeout(this._timeoutId);
        if (this._smoothBlinking) {
            removeCssClass(this.element, "ace_smooth-blinking");
        }

        update(true);

        if (!this._isBlinking || !this._blinkInterval || !this._isCursorVisible) {
            return;
        }
        
        if (this._smoothBlinking) {
            setTimeout(() => {
                addCssClass(this.element, "ace_smooth-blinking");
            });
        }

        const blink = () => {
            this._timeoutId = window.setTimeout(() => {
                update(false);
            }, 0.6 * this._blinkInterval);
        };

        this._blinker.on(function () { update(true); blink(); }, this._blinkInterval);

        blink();
    }

    /**
     * Computes the pixel position relative to the top-left corner of the cursor layer.
     * If the position is not supplied, the cursor position of the selection is used.
     * The number of rows is multiplied by the line height.
     * The number of columns is multiplied by the character width.
     * The padding is added to the left property only.
     */
    getPixelPosition(position: Position | null, onScreen=false): PixelPosition {
        if ( ! this._config) {
            // This happens because of the gotoLine(0, 0) call that is made
            // in the editor component. Maybe that call is a bit too eager.
            // console.warn("getPixelPosition called without a config");
            return PIXEL_POSITION_ZERO;
        }

        if ( ! this._session) {
            console.warn("getPixelPosition called without a session");
            return PIXEL_POSITION_ZERO;
        }

        const firstRow = onScreen ? this._config.firstRowScreen : 0;

        if ( ! position) {
            const selection = this._session.getSelection();
            if (selection) {
                position = selection.getCursor();
                return this._getPixelPositionForRow(position, firstRow);
            } else {
                console.warn("getPixelPosition called without a selection");
                return PIXEL_POSITION_ZERO;
            }
        } else {
            return this._getPixelPositionForRow(position, firstRow);
        }
    }

    private _getPixelPositionForRow(position: Position, firstRow: number): PixelPosition {
        const pos = this._session.documentPositionToScreenPosition(position.row, position.column);
        const cursorLeft = pos.column * this._config.charWidthPx;
        const cursorTop = (pos.row - firstRow) * this._config.charHeightPx;

        return { left: cursorLeft, top: cursorTop };
    }

    update(config: LayerConfig): void {
        this._config = config;

        // Selection markers is a concept from multi selection.
        let selections: { cursor: Position | null }[] = this._session.$selectionMarkers;

        let cursorIndex = 0;

        if (selections === undefined || selections.length === 0) {
            selections = [{ cursor: null }];
        }

        let pixelPos: PixelPosition = { left: 0, top: 0 };

        const n = selections.length;
        for (let i = 0; i < n; i++) {
            pixelPos = this.getPixelPosition(selections[i].cursor, true);

            if ((pixelPos.top > config.docHeightPx + config.verticalOffsetPx ||
                pixelPos.top < 0) && i > 1) {
                continue;
            }

            const style = (this._cursors[cursorIndex++] || this._addCursor()).style;

            style.left = pixelPos.left + "px";
            style.top = pixelPos.top + "px";
            style.width = config.charWidthPx + "px";
            style.height = config.charHeightPx + "px";
        }

        while (this._cursors.length > cursorIndex) {
            this._removeCursor();
        }

        const overwrite = this._session.getOverwrite();
        this._setOverwrite(overwrite);

        // cache for textarea and gutter highlight
        this.$pixelPos = pixelPos;
        this.restartTimer();
    }

    private _setOverwrite(overwrite: boolean): void {
        if (overwrite !== this._isOverwriteCursor) {
            this._isOverwriteCursor = overwrite;
            if (overwrite) {
                addCssClass(this.element, "ace_overwrite-cursors");
            } else {
                removeCssClass(this.element, "ace_overwrite-cursors");
            }
        }
    }
}
