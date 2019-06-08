import * as THREE from "three"
import DeviceOrientationControls from "three-device-orientation"
import socket from "../../../socket.js"
import { bus } from "../../../main.js"
import { threeBus } from "../../../main.js"

/**
 *
 * @param {*} assets
 */
function CrystalSceneEntity(assets, character) {
    /* ----------------------- DECLARATIONS + ASSIGNATIONS ----------------------- */
    const scenes = []
    let characterColor = character === "zanit" ? "pink" : "cyan"
    let sceneCyan, scenePink
    let meshCyan, meshPink
    const GyroObject3D = new THREE.Object3D()
    const controls = new DeviceOrientationControls(GyroObject3D)
    let hasGyro = true
    // window.addEventListener("devicemotion", function(event) {
    //     if (
    //         event.rotationRate.alpha ||
    //         event.rotationRate.beta ||
    //         event.rotationRate.gamma
    //     )
    //         hasGyro = true
    // })
    let usingGyro = true
    let frameCount = 0

    init()

    /* ----------------------- FUNCTIONS ----------------------- */
    function init() {
        sceneCyan = new THREE.Scene()
        sceneCyan.background = new THREE.Color(0x115599)

        scenePink = new THREE.Scene()
        scenePink.background = new THREE.Color(0x551199)

        if (characterColor === "cyan") {
            scenes.push(sceneCyan)
        } else if (characterColor === "pink") {
            scenes.push(scenePink)
        }

        initMeshes()
    }

    function initMeshes() {
        var geoCyan = new THREE.IcosahedronBufferGeometry(1.33, 0)
        var matCyan = new THREE.MeshBasicMaterial({ color: 0x00dddd })
        meshCyan = new THREE.Mesh(geoCyan, matCyan)
        sceneCyan.add(meshCyan)

        var geoPink = new THREE.IcosahedronBufferGeometry(1.33, 0)
        var matPink = new THREE.MeshBasicMaterial({ color: 0xdd00dd })
        meshPink = new THREE.Mesh(geoPink, matPink)
        scenePink.add(meshPink)
    }

    // function toggleGyro(bool = !usingGyro) {
    //     usingGyro = bool
    // }

    function update() {
        meshCyan.rotation.y += 0.001
        meshPink.rotation.x += 0.001

        controls.update()
        frameCount++

        console.log("crystalSceneEntity")

        if (hasGyro && usingGyro && frameCount % 2 === 0) {
            socket.emit(`gyro ${characterColor}`, GyroObject3D.quaternion)
        }
    }

    return {
        scenes,
        update
        // toggleGyro
    }
}

export default CrystalSceneEntity
