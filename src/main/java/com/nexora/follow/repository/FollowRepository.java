package com.nexora.follow.repository;

import com.nexora.follow.entity.Follow;
import com.nexora.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    void deleteByFollowerAndFollowing(User follower, User following);

    @Query("SELECT f.following FROM Follow f WHERE f.follower = :follower ORDER BY f.createdAt DESC")
    Page<User> findFollowingByUser(@Param("follower") User follower, Pageable pageable);

    @Query("SELECT f.follower FROM Follow f WHERE f.following = :following ORDER BY f.createdAt DESC")
    Page<User> findFollowersByUser(@Param("following") User following, Pageable pageable);

    long countByFollower(User follower);

    long countByFollowing(User following);
}
