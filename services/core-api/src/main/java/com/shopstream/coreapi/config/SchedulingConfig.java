package com.shopstream.coreapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Turns on @Scheduled jobs. */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}