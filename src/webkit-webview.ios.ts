import * as fs from 'tns-core-modules/file-system';
import { View, Property, layout } from 'tns-core-modules/ui/core/view';
import { knownFolders } from 'tns-core-modules/file-system';
import { LoadEventData, NavigationType } from 'tns-core-modules/ui/web-view/web-view';
import { fromObject } from 'tns-core-modules/data/observable/observable';


class WKNavigationDelegateImpl extends NSObject
    implements WKNavigationDelegate {
    static ObjCProtocols = [WKNavigationDelegate];
    static initWithOwner(owner: WeakRef<TNSWKWebView>): WKNavigationDelegateImpl {
        const handler = <WKNavigationDelegateImpl>WKNavigationDelegateImpl.new();
        handler._owner = owner;
        return handler;
    }
    private _owner: WeakRef<TNSWKWebView>;


    webViewDidFinishNavigation(webView: WKWebView, navigation: WKNavigation): void {
        const owner = this._owner.get();
        if (owner) {
            let src = owner.src;
            if (webView.URL) {
                src = webView.URL.absoluteString;
            }
            owner._onLoadFinished(src);
        }
    }

    webViewDidFailNavigationWithError(webView: WKWebView, navigation: WKNavigation, error: NSError): void {
        const owner = this._owner.get();
        if (owner) {
            let src = owner.src;
            if (webView.URL) {
                src = webView.URL.absoluteString;
            }
            owner._onLoadFinished(src, error.localizedDescription);
        }
    }

    webViewDecidePolicyForNavigationActionDecisionHandler(webView: WKWebView, navigationAction: WKNavigationAction, decisionHandler: any): void {
        const owner = this._owner.get();
        if (owner && navigationAction.request.URL) {
            let navType: NavigationType = "other";

            switch (navigationAction.navigationType) {
                case WKNavigationType.LinkActivated:
                    navType = "linkClicked";
                    break;
                case WKNavigationType.FormSubmitted:
                    navType = "formSubmitted";
                    break;
                case WKNavigationType.BackForward:
                    navType = "backForward";
                    break;
                case WKNavigationType.Reload:
                    navType = "reload";
                    break;
                case WKNavigationType.FormResubmitted:
                    navType = "formResubmitted";
                    break;
            }
            decisionHandler(WKNavigationActionPolicy.Allow);
            owner._onLoadStarted(navigationAction.request.URL.absoluteString, navType);
        }
    }

}

class WKScriptMessageHandlerImpl extends NSObject
    implements WKScriptMessageHandler {
    static ObjCProtocols = [WKScriptMessageHandler];
    static new(): WKScriptMessageHandlerImpl {
        return <WKScriptMessageHandlerImpl>super.new();
    }

    static initWithOwner(owner: WeakRef<TNSWKWebView>): WKScriptMessageHandlerImpl {
        const handler = WKScriptMessageHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    private _owner: WeakRef<TNSWKWebView>;

    userContentControllerDidReceiveScriptMessage(
        userContentController: WKUserContentController,
        message: WKScriptMessage
    ): void {
        const owner = this._owner.get();
        if (owner) {
            owner.notify({
                eventName: TNSWKWebView.messageHandlerEvent,
                object: fromObject({
                    name: message.name,
                    body: message.body
                })
            });
        }
    }
}

const srcProperty = new Property<TNSWKWebView, string>({ name: 'src' });

export class TNSWKWebView extends View {
    public static messageHandlerEvent = "message";
    public static loadStartedEvent = "loadStarted";
    public static loadFinishedEvent = "loadFinished";

    public src: string;
    private _ios: WKWebView;
    private _messageHandlers: Array<string> = [];
    private _scriptMessageHandler: WKScriptMessageHandlerImpl;
    private _userContentController: WKUserContentController;
    private _delegate: WKNavigationDelegateImpl;
    constructor() {
        super();
        this._scriptMessageHandler = WKScriptMessageHandlerImpl.initWithOwner(
            new WeakRef(this)
        );
        this._userContentController = WKUserContentController.new();
        const config = WKWebViewConfiguration.new();
        this.nativeView = this._ios = new WKWebView({
            frame: CGRectZero,
            configuration: config
        });
        this._delegate = WKNavigationDelegateImpl.initWithOwner(
            new WeakRef(this)
        );
        this._ios.configuration.preferences.setValueForKey(
            true,
            'allowFileAccessFromFileURLs'
        );
    }

    public _onLoadFinished(url: string, error?: string) {
        const args = <LoadEventData>{
            eventName: TNSWKWebView.loadFinishedEvent,
            object: this,
            url: url,
            navigationType: undefined,
            error: error
        };

        this.notify(args);
    }

    public _onLoadStarted(url: string, navigationType: NavigationType) {
        const args = <LoadEventData>{
            eventName: TNSWKWebView.loadStartedEvent,
            object: this,
            url: url,
            navigationType: navigationType,
            error: undefined
        };

        this.notify(args);
    }

    public stopLoading() {
        this._ios.stopLoading();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        const nativeView = this.nativeView;
        if (nativeView) {
            const width = layout.getMeasureSpecSize(widthMeasureSpec);
            const height = layout.getMeasureSpecSize(heightMeasureSpec);
            this.setMeasuredDimension(width, height);
        }
    }

    [srcProperty.getDefault](): string {
        return "";
    }

    [srcProperty.setNative](src: string) {
        this.stopLoading();
        if (src.startsWith('~/') || src.startsWith('http') || src.startsWith('/')) {
            this._loadUrl(src);
        } else {
            this._loadData(src);
        }
    }

    onLoaded(): void {
        super.onLoaded();
        this._ios.configuration.userContentController = this._userContentController;
        this._ios.navigationDelegate = this._delegate;
    }

    onUnloaded(): void {
        this._ios.navigationDelegate = null;
        super.onUnloaded();
    }

    get canGoBack(): boolean {
        return this._ios.canGoBack;
    }

    get canGoForward(): boolean {
        const nativeView = this.nativeView;
        if (nativeView) {
            return nativeView.canGoForward;
        }
        return false;
    }

    public goBack() {
        const nativeView = this.nativeView;
        if (nativeView) {
            nativeView.goBack();
        }
    }

    public goForward() {
        const nativeView = this.nativeView;
        if (nativeView) {
            nativeView.goForward();
        }
    }

    public _loadData(content: string) {
        this._ios.loadHTMLStringBaseURL(content, NSURL.alloc().initWithString(`file:///${knownFolders.currentApp().path}/`));
    }

    public _loadUrl(url: string, readAccessUrl?: string): void {
        const reHttp = new RegExp('^http');
        if (reHttp.test(url)) {
            const myUrl = NSURL.URLWithString(url);
            const myRequest = NSURLRequest.requestWithURL(myUrl);
            this._ios.loadRequest(myRequest);
        } else if (url.startsWith('/')) {
            const myUrl = NSURL.fileURLWithPath(url);
            const myReadAccessUrl = readAccessUrl
                ? NSURL.fileURLWithPath(readAccessUrl)
                : myUrl;
            this._ios.loadFileURLAllowingReadAccessToURL(myUrl, myReadAccessUrl);
        } else {
            const reTilda = new RegExp('^~/');
            if (reTilda.test(url)) {
                url = fs.path.join(
                    fs.knownFolders.currentApp().path,
                    url.replace(reTilda, '')
                );
            }
            const myUrl = NSURL.fileURLWithPath(url);
            const myReadAccessUrl = readAccessUrl
                ? NSURL.fileURLWithPath(readAccessUrl)
                : myUrl;
            this._ios.loadFileURLAllowingReadAccessToURL(myUrl, myReadAccessUrl);
        }
    }

    public reload() {
        this._ios.reload();
    }

    public addMessageHandler(messageHandlerName: string) {
        if (this._messageHandlers.indexOf(messageHandlerName) === -1) {
            this._userContentController.addScriptMessageHandlerName(
                this._scriptMessageHandler,
                messageHandlerName
            );
            this._messageHandlers.push(messageHandlerName);
        }
    }

    public removeMessageHandler(messageHandlerName: string): void {
        const index = this._messageHandlers.indexOf(messageHandlerName);
        if (index > -1) {
            this._userContentController.removeScriptMessageHandlerForName(
                messageHandlerName
            );
            this._messageHandlers.splice(index, 1);
        }
    }

    public evaluateJavaScript(javaScriptString: string, callback: Function): void {
        this._ios.evaluateJavaScriptCompletionHandler(
            javaScriptString,
            (res, err) => {
                callback(res, err);
            }
        );
    }
}

srcProperty.register(TNSWKWebView);
