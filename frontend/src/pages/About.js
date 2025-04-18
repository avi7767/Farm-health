import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import ScienceIcon from '@mui/icons-material/Science';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';

const About = ({ translations }) => {
  const teamMembers = [
    {
      name: 'Addanki Avinash',
      role: translations?.team_lead || 'Team Lead',
      avatar: '/avatars/team1.jpg',
    },
    {
      name: 'Gattikoppula Shiva Pranava Sai',
      role: translations?.ml_expert || 'Developer',
      avatar: '/avatars/team2.jpg',
    },
    {
      name: 'Chada Sai Manish',
      role: translations?.developer || 'Developer',
      avatar: '/avatars/team3.jpg',
    },
  ];

  const technologies = [
    {
      name: 'TensorFlow',
      description: translations?.tensorflow_desc || 'Deep learning framework for model training and inference',
      icon: <ScienceIcon sx={{ fontSize: 40 }} />,
    },
    {
      name: 'React',
      description: translations?.react_desc || 'Frontend library for building user interfaces',
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
    },
    {
      name: 'Flask',
      description: translations?.flask_desc || 'Backend framework for API development',
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
    },
    {
      name: 'Plant Pathology',
      description: translations?.pathology_desc || 'Scientific knowledge for disease identification',
      icon: <AgricultureIcon sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ mb: 2 }}
          >
            {translations?.about_us || 'About Us'}
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
          >
            {translations?.about_description ||
              'We are dedicated to helping farmers protect their crops using advanced AI technology'}
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {translations?.our_mission || 'Our Mission'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {translations?.mission_text ||
                      'Our mission is to provide farmers with accessible, accurate, and timely information about plant diseases. By leveraging artificial intelligence and machine learning, we aim to help farmers identify diseases early and take appropriate action to protect their crops.'}
                  </Typography>
                  <Typography variant="body1">
                    {translations?.mission_text_2 ||
                      'We believe that technology can play a crucial role in sustainable agriculture and food security. Our platform is designed to be user-friendly, accessible in multiple languages, and provide practical advice that farmers can implement immediately.'}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {translations?.how_it_works || 'How It Works'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {translations?.how_it_works_text ||
                      'Our plant disease detection system uses a deep learning model trained on thousands of plant leaf images. When you upload an image, our AI analyzes it to identify any signs of disease and provides a confidence score.'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {translations?.how_it_works_text_2 ||
                      'For expert advice, we combine weather data from your location with information about your crop type and soil conditions. Our AI then generates personalized recommendations to help you manage your crops effectively.'}
                  </Typography>
                  <Typography variant="body1">
                    {translations?.how_it_works_text_3 ||
                      'All of this is presented in a simple, intuitive interface that works on both desktop and mobile devices, making it accessible to farmers everywhere.'}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          {translations?.technologies || 'Technologies We Use'}
        </Typography>
        <Grid container spacing={4}>
          {technologies.map((tech, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      color: 'white',
                      mb: 2,
                    }}
                  >
                    {tech.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {tech.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tech.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          {translations?.our_team || 'Our Team'}
        </Typography>
        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Avatar
                    src={member.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      mt: 3,
                      mb: 2,
                      border: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      {member.role}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {translations?.research || 'Research & Development'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
            {translations?.research_text ||
              'Our team is constantly working to improve our models and expand our knowledge base. We collaborate with agricultural research institutions and universities to ensure our technology remains at the forefront of plant disease detection.'}
          </Typography>
          <Typography variant="body1">
            {translations?.contact_us || 'Contact us'}:
            <a
              href="mailto:info@plantdiseaseapp.com"
              style={{ color: 'white', textDecoration: 'underline', marginLeft: '5px' }}
            >
              info@plantdiseaseapp.com
            </a>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About; 