import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ErrorMessage from '../components/ErrorMessage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PredictionResult from '../components/PredictionResult';

// Define API URL
const API_URL = 'http://localhost:5000';

const DiseaseDetection = ({ translations }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [testingAi, setTestingAi] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    testAiConnection();
  }, []);

  const testAiConnection = async () => {
    setTestingAi(true);
    try {
      const response = await fetch('http://localhost:5000/api/test-ai');
      const data = await response.json();
      
      if (data.status === 'success') {
        setAiStatus({ success: true, message: 'AI API is working correctly' });
      } else {
        setAiStatus({ success: false, message: data.message });
      }
    } catch (err) {
      setAiStatus({ success: false, message: 'Failed to connect to AI API' });
    } finally {
      setTestingAi(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setPrediction(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPrediction(null);

    if (!selectedImage) {
      setError(t('diseaseDetection.error.noImage'));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && typeof response.data === 'object') {
        const predictionData = {
          disease: String(response.data.disease || ''),
          confidence: Number(response.data.confidence || 0),
          treatment: String(response.data.treatment || '')
        };

        if (typeof predictionData.disease === 'string' && 
            typeof predictionData.confidence === 'number' && 
            typeof predictionData.treatment === 'string') {
          setPrediction(predictionData);
        } else {
          throw new Error(t('diseaseDetection.error.invalidResponse'));
        }
      } else {
        throw new Error(t('diseaseDetection.error.invalidResponse'));
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setError(error.response?.data?.error || error.message || t('diseaseDetection.error.analysisFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('diseaseDetection.title')}
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Choose Plant Image to Upload
                </Button>
              </label>
            </Box>

            {selectedImage && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!selectedImage || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading ? t('diseaseDetection.analyzing') : 'Upload Image for Disease Detection'}
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {prediction && (
            <PredictionResult
              prediction={prediction}
              onRetry={() => {
                setSelectedImage(null);
                setPrediction(null);
                setError(null);
              }}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default DiseaseDetection; 