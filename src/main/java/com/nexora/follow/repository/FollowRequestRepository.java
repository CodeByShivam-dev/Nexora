package com.nexora.follow.repository;

import com.nexora.follow.entity.FollowRequest;
import com.nexora.follow.entity.FollowRequestStatus;
import com.nexora.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {

    Optional<FollowRequest> findBySenderAndReceiver(User sender, User receiver);

    Page<FollowRequest> findByReceiverAndStatus(User receiver, FollowRequestStatus status, Pageable pageable);

    boolean existsBySenderAndReceiverAndStatus(User sender, User receiver, FollowRequestStatus status);
}
