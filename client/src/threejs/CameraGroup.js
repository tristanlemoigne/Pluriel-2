import * as THREE from "three"
import { MeshBasicMaterial } from "three"

/**
 * Factory that creates an object with a target and a camera, and returns it. Later on, spotLights are added to this.
 * /!\ This needs to be added to the scene.
 * @param {THREE.Camera} [camera] Optional camera which can serve as a reference.
 * @returns {THREE.Camera} Returns a camera wich is also a group.
 */
export default function CameraGroup(camera = buildDefaultCamera()) {
    camera.target = new THREE.Object3D() // use this to lookAt() with camera
    // camera.target = new THREE.Mesh(
    //     new THREE.SphereBufferGeometry(1.5, 16, 16),
    //     new THREE.MeshPhongMaterial({
    //         color: 0x050505,
    //         side: THREE.DoubleSide
    //     })
    // )

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
        near: 0.3,
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
