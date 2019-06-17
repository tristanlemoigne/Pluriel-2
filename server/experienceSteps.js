function toRadians(angle) {
    return angle * (Math.PI / 180)
}

module.exports = [
    {
        name: "home",
        hasMobileThreeScene: true, // TODO: remove this and use added/removedThreeGroupsMob instead in SceneManagerMob
        fog: {
            delay: 0,
            time: 0,
            density: 0.008,
            easing: ["Power1", "easeInOut"]
        },
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
        cleanSlider: true,
        removedThreeGroupsDsk: [
            { asset: "pinkStone", delay: 0, time: 0.8, scene: "sceneR" },
            { asset: "cyanStone", delay: 0, time: 0.8, scene: "sceneL" },
            { asset: "stoneLights", delay: 0, time: 0.8 }
        ]
    },

    {
        name: "selection_perso",
        addedThreeGroupsDsk: [
            { asset: "lamarRigged", delay: 0, time: 0.5 },
            { asset: "zanitRigged", delay: 0, time: 0.5 },
            { asset: "lamarSVG", delay: 0, time: 0.5 },
            { asset: "zanitSVG", delay: 0, time: 0.5 },
            { asset: "persosLights", delay: 0, time: 0.5, scene: "sceneR" }
        ],
        addedThreeGroupsMob: [
            { asset: "lamarRigged", delay: 0, time: 0.5 },
            { asset: "zanitRigged", delay: 0, time: 0.5 },
            { asset: "lamarSVG", delay: 0, time: 0.5 },
            { asset: "zanitSVG", delay: 0, time: 0.5 },
            { asset: "persosLights", delay: 0, time: 0.5},
            { asset: "stoneLights", delay: 0, time: 0.8 }
        ]
    },

    {
        name: "dioramas",
        removedThreeGroupsDsk: [
            { asset: "lamarRigged", delay: 0, time: 0.5, hidden: true },
            { asset: "zanitRigged", delay: 0, time: 0.5, hidden: true },
            { asset: "lamarSVG", delay: 0, time: 0.5 },
            { asset: "zanitSVG", delay: 0, time: 0.5 },
            { asset: "persosLights", delay: 0, time: 0.8 }
        ],
        removedThreeGroupsMob: [
            { asset: "lamarRigged", delay: 0, time: 0.5 },
            { asset: "zanitRigged", delay: 0, time: 0.5 },
            { asset: "lamarSVG", delay: 0, time: 0.5 },
            { asset: "zanitSVG", delay: 0, time: 0.5 },
            { asset: "persosLights", delay: 0, time: 0.5},
            { asset: "stoneLights", delay: 0, time: 0.8 }
        ]
    },

    {
        name: "tuto_interactif",
        activatesCam: true
    },

    {
        name: "global_intro",
        addedThreeGroupsDsk: [{ asset: "islands", delay: 0, time: 1 }],
        removedThreeGroupsDsk: [
            { asset: "nuages", delay: 5, time: 0 },
            { asset: "nuagesLights", delay: 2, time: 5 }
        ],
        cameraTransition: {
            camPos: {
                path: "NurbsPath00",
                delay: 0,
                time: 11,
                easing: ["Power3", "easeInOut"]
            },
            camTarget: {
                point: "Target01",
                delay: 0.5,
                time: 6.5,
                easing: ["Power3", "easeInOut"]
            }
        },
        canvasAngle: toRadians(0),
        fog: {
            delay: 4,
            time: 6,
            density: 0.006,
            easing: ["Power1", "easeInOut"]
        }
    },

    {
        name: "trial_1_intro",
        hasMobileThreeScene: true,
        cameraTransition: {
            camPos: {
                path: "NurbsPath01",
                delay: 0,
                time: 12,
                easing: ["Power3", "easeInOut"]
            },
            camTarget: {
                point: "Target02",
                delay: 0,
                time: 8,
                easing: ["Power3", "easeInOut"]
            }
        },
        fog: {
            delay: 1,
            time: 10,
            density: 0.016,
            easing: ["Power1", "easeInOut"]
        }
    },

    {
        name: "trial_1_tuto",
        cameraTransition: {
            camPos: {
                path: "NurbsPath02",
                delay: 0,
                time: 4,
                easing: ["Power3", "easeInOut"]
            },
            camTarget: {
                point: "Target03",
                delay: 0,
                time: 3,
                easing: ["Power3", "easeInOut"]
            }
        }
    },

    {
        name: "trial_1_game_1",
        cameraTransition: {
            camPos: {
                path: "NurbsPath03",
                delay: 0,
                time: 18,
                easing: ["Sine", "easeInOut"]
            },
            camTarget: {
                point: "Target04",
                delay: 0,
                time: 18,
                easing: ["Sine", "easeInOut"]
            }
        }
    },
    {
        name: "trial_1_game_2",
        cameraTransition: {
            camPos: {
                path: "NurbsPath04",
                delay: 0,
                time: 32,
                easing: ["Sine", "easeInOut"]
            },
            camTarget: {
                point: "Target05",
                delay: 0,
                time: 28,
                easing: ["Sine", "easeInOut"]
            }
        }
    },

    {
        name: "trial_1_end",
        cameraTransition: {
            // camPos: {
            //     delay: 0,
            //     time: 1
            //     // Je sais pas ce que je met ici lol mais c'est pour faire apparaitre mon UI
            // },
            camTarget: {
                point: "Target06",
                delay: 0,
                time: 2,
                easing: ["Power2", "easeInOut"]
            }
        }
        // addedThreeGroupsDsk: [
        //     { asset: "lamarRigged", delay: 0, time: 0.5 },
        //     { asset: "zanitRigged", delay: 0, time: 0.5 }
        // ]
        // Wanted to add lamar anz zanit dancing but bugged
    },

    {
        name: "global_ending",
        cameraTransition: {
            camPos: {
                path: "NurbsPath05",
                delay: 0,
                time: 8,
                easing: ["Power3", "easeInOut"]
            },
            camTarget: {
                point: "Target01",
                delay: 0,
                time: 9,
                easing: ["Power3", "easeInOut"]
            }
        },
        fog: {
            delay: 0,
            time: 8,
            density: 0.006,
            easing: ["Power3", "easeInOut"]
        }
    }
]
