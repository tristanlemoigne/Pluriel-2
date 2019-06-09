function toRadians(angle) {
    return angle * (Math.PI / 180)
}

module.exports = [
    {
        name: "home",
        hasMobileThreeScene: true, // TODO: remove this and use added/removedThreeGroupsMob instead in SceneManagerMob
        fogDist: { near: 0, far: 120 }, // TODO: fogDist is not used yet
        // addedThreeGroupsDsk: [
        //     // TODO: delay and time times are not used yet
        //     { asset: "nuages", delay: 0, time: 0 },
        //     // TODO: scene is not used yet
        //     { asset: "pinkStone", delay: 0, time: 2, scene: "sceneR" },
        //     { asset: "cyanStone", delay: 0, time: 2, scene: "sceneL" }
        //     { asset: "stoneLights", delay: 0, time: 2, scene: "sceneL" }
        //     { asset: "stoneLights", delay: 0, time: 2, scene: "sceneR" }
        // ],
        // addedThreeGroupsMob: [
        //     { asset: "nuages", delay: 0, time: 0 },
        //     { asset: "pinkStone", delay: 0, time: 2, scene: "sceneR" },
        //     { asset: "cyanStone", delay: 0, time: 2, scene: "sceneL" }
        // ],
        cameraPos: { x: 0, y: 0, z: 0 },
        canvasAngle: toRadians(0)
    },

    {
        name: "room_waiting",
        removedThreeGroupsDsk: [
            { asset: "pinkStone", delay: 0, time: 0.8, scene: "sceneR" },
            { asset: "cyanStone", delay: 0, time: 0.8, scene: "sceneL" },
            { asset: "stoneLights", delay: 0, time: 0.8 }
        ],
        removedThreeGroupsMob: [
            { asset: "pinkStone", delay: 0, time: 0.8, scene: "sceneR" },
            { asset: "cyanStone", delay: 0, time: 0.8, scene: "sceneL" }
        ]
    },

    {
        name: "selection_perso",
        addedThreeGroupsDsk: [
            { asset: "lamarRigged", delay: 0, time: 0.5 },
            { asset: "zanitRigged", delay: 0, time: 0.5 },
            { asset: "lamarSVG", delay: 0, time: 0.5 },
            { asset: "zanitSVG", delay: 0, time: 0.5 },
            // { asset: "persos", delay: 0, time: 0.5, scene: "sceneR" },
            { asset: "persosLights", delay: 0, time: 0.5, scene: "sceneR" }
        ],
        addedThreeGroupsMob: [
            { asset: "lamarRigged", delay: 0, time: 0.5 },
            { asset: "zanitRigged", delay: 0, time: 0.5 }
        ]
    },

    {
        name: "dioramas",
        removedThreeGroupsDsk: [
            { asset: "lamarRigged", delay: 0, time: 0.5 },
            { asset: "zanitRigged", delay: 0, time: 0.5 },
            { asset: "lamarSVG", delay: 0, time: 0.5 },
            { asset: "zanitSVG", delay: 0, time: 0.5 },
            { asset: "persosLights", delay: 0, time: 0.8 }
        ]
    },

    {
        name: "tuto_interactif",
        activatesCam: true
    },

    {
        name: "global_intro",
        hasMobileThreeScene: true, // TODO: remove this and use added/removedThreeGroupsMob instead in SceneManagerMob
        fogDist: { near: 50, far: 250 }, // TODO: fogDist is not used yet
        addedThreeGroupsDsk: [{ asset: "islands", delay: 0, time: 1 }],
        removedThreeGroupsDsk: [
            { asset: "nuages", delay: 5, time: 0 },
            { asset: "nuagesLights", delay: 2, time: 5 }
        ],
        removedThreeGroupsMob: [{ asset: "nuages", delay: 0, time: 3 }],
        cameraTransition: {
            camPos: { path: "NurbsPath00", delay: 0, time: 11, easing: null },
            camTarget: { point: "Target01", delay: 0.5, time: 6, easing: null }
        },
        canvasAngle: toRadians(0)
    },

    {
        name: "trial_1_intro",
        cameraTransition: {
            camPos: { path: "NurbsPath01", delay: 0, time: 12, easing: null },
            camTarget: { point: "Target02", delay: 0, time: 8, easing: null }
        }
    },

    {
        name: "trial_1_tuto",
        cameraTransition: {
            camPos: { path: "NurbsPath02", delay: 0, time: 4, easing: null },
            camTarget: { point: "Target03", delay: 0, time: 3, easing: null }
        }
    },

    {
        name: "trial_1_game",
        cameraTransition: {
            camPos: { path: "NurbsPath03", delay: 0, time: 28, easing: null }, // this camPath is fucked up (maybe because double spiral, not good for CatmullCurve function)
            camTarget: { point: "Target04", delay: 0, time: 28, easing: null }
        }
    },

    {
        name: "trial_1_end",
        cameraTransition: {
            camTarget: { point: "Target05", delay: 0, time: 2, easing: null }
        }
    },

    {
        name: "global_end",
        cameraTransition: {
            camPos: { path: "NurbsPath04", delay: 0, time: 8, easing: null },
            camTarget: { point: "Target01", delay: 0, time: 9, easing: null }
        }
    }
]
