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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const TEAM_COLORS = [
    { name: 'Red', value: '#ef5350' },
    { name: 'Purple', value: '#ab47bc' },
    { name: 'Blue', value: '#42a5f5' },
    { name: 'Teal', value: '#26a69a' },
    { name: 'Green', value: '#66bb6a' },
    { name: 'Orange', value: '#ffa726' },
    { name: 'Deep Purple', value: '#7e57c2' },
    { name: 'Cyan', value: '#26c6da' },
];

const STORAGE_KEY = 'trivia_teams';

const TeamSelector = () => {
    const [teams, setTeams] = useState(() => {
        try {
            const savedTeams = localStorage.getItem(STORAGE_KEY);
            return savedTeams ? JSON.parse(savedTeams) : [];
        } catch (error) {
            console.error('Error loading teams:', error);
            return [];
        }
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0].value);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
        } catch (error) {
            setError('Failed to save teams to storage');
            console.error('Error saving teams:', error);
        }
    }, [teams]);

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
        setTeams(teams.filter(team => team.id !== teamToDelete.id));
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
            };
            setTeams([...teams, newTeam]);
        }
        setDialogOpen(false);
    };

    const handleClearTeams = () => {
        try {
            setTeams([]);
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            setError('Failed to clear teams');
            console.error('Error clearing teams:', error);
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Team Management</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClearTeams}
                        disabled={teams.length === 0}
                    >
                        Clear All Teams
                    </Button>
                    <Button variant="contained" onClick={handleAddTeam}>
                        Add Team
                    </Button>
                </Box>
            </Box>

            <List>
                {teams.map((team) => (
                    <ListItem
                        key={team.id}
                        sx={{
                            mb: 1,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: `${team.color}15`,
                            pr: '160px',
                        }}
                        secondaryAction={
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}>
                                <Typography
                                    sx={{
                                        color: team.color,
                                        fontWeight: 'bold',
                                        minWidth: '80px',
                                        mr: 1
                                    }}
                                >
                                    Score: {team.score}
                                </Typography>
                                <IconButton onClick={() => handleEditTeam(team)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteTeam(team)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }
                    >
                        <ListItemText
                            primary={team.name}
                            sx={{
                                '& .MuiListItemText-primary': {
                                    color: team.color,
                                    fontWeight: 'bold',
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>

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
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseError}
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