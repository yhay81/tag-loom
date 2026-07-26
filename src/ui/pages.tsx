import { product } from "../config/product";
import { Layout } from "./layout";

export function HomePage() {
  return (
    <Layout>
      <section class="search-studio" id="search">
        <header class="studio-heading">
          <div>
            <p class="eyebrow">MULTI-CONDITION SEARCH</p>
            <h1>{product.headline}</h1>
          </div>
          <p class="local-note">
            <span aria-hidden="true">●</span>
            条件と保存検索はこの端末だけに保存
          </p>
        </header>

        <div class="studio-grid">
          <form class="query-panel" id="search-form">
            <section class="panel-section presets">
              <div class="section-heading">
                <span>01</span>
                <h2>ひな形</h2>
              </div>
              <div class="preset-row" aria-label="検索のひな形">
                <button
                  data-preset="local"
                  data-template-all="#カフェ"
                  data-template-any="浅草, 蔵前"
                  data-template-exact="自家焙煎"
                  type="button"
                >
                  <span aria-hidden="true">⌖</span>
                  地域のお店
                </button>
                <button
                  data-preset="competitor"
                  data-template-all="#新商品"
                  data-template-any="発売, 入荷"
                  data-template-exclude="求人, PR"
                  type="button"
                >
                  <span aria-hidden="true">◎</span>
                  競合投稿
                </button>
                <button
                  data-preset="event"
                  data-template-all="#東京イベント"
                  data-template-any="展示, マルシェ"
                  data-template-mode="posts"
                  type="button"
                >
                  <span aria-hidden="true">◇</span>
                  イベント
                </button>
              </div>
            </section>

            <section class="panel-section">
              <div class="section-heading">
                <span>02</span>
                <h2>検索条件</h2>
              </div>
              <div class="field-grid">
                <label class="field wide">
                  <span>すべて含む</span>
                  <textarea
                    autocomplete="off"
                    id="all-terms"
                    maxlength={240}
                    placeholder="#カフェ, #自家焙煎"
                    rows={2}
                  ></textarea>
                  <small>カンマか改行で区切る</small>
                </label>
                <label class="field">
                  <span>いずれか含む</span>
                  <textarea
                    autocomplete="off"
                    id="any-terms"
                    maxlength={240}
                    placeholder="浅草, 蔵前"
                    rows={2}
                  ></textarea>
                </label>
                <label class="field">
                  <span>完全一致</span>
                  <textarea
                    autocomplete="off"
                    id="exact-terms"
                    maxlength={240}
                    placeholder="自家焙煎"
                    rows={2}
                  ></textarea>
                </label>
                <label class="field wide">
                  <span>除外する</span>
                  <textarea
                    autocomplete="off"
                    id="exclude-terms"
                    maxlength={240}
                    placeholder="求人, PR"
                    rows={2}
                  ></textarea>
                </label>
              </div>
            </section>

            <section class="panel-section compact-section">
              <div class="section-heading">
                <span>03</span>
                <h2>検索先</h2>
              </div>
              <fieldset>
                <legend class="visually-hidden">Instagram内の検索対象</legend>
                <div class="mode-picker">
                  <label>
                    <input checked name="mode" type="radio" value="all" />
                    <span>すべて</span>
                  </label>
                  <label>
                    <input name="mode" type="radio" value="posts" />
                    <span>投稿</span>
                  </label>
                  <label>
                    <input name="mode" type="radio" value="reels" />
                    <span>リール</span>
                  </label>
                  <label>
                    <input name="mode" type="radio" value="tags" />
                    <span>タグページ</span>
                  </label>
                </div>
              </fieldset>
            </section>

            <div class="primary-actions">
              <button class="button primary" id="search-button" type="submit">
                <span aria-hidden="true">↗</span>
                Googleで検索
              </button>
              <button class="button secondary" id="save-button" type="button">
                条件を保存
              </button>
              <button class="button tertiary" id="reset-button" type="button">
                クリア
              </button>
            </div>
            <p class="action-status" id="action-status" aria-live="polite"></p>
          </form>

          <aside class="result-panel">
            <div class="result-toolbar">
              <span>
                <i aria-hidden="true"></i>
                SEARCH PREVIEW
              </span>
              <span id="condition-count">0 条件</span>
            </div>

            <section class="query-preview">
              <div class="browser-chrome" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <p>google.com/search</p>
              </div>
              <div class="query-card">
                <p class="query-label">生成される検索式</p>
                <output id="query-preview">site:instagram.com</output>
                <div class="condition-chips" id="condition-preview"></div>
              </div>
              <p class="result-note">
                検索結果はGoogleで開きます。Tag LoomはInstagramの投稿を取得・保存しません。
              </p>
            </section>

            <div class="share-actions">
              <button class="icon-button" id="copy-query-button" type="button">
                <span aria-hidden="true">⌘</span>
                検索式をコピー
              </button>
              <button class="icon-button" id="share-button" type="button">
                <span aria-hidden="true">↗</span>
                条件を共有
              </button>
              <button class="icon-button" id="export-button" type="button">
                <span aria-hidden="true">↓</span>
                CSV
              </button>
            </div>

            <section class="saved-section">
              <div class="saved-heading">
                <div>
                  <p class="eyebrow">SAVED ON THIS DEVICE</p>
                  <h2>保存した検索</h2>
                </div>
                <span id="saved-count">0 / 12</span>
              </div>
              <div class="saved-list" id="saved-list">
                <p class="empty-state">よく使う条件を保存すると、ここからすぐ再検索できます。</p>
              </div>
            </section>
          </aside>
        </div>

        <p class="affiliation-note">
          Tag
          LoomはInstagramおよびGoogleの非公式ツールです。各サービスの商標は各権利者に帰属します。
        </p>
      </section>
      <script defer src="/app.js"></script>
    </Layout>
  );
}

export function PrivacyPage() {
  return (
    <Layout title={`プライバシー | ${product.name}`}>
      <article class="prose">
        <p class="eyebrow">PRIVACY</p>
        <h1>検索条件は、端末の中に。</h1>
        <section>
          <h2>ブラウザ内だけで扱う情報</h2>
          <p>
            入力したハッシュタグ、キーワード、除外語、保存した検索はブラウザのlocalStorageへ保存します。
            画面の保存検索から個別に削除でき、ブラウザのサイトデータ削除でも消去できます。
          </p>
        </section>
        <section>
          <h2>外部サービスへ渡る情報</h2>
          <p>
            「Googleで検索」を押したときだけ、生成した検索式をGoogle検索へ送ります。
            共有URLを作ると検索条件がURLへ含まれるため、秘密情報は入力しないでください。
          </p>
        </section>
        <section>
          <h2>匿名の利用集計</h2>
          <p>
            品質改善のため、無作為な匿名セッションID、訪問・条件編集・検索遷移・保存・共有・CSV出力・別日再訪の種別、検索先モード、発生日だけをD1へ35日間保存します。
            実際の検索語、保存名、Google検索結果、Instagramの投稿、メールアドレス、IPアドレスは製品データベースへ保存しません。
          </p>
        </section>
      </article>
    </Layout>
  );
}
