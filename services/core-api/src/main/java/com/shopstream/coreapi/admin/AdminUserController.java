package com.shopstream.coreapi.admin;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.UserStatus;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    /** GET /api/v1/admin/users?role=VENDOR&status=ACTIVE&q=rahim&page=0&size=20 */
    @GetMapping
    public PageResponse<AdminUserResponse> list(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by("createdAt").descending());
        Page<AdminUserResponse> result = service.list(role, status, q, pageable);
        return PageResponse.of(result, r -> r);
    }

    /** PATCH /api/v1/admin/users/{id}/status  body: {"status":"SUSPENDED"} */
    @PatchMapping("/{id}/status")
    public AdminUserResponse changeStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return service.changeStatus(UUID.fromString(jwt.getSubject()), id, request.status());
    }
}