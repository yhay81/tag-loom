# Tag Loom

Instagram向けの検索条件を、AND・OR・完全一致・除外に分けて組み立てる日本語の検索ワークベンチです。生成した検索式はGoogle検索で開き、よく使う条件は端末内へ保存できます。

- サービス: <https://tag-loom.yusuke8h.workers.dev>
- プライバシー: <https://tag-loom.yusuke8h.workers.dev/privacy>
- 運用判断: [`EXPERIMENT.md`](EXPERIMENT.md)
- 指標定義: [`METRICS.md`](METRICS.md)

## Product boundary

Tag Loomは、公開Web上のInstagramページを探すためのGoogle検索式を生成します。Instagram API、スクレイピング、ログイン、投稿データの取得・保存は行いません。

入力中の条件と保存検索はブラウザの`localStorage`だけに保存します。D1へ送るのは匿名セッションID、操作種別、検索先モード、発生日だけで、検索語は送りません。

## Local development

Node.js 24をfnmで管理し、Vite+によるランタイム管理は無効にします。

```powershell
vp env off
npm ci
npx wrangler d1 migrations apply tag-loom --local
npm run dev
```

## Quality and operations

```powershell
npm run check
npm test
npm run build
npm run release:check
npm run metrics -- -Local
```

本番へ公開するときはD1 migrationを適用してからデプロイし、IndexNowへ公開URLを通知します。

```powershell
npx wrangler d1 migrations apply tag-loom --remote
npm run deploy
npm run indexnow
npm run metrics
```

ユーザーデータ、秘密値、生のアクセスログをGitへ保存しないでください。
