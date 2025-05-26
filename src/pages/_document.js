import Document, { Html, Head, Main, NextScript } from 'next/document';


// 'sha256-cQ6qM8hT5UTTVsr9ElHVtV3qZ7hXt+CpsAiyutr1qV8='  Legacy Nonces for the CSP
// 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 
// 'sha256-VEAk8w6L5NOGK2emNAq/+n8/ophOY+ddTiTAhfpSQCk=' 
// 'sha256-eqVkavPUHGIw0X+a9ppNhrLIxKg+hd/eJSFJLN98XfI='
// 'sha256-NEc0/F2KAJDIIN38ZiWcRpAXNxEpANVnDLE/O6q8YQI='
// 'sha256-Z5XTK23DFuEMs0PwnyZDO9SWxemQ5HxcpVaBNuUJyWY='
// 'sha256-ot9xBUGy5p3vVRL/4SZuM7FUCvZsG0k6SnZZ3RY+PdM='
// 'sha256-ESnvXyyFL8kcj08LMHYJOVaIBXVOE+9wx67fq5JmRko='
// 'sha256-c8+lBblmEbnOY5Dm011BsLb+6sUQuGX1R2yRFf93IVk='
// 'sha256-B4Xcf7MNodYYbOCY/BTbJfZ3/mBheuc02sCTD9cqNx4='
// 'sha256-CaMGt4IDFTfW/tIppEk/9tTZhfa2OqnU0SffJrPCN8o='



class MyDocument extends Document {
  render() {
    const isDev = process.env.NODE_ENV === 'development';
    const supabaseUrl = process.env.SUPABASE_URL; 
    const csp = isDev
    ? `default-src 'self'; 
       script-src 'unsafe-eval' 'self' https://static.cloudflareinsights.com https://cdnjs.cloudflare.com https://js.stripe.com; 
       style-src 'self' 'unsafe-inline'; 
       img-src 'self'; 
       font-src 'self' https://cdnjs.cloudflare.com; 
       connect-src 'self' https://ezqxowoktggxkbdhnxik.supabase.co wss://ezqxowoktggxkbdhnxik.supabase.co; 
       frame-src 'self' https://js.stripe.com;`
    : `default-src 'self'; 
       script-src 'self' https://static.cloudflareinsights.com https://js.stripe.com https://cdnjs.cloudflare.com 'sha256-Fp38q5wa9tSmfbU6SLrYVwIY75LuYwIrw7UFWSb3b1I=';
       style-src 'self' 'unsafe-inline'; 
       img-src 'self'; 
       font-src 'self' https://cdnjs.cloudflare.com; 
       connect-src 'self' https://ezqxowoktggxkbdhnxik.supabase.co wss://ezqxowoktggxkbdhnxik.supabase.co; 
       frame-src 'self' https://js.stripe.com;`;


    return (
      <Html>
       <Head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#000000" />
          <link rel="apple-touch-icon" href="/icon.svg" />
          <link rel="icon" href="/icon/heyjinn.svg" /> {/* Add this line */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta
            httpEquiv="Content-Security-Policy"
            content={csp}
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