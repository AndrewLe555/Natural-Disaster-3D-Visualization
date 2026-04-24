// NASA API KEY: Fdex6vyABw7qUjKof2ZXt9wayhqJf6Xr32bUTfyT

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create a switch for each disaster
let wildfireSwitch = false;
let severeStormsSwitch = false;
let volcanoesSwitch = false;
let seaAndLakeIceSwitch = false;

// Get the width and height of the window
const width = window.innerWidth, height = window.innerHeight;

// Initialize the camera to give the viewpoint
const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 15 );
camera.position.z = 3;

// Create a scene for the 3D objects
const scene = new THREE.Scene();

// Create a loader to add a texture to an object
const loader = new THREE.TextureLoader();

// Will be used to look at a specific disaster
const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();queueMicrotask

// Creates the sphere
const geometry = new THREE.SphereGeometry(1, 64, 32);

// Creates the texture for the sphere
const earthTexture = loader.load("8081_earthmap10k.jpg");
const material = new THREE.MeshBasicMaterial({
	color: 0xA3A3A3,
    map: earthTexture,
});

// Mesh the sphere and texture together and add it
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

// Take the camera's view and add it to the screen
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// Allows for the mouse to be used for moving around
const controls = new OrbitControls(camera, renderer.domElement);
// Disables the user from moving the focal point around
controls.enablePan = false;

let cameraZoom = 0.05;

// const interactor = new Interaction(renderer, scene, camera);

// Get TLE data for satellites
/*
fetch("https://tle.ivanstanojevic.me/api/tle/")
	.then(response => {
		if (response.ok) {
			return response.json();
		}
		else {
			throw new Error(response.status);
		}
	})
	.then(result => {
		console.log(result.member[0].name);
	})
	.catch(error => {
		console.log(error);
	})
*/

let eventID = {8: 0xFF8000, 10: 0xFF00D0, 12: 0xFF0000, 15: 0x000BE3};

// Do the fetch first, and put them in a list
let wildfires = [];
let severeStorms = [];
let volcanoes = [];
let seaAndLakeIce = [];


// Get EONET data
await fetch("https://eonet.gsfc.nasa.gov/api/v2.1/events")
	.then(response => {
		// Checks to make sure it connected to the server
		if (response.ok) {
			return response.json();
		}
		else {
			throw new Error(response.status);
		}
	})
	// Access the coordinates
	.then(result => {
		// Get coordinate from API
		for (let i = 0; i < result.events.length; i++) {
			let radiansX = (result.events[i].geometries[0].coordinates[0] + 90) * Math.PI / 180;
			let radiansY = (90 - result.events[i].geometries[0].coordinates[1]) * Math.PI / 180;
			// Convert spherical coordinates to an x, y, z position
			const sphereCoordinates = new THREE.Spherical(1, radiansY, radiansX);
			const cartesianCoordinates = new THREE.Vector3();
			cartesianCoordinates.setFromSpherical(sphereCoordinates);
			// Apply coordinates and create sphere
			const point = new THREE.SphereGeometry(0.002);
			const color = new THREE.MeshBasicMaterial({color: eventID[result.events[i].categories[0].id]});
			const testPoint = new THREE.Mesh(point, color);
			testPoint.position.copy(cartesianCoordinates);
			// Put it in a list to add later
			if (result.events[i].categories[0].id == 8) {
				wildfires.push(testPoint);
			}
			else if (result.events[i].categories[0].id == 10) {
				severeStorms.push(testPoint);
			}
			else if (result.events[i].categories[0].id == 12) {
				volcanoes.push(testPoint);
			}
			else if (result.events[i].categories[0].id == 15) {
				seaAndLakeIce.push(testPoint);
			}
		}
	})
	// Gives you the error if necessary
	.catch(error => {
		console.error(error);
	})

// Displays the desired list when checkbox is checked
function displayEONET(list) {
	for (let i = 0; i < list.length; i++) {
		scene.add(list[i]);
	}
}

// Removes the desired list when checkbox is unchecked
function deleteEONET(list) {
	for (let i = 0; i < list.length; i++) {
		scene.remove(list[i]);
	}
}


// Go through and create a list of each disaster
// When a checkbox is checked or unchecked, add or remove the locations of the disasters
// scene.remove(MESH) to remove each object

const hoveredPoint = new THREE.SphereGeometry(0.002);
let hoveredColor = new THREE.MeshBasicMaterial({color: 0x000000});
let hovered = new THREE.Mesh(hoveredPoint, hoveredColor);
//let updatedHoveredColor;



// Detect when the mouse moves and record the coordinates
renderer.domElement.addEventListener("mousemove", (mouseCoords) => {
	mouseVector.x = (mouseCoords.clientX / window.innerWidth) * 2 - 1;
	mouseVector.y = -(mouseCoords.clientY / window.innerHeight) * 2 + 1;
	// Create the ray from the camera
	raycaster.setFromCamera(mouseVector, camera);
	// Get list of intersecting objects, then get the first thing in that list
	const intersects = raycaster.intersectObjects(scene.children, true);
	// Change the color to white, if it's not the earth
	if (intersects.length != 0) {
		const selected = intersects[0].object;
		// Checks to make sure you don't change the color of the earth
		if (!(selected.position.x == 0 && selected.position.y == 0 && selected.position.z == 0)) {
			// Check if the object the mouse selected isn't currently selected
			if (hovered !== selected) {
				// Change the color
				hovered.material.color.set(hoveredColor);
				hoveredColor = selected.material.color;
				selected.material.color.set(0xFFFFFF);
				hovered = selected;
			}
		}
	}
	// ADD WHEN IT GETS OFF OF A SPHERE, IT RETURNS TO IT'S ORIGINAL COLOR
})


document.addEventListener('keydown', (keyPressed) => {
	if (keyPressed.key == 'ArrowUp') {
		// Get angle and hypotenuse for x-axis and z-axis triangle
		let planeAngle = Math.atan(camera.position.z / camera.position.x);
		let planeHypotenuse = camera.position.z / Math.sin(planeAngle);
		// Get the angle the camera is above the plane
		let elevationAngle = Math.atan(camera.position.y / planeHypotenuse);
		// Checking to see if the canera is already too close
		let elevationHypotenuse = camera.position.y / Math.sin(elevationAngle)
		if (elevationHypotenuse > 1.06 || elevationHypotenuse < -1.06) {
			// Using the distance we want the camera to move, update the posiiton
			let updatedY = Math.abs(Math.sin(elevationAngle) * cameraZoom);
			let updatedPlaneHypotenuse = Math.cos(elevationAngle) * cameraZoom;
			let updatedZ = Math.abs(Math.sin(planeAngle) * updatedPlaneHypotenuse);
			let updatedX = Math.abs(Math.cos(planeAngle) * updatedPlaneHypotenuse);
			// Determine how to move camera based on positive and negative positions
			if (camera.position.y < 0) {
				camera.position.y += updatedY;
			}
			else {
				camera.position.y -= updatedY;
			}
			if (camera.position.z < 0) {
				camera.position.z += updatedZ;
			}
			else {
				camera.position.z -= updatedZ;
			}
			if (camera.position.x < 0) {
				camera.position.x += updatedX;
			}
			else {
				camera.position.x -= updatedX;
			}
		}
	}
	else if (keyPressed.key == 'ArrowDown') {
			// Get angle and hypotenuse for x-axis and z-axis triangle
		let planeAngle = Math.atan(camera.position.z / camera.position.x);
		let planeHypotenuse = camera.position.z / Math.sin(planeAngle);
		// Get the angle the camera is above the plane
		let elevationAngle = Math.atan(camera.position.y / planeHypotenuse);
		// Checking to see if the canera is already too close
		let elevationHypotenuse = camera.position.y / Math.sin(elevationAngle)
		if (elevationHypotenuse < 5 && elevationHypotenuse > -5) {
			// Using the distance we want the camera to move, update the posiiton
			// Needs to be updated to handle positiove and negative sine values
			let updatedY = Math.abs(Math.sin(elevationAngle) * cameraZoom);
			let updatedPlaneHypotenuse = Math.cos(elevationAngle) * cameraZoom;
			let updatedZ = Math.abs(Math.sin(planeAngle) * updatedPlaneHypotenuse);
			let updatedX = Math.abs(Math.cos(planeAngle) * updatedPlaneHypotenuse);
			// Determine how to move camera based on positive and negative positions
			if (camera.position.y < 0) {
				camera.position.y -= updatedY;
			}
			else {
				camera.position.y += updatedY;
			}
			if (camera.position.z < 0) {
				camera.position.z -= updatedZ;
			}
			else {
				camera.position.z += updatedZ;
			}
			if (camera.position.x < 0) {
				camera.position.x -= updatedX;
			}
			else {
				camera.position.x += updatedX;
			}
		}
	}
})

// Create a transparent circle around earth and camera
// Check if the two circles collide and prohibit movement in certain direction
// intersectsSphere()

// Add stars in random positions
for (let i = 0; i < 300; i++) {
	// Get random radius and angles for stars that are out of the way
	const randomRadius = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
	const randomPlaneDegrees = Math.floor(Math.random() * (360 + 1)) - 180;
	const randomElevationDegrees = Math.floor(Math.random() * (360 + 1)) - 180;
	// Convert from degrees to radians
	const randomPlaneAngle = randomPlaneDegrees * Math.PI / 180;
	const randomElevationAngle = randomElevationDegrees * Math.PI / 180;
	// Get the star x, y, z coordinates
	const starSphereCoordinates = new THREE.Spherical(randomRadius, randomElevationAngle, randomPlaneAngle);
	const starCartesianCoordinates = new THREE.Vector3();
	starCartesianCoordinates.setFromSpherical(starSphereCoordinates);
	// Apply coordinates and create sphere
	const star = new THREE.SphereGeometry(0.01);
	const starColor = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
	const starPoint = new THREE.Mesh(star, starColor);
	starPoint.position.copy(starCartesianCoordinates);
	scene.add(starPoint);
}

// Animation
function animate( time ) {

	renderer.render( scene, camera );

	// Continuously check if the checkbox had been checked
	const wildfireCheckbox = document.getElementById("wildfire");
	const severeStormsCheckbox = document.getElementById("severeStorms");
	const volcanoesCheckbox = document.getElementById("volcanoes");
	const seaAndLakeIceCheckbox = document.getElementById("seaAndLakeIce");

	if (wildfireCheckbox.checked) {
		displayEONET(wildfires);
		wildfireSwitch = true;
	}
	if (!wildfireCheckbox.checked) {
		// Acts as a switch to make sure you don't delete things already deleted
		if (wildfireSwitch) {
			deleteEONET(wildfires);
			wildfireSwitch = false;
		}
	}
	if (severeStormsCheckbox.checked) {
		displayEONET(severeStorms);
		severeStormsSwitch = true;
	}
	if (!severeStormsCheckbox.checked) {
		// Acts as a switch to make sure you don't delete things already deleted
		if (severeStormsSwitch) {
			deleteEONET(severeStorms);
			severeStormsSwitch = false;
		}
	}
	if (volcanoesCheckbox.checked) {
		displayEONET(volcanoes);
		volcanoesSwitch = true;
	}
	if (!volcanoesCheckbox.checked) {
		// Acts as a switch to make sure you don't delete things already deleted
		if (volcanoesSwitch) {
			deleteEONET(volcanoes);
			volcanoesSwitch = false;
		}
	}
	if (seaAndLakeIceCheckbox.checked) {
		displayEONET(seaAndLakeIce);
		seaAndLakeIceSwitch = true;
	}
	if (!seaAndLakeIceCheckbox.checked) {
		// Acts as a switch to make sure you don't delete things already deleted
		if (seaAndLakeIceSwitch) {
			deleteEONET(seaAndLakeIce);
			seaAndLakeIceSwitch = false;
		}
	}

}