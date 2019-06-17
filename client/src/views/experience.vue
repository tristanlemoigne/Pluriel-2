<template>
    <div>
        <!--Desktop stuff -->
        <div v-if="!isMobile">
            <div class="uiGlobale" v-bind:class="{ visible: canShowUIGlobale }">
                <TrackerVideo :hasStarted="camIsActive" v-show="this.uiDatas.isDebugMode"/>

                <button v-if="!isMobile" @click="onFirstStepClick()">
                    <div class="outerCircle">
                        <div class="innerCircle"></div>
                    </div>
                </button>

                <p
                    class="textGlow"
                    v-bind:class="{ visible: !canShowUIGlobaleEnd }"
                >Accédez à la 1ère étape grâce à votre téléphone.</p>
                <p class="textGlow" v-bind:class="{ visible: canShowUIGlobaleEnd }">
                    Recommencer
                    <br>l'expérience
                </p>

                <div class="stones">
                    <img ref="victoriousStep" src="assets/img/icon-stone.png" alt>
                    <img src="assets/img/icon-stone@2x.png" alt>
                    <img src="assets/img/icon-stone.png" alt>
                </div>
            </div>

            <div class="recapTuto" v-bind:class="{ visible: canShowUITuto }">
                <p class="textGlow">
                    Cette tour a besoin d’être réanimée, seule
                    <b>la lumière de vos amulettes</b> permettra de rétablir son énergie.
                </p>
                <img class="svgGlow" src="/assets/img/tuto.svg" alt>
            </div>

            <div class="uiStep1" v-bind:class="{ visible: canShowUIStep }">
                <div class="scoreLamar">
                    <div class="stone">
                        <svg width="100" height="100">
                            <circle
                                class="circleBg"
                                stroke="#efefef"
                                opacity="0.5"
                                stroke-width="2"
                                fill="none"
                                cx="20"
                                cy="20"
                                r="15.91549431"
                            ></circle>
                            <circle
                                class="circleFill"
                                ref="cyanProgression"
                                stroke="#356BFF"
                                stroke-width="2"
                                stroke-dasharray="0 100"
                                fill="none"
                                cx="20"
                                cy="20"
                                r="15.91549431"
                            ></circle>
                        </svg>
                        <img src="assets/img/icon-stone-lamar.png" alt>
                    </div>

                    <div ref="scoreLamar" class="score">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>

                <div class="scoreTeam">
                    <img src="assets/img/icon-stone.png" alt>

                    <div class="gradient">
                        <div ref="scoreTeam" class="score">
                            <div class="one"></div>
                            <div class="two"></div>
                            <div class="three"></div>
                            <div class="four"></div>
                            <div class="five"></div>
                            <div class="six"></div>
                            <div class="seven"></div>
                            <div class="height"></div>
                            <div class="nine"></div>
                        </div>

                        <svg height="0" width="0">
                            <defs>
                                <clipPath clipPathUnits="objectBoundingBox" id="sector">
                                    <!-- ICI ON CALCULE LANGLE LOLILOL  pi:4.5 -->
                                    <path
                                        class="sector"
                                        d="M0.5,0.5 l0.5,0 A0.5,0.5 0 0,0 0.9045084972,.2061073739 z"
                                    ></path>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                </div>

                <div class="scoreZanit">
                    <div ref="scoreZanit" class="score">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    <div class="stone">
                        <svg width="100" height="100">
                            <circle
                                class="circleBg"
                                stroke="#efefef"
                                opacity="0.5"
                                stroke-width="2"
                                fill="none"
                                cx="20"
                                cy="20"
                                r="15.91549431"
                            ></circle>
                            <circle
                                class="circleFill"
                                ref="pinkProgression"
                                stroke="#FF1A54"
                                stroke-width="2"
                                stroke-dasharray="0 100"
                                fill="none"
                                cx="20"
                                cy="20"
                                r="15.91549431"
                            ></circle>
                        </svg>
                        <img src="assets/img/icon-stone-zanit.png" alt>
                    </div>
                </div>
            </div>

            <div class="step1End" v-bind:class="{ visible: canShowUIEnd }">
                <p class="victorious textGlow">
                    <span>{{victoriousText}}</span>
                    <br>
                    {{victoriousLegend}}
                </p>

                <!-- <img src="assets/img/icon-stone.png" alt> -->
                <img :src="getVictoriousIcon()" alt>

                <div ref="victoriousScore" class="score">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>

                <p class="totalHoles textGlow">{{victoriousScore}}/9 trous</p>
            </div>

            <div class="globalEnd textGlow" v-bind:class="{ visible: canShowUIGlobaleEnd }">
                <p v-bind:class="{ visible: !plurielMerged }">
                    Malheureusement,
                    <br>Votre collaboration n’a pas été suffisante
                </p>
                <p v-bind:class="{ visible: plurielMerged }">
                    Félicitations,
                    <br>Vous avez crée votre Pluriel
                </p>
            </div>
        </div>

        <!-- Mobile stuff -->
        <div class="mobile" v-if="isMobile">
            <div v-if="character === 'lamar'">
                JE SUIS LAMAR
                <img src="assets/img/AmuletteLamarGlow.png" alt>
            </div>
            <div v-if="character === 'zanit'">
                JE SUIS ZANIT
                <img src="assets/img/AmuletteZanitGlow.png" alt>
            </div>
        </div>
    </div>
</template>

<script>
import TrackerVideo from "@/components/TrackerVideo.vue";
import socket from "@/socket.js";
import { threeBus, bus } from "../main";
import { setTimeout } from "timers";
import CSS from "@/config/styles.scss";

export default {
    name: "experience",
    components: { TrackerVideo },
    props: {
        roomState: Object
    },
    data: () => ({
        uiDatas: {
            isDebugMode: true
        },
        camIsActive: true,
        character: undefined,
        canShowUIGlobale: false,
        canShowUITuto: false,
        canShowUIStep: false,
        canShowUIEnd: false,
        canShowUIGlobaleEnd: false,
        scoreLamar: 0,
        scoreZanit: 0,
        scoreTeam: 0,
        totalFilledHoles: 0,
        totalholes: 9,
        victoriousScore: 0,
        plurielMerged: false,
        victoriousText: "Aucun",
        victoriousLegend: "à remporté la première épreuve",
        iconSrc: "icon-stone@2x.png",
        victoriousPlayer: "Aucun"
    }),
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
    },
    methods: {
        setRoomState(stateObj) {
            bus.$emit("setRoomState", stateObj);
        },
        onFirstStepClick() {
            this.setRoomState({ currentStep: { name: "NEXT" } });
        },
        getTransitionEnd() {
            if (
                this.roomState.currentStep.cameraTransition.camPos &&
                this.roomState.currentStep.cameraTransition.camPos.time !== undefined &&
                this.roomState.currentStep.cameraTransition.camPos.delay !== undefined
            ) {
                return (
                    (this.roomState.currentStep.cameraTransition.camPos.time +
                        this.roomState.currentStep.cameraTransition.camPos
                            .delay) *
                        1000 -
                    2000
                );
            } else if (
                this.roomState.currentStep.cameraTransition.camTarget &&
                this.roomState.currentStep.cameraTransition.camTarget.time !== undefined &&
                this.roomState.currentStep.cameraTransition.camTarget.delay !== undefined
            ) {
                return (
                    (this.roomState.currentStep.cameraTransition.camTarget
                        .time +
                        this.roomState.currentStep.cameraTransition.camTarget
                            .delay) *
                        1000 -
                    2000
                );
            } else {
                return 0;
            }
        },
        addHoleWinnerScore(winner) {
            // winner = Cyan / Pink / White
            if (winner === "Cyan") {
                this.$refs.scoreLamar.children[
                    this.scoreLamar
                ].style.backgroundColor = CSS.cyan;
                this.scoreLamar++;
            } else if (winner === "Pink") {
                this.$refs.scoreZanit.children[
                    this.scoreZanit
                ].style.backgroundColor = CSS.pink;
                this.scoreZanit++;
            } else if (winner === "White") {
                this.$refs.scoreTeam.children[
                    this.scoreTeam
                ].style.backgroundColor = CSS.white;
                this.scoreTeam++;
            } else {
                console.log("Winner is not possible >>>", winner);
            }
            this.totalFilledHoles++;
        },
        playerHoleProgress(hole) {
            if (hole.color === "Cyan") {
                this.$refs.cyanProgression.style.strokeDasharray = `${
                    hole.progress
                }, 100`;
            } else if (hole.color === "Pink") {
                this.$refs.pinkProgression.style.strokeDasharray = `${
                    hole.progress
                }, 100`;
            }
        },
        checkVictoriousPlayer() {
            let victoriousPlayer = null;
            // Check white
            if (this.totalFilledHoles > this.totalholes / 2) {
                if (this.scoreTeam >= this.totalFilledHoles / 2) {
                    victoriousPlayer = "team";
                } else {
                    if (this.scoreLamar > this.scoreZanit) {
                        victoriousPlayer = "lamar";
                    } else if (this.scoreZanit > this.scoreLamar) {
                        victoriousPlayer = "zanit";
                    } else {
                        victoriousPlayer = "egalite";
                    }
                }
            } else {
                victoriousPlayer = "egalite";
            }

            return victoriousPlayer;
        },
        getVictoriousIcon() {
            return `assets/img/${this.iconSrc}`;
        }
    },
    watch: {
        roomState: {
            handler: function(currentRoomState, oldRoomState) {
                // Show good UI relative to current step
                // UI RECAP TUTO
                if (currentRoomState.currentStep.name === "trial_1_intro") {
                    this.canShowUIGlobale = false;
                    setTimeout(() => {
                        this.canShowUITuto = true;
                    }, this.getTransitionEnd());
                }

                // UI XP EN COURS
                if (currentRoomState.currentStep.name === "trial_1_tuto") {
                    this.canShowUITuto = false;
                    setTimeout(() => {
                        this.canShowUIStep = true;
                    }, this.getTransitionEnd());

                    threeBus.$on("holeFilled", this.addHoleWinnerScore);
                    threeBus.$on("holeScaling", this.playerHoleProgress);
                }

                // UI END STEP 1
                if (currentRoomState.currentStep.name === "trial_1_end") {
                    this.canShowUIStep = false;
                    this.victoriousPlayer = this.checkVictoriousPlayer();
                    let color;

                    if (this.victoriousPlayer === "lamar") {
                        this.victoriousText = "Lamar";
                        this.victoriousScore = this.scoreLamar;
                        this.iconSrc = "icon-stone-lamar.png";
                        color = CSS.cyan;
                    } else if (this.victoriousPlayer === "zanit") {
                        this.victoriousText = "Zanit";
                        this.victoriousScore = this.scoreZanit;
                        this.iconSrc = "icon-stone-zanit.png";
                        color = CSS.pink;
                    } else if (this.victoriousPlayer === "team") {
                        this.victoriousText = "Bravo";
                        this.victoriousLegend =
                            "Vous avez réussi à reconstruire la tour";
                        this.victoriousScore = this.scoreTeam;
                        this.plurielMerged = true;
                        color = CSS.white;
                    } else {
                        this.victoriousText = "Egalité";
                        this.victoriousLegend =
                            "Vous ferez mieux une prochaine fois";
                        this.victoriousScore =
                            this.scoreTeam + this.scoreLamar + this.scoreZanit;
                        color = CSS.white;
                    }

                    for (let i = 0; i < this.victoriousScore; i++) {
                        this.$refs.victoriousScore.children[
                            i
                        ].style.backgroundColor = color;
                    }

                    this.$refs.victoriousStep.style.borderColor = color;

                    setTimeout(() => {
                        this.canShowUIEnd = true;
                    }, this.getTransitionEnd());
                }

                // UI END GLOBALE
                if (currentRoomState.currentStep.name === "global_ending") {
                    this.canShowUIEnd = false;

                    setTimeout(() => {
                        this.canShowUIGlobale = true;
                        this.canShowUIGlobaleEnd = true;
                        bus.$emit("trigger ending", this.victoriousPlayer);
                    }, this.getTransitionEnd());
                }
            },
            deep: true
        }
    },
    mounted() {
        if (this.roomState.lamar === socket.id) {
            this.character = "lamar";
        } else if (this.roomState.zanit === socket.id) {
            this.character = "zanit";
        } else {
            this.character = undefined;
        }

        setTimeout(() => {
            this.canShowUIGlobale = true;
        }, this.getTransitionEnd());
        // after the '-', that is the negative delay we want the UI to appear (can be any value) in ms
    }
};
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

div {
    color: #fff;

    div.visible {
        opacity: 1;
    }

    .uiGlobale {
        opacity: 0;
        transition: opacity 0.5s ease;
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        z-index: 5;

        .trackerVideo {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
        }

        button {
            color: $white;
            text-transform: uppercase;
            padding: 15px 25px;
            justify-self: center;
            align-self: flex-end;

            div.outerCircle {
                border: solid 4px $white;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                transition: transform 0.5s ease;
                position: relative;

                &:hover {
                    transform: scale(1.15);
                }

                div.innerCircle {
                    width: 100%;
                    height: 100%;
                    border: solid 1px $white;
                    border-radius: 100%;

                    animation: pulse 1.5s infinite ease-in;
                }
            }

            @keyframes pulse {
                0% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1.8);
                    opacity: 0;
                }
            }
        }

        p.visible {
            display: block;
        }

        p {
            display: none;
            max-width: 280px;
            margin: 0 auto 80px;
        }

        .stones {
            display: flex;
            align-items: flex-end;
            justify-content: center;

            img {
                border: solid 8px rgba(227, 227, 227, 0.1);
                border-radius: 100%;
                opacity: 0.5;

                &:nth-of-type(1) {
                    opacity: 1;
                }

                &:nth-of-type(2) {
                    align-self: flex-start;
                    width: 110px;
                    margin: -50px 30px 0;
                }
            }
        }
    }

    .recapTuto {
        opacity: 0;
        transition: opacity 0.5s ease;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;

        p {
            max-width: 500px;
            margin: 0 auto;
            margin-bottom: 50px;
        }
    }

    .uiStep1 {
        opacity: 0;
        transition: opacity 0.5s ease;
        position: absolute;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: center;

        .scoreTeam {
            position: relative;
            margin: 0 20px;

            div.gradient {
                .score {
                    list-style: none;
                    position: relative;
                    width: 100px;
                    height: 100px;
                    // border: solid 2px $black;
                    // background-color: $black;
                    border-radius: 50%;

                    div {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        clip-path: url(#sector);

                        background-color: rgba(227, 227, 227, 0.5);

                        &.one {
                            transform: rotate(-40deg);
                        }
                        &.two {
                            transform: rotate(0deg);
                        }
                        &.nine {
                            transform: rotate(-80deg);
                        }
                        &.height {
                            transform: rotate(-120deg);
                        }
                        &.seven {
                            transform: rotate(-160deg);
                        }
                        &.six {
                            transform: rotate(-200deg);
                        }
                        &.five {
                            transform: rotate(-240deg);
                        }
                        &.four {
                            transform: rotate(-280deg);
                        }
                        &.three {
                            transform: rotate(-320deg);
                        }
                    }
                }

                svg {
                    position: absolute;
                }
            }

            img {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 2;
            }
        }

        .scoreLamar,
        .scoreZanit {
            display: flex;
            justify-content: center;
            align-items: center;

            &.scoreLamar {
                .stone::before {
                    content: "Lamar";
                }

                div.score {
                    div:first-child {
                        border-top-left-radius: 50px;
                        border-bottom-left-radius: 50px;
                    }

                    div:last-child {
                        border-top-right-radius: 50px;
                        border-bottom-right-radius: 50px;
                    }
                }
            }

            &.scoreZanit {
                .stone::before {
                    content: "Zanit";
                }

                div.score {
                    flex-direction: row-reverse;

                    div:last-child {
                        border-top-left-radius: 50px;
                        border-bottom-left-radius: 50px;
                    }

                    div:first-child {
                        border-top-right-radius: 50px;
                        border-bottom-right-radius: 50px;
                    }
                }
            }

            .stone {
                margin: 0 10px;
                position: relative;
                width: 80px;
                height: 80px;

                &::before {
                    position: absolute;
                    top: -40px;
                    left: 50%;
                    font-weight: bold;
                    transform: translateX(-50%);
                }

                img,
                svg {
                    top: 50%;
                    left: 50%;
                    position: absolute;
                    transform: translate(-50%, -50%);
                }

                svg {
                    z-index: 3;
                    transform-origin: center left;
                    transform: rotate(-90deg);

                    circle {
                        transform-origin: 3px 3px;

                        transform: scale(2.8);
                    }
                }
            }

            div.score {
                border-radius: 50px;
                width: 300px;
                height: 20px;
                display: flex;
                background-color: rgba(255, 255, 255, 0.5);

                div {
                    width: 11.111%;
                    border: solid 2px white;
                }
            }
        }
    }

    .step1End {
        opacity: 0;
        transition: opacity 0.5s ease;
        position: absolute;
        right: 10%;
        top: 40%;
        transform: translateY(-50%);
        text-align: center;
        font-size: 25px;

        p.victorious {
            max-width: 250px;
            margin: 0 auto;

            span {
                font-size: 70px;
                font-weight: bold;
            }
        }

        img {
            margin: 25px 0;
        }

        div.score {
            border-radius: 50px;
            width: 300px;
            height: 20px;
            display: flex;
            background-color: rgba(255, 255, 255, 0.5);

            div {
                width: 11.111%;
                border: solid 2px white;

                &:first-child {
                    border-top-left-radius: 50px;
                    border-bottom-left-radius: 50px;
                }

                &:last-child {
                    border-top-right-radius: 50px;
                    border-bottom-right-radius: 50px;
                }
            }
        }
    }

    .globalEnd {
        opacity: 0;
        transition: opacity 0.5s ease;
        text-align: center;

        p.visible {
            opacity: 1;
        }

        p {
            font-size: 50px;
            opacity: 0;
            margin-top: 20%;
            transition: opacity 0.5s ease;
        }
    }

    .mobile {
        img {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
        }
    }
}
</style>
