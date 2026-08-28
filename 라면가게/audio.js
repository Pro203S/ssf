// ==================
//
// audio.js - 오디오 관련 라이브러리
// 2026/07/10
// Created by 문태영
//
// ==================

const DEFAULT_VOLUME = 0.75;
const AUDIO_ELEMENT_COUNT = 10;
const USER_GESTURE_EVENTS = ["pointerdown", "mousedown", "click", "keydown", "touchstart"];

function playWithUserGesture(audio) {
    return audio.play().catch(error => {
        if (error.name !== "NotAllowedError") {
            throw error;
        }

        return new Promise((resolve, reject) => {
            const retry = () => {
                USER_GESTURE_EVENTS.forEach(eventName => {
                    document.removeEventListener(eventName, retry);
                });

                playWithUserGesture(audio).then(resolve).catch(reject);
            };

            USER_GESTURE_EVENTS.forEach(eventName => {
                document.addEventListener(eventName, retry);
            });
        });
    });
}

class AudioPlayer {
    _src = "";
    _loop = false;
    _duration = 0;
    _playbackRate = 1;

    /** @type {HTMLAudioElement[]} */
    _audios = [];

    /** @type {number} */
    _interval = -1;

    /** @type {number} */
    _audioIndex = 0;

    /** @type {boolean} */
    _playing = false;

    /**
     * AudioPlayer의 새 인스턴스를 생성합니다.
     * 
     * @param {string} src 오디오 소스
     * @param {boolean} [loop = false] 반복 여부
     * @param {number} [duration = 0] 반복 길이
     * @param {number} [playbackRate = 1] 재생 속도
     */
    constructor(
        src,
        loop = false,
        duration = 0,
        playbackRate = 1
    ) {
        this._src = src;
        this._loop = loop;
        this._duration = duration;
        this._playbackRate = playbackRate;
    }

    /**
     * 오디오 파일을 로드합니다.
     */
    load() {
        return new Promise((resolve, reject) => {
            const audios = Array.from({ length: AUDIO_ELEMENT_COUNT }, () => document.createElement("audio"));

            audios.forEach(audio => {
                audio.volume = DEFAULT_VOLUME;
                audio.playbackRate = this._playbackRate;
                audio.src = this._src;
            });

            const first = audios[0];
            first.addEventListener("canplay", () => {
                this._audios = audios;
                resolve();
            }, { once: true });
            first.addEventListener("error", () => {
                reject(new Error(`오디오를 불러올 수 없습니다: ${this._src}`));
            }, { once: true });
        });
    }

    /**
     * 오디오를 재생합니다.
     */
    async play() {
        if (!this._loop) {
            const audio = this._audios[this._audioIndex];
            this._audioIndex = (this._audioIndex + 1) % this._audios.length;
            audio.currentTime = 0;
            return await audio.play();
        };

        if (this._playing) return;

        if (!this._duration || this._duration <= 0) throw new Error("duration이 없거나 0보다 작습니다.");

        this._playing = true;

        const switchTime = Math.max(0, (this._duration - 0.06) * 1000);
        let currentIndex = 0;
        let nextIndex = 1;

        const playNext = async () => {
            const audio = this._audios[nextIndex];
            currentIndex = nextIndex;
            nextIndex = (nextIndex + 1) % this._audios.length;

            audio.currentTime = 0;
            await playWithUserGesture(audio);
            this._interval = setTimeout(playNext, switchTime);
        };

        await playWithUserGesture(this._audios[currentIndex]);
        this._interval = setTimeout(playNext, switchTime);
    }

    /**
     * 오디오를 멈춥니다.
     */
    stop() {
        this._playing = false;
        this._audios.forEach(v => v.pause());
        clearTimeout(this._interval);
    }
}
