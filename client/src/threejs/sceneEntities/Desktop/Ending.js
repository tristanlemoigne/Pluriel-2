import * as THREE from "three"
import { visibleHeightAtZDepth, visibleWidthAtZDepth } from "../../helpers"
import * as dat from "dat.gui"
import { bus } from "../../../main"
import { threeBus } from "../../../main"
import { TimelineLite, Power0, Sine, Power1, Power2, Power3 } from "gsap"
import experienceSteps from "../../../../../server/experienceSteps" // this is reference a file outside client folder, so it's the same as the server's

function Ending(scene, camera, assets, timeVars, glowMaterial) {
    /* ----------------------- INPUTS ----------------------- */
    let islandLeft, islandRight, tourCentrale
    let towerLightsLeft = []
    let towerLightsRight = []
    let buildingLightsLeft = []
    let buildingLightsRight = []
    let pierreLeft, pierreRight

    let neutralMatColor = new THREE.Color(0x909090)
    let pinkMatColor = new THREE.Color(0xff0000)
    let cyanMatColor = new THREE.Color(0x0000ff)
    let teamMatColor = new THREE.Color(0xff00ff)
    const lightMatParams = {
        color: neutralMatColor,
        roughness: 0.1,
        emissiveIntensity: 0.1,
        emissive: neutralMatColor
    }
    const pierreLeftMat = new THREE.MeshStandardMaterial(lightMatParams)
    const pierreRightMat = new THREE.MeshStandardMaterial(lightMatParams)
    const tourLeftMat = new THREE.MeshStandardMaterial(lightMatParams)
    const tourRightMat = new THREE.MeshStandardMaterial(lightMatParams)
    const buildingLightsLeftMat = new THREE.MeshStandardMaterial(lightMatParams)
    const buildingLightsRightMat = new THREE.MeshStandardMaterial(
        lightMatParams
    )

    let datguiVars = {
        spaceOffs: 0
    }
    let spaceOffs

    init()
    // initGui()

    /* ----------------------- INIT ----------------------- */
    function init() {
        // GET ISLANDS
        assets.islands.traverse(child => {
            // TODO: avoid traversing multiple times
            if (child.name.includes("-IleGauche")) {
                islandLeft = child
                islandLeft.originalPos = new THREE.Vector3()
                islandLeft.originalPos.copy(islandLeft.position)
            }
            if (child.name.includes("-IleDroite")) {
                islandRight = child
                islandRight.originalPos = new THREE.Vector3()
                islandRight.originalPos.copy(islandRight.position)
            }
            if (child.name.includes("TourCentrale")) {
                tourCentrale = child
                tourCentrale.originalPos = new THREE.Vector3()
                tourCentrale.originalPos.copy(tourCentrale.position)
                tourCentrale.angularVelocity = 0
                tourCentrale.material.transparent = true
            }

            if (child.material && child.name.includes("PierreTourGauche")) {
                neutralMatColor = child.material.color
                child.material = pierreLeftMat
                pierreLeft = child
                pierreLeft.originalPos = new THREE.Vector3()
                pierreLeft.originalPos.copy(pierreLeft.position)
            } else if (
                child.material &&
                child.name.includes("PierreTourDroite")
            ) {
                child.material = pierreRightMat
                pierreRight = child
                pierreRight.originalPos = new THREE.Vector3()
                pierreRight.originalPos.copy(pierreRight.position)
            }

            if (
                child.material &&
                child.name.includes("LumiereBatimentsGauche")
            ) {
                child.material = buildingLightsLeftMat
                buildingLightsLeft.push(child)
            }
            if (
                child.material &&
                child.name.includes("LumiereBatimentDroite")
            ) {
                child.material = buildingLightsRightMat
                buildingLightsRight.push(child)
            }

            if (child.material && child.name.includes("LumiereTourGauche")) {
                child.material = tourLeftMat
                towerLightsLeft.push(child)
            }
            if (child.material && child.name.includes("LumiereTourDroite")) {
                child.material = tourRightMat
                towerLightsRight.push(child)
            }
        })

        // tourCentrale.material.opacity = 0.4
        // tourCentrale.material.roughness = 0
        // tourCentrale.material.reflectivity = 1
        // tourCentrale.material.color = teamMatColor

        // TODO: keep original values

        // const testSphere = new THREE.Mesh(
        //     new THREE.IcosahedronBufferGeometry(1.5, 3),
        //     glowMaterial
        // )
        // testSphere.position.copy(tourCentrale.position)
        // testSphere.position.y += 5
        // scene.add(testSphere)

        // pierreLeftMat.emissive = pinkMatColor
        // pierreLeftMat.emissiveIntensity = 10
        // pierreRightMat.emissive = cyanMatColor
        // pierreRightMat.emissiveIntensity = 10

        // buildingLightsLeftMat.emissive = pinkMatColor
        // buildingLightsLeftMat.emissiveIntensity = 10
        // buildingLightsRightMat.emissive = cyanMatColor
        // buildingLightsRightMat.emissiveIntensity = 10

        // tourLeftMat.emissive = pinkMatColor
        // tourLeftMat.emissiveIntensity = 10
        // tourRightMat.emissive = cyanMatColor
        // tourRightMat.emissiveIntensity = 10

        //LISTENERS
        bus.$on("trigger ending", animateEnding) // receive "team", "lamar", "zanit", or "egalite"
        threeBus.$on("light up islands", lightUpIslands)
    }

    function lightUpIslands(victoriousPlayer) {
        const animDuration = 2
        const lightTweens = new TimelineLite()
        switch (victoriousPlayer) {
            case "lamar":
                lightTweens
                    .duration(animDuration)
                    .add("lightup", 0)
                    // pierre left
                    .to(
                        pierreLeftMat.emissive,
                        2,
                        {
                            r: 0,
                            g: 0.6,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        pierreLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.55,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // tour left
                    .to(
                        tourLeftMat.emissive,
                        2,
                        {
                            r: 0,
                            g: 0.6,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        tourLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.55,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // buildings left
                    .to(
                        buildingLightsLeftMat.emissive,
                        2,
                        {
                            r: 0,
                            g: 0.6,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        buildingLightsLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.55,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // pierre Right
                    .to(
                        pierreRightMat.emissive,
                        2,
                        {
                            r: 1,
                            g: 0,
                            b: 0.2,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        pierreRightMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // tour Right
                    .to(
                        tourRightMat.emissive,
                        2,
                        {
                            r: 1,
                            g: 0,
                            b: 0.2,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        tourRightMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // buildings Right
                    .to(
                        buildingLightsRightMat.emissive,
                        2,
                        {
                            r: 1,
                            g: 0,
                            b: 0.2,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        buildingLightsRightMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )

                break
            case "zanit":
                lightTweens
                    .duration(animDuration)
                    .add("lightup", 0)
                    // pierre Right
                    .to(
                        pierreRightMat.emissive,
                        2,
                        {
                            r: 0,
                            g: 0.6,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        pierreRightMat,
                        2,
                        {
                            emissiveIntensity: 1.55,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // tour Right
                    .to(
                        tourRightMat.emissive,
                        2,
                        {
                            r: 0,
                            g: 0.6,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        tourRightMat,
                        2,
                        {
                            emissiveIntensity: 1.55,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // buildings Right
                    .to(
                        buildingLightsRightMat.emissive,
                        2,
                        {
                            r: 0,
                            g: 0.6,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        buildingLightsRightMat,
                        2,
                        {
                            emissiveIntensity: 1.55,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // pierre Left
                    .to(
                        pierreLeftMat.emissive,
                        2,
                        {
                            r: 1,
                            g: 0,
                            b: 0.2,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        pierreLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // tour Left
                    .to(
                        tourLeftMat.emissive,
                        2,
                        {
                            r: 1,
                            g: 0,
                            b: 0.2,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        tourLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // buildings Left
                    .to(
                        buildingLightsLeftMat.emissive,
                        2,
                        {
                            r: 1,
                            g: 0,
                            b: 0.2,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        buildingLightsLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                break
            case "team":
                lightTweens
                    .duration(animDuration)
                    .add("lightup", 0)
                    // pierre Right
                    .to(
                        pierreRightMat.emissive,
                        2,
                        {
                            r: 0.5,
                            g: 0.05,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        pierreRightMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // tour Right
                    .to(
                        tourRightMat.emissive,
                        2,
                        {
                            r: 0.5,
                            g: 0.05,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        tourRightMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // buildings Right
                    .to(
                        buildingLightsRightMat.emissive,
                        2,
                        {
                            r: 0.5,
                            g: 0.05,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        buildingLightsRightMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // pierre Left
                    .to(
                        pierreLeftMat.emissive,
                        2,
                        {
                            r: 0.5,
                            g: 0.05,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        pierreLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // tour Left
                    .to(
                        tourLeftMat.emissive,
                        2,
                        {
                            r: 0.5,
                            g: 0.05,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        tourLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    // buildings Left
                    .to(
                        buildingLightsLeftMat.emissive,
                        2,
                        {
                            r: 0.5,
                            g: 0.05,
                            b: 1,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                    .to(
                        buildingLightsLeftMat,
                        2,
                        {
                            emissiveIntensity: 1.9,
                            ease: Power1.easeInOut
                        },
                        "lightup"
                    )
                break
            case "egalite":
                break
        }
    }

    function animateEnding(winnerStr) {
        if (
            winnerStr === "lamar" ||
            winnerStr === "zanit" ||
            winnerStr === "egalite" ||
            winnerStr === "loose"
        ) {
            loseAnimation(11, winnerStr)
        } else if (winnerStr === "team") {
            winAnimation(11)
        }
        // distance APART : originalPos + 9
        // distance TOGETHER : originalPos -13.9
    }

    function loseAnimation(animDuration, winnerStr) {
        const gradientDivs = document.body.getElementsByClassName("bgGradient")
        for (let i = 0; i < gradientDivs.length; i++) {
            if (gradientDivs[i].classList.contains("loseGradient")) {
                gradientDivs[
                    i
                ].style.transition = `opacity ${animDuration}s ease-in-out` // linear-gradient doesnt support css transitions
                gradientDivs[i].style.opacity = 1
                gradientDivs[i].style.zIndex = -1
            } else {
                gradientDivs[i].style.transition = `opacity ${animDuration *
                    2}s ease-in-out` // linear-gradient doesnt support css transitions
                gradientDivs[i].style.opacity = 0
                gradientDivs[i].style.zIndex = -2
            }
        }

        const losingTweens = new TimelineLite()
        losingTweens
            // .delay(
            //     experienceSteps[experienceSteps.length - 1].cameraTransition
            //         .camPos.time - 1.5
            // )
            .duration(animDuration)
            .add("moveX", 0)
            .to(
                islandLeft.position,
                6,
                {
                    x: islandLeft.originalPos.x - 9.5,
                    ease: Power2.easeInOut
                },
                "moveX"
            )
            .to(
                islandRight.position,
                6,
                {
                    x: islandRight.originalPos.x + 9.5,
                    ease: Power2.easeInOut
                },
                "moveX"
            )
            .to(
                scene.fog,
                7,
                {
                    density: 0.0115,
                    ease: Power1.easeInOut
                },
                "moveX"
            )
            .to(
                scene.fog.color,
                7,
                {
                    r: 0.55,
                    g: 0.45,
                    b: 0.55,
                    ease: Power1.easeInOut
                },
                "moveX"
            )
            .to(
                tourCentrale.material.color,
                7,
                {
                    r: neutralMatColor.r,
                    g: neutralMatColor.g,
                    b: neutralMatColor.b,
                    ease: Power1.easeInOut
                },
                "moveX"
            )
            .to(
                tourCentrale.material,
                7,
                {
                    opacity: 1,
                    roughness: 1,
                    reflectivity: 0
                },
                "moveX"
            )
            .add("moveY", 1)
            .to(
                islandLeft.position,
                5,
                {
                    y: islandLeft.originalPos.y - 3.5,
                    ease: Power1.easeInOut
                },
                "moveY"
            )
            .to(
                islandRight.position,
                5,
                {
                    y: islandRight.originalPos.y + 4,
                    ease: Power1.easeInOut
                },
                "moveY"
            )
            .to(
                tourCentrale,
                5,
                {
                    angularVelocity: 0,
                    ease: Power1.easeIn
                },
                "moveY"
            )
            .to(
                tourCentrale.position,
                5,
                {
                    y: tourCentrale.originalPos.y,
                    ease: Power2.easeInOut
                },
                "moveY"
            )
    }

    function winAnimation(animDuration) {
        const gradientDivs = document.body.getElementsByClassName("gradient")
        for (let i = 0; i < gradientDivs.length; i++) {
            if (gradientDivs[i].classList.contains("winGradient")) {
                gradientDivs[
                    i
                ].style.transition = `opacity ${animDuration}s ease-in-out`
                gradientDivs[i].style.opacity = 1
                gradientDivs[i].style.zIndex = -1
            } else {
                gradientDivs[i].style.transition = `opacity ${animDuration *
                    2}s ease-in-out`
                gradientDivs[i].style.opacity = 0
                gradientDivs[i].style.zIndex = -2
            }
        }

        const winningTweens = new TimelineLite()
        winningTweens
            // .delay(
            //     experienceSteps[experienceSteps.length - 1].cameraTransition
            //         .camPos.time - 1.5
            // )
            .duration(animDuration)
            .add("move", 0)
            .to(
                islandLeft.position,
                8,
                {
                    x: islandLeft.originalPos.x + 13.9,
                    y: islandLeft.originalPos.y,
                    ease: Power1.easeInOut
                },
                "move"
            )
            .to(
                islandRight.position,
                8,
                {
                    x: islandRight.originalPos.x - 13.9,
                    y: islandRight.originalPos.y,
                    ease: Power1.easeInOut
                },
                "move"
            )
            .to(
                scene.fog,
                8,
                {
                    density: 0.004,
                    ease: Power1.easeInOut
                },
                "move"
            )
            .to(
                scene.fog.color,
                8,
                {
                    r: 0.95,
                    g: 0.8,
                    b: 0.95,
                    ease: Power1.easeInOut
                },
                "move"
            )
            .to(
                tourCentrale.material.color,
                10,
                {
                    r: teamMatColor.r,
                    g: teamMatColor.g,
                    b: teamMatColor.b,
                    ease: Power1.easeInOut
                },
                "move"
            )
            .to(
                tourCentrale.material,
                10,
                {
                    opacity: 0.4,
                    roughness: 0,
                    reflectivity: 1
                },
                "move"
            )
            .to(
                tourCentrale.position,
                12,
                {
                    y: tourCentrale.originalPos.y + 11,
                    ease: Power2.easeInOut
                },
                "move"
            )
            .to(
                tourCentrale,
                12,
                {
                    angularVelocity: 0.0008,
                    ease: Power1.easeIn
                    // onComplete: () => {
                    //     isWinAnimFinished = true
                    // }
                },
                "move"
            )
    }
    // TODO: ajouter du fog, afficher l'ui défaite
    // TODO: enlever le fog, faire briller la tour centrale, afficher l'ui victoire

    function resetMaterials() {
        const lightMats = [
            pierreLeftMat,
            pierreRightMat,
            tourLeftMat,
            tourRightMat,
            buildingLightsLeftMat,
            buildingLightsRightMat
        ]
        lightMats.map(material => {
            material.color.copy(neutralMatColor)
            material.emissive.copy(neutralMatColor)
            material.emissiveIntensity = 0.05
        })
    }

    function resetPositions(animDuration) {
        // islandLeft.position.copy(islandLeft.originalPos)
        // islandRight.position.copy(islandRight.originalPos)
        // tourCentrale.position.copy(tourCentrale.originalPos)

        const resetTweens = new TimelineLite()
        resetTweens
            .duration(animDuration)
            .add("move", 0.3)
            .to(
                islandLeft.position,
                8,
                {
                    x: islandLeft.originalPos.x,
                    y: islandLeft.originalPos.y,
                    ease: Power2.easeInOut
                },
                "move"
            )
            .to(
                islandRight.position,
                8,
                {
                    x: islandRight.originalPos.x,
                    y: islandRight.originalPos.y,
                    ease: Power2.easeInOut
                },
                "move"
            )
            .to(
                tourCentrale.position,
                8,
                {
                    x: tourCentrale.originalPos.x,
                    y: tourCentrale.originalPos.y,
                    ease: Power2.easeInOut
                },
                "move"
            )
    }

    function update(timeVars, mobileQuaternions) {
        // if (isWinAnimFinished) {
        tourCentrale.rotation.z +=
            tourCentrale.angularVelocity * timeVars.DELTA_TIME // wtf sur l'axe Z ?!
        // }
    }

    function beforeDestroy() {
        console.log("Before destroy Ending")
        resetPositions(1.2)
        resetMaterials()
    }

    /* ----------------------- GUI ----------------------- */
    function initGui() {
        // Gui
        const gui = new dat.GUI()
        gui.add(datguiVars, "spaceOffs")
            .min(-17.5)
            .max(10.5)

        gui.close()
    }

    return {
        update,
        beforeDestroy,
        resetMaterials
    }
}

export default Ending
