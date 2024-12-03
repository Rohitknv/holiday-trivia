import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import TeamSelector from './components/TeamSelector';
import Play from './components/Play';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index} role="tabpanel">
            {value === index && children}
        </div>
    );
}

function App() {
    const [currentTab, setCurrentTab] = useState(0);
    const [teams, setTeams] = useState(() => {
        try {
            const savedTeams = localStorage.getItem('trivia_teams');
            return savedTeams ? JSON.parse(savedTeams) : [];
        } catch {
            return [];
        }
    });

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        centered
                    >
                        <Tab label="Game Management" />
                        <Tab label="Play" />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    <TeamSelector teams={teams} setTeams={setTeams} />
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    <Play teams={teams} setTeams={setTeams} />
                </TabPanel>
            </Box>
        </Container>
    );
}

export default App;
