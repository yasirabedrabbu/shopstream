package com.shopstream.coreapi.assistant;

import java.util.regex.Pattern;

/** Removes emails, Bangladeshi phone numbers and national ID numbers before anything is logged. */
public final class PiiRedactor {

    private static final int MAX_LENGTH = 500;

    private static final Pattern EMAIL =
            Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
    private static final Pattern BD_PHONE =
            Pattern.compile("(?:\\+?880[\\s-]?)?0?1[3-9](?:[\\s-]?\\d){8}");
    private static final Pattern NATIONAL_ID =
            Pattern.compile("\\b(?:\\d{10}|\\d{13}|\\d{17})\\b");

    private PiiRedactor() {
    }

    public static String redact(String text) {
        if (text == null) {
            return "";
        }
        String out = EMAIL.matcher(text).replaceAll("[email]");
        out = BD_PHONE.matcher(out).replaceAll("[phone]");
        out = NATIONAL_ID.matcher(out).replaceAll("[id]");
        return out.length() > MAX_LENGTH ? out.substring(0, MAX_LENGTH) : out;
    }
}