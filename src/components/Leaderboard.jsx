import { Box, Typography, Paper } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Leaderboard = ({ teams }) => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon /> Leaderboard
            </Typography>

            {sortedTeams.map((team, index) => (
                <Paper
                    key={team.id}
                    elevation={3}
                    sx={{
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: `${team.color}15`,
                        transform: `scale(${1 - index * 0.03})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.02)',
                        }
                    }}
                >
                    <Typography variant="h4" sx={{ mr: 3, color: team.color }}>
                        #{index + 1}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: team.color,
                                fontWeight: 'bold'
                            }}
                        >
                            {team.name}
                        </Typography>
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            color: team.color
                        }}
                    >
                        {team.score} pts
                    </Typography>
                </Paper>
            ))}

            {teams.length === 0 && (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textAlign: 'center', mt: 4 }}
                >
                    No teams yet. Add teams to see them on the leaderboard!
                </Typography>
            )}
        </Box>
    );
};

export default Leaderboard; 