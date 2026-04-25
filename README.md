# Natural-Disaster-3D-Visualization
A website that uses Three.js and NASA's EONET API to display near real time data on a 3D earth. NPX VITE is also used to host a local server for the website

Resources Used:
8081_earthmap10k.jpg: Downloaded from https://planetpixelemporium.com/earth8081.html
https://threejs.org/manual/
https://eonet.gsfc.nasa.gov/api/v2.1/events

Purpose:
The purpose of this project is to represent where natural disaters are happening all over the world. These include wildfires, volcanoes, severe storms, and glaciers. This allows you to determine patterns in weather based on where these events take place.

Technologies used:
Three.js
NASA EONET API
NPX VITE
HTML, CSS, JavaScript

Setup:
Download and install Node.js https://nodejs.org/en/download
Install Three.js npm install three
Run the command npx vite
Click on the local host link

Features/Functionality:
Creates a globe using three.js, then gets data from NASA's EONET API. This gives you coordinates, which are then mapped to the correct location on the earth. The stars are randomly placed spheres, for aesthetics. You can also toggle what natural disasters you can see using the checkboxes. There is also some logic to move the camera closer using the up and down arrow keys.

Role/Contribution:
I made this code, referencing the three.js manual as I went along.

Screenshots:
<img width="1896" height="888" alt="Screenshot 2026-04-24 104819" src="https://github.com/user-attachments/assets/5c1b993c-0b98-4a1d-b12d-a11f208fe3e0" />
<img width="1897" height="888" alt="Screenshot 2026-04-24 104857" src="https://github.com/user-attachments/assets/7abeeec5-3279-438e-aa9f-46913ff23f56" />

Reflection/Challenges:
The main challenge with this project was figuring out the three.js functions and how to set it up. The manual was helpful with this, but there were a lot of little things that would get messed up. Also, figuring out what information to get from teh NASA EONET API took some troubleshooting as well. This was a fun project and I might add some more features at a later date.
