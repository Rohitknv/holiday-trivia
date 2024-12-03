import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, Fade, Slide, Chip } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

// Animation keyframes
const correctAnswerBounce = keyframes`
    0%, 100% { transform: translateY(0); }
    20% { transform: translateY(-10px); }
    40% { transform: translateY(0); }
    60% { transform: translateY(-5px); }
    80% { transform: translateY(0); }
`;

const incorrectAnswerShake = keyframes`
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
`;

const QuestionDisplay = ({
    question,
    teams,
    setTeams,
    onQuestionComplete,
    currentQuestionNumber,
    totalQuestions
}) => {
    // Track selected answers and team order
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [teamOrder, setTeamOrder] = useState([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [knockedOutTeams, setKnockedOutTeams] = useState(new Set());

    // Reset state including knocked out teams when question changes
    useEffect(() => {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        setTeamOrder(sortedTeams);
        setCurrentTeamIndex(0);
        setSelectedAnswers([]);
        setKnockedOutTeams(new Set());
    }, [question.id]);

    const currentTeam = teamOrder[currentTeamIndex];

    const handleAnswerSelect = (answer) => {
        // Prevent selection if answer is already selected
        if (selectedAnswers.some(sa => sa.answerId === answer.id)) {
            return;
        }

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

            // Find next available team
            const nextTeam = findNextAvailableTeam(currentTeamIndex);
            if (nextTeam !== -1) {
                setCurrentTeamIndex(nextTeam);
            }
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

    return (
        <Box sx={{ p: 3 }}>
            {/* Question Progress */}
            <Typography variant="subtitle1" gutterBottom>
                Question {currentQuestionNumber} of {totalQuestions}
            </Typography>

            {/* Question Text */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
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

            {/* Knocked Out Teams Display */}
            {knockedOutTeams.size > 0 && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3,
                    p: 1
                }}>
                    <Typography
                        variant="subtitle2"
                        color="error.main"
                        sx={{
                            fontWeight: 'medium',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Knocked Out:
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
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

            {/* Current Team Display with Animation */}
            {currentTeam && !knockedOutTeams.has(currentTeam.id) && (
                <Box sx={{ height: 80, mb: 3 }}> {/* Fixed height container to prevent layout shift */}
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
                                    <span style={{ fontSize: '1.2em' }}>{currentTeam.emoji}</span>
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

            {/* Answers Grid */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {question.answers.map((answer, index) => {
                    const isSelected = selectedAnswers.some(sa => sa.answerId === answer.id);
                    const selectionData = selectedAnswers.find(sa => sa.answerId === answer.id);
                    const selectingTeam = selectionData ? teams.find(t => t.id === selectionData.teamId) : null;
                    const isCorrectSelection = isSelected && answer.isCorrect;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={answer.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: isSelected ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    backgroundColor: isSelected ? (
                                        isCorrectSelection
                                            ? alpha('#4caf50', 0.1)  // Light green background
                                            : alpha('#f44336', 0.1)  // Light red background
                                    ) : 'background.paper',
                                    borderLeft: isSelected ? (
                                        isCorrectSelection
                                            ? '4px solid #4caf50'    // Solid green border
                                            : '4px solid #f44336'    // Solid red border
                                    ) : 'none',
                                    '&:hover': !isSelected && {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    },
                                    animation: isSelected ? (
                                        isCorrectSelection
                                            ? `${correctAnswerBounce} 0.8s ease`
                                            : `${incorrectAnswerShake} 0.5s ease`
                                    ) : 'none',
                                    // Prevent hover animation during result animation
                                    pointerEvents: isSelected ? 'none' : 'auto'
                                }}
                                onClick={() => !isSelected && handleAnswerSelect(answer)}
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
                                        px: 3,
                                        pb: '16px !important',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {/* Answer content */}
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
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
                                                    ) : 'text.primary',
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                {answer.text}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Team Selection Badge */}
                                    <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                                        {isSelected && selectingTeam && (
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    px: 2,
                                                    py: 0.5,
                                                    backgroundColor: isCorrectSelection ?
                                                        'success.lighter' :
                                                        'error.lighter',
                                                    border: `1px solid ${selectingTeam.color}40`,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <span style={{ fontSize: '1.2em' }}>{selectingTeam.emoji}</span>
                                                <Typography
                                                    sx={{
                                                        color: selectingTeam.color,
                                                        fontWeight: 'medium',
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    {selectingTeam.name}
                                                    {isCorrectSelection && (
                                                        <span style={{
                                                            color: 'success.dark',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            (+{answer.points} pts)
                                                        </span>
                                                    )}
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Next Question Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={onQuestionComplete}
                >
                    Next Question
                </Button>
            </Box>
        </Box>
    );
};

export default QuestionDisplay; 