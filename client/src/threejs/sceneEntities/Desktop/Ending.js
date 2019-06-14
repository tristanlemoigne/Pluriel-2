import * as THREE from "three"
import { visibleHeightAtZDepth, visibleWidthAtZDepth } from "../../helpers"
import * as dat from "dat.gui"
import { bus } from "../../../main"
import { threeBus } from "../../../main"
import { TimelineLite, Power0, Sine, Power1, Power2, Power3 } from "gsap"

function Ending(scene, camera, assets, timeVars) {
    /* ----------------------- INPUTS ----------------------- */
    let islandLeft, islandRight
    let datguiVars = {
        spaceOffs: 0
    }
    let spaceOffs
    let originalPos = []

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
                originalPos[0] = islandLeft.position.x
            }
            if (child.name.includes("-IleDroite")) {
                islandRight = child
                originalPos[1] = islandRight.position.x
            }
        })

        //LISTENERS
        bus.$on("trigger ending", animateEnding) // receive "team", "cyan" or "pink"
    }

    function animateEnding(winnerStr) {
        console.log("winnerStr in animateEnding(): ", winnerStr)
        islandLeft.position.x -= datguiVars.spaceOffs
        islandRight.position.x += datguiVars.spaceOffs
        // distance APART : around 9
        // distance TOGETHER : -13.9
    }

    // TODO: tweener légèrement les iles en les éloignant, ajouter du fog, afficher l'ui défaite
    // TODO: tweener les iles l'une vers l'autre, enlever le fog, faire briller la tour centrale, afficher l'ui victoire

    function update(timeVars, mobileQuaternions) {
        islandLeft.position.x = originalPos[0] - datguiVars.spaceOffs
        islandRight.position.x = originalPos[1] + datguiVars.spaceOffs
    }

    /* ----------------------- GUI ----------------------- */
    function initGui() {
        // Gui
        const gui = new dat.GUI()
        gui.add(datguiVars, "spaceOffs")
            .min(-15)
            .max(0)

        gui.close()
    }

    return {
        update
    }
}

export default Ending
