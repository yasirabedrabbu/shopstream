package com.shopstream.coreapi.assistant;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssistantFaqRepository extends JpaRepository<AssistantFaq, UUID> {

    List<AssistantFaq> findAllByAudienceAndActiveTrueOrderByQuestionEnAsc(Audience audience);

    List<AssistantFaq> findAllByOrderByAudienceAscQuestionEnAsc();
}