import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  Paper, 
  Chip, 
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';

const PredictionResult = ({ prediction, onRetry }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!prediction || typeof prediction !== 'object') {
    return null;
  }

  const { disease, confidence, treatment } = prediction;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('diseaseDetection.result.title')}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('diseaseDetection.result.disease')}: {String(disease)}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            {t('diseaseDetection.result.confidence')}: {Number(confidence).toFixed(2)}%
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('diseaseDetection.result.treatment')}:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Typography>
                {String(treatment || t('diseaseDetection.error.noTreatment'))}
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
          >
            {t('diseaseDetection.result.retry')}
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default PredictionResult; 