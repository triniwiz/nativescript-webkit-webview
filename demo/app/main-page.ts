import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
let webView;
// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    let page = <pages.Page>args.object;
    page.bindingContext = new HelloWorldModel();
    webView = page.getViewById('webView');
    webView.on('loadStarted', (args) => {
        console.log('started');
        console.log(args.url);
    });
    webView.on('loadFinished', (args) => {
        console.log('finished');
        console.log(args.url);
    });
    // webView.src = 'https://www.google.com';
}


export function reload() {
    webView.evaluateJavaScript('(function() { return "testing 123"; })();', function (result) {
        console.log(result);
    });
    webView.on('message', data => {
        console.log(data.eventName);
        console.log(data.object.body);
    });

    webView.addMessageHandler('webkitMessenger');
    setTimeout(() => {
        webView.evaluateJavaScript('sendMessage();', (res, err) => {
            console.log('js: ', res, err);
        });
    }, 1000);
    setTimeout(() => {
        webView.removeMessageHandler('webkitMessenger');
    }, 2000);
}