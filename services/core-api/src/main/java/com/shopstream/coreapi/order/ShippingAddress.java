package com.shopstream.coreapi.order;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Embeddable
public record ShippingAddress(
        @NotBlank @Size(max = 120) @Column(name = "ship_full_name", length = 120) String fullName,
        @NotBlank @Size(max = 30) @Column(name = "ship_phone", length = 30) String phone,
        @NotBlank @Size(max = 200) @Column(name = "ship_line1", length = 200) String line1,
        @Size(max = 200) @Column(name = "ship_line2", length = 200) String line2,
        @NotBlank @Size(max = 100) @Column(name = "ship_city", length = 100) String city,
        @Size(max = 100) @Column(name = "ship_state", length = 100) String state,
        @NotBlank @Size(max = 20) @Column(name = "ship_postal_code", length = 20) String postalCode,
        @NotBlank @Pattern(regexp = "^[A-Za-z]{2}$", message = "must be a 2-letter country code")
        @Column(name = "ship_country", length = 2) String country) {
}