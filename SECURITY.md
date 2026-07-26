# Security Policy

## Reporting

脆弱性を公開Issueへ投稿せず、GitHubのprivate vulnerability reportingから報告してください。検索精度の要望や通常の不具合は公開Issueを利用できます。

## Implemented controls

- CSP、HSTS、frame拒否、MIME sniffing拒否、Permissions Policy
- JSXの既定エスケープと、クライアント側の`textContent`による表示
- イベントAPIのcontent type、body size、同一オリジン、UUID、event、mode検証
- D1の一意制約による同一日イベントの重複排除と35日保持
- CSVセル先頭の式文字を無効化し、formula injectionを防止
- 固定されたGoogle検索originだけを新しいタブで開く
- 秘密値、Instagram認証、ユーザー生成HTML、投稿データを扱わない

## Known limits

- 匿名イベントAPIは認証を要求しないため、偽装クライアントによる集計ノイズを完全には防げません。集計は事業判断の補助であり、課金や権限判定には使いません。
- 共有URLには利用者が入力した検索条件が含まれます。秘密情報を入力しないよう画面とプライバシー説明で案内します。
- GoogleとInstagramの検索仕様変更により、生成式の有効性が変わる場合があります。
