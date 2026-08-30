package com.execflow.dto.response;

import com.execflow.entity.ActionStatus;
import com.execflow.entity.Priority;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ActionItemResponse(
        UUID id,
        String title,
        String description,
        String owner,
        LocalDate deadline,
        Priority priority,
        ActionStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
