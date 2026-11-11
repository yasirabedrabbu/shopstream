package com.shopstream.coreapi.common;

import java.util.Locale;

public final class Money {

    private Money() {
    }

    /** 4599, "USD" becomes "USD 45.99" */
    public static String format(String currency, long cents) {
        return String.format(Locale.ROOT, "%s %d.%02d", currency, cents / 100, Math.abs(cents % 100));
    }
}