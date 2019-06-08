import AssetLoader from "./AssetsLoader"
import SceneManagerMob from "./SceneManagerMob"

/**
 * This should be the interface between VueJs and ThreeJs
 * It is responsible for exposing animations or other functions from Three to Vue
 * and initializing the ThreeJs stuff (first RAF for example)
 */
function ThreeEntryPointMob(canvas) {
    let sceneManager

    const loader = new AssetLoader()

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

    // SELECTION PERSO
    // loader.load("/assets/models/home/lamar.glb", "lamar", ["scene"])
    // loader.load("/assets/models/home/zanit.glb", "zanit", ["scene"])
    loader.load("/assets/img/zanit.svg", "zanitSVG")
    loader.load("/assets/img/lamar.svg", "lamarSVG")

    // STEP 1
    loader.load("/assets/campaths/CamPaths.obj", "camPaths")
    loader.load("/assets/campaths/TargetPoints.glb", "camTargetPoints", [
        "scene"
    ])
    loader.onComplete(assets => {
        sceneManager = SceneManagerMob(canvas, assets)
        sceneManager.init()
        sceneManager.initEventsListeners()
        sceneManager.update()
    })
}

export default ThreeEntryPointMob
