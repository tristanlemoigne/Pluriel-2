import OrbitControls from "orbit-controls-es6"
import CustomRenderer from "./postprocessing/CustomRenderer"
import CameraGroup from "./CameraGroup"

import CrystalSceneEntity from "./sceneEntities/Mobile/CrystalSceneEntity"
import HomeMobSceneEntity from "./sceneEntities/Mobile/HomeMobSceneEntity"
import CanvasRotator from "./CanvasRotator"
import { threeBus } from "../main"

import * as THREE from "three"

const firstStep = require("../../../server/experienceSteps.js")[0]

/**
 * Factory returning an object containing exposed methods.
 * It is responsible for managing SceneEntities and (...)
 * @param {HTMLCanvasElement} canvas
 * @param {Object} assets
 * @returns {Object}
 */

function SceneManagerMob(canvas, assets) {
    // TODO: Pass specific assets to the scene instead of all
    let camera, customRenderer, controls
    let currentSceneEntity, sceneEntities
    let character

    // Shape to raycast
    let LAST_TIME = Date.now()
    let DELTA_TIME
    let mstime = 0
    let time = 0

    function init() {
        // Post processing
        /* TODO: Enable double scene with postprocess > look at renderpass */
        const isPostProcess = false

        // Shape to raycast
        const raycastShape = assets.raycastShape
        camera = CameraGroup(raycastShape)

        sceneEntities = initScenesEntities()
        currentSceneEntity = sceneEntities["home"]()

        customRenderer = CustomRenderer(
            canvas,
            currentSceneEntity.scenes,
            camera,
            isPostProcess
        )

        // controls = new OrbitControls(camera, canvas)
        // controls.target = camera.target.position
        threeBus.$on("change to step", changeToStep)
        threeBus.$on("animate perso", perso => {
            character = perso
        })
    }

    function initScenesEntities() {
        const sceneEntities = {
            home: () => HomeMobSceneEntity(assets),
            trial_1_intro: () => CrystalSceneEntity(assets, character)
        }
        return sceneEntities
    }

    function onWindowResize() {
        CanvasRotator(
            canvas,
            camera,
            customRenderer,
            currentSceneEntity
        ).rotateCanvas(firstStep.canvasAngle)
    }

    function initEventsListeners() {
        window.addEventListener("resize", onWindowResize)
        onWindowResize()
    }

    function changeToStep(step) {
        if (sceneEntities[step.name]) {
            currentSceneEntity = sceneEntities[step.name]()
        }

        CanvasRotator(canvas, camera, customRenderer).rotateCanvas(
            step.canvasAngle
        )
    }

    function update() {
        requestAnimationFrame(update)
        updateTime()

        camera.position.copy(new THREE.Vector3(0, 0, -10))
        camera.lookAt(new THREE.Vector3(0, 0, 1))

        currentSceneEntity.update()
        customRenderer.render(currentSceneEntity.scenes, camera)
        // customRenderer.render(currentSceneEntity.scene, camera)
    }

    function updateTime() {
        DELTA_TIME = Date.now() - LAST_TIME
        LAST_TIME = Date.now()
        mstime += DELTA_TIME
        time = mstime * 0.001 // convert from millis to seconds
    }

    return {
        init,
        update,
        initEventsListeners
    }
}

export default SceneManagerMob
