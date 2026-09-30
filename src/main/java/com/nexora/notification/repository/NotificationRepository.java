package com.nexora.notification.repository;

import com.nexora.notification.entity.Notification;
import com.nexora.notification.entity.NotificationType;
import com.nexora.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n JOIN FETCH n.receiver r LEFT JOIN FETCH n.actor a LEFT JOIN FETCH a.profile WHERE n.receiver = :receiver ORDER BY n.createdAt DESC")
    Page<Notification> findByReceiverOrderByCreatedAtDesc(@Param("receiver") User receiver, Pageable pageable);

    long countByReceiverAndReadFalse(User receiver);

    Optional<Notification> findFirstByReceiverAndActorAndTypeAndTargetIdAndTargetType(
            User receiver, User actor, NotificationType type, Long targetId, String targetType
    );

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.receiver = :receiver AND n.read = false")
    void markAllAsRead(@Param("receiver") User receiver);
}
