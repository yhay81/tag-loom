import type { Child } from "hono/jsx";

import { product } from "../config/product";

type LayoutProps = {
  children: Child;
  description?: string;
  title?: string;
};

export function Layout({
  children,
  description = product.description,
  title = product.name,
}: LayoutProps) {
  return (
    <html itemscope itemtype="https://schema.org/WebApplication" lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content={description} name="description" />
        <meta content={product.name} itemProp="name" />
        <meta content={description} itemProp="description" />
        <meta content={product.url} itemProp="url" />
        <meta content={product.applicationCategory} itemProp="applicationCategory" />
        <meta content="Any" itemProp="operatingSystem" />
        <meta content="true" itemProp="isAccessibleForFree" />
        <meta content={description} property="og:description" />
        <meta content={product.ogImage} property="og:image" />
        <meta content={product.ogImageAlt} property="og:image:alt" />
        <meta content="720" property="og:image:height" />
        <meta content="1280" property="og:image:width" />
        <meta content="ja_JP" property="og:locale" />
        <meta content={title} property="og:title" />
        <meta content="website" property="og:type" />
        <meta content={product.url} property="og:url" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={product.ogImage} name="twitter:image" />
        <link href={product.url} rel="canonical" />
        <link href="/styles.css" rel="stylesheet" />
        <title>{title}</title>
      </head>
      <body>
        <a class="skip-link" href="#main">
          本文へ移動
        </a>
        <header class="site-header">
          <a class="brand" href="/">
            {product.name}
          </a>
          <nav aria-label="メイン">
            <a class="nav-cta" href="#search">
              検索を作る
            </a>
            <a href="/privacy">プライバシー</a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <span>© 2026 {product.name}</span>
          <nav aria-label="フッター">
            <a href="/privacy">プライバシー</a>
            <a href="https://github.com/yhay81/tag-loom">GitHub</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
