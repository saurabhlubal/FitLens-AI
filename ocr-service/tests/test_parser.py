from app.services.parser import extract_exercise_name, parse_workout_text


class TestSingleExercise:
    def test_full_sentence(self):
        exercises = parse_workout_text("Squat 3 sets x 12 reps")
        assert len(exercises) == 1
        ex = exercises[0]
        assert ex.exerciseName == "Squat"
        assert ex.sets == 3
        assert ex.reps == 12

    def test_short_form_with_multiplication_sign(self):
        exercises = parse_workout_text("Squat 3 × 12")
        assert len(exercises) == 1
        ex = exercises[0]
        assert ex.exerciseName == "Squat"
        assert ex.sets == 3
        assert ex.reps == 12

    def test_compact_notation(self):
        exercises = parse_workout_text("Bicep Curl 3x10")
        assert len(exercises) == 1
        ex = exercises[0]
        assert ex.exerciseName == "Bicep Curl"
        assert ex.sets == 3
        assert ex.reps == 10

    def test_sets_of_reps(self):
        exercises = parse_workout_text("Push-up: 4 sets of 15")
        assert len(exercises) == 1
        ex = exercises[0]
        assert ex.exerciseName == "Push-up"
        assert ex.sets == 4
        assert ex.reps == 15


class TestMissingInformation:
    def test_name_only_returns_nulls(self):
        exercises = parse_workout_text("Squat")
        assert len(exercises) == 1
        ex = exercises[0]
        assert ex.exerciseName == "Squat"
        assert ex.sets is None
        assert ex.reps is None

    def test_name_is_not_normalized(self):
        exercises = parse_workout_text("Barbell Squat 3 x 8")
        assert len(exercises) == 1
        assert exercises[0].exerciseName == "Barbell Squat"

    def test_reps_only(self):
        exercises = parse_workout_text("Plank hold then 12 reps")
        assert len(exercises) == 1
        ex = exercises[0]
        assert ex.exerciseName == "Plank hold then"
        assert ex.sets is None
        assert ex.reps == 12

    def test_sets_only(self):
        exercises = parse_workout_text("Deadlift 5 sets")
        assert len(exercises) == 1
        ex = exercises[0]
        assert ex.exerciseName == "Deadlift"
        assert ex.sets == 5
        assert ex.reps is None

    def test_does_not_invent_values(self):
        exercises = parse_workout_text("Running")
        for ex in exercises:
            assert ex.sets is None or isinstance(ex.sets, int)
            assert ex.reps is None or isinstance(ex.reps, int)


class TestMultipleExercises:
    def test_two_lines(self):
        raw = "Squat 3 x 12\nPush-up 3 x 15"
        exercises = parse_workout_text(raw)
        assert len(exercises) == 2

        first, second = exercises
        assert (first.exerciseName, first.sets, first.reps) == ("Squat", 3, 12)
        assert (second.exerciseName, second.sets, second.reps) == (
            "Push-up",
            3,
            15,
        )

    def test_bulleted_list(self):
        raw = "- Squat 4 x 10\n* Bench Press 3 sets x 8 reps\n1. Plank 60 reps"
        exercises = parse_workout_text(raw)
        names = [ex.exerciseName for ex in exercises]
        assert "Squat" in names
        assert "Bench Press" in names

    def test_mixed_complete_and_incomplete_lines(self):
        raw = "Squat 3 x 12\nStretching\nPull-up 4 x 6"
        exercises = parse_workout_text(raw)
        assert len(exercises) == 3
        stretch = [e for e in exercises if e.exerciseName == "Stretching"][0]
        assert stretch.sets is None
        assert stretch.reps is None


class TestGarbageInput:
    def test_empty_text(self):
        assert parse_workout_text("") == []

    def test_noise_only(self):
        assert parse_workout_text("12345 ... !!!") == []

    def test_numbers_without_exercise_are_dropped(self):
        # A lone "3 x 12" has no exercise name; nothing usable to return.
        exercises = parse_workout_text("3 x 12")
        assert exercises == []


class TestNameCleaning:
    def test_strips_separators_and_leftover_keywords(self):
        name = extract_exercise_name("-- Incline Dumbbell Press :")
        assert name == "Incline Dumbbell Press"

    def test_none_for_pure_symbols(self):
        assert extract_exercise_name("- * :") is None
