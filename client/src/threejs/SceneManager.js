import socket from "../socket"
import * as THREE from "three"
import { TweenLite, Power3 } from "gsap"

import OrbitControls from "orbit-controls-es6"
import CustomRenderer from "./postprocessing/CustomRenderer"
import CameraGroup from "./CameraGroup"

import HomeDskSceneEntity from "./sceneEntities/Desktop/HomeDskSceneEntity"
import Trial1 from "./sceneEntities/Desktop/Trial1"
import CanvasRotator from "./CanvasRotator"
import { curveFromGeometry, applyFuncOnObjs } from "./helpers/index.js"
import { threeBus } from "../main"
const firstStep = require("../../../server/experienceSteps.js")[0]

/**
 * Factory returning an object containing exposed methods.
 * It is responsible for managing SceneEntities and (...)
 * @param {HTMLCanvasElement} canvas
 * @param {Object} assets
 * @returns {Object}
 */

function SceneManager(canvas, assets) {
    const masterScene = new THREE.Scene()
    const sceneL = new THREE.Scene()
    const sceneR = new THREE.Scene()

    // TODO: Pass specific assets to the sceneManager instead of all
    let camera, customRenderer, controls
    let currentSceneEntity, sceneEntities
    let canvasAngle = firstStep.canvasAngle

    let currentCameraPath = undefined
    let isMovingCamera = false
    let globalTweenedVars = {
        camPosPercentage: 0 // 0 -> 1
    }

    // Time init
    let LAST_TIME = Date.now()
    let DELTA_TIME
    let mstime = 0
    let time = 0

    // Quaternions from mobiles declaration
    const mobileQuaternions = {
        cyan: null,
        pink: null
    }

    function init() {
        // Post processing
        /* TODO: Enable double scene with postprocess > look at renderpass */
        const isPostProcess = false

        // Fog
        const fog = new THREE.FogExp2(0x8455b3, 0.008)
        // const fog = new THREE.Fog(0x8455b3, 10, 200)
        masterScene.fog = fog

        // Shape to raycast
        const raycastShape = assets.raycastShape
        console.log("i pass it ", raycastShape)
        camera = CameraGroup(raycastShape)
        camera.position.copy(firstStep.cameraPos) // initial camera's position, should be were the first camPath (OBJ file) begins
        const initialTarget = assets.camTargetPoints.children.find(Object3D =>
            Object3D.name.includes("Target00")
        )
        camera.target.position.copy(initialTarget.position)
        camera.lookAt(initialTarget.position)

        masterScene.add(assets.nuages)
        masterScene.add(assets.nuagesLights)

        Object.keys(assets).map(assetName => {
            setTimeout(() => {
                applyFuncOnObjs(assets[assetName], "Light", light => {
                    light.normalIntensity = light.intensity // stock intensity values (will be tweened from 0)
                    light.intensity *= 1
                })
            }, 0)
        })

        // applyFuncOnObjs(assets.nuagesLights, "Light", light => {
        //     light.intensity *= 2
        // })
        // applyFuncOnObjs(assets.islands, "Light", light => {
        //     light.intensity *= 2
        // })

        sceneEntities = {
            home: () => HomeDskSceneEntity([sceneL, sceneR], assets),
            trial_1_intro: () => Trial1(masterScene, camera, assets)
        }
        currentSceneEntity = sceneEntities["home"]()

        customRenderer = CustomRenderer(
            canvas,
            [sceneL, sceneR],
            camera,
            isPostProcess
        )

        // controls = new OrbitControls(camera, canvas)
        // controls.target = camera.target.position

        threeBus.$on("change to step", changeToStep)
    }

    function onWindowResize() {
        CanvasRotator(
            canvas,
            camera,
            customRenderer
            // currentSceneEntity
        ).rotateCanvas(canvasAngle)
    }

    function initEventsListeners() {
        window.addEventListener("resize", onWindowResize)
        onWindowResize()

        socket.on("dispatch cyan quaternion", Quaternion => {
            mobileQuaternions.cyan = Quaternion
        })
        socket.on("dispatch pink quaternion", Quaternion => {
            mobileQuaternions.pink = Quaternion
        })
    }

    function animateCamOnPath({ path, delay, time, easing }) {
        // TODO: use "easing" values from experienceSteps
        const cameraPathGeometry = assets.camPaths.children.find(child => {
            return child.name.includes(path) // must be something like NurbsPath00 in the blender file
        }).geometry

        currentCameraPath = curveFromGeometry(cameraPathGeometry)
        // console.log(currentCameraPath)

        TweenLite.fromTo(
            globalTweenedVars,
            time,
            { camPosPercentage: 0 },
            { camPosPercentage: 1, delay: delay, ease: Power3.easeInOut }
        )
    }

    function animateCamTarget({ point: targetName, delay, time, easing }) {
        // TODO: use "easing" values from experienceSteps
        const nextTargetPos = assets.camTargetPoints.children.find(Object3D =>
            Object3D.name.includes(targetName)
        ).position

        TweenLite.fromTo(
            camera.target.position,
            time,
            {
                x: camera.target.position.x,
                y: camera.target.position.y,
                z: camera.target.position.z
            },
            {
                x: nextTargetPos.x,
                y: nextTargetPos.y,
                z: nextTargetPos.z,
                delay: delay,
                ease: Power3.easeInOut
            }
        )
    }

    function fadeIn(fadeInInfos) {
        fadeInInfos.map(({ asset: addedAssetName, delay, time, scene }) => {
            if (!assets[addedAssetName]) {
                console.error(`Can't add "${addedAssetName}", asset not found`)
            }
            let localTweenedVar = { fadeInPercentage: 0 } // 0 -> 1
            applyFuncOnObjs(assets[addedAssetName], "Light", light => {
                TweenLite.fromTo(
                    light,
                    time,
                    {
                        intensity: 0
                    },
                    {
                        delay: delay,
                        intensity: light.normalIntensity
                    }
                )
            })
            applyFuncOnObjs(assets[addedAssetName], "Mesh", addedMesh => {
                addedMesh.material.side = THREE.FrontSide
                // addedMesh.material.side = THREE.DoubleSide // no good for transparency effects, only use for debug if possible
                addedMesh.material.transparent = true
                addedMesh.material.opacity = 0
            })

            switch (scene) {
                case "sceneR":
                    sceneR.add(assets[addedAssetName])
                case "sceneL":
                    sceneL.add(assets[addedAssetName])
                default:
                    masterScene.add(assets[addedAssetName])
            }

            TweenLite.to(localTweenedVar, time, {
                fadeInPercentage: 1,
                // NOTE: add 0.2sec to delay to avoid starting the tween while the asset is still not visible (maybe fix this later)
                delay: delay + 0.2,
                onUpdate: () => {
                    applyFuncOnObjs(
                        assets[addedAssetName],
                        "Mesh",
                        addedMesh => {
                            addedMesh.material.opacity =
                                localTweenedVar.fadeInPercentage
                        }
                    )
                }
            })
        })
    }

    function fadeOut(fadeOutInfos) {
        fadeOutInfos.map(({ asset: removedAssetName, delay, time }) => {
            let localTweenedVar = { fadeOutPercentage: 1 } // 1 -> 0

            if (!assets[removedAssetName]) {
                console.error(
                    `Can't remove "${removedAssetName}", asset not found`
                )
            }
            TweenLite.to(localTweenedVar, time, {
                fadeOutPercentage: 0,
                delay: delay,
                onUpdate: () => {
                    applyFuncOnObjs(
                        assets[removedAssetName],
                        "Mesh",
                        removedMesh => {
                            removedMesh.material.side = THREE.FrontSide
                            removedMesh.material.transparent = true
                            removedMesh.material.opacity =
                                localTweenedVar.fadeOutPercentage
                        }
                    )
                    applyFuncOnObjs(
                        assets[removedAssetName],
                        "Light",
                        removedLight => {
                            removedLight.intensity =
                                removedLight.normalIntensity *
                                localTweenedVar.fadeOutPercentage // not very accurate, but may be sufficient (best accuracy would involve stocking initial intensity values for all lights)
                        }
                    )
                },
                onComplete: () => {
                    sceneR.remove(assets[removedAssetName])
                    sceneL.remove(assets[removedAssetName])
                    masterScene.remove(assets[removedAssetName])

                    applyFuncOnObjs(
                        assets[removedAssetName],
                        "",
                        removedStuff => {
                            if (removedStuff.dispose) removedStuff.dispose()
                        }
                    )
                }
            })
        })
    }

    function changeToStep(step) {
        // currentSceneEntity.scenes[0].add(camera) // for debugging, this is to display the raycastShape that is in the CameraGroup
        masterScene.add(camera) // for debugging, this is to display the raycastShape that is in the CameraGroup

        canvasAngle = step.canvasAngle ? step.canvasAngle : 0
        CanvasRotator(canvas, camera, customRenderer).rotateCanvas(canvasAngle)

        if (sceneEntities[step.name]) {
            currentSceneEntity = sceneEntities[step.name]()
        }
        if (step.addedThreeGroupsDsk) {
            fadeIn(step.addedThreeGroupsDsk)
        }
        if (step.removedThreeGroupsDsk) {
            fadeOut(step.removedThreeGroupsDsk)
        }

        if (step.cameraTransition) {
            if (step.cameraTransition.camPos) {
                isMovingCamera = true
                animateCamOnPath(step.cameraTransition.camPos)
            }
            if (step.cameraTransition.camTarget) {
                animateCamTarget(step.cameraTransition.camTarget)
            }
            if (
                !step.cameraTransition.camPos &&
                !step.cameraTransition.camTarget
            ) {
                console.error("step.cameraTransition is not as expected")
            }
        }
    }

    function updateTime() {
        DELTA_TIME = Date.now() - LAST_TIME
        LAST_TIME = Date.now()
        mstime += DELTA_TIME
        time = mstime * 0.001 // convert from millis to seconds
    }

    function update() {
        requestAnimationFrame(update)
        updateTime()

        currentSceneEntity.update(mobileQuaternions)

        if (isMovingCamera) {
            camera.position.copy(
                currentCameraPath.getPointAt(globalTweenedVars.camPosPercentage)
            ) // 0 -> 1
            if (globalTweenedVars.camPosPercentage >= 0.9999) {
                isMovingCamera = false
            }
        }

        let camTargetGlobalPos = new THREE.Vector3()
        camera.target.getWorldPosition(camTargetGlobalPos) // mutate the camTargetGlobalPos variable
        camera.lookAt(camTargetGlobalPos)

        // customRenderer.render(currentSceneEntity.scenes, camera)
        // customRenderer.render(
        //     [masterScene, currentSceneEntity.scenes[0]],
        //     camera
        // )

        // TEST FOR RENDER STUFF
        customRenderer.finalRenderer.autoClear = false // important!
        customRenderer.finalRenderer.clear()
        customRenderer.finalRenderer.setViewport(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        )
        customRenderer.render([masterScene], camera)

        customRenderer.finalRenderer.clearDepth() // important! clear the depth buffer
        customRenderer.finalRenderer.setViewport(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        )
        // customRenderer.render(
        //     [currentSceneEntity.scenes[0], currentSceneEntity.scenes[1]],
        //     camera
        // )
        customRenderer.render([sceneL, sceneR], camera)
        // TODO: customRenderer.render([sceneL, sceneR], camera)
    }

    return {
        init,
        update,
        initEventsListeners
    }
}

export default SceneManager
