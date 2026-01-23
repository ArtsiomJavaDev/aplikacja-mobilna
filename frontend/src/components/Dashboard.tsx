import React from 'react';
import { 
  Typography, 
  Box,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to your dashboard! Here you'll be able to manage your crypto portfolio.
      </Typography>
      
      <Stack spacing={2} mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Portfolio Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your portfolio details will appear here
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your recent transactions will appear here
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Dashboard; 