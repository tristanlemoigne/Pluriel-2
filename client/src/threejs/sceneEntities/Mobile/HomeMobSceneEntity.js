import * as THREE from "three"
import CSS from "@/config/styles.scss"
import { threeBus } from "@/main"
import socket from "@/socket"
const firstStep = require("../../../../../server/experienceSteps.js")[0]



function HomeMobSceneEntity(scene, assets) {
    /* ----------------------- INPUTS ----------------------- */
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let sliderProgress = 0
    let canslide = false
    var clock = new THREE.Clock()
    const slider = []
    const scenes = [scene]

    /* ----------------------- DECLARATIONS + ASSIGNATIONS ----------------------- */
    init()

    /* ----------------------- FUNCTIONS ----------------------- */
    function init() {
        initLights()
        initPersos()
        addMouseHandler()
    }

    function initLights() {
        scene.add(assets.persoLights)
        scene.add(assets.stoneLights)
    }

    function initPersos() {
        // Lamar
        assets.lamarRigged.rotation.y = Math.PI
        assets.lamarRigged.scale.set(0.08, 0.08, 0.08)
        assets.lamarRigged.position.set(0, -4, 15)

        // Zanit
        assets.zanitRigged.rotation.y = Math.PI
        assets.zanitRigged.scale.set(0.08, 0.08, 0.08)
        assets.zanitRigged.position.set(-10, -4, 15)

        // ADDING SVG
        assets.lamarSVG.scale.set(-0.012, -0.012, -0.012)
        assets.lamarSVG.position.set(3, 3, 18)

        assets.zanitSVG.scale.set(-0.012, -0.012, -0.012)
        assets.zanitSVG.position.set(-7.5, 3, 18)

        slider.push(assets.lamarRigged, assets.zanitRigged, assets.lamarSVG, assets.zanitSVG)

        threeBus.$on("slidePerso", slideValue => {
            canslide = true
            sliderProgress = 0

            slider.forEach(obj => {
                let objPos = obj.position.clone()
                obj.targetPosition = new THREE.Vector3(objPos.x + slideValue, objPos.y, objPos.z)
            })
        })
    }

    function addMouseHandler(canvas) {
        window.addEventListener('touchmove', function (e) {
            onMouseMove(e);
        }, false);
        window.addEventListener('touchstart', function (e) {
            onMouseDown(e);
        }, false);
        window.addEventListener('touchend', function (e) {
            onMouseUp(e);
        }, false);  
    }

    function onMouseMove(evt) {
        if (!mouseDown) {
            return;
        }

        var deltaX = evt.touches[0].clientX - mouseX,
            deltaY = evt.touches[0].clientY - mouseY;
        mouseX = evt.touches[0].clientX;
        mouseY = evt.touches[0].clientY;
        rotateScene(deltaX, deltaY);
    }

    function onMouseDown(evt) {
        mouseDown = true;
        mouseX = evt.touches[0].clientX;
        mouseY = evt.touches[0].clientY;
    }

    function onMouseUp() {
        mouseDown = false;
    }

    function rotateScene(deltaX, deltaY) {
        assets.lamarRigged.rotation.y += deltaX / 100;
        assets.zanitRigged.rotation.y += deltaX / 100;
    }

    function update(timeVars) {
        slider.forEach(obj => {
            if(obj.targetPosition){
                obj.position.lerp(obj.targetPosition, sliderProgress)
            }
        })

        if(canslide){
            sliderProgress += timeVars.DELTA_TIME * 0.00015
        }
    }

    return {
        scenes,
        update
    }
}

export default HomeMobSceneEntity
