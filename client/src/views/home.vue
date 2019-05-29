<template>
    <div id="home" @mousemove="sliderMove">
        <div ref="sliderBar" class="sliderBar"></div>

        <div class="titles">
            <h1>{{title}}</h1>
            <Logo/>
            <h2 class="textGlow">{{subtitle}}</h2>
        </div>

        <!-- Commencer l'expérience Desktop-->
        <button v-if="!isMobile" @click="createRoom">
            <div class="outerCircle">
                <div class="innerCircle"></div>
            </div>
        </button>

        <form v-if="isMobile" action @submit.prevent="joinRoom">
            <input type="text" v-model="requestedRoom" placeholder="Room id">
            <input class="bigTextButton" value="Join room" type="submit">
        </form>
    </div>
</template>

<script>
import io from "socket.io-client"
import { threeBus } from "@/main"
import CanvasRotator from "@/threejs/CanvasRotator"
const firstStep = require("../../../server/experienceSteps.js")[0]
import Logo from "@/components/Logo"

export default {
    name: "home",
    components: {
        Logo
    },
    props: {
        isMobile: Boolean
    },
    data: () => ({
        title: "Pluriel",
        subtitle: "Une expérience singulière",
        requestedRoom: ""
    }),
    methods: {
        createRoom(event) {
            this.$emit("createRoom")
            threeBus.$emit("step creation room")
        },
        joinRoom(event) {
            this.$emit("joinRoom", this.$data.requestedRoom)
        },
        sliderMove(e) {
            if (this.$refs.sliderBar)
                this.$refs.sliderBar.style.left = `calc(50% + (${
                    e.pageX
                }px - 50%) * 0.45)`
        }
    },
    mounted() {
        CanvasRotator().rotateCSS(this.$refs.sliderBar, firstStep.canvasAngle)
    }
}
</script>


<style scoped lang="scss">
@import "@/config/styles.scss";

#home {
    text-align: center;
    font-size: 15px;
    display: grid;
    align-items: center;
    justify-content: stretch;
    grid-template-rows: 3fr 0.5fr;
    color: $white;
    user-select: none;
    box-sizing: border-box;

    .sliderBar {
        position: absolute;
        width: 5px;
        height: 40vw;
        background-color: #cbb2ff;
        left: 50%;
        top: 50%;
        z-index: -2;
        border-radius: 10px;
        transform: translate(-50%, -50%) rotate(35deg);
    }

    .titles {
        * {
            margin: 0;
        }

        h1 {
            text-transform: uppercase;
            font-size: 150px;
            letter-spacing: 15px;
            // For SEO
            text-indent: -999999px;
            position: absolute;
        }

        .logo {
            fill: #fff;
            max-width: 600px;
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
        }

        h2 {
            margin-top: -30px;
            font-weight: normal;
            font-size: 24px;
        }
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
</style>
