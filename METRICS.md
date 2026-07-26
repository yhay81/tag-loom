# Metrics

Tag Loomは登録を要求しないため、ブラウザで生成した無作為な匿名セッションIDを利用者単位として扱います。同じ利用者・操作・発生日のイベントはD1の一意制約で1件に集約します。

| Stage        | D1 event           | Meaning                            |
| ------------ | ------------------ | ---------------------------------- |
| `users`      | `visited`          | 画面を開いた匿名利用者             |
| `configured` | `configured`       | 条件または検索先を変更した利用者   |
| `searched`   | `searched`         | Google検索を開いた利用者           |
| `saved`      | `saved`            | 条件を端末へ保存した利用者         |
| `shared`     | `shared`           | 条件入りURLを共有した利用者        |
| `exported`   | `exported`         | 保存検索をCSVへ出力した利用者      |
| `returned`   | 複数日の`searched` | 別日に再びGoogle検索を開いた利用者 |

`returned`クライアントイベントも運用確認用に保持しますが、正式な再利用数は`searched`が2日以上ある匿名セッションで算出します。

## Ratios

- Configuration: `configured / users`
- Search completion: `searched / configured`
- Save: `saved / searched`
- Share: `shared / searched`
- Return: `returned / searched`
- 直近7日の利用者数と検索完了数

## Data contract

- 保存する: 匿名セッションID、イベント名、検索先モード、発生日、サーバー記録時刻
- 保存しない: 検索語、保存名、共有URL、Google検索結果、Instagram投稿、IPアドレス、User-Agent
- 保持期間: 35日。イベント受信時に期限超過行を削除
- 一意性: `session_id + name + occurred_on`

## Operator contract

- `npm run metrics`は本番D1の集計をJSONで標準出力する。
- 出力は`generated_at`、`service`、`environment`、`funnel`、`rates`を持つ。
- 分母0の比率は0とし、欠測を成功扱いしない。
- 生の行や個別IDは公開しない。公開Issueには集計値だけを記録する。
- 成功条件は[`EXPERIMENT.md`](EXPERIMENT.md)と公開Issueで管理し、サービス画面へ載せない。
