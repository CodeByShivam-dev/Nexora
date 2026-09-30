package com.nexora.bookmark.repository;

import com.nexora.bookmark.entity.Bookmark;
import com.nexora.post.entity.Post;
import com.nexora.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    boolean existsByPostAndUser(Post post, User user);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    Optional<Bookmark> findByPostAndUser(Post post, User user);

    void deleteByPostAndUser(Post post, User user);

    @Query("SELECT b.post FROM Bookmark b WHERE b.user = :user AND b.post.deleted = false ORDER BY b.createdAt DESC")
    Page<Post> findBookmarkedPostsByUser(@Param("user") User user, Pageable pageable);
}
