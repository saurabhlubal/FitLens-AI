package com.fitlens.backend.repository;

import com.fitlens.backend.entity.Workout;
import com.fitlens.backend.entity.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutExerciseRepository
        extends JpaRepository<WorkoutExercise, Long> {

    List<WorkoutExercise> findByWorkout(Workout workout);

    void deleteByWorkout(Workout workout);
}