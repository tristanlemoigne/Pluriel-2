import AssetLoader from "./AssetsLoader"
import SceneManager from "./SceneManager"

/**
 * This should be the interface between VueJs and ThreeJs
 * It is responsible for exposing animations or other functions from Three to Vue
 * and initializing the ThreeJs stuff (first RAF for example)
 */
function ThreeEntryPointDsk(canvas) {
    let sceneManager

    const loader = new AssetLoader()
    // GLOBAL SCENE
    loader.load("/assets/models/SceneGlobal.glb", "globalScene", ["scene"])

    // HOME
    loader.load("/assets/models/home/pinkStone.glb", "pinkStone", [
        "scene",
        "children",
        "0"
    ])
    loader.load("/assets/models/home/cyanStone.glb", "cyanStone", [
        "scene",
        "children",
        "0"
    ])
    loader.load("/assets/models/home/stoneLights.glb", "stoneLights", ["scene"])
    // loader.load("//assets/models/home/nuages3.gltf", "nuages", ["scene"])
    loader.load("/assets/models/Nuages.glb", "nuages", ["scene"])
    loader.load("/assets/models/nuagesLights.glb", "nuagesLights", ["scene"])

    // SELECTION PERSO
    // loader.load("//assets/models/home/persos.glb", "persos", ["scene"])
    loader.load("/assets/models/home/persosLights.glb", "persosLights", [
        "scene"
    ])
    loader.load("/assets/models/home/lamarRigged.fbx", "lamarRigged")
    loader.load("/assets/models/home/zanitRigged.fbx", "zanitRigged")
    loader.load(
        "/assets/models/home/lamarReadyAnimation.fbx",
        "lamarReadyAnimation"
    )
    loader.load(
        "/assets/models/home/zanitReadyAnimation.fbx",
        "zanitReadyAnimation"
    )
    loader.load("/assets/img/zanit.svg", "zanitSVG")
    loader.load("/assets/img/lamar.svg", "lamarSVG")

    // ISLANDS
    loader.load("/assets/models/Islands_nolights.glb", "islands", ["scene"])

    // TRIAL 1
    // loader.load("/assets/models/Interaction13.glb", "tour1")
    loader.load("/assets/campaths/CamPaths.obj", "camPaths")
    loader.load("/assets/campaths/TargetPoints.glb", "camTargetPoints", [
        "scene"
    ])

    loader.onComplete(assets => {
        sceneManager = SceneManager(canvas, assets)
        sceneManager.init()
        sceneManager.initEventsListeners()
        sceneManager.update()
    })
}

export default ThreeEntryPointDsk
