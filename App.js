import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import Quiz1 from './assets/quiz-questions.json';
import Quiz2 from './assets/quiz-questions2.json';
import Alle_Quizzen from './assets/alles.json';

const QUIZZES = { "Alle Quizzen": Alle_Quizzen, 
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

  const shuffleArray = (array) =>
    array.map(i => ({ i, r: Math.random() })).sort((a, b) => a.r - b.r).map(o => o.i);

  const loadQuiz = (key) => {
    const data = QUIZZES[key];
    const randomized = shuffleArray(data.questions).map(q => ({
      ...q,
      answers: shuffleArray(q.answers)
    }));
    setQuestions(randomized);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
  };

  const handleAnswer = (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === questions[current].correct) setScore(score + 1);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 800);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuestions([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Zwazje's Ultimate Quiz</Text>

      {!selectedQuiz && (
        <View style={styles.selection}>
          <Text style={styles.subtitle}>Choose a Quiz</Text>
          {Object.keys(QUIZZES).map(key => (
            <TouchableOpacity key={key} style={styles.quizButton} onPress={() => {
              setSelectedQuiz(key);
              loadQuiz(key);
            }}>
              <Text style={styles.quizButtonText}>{key.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {questions.length > 0 && !showResult && (
        <View style={styles.quizCard}>
          <Text style={styles.question}>{questions[current].question}</Text>

          {questions[current].image && (
            <Image source={{ uri: questions[current].image }} style={styles.image} resizeMode="cover" />
          )}

          {questions[current].answers.map((ans, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.answerButton,
                selected === ans &&
                  (ans === questions[current].correct
                    ? styles.correct
                    : styles.incorrect)
              ]}
              onPress={() => handleAnswer(ans)}
            >
              <Text style={styles.answerText}>{ans}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.progress}>
            {current + 1} / {questions.length}
          </Text>
        </View>
      )}

      {showResult && (
        <View style={styles.result}>
          <Text style={styles.resultText}>✅ Quiz Completed!</Text>
          <Text style={styles.scoreText}>Score: {score} / {questions.length}</Text>
          <TouchableOpacity style={styles.quizButton} onPress={resetQuiz}>
            <Text style={styles.quizButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e3c72',
    backgroundImage: 'linear-gradient(to right, #1e3c72, #2a5298)',
    minHeight: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    fontWeight: '600'
  },
  quizCard: {
    backgroundColor: '#ffffffee',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15
  },
  answerButton: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#999',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  correct: {
    backgroundColor: '#c8e6c9'
  },
  incorrect: {
    backgroundColor: '#ffcdd2'
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