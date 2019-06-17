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
    // GLOBAL SCENE
    loader.load("/assets/models/SceneGlobal.glb", "globalScene", ["scene"])

    // HOME
    loader.load("/assets/models/home/stoneLights.glb", "stoneLights", ["scene"])

    // SELECTION PERSO
    loader.load("/assets/models/home/persosLights.glb", "persosLights", [
        "scene"
    ])
    loader.load("/assets/models/home/lamarRigged.fbx", "lamarRigged")
    loader.load("/assets/models/home/zanitRigged.fbx", "zanitRigged")
    loader.load(
        "/assets/models/home/lamarReadyAnimation2.fbx",
        "lamarReadyAnimation"
    )
    loader.load(
        "/assets/models/home/zanitReadyAnimation.fbx",
        "zanitReadyAnimation"
    )
    loader.load("/assets/img/zanit.svg", "zanitSVG")
    loader.load("/assets/img/lamar.svg", "lamarSVG")
    loader.onComplete(assets => {
        sceneManager = SceneManagerMob(canvas, assets)
        sceneManager.init()
        sceneManager.initEventsListeners()
        sceneManager.update()
    })
}

export default ThreeEntryPointMob
