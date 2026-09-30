package com.nexora.hashtag.repository;

import com.nexora.hashtag.entity.Hashtag;
import com.nexora.hashtag.entity.PostHashtag;
import com.nexora.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostHashtagRepository extends JpaRepository<PostHashtag, Long> {

    List<PostHashtag> findByPost(Post post);

    @Query("SELECT ph.post FROM PostHashtag ph WHERE ph.hashtag.name = :hashtagName AND ph.post.deleted = false ORDER BY ph.post.createdAt DESC")
    Page<Post> findPostsByHashtagName(@Param("hashtagName") String hashtagName, Pageable pageable);

    void deleteByPost(Post post);
}
