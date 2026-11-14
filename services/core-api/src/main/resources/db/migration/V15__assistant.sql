-- V15: assistant FAQ (rule based, no AI) and anonymous question log
CREATE TABLE assistant_faqs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audience    VARCHAR(20)   NOT NULL,
    question_bn VARCHAR(500)  NOT NULL,
    question_en VARCHAR(500)  NOT NULL,
    answer_bn   VARCHAR(2000) NOT NULL,
    answer_en   VARCHAR(2000) NOT NULL,
    keywords    VARCHAR(1000) NOT NULL DEFAULT '',
    link        VARCHAR(300),
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT ck_assistant_faqs_audience CHECK (audience IN ('CUSTOMER', 'VENDOR'))
);

CREATE INDEX ix_assistant_faqs_audience_active ON assistant_faqs (audience, active);

CREATE TABLE assistant_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audience       VARCHAR(20)  NOT NULL,
    lang           VARCHAR(2)   NOT NULL,
    question       VARCHAR(500) NOT NULL,
    matched_faq_id UUID,
    outcome        VARCHAR(20)  NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_assistant_logs_created_at ON assistant_logs (created_at);