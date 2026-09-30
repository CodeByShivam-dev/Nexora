package com.nexora.like.repository;

import com.nexora.like.entity.PostLike;
import com.nexora.post.entity.Post;
import com.nexora.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByPostAndUser(Post post, User user);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    Optional<PostLike> findByPostAndUser(Post post, User user);

    void deleteByPostAndUser(Post post, User user);

    long countByPost(Post post);
}
