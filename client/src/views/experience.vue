<template>
    <div>
        <!--Desktop stuff -->
        <div class="desktop" v-bind:class="{ visible: canShowUI }" v-if="!isMobile">
            <TrackerVideo :hasStarted="camIsActive" v-show="this.uiDatas.isDebugMode"/>

            <button v-if="!isMobile" @click="onFirstStepClick()">
                <div class="outerCircle">
                    <div class="innerCircle"></div>
                </div>
            </button>

            <p class="textGlow">Accédez à la 1ère étape grâce à votre téléphone.</p>

            <div class="stones">
                <img src="assets/img/icon-stone.png" alt>
                <img src="assets/img/icon-stone@2x.png" alt>
                <img src="assets/img/icon-stone.png" alt>
            </div>
        </div>

        <!-- Mobile stuff -->
        <div class="mobile" v-if="isMobile">
            <div v-if="character === 'lamar'">
                JE SUIS LAMAR
                <img src="assets/img/AmulettesTest_Lamar.png" alt>
            </div>
            <div v-if="character === 'zanit'">
                JE SUIS ZANIT
                <img src="assets/img/AmulettesTest_Zanit.png" alt>
            </div>
        </div>
    </div>
</template>

<script>
import TrackerVideo from "@/components/TrackerVideo.vue";
import socket from "@/socket.js";
import { bus } from "../main";
import { setTimeout } from "timers";

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
        canShowUI: false
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
            this.canShowUI = false;
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
            this.canShowUI = true;
        }, (this.roomState.currentStep.cameraTransition.camPos.time + this.roomState.currentStep.cameraTransition.camPos.delay) * 1000 - 3000); // after the '-', that is the negative delay we want the UI to appear (can be any value) in ms
    }
};
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

div {
    color: #fff;

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

    .desktop {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        opacity: 0;
        transition: opacity 0.5s ease;

        &.visible {
            opacity: 1;
        }

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

        p {
            max-width: 280px;
            margin: 0 auto 80px;
        }

        .stones {
            display: flex;
            // border: solid 1px red;
            // width: 200px;
            align-items: flex-end;
            justify-content: center;

            img {
                border: solid 8px rgba(227, 227, 227, 0.1);
                border-radius: 100%;

                &:nth-of-type(2) {
                    align-self: flex-start;
                    width: 110px;
                    margin: -50px 30px 0;
                    // transform: scale(0.75);
                }
            }
        }
    }
}
</style>
