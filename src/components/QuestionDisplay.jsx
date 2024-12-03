import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, Fade, Slide } from '@mui/material';

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

    // Only reset state when question changes
    useEffect(() => {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        setTeamOrder(sortedTeams);
        setCurrentTeamIndex(0);
        setSelectedAnswers([]);
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
        }

        // Delay team transition slightly for visual feedback
        setTimeout(() => {
            const nextIndex = (currentTeamIndex + 1) % teamOrder.length;
            setCurrentTeamIndex(nextIndex);
        }, 500);
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

            {/* Current Team Display with Animation */}
            <Box sx={{ height: 80, mb: 3 }}> {/* Fixed height container to prevent layout shift */}
                <Fade in={true} key={currentTeam?.id}>
                    <Slide direction="left" in={true}>
                        {currentTeam ? (
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
                        ) : <Box />}
                    </Slide>
                </Fade>
            </Box>

            {/* Answers Grid */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {question.answers.map((answer, index) => {
                    const isSelected = selectedAnswers.some(sa => sa.answerId === answer.id);
                    const selectionData = selectedAnswers.find(sa => sa.answerId === answer.id);
                    const selectingTeam = selectionData ? teams.find(t => t.id === selectionData.teamId) : null;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={answer.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: isSelected ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    opacity: isSelected ? 0.7 : 1,
                                    '&:hover': !isSelected && {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    }
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
                                        pb: 3,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {/* Answer content */}
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {answer.imageUrl ? (
                                            <Box
                                                component="img"
                                                src={answer.imageUrl}
                                                alt={answer.text}
                                                sx={{
                                                    width: '100%',
                                                    height: 140,
                                                    objectFit: 'cover',
                                                    mb: 1,
                                                    borderRadius: 1
                                                }}
                                            />
                                        ) : (
                                            <Typography
                                                variant="h6"
                                                align="center"
                                                sx={{
                                                    fontWeight: 500,
                                                    lineHeight: 1.3,
                                                    color: 'text.primary'
                                                }}
                                            >
                                                {answer.text}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Team Selection Display */}
                                    {isSelected && selectingTeam && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                pt: 2,
                                                borderTop: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    color: selectingTeam.color,
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.2em' }}>{selectingTeam.emoji}</span>
                                                {selectingTeam.name}
                                            </Typography>
                                        </Box>
                                    )}
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