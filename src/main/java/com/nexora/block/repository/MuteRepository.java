package com.nexora.block.repository;

import com.nexora.block.entity.Mute;
import com.nexora.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MuteRepository extends JpaRepository<Mute, Long> {

    boolean existsByMuterAndMuted(User muter, User muted);

    Optional<Mute> findByMuterAndMuted(User muter, User muted);

    void deleteByMuterAndMuted(User muter, User muted);
}
