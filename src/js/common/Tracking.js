import { consoleLogTagged } from './Logger';
import { getParameterByName } from './DOM';
import ComScore from './trackings/ComScore';
import Moat from './trackings/Moat';
// import getFetchAPI from '../common/getFetchAPI';

const logMessage = consoleLogTagged('VM5AdSDK:MixPlayer');

const IMPRESSION_TIME = 0
const VIEW_TIME = 2

class Tracking {

  constructor(trackings, ad_ids, player, options) {
    this.trackings = trackings;
    this.comScore = null;
    this.moatApi = null;
    this.vpaidApi = null;
    this.adInfos = ad_ids;
    this.options = options;

    this.options.view_time = (!isNaN(this.options.view_time)) && (+this.options.view_time) > 0 ? (+this.options.view_time) : VIEW_TIME;

    let comscoreTracking = null;
    const length = trackings.length;
    for (let i = 0; i < length; i++) {
      const tracking = trackings[i];
      if (tracking.party && tracking.party === 'comscore') {
        comscoreTracking = tracking;
        break;
      }
    }
    if (comscoreTracking && Object.keys(ad_ids).length > 0) {
      this.comScore = new ComScore(ad_ids);
      this.comScore.setEnabled(true);
      this.comScore.setUrl(comscoreTracking.event, comscoreTracking.url);
    }

    if (Object.keys(ad_ids).length > 0 && options.div) {
      if (this.options.moat_url) {
        if (getParameterByName('level1', this.options.moat_url) && (!this.options.advertiser)) {
          let value = getParameterByName('level1', this.options.moat_url);
          this.options.advertiser = value;
        }
        if (getParameterByName('level2', this.options.moat_url) && (!this.options.campaignId)) {
          let value = getParameterByName('level2', this.options.moat_url);
          this.options.campaignId = value;
        }
        if (getParameterByName('level3', this.options.moat_url) && (!this.options.audienceGroupId)) {
          let value = getParameterByName('level3', this.options.moat_url);
          this.options.audienceGroupId = value;
        }
        if (getParameterByName('level4', this.options.moat_url) && (!this.options.creativeId)) {
          let value = getParameterByName('level4', this.options.moat_url);
          this.options.creativeId = value;
        }
        if (getParameterByName('slicer1', this.options.moat_url) && (!this.options.appKey)) {
          let value = getParameterByName('slicer1', this.options.moat_url);
          this.options.appKey = value;
        }
        if (getParameterByName('slicer2', this.options.moat_url) && (!this.options.placementId)) {
          let value = getParameterByName('slicer2', this.options.moat_url);
          this.options.placementId = value;
        }
        if (getParameterByName('pcode', this.options.moat_url) && (!this.options.partnerCode)) {
          let value = getParameterByName('pcode', this.options.moat_url);
          this.options.partnerCode = value;
        }
      }

      this.moatApi = new Moat({
        level1: this.options.advertiser ? this.options.advertiser : 'VMFiveAds',
        level2: this.options.campaignId ? this.options.campaignId : ad_ids.campaignId,
        level3: this.options.audienceGroupId ? this.options.audienceGroupId : ad_ids.audienceGroupId,
        level4: this.options.creativeId ? this.options.creativeId : ad_ids.creativeId,
        slicer1: this.options.appKey ? this.options.appKey : ad_ids.appKey,
        slicer2: this.options.placementId ? this.options.placementId : ad_ids.placementId,
        partnerCode: this.options.partnerCode ? this.options.partnerCode : '',
      });
      this.moatApi.setEnabled(this.options.partnerCode ? true : false);
    }

    this.player = player;
    this.timer = null;
    this.progress = 0;
    this.percentage = 0;
    this.isImpressed = false;
    this.isJustImpressed = false;
    this.isViewed = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.isMuted = false;
    this.subscriptions = [];
    this.forceImpression = false;

    this.videoTagInitializeTimestamp = Date.now();
    this.lastVideoPlayPosition = 0;
    this.lastVideoPlayPositionMoveTimestamp = Date.now();
    this.lastVideoPlayPositionLaggingEventSentTimestamp = Date.now();
    this.sendCustomEventTracking('playerType', {'playerType':this.player.playerType,});
  }

  findObjectByItsKeyValueInArray(array, key, value) {
    var result={};
    array.forEach(function(item, i) {
      result = (item[key] == value ? item : result);
    });
    return result;
  }

  sendCustomEventTracking(eventSubtype, moreParams) {
    this.sendGeneralEventTracking('custom', eventSubtype, moreParams);
  }
  sendGeneralEventTracking(eventName, eventSubtype, moreParams) {
    moreParams = moreParams ? moreParams : {};
    var tracking = this.findObjectByItsKeyValueInArray(this.trackings, 'event', 'custom');
    if (tracking && tracking.url) {
      var url = tracking.url;
      url = url.replace('event=custom', 'event=' + eventName);
      url = url + '&eventSubtype=' + encodeURIComponent(eventSubtype);
      url = moreParams.eventValue ? url + '&eventValue=' + encodeURIComponent(moreParams.eventValue) : url;

      delete moreParams['eventValue'];
      url = url + '&eventDetails=' + encodeURIComponent(JSON.stringify(moreParams));

      this.sendTrackingWithUrl(url);
    }
  }

  notifyOnPrepared() {
    this.sendGeneralEventTracking('video_loaded:' + (Date.now() - this.videoTagInitializeTimestamp), '', {});
    this.lastVideoPlayPosition = this.player.getCurrentPosition();
    this.lastVideoPlayPositionMoveTimestamp = Date.now();
  }
  notifyOnPlayed() {
    this.isPlaying = true;

    let finalName = this.isPaused ? 'resume' : 'play';
    this.sendTracking(finalName);

    this.isPaused = false;
  }
  notifyOnPaused() {
    this.isPlaying = false;
    this.sendTracking('pause');
    this.isPaused = true;
  }
  notifyOnFinished() {
    this.isPlaying = false;
    this.isPaused = false;
  }
  notifyOnStopped() {
    this.isPlaying = false;
    this.sendTracking('stop');
    this.isPaused = false;
  }

  initComScore() {
    if (!this.comScore) {
      return;
    }
    this.comScore.init(this.player.mVideoPlayer, this.player.getDuration());
  }
  initMoatTracking() {
    if (!this.moatApi) {
      return;
    }
    this.moatApi.init(this.options.div, this.player.getDuration(), this.player.getVideoUrl());
  }

  start() {
    this.timer = setTimeout(function tick() {
      this.triggerSubscriptions();

      this.checkImpressionNeedsAndSend();
      this.checkVideoLaggingAndSend();

      if (!this.isViewed && this.videoCurrentTime() >= this.options.view_time) {
        this.sendTracking('view');
        this.isViewed = true;
      }

      if (this.videoCurrentTime() >= this.progress) {
        this.sendTracking('video_progress:' + this.progress);
        this.progress += 1;
      }

      if (this.videoCurrentPercentage() > this.percentage) {
        this.sendTracking('video_percentage:' + this.percentage);
        this.percentage += 25;
      }

      if (this.player.isMuted() && (!this.isMuted)) {
        this.sendTracking('mute');
      } else if ((!this.player.isMuted()) && this.isMuted) {
        this.sendTracking('unmute');
      }
      this.isMuted = this.player.isMuted();

      this.timer = setTimeout(tick.bind(this), 250);
    }.bind(this), 0);
  }

  videoCurrentTime() {
    return parseInt(this.player.getCurrentPosition() / 1000, 10);
  }

  videoCurrentPercentage() {
    return parseInt(this.player.getCurrentPercentage() * 100, 10);
  }

  videoVolume() {
    return this.player.isMuted() ? 0 : this.player.getVolume();
  }

  stop() {
    if (this.videoCurrentPercentage() === 100) {
      this.sendTracking('video_progress:' + this.videoCurrentTime());
      this.sendTracking('video_percentage:' + this.videoCurrentPercentage());
    }
    clearTimeout(this.timer);
    this.timer = null;
  }

  sendTracking(name) {
    logMessage(name);
    let notSendTrackings = [];
    for (let i = 0; i < this.trackings.length; i++) {
      let tracking = this.trackings[i];
      if (tracking.event === name) {
        // send this tracking
        logMessage('Send : ' + tracking.url);

        let url = tracking.url;
        this.sendTrackingWithUrl(url);
      } else {
        // keep this tracking
        notSendTrackings.push(tracking);
      }
    }
    this.trackings = notSendTrackings;

    this.sendComScoreTracking(name);
    this.sendMoatTracking(name);
  }

  sendTrackingWithUrl(url) {
    if (url && this.adInfos && this.adInfos.placementId) {
      url = url.replace('[placement_id]', this.adInfos.placementId);
    }
    url = url.replace('[timestamp]', Date.now());
    let pixelReq = document.createElement('img');
    pixelReq.src = url;
    pixelReq.style.display = 'none';
    document.body.appendChild(pixelReq);
  }

  checkImpressionNeedsAndSend() {
    if (!this.isImpressed) {
      if (this.forceImpression || this.videoCurrentTime() > IMPRESSION_TIME) {
        this.sendTracking('impression');
        this.isImpressed = true;
        this.isJustImpressed = true;
      }
    }
    else if (this.isJustImpressed) {
      this.isJustImpressed = false;
    }
  }

  checkVideoLaggingAndSend() {
    let timeInterval = Date.now() - this.lastVideoPlayPositionMoveTimestamp;
    // logMessage(`Playing ${this.player.getCurrentPosition() - this.lastVideoPlayPosition} ${timeInterval}`);

    if (this.isPlaying && this.player.getCurrentPosition() - this.lastVideoPlayPosition === 0) {
      if (timeInterval >= 1*1000 && Date.now() - this.lastVideoPlayPositionLaggingEventSentTimestamp > 3*1000) {
        this.lastVideoPlayPositionLaggingEventSentTimestamp = Date.now();
        logMessage(`Video Lagging for ${timeInterval}`);
        this.sendCustomEventTracking('video_lagging', {
          eventValue: timeInterval,
        });
      }
    } else {
      if (! this.isPlaying) {
        // logMessage(`Paused`);
      }

      this.lastVideoPlayPosition = this.player.getCurrentPosition();
      this.lastVideoPlayPositionMoveTimestamp = Date.now();
    }
  }

  sendMoatTracking(name) {
    if (!this.moatApi) {
      return;
    }

    const simpleMap = {
      'play': 'AdPlaying',
      'pause': 'AdPaused',
      'resume': 'AdPlaying',
      'stop': 'AdStopped',
      'impression': 'AdVideoStart',
      'video_percentage:0': 'AdVideoStart',
      'video_percentage:25': 'AdVideoFirstQuartile',
      'video_percentage:50': 'AdVideoMidpoint',
      'video_percentage:75': 'AdVideoThirdQuartile',
      'video_percentage:100': 'AdVideoComplete',
      'mute': 'AdVolumeChange',
      'unmute': 'AdVolumeChange',
    }

    let finalName = '';
    switch (name) {
      default:
        let simpleMapMappedName = simpleMap[name];
        if (simpleMapMappedName) {
          finalName = simpleMapMappedName;
        }
        break;
    }
    switch (finalName) {
      case 'AdVolumeChange':
        if (this.vpaidApi) {
          this.vpaidApi.setAdVolume(this.player.getVolume());
        }
        break;
      default:

    }
    if (finalName !== '') {
      this.moatApi.sendEvent(finalName, this.videoVolume());
    }
  }

  sendComScoreTracking(name) {
    if (!this.comScore) {
      return;
    }

    const volume = this.videoVolume();
    const simpleMap = {
      'play': 'play',
      'pause': 'pause',
      'resume': 'resume',
      'stop': 'stop',
      'video_percentage:0': 'start',
      'video_percentage:25': 'firstQuartile',
      'video_percentage:50': 'midpoint',
      'video_percentage:75': 'thirdQuartile',
      'video_percentage:100': 'complete',
    }

    let finalName = '';
    switch (name) {
      default:
        let simpleMapMappedName = simpleMap[name];
        if (simpleMapMappedName) {
          finalName = simpleMapMappedName;
        }
        break;
    }
    if (finalName !== '') {
      this.comScore.sendEvent(finalName, true, volume, this.player.mVideoPlayer);
    }
  }

  triggerSubscriptions() {
    let notTriggerSubscriptions = [];
    for (let i = 0; i < this.subscriptions.length; i++) {
      let s = this.subscriptions[i];
      if ((s.type === 'second' && this.videoCurrentTime() === s.value && s.subscription) ||
          (s.type === 'percentage' && this.videoCurrentPercentage() === s.value && s.subscription) ||
          (s.type === 'impression' && this.isJustImpressed && s.subscription) ||
          false
        ) {
        s.subscription();
      } else {
        notTriggerSubscriptions.push(s);
      }
    }
    this.subscriptions = notTriggerSubscriptions;
  }

}

export default Tracking;
