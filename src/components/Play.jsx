import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Zoom,
    Collapse,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import categoriesData from '../data/categories.json';

const Play = ({ teams, setTeams }) => {
    const [selectedCategories, setSelectedCategories] = useState(() => {
        const saved = localStorage.getItem('selected_categories');
        return saved ? JSON.parse(saved) : [];
    });
    const [confirmReset, setConfirmReset] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const handleCategoryClick = (categoryId) => {
        if (!selectedCategories.includes(categoryId)) {
            const newSelected = [...selectedCategories, categoryId];
            setSelectedCategories(newSelected);
            localStorage.setItem('selected_categories', JSON.stringify(newSelected));
        }
    };

    const handleRestartGame = () => {
        setConfirmReset(true);
    };

    const confirmRestartGame = () => {
        // Reset scores but keep team data
        setTeams(teams.map(team => ({ ...team, score: 0 })));
        // Reset selected categories
        setSelectedCategories([]);
        localStorage.removeItem('selected_categories');
        setConfirmReset(false);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
                position: 'relative'
            }}>
                <Box sx={{ position: 'absolute', left: 0 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RestartAltIcon />}
                        onClick={handleRestartGame}
                        color="warning"
                    >
                        Restart Game
                    </Button>
                </Box>
                <Typography variant="h5" sx={{ textAlign: 'center' }}>
                    Select Category
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {categoriesData.categories.map((category, index) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={category.id}>
                            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                                <Card
                                    sx={{
                                        cursor: isSelected ? 'default' : 'pointer',
                                        opacity: isSelected ? 0.6 : 1,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: isSelected ? 'none' : 'translateY(-4px)',
                                            boxShadow: isSelected ? 1 : 4
                                        },
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => !isSelected && handleCategoryClick(category.id)}
                                    onMouseEnter={() => setHoveredCategory(category.id)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <CardContent sx={{
                                        textAlign: 'center',
                                        py: 4,
                                    }}>
                                        <Typography
                                            sx={{
                                                fontSize: '2.5rem',
                                                mb: 2,
                                                opacity: isSelected ? 0.5 : 1,
                                                transform: hoveredCategory === category.id ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        >
                                            {category.emoji}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: isSelected ? 'text.disabled' : 'text.primary',
                                                mb: 1
                                            }}
                                        >
                                            {category.name}
                                        </Typography>
                                        <Collapse in={hoveredCategory === category.id}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    opacity: isSelected ? 0.7 : 1,
                                                    px: 2
                                                }}
                                            >
                                                {category.description}
                                            </Typography>
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog
                open={confirmReset}
                onClose={() => setConfirmReset(false)}
            >
                <DialogTitle>Restart Game?</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will reset all scores and category selections, but keep the teams.
                        Are you sure you want to restart the game?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
                    <Button
                        onClick={confirmRestartGame}
                        color="warning"
                        variant="contained"
                    >
                        Restart Game
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Play; 