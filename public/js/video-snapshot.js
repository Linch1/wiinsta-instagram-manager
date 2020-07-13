"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var VideoSnapshot = (function () {
    function VideoSnapshot(blob) {
        var _this = this;
        this.loadVideo = function (time) {
            if (time === void 0) { time = 0; }
            return new Promise(function (resolve) {
                var video = document.createElement('video');
                video.preload = 'metadata';
                video.src = _this.videoUrl;
                video.muted = true;
                if (time === 0) {
                    video.play();
                }
                else {
                    if (typeof time === 'number') {
                        video.currentTime = time;
                    }
                    else if (typeof time === 'string') {
                        var duration = video.duration;
                        video.currentTime = _this.getSmartTime(time, duration);
                    }
                    if (isSafari) {
                        video.play();
                    }
                }
                video.addEventListener('timeupdate', function timeupdateHandler() {
                    video.removeEventListener('timeupdate', timeupdateHandler);
                    video.pause();
                    resolve(video);
                });
            });
        };
        this.getDimensions = function () { return __awaiter(_this, void 0, void 0, function () {
            var video;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.loadVideo()];
                    case 1:
                        video = _a.sent();
                        return [2, {
                                width: video.videoWidth,
                                height: video.videoHeight
                            }];
                }
            });
        }); };
        var url = blob;
        this.videoUrl = url;
    }
    VideoSnapshot.prototype.takeSnapshot = function (time) {
        return __awaiter(this, void 0, void 0, function () {
            var video, canvas, context, dataURL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.loadVideo(time)];
                    case 1:
                        video = _a.sent();
                        canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        context = canvas.getContext('2d');
                        if (!context) {
                            throw new Error('error creating canvas context');
                        }
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        dataURL = canvas.toDataURL('image/jpeg', 1.0);
                        return [2, dataURL];
                }
            });
        });
    };
    VideoSnapshot.prototype.end = function () {
        this.revoke();
    };
    VideoSnapshot.prototype.revoke = function () {
        URL.revokeObjectURL(this.videoUrl);
    };
    VideoSnapshot.prototype.getSmartTime = function (time, duration) {
        if (duration === void 0) { duration = 0; }
        var smartTimes = {
            start: 0,
            middle: duration / 2,
            end: duration,
        };
        return smartTimes[time];
    };
    return VideoSnapshot;
}());
