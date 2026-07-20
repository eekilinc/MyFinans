package com.myfinans.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class MyFinansWidgetProvider extends AppWidgetProvider {

    private static final String SHARED_PREF_NAME = "MyFinansWidgetPrefs";
    private static final String KEY_UNPAID_AMOUNT = "unpaid_amount";
    private static final String KEY_UNPAID_COUNT = "unpaid_count";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
        String unpaidAmount = prefs.getString(KEY_UNPAID_AMOUNT, "₺0.00");
        String unpaidCount = prefs.getString(KEY_UNPAID_COUNT, "Ödenmemiş harcama yok");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.myfinans_widget);
        views.setTextViewText(R.id.widget_unpaid_amount, unpaidAmount);
        views.setTextViewText(R.id.widget_unpaid_count, unpaidCount);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(new ComponentName(context, MyFinansWidgetProvider.class));
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
