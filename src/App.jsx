import { useEffect, useState, useCallback } from 'react'
import './App.css'

// Language translations
const translations = {
  he: {
    title: 'חידון וידאו אינטראקטיבי',
    subtitle: 'בדוק ידע וחשוף רגעי מקור מדויקים מיידית.',
    chooseQuiz: 'בחר את החידון שלך',
    chooseDescription: 'בחר חידון כדי לבדוק את הידע שלך. כל אחד כולל משוב מיידי עם הפניות לווידאו וחותמות זמן.',
    readyToBegin: 'מוכן להתחיל?',
    readyDescription: 'כל שאלה מפנה לחותמת הזמן המדויקת של הווידאו וציטוט תומך לאחר הבחירה שלך. שאלות ותשובות מעורבבות למידה טובה יותר. לחץ התחל כשאתה מוכן.',
    startQuiz: 'התחל חידון',
    shuffleStart: '🔀 ערבב והתחל',
    chooseDifferent: '← בחר חידון אחר',
    question: 'שאלה',
    correct: 'נכון!',
    correctMessage: 'יפה מאוד.',
    incorrect: 'לא ממש.',
    incorrectMessage: 'התשובה הנכונה:',
    sourceVideo: 'וידאו מקור:',
    at: 'ב-',
    nextQuestion: 'שאלה הבאה ←',
    finish: 'סיום ←',
    restart: 'התחל מחדש',
    chooseQuizButton: '← בחר חידון',
    quit: 'יציאה',
    quizSummary: 'סיכום החידון',
    summaryText: 'ענית נכון על {correct} מתוך {total} ({percentage}%). סקור למטה:',
    retakeQuiz: 'בצע חידון שוב',
    newShuffle: '🔀 ערבוב חדש',
    correctPill: 'נכון',
    incorrectPill: 'שגוי',
    yourAnswer: 'שלך:',
    answer: 'תשובה:',
    video: 'וידאו:',
    footer: 'RB',
    sampleQuiz: 'חידון לדוגמה',
    sampleDescription: 'שאלות דמו בסיסיות עם הנרי וארכיטקטורה',
    bigDataQuiz: 'חידון ביג דאטה',
    bigDataDescription: 'שאלות מתקדמות על מושגי ביג דאטה וטכניקות',
    nlpQuiz: 'חידון NLP',
    nlpDescription: 'יסודות עיבוד שפה טבעית ויישומים',
    bigDataExamQuiz: 'מבחן ביג דאטה',
    bigDataExamDescription: 'שאלות משוחזרות ממבחן בביג דאטה',
    language: 'שפה',
    sourcePDF: 'מקור PDF:',
    page: 'עמוד:',
    configureQuiz: 'הגדרות חידון',
    questionRange: 'טווח שאלות',
    numberOfQuestions: 'מספר שאלות נבחר',
    from: 'מתוך',
    shuffleQuestions: 'ערבב שאלות',
    shuffleDescription: 'השאלות והתשובות יוצגו בסדר אקראי.',
    start: 'התחל',
    to: 'עד'
  },
  en: {
    title: 'Interactive Video Quiz',
    subtitle: 'Assess knowledge & surface exact source moments instantly.',
    chooseQuiz: 'Choose Your Quiz',
    chooseDescription: 'Select a quiz to test your knowledge. Each includes instant feedback with video references and timestamps.',
    readyToBegin: 'Ready to begin?',
    readyDescription: 'Each question references the precise video timestamp and supporting quote after your choice. Questions and answers are randomized for better learning. Click start when you\'re ready.',
    startQuiz: 'Start Quiz',
    shuffleStart: '🔀 Shuffle & Start',
    chooseDifferent: '← Choose Different Quiz',
    question: 'QUESTION',
    correct: 'Correct!',
    correctMessage: 'Nicely done.',
    incorrect: 'Not quite.',
    incorrectMessage: 'Correct answer:',
    sourceVideo: 'Source Video:',
    at: 'at',
    nextQuestion: 'Next Question →',
    finish: 'Finish →',
    restart: 'Restart',
    chooseQuizButton: '← Choose Quiz',
    quit: 'Quit',
    quizSummary: 'Quiz Summary',
    summaryText: 'You answered {correct} of {total} correctly ({percentage}%). Review below:',
    retakeQuiz: 'Retake Quiz',
    newShuffle: '🔀 New Shuffle',
    correctPill: 'Correct',
    incorrectPill: 'Incorrect',
    yourAnswer: 'Your:',
    answer: 'Ans:',
    video: 'Video:',
    footer: 'RB',
    sampleQuiz: 'Sample Quiz',
    sampleDescription: 'Basic demo questions with Henry and architecture',
    bigDataQuiz: 'Big Data Quiz',
    bigDataDescription: 'Advanced questions on big data concepts and techniques',
    nlpQuiz: 'NLP Quiz',
    nlpDescription: 'Natural Language Processing fundamentals and applications',
    bigDataExamQuiz: 'Big Data Exam',
    bigDataExamDescription: 'Reconstructed questions from a Big Data exam',
    language: 'Language',
    sourcePDF: 'Source PDF:',
    page: 'Page:',
    configureQuiz: 'Configure Quiz',
    questionRange: 'Question Range',
    numberOfQuestions: 'Number of questions',
    from: 'from',
    shuffleQuestions: 'Shuffle Questions',
    shuffleDescription: 'Questions and their answers will be in a random order.',
    start: 'Start',
    to: 'to'
  }
}

// JSDoc Types for clarity / editor intellisense
/** @typedef {{id:string,text:string}} QuizOption */
/** @typedef {{videoName:string,time:string,quote:string}} QuizReference */
/** @typedef {{id:number,question:string,options:QuizOption[],correctOptionId:string,reference:QuizReference}} QuizQuestion */

// Utility functions for shuffling
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function shuffleQuestionsAndOptions(questions) {
  if (!questions) return null
  
  // Shuffle the questions order
  const shuffledQuestions = shuffleArray(questions)
  
  // For each question, shuffle the options
  return shuffledQuestions.map(question => ({
    ...question,
    options: shuffleArray(question.options)
  }))
}

function useQuizData(url) {
  const [allQuestions, setAllQuestions] = useState(/** @type {QuizQuestion[]|null} */(null))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!url) {
      setAllQuestions(null)
      setError('')
      return
    }
    let active = true
    setLoading(true)
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load quiz data (${r.status}): ${r.statusText}`)
        return r.json()
      })
      .then(json => {
        if (active) {
          // Store the original, unshuffled questions
          setAllQuestions(json)
          setError('')
        }
      })
      .catch(e => {
        if (active) setError(e.message || 'Error')
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [url])

  return { allQuestions, loading, error }
}

const LETTERS = ['A','B','C','D','E','F','G','H']

function App() {
  const [language, setLanguage] = useState('he') // Default to Hebrew
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  
  // Fix URL path for both localhost and production
  const getQuizUrl = (filename) => {
    return `${import.meta.env.BASE_URL}${filename}`
  }
  
  const { allQuestions, loading, error } = useQuizData(selectedQuiz ? getQuizUrl(selectedQuiz) : null)
  
  // State for the active quiz questions, after user configuration
  const [questions, setQuestions] = useState(null)

  // Quiz configuration state
  const [questionRange, setQuestionRange] = useState([1, 1])
  const [numQuestions, setNumQuestions] = useState(1)
  const [shuffle, setShuffle] = useState(true)

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState([]) // {questionId, chosenId, correct:boolean}
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [started, setStarted] = useState(false)

  const t = translations[language] // Current language translations
  const isRTL = language === 'he'

  // When allQuestions are loaded, update the configuration defaults
  useEffect(() => {
    if (allQuestions) {
      const max = allQuestions.length
      setQuestionRange([1, max])
      setNumQuestions(max)
    }
  }, [allQuestions])

  const handleStartQuiz = () => {
    if (!allQuestions) return
    
    // 1. Slice the questions based on the selected range (adjusting for 0-based index)
    let selectedQuestions = allQuestions.slice(questionRange[0] - 1, questionRange[1])

    // 2. Take the desired number of questions from the sliced pool
    selectedQuestions = selectedQuestions.slice(0, numQuestions)

    // 3. Shuffle if the user wants to
    if (shuffle) {
      selectedQuestions = shuffleQuestionsAndOptions(selectedQuestions)
    } else {
      // Still shuffle the options within each question for fairness
      selectedQuestions = selectedQuestions.map(q => ({ ...q, options: shuffleArray(q.options) }))
    }
    
    setQuestions(selectedQuestions)
    setStarted(true)
  }

  const total = questions?.length || 0
  const current = questions ? questions[index] : null
  const progress = total ? ((index + (revealed?1:0)) / total) * 100 : 0
  const done = total > 0 && answers.length === total

  const handleSelect = (optionId) => {
    if(!current || revealed) return
    setSelected(optionId)
    setRevealed(true)
    const correct = optionId === current.correctOptionId
    setAnswers(prev => [...prev, { questionId: current.id, chosenId: optionId, correct }])
  }

  const goNext = useCallback(() => {
    setSelected(null)
    setRevealed(false)
    setIndex(i => i + 1)
  }, [])

  const restart = () => {
    setAnswers([])
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setStarted(false)
    // Keep the same configuration, just restart the quiz
    handleStartQuiz()
  }

  const resetToQuizSelection = () => {
    setSelectedQuiz(null)
    setQuestions(null)
    setAnswers([])
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setStarted(false)
  }

  const resetToConfig = () => {
    setQuestions(null)
    setAnswers([])
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setStarted(false)
  }

  useEffect(() => { // scroll into view on question change
    if(revealed === false && selected === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [index])

  const correctCount = answers.filter(a=>a.correct).length

  const quizOptions = [
    { id: 'test.json', name: t.sampleQuiz, description: t.sampleDescription },
    { id: 'bigData.json', name: t.bigDataQuiz, description: t.bigDataDescription },
    { id: 'NNNLP.json', name: t.nlpQuiz, description: t.nlpDescription },
    { id: 'bigdata_exam_questions_80.json', name: t.bigDataExamQuiz, description: t.bigDataExamDescription }
  ]

  return (
    <div className={`quiz-app fade-in ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="quiz-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem'}}>
          <div>
            <h1>{t.title}</h1>
            <div className="subtitle">{t.subtitle}</div>
          </div>
          <div className="language-switcher">
            <label htmlFor="language-select" style={{fontSize:'.8rem', marginRight:'.5rem'}}>{t.language}:</label>
            <select 
              id="language-select"
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="he">עברית</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        {total > 0 && !done && (
          <div>
            <div className="progress-shell" aria-label="Progress">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-label">{index + (revealed?1:0)} / {total} {revealed? (isRTL ? 'נענו' : 'answered') : (isRTL ? 'בתהליך' : 'in progress')}</div>
          </div>
        )}
      </header>

      {loading && <div className="card"><p>{isRTL ? 'טוען חידון...' : 'Loading quiz…'}</p></div>}
      {error && <div className="card"><p style={{color:'var(--danger)'}}>{isRTL ? 'שגיאה:' : 'Error:'} {error}</p></div>}

      {!selectedQuiz && !loading && (
        <div className="card fade-in">
          <h2>{t.chooseQuiz}</h2>
          <p style={{marginTop:'0.6rem', lineHeight:1.4, marginBottom:'1.5rem'}}>{t.chooseDescription}</p>
          <div style={{display:'grid', gap:'1rem'}}>
            {quizOptions.map(quiz => (
              <button 
                key={quiz.id}
                className="option-btn" 
                onClick={() => setSelectedQuiz(quiz.id)}
                style={{padding:'1.2rem', textAlign: isRTL ? 'right' : 'left'}}
              >
                <div>
                  <div style={{fontWeight:600, marginBottom:'.3rem'}}>{quiz.name}</div>
                  <div style={{fontSize:'.85rem', opacity:.8}}>{quiz.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && selectedQuiz && !started && allQuestions && (
        <div className="card fade-in">
          <h2>{t.configureQuiz}</h2>
          
          <div className="config-item">
            <label htmlFor="num-questions-slider">{t.numberOfQuestions}: <strong>{numQuestions}</strong> {t.from} {questionRange[1] - questionRange[0] + 1}</label>
            <input 
              type="range" 
              id="num-questions-slider"
              min="1"
              max={questionRange[1] - questionRange[0] + 1}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="config-item">
            <label>{t.questionRange}: <strong>{questionRange[0]}</strong> {t.to} <strong>{questionRange[1]}</strong></label>
            <div className="range-inputs">
              <input 
                type="number" 
                min="1"
                max={allQuestions.length}
                value={questionRange[0]}
                onChange={(e) => {
                  const start = Math.max(1, Number(e.target.value));
                  const end = Math.max(start, questionRange[1]);
                  setQuestionRange([start, end]);
                  if (numQuestions > (end - start + 1)) {
                    setNumQuestions(end - start + 1);
                  }
                }}
              />
              <input 
                type="number" 
                min={questionRange[0]}
                max={allQuestions.length}
                value={questionRange[1]}
                onChange={(e) => {
                  const end = Math.min(allQuestions.length, Number(e.target.value));
                  const start = Math.min(end, questionRange[0]);
                  setQuestionRange([start, end]);
                  if (numQuestions > (end - start + 1)) {
                    setNumQuestions(end - start + 1);
                  }
                }}
              />
            </div>
          </div>

          <div className="config-item">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
              />
              <span className="switch"></span>
              <span className="label-text">{t.shuffleQuestions}</span>
            </label>
            <p className="config-description">{t.shuffleDescription}</p>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={handleStartQuiz}>{t.start}</button>
            <button className="btn outline" onClick={resetToQuizSelection}>{t.chooseDifferent}</button>
          </div>
        </div>
      )}

      {started && current && !done && (
        <div key={current.id} className="card fade-in" aria-live="polite">
          <h2>
            <span style={{opacity:.55, fontWeight:500, fontSize:'0.8rem', letterSpacing:'1px'}}>{t.question} {index+1}</span><br/>
            <span className="question-text">{current.question}</span>
          </h2>
          <ul className="options" role="listbox" aria-label="Answer options">
            {current.options.map((opt, i) => {
              const isSelected = selected === opt.id
              const isCorrect = opt.id === current.correctOptionId
              const stateClass = revealed ? (isCorrect ? 'correct' : (isSelected ? 'incorrect' : '')) : (isSelected ? 'active' : '')
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    className={`option-btn ${stateClass} ${revealed ? 'disabled':''}`}
                    onClick={() => handleSelect(opt.id)}
                    disabled={revealed}
                    aria-selected={isSelected}
                  >
                    <span className="option-text">{opt.text}</span>
                    <span className="option-index">{LETTERS[i] || i+1}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {revealed && (
            <div className={`feedback ${selected === current.correctOptionId ? 'correct':'incorrect'}`}>
              {selected === current.correctOptionId ? (
                <p style={{margin:0}}><strong>{t.correct}</strong> {t.correctMessage}</p>
              ) : (
                <p style={{margin:0}}><strong>{t.incorrect}</strong> {t.incorrectMessage} {current.options.find(o=>o.id===current.correctOptionId)?.text}</p>
              )}
              <div className="reference">
                {current.reference.videoName ? (
                  <>
                    <div><strong>{t.sourceVideo}</strong> <code>{current.reference.videoName}</code> {t.at} <code>{current.reference.time}</code></div>
                    <div className="quote">“{current.reference.quote}”</div>
                  </>
                ) : (
                  <>
                    <div><strong>{t.sourcePDF}</strong> <code>{current.reference.sourcePDF}</code></div>
                    {current.reference.pageHint && <div><strong>{t.page}</strong> {current.reference.pageHint}</div>}
                    {current.reference.note && <div className="quote">{current.reference.note}</div>}
                  </>
                )}
              </div>
              <div className="actions" style={{marginTop:'1.25rem'}}>
                {index < total - 1 && <button className="btn primary" onClick={goNext}>{t.nextQuestion}</button>}
                {index === total -1 && <button className="btn primary" onClick={goNext}>{t.finish}</button>}
                <button className="btn outline" onClick={resetToConfig}>{t.restart}</button>
                <button className="btn outline" onClick={resetToQuizSelection}>{t.chooseQuizButton}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="card fade-in" aria-live="polite">
          <h2>{t.quizSummary}</h2>
            <p style={{marginTop:'0.4rem'}}>{t.summaryText.replace('{correct}', correctCount).replace('{total}', total).replace('{percentage}', Math.round((correctCount/total)*100))}</p>
            <div className="summary-grid">
              {questions.map(q => {
                const userAnswer = answers.find(a=>a.questionId===q.id)
                const correct = userAnswer?.correct
                const chosenOpt = q.options.find(o=>o.id===userAnswer?.chosenId)
                const correctOpt = q.options.find(o=>o.id===q.correctOptionId)
                return (
                  <div key={q.id} className={`summary-item ${correct? 'correct':'incorrect'}`}> 
                    <h3>{q.question}</h3>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'.5rem', marginBottom:'.5rem'}}>
                      <span className={`pill ${correct?'good':'bad'}`}>{correct ? t.correctPill : t.incorrectPill}</span>
                      {chosenOpt && !correct && <span className='pill'>{t.yourAnswer} {chosenOpt.text}</span>}
                      {correctOpt && <span className='pill good'>{t.answer} {correctOpt.text}</span>}
                    </div>
                    <div className="reference">
                      {q.reference.videoName ? (
                        <>
                          <div><strong>{t.video}</strong> <code>{q.reference.videoName}</code> @ <code>{q.reference.time}</code></div>
                          <div className="quote">“{q.reference.quote}”</div>
                        </>
                      ) : (
                        <>
                          <div><strong>{t.sourcePDF}</strong> <code>{q.reference.sourcePDF}</code></div>
                          {q.reference.pageHint && <div><strong>{t.page}</strong> {q.reference.pageHint}</div>}
                          {q.reference.note && <div className="quote">{q.reference.note}</div>}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="actions" style={{marginTop:'2rem'}}>
              <button className="btn primary" onClick={restart}>{t.retakeQuiz}</button>
              <button className="btn outline" onClick={resetToConfig}>{t.newShuffle}</button>
              <button className="btn outline" onClick={resetToQuizSelection}>{t.chooseDifferent}</button>
            </div>
        </div>
      )}

      {!loading && !error && started && !done && !revealed && (
        <div className="actions" style={{justifyContent:'flex-end'}}>
          <button className="btn danger" onClick={resetToConfig}>{t.quit}</button>
          <button className="btn outline" onClick={resetToQuizSelection}>{t.chooseQuizButton}</button>
        </div>
      )}

      <footer style={{textAlign:'center', opacity:.5, fontSize:'.65rem', marginTop:'2rem'}}>
        {t.footer}
      </footer>
    </div>
  )
}

export default App
