import { Box, Typography, Paper, Zoom } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AnimatedScore from './AnimatedScore';

const Leaderboard = ({ teams }) => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 4
            }}>
                <EmojiEventsIcon fontSize="large" /> Leaderboard
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
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {index === 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                                    }}
                                />
                            )}
                            <Typography variant="h3" sx={{ mr: 3, color: team.color }}>
                                #{index + 1}
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
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
                            </Box>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 'bold',
                                    color: team.color
                                }}
                            >
                                {team.score}
                            </Typography>
                        </Paper>
                    </Zoom>
                ))}
        </Box>
    );
};

export default Leaderboard; 