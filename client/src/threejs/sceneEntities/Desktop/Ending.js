import * as THREE from "three"
import { visibleHeightAtZDepth, visibleWidthAtZDepth } from "../../helpers"
import * as dat from "dat.gui"
import { bus } from "../../../main"
import { threeBus } from "../../../main"
import { TimelineLite, Power0, Sine, Power1, Power2, Power3 } from "gsap"

function Ending(scene, camera, assets, timeVars) {
    /* ----------------------- INPUTS ----------------------- */
    let islandLeft, islandRight, tourCentrale
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
        assets.islands.traverse((child) => {
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
            }
        })

        //LISTENERS
        bus.$on("trigger ending", animateEnding) // receive "team", "cyan" or "pink"
    }

    function animateEnding(winnerStr) {
        console.log("winnerStr in animateEnding(): ", winnerStr)
        if (winnerStr === "cyan" || winnerStr === "pink") {
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
            .add("moveX", 0)
            .to(
                islandLeft.position,
                6,
                {
                    x: islandLeft.originalPos.x - 9,
                    ease: Power2.easeInOut
                },
                "moveX"
            )
            .to(
                islandRight.position,
                6,
                {
                    x: islandRight.originalPos.x + 9,
                    ease: Power2.easeInOut
                },
                "moveX"
            )
            .add("moveY", 2)
            .to(
                islandLeft.position,
                4,
                {
                    y: islandLeft.originalPos.y - 3,
                    ease: Power1.easeInOut
                },
                "moveY"
            )
            .to(
                islandRight.position,
                4,
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
            .add("move", 2)
            .to(
                islandLeft.position,
                8,
                {
                    x: islandLeft.originalPos.x + 13.9,
                    ease: Power1.easeInOut
                },
                "move"
            )
            .to(
                islandRight.position,
                8,
                {
                    x: islandRight.originalPos.x - 13.9,
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
                    ease: Power1.easeIn,
                    onComplete: () => {
                        isWinAnimFinished = true
                    }
                },
                "move"
            )
    }
    // TODO: ajouter du fog, afficher l'ui défaite
    // TODO: enlever le fog, faire briller la tour centrale, afficher l'ui victoire

    function update(timeVars, mobileQuaternions) {
        // if (isWinAnimFinished) {
        tourCentrale.rotation.y += tourCentrale.angularVelocity * timeVars.DELTA_TIME
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
