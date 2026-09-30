package com.nexora.message.entity;

import com.nexora.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation extends BaseEntity {

    @Column(name = "title", length = 150)
    private String title;

    @Column(name = "is_group", nullable = false)
    @Builder.Default
    private boolean group = false;
}
