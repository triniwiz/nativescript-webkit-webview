import { WebView } from 'tns-core-modules/ui/web-view';
import { fromObject } from 'tns-core-modules/data/observable/observable';

export class TNSWKWebView extends WebView {
    public static messageHandlerEvent = "message";
    private _messageHandlers: string[] = [];
    private _nativeChannels: any[] = [];
    constructor() {
        super();
    }

    public addMessageHandler(messageHandlerName: string) {
        if (this.nativeView) {
            if (this._messageHandlers.indexOf(messageHandlerName) === -1) {
                const channel = this.nativeView.createWebMessageChannel();
                this._nativeChannels.push(channel);
                const weakRef = new WeakRef(this);
                const callback = (android as any).webkit.WebMessagePort.WebMessageCallback.extend({
                    onMessage: function (port, message) {
                        const owner = weakRef.get();
                        owner.notify({
                            eventName: TNSWKWebView.messageHandlerEvent,
                            object: fromObject({
                                name: messageHandlerName,
                                body: message.getData()
                            })
                        });
                    }
                });
                const nativeArray = Array.create('android.webkit.WebMessagePort', 1);
                nativeArray[0] = channel[1];
                this.nativeView.postWebMessage(new (android as any).webkit.WebMessage(messageHandlerName, nativeArray), android.net.Uri.EMPTY);
                channel[0].setWebMessageCallback(new callback());
                this._messageHandlers.push(messageHandlerName);
            }
        }
    }

    public removeMessageHandler(messageHandlerName: string): void {
        const index = this._messageHandlers.indexOf(messageHandlerName);
        if (index > -1) {
            this._nativeChannels[index][0].close();
            this._nativeChannels.slice(index, 1);
            this._messageHandlers.splice(index, 1);
        }
    }


    public evaluateJavaScript(javaScriptString: string, callback: Function): void {
        if (this.nativeView) {
            const nativeView = this.nativeView as android.webkit.WebView;
            (nativeView as any).evaluateJavascript(
                javaScriptString,
                new android.webkit.ValueCallback({
                    onReceiveValue: function (value) {
                        callback(value, null);
                    }
                })
            );
        }

    }

}