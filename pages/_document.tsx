import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Create AI Filters"
          />
          <meta property="og:site_name" content="room-genius-xi.vercel.app" />
          <meta
            property="og:description"
            content="Create AI Filters"
          />
          <meta property="og:title" content="FilterAI" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="FilterAI" />
          <meta
            name="twitter:description"
            content="Create AI Filters"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
