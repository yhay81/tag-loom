# 21-day public usage pilot

## User and job

- Target user: Instagramで地域店舗、競合投稿、イベント、ハッシュタグを繰り返し調べる日本語利用者
- Job to be done: 複数キーワードのAND・OR・完全一致・除外を間違えずに組み、同じ条件を再利用する
- Current workaround: Google検索演算子を手入力する、条件をメモへ保存する、Instagram内で一語ずつ検索する

## Hypothesis

検索条件を入力欄とプレビューで並べて確認できれば、検索演算子を覚えなくても目的のGoogle検索へ移動でき、よく使う条件を翌日以降も再利用できる。

## Method

- Recruitment channel: 公開サービス、検索流入、公開GitHubリポジトリ
- Duration: 2026-07-26から2026-08-16まで
- Comparison: 利用開始、検索遷移、端末保存、共有、別日再利用の匿名集計
- Scope: 21日間は無料・登録不要。Instagram APIやスクレイピングは追加しない

## Decision

- Continue: 25人以上が利用し、15人以上がGoogle検索へ移動し、5人以上が条件を保存し、3人以上が共有URLを作り、3人以上が別日に再利用する
- Stop or redesign: 利用者10人未満、検索遷移5人未満、または利用者の多数が既存のGoogle検索で十分と判断する
- Deadline: 2026-08-16
- Maximum build time: 初回公開1日、pilot中の改善は合計1日
- Maximum monthly infrastructure cost: 5 USD

## Guardrails

- 検索語、Google検索結果、Instagramの投稿、個人情報をサーバーへ保存しない。
- Instagramへ自動アクセスせず、利用者の操作でGoogle検索を開く。
- 利用者数のために入力検証、保持期限、robots、利用条件を弱めない。
- 成功・停止条件をpilot途中で都合よく変更しない。
- 検証条件をサービス画面へ表示しない。
