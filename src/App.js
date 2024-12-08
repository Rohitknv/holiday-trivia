import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import TeamSelector from './components/TeamSelector';
import Play from './components/Play';
import Leaderboard from './components/Leaderboard';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index} role="tabpanel">
            {value === index && children}
        </div>
    );
}

const STORAGE_KEY = 'trivia_teams';

function App() {
    const [currentTab, setCurrentTab] = useState(0);
    const [teams, setTeams] = useState(() => {
        try {
            const savedTeams = localStorage.getItem(STORAGE_KEY);
            return savedTeams ? JSON.parse(savedTeams) : [];
        } catch {
            return [];
        }
    });

    // Save teams to localStorage whenever they change
    useEffect(() => {
        try {
            if (teams.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
            }
        } catch (error) {
            console.error('Failed to save teams to storage:', error);
        }
    }, [teams]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ width: '100%', mb: 4, mt: 3 }}>
                <Typography 
                    variant="h3" 
                    align="center" 
                    sx={{ 
                        fontWeight: 'bold',
                        mb: 4,  // Space between title and tabs
                        color: 'primary.main',  // Use theme primary color
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'  // Subtle shadow
                    }}
                >
                    GIR Holiday Trivia
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        centered
                        sx={{ mb: 3 }}
                    >
                        <Tab label="Teams" />
                        <Tab label="Play" disabled={teams.length < 2} />
                        <Tab label="Leaderboard" disabled={teams.length < 2} />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    <TeamSelector teams={teams} setTeams={setTeams} />
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    <Play teams={teams} setTeams={setTeams} />
                </TabPanel>
                <TabPanel value={currentTab} index={2}>
                    <Leaderboard teams={teams} />
                </TabPanel>
            </Box>
        </Container>
    );
}

export default App;
