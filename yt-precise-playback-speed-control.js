// ==UserScript==
// @name         YouTube – precyzyjna zmiana prędkości
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Zmienia tempo o 0.05x przez natywne API YouTube (Shift+>/<) i pokazuje subtelny wskaźnik prędkości na ekranie w stylu YT.
// @author       Wielki Imperator
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STEP = 0.05;
    const MIN = 0.05;
    const MAX = 16;

    function getPlayer() {
        return (
            window.ytPlayer?.app?.getCurrentPlayer?.() ||
            document.querySelector('#movie_player')
        );
    }

    function isTyping() {
        const el = document.activeElement;
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    }

    function adjustPlayback(delta) {
        const player = getPlayer();
        if (!player) return;

        const current =
            typeof player.getPlaybackRate === 'function'
                ? player.getPlaybackRate()
                : player.playbackRate || 1;

        let newRate = Math.min(Math.max(current + delta, MIN), MAX);
        newRate = Math.round(newRate * 100) / 100;

        if (typeof player.setPlaybackRate === 'function') {
            player.setPlaybackRate(newRate);
        } else {
            player.playbackRate = newRate;
        }

        showRateIndicator(newRate);
    }

    // Tworzymy wskaźnik wideo w rogu odtwarzacza
    let indicator;
    function createIndicator() {
        indicator = document.createElement('div');
        Object.assign(indicator.style, {
            position: 'absolute',
            bottom: '12%',
            right: '3%',
            background: 'rgba(0, 0, 0, 0.65)',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: '8px',
            zIndex: '999999',
            opacity: '0',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
        });
        document.body.appendChild(indicator);
    }

    function showRateIndicator(rate) {
        if (!indicator) createIndicator();

        const player = document.querySelector('.html5-video-player');
        if (!player) return;

        // Umieszczamy wskaźnik nad playerem (nie nad całym body)
        player.appendChild(indicator);
        indicator.textContent = rate.toFixed(2) + '×';
        indicator.style.opacity = '1';

        clearTimeout(indicator._hide);
        indicator._hide = setTimeout(() => {
            indicator.style.opacity = '0';
        }, 1000);
    }

    function handler(e) {
        if (isTyping()) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const isInc = e.shiftKey && (e.code === 'Period' || e.key === '>' || e.key === '.');
        const isDec = e.shiftKey && (e.code === 'Comma' || e.key === '<' || e.key === ',');

        if (!isInc && !isDec) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        adjustPlayback(isInc ? STEP : -STEP);
    }

    window.addEventListener('keydown', handler, true);

    console.log('✅ YouTube – precyzyjna zmiana prędkości (0.05x) aktywna');
})();
