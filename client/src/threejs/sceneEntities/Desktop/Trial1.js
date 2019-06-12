import * as THREE from "three"
import {
    visibleHeightAtZDepth,
    visibleWidthAtZDepth,
    applyFuncOnObjs
} from "../../helpers"
import { reMap } from "../../../utils"
import * as dat from "dat.gui"
import { bus } from "../../../main"
import { threeBus } from "../../../main"

function Trial1(scene, camera, assets) {
    /* ----------------------- INPUTS ----------------------- */

    let video
    // this settimetout is necessary to wait for vuejs to actually render the <video> element
    setTimeout(() => {
        video = document.getElementsByTagName("video")[0]
    }, 0)

    let cyanSpotLight, pinkSpotLight, cyanSpotLightHelper, pinkSpotLightHelper

    const neutralQuaternion = new THREE.Quaternion(1, 0, 0, 0)
    let cameraTargetDist

    let cyanTargetPosToLerp = new THREE.Vector3()
    let pinkTargetPosToLerp = new THREE.Vector3()

    let baseTour
    let holesArr = []

    // Racyaster
    const spotLightRaycaster = new THREE.Raycaster()

    const colors = {
        cyan: "#00ffff",
        pink: "#ff00ff",
        blue: "#0000ff",
        red: "#ff0000"
    }

    const debug = {
        video: false,
        canvas: false
    }

    const easingFactor = 0.28

    // Conditions de victoire (seconds)
    const defaultScaleDuration = 2.5 // 5
    const fusionScaleDuration = 1 // 2

    const maxDistanceFromHole = 0.65

    // If a color scaled the shape more than this value, it win the hole
    // Both win between (1 - 0.7) and 0.7
    const maxColorScale = 0.7

    init()
    createSpotlights()
    initGui()

    /* ----------------------- INIT ----------------------- */
    function init() {
        // Helpers
        const axesHelper = new THREE.AxesHelper(50)
        scene.add(axesHelper)
        // scene.add(camera.target)

        // Get tour base
        assets.islands.traverse(child => {
            if (child.name.includes("Towerbroken")) baseTour = child
        })

        // Get all holes
        assets.islands.traverse(child => {
            if (child.name.includes("HoleFill")) holesArr.push(child)
        })
        holesArr.forEach(hole => {
            hole.cyanValue = 0
            hole.pinkValue = 0

            hole.progress = 0
            hole.progressMax = 1 // 100%
            hole.winner = "None"

            hole.scaleMax = hole.scale.clone()
            hole.scale.multiplyScalar(0.001)
            hole.scaleMin = hole.scale.clone()
        })

        // scene.add(assets.islands)

        // LISTENERS
        threeBus.$on("track", refreshTrackedDatas)
        bus.$on("logTrial1Victorious", checkVictoriousPlayer)
    }

    /* ----------------------- SPOTLIGHTS ----------------------- */
    function createSpotlights() {
        const spotLightParams = {
            intensity: 50,
            distance: 0,
            angle: Math.PI / 60,
            penumbra: 0.9
        }
        // const spotTargetPos = new THREE.Vector3()
        // const spotLightPos = new THREE.Vector3(0, 0, 0)

        // CYAN
        cyanSpotLight = new THREE.SpotLight(
            colors.cyan,
            ...Object.values(spotLightParams)
        )
        cyanSpotLight.position.set(0, 0, 0)
        cyanSpotLight.lastTrackedBlob = null
        cyanSpotLight.isTracking = false

        // Cyan target
        cyanSpotLight.target.position.set(0, 0, 50)
        var targetGeometry = new THREE.SphereGeometry(0.2, 8, 8)
        var targetMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        var targetSphere = new THREE.Mesh(targetGeometry, targetMaterial)
        cyanSpotLight.target.add(targetSphere)
        cyanSpotLight.add(cyanSpotLight.target)
        camera.add(cyanSpotLight)

        cyanSpotLightHelper = new THREE.SpotLightHelper(cyanSpotLight)
        cyanSpotLightHelper.visible = true
        scene.add(cyanSpotLightHelper)

        // PINK
        pinkSpotLight = new THREE.SpotLight(
            colors.pink,
            ...Object.values(spotLightParams)
        )
        pinkSpotLight.lastTrackedBlob = null
        pinkSpotLight.isTracking = false

        // Pink target
        pinkSpotLight.target.position.set(0, 0, 50)
        var targetGeometry = new THREE.SphereGeometry(1, 8, 8) // helper for debug
        var targetMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        var targetSphere = new THREE.Mesh(targetGeometry, targetMaterial)
        pinkSpotLight.target.add(targetSphere)
        pinkSpotLight.add(pinkSpotLight.target)
        camera.add(pinkSpotLight)

        pinkSpotLightHelper = new THREE.SpotLightHelper(pinkSpotLight)
        pinkSpotLightHelper.visible = true
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
                camera,
                true
            )
            if (projectedTargetPosFromCyanBlob) {
                cyanTargetPosToLerp.copy(projectedTargetPosFromCyanBlob)
            }
        }
        if (pinkSpotLight.lastTrackedBlob) {
            const projectedTargetPosFromPinkBlob = projectedPosFromBlob(
                pinkSpotLight.lastTrackedBlob,
                cameraTargetDist,
                camera,
                true
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
     * @param {boolean} reversedY
     * @returns {THREE.Vector3}
     */
    function projectedPosFromBlob(blob, distance, camera, reversedY) {
        // function projectedPosFromBlob(blob) {
        if (!blob) {
            console.warn("blob is falsy")
            return
        }
        let projectedTargPos
        const reverseVal = reversedY === true ? -1 : 1
        const normalizedBlob = {
            // should be between -1 -> 1
            x: reMap(blob.x, 0, video.offsetWidth, 1, -1),
            y: reMap(blob.y, 0, video.offsetHeight, 1, -1) * reverseVal
        }

        projectedTargPos = new THREE.Vector3(
            normalizedBlob.x * visibleWidthAtZDepth(-distance, camera) * 0.5,
            normalizedBlob.y * visibleHeightAtZDepth(-distance, camera) * 0.5,
            // 10 - cameraTargetDist * 0.3 // negative => in front of camera, positive => behind
            -distance
        )
        console.log("visibleH:", visibleHeightAtZDepth(-distance, camera))
        console.log("cameraTargetDist:", cameraTargetDist)
        return projectedTargPos
    }

    /* ----------------------- RAYCAST ----------------------- */
    function raycastedPosFromSpot(spot) {
        if (spot) {
            // let spotPos = new THREE.Vector3()
            // spot.getWorldPosition(spotPos)
            const spotPos = camera.position

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
                    hole.pinkValue += 1 / (60 * fusionScaleDuration * 2)
                    hole.cyanValue += 1 / (60 * fusionScaleDuration * 2)
                } else {
                    if (distanceHoleToCyan < maxDistanceFromHole) {
                        hole.cyanValue += 1 / (60 * defaultScaleDuration)
                    }

                    if (distanceHoleToPink < maxDistanceFromHole)
                        hole.pinkValue += 1 / (60 * defaultScaleDuration)
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
                    hole.material.color.set(colors.cyan)
                } else if (hole.pinkValue >= maxColorScale) {
                    // Pink winner
                    hole.winner = "Pink"
                    hole.material.color.set(colors.pink)
                } else {
                    // Both wins
                    hole.winner = "White"
                    hole.material.color.set(colors.blue)
                }
            }
        })
    }

    function checkVictoriousPlayer() {
        const nbTotalHoles = holesArr.length
        const nbFilledHoles =
            nbTotalHoles -
            holesArr.filter(hole => hole.winner === "None").length
        const nbWhite = holesArr.filter(hole => hole.winner === "White").length
        const nbCyan = holesArr.filter(hole => hole.winner === "Cyan").length
        const nbPink = holesArr.filter(hole => hole.winner === "Pink").length

        if (nbFilledHoles > nbTotalHoles / 2) {
            // Check white
            if (nbWhite >= nbFilledHoles / 2) {
                console.log("Tour color is white")
            } else {
                if (nbCyan > nbPink) {
                    console.log("Tour color is cyan")
                } else if (nbPink > nbCyan) {
                    console.log("Tour color is pink")
                } else {
                    console.log("Restart bitch (vous vous êtes pas départager")
                }
            }
        } else {
            console.log("Restart bitch (need more FilledHoles)")
        }
    }

    function update(time, mobileQuaternions) {
        applyLastTrackedDatas()

        cameraTargetDist = camera.position
            .clone()
            .sub(camera.target.position)
            .length()

        if (cyanSpotLight.lastTrackedBlob) {
            cyanSpotLight.target.position.lerp(
                cyanTargetPosToLerp,
                easingFactor
            )
            cyanSpotLight.target.position.z = cameraTargetDist * 0.9
            cyanSpotLight.intensity = 1 + cameraTargetDist * 5
            cyanSpotLightHelper.update()

            if (mobileQuaternions.cyan) {
                cyanSpotLight.quaternion
                    .set(
                        mobileQuaternions.cyan._x,
                        mobileQuaternions.cyan._y,
                        mobileQuaternions.cyan._z,
                        mobileQuaternions.cyan._w
                    )
                    .slerp(neutralQuaternion, 0.95)
                // slerp value should be around 0.95 -> 0.85 (closer to 0, the spotlight feels easier to rotate)
                // TODO: maybe use camera.target.position.length here
            } else {
                cyanSpotLight.quaternion.copy(neutralQuaternion)
            }
        }

        if (pinkSpotLight.lastTrackedBlob) {
            pinkSpotLight.position.lerp(pinkSpotPosToLerp, easingFactor)
            // TODO: the use of camera.position makes no sense here
            pinkSpotLight.target.position.z = cameraTargetDist
            pinkSpotLight.intensity = 1 + cameraTargetDist * 2
            pinkSpotLightHelper.update()

            if (mobileQuaternions.pink) {
                pinkSpotLight.quaternion
                    .set(
                        mobileQuaternions.pink._x,
                        mobileQuaternions.pink._y,
                        mobileQuaternions.pink._z,
                        mobileQuaternions.pink._w
                    )
                    .slerp(neutralQuaternion, 0.5)
                // slerp value should be around 0.7 -> 0.4 (closer to 0, the spotlight feels easier to rotate)
                // TODO: maybe use camera.target.position.length here
            } else {
                pinkSpotLight.quaternion.copy(neutralQuaternion)
            }
        }

        // Fill holes
        checkAimingHole(
            raycastedPosFromSpot(cyanSpotLight),
            raycastedPosFromSpot(pinkSpotLight)
        )
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
        update
    }
}

export default Trial1
