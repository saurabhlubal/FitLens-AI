package com.fitlens.backend.repository;

import com.fitlens.backend.entity.User;
import com.fitlens.backend.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findByUser(User user);

    List<Workout> findByUserId(Long userId);
}