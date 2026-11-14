package com.shopstream.coreapi.catalog;

import java.util.ArrayList;
import java.util.List;

/** Small RFC 4180 parser: quoted fields, escaped quotes, commas and line breaks inside quotes, CRLF or LF. */
public final class CsvParser {

    private CsvParser() {
    }

    public static List<List<String>> parse(String text) {
        String src = text.startsWith("\uFEFF") ? text.substring(1) : text;

        List<List<String>> rows = new ArrayList<>();
        List<String> row = new ArrayList<>();
        StringBuilder cell = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < src.length(); i++) {
            char c = src.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < src.length() && src.charAt(i + 1) == '"') {
                        cell.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    cell.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == ',') {
                row.add(cell.toString());
                cell.setLength(0);
            } else if (c == '\n' || c == '\r') {
                if (c == '\r' && i + 1 < src.length() && src.charAt(i + 1) == '\n') {
                    i++;
                }
                row.add(cell.toString());
                cell.setLength(0);
                rows.add(row);
                row = new ArrayList<>();
            } else {
                cell.append(c);
            }
        }
        if (cell.length() > 0 || !row.isEmpty()) {
            row.add(cell.toString());
            rows.add(row);
        }
        return rows;
    }
}
