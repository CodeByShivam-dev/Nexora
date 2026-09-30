package com.nexora.user.repository;

import com.nexora.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:identifier) OR LOWER(u.email) = LOWER(:identifier)")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.profile.displayName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.id <> :userId AND u.status = 'ACTIVE' AND u.id NOT IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId) AND u.id NOT IN (SELECT b.blocked.id FROM Block b WHERE b.blocker.id = :userId)")
    List<User> findSuggestedUsers(@Param("userId") Long userId, Pageable pageable);
}
