# フロントエンド開発ガイド

tribox Contest のフロントエンド（`src/templates/` と `src/public/`）を触る人向けのルール集です。

## 構成

```
src/
  templates/            Jinja2 テンプレート (ページごとに1ファイル)
    components/         共通部品 (header, bodyheader, bodyfooter, basejs, authjs など)
  public/
    stylesheets/        CSS (main.css = 全ページ共通、それ以外はページ別)
    javascripts/        ページ別 JS
    skyblue/            ベンダーCSS (編集禁止)
```

- フレームワークは AngularJS 1.7 + Firebase Realtime Database。データは基本クライアントサイドで取得・描画します。
- サーバーは Flask（`src/app.py`）。ルートはテンプレートを返すだけの薄い作りです。

## Jinja と Angular のデリミタ

AngularJS と衝突するため、Jinja のデリミタを変更しています（`src/app.py` 参照）。

| 記法 | 処理系 | 実行タイミング |
|---|---|---|
| `[[ ... ]]` `[% ... %]` `[# ... #]` | Jinja2 | サーバーサイド（レンダリング時） |
| `{{ ... }}` `ng-*` | AngularJS | クライアントサイド（データ取得後） |

## img の src に Angular の補間を書かない

`src="...{{ ... }}"` と書くと、Angular がコンパイルする前にブラウザが
`%7B%7B...%7D%7D` というリテラル URL へリクエストして 404 になります。
**Angular の値を含む画像 URL は必ず `ng-src` を使ってください。**

```html
<!-- NG: ページ表示のたびに失敗リクエストが飛ぶ -->
<img src="https://flagcdn.com/{{ r.user.iso2 }}.svg" />

<!-- OK -->
<img ng-src="https://flagcdn.com/{{ r.user.iso2 }}.svg" />
```

## 色は CSS 変数を使う

パレットは `main.css` 先頭の `:root` に定義しています（main.css は全ページで読み込まれます）。

| 変数 | 値 | 用途 |
|---|---|---|
| `--color-brand-1` / `--color-brand-2` | #0096af / #009678 | ブランドカラー（teal） |
| `--gradient-brand` | -15deg | ヘッダー・フッター・アクティブ状態の背景 |
| `--gradient-brand-vertical` / `--gradient-brand-horizontal` | to bottom / to right | 見出しテキスト・区切り線など |
| `--color-text` | #808080 | 基本テキスト |
| `--color-text-strong` | #555 | 強調・ホバー |
| `--color-text-muted` | #999 | 補助テキスト |
| `--color-text-light` | #e6e6e6 | 濃い背景上の明るいテキスト（フッター等） |
| `--color-link` / `--color-link-hover` | #0088cc / #006699 | リンク |
| `--color-surface-hover` | #f5f5f5 | ホバー背景 |
| `--color-surface-muted` | #f7f7f7 | 淡い背景（パネル・ゼブラ・表ヘッダ） |
| `--color-border` / `--color-border-light` / `--color-border-lighter` | #ccc / #ddd / #ececec | ボーダー（濃→淡） |
| `--color-error` / `--color-success` | #e74c3c / #1bbc9b | エラー・成功表示 |
| `--shadow-card` | 0 0 8px #bbb | カード・メニューの影 |

ルール:

- 上記の意味に当てはまる色は必ず変数で書く。ハードコードしない
- 新しい色が繰り返し必要になったら、まず `:root` に変数を追加してから使う
- 1箇所だけの装飾的な色（バッジの黄色など）は直書きでよい
- ベンダーCSS（`skyblue/`）と minify 済みファイルは触らない

## ブレイクポイント

CSS 変数はメディアクエリの条件には使えないため、値は直書きです。この表を正とします。

| 幅 | 意味 |
|---|---|
| `max-width: 480px` | 最小スマホ調整（body フォント 15px 化など） |
| `max-width: 697px` | ヘッダー・メインメニュー・ロゴの縮小 |
| `max-width: 768px` | **スマホレイアウトの主境界**（テーブル・コンテンツの切替） |
| `max-width: 969px` | フッターの縦積み |
| `max-width: 1024px` | タブレット調整 |

新しいブレイクポイントを増やさず、この5つに寄せてください。

## クラス命名

ページ名をプレフィックスにしたフラットな命名です（例: `contestresult-table-col-place`、`ranking-puzzle-brand`）。共通部品は `footer-nav-item` のように部品名プレフィックス。新しいスタイルもこの規則に合わせてください。

## 動作確認

```
http://localhost:5000
```

- 結果ページ: `/contest/result/<cid>/<eid>`（実データのコンテスト ID は Firebase の `inProgress` を参照）
- 参加者が多いコンテスト（300行超）でテーブル系の変更を確認すること
- スマホ確認は DevTools のレスポンシブモードで 360〜768px を一通り
