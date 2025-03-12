import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaBook, FaChartLine, FaLightbulb, FaArrowRight, FaYoutube, FaCheckCircle, FaQuestionCircle, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../services/auth.jsx';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const Education = () => {
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [progress, setProgress] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const { user } = useAuth();

  const videos = {
    basics: [
      {
        id: 'basics-1',
        title: 'Introduction to Stock Markets',
        url: 'https://www.youtube.com/embed/Xn7KWR9EOGQ',
        description: 'Learn the basics of how stock markets work'
      },
      {
        id: 'basics-2',
        title: 'How to Read Stock Charts',
        url: 'https://www.youtube.com/embed/cQv9Yh7qGhw',
        description: 'Understanding technical analysis basics'
      }
    ],
    technical: [
      {
        id: 'tech-1',
        title: 'Technical Analysis Fundamentals',
        url: 'https://www.youtube.com/embed/eynxyoKgpng',
        description: 'Master technical analysis indicators'
      },
      {
        id: 'tech-2',
        title: 'Chart Patterns Explained',
        url: 'https://www.youtube.com/embed/QqqAXZt_DfY',
        description: 'Learn to identify trading patterns'
      }
    ],
    fundamental: [
      {
        id: 'fund-1',
        title: 'Fundamental Analysis Basics',
        url: 'https://www.youtube.com/embed/7f9HEj2Gk2M',
        description: 'Understanding company valuations'
      },
      {
        id: 'fund-2',
        title: 'Reading Financial Statements',
        url: 'https://www.youtube.com/embed/bZEJpYJ0KPY',
        description: 'How to analyze company reports'
      }
    ]
  };

  const quizzes = {
    basics: [
      {
        id: 'quiz-basics-1',
        title: 'Stock Market Basics Quiz',
        questions: [
          {
            question: 'What is a stock?',
            options: [
              'A type of bond',
              'Ownership in a company',
              'A mutual fund',
              'A savings account'
            ],
            correct: 1
          },
          {
            question: 'What is market capitalization?',
            options: [
              'The total number of shares',
              'The stock price',
              'Total value of a company\'s shares',
              'Company profits'
            ],
            correct: 2
          }
        ]
      }
    ],
    technical: [
      {
        id: 'quiz-tech-1',
        title: 'Technical Analysis Quiz',
        questions: [
          {
            question: 'What does RSI stand for?',
            options: [
              'Real Stock Index',
              'Relative Strength Index',
              'Risk Safety Indicator',
              'Return Stock Investment'
            ],
            correct: 1
          },
          {
            question: 'What is a bullish pattern?',
            options: [
              'Indicates potential price decrease',
              'Indicates potential price increase',
              'Shows market volatility',
              'Shows trading volume'
            ],
            correct: 1
          }
        ]
      }
    ]
  };

  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        const progressRef = doc(db, 'userProgress', user.uid);
        const progressDoc = await getDoc(progressRef);
        if (progressDoc.exists()) {
          setProgress(progressDoc.data());
        } else {
          await setDoc(progressRef, { completedLessons: [], quizScores: {} });
          setProgress({ completedLessons: [], quizScores: {} });
        }
      }
    };
    fetchProgress();
  }, [user]);

  const markLessonComplete = async (lessonId) => {
    if (!user) return;
    
    const newProgress = {
      ...progress,
      completedLessons: [...(progress.completedLessons || []), lessonId]
    };
    
    const progressRef = doc(db, 'userProgress', user.uid);
    await updateDoc(progressRef, newProgress);
    setProgress(newProgress);
  };

  const handleQuizSubmit = async (quizId, score) => {
    if (!user) return;
    
    const newProgress = {
      ...progress,
      quizScores: { ...(progress.quizScores || {}), [quizId]: score }
    };
    
    const progressRef = doc(db, 'userProgress', user.uid);
    await updateDoc(progressRef, newProgress);
    setProgress(newProgress);
    setQuizScore(score);
    setShowQuiz(false);
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setShowQuiz(true);
    setQuizScore(0);
  };

  const categories = {
    basics: {
      title: 'Market Basics',
      icon: FaBook,
      content: [
        {
          title: 'Understanding Stock Markets',
          description: 'Learn the fundamentals of how stock markets work, including trading hours, market participants, and basic concepts.',
          topics: ['What is a stock?', 'How do markets work?', 'Types of orders', 'Market vs. Limit orders']
        },
        {
          title: 'Reading Stock Charts',
          description: 'Master the basics of technical analysis and chart reading.',
          topics: ['Candlestick patterns', 'Support and resistance', 'Trading volume', 'Price trends']
        },
        {
          title: 'Trading Fundamentals',
          description: 'Understand the basic principles of trading and investment strategies.',
          topics: ['Risk management', 'Portfolio diversification', 'Entry and exit strategies', 'Position sizing']
        }
      ]
    },
    technical: {
      title: 'Technical Analysis',
      icon: FaChartLine,
      content: [
        {
          title: 'Technical Indicators',
          description: 'Learn about popular technical indicators and how to use them effectively.',
          topics: ['Moving averages', 'RSI', 'MACD', 'Bollinger Bands']
        },
        {
          title: 'Chart Patterns',
          description: 'Identify and understand common chart patterns for better trading decisions.',
          topics: ['Head and shoulders', 'Double tops/bottoms', 'Triangle patterns', 'Flag patterns']
        },
        {
          title: 'Advanced Technical Analysis',
          description: 'Master advanced concepts in technical analysis.',
          topics: ['Fibonacci retracements', 'Elliott Wave Theory', 'Volume analysis', 'Momentum indicators']
        }
      ]
    },
    fundamental: {
      title: 'Fundamental Analysis',
      icon: FaLightbulb,
      content: [
        {
          title: 'Financial Statements',
          description: 'Learn how to analyze company financial statements and key metrics.',
          topics: ['Balance sheet', 'Income statement', 'Cash flow statement', 'Key ratios']
        },
        {
          title: 'Valuation Methods',
          description: 'Understand different methods to value stocks and companies.',
          topics: ['P/E ratio', 'PEG ratio', 'DCF analysis', 'Comparable analysis']
        },
        {
          title: 'Economic Indicators',
          description: 'Learn about important economic indicators that affect the market.',
          topics: ['GDP', 'Inflation', 'Interest rates', 'Employment data']
        }
      ]
    }
  };

  const financialTerms = {
    'P/E Ratio': 'Price-to-Earnings ratio measures a company\'s stock price relative to its earnings per share.',
    'Market Cap': 'Total value of a company\'s outstanding shares.',
    'Dividend Yield': 'Annual dividend payments relative to stock price.',
    'Volume': 'Number of shares traded during a specific period.',
    'Beta': 'Measure of a stock\'s volatility compared to the overall market.',
    'Moving Average': 'Average of a stock\'s price over a specific time period.',
    'RSI': 'Relative Strength Index measures momentum and overbought/oversold conditions.',
    'MACD': 'Moving Average Convergence Divergence shows trend direction and momentum.',
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <FaGraduationCap className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Educational Resources
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Master the markets with our comprehensive educational content
          </p>
          {/* Progress Overview */}
          <div className="mt-4 flex justify-center items-center space-x-4">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                {progress.completedLessons?.length || 0} Lessons Completed
              </span>
            </div>
            <div className="flex items-center">
              <FaTrophy className="text-yellow-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                {Object.keys(progress.quizScores || {}).length} Quizzes Taken
              </span>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-8 space-x-4">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors
                ${selectedCategory === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
            >
              <category.icon className="h-5 w-5" />
              <span>{category.title}</span>
            </button>
          ))}
        </div>

        {/* Video Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Video Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos[selectedCategory].map((video) => (
              <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={video.url}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {video.description}
                  </p>
                  <button
                    onClick={() => markLessonComplete(video.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      progress.completedLessons?.includes(video.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {progress.completedLessons?.includes(video.id) ? (
                      <>
                        <FaCheckCircle className="inline mr-2" />
                        Completed
                      </>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categories[selectedCategory].content.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {item.description}
                </p>
                <ul className="space-y-2">
                  {item.topics.map((topic, topicIndex) => (
                    <li
                      key={topicIndex}
                      className="flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <FaArrowRight className="h-4 w-4 text-blue-500 mr-2" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Section */}
        {quizzes[selectedCategory]?.map((quiz) => (
          <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {quiz.title}
              </h3>
              <button
                onClick={() => startQuiz(quiz)}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                <FaQuestionCircle className="inline mr-2" />
                Start Quiz
              </button>
            </div>
            {progress.quizScores?.[quiz.id] !== undefined && (
              <div className="text-gray-600 dark:text-gray-400">
                Your best score: {progress.quizScores[quiz.id]}%
              </div>
            )}
          </div>
        ))}

        {/* Quiz Modal */}
        {showQuiz && currentQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentQuiz.title}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const answers = currentQuiz.questions.map((_, i) => 
                  parseInt(formData.get(`q${i}`))
                );
                const correct = answers.reduce((acc, ans, i) => 
                  acc + (ans === currentQuiz.questions[i].correct ? 1 : 0), 0
                );
                const score = Math.round((correct / currentQuiz.questions.length) * 100);
                handleQuizSubmit(currentQuiz.id, score);
              }}>
                {currentQuiz.questions.map((q, i) => (
                  <div key={i} className="mb-6">
                    <p className="text-gray-900 dark:text-white mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, j) => (
                        <label key={j} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`q${i}`}
                            value={j}
                            required
                            className="form-radio text-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowQuiz(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Financial Terms Glossary */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Financial Terms Glossary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(financialTerms).map(([term, definition], index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {term}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education; 