import { Player } from "textalive-app-api";
import { snapdom } from "https://unpkg.com/@zumer/snapdom/dist/snapdom.mjs"

const video = document.querySelector("#video");
const videoCanvas = document.createElement("canvas");
let localStream;
let decorationListNum = 0;

initVideoCamera();
initPhoto();
document.querySelector("#shooting-button").addEventListener("click", photoShoot);
addDecoration();

/**
 * 遊び方画面の非表示
 */
document.querySelector("#how-to-close").addEventListener("click", () => {
  document.querySelector("#how-to").style.display = "none";
});

/**
 * ビデオのカメラ設定(デバイスのカメラ映像をビデオに表示)
 */
function initVideoCamera() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })
        .then((stream) => {
            console.log("camera on");
            localStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(e => console.log(e));
}

/**
 * 写真の初期描画
 */
function initPhoto() {
    videoCanvas.width = video.clientWidth;
    videoCanvas.height = video.clientHeight;
    const context = videoCanvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
    document.querySelector("#video").src = videoCanvas.toDataURL("image/png");
}

/**
 * 写真の撮影描画
 */
async function photoShoot() {
    const element = document.querySelector("#camera");
    const capture = await snapdom(element, { embedFonts: true });
    await capture.toPng();
    let date = Date.now();
    await capture.download({
      format: "png",
      filename: date
  });
  // document.body.appendChild(capture);
}

/**
 * 描画サイズの計算
 * 縦横比が撮影(video)が大きい時は撮影の縦基準、それ以外は撮影の横基準で計算
 */
function calcDrawSize() {
    let videoRatio = video.videoHeight / video.videoWidth;
    let viewRatio = video.clientHeight / video.clientWidth;
    return videoRatio > viewRatio ?
        { height: video.clientHeight, width: video.clientHeight / videoRatio }
        : { height: video.clientWidth * videoRatio, width: video.clientWidth }
}

const constraints = {
    video: {
        facingMode: { exact: 'environment' }
    },
    audio: false
};

const getStream = (isUser) => {
    // 直前のストリームを停止する
    if (localStream !== undefined) {
        localStream.getVideoTracks().forEach((camera) => {
            camera.stop();
            console.log("camera stop");
        });
      };

    // 再読み込み
    constraints.video.facingMode = isUser ? 'user' : { exact: 'environment' }

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            localStream = stream;
            video.srcObject = stream;
            video.play();
        }).catch(e => {
            console.log(e);
        })
}

let isFrontCamera = true;
document.querySelector("#camera-reverse-button").addEventListener("click", (e) =>{
  if (!isFrontCamera) {
    getStream(true);
    isFrontCamera = true;
  } else {
    getStream(false);
    isFrontCamera = false;
  }
})

// TextAliveApi周り

// 単語が発声されていたら #lyric-text に表示する
const lyricText = document.querySelector("#lyric-text p");
const animatePhrase = function (now, unit) {
  if (unit.contains(now)) {
    lyricText.textContent = unit.text;
    console.log(now);
    console.log(unit.text)
  }
};

// TextAlive Player を作る
const player = new Player({
  app: {
    token: "1HJzpsZ11CfoUPrr",
  },
  mediaElement: document.querySelector("#media"),
});

// TextAlive Player のイベントリスナを登録する
player.addListener({
  onAppReady,
  onVideoReady,
  onTimerReady,
});

const artistSpan = document.querySelector("#artist span");
const songSpan = document.querySelector("#song span");

/**
 * TextAlive App が初期化されたときに呼ばれる
 *
 * @param {IPlayerApp} app - https://developer.textalive.jp/packages/textalive-app-api/interfaces/iplayerapp.html
 */
function onAppReady(app) {
  // TextAlive ホストと接続されていなければ再生コントロールを表示する
  if (!app.managed) {
    document.querySelector("#control").style.display = "block";

    /* 再生・一時停止ボタン */
    document.querySelector("#control > a#play").addEventListener("click", (e) => {
    e.preventDefault();
    if (player) {
        if (player.isPlaying) {
        player.requestPause();
        } else {
        player.requestPlay();
        }
    }
    });

    /* 停止ボタン */
    document.querySelector("#control > a#stop").addEventListener("click", (e) => {
    e.preventDefault();
    if (player) {
        player.requestStop();
    }
    });
  }

  // Load a song when a song URL is not specified
  if (!app.songUrl) {
    // シャッターチャンス / 夜未アガリ
    player.createFromSongUrl("https://piapro.jp/t/PNpQ/20251209170719", {
        video: {
        // 音楽地図訂正履歴
        beatId: 4827295,
        chordId: 2963756,
        repetitiveSegmentId: 3086263,

        // 歌詞URL: https://piapro.jp/t/wyWv
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FPNpQ%2F20251209170719
        lyricId: 126542,
        lyricDiffId: 28628
        },
    });
  }
}

/**
 * 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
 *
 * @param {IVideo} v - https://developer.textalive.jp/packages/textalive-app-api/interfaces/ivideo.html
 */
function onVideoReady(v) {
  // メタデータを表示する
  artistSpan.textContent = player.data.song.artist.name;
  songSpan.textContent = player.data.song.name;

  // 再生、停止ボタンを有効化
  document.querySelectorAll(".disabled").forEach((btn) => (btn.disabled = false));

  // 定期的に呼ばれる各フレーズの "animate" 関数をセットする
  let phrase = player.video.firstPhrase;
  while (phrase) {
    phrase.animate = animatePhrase;
    phrase = phrase.next;
  }
}

/**
 * 音源の再生準備が完了した時に呼ばれる
 *
 * @param {Timer} t - https://developer.textalive.jp/packages/textalive-app-api/interfaces/timer.html
 */
function onTimerReady(t) {
  document.querySelector("#control > a#play").className = "";
  document.querySelector("#control > a#stop").className = "";
}

/**
 * デコレーション移動
 */
const moveDecoration = (e) => {
  if (e.buttons <= 0) return;
  let x = e.clientX;
  let y = e.clientY;
  x += e.movementX;
  y += e.movementY;

  const cameraPosition = document.querySelector("#camera").getBoundingClientRect();
  const targetPosition = e.currentTarget.getBoundingClientRect();
  if (x <= cameraPosition.left) {
    x = cameraPosition.left;
  }
  if (x >= cameraPosition.right - targetPosition.width) {
    x = cameraPosition.right - targetPosition.width;
  }
  if (y <= cameraPosition.top) {
    y = cameraPosition.top;
  }
  if (y >= cameraPosition.bottom - targetPosition.height) {
    y = cameraPosition.bottom - targetPosition.height;
  }
  
  e.currentTarget.style.transform = `translate(${x}px, ${y}px)`;
  e.currentTarget.setPointerCapture(e.pointerId);
};

/**
 * デコレーション追加
 */
function addDecoration() {
  const decorationList = [
    "image/penLightBlueGreen.png",
    "image/penLightOrange.png",
    "image/penLightYellow.png",
    "image/penLightPink.png",
    "image/penLightRed.png",
    "image/penLightBlue.png",
    "image/diamondBlueGreen.png",
    "image/diamondOrange.png",
    "image/diamondYellow.png",
    "image/diamondPink.png",
    "image/diamondRed.png",
    "image/diamondBlue.png",
    "image/heartBlueGreen.png",
    "image/heartOrange.png",
    "image/heartYellow.png",
    "image/heartPink.png",
    "image/heartRed.png",
    "image/heartBlue.png",
    "image/noteBlueGreen.png",
    "image/noteOrange.png",
    "image/noteYellow.png",
    "image/notePink.png",
    "image/noteRed.png",
    "image/noteBlue.png"
  ];

  const selectItem = document.querySelector("#select-item");
  let decorationImageName = decorationList[decorationListNum];
  selectItem.src = decorationImageName;
  document.querySelector("#right-button").addEventListener("click", () => {
    decorationListNum++;
    if (decorationListNum >= decorationList.length) {
      decorationListNum = 0;
    }
    decorationImageName = decorationList[decorationListNum];
    selectItem.src = decorationImageName;
  });
  document.querySelector("#left-button").addEventListener("click", () => {
    decorationListNum--;
    if (decorationListNum < 0) {
      decorationListNum = decorationList.length - 1;
    }
    decorationImageName = decorationList[decorationListNum];
    selectItem.src = decorationImageName;
  });

  document.querySelector("#decoration-button").addEventListener("click", () => {
    const decorationImage = document.createElement("img");
    decorationImage.src = decorationImageName; 
    decorationImage.width = 100;
    decorationImage.height = 100;
    document.querySelector("#camera").appendChild(decorationImage);
    decorationImage.setAttribute("class", "decoration");
    let decorationItems = document.querySelectorAll(".decoration");
    decorationItems.forEach(function(decorationItem) {
      decorationItem.addEventListener("pointermove", moveDecoration);
    });
  });
}

/**
 * 歌詞移動
 */
document.querySelector("#lyric-text").addEventListener("pointermove", moveDecoration);

/**
 * フォント選択
 */
const fontSelect = document.querySelector('#font-select');
const fontList = [
  "Yusei Magic",
  "Noto Sans Japanese",
  "Sawarabi Gothic",
  "Kosugi",
  "M PLUS Rounded 1c",
  "Zen Maru Gothic",
  "Kiwi Maru",
  "Dela Gothic One",
  "Mochiy Pop One"
];
fontSelect.addEventListener('change', () => {
  lyricText.style.fontFamily = fontList[fontSelect.value] + ", sans-serif";
});

/**
 * 文字色選択
 */
const fontColor = document.querySelector('#font-color');
const colorList = [
  "#39C5BB",
  "orange",
  "#FFE211",
  "pink",
  "#D80000",
  "blue"
];
fontColor.addEventListener('change', () => {
  lyricText.style.color = colorList[fontColor.value];
});

/**
 * フォントサイズ選択
 */
const fontSize = document.querySelector('#font-size');
const sizeList = [4, 6, 8, 10, 12];
fontSize.addEventListener('change', () => {
  lyricText.style.fontSize = sizeList[fontSize.value] + "vw";
});

/**
 * 歌詞縦横選択
 */
const direction = document.querySelector('#direction');
const directionList = [
  "horizontal-tb",
  "vertical-rl"
];
direction.addEventListener('change', () => {
  lyricText.style.writingMode = directionList[direction.value];
});