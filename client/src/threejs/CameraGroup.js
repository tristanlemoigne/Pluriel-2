import * as THREE from "three"
const fisrtStep = require("../../../server/experienceSteps.js")[0]

/**
 * Factory that adds a raycastShape and a target to a camera, and returns it. /!\ This needs to be added to the scene.
 * @param {THREE.Mesh} raycastShape Mesh that will stick with the camera. Can be used as a support to raycast and interact.
 * @param {THREE.Camera} [camera] Optional camera which can serve as a reference.
 * @returns {THREE.Camera} Returns a camera wich is also a group.
 */
export default function CameraGroup(
    raycastShape,
    camera = buildDefaultCamera()
) {
    camera.target = new THREE.Object3D() // use this to lookAt() with camera

    camera.raycastShape = raycastShape

    raycastShape.material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        wireframe: true,
        transparent: true,
        // depthTest: true,
        // depthWrite: true,
        // opacity: 1
        depthTest: false,
        depthWrite: false,
        opacity: 0
    })
    const raycastShapeDistFromCam = 10 // specific number that matches with the default camera fov and stuff
    raycastShape.position.z = -raycastShapeDistFromCam
    raycastShape.scale.set(
        raycastShapeDistFromCam * 0.5 * camera.aspect,
        raycastShapeDistFromCam * 0.5,
        raycastShapeDistFromCam - camera.near
    )

    camera.add(raycastShape)

    camera.logCamera = () => {
        console.log(`camera's position : \n`, camera.position)
        console.log(`camera's target.position : \n`, camera.target.position)
    }

    return camera
}

/**
 * Factory that creates a new camera and return it.
 * It is called by CameraGroup() as a default parameter if no camera is passed to it.
 * @returns {THREE.Camera} Returns a camera.
 */
function buildDefaultCamera() {
    const cameraSettings = {
        ratio: window.innerWidth / window.innerHeight,
        fov: 40,
        near: 1,
        far: 10000
    }
    const camera = new THREE.PerspectiveCamera(
        cameraSettings.fov,
        cameraSettings.ratio,
        cameraSettings.near,
        cameraSettings.far
    )

    return camera
}
