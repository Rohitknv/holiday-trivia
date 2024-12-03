import { Box, Typography, Paper, Zoom, Fade } from '@mui/material';
import { keyframes } from '@mui/system';

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const CategoryTransition = ({ category, isActive }) => {
    return (
        <Fade in={isActive} timeout={500}>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    backgroundColor: 'grey.50',
                    position: 'relative',
                    animation: `${slideIn} 0.5s ease-out`,
                    mb: 3
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Typography
                        sx={{
                            fontSize: '2rem',
                            lineHeight: 1
                        }}
                    >
                        {category.emoji}
                    </Typography>
                    <Typography variant="h5">
                        {category.name}
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    {category.description}
                </Typography>
            </Paper>
        </Fade>
    );
};

export default CategoryTransition; 