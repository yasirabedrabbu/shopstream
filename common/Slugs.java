package com.shopstream.coreapi.common;

import java.text.Normalizer;
import java.util.Locale;

public final class Slugs {

    private Slugs() {
    }

    public static String slugify(String input) {
        return slugify(input, "store");
    }

    public static String slugify(String input, String fallback) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String slug = normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.length() > 100) {
            slug = slug.substring(0, 100).replaceAll("-+$", "");
        }
        return slug.isEmpty() ? fallback : slug;
    }
}