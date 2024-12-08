import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Grid,
    Alert,
    Snackbar,
    Paper,
    Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const TEAM_COLORS = [
    { name: 'Red', value: '#e53935' },
    { name: 'Blue', value: '#1e88e5' },
    { name: 'Green', value: '#43a047' },
    { name: 'Purple', value: '#8e24aa' },
    { name: 'Orange', value: '#fb8c00' },
    { name: 'Teal', value: '#00897b' },
    { name: 'Pink', value: '#d81b60' },
    { name: 'Yellow', value: '#fdd835' },
];

const TEAM_EMOJIS = [
    '🦁', '🐯', '🦊', '🦝', '🐼', '🦄', '🦅', '🦜',
    '🐙', '🦈', '🦀', '🐉', '🦖', '🦕', '🦭', '🐸',
    '🦩', '🦚', '🦉', '🐺', '🐲', '🦡', '🦫', '🦘'
];

const STORAGE_KEY = 'trivia_teams';

const TeamSelector = ({ teams, setTeams }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0].value);
    const [scores, setScores] = useState({});
    const [error, setError] = useState(null);

    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    const handleAddTeam = () => {
        setTeamName('');
        setSelectedColor(TEAM_COLORS[0].value);
        setEditingTeam(null);
        setDialogOpen(true);
    };

    const handleEditTeam = (team) => {
        setTeamName(team.name);
        setSelectedColor(team.color);
        setEditingTeam(team);
        setDialogOpen(true);
    };

    const handleDeleteTeam = (teamToDelete) => {
        const updatedTeams = teams.filter(team => team.id !== teamToDelete.id);
        setTeams(updatedTeams);
        if (updatedTeams.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const getRandomEmoji = () => {
        const randomIndex = Math.floor(Math.random() * TEAM_EMOJIS.length);
        return TEAM_EMOJIS[randomIndex];
    };

    const handleSaveTeam = () => {
        if (!teamName.trim()) return;

        if (editingTeam) {
            setTeams(teams.map(team =>
                team.id === editingTeam.id
                    ? { ...team, name: teamName, color: selectedColor }
                    : team
            ));
        } else {
            const newTeam = {
                id: Date.now(),
                name: teamName,
                color: selectedColor,
                score: 0,
                emoji: getRandomEmoji(),
            };
            setTeams([...teams, newTeam]);
        }
        setDialogOpen(false);
    };

    const handleScoreChange = (team, value) => {
        setScores({
            ...scores,
            [team.id]: value
        });
    };

    const handleScoreBlur = (team) => {
        const newScore = Number(scores[team.id]);
        if (isNaN(newScore)) {
            setError('Please enter a valid number');
            return;
        }

        const validScore = Math.max(0, newScore); // Prevent negative scores
        setTeams(teams.map(t =>
            t.id === team.id ? { ...t, score: validScore } : t
        ));
        setScores({ ...scores, [team.id]: '' });
    };

    const handleResetAll = () => {
        if (window.confirm('Are you sure you want to reset everything? This will delete all teams and their scores.')) {
            setTeams([]);
            localStorage.removeItem(STORAGE_KEY);
            setError(null);
            setScores({});
            setDialogOpen(false);
            setEditingTeam(null);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Game Management</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleResetAll}
                        disabled={teams.length === 0}
                        startIcon={<DeleteIcon />}
                    >
                        Reset Everything
                    </Button>
                    <Button variant="contained" onClick={handleAddTeam}>
                        Add Team
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Team Management Section */}
                <Grid item xs={12} md={7}>
                    <List>
                        {teams.map((team) => (
                            <ListItem
                                key={team.id}
                                sx={{
                                    mb: 2,
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: `${team.color}15`,
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    width: '100%',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}>
                                    <ListItemText
                                        primary={
                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span style={{ fontSize: '1.2em' }}>{team.emoji}</span>
                                                {team.name}
                                            </Box>
                                        }
                                        sx={{
                                            flex: '1 1 200px',
                                            '& .MuiListItemText-primary': {
                                                color: team.color,
                                                fontWeight: 'bold',
                                            }
                                        }}
                                    />

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        flex: '1 1 200px'
                                    }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="Score"
                                            value={scores[team.id] !== undefined ? scores[team.id] : team.score}
                                            onChange={(e) => handleScoreChange(team, e.target.value)}
                                            onBlur={() => handleScoreBlur(team)}
                                            sx={{ width: '100px' }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton onClick={() => handleEditTeam(team)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteTeam(team)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                {/* Leaderboard Section */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                        <Typography variant="h6" gutterBottom sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2
                        }}>
                            <EmojiEventsIcon /> Leaderboard
                        </Typography>

                        {sortedTeams.map((team, index) => (
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
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: team.color
                                    }}
                                >
                                    {team.score}
                                </Typography>
                            </Paper>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>{editingTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Team Name"
                        fullWidth
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        sx={{ mb: 3 }}
                    />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Team Color:</Typography>
                    <Grid container spacing={1}>
                        {TEAM_COLORS.map((color) => (
                            <Grid item key={color.value}>
                                <Button
                                    sx={{
                                        minWidth: '48px',
                                        height: '48px',
                                        backgroundColor: color.value,
                                        border: selectedColor === color.value ? '3px solid black' : 'none',
                                        '&:hover': {
                                            backgroundColor: color.value,
                                        }
                                    }}
                                    onClick={() => setSelectedColor(color.value)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTeam} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={3000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setError(null)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeamSelector; 