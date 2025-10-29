# Instagram Auto Unfollow

An automated script to unfollow Instagram accounts using Puppeteer and Crawlee.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your Instagram credentials:
   
   ```env
   INSTAGRAM_USERNAME=your_instagram_username
   INSTAGRAM_PASSWORD=your_instagram_password
   MAX_UNFOLLOW_COUNT=100
   UNFOLLOW_DELAY=5000
   SCROLL_DELAY=3000
   ```

3. **Run the script:**
   ```bash
   npm start
   ```

## Configuration

- `INSTAGRAM_USERNAME`: Your Instagram username
- `INSTAGRAM_PASSWORD`: Your Instagram password  
- `MAX_UNFOLLOW_COUNT`: Maximum number of accounts to unfollow (default: 100)
- `UNFOLLOW_DELAY`: Delay between unfollows in milliseconds (default: 5000)
- `SCROLL_DELAY`: Delay when scrolling to load more users in milliseconds (default: 3000)

## Features

- Automatically logs into Instagram using stored cookies
- Navigates to your following list
- Unfollows accounts with configurable delays
- Saves session cookies for future runs
- Environment-based configuration for security

## Security

- Your credentials are stored in `.env` file which is ignored by git
- Session cookies are saved locally to avoid repeated logins
- All sensitive information is kept out of the source code

## Note

This script is for educational purposes. Please ensure you comply with Instagram's Terms of Service and use responsibly.

---

## Credits

This project was developed by **Kaif Ali**. All rights and credits go to Kaif Ali for creating and maintaining this repository.

## Support

If you like this project, please consider giving it a ⭐ on GitHub. Your support is greatly appreciated!