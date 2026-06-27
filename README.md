# Lyric Photo Maker

「Lyric Photo Maker」は、[初音ミク「マジカルミライ 2026」プログラミング・コンテスト](https://magicalmirai.com/2026/procon/)の応募作品です。

歌詞やデコレーションアイテムを自由に配置し、カメラ機能を用いて現実世界と共に撮影することが可能です。


# 開発
[Node.js](https://nodejs.org/ja)をインストールしている環境で以下のコマンドを実行すると、開発用サーバが起動します。

```
npm install
npm run dev
```
カメラ機能を使用するため、スマートフォンやタブレット端末で確認する場合は、[ngrok](https://ngrok.com/)等を用いてhttps接続を出来るようにする必要があります。

ngrokのサイトでアカウントを作成、エージェントをダウンロード後、マイページからauthtokenを取得し、以下のコマンドを実行することでスマートフォンやタブレット端末からアクセス出来るURLを発行することが出来ます。
```
ngrok config add-authtoken <authtoken> (初回のみ)
ngrok http <npm run devで開いたページのURL>
```
vite.config.jsを以下のように設定することで、スマートフォンやタブレット端末でも実行することが出来ます。(今回作者が使用していたURLは削除してあります。)
```
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['ngrokで発行したURL']
  }
});
```

# 使用技術
## 言語
- HTML
- CSS
- JavaScript

## ライブラリ
- TextAlive App API: 音楽同期と歌詞データ
- snapDOM: 撮影範囲の画像作成
- vite: ビルド

# ポイント
昨今、推し活ブームもあり、アクリルスタンドやぬいぐるみといったグッズと一緒に写真を撮影する方が増えています。

自身の持つグッズと好きな歌詞を組み合わせて、写真撮影の幅が広がればという思いで制作をしました。

また、このアプリは課題曲のシャッターチャンスから着想を得ています。

## アプリ機能のポイント
カメラ機能で写す画像と歌詞を組み合わせて写真を撮影することが可能です。

歌詞はフォントや色、サイズを自由に変更することが出来ます。

また、デコレーションアイテムを配置することも可能です。

歌詞とデコレーションアイテムは、ドラッグすることで自由に移動することが出来ます。

# デモ
[デモ動画](https://youtu.be/W91ZH3wNQy4)

## 実際の撮影結果
![実際の撮影結果](/image/musicPhotoMaker.png)

# 素材
## フォント
- [Yousei Magic](https://fonts.google.com/specimen/Yusei+Magic?query=Yusei+Magic)
- [Noto Sans Japanese](https://fonts.google.com/noto/specimen/Noto+Sans+JP?query=Noto+Sans+Japanese)
- [Sawarabi Gothic](https://fonts.google.com/specimen/Sawarabi+Gothic)
- [Kosugi](https://fonts.google.com/specimen/Kosugi?query=Kosugi)
- [M PLUS Rounded 1c](https://fonts.google.com/specimen/M+PLUS+Rounded+1c?query=M+PLUS+Rounded+1c)
- [Zen Maru Gothic](https://fonts.google.com/specimen/Zen+Maru+Gothic?query=Zen+Maru+Gothic)
- [Kiwi Maru](https://fonts.google.com/specimen/Kiwi+Maru?query=Kiwi+Maru)
- [Dela Gothic One](https://fonts.google.com/specimen/Dela+Gothic+One?query=Dela+Gothic+One)
- [Mochiy Pop One](https://fonts.google.com/specimen/Mochiy+Pop+One?query=Mochiy+Pop+One)