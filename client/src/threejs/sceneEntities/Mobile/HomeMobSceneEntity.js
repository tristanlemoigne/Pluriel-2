import * as THREE from "three"
import CSS from "@/config/styles.scss"
import { threeBus } from "@/main"
import socket from "@/socket"
const firstStep = require("../../../../../server/experienceSteps.js")[0]

function HomeDskSceneEntity(assets) {
    /* ----------------------- INPUTS ----------------------- */
    const scenes = []
    let sceneL, sceneR

    /* ----------------------- DECLARATIONS + ASSIGNATIONS ----------------------- */
    init()

    threeBus.$on("step creation room", () => {
        sceneL.remove(assets.cyanStone)
        sceneR.remove(assets.pinkStone)
    })

    threeBus.$on("animate perso", perso => {
        console.log("A PLAYER HAS CHOSEN THE PERSO : ", perso)
    })

    /* ----------------------- FUNCTIONS ----------------------- */
    function init() {
        sceneL = new THREE.Scene()
        // sceneL.background = new THREE.Color(CSS.blue)
        scenes.push(sceneL)

        sceneR = new THREE.Scene()
        // sceneR.background = new THREE.Color(CSS.red)
        scenes.push(sceneR)

        // CLONE GENERATE A WARNING
        const axesHelpers = new THREE.AxesHelper(10)
        sceneL.add(axesHelpers)
        // sceneR.add(axesHelpers.clone())

        initLights()
        initMeshes()

        scenes.forEach(scene => {
            scene.rotation.z = -firstStep.canvasAngle
        })
    }

    function initLights() {
        // var light1 = new THREE.DirectionalLight(0xffffff, 2)
        // light1.position.set(0, 20, 0)
        // sceneL.add(light1)
        // sceneR.add(light1.clone())
        // var light2 = new THREE.DirectionalLight(0xffffff, 0.4)
        // light2.position.set(0, -20, 0)
        // sceneL.add(light2)
        // sceneR.add(light2.clone())
    }

    function initMeshes() {
        assets.cyanStone.position.set(0, 0, 15)
        sceneL.add(assets.cyanStone)

        assets.pinkStone.position.set(0, 0, 15)
        sceneR.add(assets.pinkStone)

        const fog = new THREE.Fog(0x8455b3, 0, 100)
        sceneL.fog = fog
        sceneR.fog = fog
    }

    function update() {
        assets.pinkStone.rotation.y += 0.001
        assets.pinkStone.rotation.x += 0.001

        assets.cyanStone.rotation.y += 0.001
        assets.cyanStone.rotation.x += 0.001
    }

    return {
        scenes,
        update
    }
}

export default HomeDskSceneEntity
