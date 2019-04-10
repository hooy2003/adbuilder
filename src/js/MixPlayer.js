import VideoPlayer from './common/VideoPlayer';
import detectInlineVideoSupport from './common/InlineVideoSupportDetector';
import Tracking from './common/Tracking';
import { consoleLogTagged } from './common/Logger';
import scrollMonitor from 'scrollmonitor';
import { isInSafeFrame, inViewPercentage, geom } from './common/Dfp.js';
import { isVisible } from './common/DOM.js';
import raf from 'raf';

const logMessage = consoleLogTagged('VM5AdSDK:MixPlayer');

function findVm5Infos(div, callback) {
  if (!div) {
    return;
  }

  if (div.getElementsByTagName('vm5-infos').length === 1 && callback) {
    const childNodes = div.getElementsByTagName('vm5-infos')[0].childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];
      const key = childNode.getAttribute('key');
      const value =  childNode.getAttribute('value');
      callback(key, value);
    }
    return;
  }
  findVm5Infos(div.parentNode, callback);
}

class PlayerHandler {

  constructor(div, source, trackings, width, height, options) {
    this.player = null;
    this.div = div;
    this.options = Object.assign({
      // NOTE Default values
    }, options ? options : {});
    this.options.div = this.div;

    try {
      this.source = JSON.parse(source);
    } catch(e) {
      logMessage('Source Parse Fail');
      this.source = { mp4: '',
                      m3u8: '' };
    }
    try {
      this.trackings = JSON.parse(trackings);
    } catch(e) {
      logMessage('Trackings Parse Fail');
      this.trackings = [];
    }
    this.width = width;
    this.height = height;
    this.onPrepared = null;
    this.onPlayed = null;
    this.onPaused = null;
    this.onFinished = null;
    this.monitor = null;
    this.tracking = null;
    this.forceImpression = false;

    this.vpaidApi = null;

    // 從 root 的下一層取得 vm5infos
    this.ad_ids = {};
    const self = this;

    findVm5Infos(div, function(key, value) {
      switch (key) {
        case 'dfp-imp':
          // self.trackings.push({
          //   party: key,
          //   event: 'impression',
          //   url: value,
          // });

          // NOTE Why we do this?
          // Because CORS problems, somehow we will get red warning logs if just sending http requests
          // Thus we use "img-pixel" ways to send our dfp impression urls.
          function tryDfpImpression() {
            function sendDfpImpression() {
              const dfpImpImgTag = document.createElement('img');
              dfpImpImgTag.src = value;
              dfpImpImgTag.style.display = 'none';
              self.div.appendChild(dfpImpImgTag);
            }
            const newSubscriptionObject = self.subscribeOnImpression();
            if (newSubscriptionObject.failed) {
              setTimeout(tryDfpImpression, 50);
            } else {
              newSubscriptionObject.subscription = sendDfpImpression;
            }
          }
          tryDfpImpression();

          break;
        default:
          self.ad_ids[key] = value;
          break;
      }
    });

    this.monitorVisibility();
  }

  injectNormalPlayer() {
    const video = document.createElement('video');
    video.width = this.width;
    video.height = this.height;
    // video.setAttribute('playsinline', 'playsinline');
    // video.setAttribute('webkit-playsinline', 'webkit-playsinline');
    this.div.appendChild(video);
    this.player = new VideoPlayer(video);
    this.player.setDataSource(this.source.mp4, 'video/mp4');
    this.player.mute();
    this.player.setAutoPlay(false);
    this.player.playerType = 'softwareDecode';
    this.setupTrackings();
    if (this.onPlayerInitialized) {
      this.onPlayerInitialized();
    }
  }

  injectInlinePlayer() {
    const video = document.createElement('video');
    video.width = this.width;
    video.height = this.height;
    video.setAttribute('playsinline', 'playsinline');
    video.setAttribute('webkit-playsinline', 'webkit-playsinline');
    this.div.appendChild(video);
    this.player = new VideoPlayer(video);
    this.player.setDataSource(this.source.mp4, 'video/mp4');
    this.player.mute();
    this.player.setAutoPlay(false);
    this.player.playerType = 'inline';
    this.setupTrackings();
    if (this.onPlayerInitialized) {
      this.onPlayerInitialized();
    }
  }

  monitorOn(div, targetPercentage) {

    // 如果透過 mraid 來做監測, 則不需要 monitor viewability
    if (window.mraid && typeof window.mraid.addEventListener === "function") {
      logMessage('Found Real MARID.');
      return;
    }

    if (this.monitor) {
      return;
    }
    const self = this;
    this.monitor = scrollMonitor.create(div);
    raf(function update() {

      // check if watchItem is not in dom tree
      if (!document.body.contains(self.monitor.watchItem)) {
        return;
      }

      // 當 player 還沒有 ready 的時候, 有時候他可能會在不正確的位置上
      // 所以下面的這些計算, 應該以 player ready 之後為準
      if (!self.player || !self.player.isPrepared()) {
        raf(update);
        return;
      }

      self.monitor.recalculateLocation();
      scrollMonitor.update();

      let percentageInScreen = 100;
      const topToViewPort = self.monitor.top - scrollMonitor.viewportTop;
      const bottomToViewPort = self.monitor.bottom - scrollMonitor.viewportBottom;

      // 如果 topToViewPort < 0, 表示目標框上緣不在畫面中
      if (topToViewPort < 0) {

        // 只要出現在 viewport 之上, 就可以強制 impression
        self.doForceImpression();

        if (-1 * topToViewPort >= self.monitor.height) {
          percentageInScreen = 0;
        } else {
          percentageInScreen = 100 * (self.monitor.height + topToViewPort) / self.monitor.height;
        }

      // 如果 bottomToViewPort > 0, 表示目標框下緣超出畫面
      } else if (bottomToViewPort > 0) {
        if (bottomToViewPort >= self.monitor.height) {
          percentageInScreen = 0;
        } else {
          percentageInScreen = 100 * (self.monitor.height - bottomToViewPort) / self.monitor.height;
        }
      }

      if (inViewPercentage() !== undefined) {
        percentageInScreen = inViewPercentage();
      }

      // 判斷畫面中的百分比是不是比目標設定的多
      self.playOrPause(percentageInScreen > targetPercentage);
      raf(update);
    });
  }

  monitorVisibility() {
    // if (! isInSafeFrame()) {
    //   return;
    // }

    if (this.monitorVisibilityInterval) {
      return;
    }
    const self = this;
    const INTERVAL_CHECK_VISIBILITY = 100;
    const MAX_INVISIBLE_SECOND = 100;
    let visibleTimestamp = 0;
    raf(function update() {
      if (isVisible(self.div)) {
        visibleTimestamp = Date.now();
      }
      raf(update);
    });

    let lastVisibility = true;
    this.monitorVisibilityInterval = setInterval(function () {
      let visibility = Date.now() - visibleTimestamp <= MAX_INVISIBLE_SECOND;
      if (! visibility) {
        self.playOrPause(false);
      }
      if (lastVisibility != visibility) {
        lastVisibility = visibility;
        logMessage(`monitorVisibility: ${lastVisibility}`);
      }

      monitorSafeFramePosition();
    }, INTERVAL_CHECK_VISIBILITY);

    function monitorSafeFramePosition() {
      if (geom() !== undefined) {
        try {
          // NOTE 判斷是否 SafeFrame 位置。目前沒辦法正確判斷出所在 Safeframe 是在 viewport 上方還是下方，只要是在 viewport 外，geom().exp.t 都會是 0，所以目前這個判斷是無效的。
          if (geom().exp.t < 0) {
            self.doForceImpression();
          }
        } catch (e) {
          logMessage(e);
        }
      }
    }
  }

  setupTrackings() {
    this.tracking = new Tracking(this.trackings, this.ad_ids, this.player, Object.assign({}, this.options));
    this.tracking.forceImpression = this.forceImpression;
    const self = this;
    this.player.setListener({
      onPrepared() {
        self.tracking.initComScore();
        self.tracking.initMoatTracking();
        self.tracking.start();
        self.tracking.notifyOnPrepared();
        self.supportMraidIfNeed();
        if (self.onPrepared) {
          self.onPrepared();
        }
      },
      onPlayed() {
        if (self.onPlayed) {
          self.onPlayed();
        }
        self.tracking.notifyOnPlayed();
      },
      onPaused() {
        if (self.onPaused) {
          self.onPaused();
        }
        self.tracking.notifyOnPaused();
      },
      onStopped() {
        if (self.onStopped) {
          self.onStopped();
        }
        self.tracking.notifyOnStopped();
      },
      onFinished() {
        self.tracking.stop();
        if (self.onFinished) {
          self.onFinished();
        }
        self.tracking.notifyOnFinished();
      },
    });
  }

  supportMraidIfNeed() {
    if (!window.mraid || typeof window.mraid.addEventListener !== "function") {
      logMessage('Do Not Find MRAID or It May Fake MRAID.');
      return;
    }

    const self = this;

    function onMraidReady() {
      if (window.mraid.isViewable()) {
        self.playOrPause(true);
      }
      window.mraid.addEventListener('viewableChange', function(viewable) {
        self.playOrPause(viewable);
      });
    }

    if (window.mraid.getState() === 'loading') {
      window.mraid.addEventListener('ready', onMraidReady);
    } else {
      onMraidReady();
    }
  }

  playOrPause(isAllow) {
    if (isAllow) {

      // player 需要是準備好的
      if (this.player && this.player.isPrepared() && isVisible(this.div)) {
        this.doForceImpression();

        // 如果 player 為循環模式, 則直接播放
        if (this.player.isLoop()) {
          this.player.play();
          if (this.vpaidApi) {this.vpaidApi.resumeAd()}

        // 如果影片還沒有結束, 也是直接播放
        } else if (!this.player.isFinished()) {
          this.player.play();
          if (this.vpaidApi) {this.vpaidApi.resumeAd()}

        }
      }
    } else {
      if (this.player && this.player.isPrepared()) {
        this.player.pause();
        if (this.vpaidApi) {this.vpaidApi.pauseAd()}

      }
    }
  }

  doForceImpression() {
    let self = this;
    self.forceImpression = true;

    // 如果已經有 tracking object, 則把這個 flag 設定進去
    if (self.tracking) {
      self.tracking.forceImpression = self.forceImpression;
    }
  }

  subscribeOnImpression() {
    const newSubscriptionObject = {
      type: 'impression',
      value: null,
      subscription: null
    };
    if (!this.tracking) {
      logMessage('Subscription on Impression ' + '' + ' Fail, Use This Method After onPrepared!!!');
      newSubscriptionObject.failed = true;
      return newSubscriptionObject;
    }
    this.tracking.subscriptions.push(newSubscriptionObject);
    return newSubscriptionObject;
  }

  get vpaidApi() {
    if (this.tracking) {
      return this.tracking.vpaidApi;
    }
  }
  set vpaidApi(vpaidApi) {
    if (this.tracking) {
      this.tracking.vpaidApi = vpaidApi;
    }
  }
}

class MixPlayer {

  constructor(div, source, trackings, width, height, options) {
    this.handler = new PlayerHandler(div, source, trackings, width, height, options);
    const handler = this.handler;
    detectInlineVideoSupport()
      .then(() => {
        return true;
      })
      .catch((err) => {
        return false;
      })
      .then( (isSupportedInline) => {
        if (isSupportedInline) {
          logMessage('inline video supported');
          handler.injectInlinePlayer();
        } else {
          logMessage('inline video not supported');
          handler.injectNormalPlayer();
        }
      });
  }

  set onPlayerInitialized(callback) {
    this.handler.onPlayerInitialized = callback;
  }

  set onPrepared(callback) {
    this.handler.onPrepared = callback;
  }

  set onPlayed(callback) {
    this.handler.onPlayed = callback;
  }

  set onPaused(callback) {
    this.handler.onPaused = callback;
  }

  set onStopped(callback) {
    this.handler.onStopped = callback;
  }

  set onFinished(callback) {
    this.handler.onFinished = callback;
  }

  /**
  NOTE Need called in or after mix.onPrepared()
  */
  subscribeOnSecond(second) {
    const newSecond = {
      type: 'second',
      value: second,
      subscription: null
    };
    if (!this.handler.tracking) {
      logMessage('Subscription on Second ' + second + ' Fail, Use This Method After onPrepared!!!');
      return newSecond;
    }
    this.handler.tracking.subscriptions.push(newSecond);
    return newSecond;
  }

  /**
  NOTE Need called in or after mix.onPrepared()
  */
  subscribeOnPercentage(percentage) {
    const newPercentage = {
      type: 'percentage',
      value: percentage,
      subscription: null
    };
    if (!this.handler.tracking) {
      logMessage('Subscription on Percentage ' + percentage + ' Fail, Use This Method After onPrepared!!!');
      return newPercentage;
    }
    this.handler.tracking.subscriptions.push(newPercentage);
    return newPercentage;
  }

  /**
  NOTE Need called in or after mix.onPrepared()
  */
  subscribeOnImpression() {
    return this.handler.subscribeOnImpression();
  }

  percentageInViewPort(div, percentage) {
    this.handler.monitorOn(div, percentage);
  }

}

export default MixPlayer;
