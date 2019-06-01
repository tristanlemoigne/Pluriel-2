import * as THREE from "three"
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

    let time = 0
    let cyanSpotLight, pinkSpotLight, cyanSpotLightHelper, pinkSpotLightHelper

    let mobileQuaternionHelper, mobileQuaternionHelperDir

    let cyanPosToLerp, pinkPosToLerp, raycastedCyanSpot, raycastedPinkSpot
    let baseTour
    let holesArr = []

    // Racyaster
    const raycaster = new THREE.Raycaster()
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

    const easingFactor = 0.225

    // Conditions de victoire (seconds)
    const defaultScaleDuration = 5
    const fusionScaleDuration = 2

    const maxDistanceFromHole = 1.8

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
        mobileQuaternionHelper = new THREE.Mesh(
            new THREE.ConeGeometry(0.8, 2.2, 4),
            new THREE.MeshLambertMaterial({ color: 0x999900 })
        )
        mobileQuaternionHelper.position.set(3, 4, 0)
        mobileQuaternionHelper.scale.set(1, 1, 0.35)
        mobileQuaternionHelperDir = new THREE.Vector3()
        scene.add(mobileQuaternionHelper)

        // LIGHTS
        // const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080804)
        // hemisphereLight.position.set(-10, 10, 0)
        // scene.add(hemisphereLight)

        // MODELS
        // TOUR1
        const tour = assets.islands
        // const tourMaterial = new THREE.MeshPhongMaterial()
        // Replace all materials by default
        // tour.traverse(child => {
        //     if (child instanceof THREE.Mesh) {
        //         child.material = tourMaterial.clone()
        //     }
        // })

        // Get tour base
        tour.traverse(child => {
            if (child.name.includes("Towerbroken")) baseTour = child
        })

        // Get all holes
        tour.traverse(child => {
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

        scene.add(tour)

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
            penumbra: 0.2
        }
        // const spotTargetPos = new THREE.Vector3()
        // const spotLightPos = new THREE.Vector3(0, 0, 0)

        // CYAN
        // Cyan projected position on raycastShape (to Lerp to), reassigned onTrack
        cyanSpotLight = new THREE.SpotLight(
            colors.cyan,
            ...Object.values(spotLightParams)
        )
        cyanSpotLight.lastTrackedBlob = null
        cyanSpotLight.isTracking = false

        // Cyan target
        cyanSpotLight.target.position.set(0, 0, 50)
        var targetGeometry = new THREE.SphereGeometry(1, 8, 8)
        var targetMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        var targetSphere = new THREE.Mesh(targetGeometry, targetMaterial)
        cyanSpotLight.target.add(targetSphere)
        cyanSpotLight.add(cyanSpotLight.target)
        scene.add(cyanSpotLight)

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
        var targetGeometry = new THREE.SphereGeometry(1, 8, 8)
        var targetMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        var targetSphere = new THREE.Mesh(targetGeometry, targetMaterial)
        pinkSpotLight.target.add(targetSphere)
        pinkSpotLight.add(pinkSpotLight.target)
        scene.add(pinkSpotLight)

        pinkSpotLightHelper = new THREE.SpotLightHelper(pinkSpotLight)
        pinkSpotLightHelper.visible = true
        scene.add(pinkSpotLightHelper)
        scene.add(pinkSpotLight)
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
        if (cyanSpotLight.lastTrackedBlob) {
            const raycastedPosFromCyanBlob = raycastedPosFromBlob(
                cyanSpotLight.lastTrackedBlob
            )
            if (raycastedPosFromCyanBlob) {
                cyanPosToLerp = raycastedPosFromCyanBlob
            }
        }
        if (pinkSpotLight.lastTrackedBlob) {
            const raycastedPosFromPinkBlob = raycastedPosFromBlob(
                pinkSpotLight.lastTrackedBlob
            )
            if (raycastedPosFromPinkBlob) {
                pinkPosToLerp = raycastedPosFromPinkBlob
            }
        }
    }

    /* ----------------------- RAYCAST ----------------------- */
    function raycastedPosFromBlob(blob) {
        if (blob) {
            let projectedTargPos
            const normalizedBlob = {
                // should be between -1 -> 1
                x: Math.max(Math.min(-(blob.x / video.width) * 2 + 1, 1), -1),
                y: Math.max(Math.min(-(blob.y / video.height) * 2 + 1, 1), -1)
            }

            raycaster.setFromCamera(normalizedBlob, camera)
            const intersects = raycaster.intersectObject(camera.raycastShape)
            console.log(camera, intersects)

            if (intersects[0]) {
                projectedTargPos = intersects[0].point
                return projectedTargPos
            } else {
                console.warn("'intersects[0]' does not exist")
            }
        } else {
            console.warn("blob is falsy")
        }
    }

    function raycastedPosFromSpot(spot) {
        if (spot) {
            const normalizedPos = spot.position.clone()
            const normalizedTarget = spot.target.position.clone().normalize()

            spotLightRaycaster.set(normalizedPos, normalizedTarget)
            const intersects = spotLightRaycaster.intersectObject(baseTour)

            // if (intersects[0]) {
            //     projectedTargPos = intersects[0].point
            //     return projectedTargPos
            // } else {
            //     console.error("'intersects[0]' does not exist")
            // }

            return intersects[0] ? intersects[0].point : null
        }
    }

    function checkVictoryHole(cyanRaycastPos, pinkRaycastPos) {
        holesArr.forEach((hole, index) => {
            if (hole.progress < hole.progressMax) {
                // HOLE IS NOT COMPLETLY FILLED > FILL IT
                let distanceHoleToCyan, distanceHoleToPink

                // Get cyan / pink distances
                if (cyanRaycastPos)
                    distanceHoleToCyan = cyanRaycastPos.distanceTo(
                        hole.position
                    )

                if (pinkRaycastPos)
                    distanceHoleToPink = pinkRaycastPos.distanceTo(
                        hole.position
                    )

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
            console.log("Restart bitch")
        }
    }

    function update(mobileQuaternions) {
        // time += 0.1
        applyLastTrackedDatas()
        if (cyanSpotLight.lastTrackedBlob) {
            cyanSpotLight.position.lerp(cyanPosToLerp, easingFactor)
            cyanSpotLight.target.position.z = camera.position.length()
            cyanSpotLight.intensity = 1 + camera.position.length() * 2
            cyanSpotLightHelper.update()

            if (mobileQuaternions.cyan) {
                const cyanQuaternion = new THREE.Quaternion(
                    mobileQuaternions.cyan._x,
                    mobileQuaternions.cyan._y,
                    mobileQuaternions.cyan._z,
                    mobileQuaternions.cyan._w
                )
                mobileQuaternionHelper.quaternion.copy(cyanQuaternion)

                // const offsQuaternion = new THREE.Quaternion().setFromEuler(
                //     new THREE.Euler(0, Math.PI / 2, 0)
                // )
                const camToWorldQuaternion = new THREE.Quaternion()
                camera.getWorldQuaternion(camToWorldQuaternion)

                cyanSpotLight.quaternion
                    .copy(camToWorldQuaternion)
                    // .multiply(offsQuaternion)
                    .multiply(cyanQuaternion)
            }
        }

        if (pinkSpotLight.lastTrackedBlob) {
            pinkSpotLight.position.lerp(pinkPosToLerp, easingFactor)
            pinkSpotLight.target.position.z = camera.position.length()
            pinkSpotLight.intensity = 1 + camera.position.length() * 2
            pinkSpotLightHelper.update()

            if (mobileQuaternions.pink) {
                const pinkQuaternion = new THREE.Quaternion(
                    mobileQuaternions.pink._x,
                    mobileQuaternions.pink._y,
                    mobileQuaternions.pink._z,
                    mobileQuaternions.pink._w
                )
                // const offsQuaternion = new THREE.Quaternion().setFromEuler(
                //     new THREE.Euler(0, Math.PI / 2, 0)
                // )
                const camToWorldQuaternion = new THREE.Quaternion()
                camera.getWorldQuaternion(camToWorldQuaternion)

                pinkSpotLight.quaternion
                    .copy(camToWorldQuaternion)
                    // .multiply(offsQuaternion)
                    .multiply(pinkQuaternion)
            }
        }

        // Fill holes
        checkVictoryHole(
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

        const raycastShapeFolder = gui.addFolder("Raycast shape")
        raycastShapeFolder.add(camera.raycastShape.material, "opacity", 0, 1)
        raycastShapeFolder.add(camera.raycastShape.position, "x", -10, 10)
        raycastShapeFolder.add(camera.raycastShape.position, "y", -10, 10)
        raycastShapeFolder.add(camera.raycastShape.position, "z", -15, 5)

        gui.add(camera, "logCamera")

        gui.close()
    }

    return {
        update
    }
}

export default Trial1
