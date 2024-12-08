import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, Fade, Slide, Chip, CircularProgress } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// Animation keyframes
const correctAnswerAnimation = keyframes`
    0% { transform: scale(1); }
    20% { transform: scale(1.1) rotate(2deg); }
    40% { transform: scale(1) rotate(-2deg); }
    60% { transform: scale(1.05) rotate(2deg); }
    80% { transform: scale(1) rotate(-1deg); }
    100% { transform: scale(1) rotate(0); }
`;

const incorrectAnswerAnimation = keyframes`
    0%, 100% { transform: translateX(0); }
    15% { transform: translateX(-8px) rotate(-1deg); }
    30% { transform: translateX(8px) rotate(1deg); }
    45% { transform: translateX(-6px) rotate(-0.5deg); }
    60% { transform: translateX(6px) rotate(0.5deg); }
    75% { transform: translateX(-4px) rotate(-0.25deg); }
    90% { transform: translateX(4px) rotate(0.25deg); }
`;

const QuestionDisplay = ({
    question,
    teams,
    setTeams,
    onQuestionComplete,
    currentQuestionNumber,
    totalQuestions,
    onBackToCategories,
    isTransitioning
}) => {
    // Track selected answers and team order
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [teamOrder, setTeamOrder] = useState([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [knockedOutTeams, setKnockedOutTeams] = useState(new Set());
    const [bonusPoints, setBonusPoints] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

    // Reset state including knocked out teams when question changes
    useEffect(() => {
        const sortedTeams = [...teams].sort((a, b) => a.score - b.score);
        setTeamOrder(sortedTeams);
        setCurrentTeamIndex(0);
        setSelectedAnswers([]);
        setKnockedOutTeams(new Set());
        setBonusPoints({});
    }, [question.id]);

    // Add effect to handle loading state
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100); // Short delay to prevent flash
        return () => clearTimeout(timer);
    }, [question.id]);

    const currentTeam = teamOrder[currentTeamIndex];

    const handleAnswerSelect = (answer) => {
        // Prevent rapid clicks and double selections
        if (isProcessingAnswer || selectedAnswers.some(sa => sa.answerId === answer.id)) {
            return;
        }

        setIsProcessingAnswer(true);

        try {
            // Record the selection
            const selection = {
                teamId: currentTeam.id,
                answerId: answer.id,
                isCorrect: answer.isCorrect
            };
            setSelectedAnswers(prev => [...prev, selection]);

            if (answer.isCorrect) {
                // Update team score
                setTeams(prev => prev.map(team =>
                    team.id === currentTeam.id
                        ? { ...team, score: team.score + answer.points }
                        : team
                ));
            } else {
                // Knock out current team
                setKnockedOutTeams(prev => new Set([...prev, currentTeam.id]));
            }

            // Always move to next available team
            const nextTeam = findNextAvailableTeam(currentTeamIndex);
            if (nextTeam !== -1) {
                setCurrentTeamIndex(nextTeam);
            }
        } catch (error) {
            console.error('Error processing answer:', error);
        } finally {
            // Release the lock after a short delay
            setTimeout(() => {
                setIsProcessingAnswer(false);
            }, 300);
        }
    };

    const findNextAvailableTeam = (currentIndex) => {
        let nextIndex = (currentIndex + 1) % teamOrder.length;
        const startIndex = nextIndex;

        do {
            if (!knockedOutTeams.has(teamOrder[nextIndex].id)) {
                return nextIndex;
            }
            nextIndex = (nextIndex + 1) % teamOrder.length;
        } while (nextIndex !== startIndex);

        return -1; // All teams are knocked out
    };

    // Check if current question is complete
    const isQuestionComplete = () => {
        const allTeamsKnockedOut = teamOrder.every(team => knockedOutTeams.has(team.id));
        const allCorrectAnswersFound = question.answers
            .filter(a => a.isCorrect)
            .every(a => selectedAnswers.some(sa => sa.answerId === a.id));

        return allTeamsKnockedOut || allCorrectAnswersFound;
    };

    // Check if all questions up to current one are complete
    const allQuestionsComplete = () => {
        // Current question must be complete
        if (!isQuestionComplete()) {
            return false;
        }

        // Must be on last question
        if (currentQuestionNumber !== totalQuestions) {
            return false;
        }

        // Category is complete if either:
        // 1. All correct answers are found, OR
        // 2. All teams are knocked out
        const allTeamsKnockedOut = teamOrder.every(team => knockedOutTeams.has(team.id));
        const allCorrectAnswersFound = question.answers
            .filter(a => a.isCorrect)
            .every(a => selectedAnswers.some(sa => sa.answerId === a.id));

        return allTeamsKnockedOut || allCorrectAnswersFound;
    };

    const handleAddBonusPoint = (teamId) => {
        // Update bonus points display for current question
        setBonusPoints(prev => ({
            ...prev,
            [teamId]: (prev[teamId] || 0) + 1
        }));

        // Update actual team score (this persists)
        setTeams(prev => prev.map(team =>
            team.id === teamId
                ? { ...team, score: team.score + 1 }
                : team
        ));
    };

    const handleNextQuestion = () => {
        if (isProcessingAnswer || !isQuestionComplete() || isTransitioning) return;
        onQuestionComplete();
    };

    const handleBackToCategories = () => {
        if (isProcessingAnswer || !allQuestionsComplete() || currentQuestionNumber !== totalQuestions || isTransitioning) return;
        onQuestionComplete();
        onBackToCategories();
    };

    // Add cleanup effect
    useEffect(() => {
        return () => {
            setIsProcessingAnswer(false);
        };
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 1 } }}>
            {/* Question Progress and Text in a row */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3
            }}>
                <Typography variant="subtitle1">
                    Question {currentQuestionNumber} of {totalQuestions}
                </Typography>

                {/* Knocked Out Teams Display - moved to header */}
                {knockedOutTeams.size > 0 && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Typography
                            variant="subtitle2"
                            color="error.main"
                            sx={{ fontWeight: 'medium' }}
                        >
                            Knocked Out:
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            gap: 1
                        }}>
                            {Array.from(knockedOutTeams).map(teamId => {
                                const team = teams.find(t => t.id === teamId);
                                return (
                                    <Chip
                                        key={team.id}
                                        label={team.name}
                                        icon={
                                            <span style={{
                                                fontSize: '1.1em',
                                                marginLeft: '8px'
                                            }}>
                                                {team.emoji}
                                            </span>
                                        }
                                        sx={{
                                            backgroundColor: alpha(team.color, 0.1),
                                            border: `1px solid ${team.color}40`,
                                            color: team.color,
                                            fontWeight: 'medium',
                                            '& .MuiChip-icon': {
                                                color: 'inherit',
                                                marginRight: '-4px'
                                            }
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Question Text - full width */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        lineHeight: 1.3
                    }}
                >
                    {question.text}
                </Typography>
            </Paper>

            {/* Current Team Display */}
            {currentTeam && !knockedOutTeams.has(currentTeam.id) && (
                <Box sx={{ mb: 3 }}>
                    <Fade in={true} key={currentTeam?.id}>
                        <Slide direction="left" in={true}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    backgroundColor: `${currentTeam.color}15`,
                                    border: `1px solid ${currentTeam.color}40`,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '1.4em' }}>{currentTeam.emoji}</span>
                                    <strong style={{ color: currentTeam.color }}>
                                        {currentTeam.name}
                                    </strong>
                                    <span style={{ marginLeft: 1 }}>is picking</span>
                                </Typography>
                            </Paper>
                        </Slide>
                    </Fade>
                </Box>
            )}

            {/* Bonus Points Section */}
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    mb: 3,
                    backgroundColor: 'grey.50'
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        mb: 1,
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                    }}
                >
                    Bonus Points
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                }}>
                    {teamOrder.map(team => (
                        <Box
                            key={team.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: `${team.color}15`,
                                border: `1px solid ${team.color}40`,
                                borderRadius: 16,
                                px: 1.5,
                                py: 0.5,
                                gap: 1
                            }}
                        >
                            <span style={{ fontSize: '1.4em' }}>{team.emoji}</span>
                            <Box
                                component="button"
                                onClick={() => handleAddBonusPoint(team.id)}
                                sx={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '50%',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&:active': {
                                        transform: 'scale(0.95)',
                                    }
                                }}
                            >
                                <AddCircleIcon
                                    sx={{
                                        color: team.color,
                                        fontSize: '1.2rem'
                                    }}
                                />
                            </Box>
                            {(bonusPoints[team.id] || 0) > 0 && (
                                <Typography
                                    sx={{
                                        color: team.color,
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        ml: 0.5
                                    }}
                                >
                                    +{bonusPoints[team.id]}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            </Paper>

            {/* Answers Grid - reduced spacing */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {question.answers.map((answer, index) => {
                    const isSelected = selectedAnswers.some(sa => sa.answerId === answer.id);
                    const selectionData = selectedAnswers.find(sa => sa.answerId === answer.id);
                    const selectingTeam = selectionData ? teams.find(t => t.id === selectionData.teamId) : null;
                    const isCorrectSelection = isSelected && answer.isCorrect;

                    return (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={3}      // 4 columns from medium up
                            key={answer.id}
                        >
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: isSelected ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    backgroundColor: isLoading ? 'background.paper' : (
                                        isSelected ? (
                                            isCorrectSelection
                                                ? alpha('#4caf50', 0.1)
                                                : alpha('#f44336', 0.1)
                                        ) : (
                                            isQuestionComplete()
                                                ? (answer.isCorrect
                                                    ? alpha('#4caf50', 0.1)
                                                    : alpha('#f44336', 0.1))
                                                : 'background.paper'
                                        )
                                    ),
                                    borderLeft: isLoading ? 'none' : (
                                        isSelected ? (
                                            isCorrectSelection
                                                ? '4px solid #4caf50'
                                                : '4px solid #f44336'
                                        ) : (
                                            isQuestionComplete()
                                                ? (answer.isCorrect
                                                    ? '4px solid #4caf50'
                                                    : '4px solid #f44336')
                                                : 'none'
                                        )
                                    ),
                                    '&:hover': (!isSelected && !isQuestionComplete()) && {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    },
                                    pointerEvents: (isSelected || isQuestionComplete()) ? 'none' : 'auto',
                                    // Adjust content sizing for smaller cards
                                    '& .MuiCardContent-root': {
                                        p: { xs: 2, md: 2.5 }, // Responsive padding
                                    },
                                    animation: isSelected ? (
                                        isCorrectSelection
                                            ? `${correctAnswerAnimation} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`  // Bouncy easing
                                            : `${incorrectAnswerAnimation} 0.6s ease-in-out`
                                    ) : 'none',
                                }}
                                onClick={() => !isSelected && !isProcessingAnswer && !isTransitioning && handleAnswerSelect(answer)}
                            >
                                {/* Answer Number Badge */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        zIndex: 1,
                                        boxShadow: 1
                                    }}
                                >
                                    {index + 1}
                                </Box>

                                <CardContent
                                    sx={{
                                        pt: 4,
                                        px: { xs: 2, md: 2.5 },
                                        pb: '16px !important',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {/* Answer content */}
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: { xs: 100, md: 110 } // Slightly reduced height
                                    }}>
                                        {answer.imageUrl ? (
                                            <Box
                                                component="img"
                                                src={answer.imageUrl}
                                                alt={answer.text}
                                                sx={{
                                                    width: '100%',
                                                    height: 140,
                                                    objectFit: 'cover',
                                                    borderRadius: 1
                                                }}
                                            />
                                        ) : (
                                            <Typography
                                                variant="h6"
                                                align="center"
                                                sx={{
                                                    fontWeight: 700,
                                                    lineHeight: 1.3,
                                                    color: isSelected ? (
                                                        isCorrectSelection
                                                            ? '#2e7d32'  // Darker green text
                                                            : '#d32f2f'  // Darker red text
                                                    ) : (
                                                        // Show all answers' text colors when question is complete
                                                        isQuestionComplete()
                                                            ? (answer.isCorrect
                                                                ? '#2e7d32'  // Green text for correct
                                                                : '#d32f2f')  // Red text for incorrect
                                                            : 'text.primary'
                                                    ),
                                                    fontSize: { xs: '1rem', md: '1.1rem' } // Responsive font size
                                                }}
                                            >
                                                {answer.text}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Team Selection Badge */}
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                                        {isSelected && selectingTeam && (
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    backgroundColor: `${selectingTeam.color}25`,
                                                    border: `2px solid ${selectingTeam.color}70`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.4em',
                                                    position: 'relative',
                                                    boxShadow: 1
                                                }}
                                            >
                                                {selectingTeam.emoji}
                                                {isCorrectSelection && (
                                                    <Typography
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            backgroundColor: 'success.main',
                                                            color: 'white',
                                                            borderRadius: '50%',
                                                            width: 20,
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            boxShadow: 1
                                                        }}
                                                    >
                                                        +{answer.points}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Navigation Buttons */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3
            }}>
                <Button
                    variant="contained"
                    onClick={handleBackToCategories}
                    disabled={!allQuestionsComplete() || currentQuestionNumber !== totalQuestions || isTransitioning}
                    sx={{
                        opacity: (allQuestionsComplete() && currentQuestionNumber === totalQuestions && !isTransitioning) ? 1 : 0.5,
                        '&.Mui-disabled': {
                            backgroundColor: 'grey.300',
                            color: 'grey.500'
                        },
                        minWidth: 180,  // Add space for spinner
                        position: 'relative'  // For spinner positioning
                    }}
                >
                    {isTransitioning ? (
                        <>
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    left: 16
                                }}
                            />
                            Processing...
                        </>
                    ) : (
                        'Back to Categories'
                    )}
                </Button>

                {currentQuestionNumber < totalQuestions && (
                    <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                        disabled={!isQuestionComplete() || isTransitioning}
                        sx={{
                            opacity: (isQuestionComplete() && !isTransitioning) ? 1 : 0.5,
                            '&.Mui-disabled': {
                                backgroundColor: 'grey.300',
                                color: 'grey.500'
                            },
                            minWidth: 160,  // Add space for spinner
                            position: 'relative'  // For spinner positioning
                        }}
                    >
                        {isTransitioning ? (
                            <>
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        position: 'absolute',
                                        left: 16
                                    }}
                                />
                                Processing...
                            </>
                        ) : (
                            'Next Question'
                        )}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default QuestionDisplay; 