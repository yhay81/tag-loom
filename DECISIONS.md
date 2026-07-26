# Decisions

## 2026-07-26 — Public usage pilot

- Status: advanced
- Evidence: 日本語でInstagramの複数条件検索を解説する既存ページが継続更新され、Googleは`site:`、引用符、除外演算子を公式サポートしている
- Decision: 21日間、登録不要の検索式ワークベンチとして公開する
- Product boundary: Google検索式の生成、端末保存、共有URL、CSV出力まで。Instagram API、スクレイピング、投稿取得、アカウント、決済は含めない
- Contradicting evidence: Google検索を直接使える利用者には独立ツールの価値が小さく、検索結果品質は外部サービスに依存する
- Next review: 2026-08-16

## 2026-07-26 — No authentication

- Decision: Better Authを追加しない
- Reason: 中核作業は一人・一端末で完了し、登録は最初の検索までの摩擦を増やす。保存検索は端末内で十分に検証できる
- Revisit when: 複数端末同期またはチーム共有を求める実利用が確認されたとき
