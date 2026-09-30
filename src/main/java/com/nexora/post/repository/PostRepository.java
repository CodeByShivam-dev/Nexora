package com.nexora.post.repository;

import com.nexora.post.entity.Post;
import com.nexora.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p JOIN FETCH p.author a LEFT JOIN FETCH a.profile WHERE p.id = :id AND p.deleted = false")
    Optional<Post> findByIdWithAuthor(@Param("id") Long id);

    @Query("SELECT p FROM Post p JOIN FETCH p.author a LEFT JOIN FETCH a.profile WHERE p.deleted = false AND (p.visibility = 'PUBLIC' OR p.author.id = :userId OR (p.visibility = 'FOLLOWERS' AND p.author.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId))) AND p.author.id NOT IN (SELECT b.blocked.id FROM Block b WHERE b.blocker.id = :userId) ORDER BY p.createdAt DESC")
    Page<Post> findPersonalizedFeed(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author a LEFT JOIN FETCH a.profile WHERE p.deleted = false AND p.visibility = 'PUBLIC' ORDER BY p.createdAt DESC")
    Page<Post> findPublicFeed(Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author a LEFT JOIN FETCH a.profile WHERE p.author = :author AND p.deleted = false ORDER BY p.createdAt DESC")
    Page<Post> findByAuthor(@Param("author") User author, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author a LEFT JOIN FETCH a.profile WHERE p.deleted = false AND LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) AND p.visibility = 'PUBLIC' ORDER BY p.createdAt DESC")
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);
}
