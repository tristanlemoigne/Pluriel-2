import socket from "../socket"
import * as THREE from "three"
import { TweenLite, Power0, Sine, Power1, Power2, Power3 } from "gsap"

import * as dat from "dat.gui"

import OrbitControls from "orbit-controls-es6"
import CustomRenderer from "./postprocessing/CustomRenderer"
import CameraGroup from "./CameraGroup"

import HomeDskSceneEntity from "./sceneEntities/Desktop/HomeDskSceneEntity"
import Trial1 from "./sceneEntities/Desktop/Trial1"
import Ending from "./sceneEntities/Desktop/Ending"
import CanvasRotator from "./CanvasRotator"
import { reMap } from "../utils"
import { catmullRomCurveFromGeometry } from "./helpers/index.js"
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

    const neutralCamDir = new THREE.Vector3(0, 0, -1)
    let glowMaterial

    let currentCameraPath = undefined
    let currentCameraPathSpacedPoints = []
    let isMovingCamera = false
    let globalTweenedVars = {
        camPosPercentage: 0, // 0 -> 1
        fogChangePercentage: 0 // 0 -> 1
    }
    let camTargetGlobalPos = new THREE.Vector3()

    // Time init
    const timeVars = {}
    // let LAST_TIME = Date.now()
    // let DELTA_TIME
    // let mstime = 0
    // let time = 0

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
        let sceneFog = new THREE.FogExp2(0x8455b3, 0.008)
        // const fosceneFogg = new THREE.Fog(0x8455b3, 10, 200)
        masterScene.fog = sceneFog

        camera = CameraGroup()
        // camera.position.copy(firstStep.cameraPos) // initial camera's position, should be were the first camPath (OBJ file) begins

        const initialTarget = assets.camTargetPoints.children.find(Object3D =>
            Object3D.name.includes("Target00")
        )
        camera.target.position.copy(initialTarget.position)
        camera.lookAt(initialTarget.position)

        const camDir = neutralCamDir.applyQuaternion(camera.quaternion)

        glowMaterial = new THREE.ShaderMaterial({
            // blending: THREE.AdditiveBlending,
            transparent: true,
            side: THREE.FrontSide,
            depthTest: true,
            depthWrite: true,
            uniforms: {
                glowColor: { value: [0, 0.33, 1] },
                camDir: { value: [camDir.x, camDir.y, camDir.z] },
                luminosity: { value: 0.45 }
            },
            vertexShader: /*glsl*/ `
            uniform vec3 camDir;
            //uniform float c;
            //uniform float p;
            varying float intensity;
            void main()
            {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * camDir );
                intensity = pow( 0.07 - dot(vNormal, vNormel), 6. ); // For FrontSide
                // intensity = pow( 0.7 - dot(vNormal, vNormel), 3.0 ); // For BackSide

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
            fragmentShader: /*glsl*/ `
            uniform vec3 glowColor;
            uniform float luminosity;
            varying float intensity;
            void main()
            {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glowColor*0.9 + glow*0.8, clamp(length(glow) * luminosity, 0., .9 * luminosity) );
            }
            `
        })
        const testSphere = new THREE.Mesh(
            new THREE.IcosahedronBufferGeometry(1.5, 3),
            // new THREE.MeshBasicMaterial({ color: 0xffff00 })
            glowMaterial
        )
        testSphere.position.z = 5
        sceneL.add(testSphere) // TODO: add to assets.cyanStone instead (and position it correctly) => implies handling uniforms of glowMaterial in a more costly way
        let testSphere2 = testSphere.clone()
        testSphere2.material = testSphere2.material.clone()
        testSphere2.material.uniforms.glowColor.value = [1, 0, 0.5]
        sceneR.add(testSphere2) // TODO: add to assets.pinkStone instead (and position it correctly) => implies handling uniforms of glowMaterial in a more costly way

        // Set glow material
        assets.islands.traverse(child => {
            if (child.name.includes("Glow")) {
                child.material = glowMaterial
            }
        })
        assets.islands.traverse(child => {
            if (child.name.includes("HoleFill")) {
                child.scaleMax = child.scale.clone()
                child.scale.multiplyScalar(0.001)
                child.scaleMin = child.scale.clone()
            }
        })

        masterScene.add(assets.nuages)
        masterScene.add(assets.nuagesLights)
        // masterScene.add(assets.islands)

        Object.keys(assets).map(assetName => {
            setTimeout(() => {
                assets[assetName].traverse(child => {
                    if (child.intensity) {
                        child.intensity *= 1
                        child.normalIntensity = child.intensity // stock intensity values (will be tweened from 0)
                    }
                })
            }, 0)
        })

        // // ---- this is a temporary fix ---- TODO: remove this when the blender file has the right light values
        // assets.islands.traverse(child => {
        //     if (child.intensity) {
        //         if (child.intensity >= 90) {
        //             child.intensity *= 0.1
        //         }
        //         child.normalIntensity = child.intensity // stock intensity values (will be tweened from 0)
        //     }
        // })

        sceneEntities = {
            home: () => HomeDskSceneEntity([sceneL, sceneR], assets),
            // global_intro: () => TODO(masterScene, camera, assets),
            trial_1_intro: () => Trial1(masterScene, camera, assets, timeVars),
            trial_1_end: () =>
                Ending(masterScene, camera, assets, timeVars, glowMaterial)
        }

        sceneEntities["trial_1_end"]().resetMaterials() // access method to set the emissive materials to neutral colors // TODO: clean this mess

        currentSceneEntity = sceneEntities["home"]()

        customRenderer = CustomRenderer(
            canvas,
            [sceneL, sceneR],
            camera,
            false // isPostProcess
        )

        controls = new OrbitControls(camera, canvas)
        controls.target = camera.target.position

        threeBus.$on("change to step", changeToStep)

        // initGui()
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

    function getEasing(powerStr, inOrOutStr) {
        let easingReturned
        switch (powerStr) {
            case "Power0":
                easingReturned = Power0[inOrOutStr]
                break
            case "Sine":
                easingReturned = Sine[inOrOutStr]
                break
            case "Power1":
                easingReturned = Power1[inOrOutStr]
                break
            case "Power2":
                easingReturned = Power2[inOrOutStr]
                break
            case "Power3":
                easingReturned = Power3[inOrOutStr]
                break
            default:
                easingReturned = Power2.easeInOut
                console.warn("Easing's string is not recognized")
        }
        return easingReturned
    }

    function animateCamOnPath({ path, delay, time, easing }) {
        const cameraPathGeometry = assets.camPaths.children.find(child => {
            return child.name.includes(path) // must be something like NurbsPath00 in the blender file
        }).geometry

        currentCameraPath = catmullRomCurveFromGeometry(cameraPathGeometry)
        // console.log(currentCameraPath.getLength(), time)
        currentCameraPath.arcLengthDivisions = time * time * time * 2.5 // default is 200, must be very high if the time of the transition / the curve length is long
        // currentCameraPathSpacedPoints = currentCameraPath.getSpacedPoints(
        //     time * 60
        // )

        TweenLite.fromTo(
            globalTweenedVars,
            time,
            { camPosPercentage: 0 },
            {
                camPosPercentage: 1,
                delay: delay,
                ease: getEasing(...easing)
            }
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
                ease: getEasing(...easing)
            }
        )
    }

    function fadeIn(fadeInInfos) {
        fadeInInfos.map(({ asset: addedAssetName, delay, time, scene }) => {
            if (!assets[addedAssetName]) {
                console.error(`Can't add "${addedAssetName}", asset not found`)
            }
            let localTweenedVar = { fadeInPercentage: 0 } // 0 -> 1

            assets[addedAssetName].traverse(child => {
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
                        child.material.map(actualMaterial => {
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
                    assets[addedAssetName].traverse(child => {
                        if (child.material) {
                            /* NOTE: this can be an array!! */
                            if (child.material.map) {
                                child.material.map(actualMaterial => {
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
        fadeOutInfos.map(({ asset: removedAssetName, delay, time, hidden }) => {
            let localTweenedVar = { fadeOutPercentage: 1 } // 1 -> 0

            if (!assets[removedAssetName]) {
                console.error(
                    `Can't remove "${removedAssetName}", asset not found`
                )
            }
            TweenLite.to(localTweenedVar, time, {
                fadeOutPercentage: 0,
                delay: delay,
                onStart: () => {
                    assets[removedAssetName].traverse(child => {
                        if (child.material) {
                            /* NOTE: this can be an array!! */
                            if (child.material.map) {
                                child.material.map(actualMaterial => {
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
                    assets[removedAssetName].traverse(child => {
                        if (child.intensity) {
                            child.intensity =
                                child.normalIntensity *
                                localTweenedVar.fadeOutPercentage // not very accurate, but may be sufficient (best accuracy would involve stocking initial intensity values for all lights)
                        } else if (child.material) {
                            /* NOTE: this can be an array!! */
                            if (child.material.map) {
                                child.material.map(actualMaterial => {
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
                    sceneR.remove(assets[removedAssetName])
                    sceneL.remove(assets[removedAssetName])
                    masterScene.remove(assets[removedAssetName])

                    if (hidden === true) {
                        assets[removedAssetName].traverse(child => {
                            if (child.dispose) child.dispose()
                        })
                    }
                }
            })
        })
    }

    function tweenFog(newFog) {
        TweenLite.to(masterScene.fog, newFog.time, {
            density: newFog.density,
            delay: newFog.delay,
            ease: getEasing(...newFog.easing)
        })
    }

    function changeToStep(step) {
        masterScene.add(camera) // this is to display the spotLights that are dependant on the camera's position (cf.Trial1)

        // canvasAngle = step.canvasAngle ? step.canvasAngle : 0
        // CanvasRotator(canvas, camera, customRenderer).rotateCanvas(canvasAngle)

        if (sceneEntities[step.name]) {
            if (currentSceneEntity.beforeDestroy) {
                currentSceneEntity.beforeDestroy()
            }
            currentSceneEntity = sceneEntities[step.name]()
        }
        if (step.addedThreeGroupsDsk) {
            fadeIn(step.addedThreeGroupsDsk)
        }
        if (step.removedThreeGroupsDsk) {
            fadeOut(step.removedThreeGroupsDsk)
        }
        if (step.cleanSlider) {
            // TODO: fadeOut these elements before removing them
            while (sceneL.children.length) {
                sceneL.remove(sceneL.children[0])
            }
            while (sceneR.children.length) {
                sceneR.remove(sceneR.children[0])
            }
        }
        if (step.fog) {
            tweenFog(step.fog)
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
        timeVars.DELTA_TIME = Date.now() - timeVars.LAST_TIME
        timeVars.LAST_TIME = Date.now()
        timeVars.mstime += timeVars.DELTA_TIME
        timeVars.time = timeVars.mstime * 0.001 // convert from millis to seconds
    }

    function update() {
        requestAnimationFrame(update)
        updateTime()

        if (isMovingCamera) {
            const camDir = neutralCamDir
                .clone()
                .applyQuaternion(camera.quaternion)
            glowMaterial.uniforms.camDir.value = [camDir.x, camDir.y, camDir.z]
            camera.position.copy(
                // currentCameraPathSpacedPoints[
                //     Math.floor(
                //         globalTweenedVars.camPosPercentage *
                //             currentCameraPathSpacedPoints.length
                //     )
                // ]
                // currentCameraPath.getPoint(globalTweenedVars.camPosPercentage)
                currentCameraPath.getPointAt(globalTweenedVars.camPosPercentage)
            ) // 0 -> 1
            if (globalTweenedVars.camPosPercentage >= 0.9999) {
                isMovingCamera = false
            }
        }

        // camera.target.getWorldPosition(camTargetGlobalPos) // mutate the camTargetGlobalPos variable
        // camTargetGlobalPos.y += Math.sin(time) * 30 // for debug
        camera.lookAt(camera.target.position)

        currentSceneEntity.update(timeVars, mobileQuaternions)

        // customRenderer.render(currentSceneEntity.scenes, camera)
        // customRenderer.render(
        //     [masterScene, currentSceneEntity.scenes[0]],
        //     camera
        // )

        //TEST FOR RENDER STUFF
        if (sceneL.children.length > 0) {
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
        } else {
            customRenderer.finalRenderer.autoClear = true // important!
            customRenderer.render([masterScene], camera)
        }
    }

    function initGui() {
        // Gui
        const gui = new dat.GUI()

        gui.add(masterScene.fog, "density")
            .min(0)
            .max(0.035)
            .name("Fog density")

        gui.close()
    }

    return {
        init,
        update,
        initEventsListeners
    }
}

export default SceneManager
