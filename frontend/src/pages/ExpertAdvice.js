import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
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
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import CloudIcon from '@mui/icons-material/Cloud';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ExpertAdvice = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    city: '',
    cropType: '',
    soilType: '',
    language: 'en'
  });
  const [advice, setAdvice] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [testingAi, setTestingAi] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const soilTypes = [
    'Sandy',
    'Clay',
    'Loamy',
    'Silt',
    'Peaty',
    'Chalky',
  ];

  const cropTypes = [
    'Rice',
    'Wheat',
    'Maize',
    'Sugarcane',
    'Cotton',
    'Soybean',
    'Potato',
    'Tomato',
    'Onion',
    'Other',
  ];

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If language is changed, update the app's language
    if (name === 'language') {
      console.log('Changing language to:', value);
      i18n.changeLanguage(value);
      localStorage.setItem('i18nextLng', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAdvice('');

    try {
      console.log('Sending request to backend with data:', formData);
      const response = await axios.post('http://localhost:5000/api/expert-advice', formData);
      setAdvice(response.data.advice);
      setWeather(response.data.weather);
      toast.success('Advice generated successfully!');
    } catch (err) {
      console.error('Error getting advice:', err);
      setError(t('expertAdvice.error'));
      toast.error('Error getting advice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          {t('expertAdvice.title')}
        </Typography>

        {/* AI Status Box */}
        <Box sx={{ mb: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: aiStatus?.success ? 'success.light' : 'error.light'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {testingAi ? (
                <CircularProgress size={20} />
              ) : aiStatus?.success ? (
                <Typography color="success.main">✓ AI API is working</Typography>
              ) : (
                <Typography color="error.main">✗ AI API is not available</Typography>
              )}
            </Box>
            <Button 
              variant="outlined" 
              size="small"
              onClick={testAiConnection}
              disabled={testingAi}
            >
              Test Again
            </Button>
          </Paper>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Enter City Name"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  helperText="Enter your city name for weather information"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  // label="What crop are you growing?"
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  required
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select your crop type</option>
                  {cropTypes.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  // label="What type of soil do you have?"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  required
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select your soil type</option>
                  {soilTypes.map((soil) => (
                    <option key={soil} value={soil}>
                      {soil}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Select Language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !aiStatus?.success}
            startIcon={loading ? <CircularProgress size={20} /> : <AgricultureIcon />}
            sx={{ py: 1.5 }}
          >
            {loading ? t('common.loading') : t('expertAdvice.form.submit')}
          </Button>
        </Box>

        {error && (
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        )}

        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ mt: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('expertAdvice.weather.title')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ThermostatIcon color="primary" sx={{ fontSize: 40 }} />
                      <Typography variant="h6">{weather.temp}°C</Typography>
                      <Typography variant="body2" color="text.secondary">{t('expertAdvice.weather.temperature')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <WaterDropIcon color="primary" sx={{ fontSize: 40 }} />
                      <Typography variant="h6">{weather.humidity}%</Typography>
                      <Typography variant="body2" color="text.secondary">{t('expertAdvice.weather.humidity')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AirIcon color="primary" sx={{ fontSize: 40 }} />
                      <Typography variant="h6">{weather.wind_speed} m/s</Typography>
                      <Typography variant="body2" color="text.secondary">{t('expertAdvice.weather.windSpeed')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudIcon color="primary" sx={{ fontSize: 40 }} />
                      <Typography variant="h6">{weather.description}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('expertAdvice.weather.description')}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {advice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t('expertAdvice.title')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography
                component="div"
                sx={{
                  whiteSpace: 'pre-wrap',
                  '& p': { mb: 2 },
                  '& ul': { pl: 3, mb: 2 },
                  '& li': { mb: 1 },
                }}
                dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }}
              />
            </Paper>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

export default ExpertAdvice; 