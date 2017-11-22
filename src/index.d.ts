import { View } from 'tns-core-modules/ui/core/view';
import { NavigationType } from 'tns-core-modules/ui/web-view/web-view';
export declare class TNSWKWebView extends View {
    static messageHandlerEvent: string;
    static loadStartedEvent: string;
    static loadFinishedEvent: string;
    src: string;
    private _ios;
    private _messageHandlers;
    private _scriptMessageHandler;
    private _userContentController;
    private _nativeChannels;
    constructor();
    _onLoadFinished(url: string, error?: string): void;
    _onLoadStarted(url: string, navigationType: NavigationType): void;
    stopLoading(): void;
    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;
    onUnloaded(): void;
    readonly canGoBack: boolean;
    readonly canGoForward: boolean;
    goBack(): void;
    goForward(): void;
    _loadData(content: string): void;
    _loadUrl(url: string, readAccessUrl?: string): void;
    reload(): void;
    addMessageHandler(messageHandlerName: string): void;
    removeMessageHandler(messageHandlerName: string): void;
    evaluateJavaScript(javaScriptString: string, callback: Function): void;
}

export declare interface TNSWKWebViewMessageEvent {
    name: string;
    body: any;
}