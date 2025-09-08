# IPTV Player

A modern React-based web application that acts like Netflix or YouTube, designed to stream IPTV content using the Xtream Codes API.

## Features

- 🔐 **Secure Login**: IPTV server authentication with credential management
- 🎬 **Movie Streaming**: Browse and stream movies with HLS support
- 📺 **TV Series**: Watch TV series with episode selection
- 🔍 **Search & Filter**: Search content and filter by categories
- 📱 **Responsive Design**: Modern UI that works on all devices
- ⬇️ **Download Support**: Download videos for offline viewing
- 🎮 **Advanced Player**: Full-featured video player with controls
- 💾 **State Management**: Persistent app state with Zustand

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **HLS.js** for video streaming
- **Axios** for API calls
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- IPTV server with Xtream Codes API support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iptv_videos_downloader
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Login

1. Enter your IPTV server credentials:
   - **Server URL**: Your IPTV server domain or IP address
   - **Port**: Server port (usually 80 or 8080)
   - **Username**: Your IPTV account username
   - **Password**: Your IPTV account password

2. Click "Connect to IPTV Server" to authenticate

### Browsing Content

- **Home**: Featured movies and series
- **Movies**: Browse all available movies
- **TV Series**: Browse all available TV series
- **Search**: Search for specific content
- **Categories**: Filter content by category

### Video Player

- **Play/Pause**: Click the play button or spacebar
- **Seek**: Drag the progress bar
- **Volume**: Use the volume slider or M key
- **Fullscreen**: Click the fullscreen button or F key
- **Download**: Click the download button to save videos

## API Integration

The app uses the Xtream Codes API with the following endpoints:

- `player_api.php?action=get_account_info` - Get account information
- `player_api.php?action=get_vod_categories` - Get movie categories
- `player_api.php?action=get_series_categories` - Get series categories
- `player_api.php?action=get_vod_streams` - Get movies list
- `player_api.php?action=get_series` - Get series list
- `player_api.php?action=get_series_info` - Get series details

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=IPTV Player
VITE_APP_VERSION=1.0.0
```

### Customization

- **Colors**: Modify the color scheme in `tailwind.config.js`
- **API Timeout**: Adjust timeout values in `src/services/authService.ts`
- **Player Settings**: Configure HLS.js options in `src/components/VideoPlayer.tsx`

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Common Issues

1. **Login Failed**: Check your IPTV server credentials and network connection
2. **Video Not Playing**: Ensure your browser supports HLS or try a different browser
3. **Download Issues**: Check if the server allows downloads and your browser's download settings

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the Xtream Codes API documentation

## Acknowledgments

- Xtream Codes API for IPTV integration
- HLS.js for video streaming support
- React and Vite teams for the excellent development experience