import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const scoreChangeAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const scoreIncreaseFlash = keyframes`
  0% { color: inherit; }
  50% { color: #4caf50; }
  100% { color: inherit; }
`;

const scoreDecreaseFlash = keyframes`
  0% { color: inherit; }
  50% { color: #f44336; }
  100% { color: inherit; }
`;

const AnimatedScore = ({ score, color }) => {
    const [prevScore, setPrevScore] = useState(score);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isIncrease, setIsIncrease] = useState(true);

    useEffect(() => {
        if (score !== prevScore) {
            setIsAnimating(true);
            setIsIncrease(score > prevScore);
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setPrevScore(score);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [score, prevScore]);

    return (
        <Typography
            variant="h6"
            sx={{
                fontWeight: 'bold',
                color: color,
                animation: isAnimating
                    ? `${scoreChangeAnimation} 1s ease, ${isIncrease ? scoreIncreaseFlash : scoreDecreaseFlash} 1s ease`
                    : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5
            }}
        >
            {score}
            {isAnimating && (
                <Typography
                    component="span"
                    sx={{
                        fontSize: '0.8em',
                        color: isIncrease ? '#4caf50' : '#f44336',
                        opacity: isAnimating ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    {isIncrease ? '+' : '-'}{Math.abs(score - prevScore)}
                </Typography>
            )}
        </Typography>
    );
};

export default AnimatedScore; 