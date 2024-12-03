import {
    Box,
    Typography,
    Paper,
    IconButton,
    TextField,
    Button,
    Alert,
    Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';

const Admin = ({ teams, setTeams }) => {
    const [customScores, setCustomScores] = useState({});
    const [message, setMessage] = useState(null);

    const handleScoreChange = (teamId, value) => {
        setCustomScores({
            ...customScores,
            [teamId]: value
        });
    };

    const handleAddScore = (team) => {
        const scoreToAdd = Number(customScores[team.id] || 0);
        if (isNaN(scoreToAdd)) {
            setMessage({ text: 'Please enter a valid number', severity: 'error' });
            return;
        }

        setTeams(teams.map(t => {
            if (t.id === team.id) {
                return { ...t, score: t.score + scoreToAdd };
            }
            return t;
        }));

        setCustomScores({ ...customScores, [team.id]: '' });
        setMessage({ text: `Updated ${team.name}'s score`, severity: 'success' });
    };

    const handleSubtractScore = (team) => {
        const scoreToSubtract = Number(customScores[team.id] || 0);
        if (isNaN(scoreToSubtract)) {
            setMessage({ text: 'Please enter a valid number', severity: 'error' });
            return;
        }

        setTeams(teams.map(t => {
            if (t.id === team.id) {
                const newScore = Math.max(0, t.score - scoreToSubtract); // Prevent negative scores
                return { ...t, score: newScore };
            }
            return t;
        }));

        setCustomScores({ ...customScores, [team.id]: '' });
        setMessage({ text: `Updated ${team.name}'s score`, severity: 'success' });
    };

    const handleResetScores = () => {
        if (window.confirm('Are you sure you want to reset all scores to 0?')) {
            setTeams(teams.map(team => ({ ...team, score: 0 })));
            setMessage({ text: 'All scores have been reset', severity: 'info' });
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5">Score Management</Typography>
                <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleResetScores}
                    disabled={teams.length === 0}
                >
                    Reset All Scores
                </Button>
            </Box>

            {teams.map((team) => (
                <Paper
                    key={team.id}
                    sx={{
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        backgroundColor: `${team.color}15`,
                    }}
                >
                    <Typography
                        sx={{
                            minWidth: '150px',
                            color: team.color,
                            fontWeight: 'bold'
                        }}
                    >
                        {team.name}
                    </Typography>

                    <Typography sx={{ minWidth: '100px' }}>
                        Current: {team.score}
                    </Typography>

                    <TextField
                        size="small"
                        type="number"
                        label="Points"
                        value={customScores[team.id] || ''}
                        onChange={(e) => handleScoreChange(team.id, e.target.value)}
                        sx={{ width: '100px' }}
                    />

                    <IconButton
                        color="primary"
                        onClick={() => handleAddScore(team)}
                    >
                        <AddIcon />
                    </IconButton>

                    <IconButton
                        color="error"
                        onClick={() => handleSubtractScore(team)}
                    >
                        <RemoveIcon />
                    </IconButton>
                </Paper>
            ))}

            {teams.length === 0 && (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textAlign: 'center', mt: 4 }}
                >
                    No teams available. Add teams to manage their scores.
                </Typography>
            )}

            <Snackbar
                open={!!message}
                autoHideDuration={3000}
                onClose={() => setMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setMessage(null)}
                    severity={message?.severity || 'success'}
                    sx={{ width: '100%' }}
                >
                    {message?.text}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Admin; 