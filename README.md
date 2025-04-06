# 3D Optimization and Women's Support Platform

## Overview

This project combines an interactive 3D room visualization with AI-powered support features specifically designed for women. The platform offers various support mechanisms including a virtual AI assistant (Well Wisher), inspirational stories, and informational resources - all presented within an engaging 3D environment.

## Features

### 3D Visualization
- Interactive 3D room scene featuring a detailed environment using Three.js
- Optimized 3D model loading with DRACO compression
- Responsive camera controls for intuitive navigation
- Custom lighting and environment settings for enhanced visual experience

### Well Wisher Chatbot
- AI-powered assistant using Google's Gemini API
- Context-aware responses for various women-focused topics
- Category-specific guidance (career, mental health, abuse support, general advice)
- Real-time chat interface with instant responses

### Inspirational Stories
- AI-generated stories about women overcoming challenges
- Streaming response format for smooth reading experience
- Custom prompt engineering for positive, uplifting content
- Separate API configuration for story generation

### Additional Resources
- Educational content about various support schemes
- Curated information presented in an accessible format
- Multiple topic pages (grass.html, laptop.html, schemes.html)
- User-friendly navigation between different resources

### Technical Features
- Modular architecture with clear separation of concerns
- Flask backend for API integration and serving static files
- Environment-based API key management for security
- Error handling and logging for reliability
- CORS support for cross-origin requests
- Responsive design for various device types

## Setup and Installation

1. Install Python dependencies:
   ```
   pip install -r chatbot/requirements.txt
   ```

2. Create a `.env` file in the project root with your API keys:
   ```
   WELLWISHER_API_KEY=your_gemini_api_key_for_wellwisher
   STORIES_API_KEY=your_gemini_api_key_for_stories
   ```

3. Start the Flask server:
   ```
   cd chatbot
   python main.py
   ```

4. Access the application at http://localhost:5000

## Project Structure

- `main.js`: Entry point for the 3D visualization
- `index.html`: Main HTML page containing the 3D scene
- `chatbot/`: Contains Flask server and chatbot functionality
- `js/`: Three.js related files and modules
- `public/`: Static resources and additional HTML pages
- `public/models/`: 3D models used in the visualization

## Possible Future Enhancements

### 3D Environment
- Add interactive objects within the 3D scene
- Implement day/night cycle with dynamic lighting
- Create multiple room templates for different scenarios
- Add animations for more dynamic visual experience
- Implement VR/AR compatibility for immersive experience

### AI Features
- Expand topic categories with more specialized advice areas
- Add voice input/output for more accessible interaction
- Implement user accounts to remember conversation history
- Create personalized recommendations based on chat history
- Add multilingual support for global accessibility

### User Experience
- Implement guided tours explaining available resources
- Add interactive tutorials for navigating the 3D space
- Create mobile-optimized version with touch controls
- Add customization options for the interface appearance
- Implement progress tracking for users following advice

### Technical Improvements
- Implement caching for faster model loading
- Add offline support with service workers
- Create a mobile app version using frameworks like React Native
- Optimize 3D models further for lower-end devices
- Implement analytics to understand feature usage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).