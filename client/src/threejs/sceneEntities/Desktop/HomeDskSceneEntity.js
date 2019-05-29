import * as THREE from "three"
import CSS from "@/config/styles.scss"
import { threeBus } from "@/main"
import socket from "@/socket"
const firstStep = require("../../../../../server/experienceSteps.js")[0]

function HomeDskSceneEntity([sceneL, sceneR], assets) {
    /* ----------------------- INPUTS ----------------------- */
    let lamarMixer, lamarIdle, lamarReady
    let zanitMixer, zanitIdle, zanitReady
    var clock = new THREE.Clock()
    const scenes = [sceneL, sceneR]

    /* ----------------------- DECLARATIONS + ASSIGNATIONS ----------------------- */
    let mixer, action
    var clock = new THREE.Clock()

    var params = {
        projection: "normal",
        reflectivity: 1.0,
        exposure: 1.0,
        gemColor: "Green"
    }
    let gemBackMaterial = new THREE.MeshPhysicalMaterial({
        map: null,
        color: 0xff004b,
        metalness: 0.0,
        reflectivity: 1,
        roughness: 0,
        opacity: 0.4,
        side: THREE.FrontSide,
        transparent: true,
        envMapIntensity: 5,
        premultipliedAlpha: true,
        depthTest: true,
        depthWrite: false
        // TODO: Add custom blend mode that modulates background color by this materials color.
    })
    let gemFrontMaterial = new THREE.MeshPhysicalMaterial({
        map: null,
        color: 0xff004b,
        metalness: 0.0,
        reflectivity: 1,
        roughness: 0,
        opacity: 0.2,
        side: THREE.FrontSide,
        transparent: true,
        envMapIntensity: 5,
        premultipliedAlpha: true,
        depthTest: true,
        depthWrite: false
    })
    var textureLoader = new THREE.TextureLoader()
    const textureEquirec = textureLoader.load("/assets/img/envamp.png")
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping
    textureEquirec.magFilter = THREE.LinearFilter
    textureEquirec.minFilter = THREE.LinearMipMapLinearFilter
    // envMap.encoding = THREE.sRGBEncoding
    gemFrontMaterial.envMap = gemBackMaterial.envMap = textureEquirec
    gemFrontMaterial.needsUpdate = gemBackMaterial.needsUpdate = true

    init()

    /* ----------------------- FUNCTIONS ----------------------- */
    function init() {
        // CLONE GENERATE A WARNING
        // const axesHelpers = new THREE.AxesHelper(10)
        // sceneL.add(axesHelpers)
        // sceneR.add(axesHelpers.clone())

        initLights()
        initMeshes()
        initPersos()
        initAnimationMixer()

        scenes.forEach(scene => {
            scene.rotation.z = -firstStep.canvasAngle
        })
    }

    function initLights() {
        sceneL.add(assets.stoneLights)
        sceneR.add(assets.stoneLights.clone())
        // var light1 = new THREE.DirectionalLight(0xffffff, 2)
        // light1.position.set(0, 20, 0)
        // sceneL.add(light1)
        // sceneR.add(light1.clone())
        // var light2 = new THREE.DirectionalLight(0xffffff, 0.4)
        // light2.position.set(0, -20, 0)
        // sceneL.add(light2)
        // sceneR.add(light2.clone())
        // sceneL.add(assets.globalScene)
        // sceneR.add(assets.globalScene.clone())
    }

    function initMeshes() {
        assets.cyanStone.position.set(0, 0, 15)
        sceneL.add(assets.cyanStone)

        assets.pinkStone.position.set(0, 0, 0)
        let pinkStoneClone = assets.pinkStone.clone()
        pinkStoneClone.scale.set(1, 1, 1)
        assets.pinkStone.add(pinkStoneClone)

        assets.pinkStone.material = gemFrontMaterial
        pinkStoneClone.material = gemBackMaterial

        assets.pinkStone.position.set(0, 0, 15)
        sceneR.add(assets.pinkStone)

        // const fog = new THREE.Fog(0x8455b3, 0, 100)
        // sceneL.fog = fog
        // sceneR.fog = fog
    }

    function initAnimationMixer() {
        lamarMixer = new THREE.AnimationMixer(assets.lamarRigged)
        lamarIdle = lamarMixer.clipAction(assets.lamarRigged.animations[0])
        lamarReady = lamarMixer.clipAction(
            assets.lamarReadyAnimation.animations[0]
        )
        lamarIdle.play()

        zanitMixer = new THREE.AnimationMixer(assets.zanitRigged)
        zanitIdle = zanitMixer.clipAction(assets.zanitRigged.animations[0])
        zanitReady = zanitMixer.clipAction(
            assets.zanitReadyAnimation.animations[0]
        )
        zanitIdle.play()
    }

    function initPersos() {
        // Lamar
        assets.lamarRigged.rotation.y = Math.PI
        assets.lamarRigged.scale.set(0.08, 0.08, 0.08)
        assets.lamarRigged.position.set(4, -4, 15)

        // Zanit
        assets.zanitRigged.rotation.y = Math.PI
        assets.zanitRigged.scale.set(0.08, 0.08, 0.08)
        assets.zanitRigged.position.set(-4, -4, 15)

        // ADDING SVG
        assets.lamarSVG.scale.set(-0.012, -0.012, -0.012)
        assets.lamarSVG.position.set(7.5, 3, 18)

        assets.zanitSVG.scale.set(-0.012, -0.012, -0.012)
        assets.zanitSVG.position.set(-2.5, 3, 18)

        // Adding mobile choice listener
        threeBus.$on("animate perso", perso => {
            if (perso === "lamar") {
                lamarIdle.stop()
                lamarReady.play()
            } else if (perso === "zanit") {
                zanitIdle.stop()
                zanitReady.play()
            }
        })
    }

    function update() {
        assets.pinkStone.rotation.y += 0.001
        assets.pinkStone.rotation.x += 0.001

        assets.cyanStone.rotation.y += 0.001
        assets.cyanStone.rotation.x += 0.001

        let delta = clock.getDelta()
        if (lamarMixer && zanitMixer) {
            zanitMixer.update(delta)
            lamarMixer.update(delta)
        }
    }

    return {
        scenes,
        update
    }
}

export default HomeDskSceneEntity
