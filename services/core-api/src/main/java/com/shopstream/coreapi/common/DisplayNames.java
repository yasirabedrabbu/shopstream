package com.shopstream.coreapi.common;

import java.util.Locale;

public final class DisplayNames {

    private DisplayNames() {
    }

    /** "Rahim Uddin Khan" becomes "Rahim K.", so customers' full names stay private. */
    public static String publicName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "Customer";
        }
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0];
        }
        String last = parts[parts.length - 1];
        return parts[0] + " " + last.substring(0, 1).toUpperCase(Locale.ROOT) + ".";
    }
}