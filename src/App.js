import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import TeamSelector from './components/TeamSelector';
import Leaderboard from './components/Leaderboard';

const Play = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5">Play Game</Typography>
    <Typography>Coming soon: Start playing the trivia game!</Typography>
  </Box>
);

const Admin = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5">Admin Panel</Typography>
    <Typography>Coming soon: Manage questions and game settings!</Typography>
  </Box>
);

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
            <Tab label="Team Management" />
            <Tab label="Leaderboard" />
            <Tab label="Play" />
            <Tab label="Admin" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <TeamSelector teams={teams} setTeams={setTeams} />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <Leaderboard teams={teams} />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <Play />
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <Admin />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App;
