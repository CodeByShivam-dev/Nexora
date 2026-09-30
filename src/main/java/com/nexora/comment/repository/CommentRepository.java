package com.nexora.comment.repository;

import com.nexora.comment.entity.Comment;
import com.nexora.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c JOIN FETCH c.author a LEFT JOIN FETCH a.profile WHERE c.post = :post AND c.parentComment IS NULL AND c.deleted = false ORDER BY c.createdAt ASC")
    Page<Comment> findRootCommentsByPost(@Param("post") Post post, Pageable pageable);

    @Query("SELECT c FROM Comment c JOIN FETCH c.author a LEFT JOIN FETCH a.profile WHERE c.parentComment.id = :parentId AND c.deleted = false ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);

    @Query("SELECT c FROM Comment c JOIN FETCH c.author a LEFT JOIN FETCH a.profile WHERE c.id = :id AND c.deleted = false")
    Optional<Comment> findByIdWithAuthor(@Param("id") Long id);

    long countByPostAndDeletedFalse(Post post);
}
