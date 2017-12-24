# NativeScript WebKit WebView

[![npm](https://img.shields.io/npm/v/nativescript-webkit-webview.svg)](https://www.npmjs.com/package/nativescript-webkit-webview)
[![npm](https://img.shields.io/npm/dt/nativescript-webkit-webview.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-webkit-webview)
[![Build Status](https://travis-ci.org//triniwiz/nativescript-webkit-webview.svg?branch=master)](https://travis-ci.org/triniwiz/nativescript-webkit-webview)

## Installation


```javascript
tns plugin add nativescript-webkit-webview
```

## Usage
 

### Angular

```ts
import { registerElement } from 'nativescript-angular/element-registry';
registerElement('WebView', () => require('nativescript-webkit-webview').TNSWKWebView);
```

```html
<WebView src="https://www.google.com"></WebView>
```

### Core

IMPORTANT: Make sure you include xmlns:wk="nativescript-webkit-webview" on the Page tag

```xml
<wk:TNSWKWebView src="https://www.google.com"/>
```
    
## License

Apache License Version 2.0, January 2004
