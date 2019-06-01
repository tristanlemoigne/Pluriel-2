import * as THREE from "three"

import EffectComposer, {
    RenderPass,
    ShaderPass,
    CopyShader
} from "three-effectcomposer-es6"
import UnrealBloomPass from "./UnrealBloomPass.js"
import CanvasRotator from "@/threejs/CanvasRotator"
import { bus } from "@/main"
const firstStep = require("../../../../server/experienceSteps.js")[0]

/**
 * Creates a renderer with post-processing passes and returns it.
 * Uses an EffectComposer.
 * TODO: expose methods that can modify the post-process effects.
 * @param {HTMLCanvasElement} canvas
 * @param {THREE.Scene[]} scenes
 * @param {THREE.Camera} camera
 * @returns {Object}
 */
export default function CustomRenderer(canvas, scenes, camera, isPostProcess) {
    const renderer = buildRenderer(canvas)
    const composer = buildComposer(scenes, camera)
    let isScissor = true

    bus.$on("create-room", () => {
        isScissor = false
    })

    // Slider
    // let sliderPos = window.innerWidth / 2
    let sliderPos =
        (window.innerWidth / 2) * Math.abs(Math.cos(firstStep.canvasAngle)) +
        (window.innerHeight / 2) * Math.abs(Math.sin(firstStep.canvasAngle))
    let finalRenderer = isPostProcess ? composer : renderer

    function buildRenderer(canvas) {
        const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        })

        // Transparent bg
        renderer.setClearColor(0x000000, 0)

        renderer.setPixelRatio(DPR)
        renderer.setScissorTest(scenes.length > 1 ? true : false)

        // LIGHTS TEST
        renderer.physicallyCorrectLights = true
        renderer.gammaOutput = true
        renderer.gammaFactor = 2.2

        // TODO: remove event listener when there is no slider (may help to get more FPS)
        window.addEventListener("mousemove", e => {
            sliderPos = CanvasRotator().moveSlider(e, firstStep.canvasAngle)
        })

        return renderer
    }

    function buildComposer(scenes, camera) {
        const renderPass = new RenderPass(scenes[0], camera)
        // renderPass.clearColor = new THREE.Color(0, 1, 0);
        // renderPass.clearAlpha = 0;

        // BLOOM EFFECT
        const bloomPassParams = {
            // exposure: 0.1,
            bloomStrength: 1.2,
            bloomThreshold: 0.87,
            bloomRadius: 0.8
        }

        let bloomPass = new UnrealBloomPass(
            new THREE.Vector2(
                canvas.offsetWidth * 0.8,
                canvas.offsetHeight * 0.8
            ),
            0.5,
            0.5,
            0.5
        )
        bloomPass.renderToScreen = true
        bloomPass.threshold = bloomPassParams.bloomThreshold
        bloomPass.strength = bloomPassParams.bloomStrength
        bloomPass.radius = bloomPassParams.bloomRadius

        // COMPOSER
        const composer = new EffectComposer(renderer)
        composer.setSize(window.innerWidth, window.innerHeight)
        composer.addPass(renderPass)
        composer.addPass(bloomPass)

        return composer
    }

    const setSize = (width, height) => {
        if (isPostProcess) {
            finalRenderer.renderer.setSize(width, height)
        } else {
            finalRenderer.setSize(width, height)
        }
    }

    const render = (scenes, camera) => {
        if (isPostProcess) {
            finalRenderer.render()
        } else {
            if (scenes.length > 1 && isScissor) {
                finalRenderer.setScissorTest(true)

                finalRenderer.setScissor(0, 0, sliderPos, canvas.offsetHeight)
                finalRenderer.render(scenes[0], camera)

                finalRenderer.setScissor(
                    sliderPos,
                    0,
                    canvas.offsetWidth,
                    canvas.offsetHeight
                )

                finalRenderer.render(scenes[1], camera)
            } else {
                finalRenderer.setScissorTest(false)
                // console.log({ scenes })
                finalRenderer.render(scenes[0], camera)
            }
        }
    }

    return {
        setSize,
        render,
        finalRenderer
    }
}
