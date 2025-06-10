# Unplayed

Discover new music from your favourite artists with 1 click!

This web app is built with a React & Redux frontend that integrates with Apple so that user's can sign in and authorize Unplayed to work with their Apple Music account and find music from your favourite artists that you have yet to listen to.

The server that the frontend communicates with is built with Python Flask. It helps to facilitate account creation, storing user preferences in a PostgreSQL database, and the overall functionality of Unplayed.

Together is a complete application meant to be of service to you and your music discovery! Don't spend hours if not days, hunting for new music. Use Unplayed, and cut that time by 99%, creating a playlist of new music almost instantaneously!

# How to Run
Client Side: 
1. Install the required npm packages and run with `npm run dev`
   
Server Side: 
1. Set up a database environment with `database.py`
2. `cd server`
3. `python filename.py`
4. Must set up an ngrok account to run `ngrok http {port_number}`

NOTE: You will need an Apple Developer Account to make use of Apple Music API and MusicKit JS


![Screenshot 2025-05-19 at 6 43 13 PM](https://github.com/user-attachments/assets/86c0bdc4-a22b-4bf7-8ee2-db42aa3cf0a2)
![Screenshot 2025-05-19 at 6 45 10 PM](https://github.com/user-attachments/assets/0d8f88e0-ecfa-4904-89c1-61bc17066c1e)
![Screenshot 2025-05-19 at 6 45 19 PM](https://github.com/user-attachments/assets/a4292fc7-ceec-4a91-901a-3c5cb05facba)

