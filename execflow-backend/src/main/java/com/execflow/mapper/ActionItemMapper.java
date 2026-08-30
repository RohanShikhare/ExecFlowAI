package com.execflow.mapper;

import com.execflow.dto.response.ActionItemResponse;
import com.execflow.entity.ActionItem;
import org.springframework.stereotype.Component;

@Component
public class ActionItemMapper {

    public ActionItemResponse toResponse(ActionItem item) {
        return new ActionItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getOwner(),
                item.getDeadline(),
                item.getPriority(),
                item.getStatus(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
