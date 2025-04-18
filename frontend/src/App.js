import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import theme from './theme';
import './i18n';  // Import i18n configuration
import { useTranslation } from 'react-i18next';

// Lazy load components
const Navbar = React.lazy(() => import('./components/Navbar'));
const Footer = React.lazy(() => import('./components/Footer'));
const Home = React.lazy(() => import('./pages/Home'));
const DiseaseDetection = React.lazy(() => import('./pages/DiseaseDetection'));
const ExpertAdvice = React.lazy(() => import('./pages/ExpertAdvice'));
const FarmerContribution = React.lazy(() => import('./pages/FarmerContribution'));
const BuyMedicine = React.lazy(() => import('./pages/BuyMedicine'));
const About = React.lazy(() => import('./pages/About'));

// Loading component
const Loading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

function App() {
  const { i18n } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<Loading />}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/disease-detection" element={<DiseaseDetection />} />
                <Route path="/expert-advice" element={<ExpertAdvice />} />
                <Route path="/farmer-contribution" element={<FarmerContribution />} />
                <Route path="/buy-medicine" element={<BuyMedicine />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App; 