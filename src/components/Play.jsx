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
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

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
        if (!selectedCategories.includes(categoryId)) {
            const category = categoriesData.categories.find(c => c.id === categoryId);
            setCurrentQuestion(category.questions[0]);
            setQuestionIndex(0);

            const newSelected = [...selectedCategories, categoryId];
            setSelectedCategories(newSelected);
            localStorage.setItem('selected_categories', JSON.stringify(newSelected));

            // Record the turn in history
            const newHistory = [...turnHistory, selectingTeam.id];
            setTurnHistory(newHistory);
            localStorage.setItem('turn_history', JSON.stringify(newHistory));
        }
    };

    const handleQuestionComplete = () => {
        const currentCategory = categoriesData.categories.find(
            c => c.questions.includes(currentQuestion)
        );
        const nextIndex = questionIndex + 1;

        // Mark current question as completed
        const newCompletedQuestions = new Set([...completedQuestions, currentQuestion.id]);
        setCompletedQuestions(newCompletedQuestions);
        localStorage.setItem('completed_questions', JSON.stringify([...newCompletedQuestions]));

        if (nextIndex < currentCategory.questions.length) {
            // Continue to next question in category
            setCurrentQuestion(currentCategory.questions[nextIndex]);
            setQuestionIndex(nextIndex);
        } else {
            // Check if all questions in category are completed
            const allCategoryQuestionsComplete = currentCategory.questions.every(
                question => newCompletedQuestions.has(question.id)
            );

            if (allCategoryQuestionsComplete) {
                // Category is complete
                setShowingTransitionLeaderboard(true);
                setTransitionTimeRemaining(LEADERBOARD_TRANSITION_TIME);

                setTimeout(() => {
                    setShowingTransitionLeaderboard(false);
                    setCurrentQuestion(null);
                    setQuestionIndex(0);
                    setTransitionTimeRemaining(LEADERBOARD_TRANSITION_TIME);
                }, LEADERBOARD_TRANSITION_TIME);
            } else {
                // Go back to first incomplete question
                const firstIncompleteIndex = currentCategory.questions.findIndex(
                    question => !newCompletedQuestions.has(question.id)
                );
                setCurrentQuestion(currentCategory.questions[firstIncompleteIndex]);
                setQuestionIndex(firstIncompleteIndex);
            }
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

    const currentCategory = currentQuestion ?
        categoriesData.categories.find(c => c.questions.includes(currentQuestion)) :
        null;

    const renderCategories = () => {
        if (currentQuestion) {
            return (
                <Box sx={{ mb: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            backgroundColor: 'grey.50',
                            position: 'relative'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Current Category
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2
                        }}>
                            <Typography
                                sx={{
                                    fontSize: '2rem',
                                    lineHeight: 1
                                }}
                            >
                                {currentCategory.emoji}
                            </Typography>
                            <Typography variant="h5">
                                {currentCategory.name}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {categoriesData.categories.map((category) => {
                                const isSelected = selectedCategories.includes(category.id);
                                const isCurrent = category.id === currentCategory.id;
                                return (
                                    <Chip
                                        key={category.id}
                                        label={category.name}
                                        icon={<Typography sx={{ fontSize: '1.2rem', pl: 1 }}>{category.emoji}</Typography>}
                                        variant={isCurrent ? "filled" : "outlined"}
                                        color={isCurrent ? "primary" : "default"}
                                        sx={{
                                            opacity: isSelected && !isCurrent ? 0.5 : 1,
                                            '& .MuiChip-icon': {
                                                marginLeft: 0
                                            }
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </Paper>
                </Box>
            );
        }

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
                                {turnHistory.length > 0 && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            ml: 2,
                                            color: 'text.secondary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        Last pick: {teams.find(t => t.id === turnHistory[turnHistory.length - 1])?.name}
                                    </Typography>
                                )}
                            </Paper>
                        </Slide>
                    )}
                </Box>

                <Grid container spacing={3}>
                    {categoriesData.categories.map((category, index) => {
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                            <Grid item xs={12} sm={6} md={4} key={category.id}>
                                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                                    <Card
                                        sx={{
                                            cursor: isSelected ? 'default' : 'pointer',
                                            opacity: isSelected ? 0.6 : 1,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: isSelected ? 'none' : 'translateY(-4px)',
                                                boxShadow: isSelected ? 1 : 4
                                            },
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            border: !isSelected && selectingTeam ? `2px solid ${selectingTeam.color}` : 'none'
                                        }}
                                        onClick={() => !isSelected && handleCategoryClick(category.id)}
                                        onMouseEnter={() => setHoveredCategory(category.id)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                    >
                                        <CardContent sx={{
                                            textAlign: 'center',
                                            py: 4,
                                        }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '2.5rem',
                                                    mb: 2,
                                                    opacity: isSelected ? 0.5 : 1,
                                                    transform: hoveredCategory === category.id ? 'scale(1.1)' : 'scale(1)',
                                                    transition: 'transform 0.3s ease'
                                                }}
                                            >
                                                {category.emoji}
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: isSelected ? 'text.disabled' : 'text.primary',
                                                    mb: 1
                                                }}
                                            >
                                                {category.name}
                                            </Typography>
                                            <Collapse in={hoveredCategory === category.id}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        opacity: isSelected ? 0.7 : 1,
                                                        px: 2
                                                    }}
                                                >
                                                    {category.description}
                                                </Typography>
                                            </Collapse>
                                        </CardContent>
                                    </Card>
                                </Zoom>
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