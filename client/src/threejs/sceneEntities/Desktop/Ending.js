import * as THREE from "three"
import { visibleHeightAtZDepth, visibleWidthAtZDepth } from "../../helpers"
import * as dat from "dat.gui"
import { bus } from "../../../main"
import { threeBus } from "../../../main"
import { TimelineLite, Power0, Sine, Power1, Power2, Power3 } from "gsap"
import experienceSteps from "../../../../../server/experienceSteps" // this is reference a file outside client folder, so it's the same as the server's

function Ending(scene, camera, assets, timeVars) {
    /* ----------------------- INPUTS ----------------------- */
    let islandLeft, islandRight, tourCentrale
    let buildingLightsLeft = []
    let buildingLightsRight = []
    let pierreLeft, pierreRight

    let datguiVars = {
        spaceOffs: 0
    }
    let spaceOffs
    // let isWinAnimFinished = false

    init()
    initGui()

    /* ----------------------- INIT ----------------------- */
    function init() {
        // HELPERS
        // const axesHelper = new THREE.AxesHelper(50)
        // scene.add(axesHelper)
        // scene.add(camera.target)

        // GET ISLANDS
        assets.islands.traverse(child => {
            // TODO: avoid traversing multiple times
            if (child.name.includes("-IleGauche")) {
                islandLeft = child
                islandLeft.originalPos = new THREE.Vector3()
                islandLeft.originalPos.copy(islandLeft.position)

                // islandLeft.traverse(islandLeftChild => {
                //     if (
                //         islandLeftChild.material &&
                //         islandLeftChild.material.name.includes("Emission")
                //     ) {
                //         buildingLightsLeft.push(islandLeftChild)
                //     }
                // })
            }
            if (child.name.includes("-IleDroite")) {
                islandRight = child
                islandRight.originalPos = new THREE.Vector3()
                islandRight.originalPos.copy(islandRight.position)

                // islandRight.traverse(islandRightChild => {
                //     if (
                //         islandRightChild.material &&
                //         islandRightChild.material.name.includes("Emission")
                //     ) {
                //         buildingLightsRight.push(islandRightChild)
                //     }
                // })
            }
            if (child.name.includes("TourCentrale")) {
                tourCentrale = child
                tourCentrale.originalPos = new THREE.Vector3()
                tourCentrale.originalPos.copy(tourCentrale.position)
                tourCentrale.angularVelocity = 0
            }

            if (child.material && child.name.includes("Pierre")) {
                console.log(child)
                pierreLeft = child
            } else if (child.material && child.name.includes("PierreIleD")) {
                console.log(child)
                pierreRight = child
            }
        })

        // material.emissive = new THREE.Color(0x00ff80)
        // pierreLeft.material.emissiveIntensity = 10
        // pierreRight.material.emissive = new THREE.Color(0x80ff00)
        // pierreRight.material.emissiveIntensity = 10

        // buildingLightsLeft.map(buildingLight => {
        //     buildingLight.material.emissive = new THREE.Color(0x00ffff)
        //     buildingLight.material.emissiveIntensity = 10
        // })
        // buildingLightsRight.map(buildingLight => {
        //     buildingLight.material.emissive = new THREE.Color(0xffff00)
        //     buildingLight.material.emissiveIntensity = 10
        // })

        //LISTENERS
        bus.$on("trigger ending", animateEnding) // receive "team", "lamar", "zanit", or "egalite"
    }

    function animateEnding(winnerStr) {
        if (
            winnerStr === "lamar" ||
            winnerStr === "zanit" ||
            winnerStr === "egalite"
        ) {
            loseAnimation()
        } else if (winnerStr === "team") {
            winAnimation()
        }
        // distance APART : originalPos + 9
        // distance TOGETHER : originalPos -13.9
    }

    function loseAnimation() {
        const losingTweens = new TimelineLite()
        losingTweens
            .delay(
                experienceSteps[experienceSteps.length - 1].cameraTransition
                    .camPos.time - 1.5
            )
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
    }

    function winAnimation() {
        const winningTweens = new TimelineLite()
        winningTweens
            .delay(
                experienceSteps[experienceSteps.length - 1].cameraTransition
                    .camPos.time - 1.5
            )
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

    function update(timeVars, mobileQuaternions) {
        // if (isWinAnimFinished) {
        tourCentrale.rotation.y +=
            tourCentrale.angularVelocity * timeVars.DELTA_TIME
        // }
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
        update
    }
}

export default Ending
