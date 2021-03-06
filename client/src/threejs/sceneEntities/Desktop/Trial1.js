import * as THREE from "three"
import { visibleHeightAtZDepth, visibleWidthAtZDepth } from "../../helpers"
import { reMap } from "../../../utils"
import * as dat from "dat.gui"
import { bus } from "../../../main"
import { threeBus } from "../../../main"
import { SpotLight } from "three"
import { TweenLite } from "gsap"

function Trial1(scene, camera, assets, timeVars) {
    /* ----------------------- INPUTS ----------------------- */

    let video
    // this settimetout is necessary to wait for vuejs to actually render the <video> element
    setTimeout(() => {
        video = document.getElementsByTagName("video")[0]
    }, 0)

    let cyanSpotLight,
        pinkSpotLight,
        cyanSpotLightHelper,
        rotationHelper,
        pinkSpotLightHelper

    const neutralQuaternion = new THREE.Quaternion() // same as (0, 0, 0, 1)
    const neutralCamVector = new THREE.Vector3(0, 0, -1)
    let cameraTargetDist

    let cyanTargetPosToLerp = new THREE.Vector3()
    let pinkTargetPosToLerp = new THREE.Vector3()

    let baseTour
    let holesArr = []

    // Racyaster
    const spotLightRaycaster = new THREE.Raycaster()

    const colors = {
        cyan: new THREE.Color(0x00c8ff),
        pink: new THREE.Color(0xff003b),
        blue: new THREE.Color(0x214cff),
        red: new THREE.Color(0xff1b38),
        white: new THREE.Color(0xff99ff),
        grey: new THREE.Color(0x909090),
        purple: new THREE.Color(0x5f00ff)
    }

    const debug = {
        video: false,
        canvas: false
    }

    const easingFactor = 0.16

    // Conditions de victoire (seconds)
    const defaultScaleDuration = 3 // 5
    const fusionScaleDuration = 1.2 // 2

    // TODO: maxDistance must be dynamic : the furter away the camera is, the bigger it needs to be (use cameraTargetDist)
    const maxDistanceFromHole = 0.75 // 0.65-0.7 convient pour les plus petits trous

    // If a color scaled the shape more than this value, it win the hole
    // Both win between (1 - 0.7) and 0.7
    const maxColorScale = 0.7

    init()
    createSpotlights()
    // initGui()

    /* ----------------------- INIT ----------------------- */
    function init() {
        // Helpers
        // const axesHelper = new THREE.AxesHelper(50)
        // scene.add(axesHelper)
        // scene.add(camera.target)

        // Get tour base
        assets.islands.traverse(child => {
            if (child.name.includes("Towerbroken")) baseTour = child
        })

        // assets.islands.traverse(child => {
        //     if (child.material) {
        //         child.material.metalness = 0
        //         child.material.roughness = 1
        //     }
        // })

        // Get all holes
        assets.islands.traverse(child => {
            if (child.name.includes("HoleFill")) {
                child.material = child.material.clone() // clone material so that it is not shared with other meshes
                holesArr.push(child)
            }
        })
        holesArr.forEach(hole => {
            hole.cyanValue = 0
            hole.pinkValue = 0

            hole.progress = 0
            hole.progressMax = 1 // 100%
            hole.winner = "None"

            // hole.scaleMax = hole.scale.clone()
            // hole.scale.multiplyScalar(0.001)
            // hole.scaleMin = hole.scale.clone()
        })

        // console.log("ARR", holesScaleMax, holesScaleMin)

        // scene.add(assets.islands)

        // LISTENERS
        threeBus.$on("track", refreshTrackedDatas)
        threeBus.$emit("reset trial1", resetTrial1)
        // bus.$on("logTrial1Victorious", checkVictoriousPlayer)

        // positionPersos()
    }

    // function positionPersos() {
    //     console.log("BASETOUR", baseTour)
    //     assets.zanitRigged.position.copy(baseTour.position.clone())
    //     assets.lamarRigged.position.copy(baseTour.position.clone())

    //     assets.zanitRigged.scale.set(10, 10, 10)
    // }

    /* ----------------------- SPOTLIGHTS ----------------------- */
    function createSpotlights() {
        const spotLightParams = {
            intensity: 50,
            distance: 0,
            angle: Math.PI / 63,
            penumbra: 0.7
        }
        // const spotTargetPos = new THREE.Vector3()
        // const spotLightPos = new THREE.Vector3(0, 0, 0)

        // CYAN
        cyanSpotLight = new THREE.SpotLight(
            colors.blue,
            ...Object.values(spotLightParams)
        )
        cyanSpotLight.position.set(0, 0, 0)
        cyanSpotLight.lastTrackedBlob = null
        cyanSpotLight.isTracking = false

        // Cyan target
        cyanSpotLight.target.position.set(0, 0, 50)
        // var targetGeometry = new THREE.SphereGeometry(0.1, 8, 8)
        // var targetMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff })
        // var targetSphere = new THREE.Mesh(targetGeometry, targetMaterial)
        // cyanSpotLight.target.add(targetSphere)
        cyanSpotLight.add(cyanSpotLight.target)
        camera.add(cyanSpotLight)

        // rotationHelper = targetSphere.clone()
        // rotationHelper.material.wireframe = true
        // cyanSpotLight.add(rotationHelper)

        cyanSpotLightHelper = new THREE.SpotLightHelper(cyanSpotLight)
        cyanSpotLightHelper.visible = false
        scene.add(cyanSpotLightHelper)

        // PINK
        pinkSpotLight = new THREE.SpotLight(
            colors.red,
            ...Object.values(spotLightParams)
        )
        pinkSpotLight.position.set(0, 0, 0)
        pinkSpotLight.lastTrackedBlob = null
        pinkSpotLight.isTracking = false

        // Pink target
        pinkSpotLight.target.position.set(0, 0, 50)
        // var targetGeometry = new THREE.SphereGeometry(0.1, 8, 8) // helper for debug
        // var targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff })
        // var targetSphere = new THREE.Mesh(targetGeometry, targetMaterial)
        // pinkSpotLight.target.add(targetSphere)
        pinkSpotLight.add(pinkSpotLight.target)
        camera.add(pinkSpotLight)

        pinkSpotLightHelper = new THREE.SpotLightHelper(pinkSpotLight)
        pinkSpotLightHelper.visible = false
        scene.add(pinkSpotLightHelper)
    }

    // /* ----------------------- REFRESH AND APPLY TRACKER ----------------------- */
    function refreshTrackedDatas(trackedDatas) {
        if (trackedDatas.cyanBlob) {
            cyanSpotLight.lastTrackedBlob = trackedDatas.cyanBlob
            cyanSpotLight.isTracking = true
        } else {
            cyanSpotLight.isTracking = false
        }

        if (trackedDatas.pinkBlob) {
            pinkSpotLight.lastTrackedBlob = trackedDatas.pinkBlob
            pinkSpotLight.isTracking = true
        } else {
            pinkSpotLight.isTracking = false
        }
    }

    function applyLastTrackedDatas() {
        // cyanSpotLight.target.position =>
        // cyanTargetPosToLerp.copy(projectedPosFromBlob(cyanSpotLight.lastTrackedBlob, cameraTargetDist, camera, true))
        // cyanSpotLight.position =>
        // cyanSpotPosToLerp.copy(projectedPosFromBlob(cyanSpotLight.lastTrackedBlob, cameraTargetDist*0.01, camera, false))

        if (cyanSpotLight.lastTrackedBlob) {
            const projectedTargetPosFromCyanBlob = projectedPosFromBlob(
                cyanSpotLight.lastTrackedBlob,
                cameraTargetDist,
                camera
            )
            if (projectedTargetPosFromCyanBlob) {
                cyanTargetPosToLerp.copy(projectedTargetPosFromCyanBlob)
            }
        }
        if (pinkSpotLight.lastTrackedBlob) {
            const projectedTargetPosFromPinkBlob = projectedPosFromBlob(
                pinkSpotLight.lastTrackedBlob,
                cameraTargetDist,
                camera
            )
            if (projectedTargetPosFromPinkBlob) {
                pinkTargetPosToLerp.copy(projectedTargetPosFromPinkBlob)
            }
        }
    }

    /* ----------------------- PROJECT BLOB ----------------------- */
    /**
     * @function projectedPosFromBlob
     * @param {object} blob
     * @param {number} distance
     * @param {THREE.Camera} camera
     * @returns {THREE.Vector3}
     */
    function projectedPosFromBlob(blob, distance, camera) {
        // function projectedPosFromBlob(blob) {
        if (!blob) {
            console.warn("blob is falsy")
            return
        }
        let projectedTargPos
        const normalizedBlob = {
            // should be between -1 -> 1
            x: reMap(blob.x, 0, video.offsetWidth, 1, -1),
            y: reMap(blob.y, 0, video.offsetHeight, 1, -1)
        }

        projectedTargPos = new THREE.Vector3(
            normalizedBlob.x * visibleWidthAtZDepth(distance, camera) * 0.5,
            normalizedBlob.y * visibleHeightAtZDepth(distance, camera) * 0.5,
            // 10 - cameraTargetDist * 0.3 // negative => in front of camera, positive => behind
            -distance
        )
        return projectedTargPos
    }

    /* ----------------------- RAYCAST ----------------------- */
    function raycastedPosFromSpot(spot) {
        if (spot) {
            let spotPos = new THREE.Vector3()
            spot.getWorldPosition(spotPos)
            // const spotPos = camera.position // /!\ not the same thing (?!) => doesnt work

            let spotTargetPos = new THREE.Vector3()
            spot.target.getWorldPosition(spotTargetPos)
            const raycastDir = new THREE.Vector3()
                .copy(spotTargetPos)
                .sub(spotPos)
                .normalize()

            spotLightRaycaster.set(spotPos, raycastDir)
            const intersects = spotLightRaycaster.intersectObjects(
                baseTour.children
            )

            // if (intersects[0]) {
            //     projectedTargPos = intersects[0].point
            //     return projectedTargPos
            // } else {
            //     console.error("'intersects[0]' does not exist")
            // }

            return intersects[0] ? intersects[0].point : null
        }
    }

    function checkAimingHole(cyanRaycastPos, pinkRaycastPos) {
        // console.log(holesArr)
        holesArr.forEach((hole, index) => {
            if (hole.progress < hole.progressMax) {
                // HOLE IS NOT COMPLETLY FILLED > FILL IT
                let distanceHoleToCyan, distanceHoleToPink

                let holeWorldPos = new THREE.Vector3()
                hole.getWorldPosition(holeWorldPos)
                // Get cyan / pink distances
                if (cyanRaycastPos) {
                    distanceHoleToCyan = cyanRaycastPos.distanceTo(holeWorldPos)
                }
                if (pinkRaycastPos) {
                    distanceHoleToPink = pinkRaycastPos.distanceTo(holeWorldPos)
                }

                // Check superposition, then cyan / pink
                if (
                    distanceHoleToCyan < maxDistanceFromHole &&
                    distanceHoleToPink < maxDistanceFromHole
                ) {
                    hole.pinkValue +=
                        (timeVars.DELTA_TIME / fusionScaleDuration) *
                        0.001 *
                        0.5
                    hole.cyanValue +=
                        (timeVars.DELTA_TIME / fusionScaleDuration) *
                        0.001 *
                        0.5

                    threeBus.$emit("holeScaling", {
                        color: "White",
                        progress: (hole.cyanValue + hole.pinkValue) * 100
                    })
                } else {
                    if (distanceHoleToCyan < maxDistanceFromHole) {
                        hole.cyanValue +=
                            (timeVars.DELTA_TIME / defaultScaleDuration) * 0.001
                        threeBus.$emit("holeScaling", {
                            color: "Cyan",
                            progress: hole.cyanValue * 100
                        })
                    }

                    if (distanceHoleToPink < maxDistanceFromHole) {
                        hole.pinkValue +=
                            (timeVars.DELTA_TIME / defaultScaleDuration) * 0.001
                        threeBus.$emit("holeScaling", {
                            color: "Pink",
                            progress: hole.pinkValue * 100
                        })
                    }
                }

                // Scale the hole
                hole.progress = hole.cyanValue + hole.pinkValue

                const newScale = hole.scaleMin
                    .clone()
                    .lerp(hole.scaleMax, hole.progress)
                hole.scale.copy(newScale)
            } else {
                // HOLE IS FILLED > CHECK VICTORIOUS
                // console.log("HOLE FILLED")

                if (hole.cyanValue >= maxColorScale) {
                    // Cyan winner
                    hole.winner = "Cyan"
                    const finishedFillTween = TweenLite.to(
                        hole.material.color,
                        0.4,
                        {
                            r: colors.cyan.r,
                            g: colors.cyan.g,
                            b: colors.cyan.b
                        }
                    )
                    const emissiveColorFillTween = TweenLite.fromTo(
                        hole.material.emissive,
                        0.6,
                        {
                            r: hole.material.emissive.r,
                            g: hole.material.emissive.g,
                            b: hole.material.emissive.b
                        },
                        {
                            r: colors.cyan.r,
                            g: colors.cyan.g,
                            b: colors.cyan.b
                        }
                    )
                    const emissiveIntensityFillTween = TweenLite.fromTo(
                        hole.material,
                        0.6,
                        {
                            emissiveIntensity: 0
                        },
                        {
                            emissiveIntensity: 0.06
                        }
                    )
                } else if (hole.pinkValue >= maxColorScale) {
                    // Pink winner
                    hole.winner = "Pink"
                    const finishedFillTween = TweenLite.to(
                        hole.material.color,
                        0.4,
                        {
                            r: colors.pink.r,
                            g: colors.pink.g,
                            b: colors.pink.b
                        }
                    )
                    const emissiveColorFillTween = TweenLite.fromTo(
                        hole.material.emissive,
                        0.6,
                        {
                            r: hole.material.emissive.r,
                            g: hole.material.emissive.g,
                            b: hole.material.emissive.b
                        },
                        {
                            r: colors.pink.r,
                            g: colors.pink.g,
                            b: colors.pink.b
                        }
                    )
                    const emissiveIntensityFillTween = TweenLite.fromTo(
                        hole.material,
                        0.6,
                        {
                            emissiveIntensity: 0
                        },
                        {
                            emissiveIntensity: 0.09
                        }
                    )
                } else {
                    // Both wins
                    hole.winner = "Purple"
                    const finishedFillTween = TweenLite.to(
                        hole.material.color,
                        0.4,
                        {
                            r: colors.purple.r,
                            g: colors.purple.g,
                            b: colors.purple.b
                        }
                    )
                    const emissiveColorFillTween = TweenLite.fromTo(
                        hole.material.emissive,
                        0.5,
                        {
                            r: hole.material.emissive.r,
                            g: hole.material.emissive.g,
                            b: hole.material.emissive.b
                        },
                        {
                            r: colors.purple.r,
                            g: colors.purple.g,
                            b: colors.purple.b
                        }
                    )
                    const emissiveIntensityFillTween = TweenLite.fromTo(
                        hole.material,
                        0.5,
                        {
                            emissiveIntensity: 0
                        },
                        {
                            emissiveIntensity: 0.2
                        }
                    )
                }

                holesArr.splice(holesArr.indexOf(hole), 1)
                threeBus.$emit("holeFilled", hole.winner)
            }
        })
    }

    // function checkVictoriousPlayer() {
    //     const nbTotalHoles = holesArr.length
    //     const nbFilledHoles =
    //         nbTotalHoles - holesArr.filter((hole) => hole.winner === "None").length
    //     const nbWhite = holesArr.filter((hole) => hole.winner === "White").length
    //     const nbCyan = holesArr.filter((hole) => hole.winner === "Cyan").length
    //     const nbPink = holesArr.filter((hole) => hole.winner === "Pink").length

    //     let victoriousPlayer = null
    //     if (nbFilledHoles > nbTotalHoles / 2) {
    //         // Check white
    //         if (nbWhite >= nbFilledHoles / 2) {
    //             console.log("Tour color is white")
    //             victoriousPlayer = "team"
    //         } else {
    //             if (nbCyan > nbPink) {
    //                 console.log("Tour color is cyan")
    //                 victoriousPlayer = "cyan"
    //             } else if (nbPink > nbCyan) {
    //                 console.log("Tour color is pink")
    //                 victoriousPlayer = "pink"
    //             } else {
    //                 console.log("Restart bitch (vous n'êtes pas départagés)")
    //             }
    //         }
    //     } else {
    //         console.log("Restart bitch (need more FilledHoles)")
    //     }

    //     if (victoriousPlayer != null) {
    //         bus.$emit("trigger ending", victoriousPlayer)
    //     }
    // }

    function update(timeVars, mobileQuaternions) {
        applyLastTrackedDatas()

        cameraTargetDist = camera.position
            .clone()
            .sub(camera.target.position)
            .length()

        if (cyanSpotLight.lastTrackedBlob) {
            // TODO: do some LERP or SLERP here
            const targetQuat = new THREE.Quaternion().setFromUnitVectors(
                neutralCamVector,
                cyanTargetPosToLerp.normalize()
            )
            cyanSpotLight.quaternion.slerp(targetQuat, easingFactor)
            cyanSpotLight.target.position.z = -cameraTargetDist

            cyanSpotLight.intensity = 20 + cameraTargetDist * 8

            // rotationHelper.scale.set(
            //     cameraTargetDist * 2,
            //     cameraTargetDist * 2,
            //     cameraTargetDist * 2
            // )

            if (mobileQuaternions.cyan) {
                // TODO: remove dummy stuff (optimize)
                const dummyVec = new THREE.Vector3(0, 0, 1)
                const mobileQuat = new THREE.Quaternion(
                    mobileQuaternions.cyan._x,
                    mobileQuaternions.cyan._y,
                    mobileQuaternions.cyan._z,
                    mobileQuaternions.cyan._w
                )
                dummyVec.applyQuaternion(mobileQuat)
                const dummyQuat = new THREE.Quaternion().setFromUnitVectors(
                    cyanSpotLight.target.position,
                    dummyVec
                )
                cyanSpotLight.quaternion.slerp(dummyQuat, 0.032)
                // slerp value should be around 0.02 -> 0.1 (closer to 0, the spotlight feels harder to rotate)
            }
            cyanSpotLightHelper.update()
        }

        if (pinkSpotLight.lastTrackedBlob) {
            // TODO: do some LERP or SLERP here
            const targetQuat = new THREE.Quaternion().setFromUnitVectors(
                neutralCamVector,
                pinkTargetPosToLerp.normalize()
            )
            pinkSpotLight.quaternion.slerp(targetQuat, easingFactor)
            pinkSpotLight.target.position.z = -cameraTargetDist

            pinkSpotLight.intensity = 20 + cameraTargetDist * 12

            if (mobileQuaternions.pink) {
                // TODO: remove dummy stuff (optimize)
                const dummyVec = new THREE.Vector3(0, 0, 1)
                const mobileQuat = new THREE.Quaternion(
                    mobileQuaternions.pink._x,
                    mobileQuaternions.pink._y,
                    mobileQuaternions.pink._z,
                    mobileQuaternions.pink._w
                )
                dummyVec.applyQuaternion(mobileQuat)
                const dummyQuat = new THREE.Quaternion().setFromUnitVectors(
                    pinkSpotLight.target.position,
                    dummyVec
                )
                pinkSpotLight.quaternion.slerp(dummyQuat, 0.032)
                // slerp value should be around 0.02 -> 0.1 (closer to 0, the spotlight feels harder to rotate)
            }
            pinkSpotLightHelper.update()
        }

        // Fill holes
        checkAimingHole(
            raycastedPosFromSpot(cyanSpotLight),
            raycastedPosFromSpot(pinkSpotLight)
        )
    }

    function resetTrial1() {
        // Reset hole progress
        holesArr.forEach(hole => {
            // Reset colors tours
            hole.material.color.copy(colors.grey)
            hole.material.emissive.copy(colors.grey)
            hole.material.emissiveIntensity = 0

            hole.cyanValue = 0
            hole.pinkValue = 0

            hole.progress = 0
            hole.progressMax = 1 // 100%
            hole.winner = "None"

            hole.scale.copy(hole.scaleMin)
        })
    }

    function beforeDestroy() {
        console.log("Before destroy trial 1")
        cyanSpotLight.intensity = 0
        pinkSpotLight.intensity = 0
    }

    /* ----------------------- GUI ----------------------- */
    function initGui() {
        // Gui
        const gui = new dat.GUI()

        gui.add(debug, "video").onChange(boolean => {
            if (boolean) {
                video.style.opacity = 1
            } else {
                video.style.opacity = 0
            }
        })

        const spotLightHelpers = gui.addFolder("Spotlight Helpers")
        spotLightHelpers.add(pinkSpotLightHelper, "visible").name("Pink")
        spotLightHelpers.add(cyanSpotLightHelper, "visible").name("Cyan")

        spotLightHelpers.open()

        gui.add(camera, "logCamera")

        gui.close()
    }

    return {
        update,
        beforeDestroy
    }
}

export default Trial1
