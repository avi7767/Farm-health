from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
import json
import requests
from PIL import Image
import io
import base64
import pickle
import random
from datetime import datetime
from dotenv import load_dotenv
import logging
import sys

# Configure TensorFlow for better performance
tf.config.threading.set_intra_op_parallelism_threads(4)
tf.config.threading.set_inter_op_parallelism_threads(4)
tf.config.set_soft_device_placement(True)

# Enable mixed precision for faster computation
tf.keras.mixed_precision.set_global_policy('mixed_float16')

# Configure logging to output to both file and console
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('flask_app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

print("Starting application...")

try:
    # Load environment variables
    load_dotenv()
    logger.info("Environment variables loaded")

    # Log API key status (masked for security)
    nvidia_api_key = os.getenv('NVIDIA_API_KEY')
    if nvidia_api_key:
        masked_key = nvidia_api_key[:8] + '...' + nvidia_api_key[-4:]
        logger.info(f"NVIDIA API key loaded: {masked_key}")
    else:
        logger.error("NVIDIA API key not found in environment variables")

    app = Flask(__name__)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:*"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    print("Flask app and CORS initialized")

    # Get API keys from environment variables
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')

    if not WEATHER_API_KEY:
        print("Warning: WEATHER_API_KEY not found in environment variables")
    else:
        print("WEATHER_API_KEY loaded successfully")

    # Load class names
    class_names = [
        'Apple__Apple_scab', 'Apple_Black_rot', 'Apple_Cedar_apple_rust', 'Apple__healthy',
        'Blueberry__healthy', 'Cherry(including_sour)_Powdery_mildew',
        'Cherry_(including_sour)healthy', 'Corn(maize)_Cercospora_leaf_spot Gray_leaf_spot',
        'Corn_(maize)Common_rust', 'Corn_(maize)Northern_Leaf_Blight', 'Corn(maize)_healthy',
        'Grape__Black_rot', 'Grape_Esca(Black_Measles)', 'Grape__Leaf_blight(Isariopsis_Leaf_Spot)',
        'Grape__healthy', 'Orange_Haunglongbing(Citrus_greening)', 'Peach___Bacterial_spot',
        'Peach__healthy', 'Pepper,_bell_Bacterial_spot', 'Pepper,_bell__healthy',
        'Potato__Early_blight', 'Potato_Late_blight', 'Potato__healthy',
        'Raspberry__healthy', 'Soybean_healthy', 'Squash__Powdery_mildew',
        'Strawberry__Leaf_scorch', 'Strawberry_healthy', 'Tomato__Bacterial_spot',
        'Tomato__Early_blight', 'Tomato_Late_blight', 'Tomato__Leaf_Mold',
        'Tomato__Septoria_leaf_spot', 'Tomato__Spider_mites Two-spotted_spider_mite',
        'Tomato__Target_Spot', 'Tomato_Tomato_Yellow_Leaf_Curl_Virus', 'Tomato_Tomato_mosaic_virus',
        'Tomato_healthy'
    ]
    print(f"Class names loaded: {len(class_names)} classes")

    # Function to preprocess image
    def preprocess_image(image):
        # Convert to RGB if needed
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
        
        # Resize image to 128x128 (matching Streamlit implementation)
        image = cv2.resize(image, (128, 128))
        
        # Normalize pixel values
        image = image.astype(np.float32) / 255.0
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        return image

    # Function to get weather data
    def get_weather_data(city):
        try:
            logger.info(f"Fetching weather data for {city}...")
            response = requests.get(
                f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
            )
            
            logger.info(f"Weather API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "temp": round(data["main"]["temp"], 1),
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"],
                    "description": data["weather"][0]["description"].capitalize()
                }
            else:
                error_msg = f"Weather API Error: Status code {response.status_code}"
                logger.error(error_msg)
                logger.error(f"Response text: {response.text}")
                return None
        except Exception as e:
            error_msg = f"Weather API Error: {str(e)}"
            logger.error(error_msg)
            return None

    # Function to get chatbot response
    def get_chatbot_response(prompt, selected_language):
        try:
            # Log the API key status (masked for security)
            if nvidia_api_key:
                masked_key = nvidia_api_key[:8] + '...' + nvidia_api_key[-4:]
                logger.info(f"Using NVIDIA API key: {masked_key}")
            else:
                logger.error("NVIDIA API key is missing!")
                return "Error: API key not configured"

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {nvidia_api_key}"
            }
            
            data = {
                "model": "nvidia/llama-3.1-nemotron-70b-instruct",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert plant pathologist and agricultural advisor."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.5,
                "top_p": 1,
                "max_tokens": 1024,
                "stream": False
            }
            
            logger.info(f"Making AI API request with prompt: {prompt[:100]}...")
            logger.info(f"Request URL: https://integrate.api.nvidia.com/v1/chat/completions")
            logger.info(f"Request headers: {headers}")
            logger.info(f"Request data: {data}")
            
            # Use the correct API endpoint
            response = requests.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            logger.info(f"AI API Response Status: {response.status_code}")
            logger.info(f"AI API Response Headers: {response.headers}")
            logger.info(f"AI API Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                advice = result["choices"][0]["message"]["content"].strip()
                logger.info(f"Successfully received advice: {advice[:100]}...")
                return advice
            else:
                error_msg = f"AI API Error: Status code {response.status_code}"
                logger.error(error_msg)
                logger.error(f"Response text: {response.text}")
                return f"Error getting advice: {error_msg}"

        except requests.exceptions.Timeout:
            error_msg = "AI API request timed out after 30 seconds"
            logger.error(error_msg)
            return f"Error getting advice: {error_msg}"
        except requests.exceptions.RequestException as e:
            error_msg = f"AI API request failed: {str(e)}"
            logger.error(error_msg)
            return f"Error getting advice: {error_msg}"
        except Exception as e:
            error_msg = f"AI API Error: {str(e)}"
            logger.error(error_msg)
            return f"Error getting advice: {error_msg}"

    # Load model at startup
    model = None
    try:
        # First try loading with custom objects
        custom_objects = {
            'Adam': tf.keras.optimizers.legacy.Adam,
            'categorical_crossentropy': tf.keras.losses.categorical_crossentropy,
            'accuracy': tf.keras.metrics.categorical_accuracy
        }
        
        model = tf.keras.models.load_model(
            'new_plant_disease_model.keras',
            custom_objects=custom_objects,
            compile=False
        )
        
        # Compile with basic configuration
        model.compile(
            optimizer=tf.keras.optimizers.legacy.Adam(),
            loss='categorical_crossentropy',
            metrics=['categorical_accuracy']
        )
        
        logger.info("Model loaded successfully with custom objects")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        try:
            # Try loading without custom objects as fallback
            model = tf.keras.models.load_model('new_plant_disease_model.keras')
            logger.info("Model loaded successfully without custom objects")
        except Exception as e:
            logger.error(f"All model loading attempts failed: {str(e)}")
            model = None

    # Function to get treatment advice from AI
    def get_treatment_advice(disease_name):
        """Get treatment advice for the detected disease using AI API"""
        try:
            # Log the API key status (masked for security)
            if nvidia_api_key:
                masked_key = nvidia_api_key[:8] + '...' + nvidia_api_key[-4:]
                logger.info(f"Using NVIDIA API key: {masked_key}")
            else:
                logger.error("NVIDIA API key is missing!")
                return "Error: API key not configured"

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {nvidia_api_key}"
            }
            
            prompt = f"""As an expert plant pathologist, provide detailed treatment advice for {disease_name}. Include:
            1. Immediate actions to take
            2. Recommended treatments/medicines
            3. Preventive measures
            4. Expected recovery time
            5. When to seek professional help
            
            Format the response in clear, easy-to-follow steps."""
            
            data = {
                "model": "nvidia/llama-3.1-nemotron-70b-instruct",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert plant pathologist and agricultural advisor."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "top_p": 1,
                "max_tokens": 1024,
                "stream": False
            }
            
            logger.info(f"Making AI API request for disease: {disease_name}")
            
            # Use the correct API endpoint
            response = requests.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            logger.info(f"AI API Response Status: {response.status_code}")
            logger.info(f"AI API Response Headers: {response.headers}")
            logger.info(f"AI API Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                advice = result["choices"][0]["message"]["content"].strip()
                logger.info(f"Successfully received treatment advice for {disease_name}")
                return advice
            else:
                error_msg = f"AI API Error: Status code {response.status_code}"
                logger.error(error_msg)
                logger.error(f"Response text: {response.text}")
                return f"Error getting treatment advice: {error_msg}"

        except requests.exceptions.Timeout:
            error_msg = "AI API request timed out after 30 seconds"
            logger.error(error_msg)
            return f"Error getting treatment advice: {error_msg}"
        except requests.exceptions.RequestException as e:
            error_msg = f"AI API request failed: {str(e)}"
            logger.error(error_msg)
            return f"Error getting treatment advice: {error_msg}"
        except Exception as e:
            error_msg = f"Error getting treatment advice: {str(e)}"
            logger.error(error_msg)
            return error_msg

    # Route for disease prediction
    @app.route('/api/predict', methods=['POST'])
    def predict():
        global model
        try:
            if model is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Model not loaded'
                }), 500
            
            # Get the image from the request
            if 'image' not in request.files:
                return jsonify({"error": "No image file provided"}), 400
            
            file = request.files['image']
            
            # Read the image
            image_bytes = file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image format"}), 400
            
            # Preprocess the image
            processed_image = preprocess_image(image)
            
            # Make prediction
            logger.info("Making prediction...")
            predictions = model.predict(processed_image)
            predicted_class_index = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_index])
            predicted_class = class_names[predicted_class_index].replace('_', ' ').title()
            logger.info(f"Prediction: {predicted_class} with confidence {confidence}")
            
            # Get treatment advice from AI
            logger.info("Getting treatment advice from AI...")
            treatment_advice = get_treatment_advice(predicted_class)
            logger.info("Treatment advice received from AI")
            
            # Return the prediction results
            return jsonify({
                "disease": predicted_class,
                "confidence": confidence,
                "treatment": treatment_advice
            })
        
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Route for expert advice
    @app.route('/api/expert-advice', methods=['POST', 'OPTIONS'])
    def get_expert_advice():
        if request.method == 'OPTIONS':
            return '', 200
        
        try:
            data = request.get_json()
            print("Received request data:", data)
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            city = data.get('city')
            crop_type = data.get('cropType')
            soil_type = data.get('soilType')
            language = data.get('language', 'English')
            
            if not all([city, crop_type, soil_type]):
                return jsonify({'error': 'Missing required parameters'}), 400
            
            print(f"Getting advice for {crop_type} in {city} with {soil_type} soil")
            
            # Get weather data
            weather_data = get_weather_data(city)
            if not weather_data:
                return jsonify({'error': 'Failed to fetch weather data'}), 500
            
            # Get AI advice
            prompt = f"""
            Provide detailed farming advice for {crop_type} in {language} with the following details:
            - Location: {city}
            - Soil type: {soil_type}
            - Current weather: {weather_data['description']}
            - Temperature: {weather_data['temp']}°C
            - Humidity: {weather_data['humidity']}%
            - Wind speed: {weather_data['wind_speed']} m/s
            
            Include the following sections:
            1. Best planting practices
            2. Soil preparation tips
            3. Water management
            4. Fertilizer recommendations
            5. Pest control measures
            6. Weather-specific precautions
            7. Expected yield and harvest time
            """
            
            advice = get_chatbot_response(prompt, language)
            if not advice:
                return jsonify({'error': 'Failed to get AI advice'}), 500
            
            return jsonify({
                'advice': advice,
                'weather': weather_data
            })
        
        except Exception as e:
            print(f"Error in expert advice: {str(e)}")
            return jsonify({'error': str(e)}), 500

    # Route for testing API connection
    @app.route('/api/test-ai', methods=['GET', 'OPTIONS'])
    def test_ai():
        if request.method == 'OPTIONS':
            return '', 200
            
        try:
            # Check if API key is loaded
            if not nvidia_api_key:
                error_msg = "NVIDIA API key not found in environment variables"
                logger.error(error_msg)
                return jsonify({
                    "status": "error",
                    "message": error_msg
                }), 500
            
            # Log the API key status (masked for security)
            masked_key = nvidia_api_key[:8] + '...' + nvidia_api_key[-4:]
            logger.info(f"Testing AI API with key: {masked_key}")

            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {nvidia_api_key}'
            }
            
            data = {
                "model": "nvidia/llama-3.1-nemotron-70b-instruct",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello, this is a test message."
                    }
                ],
                "temperature": 0.5,
                "top_p": 1,
                "max_tokens": 100,
                "stream": False
            }
            
            logger.info("Sending test request to NVIDIA API...")
            logger.info(f"Request URL: https://integrate.api.nvidia.com/v1/chat/completions")
            logger.info(f"Request headers: {headers}")
            logger.info(f"Request data: {data}")
            
            # Use the correct API endpoint
            response = requests.post(
                'https://integrate.api.nvidia.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            logger.info(f"NVIDIA API Response Status: {response.status_code}")
            logger.info(f"NVIDIA API Response Headers: {response.headers}")
            logger.info(f"NVIDIA API Response: {response.text}")
            
            if response.status_code == 200:
                logger.info("AI API test successful")
                return jsonify({
                    "status": "success",
                    "message": "AI API connection successful",
                    "response": response.json()
                })
            else:
                error_msg = f"AI API returned error status: {response.status_code}"
                logger.error(error_msg)
                logger.error(f"Response text: {response.text}")
                return jsonify({
                    "status": "error",
                    "message": error_msg,
                    "details": response.text
                }), 500
            
        except requests.exceptions.Timeout:
            error_msg = "AI API request timed out after 30 seconds"
            logger.error(error_msg)
            return jsonify({
                "status": "error",
                "message": error_msg
            }), 500
        except requests.exceptions.RequestException as e:
            error_msg = f"AI API request failed: {str(e)}"
            logger.error(error_msg)
            return jsonify({
                "status": "error",
                "message": error_msg
            }), 500
        except Exception as e:
            error_msg = f"AI API connection error: {str(e)}"
            logger.error(error_msg)
            return jsonify({
                "status": "error",
                "message": error_msg
            }), 500

    # Route for testing API connection
    @app.route('/api/test-connection', methods=['GET'])
    def test_connection():
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {nvidia_api_key}"
            }
            
            data = {
                "model": "nvidia/llama-3.1-nemotron-70b-instruct",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Say hello and confirm you are working."}
                ],
                "temperature": 0.5,
                "top_p": 1,
                "max_tokens": 100,
                "stream": False
            }
            
            print("Testing API connection...")
            response = requests.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("API connection successful")
                return jsonify({
                    "status": "success",
                    "message": "API connection successful",
                    "response": result["choices"][0]["message"]["content"].strip()
                })
            else:
                print(f"API Error: Status code {response.status_code}")
                return jsonify({
                    "status": "error",
                    "message": f"API Error: Status code {response.status_code}",
                    "details": response.text
                }), 500
            
        except Exception as e:
            print(f"API connection error: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "API connection failed",
                "details": str(e)
            }), 500

    # Route for getting translations
    @app.route('/api/translations', methods=['GET'])
    def get_translations():
        try:
            language = request.args.get('language', 'English')
            print(f"Getting translations for language: {language}")
            
            # Import translations from the translations module
            from translations import translations
            
            # Return translations for the requested language, or English as fallback
            return jsonify(translations.get(language, translations['English']))
        except Exception as e:
            print(f"Error getting translations: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Add a test route
    @app.route('/test')
    def test():
        return jsonify({"status": "ok", "message": "Flask server is running"})

    if __name__ == '__main__':
        try:
            port = int(os.getenv('PORT', 5000))
            logger.info(f"Starting Flask application on port {port}...")
            app.run(debug=True, host='127.0.0.1', port=port)
        except Exception as e:
            logger.error(f"Failed to start Flask application: {str(e)}", exc_info=True)
            sys.exit(1)
except Exception as e:
    logger.error(f"Application initialization error: {str(e)}", exc_info=True)
    sys.exit(1) 