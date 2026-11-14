package com.shopstream.coreapi.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class CsvParserTest {

    @Test
    void parsesPlainRows() {
        List<List<String>> rows = CsvParser.parse("a,b,c\n1,2,3\n");

        assertThat(rows).containsExactly(List.of("a", "b", "c"), List.of("1", "2", "3"));
    }

    @Test
    void handlesQuotedCommasAndEscapedQuotes() {
        List<List<String>> rows = CsvParser.parse("name,note\n\"Shoe, red\",\"He said \"\"hi\"\"\"\n");

        assertThat(rows.get(1)).containsExactly("Shoe, red", "He said \"hi\"");
    }

    @Test
    void handlesWindowsLineBreaksAndBom() {
        List<List<String>> rows = CsvParser.parse("\uFEFFa,b\r\n1,2\r\n");

        assertThat(rows).containsExactly(List.of("a", "b"), List.of("1", "2"));
    }

    @Test
    void keepsLineBreakInsideQuotes() {
        List<List<String>> rows = CsvParser.parse("a\n\"line1\nline2\"\n");

        assertThat(rows.get(1)).containsExactly("line1\nline2");
    }

    @Test
    void lastRowWithoutTrailingNewlineIsKept() {
        List<List<String>> rows = CsvParser.parse("a,b\n1,2");

        assertThat(rows).hasSize(2);
        assertThat(rows.get(1)).containsExactly("1", "2");
    }
}
