import OrbitControls from "orbit-controls-es6"
import CustomRenderer from "./postprocessing/CustomRenderer"
import CameraGroup from "./CameraGroup"

import HomeMobSceneEntity from "./sceneEntities/Mobile/HomeMobSceneEntity"
import CrystalSceneEntity from "./sceneEntities/Mobile/CrystalSceneEntity"
import CanvasRotator from "./CanvasRotator"
import { bus, threeBus } from "../main"
import socket from "../socket.js"
import { TweenLite, Power0, Sine, Power1, Power2, Power3 } from "gsap"

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
    const masterScene = new THREE.Scene()

    let timeVars = {
        time: 0,
        mstime: 0,
        DELTA_TIME: undefined,
        LAST_TIME:Date.now()
    }

    function init() {
        // Post processing
        /* TODO: Enable double scene with postprocess > look at renderpass */
        const isPostProcess = false

        camera = CameraGroup()
        camera.position.copy(new THREE.Vector3(0, 0, -10))

        sceneEntities = initScenesEntities()
        currentSceneEntity = sceneEntities["home"]()

        customRenderer = CustomRenderer(
            canvas,
            currentSceneEntity.scenes,
            camera,
            false // isPostProcess
        )

        // controls = new OrbitControls(camera, canvas)
        // controls.target = camera.target.position
        threeBus.$on("change to step", changeToStep)

        bus.$on("setRoomState", stateObj => {
            if (stateObj.lamar || stateObj.zanit) {
                if (stateObj.lamar === socket.id) {
                    character = "lamar"
                } else if (stateObj.zanit === socket.id) {
                    character = "zanit"
                } else {
                    character = undefined
                }
            }
        })
    }

    function initScenesEntities() {
        const sceneEntities = {
            home: () => HomeMobSceneEntity(masterScene, assets)
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
        if (step.addedThreeGroupsMob) {
            fadeIn(step.addedThreeGroupsMob)
        }
        if (step.removedThreeGroupsMob) {
            fadeOut(step.removedThreeGroupsMob)
        }
    }

    function fadeIn(fadeInInfos) {
        console.log("FADEIN", fadeInInfos)
        fadeInInfos.map(({ asset: addedAssetName, delay, time, scene }) => {
            if (!assets[addedAssetName]) {
                console.error(`Can't add "${addedAssetName}", asset not found`)
            }
            let localTweenedVar = { fadeInPercentage: 0 } // 0 -> 1

            assets[addedAssetName].traverse((child) => {
                if (child.intensity && child.normalIntensity) {
                    TweenLite.fromTo(
                        child,
                        time,
                        {
                            intensity: 0
                        },
                        {
                            delay: delay,
                            intensity: child.normalIntensity
                            // onUpdate: () => {
                            //     console.log(child.name, child.intensity)
                            // }
                        }
                    )
                } else if (child.material) {
                    /* NOTE: this can be an array!! */
                    if (child.material.map) {
                        child.material.map((actualMaterial) => {
                            actualMaterial.side = THREE.FrontSide
                            // actualMaterial.side = THREE.DoubleSide // no good for transparency effects, only use for debug if possible
                            actualMaterial.transparent = true
                            actualMaterial.opacity = 0
                        })
                    } else {
                        child.material.side = THREE.FrontSide
                        // child.material.side = THREE.DoubleSide // no good for transparency effects, only use for debug if possible
                        child.material.transparent = true
                        child.material.opacity = 0
                    }
                }
            })

            switch (scene) {
                case "sceneR":
                    sceneR.add(assets[addedAssetName])
                    break
                case "sceneL":
                    sceneL.add(assets[addedAssetName])
                    break
                default:
                    masterScene.add(assets[addedAssetName])
            }

            TweenLite.to(localTweenedVar, time, {
                fadeInPercentage: 1,
                // NOTE: add 0.2sec to delay to avoid starting the tween while the asset is still not visible (maybe fix this later)
                delay: delay + 0.2,
                onUpdate: () => {
                    assets[addedAssetName].traverse((child) => {
                        if (child.material) {
                            /* NOTE: this can be an array!! */
                            if (child.material.map) {
                                child.material.map((actualMaterial) => {
                                    actualMaterial.opacity =
                                        localTweenedVar.fadeInPercentage
                                })
                            } else {
                                child.material.opacity =
                                    localTweenedVar.fadeInPercentage
                            }
                        }
                    })
                }
            })
        })
    }

    function fadeOut(fadeOutInfos) {
        fadeOutInfos.map(({ asset: removedAssetName, delay, time }) => {
            let localTweenedVar = { fadeOutPercentage: 1 } // 1 -> 0

            if (!assets[removedAssetName]) {
                console.error(`Can't remove "${removedAssetName}", asset not found`)
            }
            TweenLite.to(localTweenedVar, time, {
                fadeOutPercentage: 0,
                delay: delay,
                onStart: () => {
                    assets[removedAssetName].traverse((child) => {
                        if (child.material) {
                            /* NOTE: this can be an array!! */
                            if (child.material.map) {
                                child.material.map((actualMaterial) => {
                                    actualMaterial.side = THREE.FrontSide
                                    actualMaterial.transparent = true
                                })
                            } else {
                                child.material.side = THREE.FrontSide
                                child.material.transparent = true
                            }
                        }
                    })
                },
                onUpdate: () => {
                    assets[removedAssetName].traverse((child) => {
                        if (child.intensity) {
                            child.intensity =
                                child.normalIntensity *
                                localTweenedVar.fadeOutPercentage // not very accurate, but may be sufficient (best accuracy would involve stocking initial intensity values for all lights)
                        } else if (child.material) {
                            /* NOTE: this can be an array!! */
                            if (child.material.map) {
                                child.material.map((actualMaterial) => {
                                    actualMaterial.opacity =
                                        localTweenedVar.fadeOutPercentage
                                })
                            } else {
                                child.material.opacity =
                                    localTweenedVar.fadeOutPercentage
                            }
                        }
                    })
                },
                onComplete: () => {
                    masterScene.remove(assets[removedAssetName])

                    assets[removedAssetName].traverse((child) => {
                        if (child.dispose) child.dispose()
                    })
                }
            })
        })
    }


    function update() {
        requestAnimationFrame(update)
        updateTime()

        camera.lookAt(new THREE.Vector3(0, 0, 1))

        // currentSceneEntity.update()
        currentSceneEntity.update(timeVars)

        customRenderer.render([masterScene], camera)
        // customRenderer.render(currentSceneEntity.scene, camera)
    }

    function updateTime() {
        timeVars.DELTA_TIME = Date.now() - timeVars.LAST_TIME
        timeVars.LAST_TIME = Date.now()
        timeVars.mstime += timeVars.DELTA_TIME
        timeVars.time = timeVars.mstime * 0.001 // convert from millis to seconds
    }

    return {
        init,
        update,
        initEventsListeners
    }
}

export default SceneManagerMob
