package com.nexora.hashtag.repository;

import com.nexora.hashtag.entity.Hashtag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {

    Optional<Hashtag> findByNameIgnoreCase(String name);

    @Query("SELECT h FROM Hashtag h ORDER BY h.postsCount DESC")
    List<Hashtag> findTopTrending(Pageable pageable);

    @Query("SELECT h FROM Hashtag h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Hashtag> searchHashtags(@Param("query") String query, Pageable pageable);
}
