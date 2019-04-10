import {generateKey, isIOs} from './Utils';
import { consoleLogTagged } from './Logger';
import {notifyOnPlayed, notifyOnPaused, notifyOnStopped, notifyOnFinished, notifyOnPrepared, notifyOnCanplay, notifyOnError, notifyOnFullScreen, notifyOnNormalScreen} from "../lib/VideoCallback"

const TAG = "VideoPlayer";

const logMessage = consoleLogTagged(`VM5AdSDK:${TAG}`);

class VideoPlayer {
    constructor(videoPlayer) {
        this.STATE = {
            INIT: 0,
            PREPARED: 1,
            DONE: 2,
            properties: {
                0: {'name': 'INIT'},
                1: {'name': 'PREPARED'},
                2: {'name': 'DONE'}
            }
        };

        this.mIOs = isIOs();

        this.mVideoPlayer = videoPlayer;
        if (!this.mVideoPlayer.id) {
            this.mVideoPlayer.id = "__player_" + generateKey() + "__";
        }

        this.mListeners = [];
        this.mVideoUrl = null;
        this.mVideoType = null;
        this.mIsMuted = this.mVideoPlayer.muted;
        this.mIsControls = this.mVideoPlayer.controls;
        this.mIsLoop = false;
        this.mSeekToPosition = -1;
        this.mIsFullScreen = false;
        this.mIsPlaying = false;
        this.mIsFinished = false;

        this.mIsEnabledUserSeeking = false;
        this.mForcedSeeking = -1;
        this.mSupposedCurrentTime = 0;

        this.mCurrentState = this.STATE.INIT;
    }

    setDataSource(videoUrl, videoType) {
        this.mVideoUrl = videoUrl;
        this.mVideoType = videoType;

        var videoPlayer = this.mVideoPlayer;
        while (videoPlayer.firstChild) {
            videoPlayer.removeChild(videoPlayer.firstChild);
        }

        //https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
        this.mVideoPlayer.addEventListener('canplay', () => {
            logMessage('video can play');
            notifyOnCanplay(this);
        });

        this.mVideoPlayer.addEventListener('loadedmetadata', () => {
            logMessage('video loaded meta data');
            this.mCurrentState = this.STATE.PREPARED;
            if (this.mSeekToPosition != -1) {
                this.seekTo(this.mSeekToPosition);
                this.mSeekToPosition = -1;
            }
            if (this.mVideoPlayer.autoplay) {
                this.play();
            }
            notifyOnPrepared(this);
        });

        this.mVideoPlayer.addEventListener('play', () => {
            logMessage('video played');
            this.mIsPlaying = true;
            this.mIsFinished = false;
            notifyOnPlayed(this);
        });

        this.mVideoPlayer.addEventListener('pause', () => {
            logMessage('video paused');
            this.mIsPlaying = false;
            notifyOnPaused(this);
        });

        this.mVideoPlayer.addEventListener('ended', () => {
            logMessage('video ended');
            this.mIsFinished = true;
            notifyOnFinished(this);
            if (this.mIsLoop) {
                this.play();
            }
        });

        this.mVideoPlayer.addEventListener('error', (event) => {
            logMessage('video error');
            this.mIsPlaying = false;
            notifyOnError(this);
        });

        this.mVideoPlayer.addEventListener('timeupdate', () => {
            if (!this.mVideoPlayer.seeking) {
                this.mSupposedCurrentTime = this.mVideoPlayer.currentTime;
            }
        });

        this.mVideoPlayer.addEventListener('seeking', () => {
            if (this.mForcedSeeking != -1 && this.mForcedSeeking == this.mVideoPlayer.currentTime) {
                this.mForcedSeeking = -1;
                return;
            }

            let delta = this.mVideoPlayer.currentTime - this.mSupposedCurrentTime;
            if (!this.mIsEnabledUserSeeking && Math.abs(delta) > 0.01) {
                logMessage("Seeking video is disabled!");
                this.mVideoPlayer.currentTime = this.mSupposedCurrentTime;
            }
        });

        this.mVideoPlayer.addEventListener('ended', () => {
            // reset state in order to allow for rewind
            this.mSupposedCurrentTime = 0;
        });

        var fullscreenListener = (e) => {
            const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            if (fullscreenElement) {
                this.mIsFullScreen = true;

                notifyOnFullScreen(this);
            } else {
                this.pause();
                this.exitFullScreen();
                this.mIsFullScreen = false;

                notifyOnNormalScreen(this);
            }
        }

        document.addEventListener('fullscreenListener', fullscreenListener, false);
        document.addEventListener('mozfullscreenchange', fullscreenListener, false);
        document.addEventListener('webkitfullscreenchange', fullscreenListener, false);
        document.addEventListener('MSFullscreenChange', fullscreenListener, false);

        if (this.mIOs) {
            this.mVideoPlayer.addEventListener('webkitbeginfullscreen', (e) => {
                this.mIsFullScreen = true;
                notifyOnFullScreen(this);
            });
            this.mVideoPlayer.addEventListener('webkitendfullscreen', (e) => {
                this.pause();
                this.exitFullScreen();
                this.mIsFullScreen = false;
                notifyOnNormalScreen(this);
            });
        }

        var sourceNode = document.createElement("source");
        sourceNode.src = videoUrl;
        sourceNode.type = videoType;
        this.mVideoPlayer.appendChild(sourceNode);

        return true;
    }

    setListener(listener) {
        this.mListeners.push(listener);
    }

    getDuration() {
        if (this.mCurrentState != this.STATE.PREPARED) return 0;

        return Math.round(this.mVideoPlayer.duration * 1000);
    }

    getCurrentPosition() {
        if (this.mCurrentState != this.STATE.PREPARED) return 0;
        if (this.mVideoPlayer.seeking) return 0;

        return Math.round(this.mVideoPlayer.currentTime * 1000);
    }

    getCurrentPercentage() {
        if (this.mCurrentState != this.STATE.PREPARED) return 0;
        if (this.mVideoPlayer.seeking) return 0;

        return Math.round(this.mVideoPlayer.currentTime) / Math.round(this.mVideoPlayer.duration);
    }

    seekTo(position) {
        position /= 1000;
        if (this.mCurrentState != this.STATE.PREPARED) {
            this.mSeekToPosition = position;
        } else {
            if (position > this.mVideoPlayer.duration) {
                this.mVideoPlayer.currentTime = this.mVideoPlayer.duration;
            } else if (position < 0) {
                this.mVideoPlayer.currentTime = 0;
            } else {
                this.mVideoPlayer.currentTime = position;
            }
            this.mForcedSeeking = this.mVideoPlayer.currentTime;
        }
    }

    isEnabledUserSeeking() {
        return this.mIsEnabledUserSeeking;
    }

    setEnabledUserSeeking(isEnabledUserSeeking) {
        this.mIsEnabledUserSeeking = isEnabledUserSeeking;
    }

    setLoop(isLoop) {
        this.mIsLoop = isLoop;
    }

    isLoop() {
        return this.mIsLoop;
    }

    isPlaying() {
        return this.mIsPlaying;
    }

    isPrepared() {
        return this.mCurrentState == this.STATE.PREPARED;
    }

    isFinished() {
        return this.mIsFinished;
    }

    play() {
        if (this.mCurrentState != this.STATE.PREPARED) return false;
        if (this.mIsPlaying) return false;

        // NOTE This is for:
        // Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22
        this.mPlayPromise = this.mPlayPromise ? this.mPlayPromise : Promise.resolve();
        this.mPlayPromise = this.mPlayPromise.then(() => this.mVideoPlayer.play());

        this.mIsPlaying = true;
        this.mIsFinished = false;
        return true;
    }

    stop() {
        if (this.mCurrentState != this.STATE.PREPARED) return false;

        this.pause();

        this.mVideoPlayer.currentTime = 0;

        this.mIsPlaying = false;
        return true;
    }

    pause() {
        if (this.mCurrentState != this.STATE.PREPARED) return false;
        if (!this.mIsPlaying) return false;

        // NOTE This is for:
        // Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22
        if (this.mPlayPromise) {
          this.mPlayPromise.then(()=>this.mVideoPlayer.pause());
        }

        this.mIsPlaying = false;
        return true;
    }

    isMuted() {
        return this.mIsMuted;
    }

    mute() {
        this.mIsMuted = true;
        this.mVideoPlayer.muted = true;
        this.mVideoPlayer.setAttribute("muted", "muted")
        return true;
    }

    unmute() {
        this.mIsMuted = false;
        this.mVideoPlayer.muted = "";
        this.mVideoPlayer.removeAttribute("muted");
        return true;
    }

    isControls() {
        return this.mIsControls;
    }

    setControls(isControls) {
        this.mVideoPlayer.controls = isControls;
        if (isControls) {
            this.mVideoPlayer.setAttribute("controls", "controls");
        } else {
            this.mVideoPlayer.removeAttribute("controls");
        }
    }

    getVolume() {
        return this.mVideoPlayer.volume;
    }

    setVolume(volume) {
        volume = (volume < 0.0) ? 0.0 : volume;
        volume = (volume > 1.0) ? 1.0 : volume;
        this.mVideoPlayer.volume = volume;
        return true;
    }

    isAutoPlay() {
        return this.mVideoPlayer.autoplay;
    }

    setAutoPlay(autoPlay) {
        this.mVideoPlayer.autoplay = autoPlay;
        if (autoPlay) {
            this.mVideoPlayer.setAttribute("autoplay", "autoplay");
        } else {
            this.mVideoPlayer.removeAttribute("autoplay");
        }
    }

    getWidth() {
        return this.mVideoPlayer.width;
    }

    setWidth(width) {
        this.mVideoPlayer.width = width;
    }

    getHeight() {
        return this.mVideoPlayer.height;
    }

    setHeight(height) {
        this.mVideoPlayer.height = height;
    }

    getPreload() {
        return this.mVideoPlayer.preload;
    }

    setPreload(preload) { // <video preload="auto|metadata|none">
        this.mVideoPlayer.preload = preload;
    }

    getDomNode() {
        return this.mVideoPlayer;
    }

    getVideoUrl() {
        return this.mVideoUrl;
    }

    getVideoType() {
        return this.mVideoType;
    }

    isFullScreen() {
        return this.mIsFullScreen;
    }

    isFullScreenAvailable() {
      const isFullScreenEnabledInAllIFrame = () => {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled;
      }
      const isInABrowserThatDoesNotRespectAllowfullscreenAttribute = () => this.mIOs
      return isFullScreenEnabledInAllIFrame() || isInABrowserThatDoesNotRespectAllowfullscreenAttribute();
    }

    enterFullScreen() {
        if (this.mIsFullScreen) return false;

        if (this.mVideoPlayer.requestFullscreen) {
            this.mVideoPlayer.requestFullscreen();
        } else if (this.mVideoPlayer.webkitRequestFullscreen) {
            this.mVideoPlayer.webkitRequestFullscreen();
        } else if (this.mVideoPlayer.mozRequestFullScreen) {
            this.mVideoPlayer.mozRequestFullScreen();
        } else if (this.mVideoPlayer.msRequestFullscreen) {
            this.mVideoPlayer.msRequestFullscreen();
        } else if (this.mVideoPlayer.webkitEnterFullScreen){
            this.mVideoPlayer.webkitEnterFullScreen();
        } else {
            return false;
        }

        this.mIsFullScreen = true;
        return true;
    }

    exitFullScreen() {
        if (!this.mIsFullScreen) return false;

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else {
            return false;
        }

        this.mIsFullScreen = false;
        return true;
    }

    clean() {
        this.mVideoPlayer.removeEventListener('canplay');
        this.mVideoPlayer.removeEventListener('loadedmetadata');
        this.mVideoPlayer.removeEventListener('play');
        this.mVideoPlayer.removeEventListener('pause');
        this.mVideoPlayer.removeEventListener('ended');
        this.mVideoPlayer.removeEventListener('error');

        document.removeEventListener('fullscreenchange');
        document.removeEventListener('mozfullscreenchange');
        document.removeEventListener('webkitfullscreenchange');
        document.removeEventListener('MSFullscreenChange');

        if (this.mIOs) {
            this.mVideoPlayer.removeEventListener('webkitbeginfullscreen');
            this.mVideoPlayer.removeEventListener('webkitendfullscreen');
        }

        this.mVideoUrl = null;
        this.mVideoType = null;
        this.mIsMuted = this.mVideoPlayer.muted;
        this.mIsControls = this.mVideoPlayer.controls;
        this.mIsLoop = false;
        this.mSeekToPosition = -1;

        this.mCurrentState = this.STATE.INIT;
    }
}

export default VideoPlayer;
