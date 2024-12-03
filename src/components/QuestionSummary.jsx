import { Box, Typography, Paper, Fade } from '@mui/material';

const QuestionSummary = ({ question, selectedAnswers, teams }) => {
    // Calculate points gained by each team in this question only
    const questionPoints = teams.reduce((acc, team) => {
        const teamAnswers = selectedAnswers.filter(sa => sa.teamId === team.id);
        const pointsInQuestion = teamAnswers.reduce((sum, selection) =>
            selection.isCorrect ? sum + selection.points : sum, 0);

        // Only include teams that scored points in this question
        if (pointsInQuestion > 0) {
            acc[team.id] = {
                team,
                points: pointsInQuestion
            };
        }
        return acc;
    }, {});

    return (
        <Fade in={true}>
            <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Question Summary</Typography>
                <Box sx={{ mt: 2 }}>
                    {Object.values(questionPoints)
                        .sort((a, b) => b.points - a.points) // Sort by points earned in this question
                        .map(({ team, points }) => (
                            <Box
                                key={team.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 1,
                                    p: 1,
                                    backgroundColor: `${team.color}15`,
                                    borderRadius: 1
                                }}
                            >
                                <Typography sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    color: team.color,
                                    fontWeight: 'bold'
                                }}>
                                    {team.emoji} {team.name}
                                </Typography>
                                <Typography sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                    +{points} points
                                </Typography>
                            </Box>
                        ))}

                    {Object.keys(questionPoints).length === 0 && (
                        <Typography
                            color="text.secondary"
                            sx={{ textAlign: 'center' }}
                        >
                            No points scored in this question
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Fade>
    );
};

export default QuestionSummary; 