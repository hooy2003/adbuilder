import { Container } from "../src/js/BannerContainer.js";
import { tetrisImg } from "../src/js/tetris.js";
import { backgroundImage } from "../src/js/BackgroundImage.js";
import { video } from "../src/js/Video.js";

export function custom_container(demoOp) {
  let requestId = "55667788";
  let trackings =
  '[{"event":"view","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=view"},\
  {"event":"impression","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=impression"},\
  {"event":"video_percentage:0","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=video_percentage:0"},\
  {"event":"video_percentage:25","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=video_percentage:25"},\
  {"event":"video_percentage:50","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=video_percentage:50"},\
  {"event":"video_percentage:75","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=video_percentage:75"},\
  {"event":"video_percentage:100","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=video_percentage:100"},\
  {"event":"click","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=click"},\
  {"event":"close","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=close"},\
  {"event":"replay","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=replay"},\
  {"event":"custom","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=custom"}]'
  ;
console.log('demoOp', demoOp);
  return Container({
    request_id: requestId,
    track_url: trackings,

    downloaded_pixel:
      "https://vaser-track.vm5apis.com/v2/track?requestId=&event=downloaded&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0",
    "text:cta_in_new_window": "",
    dfp_url: "",
    cta_prefix_url:
      "https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=click",
    "cta:default": "https://vmfive.com/?utm_source=vmfive_ad_cta",

    "text:embedded": ``,
    "text:show_close_mode": `fadein`,
    // 'text:height_ratio': `2`,
    //  'text:background_color': `#00000080`,

    bannerRatio: "32:10",

    enableExpand: demoOp.enableExpand ? demoOp.enableExpand:false,
    expandMode: demoOp.enableExpand ? demoOp.enableExpand:'full',// 若可展開，展開模式為 full or middle
    layoutGrid:   demoOp.layoutGrid ? demoOp.layoutGrid:"1", // 預設 Grid 欄數
    layoutExpand: demoOp.layoutExpand ? demoOp.layoutExpand:"1", // 展開 Grid 欄數

    onctaclicked: [
      function(comp, data) {
        console.log(data);
      }
    ],
    onclosed: [
      function() {
        console.log("closed");
      }
    ]
  });
}
// cobtainer, options, callback
export function custom_tetris(vmfiveAdUnitContainer, demoOp, playAnimation) {
  return tetrisImg({
    el: vmfiveAdUnitContainer.adContainerInner,
    request_id: vmfiveAdUnitContainer.request_id,
    "image:image1": demoOp.image,

    bannerRatio: demoOp.bannerRatio,

    columns: demoOp.columns,
    rows: demoOp.rows,

    onBackgroundImageOnLoad: [
      function(el, option) {
        playAnimation(el, option);
      }
    ]
  });
}

export function custom_backgroundImage(vmfiveAdUnitContainer, demoOp) {
  return backgroundImage({
    el: vmfiveAdUnitContainer.adContainerRight,
    request_id: vmfiveAdUnitContainer.request_id,
    'image:image1': demoOp.image,
    'image:image_expanded': demoOp.image,
    'image:foreground_image': '',
  });
}

export function custom_video (vmfiveAdUnitContainer, demoOp) {
  return video({
    el: vmfiveAdUnitContainer.adContainerLeft,
    request_id: vmfiveAdUnitContainer.request_id,
    'video:video1:mp4': 'https://d2v4tz4zvhrua.cloudfront.net/manual_uploads/20190313/resource/for_demo/expand_ad/video.mp4',
    'video:video1:m3u8': 'https://d2v4tz4zvhrua.cloudfront.net/manual_uploads/20180402/mothers_day_demo/resources/dynamic/interstitial/video.m3u8',
    'image:cover': 'https://d2v4tz4zvhrua.cloudfront.net/production/image_1521427447202.jpg',
    'text:3rd_party_track_url': '',
    disableAutoplay: false,
    videoLoop: true,
  });
}

export function anime_timeline(blockList) {
  let screenHeight = screen.height;
  let anime_timeline = null;
  anime_timeline = anime.timeline({
    loop: false
  });
  anime_timeline
    .add({
      targets: [blockList[13], blockList[25], blockList[37], blockList[38]],
      duration: 350,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[35], blockList[46], blockList[47], blockList[48]],
      duration: 300,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[31], blockList[43], blockList[44], blockList[45]],
      duration: 250,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[28], blockList[29], blockList[40], blockList[41]],
      duration: 200,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[12], blockList[23], blockList[24], blockList[36]],
      duration: 200,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[17], blockList[18], blockList[30], blockList[42]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[15], blockList[26], blockList[27], blockList[39]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[9], blockList[21], blockList[32], blockList[33]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[7], blockList[8], blockList[19], blockList[20]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[10], blockList[11], blockList[22], blockList[34]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[4], blockList[5], blockList[6], blockList[16]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[1], blockList[2], blockList[3], blockList[14]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    });
  return anime_timeline;
}
