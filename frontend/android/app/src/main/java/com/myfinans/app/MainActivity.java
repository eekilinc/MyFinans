package com.myfinans.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String SHARED_PREF_NAME = "MyFinansWidgetPrefs";
    private static final String KEY_UNPAID_AMOUNT = "unpaid_amount";
    private static final String KEY_UNPAID_COUNT = "unpaid_count";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        WebView webView = this.getBridge().getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void updateWidgetData(final String unpaidAmount, final String unpaidCount) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Context context = getApplicationContext();
                            SharedPreferences prefs = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
                            SharedPreferences.Editor editor = prefs.edit();
                            editor.putString(KEY_UNPAID_AMOUNT, unpaidAmount);
                            editor.putString(KEY_UNPAID_COUNT, unpaidCount);
                            editor.apply();

                            // Trigger widget redraw
                            MyFinansWidgetProvider.updateAllWidgets(context);
                        }
                    });
                }

                @JavascriptInterface
                public void printPage() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                android.print.PrintManager printManager = (android.print.PrintManager) getSystemService(Context.PRINT_SERVICE);
                                android.print.PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter("MyFinans Raporu");
                                String jobName = "MyFinans Raporu";
                                printManager.print(jobName, printAdapter, new android.print.PrintAttributes.Builder().build());
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }, "MyFinansWidget");
        }
    }
}
