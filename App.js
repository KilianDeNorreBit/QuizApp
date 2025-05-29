import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import Quiz1 from './assets/quiz-questions.json';
import Quiz2 from './assets/quiz-questions2.json';
import Alle_Quizzen from './assets/alles.json';

const QUIZZES = {
  "Alle Quizzen": Alle_Quizzen,
  "Quiz My Ass": Quiz1,
  "De Grote Mei Quiz": Quiz2
};

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [openAnswer, setOpenAnswer] = useState('');
  const [submittedOpenAnswer, setSubmittedOpenAnswer] = useState(false);
  const [openAnswerCorrect, setOpenAnswerCorrect] = useState(false);

  const [scoreboard, setScoreboard] = useState([]);

  const shuffleArray = (array) =>
    array
      .map((i) => ({ i, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((o) => o.i);

  const loadQuiz = (key) => {
    const data = QUIZZES[key];
    if (!data || !data.questions || data.questions.length === 0) {
      alert('Quiz data is empty or missing');
      return;
    }
    const randomized = shuffleArray(data.questions).map((q) => ({
      ...q,
      answers: q.answers ? shuffleArray(q.answers) : []
    }));

    setQuestions(randomized);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setOpenAnswer('');
    setSubmittedOpenAnswer(false);
    setOpenAnswerCorrect(false);
  };

  const isOpenQuestion = (question) => {
    return !question.answers || question.answers.length === 0;
  };

  const handleAnswer = (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === questions[current].correct) setScore(score + 1);
  };

  const handleOpenSubmit = () => {
    if (submittedOpenAnswer) return;
    const correctAnswer = questions[current].correct;
    // Handle if correct is array or string
    const correctAnswers = Array.isArray(correctAnswer)
      ? correctAnswer.map((a) => a.toLowerCase().trim())
      : [correctAnswer.toLowerCase().trim()];
    const userAnswer = openAnswer.toLowerCase().trim();

    const isCorrect = correctAnswers.includes(userAnswer);
    setOpenAnswerCorrect(isCorrect);
    if (isCorrect) setScore(score + 1);
    setSubmittedOpenAnswer(true);
  };

  const goToNextQuestion = () => {
    setSelected(null);
    setOpenAnswer('');
    setSubmittedOpenAnswer(false);
    setOpenAnswerCorrect(false);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
      setScoreboard((prev) => [...prev, { quiz: selectedQuiz, score, total: questions.length }]);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setOpenAnswer('');
    setSubmittedOpenAnswer(false);
    setOpenAnswerCorrect(false);
  };

  if (!selectedQuiz) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Zwazje's Ultimate Quiz</Text>
        <View style={styles.selection}>
          <Text style={styles.subtitle}>Choose a Quiz</Text>
          {Object.keys(QUIZZES).map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.quizButton}
              onPress={() => {
                setSelectedQuiz(key);
                loadQuiz(key);
              }}
            >
              <Text style={styles.quizButtonText}>{key.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
          {scoreboard.length > 0 && (
            <>
              <Text style={[styles.subtitle, { marginTop: 30 }]}>Past Scores</Text>
              {scoreboard.map((entry, idx) => (
                <Text key={idx} style={{ color: '#fff', marginVertical: 2 }}>
                  {entry.quiz}: {entry.score} / {entry.total}
                </Text>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  if (showResult) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Zwazje's Ultimate Quiz</Text>
        <View style={styles.result}>
          <Text style={styles.resultText}>✅ Quiz Completed!</Text>
          <Text style={styles.scoreText}>
            Score: {score} / {questions.length}
          </Text>
          <TouchableOpacity style={styles.quizButton} onPress={resetQuiz}>
            <Text style={styles.quizButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const currentQuestion = questions[current];
  const openQ = isOpenQuestion(currentQuestion);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Zwazje's Ultimate Quiz</Text>

      <View style={styles.quizCard}>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {currentQuestion.image && (
          <Image
            source={{ uri: currentQuestion.image }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {!openQ && (
          <>
            {currentQuestion.answers.map((ans, i) => {
              const isCorrect = ans === currentQuestion.correct;
              const isSelected = ans === selected;
              const btnStyle = [
                styles.answerButton,
                selected !== null && isSelected && (isCorrect ? styles.correct : styles.incorrect),
                selected !== null && !isSelected && isCorrect && styles.correct
              ];

              return (
                <TouchableOpacity
                  key={i}
                  style={btnStyle}
                  onPress={() => handleAnswer(ans)}
                  disabled={selected !== null}
                >
                  <Text style={styles.answerText}>{ans}</Text>
                </TouchableOpacity>
              );
            })}
            {selected !== null && (
              <TouchableOpacity style={[styles.quizButton, { marginTop: 10 }]} onPress={goToNextQuestion}>
                <Text style={styles.quizButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {openQ && (
          <>
            <TextInput
              style={[styles.input, submittedOpenAnswer && (openAnswerCorrect ? styles.correct : styles.incorrect)]}
              value={openAnswer}
              onChangeText={setOpenAnswer}
              editable={!submittedOpenAnswer}
              placeholder="Type your answer here"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!submittedOpenAnswer ? (
              <TouchableOpacity
                style={[styles.quizButton, { marginTop: 10 }]}
                onPress={handleOpenSubmit}
                disabled={openAnswer.trim().length === 0}
              >
                <Text style={styles.quizButtonText}>Submit</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={{ marginTop: 10, fontWeight: '600', color: openAnswerCorrect ? 'green' : 'red' }}>
                  {openAnswerCorrect ? 'Correct!' : `Wrong! Correct answer: ${Array.isArray(currentQuestion.correct) ? currentQuestion.correct.join(', ') : currentQuestion.correct}`}
                </Text>
                <TouchableOpacity style={[styles.quizButton, { marginTop: 10 }]} onPress={goToNextQuestion}>
                  <Text style={styles.quizButtonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        <Text style={styles.progress}>
          {current + 1} / {questions.length}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e3c72',
    minHeight: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 20
  },
  subtitle: {
    fontSize: 20,
    color: '#f0f0f0',
    marginBottom: 10
  },
  selection: {
    alignItems: 'center',
    marginBottom: 40
  },
  quizButton: {
    backgroundColor: '#00bcd4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
  quizCard: {
    backgroundColor: '#ffffffee',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center'
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center'
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15
  },
  answerButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#999',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 50,
    justifyContent: 'center'
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20
  },
  correct: {
    backgroundColor: '#c8e6c9'
  },
  incorrect: {
    backgroundColor: '#ffcdd2'
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%'
  },
  progress: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#555'
  },
  result: {
    alignItems: 'center',
    marginTop: 30
  },
  resultText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  scoreText: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20
  }
});
