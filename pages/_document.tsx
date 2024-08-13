import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Chat with Audio Files"
          />
          <meta property="og:site_name" content="tryaudiochat.com" />
          <meta
            property="og:description"
            content="Chat with Audio Files"
          />
          <meta property="og:title" content="audio chat" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="audio chat" />
          <meta
            name="twitter:description"
            content="Chat with Audio Files"
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
