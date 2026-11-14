package com.shopstream.coreapi.assistant;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Rule based FAQ matching. No AI and no external calls.
 * Score: +2 for each keyword phrase found in the message, +1 for each 3+ character
 * word shared with the FAQ question. The best FAQ with a score of at least MIN_SCORE wins.
 */
public final class AssistantMatcher {

    public static final int MIN_SCORE = 2;

    // Keep letters, combining marks (Bangla vowel signs are marks), digits and spaces.
    private static final Pattern NOISE = Pattern.compile("[^\\p{L}\\p{M}\\p{N}\\s]+");
    private static final Pattern SPACES = Pattern.compile("\\s+");

    public record Match(AssistantFaq faq, int score) {
    }

    private AssistantMatcher() {
    }

    public static String normalize(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        String cleaned = NOISE.matcher(lower).replaceAll(" ");
        return SPACES.matcher(cleaned).replaceAll(" ").trim();
    }

    /** "bn" if the text contains any Bangla character, otherwise "en". */
    public static String detectLanguage(String text) {
        boolean hasBangla = text.codePoints().anyMatch(cp -> cp >= 0x0980 && cp <= 0x09FF);
        return hasBangla ? "bn" : "en";
    }

    public static Optional<Match> best(String message, List<AssistantFaq> candidates) {
        String normalized = normalize(message);
        String padded = " " + normalized + " ";
        Set<String> words = new HashSet<>(Arrays.asList(normalized.split(" ")));

        Match best = null;
        for (AssistantFaq faq : candidates) {
            int score = score(padded, words, faq);
            if (score >= MIN_SCORE && (best == null || score > best.score())) {
                best = new Match(faq, score);
            }
        }
        return Optional.ofNullable(best);
    }

    static int score(String paddedMessage, Set<String> words, AssistantFaq faq) {
        int score = 0;

        for (String keyword : faq.keywordList()) {
            String k = normalize(keyword);
            if (!k.isEmpty() && paddedMessage.contains(" " + k + " ")) {
                score += 2;
            }
        }

        for (String question : List.of(faq.getQuestionBn(), faq.getQuestionEn())) {
            for (String word : normalize(question).split(" ")) {
                if (word.length() >= 3 && words.contains(word)) {
                    score += 1;
                }
            }
        }

        return score;
    }
}