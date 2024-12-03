import { useState } from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent } from '@mui/material';

const QuestionDisplay = ({
    question,
    onQuestionComplete,
    currentQuestionNumber,
    totalQuestions
}) => {
    const [showSummary, setShowSummary] = useState(false);

    const handleNextQuestion = () => {
        setShowSummary(false);
        onQuestionComplete();
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

            {/* Answers Grid */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {question.answers.map((answer, index) => (
                    <Grid item xs={12} sm={6} md={4} key={answer.id}>
                        <Card
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3
                                }
                            }}
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
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
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
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Next Question Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                >
                    Next Question
                </Button>
            </Box>
        </Box>
    );
};

export default QuestionDisplay; 