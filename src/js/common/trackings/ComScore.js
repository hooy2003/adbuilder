const TAG = "ComScore";

import {getBrowserSize} from '../Utils';
import {getCookieId} from '../SessionCookie.js'

class ComScore {
    constructor(infos) {
        this.mComScoreApi = null;

        this.mPartnerId = "23382710";
        this.mInfos = infos;
        this.mDuration = 0;
        this.mCookieId = getCookieId();
        this.mPlayerNode = null;

        this.mIsEnabled = false;

        this.triggerEvent = null;
        this.url = null;
    }

    init(playerNode, duration) {
        if (this.mIsEnabled) {
            this.mComScoreApi = cs_vce_;
            this.mDuration = duration;
            this.mPlayerNode = playerNode;
            this.mComScoreApi.init(this.mPartnerId, {
                playerNode: playerNode,
            });
        }
    }

    sendEvent(eventType, isFullScreen, volume, videoPlayerId) {
        if (!this.mComScoreApi) return;
        if (!this.mIsEnabled) return;

        var browserSize = getBrowserSize();

        //var videoPlayer = document.getElementById(videoPlayerId);
        var videoPlayer = this.mPlayerNode;

        var params = {};
        params.ns_ad_cd = parseInt(this.mDuration / 1000);
        params.ns_ad_fs = isFullScreen;
        params.ns_ad_vs = Math.abs(parseFloat(volume) - 0) < 1e-9;
        params.ns_ad_ctp = false;

        params.ns_ad_sz = `${videoPlayer.offsetWidth}x${videoPlayer.offsetHeight}`;
        params.ns_ad_ps = `${videoPlayer.offsetWidth}x${videoPlayer.offsetHeight}`;
        params.ns_ad_ct = "linear";
        params.ns_ad_of = "0x0";
        params.ns_ad_fts = true;
        params.ns_ad_fsr = `${browserSize.w}x${browserSize.h}`;
        params.ns_ad_fpt = "html5";

        var eventTrackingURL = this.url;
        if (!this.url) {
            eventTrackingURL = `https://ads.scorecardresearch.com/p?c1=3&c2=${this.mPartnerId}&c3=${this.mInfos.campaignId}&c4=${this.mInfos.creativeId}&c5=${this.mInfos.appKey}_${this.mInfos.placementId}&c6=${this.mCookieId}&c16=vm5&cj=1&ax_fwd=1&vce4v=1`;
        }
        eventTrackingURL = eventTrackingURL.replace('[timestamp]', Date.now());
        this.mComScoreApi.trackEvent(eventType, eventTrackingURL, params, videoPlayerId);
    }

    setEnabled(isEnabled) {
        this.mIsEnabled = isEnabled;
    }

    isEnabled() {
        return this.mIsEnabled;
    }

    setUrl(triggerEvent, url) {
        if (url && this.mInfos && this.mInfos.placementId) {
          url = url.replace('[placement_id]', this.mInfos.placementId);
        }

        this.triggerEvent = triggerEvent;
        this.url = url;
    }
}

export default ComScore;
