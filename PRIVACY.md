# Privacy

## Browser-only data

入力したハッシュタグ、キーワード、除外語、現在の条件、最大12件の保存検索、無作為な匿名セッションID、最終訪問日は、利用者のブラウザの`localStorage`へ保存します。保存検索は画面から個別に削除でき、すべての情報はブラウザのサイトデータ削除でも消去できます。

## Data sent outside the browser

- 「Googleで検索」を押すと、生成した検索式をGoogle検索へ送ります。
- 共有すると、検索条件をクエリパラメータに含むTag LoomのURLを共有先へ渡します。
- Tag LoomのD1へは、匿名セッションID、操作種別、検索先モード、発生日だけを送ります。

検索語、保存名、共有URL、Google検索結果、Instagram投稿、メールアドレス、IPアドレスはTag Loomの製品データベースへ保存しません。Cloudflareはサービス提供とセキュリティのため、基盤側の短期ログを処理する場合があります。

## Retention and deletion

- D1の匿名イベントは35日を超えると削除します。
- 端末内データは保存検索の削除またはブラウザのサイトデータ削除で消去できます。
- 匿名セッションIDと個人を結びつける情報を保持しないため、運営者が特定利用者のD1行を照合して削除することはできません。

## Contact and operator

- Security contact: GitHubのprivate vulnerability reporting
- Operator: [yhay81](https://github.com/yhay81)
