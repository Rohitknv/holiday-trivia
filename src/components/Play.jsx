import { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Zoom,
    Collapse,
    Paper,
    Fade,
    Slide,
    Chip,
    LinearProgress,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import categoriesData from '../data/categories.json';
import QuestionDisplay from './QuestionDisplay';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AnimatedScore from './AnimatedScore';
import { keyframes } from '@mui/system';
import Confetti from 'react-confetti';
import CategoryTransition from './CategoryTransition';

const LEADERBOARD_TRANSITION_TIME = 10000; // 10 seconds in milliseconds

// Add celebration animation
const celebrationBounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const Play = ({ teams, setTeams }) => {
    const [selectedCategories, setSelectedCategories] = useState(() => {
        const saved = localStorage.getItem('selected_categories');
        return saved ? JSON.parse(saved) : [];
    });
    const [turnHistory, setTurnHistory] = useState(() => {
        const saved = localStorage.getItem('turn_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [confirmReset, setConfirmReset] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [showingTransitionLeaderboard, setShowingTransitionLeaderboard] = useState(false);
    const [transitionTimeRemaining, setTransitionTimeRemaining] = useState(LEADERBOARD_TRANSITION_TIME);
    const [completedQuestions, setCompletedQuestions] = useState(() => {
        const saved = localStorage.getItem('completed_questions');
        return new Set(saved ? JSON.parse(saved) : []);
    });
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Add debug logging for completedQuestions changes
    useEffect(() => {
        console.log('CompletedQuestions updated:', Array.from(completedQuestions));
        localStorage.setItem('completed_questions',
            JSON.stringify(Array.from(completedQuestions))
        );
    }, [completedQuestions]);

    // Add effect for countdown
    useEffect(() => {
        if (showingTransitionLeaderboard && transitionTimeRemaining > 0) {
            const timer = setInterval(() => {
                setTransitionTimeRemaining(prev => Math.max(0, prev - 100)); // Update every 100ms
            }, 100);
            return () => clearInterval(timer);
        }
    }, [showingTransitionLeaderboard, transitionTimeRemaining]);

    // Enhanced team selection logic with tiebreakers
    const selectingTeam = useMemo(() => {
        if (teams.length === 0) return null;

        return teams.reduce((lowest, current) => {
            // First, compare scores
            if (current.score < lowest.score) return current;
            if (current.score > lowest.score) return lowest;

            // If scores are tied, check who picked most recently
            const currentLastPick = turnHistory.findLastIndex(id => id === current.id);
            const lowestLastPick = turnHistory.findLastIndex(id => id === lowest.id);

            // If one team hasn't picked yet, they go first
            if (currentLastPick === -1) return current;
            if (lowestLastPick === -1) return lowest;

            // Team that picked most recently loses the tiebreaker
            if (currentLastPick > lowestLastPick) return lowest;
            if (currentLastPick < lowestLastPick) return current;

            // If still tied, sort alphabetically
            return current.name.localeCompare(lowest.name) < 0 ? current : lowest;
        }, teams[0]);
    }, [teams, turnHistory]);

    const handleCategoryClick = (categoryId) => {
        const category = categoriesData.categories.find(c => c.id === categoryId);
        console.log('Category clicked:', category.name);
        console.log('Current completed questions:', Array.from(completedQuestions));

        // Find first unanswered question in this category
        const firstUnansweredIndex = category.questions.findIndex(question => {
            const isComplete = completedQuestions.has(question.id);
            console.log(`Question ${question.id}: ${isComplete ? 'complete' : 'incomplete'}`);
            return !isComplete;
        });

        console.log('First unanswered question index:', firstUnansweredIndex);

        // If all questions are complete, category is unclickable
        if (firstUnansweredIndex === -1) {
            console.log('Category is complete, ignoring click');
            return;
        }

        // Set current question to first unanswered question
        setCurrentQuestion(category.questions[firstUnansweredIndex]);
        setQuestionIndex(firstUnansweredIndex);
        console.log('Setting current question to:', category.questions[firstUnansweredIndex].id);

        // Add to selected categories if not already there
        if (!selectedCategories.includes(categoryId)) {
            const newSelected = [...selectedCategories, categoryId];
            setSelectedCategories(newSelected);
            localStorage.setItem('selected_categories', JSON.stringify(newSelected));
        }
    };

    const handleQuestionComplete = () => {
        if (isTransitioning) return;

        console.log('Completing question:', currentQuestion.id);

        // Mark current question as completed
        const newCompletedQuestions = new Set(completedQuestions);
        newCompletedQuestions.add(currentQuestion.id);
        console.log('New completed questions:', Array.from(newCompletedQuestions));
        setCompletedQuestions(newCompletedQuestions);

        const currentCategory = categoriesData.categories.find(
            c => c.questions.includes(currentQuestion)
        );

        // Log category completion status
        const isCategoryComplete = currentCategory.questions.every(question =>
            newCompletedQuestions.has(question.id)
        );
        console.log('Category status:', {
            name: currentCategory.name,
            complete: isCategoryComplete,
            totalQuestions: currentCategory.questions.length,
            completedQuestions: currentCategory.questions.filter(q =>
                newCompletedQuestions.has(q.id)
            ).length
        });

        const nextIndex = questionIndex + 1;

        if (nextIndex < currentCategory.questions.length) {
            // Continue to next question in category
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentQuestion(currentCategory.questions[nextIndex]);
                setQuestionIndex(nextIndex);
                setIsTransitioning(false);
            }, 300);
        } else {
            // Show transition and return to category selection
            setIsTransitioning(true);
            setShowingTransitionLeaderboard(true);
            setTransitionTimeRemaining(LEADERBOARD_TRANSITION_TIME);

            setTimeout(() => {
                setShowingTransitionLeaderboard(false);
                setCurrentQuestion(null);
                setQuestionIndex(0);
                setTransitionTimeRemaining(LEADERBOARD_TRANSITION_TIME);
                setIsTransitioning(false);
            }, LEADERBOARD_TRANSITION_TIME);
        }
    };

    const handleRestartGame = () => {
        setConfirmReset(true);
    };

    const confirmRestartGame = () => {
        setTeams(teams.map(team => ({ ...team, score: 0 })));
        setSelectedCategories([]);
        setTurnHistory([]);
        setCompletedQuestions(new Set());  // Reset completed questions
        localStorage.removeItem('selected_categories');
        localStorage.removeItem('turn_history');
        localStorage.removeItem('completed_questions');
        setConfirmReset(false);
    };

    const handleSkipTransition = () => {
        setShowingTransitionLeaderboard(false);
        setCurrentQuestion(null);
        setQuestionIndex(0);
        setTransitionTimeRemaining(LEADERBOARD_TRANSITION_TIME);
    };

    const handleBackToCategories = () => {
        if (isTransitioning) return;

        // Set transitioning state first
        setIsTransitioning(true);

        // Wait for state updates to complete before showing transition
        setTimeout(() => {
            setShowingTransitionLeaderboard(true);
            setTransitionTimeRemaining(LEADERBOARD_TRANSITION_TIME);

            setTimeout(() => {
                setShowingTransitionLeaderboard(false);
                setCurrentQuestion(null);
                setQuestionIndex(0);
                setTransitionTimeRemaining(LEADERBOARD_TRANSITION_TIME);
                setIsTransitioning(false);
            }, LEADERBOARD_TRANSITION_TIME);
        }, 50);
    };

    const currentCategory = currentQuestion ?
        categoriesData.categories.find(c => c.questions.includes(currentQuestion)) :
        null;

    const renderCategories = () => {
        return (
            <>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 3,
                    position: 'relative'
                }}>
                    <Slide in={true} direction="right">
                        <Box sx={{ position: 'absolute', left: 0 }}>
                            <Button
                                variant="outlined"
                                startIcon={<RestartAltIcon />}
                                onClick={handleRestartGame}
                                color="warning"
                            >
                                Restart Game
                            </Button>
                        </Box>
                    </Slide>

                    <Fade in={true}>
                        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
                            Select Category
                        </Typography>
                    </Fade>

                    {selectingTeam && (
                        <Slide in={true} direction="down">
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    backgroundColor: `${selectingTeam.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 4,
                                        backgroundColor: selectingTeam.color,
                                    }}
                                />
                                <Typography variant="subtitle1">
                                    {selectingTeam.emoji} <strong style={{ color: selectingTeam.color }}>{selectingTeam.name}</strong> selects next
                                </Typography>
                            </Paper>
                        </Slide>
                    )}
                </Box>

                <Grid container spacing={3}>
                    {categoriesData.categories.map((category, index) => {
                        const isCategoryComplete = category.questions.every(question => {
                            const isComplete = completedQuestions.has(question.id);
                            console.log(`Category ${category.name}, Question ${question.id}: ${isComplete ? 'complete' : 'incomplete'}`);
                            return isComplete;
                        });

                        console.log(`Category ${category.name} completion status:`, isCategoryComplete);

                        return (
                            <Grid item xs={12} sm={6} md={4} key={category.id}>
                                <Card
                                    sx={{
                                        cursor: isCategoryComplete ? 'default' : 'pointer',
                                        opacity: isCategoryComplete ? 0.7 : 1,
                                        filter: isCategoryComplete ? 'grayscale(30%)' : 'none',
                                        transition: 'all 0.3s ease',
                                        height: '100%',
                                        '&:hover': !isCategoryComplete && {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                    onClick={() => !isCategoryComplete && handleCategoryClick(category.id)}
                                    onMouseEnter={() => setHoveredCategory(category.id)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <CardContent sx={{
                                        textAlign: 'center',
                                        py: 4,
                                        position: 'relative'
                                    }}>
                                        <Typography
                                            sx={{
                                                fontSize: '2.5rem',
                                                mb: 2,
                                                transform: hoveredCategory === category.id ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        >
                                            {category.emoji}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 1,
                                                color: isCategoryComplete ? 'text.disabled' : 'text.primary'
                                            }}
                                        >
                                            {category.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ px: 2 }}
                                        >
                                            {category.description}
                                        </Typography>
                                        {isCategoryComplete && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 8,
                                                    backgroundColor: 'success.lighter',
                                                    border: '1px solid success.light'
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'success.dark',
                                                        fontWeight: 'medium'
                                                    }}
                                                >
                                                    Complete
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            {showingTransitionLeaderboard ? (
                <Fade in={true}>
                    <Box>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 4
                        }}>
                            <Typography variant="h4">
                                Category Complete!
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={handleSkipTransition}
                            >
                                Back to Categories
                            </Button>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <LinearProgress
                                variant="determinate"
                                value={(transitionTimeRemaining / LEADERBOARD_TRANSITION_TIME) * 100}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        backgroundColor: 'primary.main',
                                    }
                                }}
                            />
                        </Box>

                        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
                            <Typography variant="h5" gutterBottom sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 3
                            }}>
                                <EmojiEventsIcon /> Current Standings
                            </Typography>

                            {[...teams]
                                .sort((a, b) => b.score - a.score)
                                .map((team, index) => (
                                    <Zoom
                                        in={true}
                                        style={{ transitionDelay: `${index * 200}ms` }}
                                        key={team.id}
                                    >
                                        <Paper
                                            elevation={3}
                                            sx={{
                                                p: 3,
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: `${team.color}15`,
                                                transform: `scale(${1 - index * 0.02})`,
                                                transformOrigin: 'top center',
                                            }}
                                        >
                                            <Typography variant="h4" sx={{ mr: 3, color: team.color }}>
                                                #{index + 1}
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    flex: 1,
                                                    color: team.color,
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5em' }}>{team.emoji}</span>
                                                {team.name}
                                            </Typography>
                                            <AnimatedScore
                                                score={team.score}
                                                color={team.color}
                                                variant="h4"
                                            />
                                        </Paper>
                                    </Zoom>
                                ))}
                        </Paper>
                    </Box>
                </Fade>
            ) : (
                <>
                    {currentQuestion ? (
                        <>
                            <CategoryTransition
                                category={currentCategory}
                                isActive={true}
                            />
                            <QuestionDisplay
                                question={currentQuestion}
                                teams={teams}
                                setTeams={setTeams}
                                onQuestionComplete={handleQuestionComplete}
                                currentQuestionNumber={questionIndex + 1}
                                totalQuestions={currentCategory.questions.length}
                                onBackToCategories={handleBackToCategories}
                            />
                            <Box sx={{ mt: 4 }}>
                                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                                    <Typography variant="h6" gutterBottom sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 2
                                    }}>
                                        <EmojiEventsIcon /> Current Standings
                                    </Typography>

                                    {[...teams]
                                        .sort((a, b) => b.score - a.score)
                                        .map((team, index) => (
                                            <Paper
                                                key={team.id}
                                                elevation={1}
                                                sx={{
                                                    p: 2,
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    backgroundColor: `${team.color}15`,
                                                    transform: `scale(${1 - index * 0.02})`,
                                                    transformOrigin: 'top center',
                                                }}
                                            >
                                                <Typography variant="h6" sx={{ mr: 2, color: team.color }}>
                                                    #{index + 1}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        flex: 1,
                                                        color: team.color,
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.2em' }}>{team.emoji}</span>
                                                    {team.name}
                                                </Typography>
                                                <AnimatedScore score={team.score} color={team.color} />
                                            </Paper>
                                        ))}
                                </Paper>
                            </Box>
                        </>
                    ) : (
                        renderCategories()
                    )}
                </>
            )}

            <Dialog
                open={confirmReset}
                onClose={() => setConfirmReset(false)}
            >
                <DialogTitle>Restart Game?</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will reset all scores and category selections, but keep the teams.
                        Are you sure you want to restart the game?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
                    <Button
                        onClick={confirmRestartGame}
                        color="warning"
                        variant="contained"
                    >
                        Restart Game
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Play; 