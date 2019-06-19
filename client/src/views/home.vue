<template>
    <div id="home" @mousemove="sliderMove">
        <div v-if="!isMobile" ref="sliderBar" class="sliderBar"></div>

        <div v-if="!isMobile" class="titles">
            <h1>{{title}}</h1>
            <Logo/>
            <h2 class="textGlow">{{subtitle}}</h2>
        </div>

        <!-- Commencer l'expérience Desktop-->
        <button v-if="!isMobile" @click.prevent="createRoom">
            <div class="outerCircle">
                <div class="innerCircle"></div>
            </div>
        </button>

        <!-- Home Mobile -->
        <div class="homeMobile textGlow" v-if="isMobile && !canShowMobileForm">
            <div class="main">
                <Logo/>
                <h2>{{subtitle}}</h2>
            </div>

            <button @click.once="showMobileForm">
                <div class="outerCircle">
                    <div class="innerCircle"></div>
                </div>
            </button>
        </div>

        <!-- Commencer l'expérience Mobile-->
        <form
            class="formMobile"
            v-if="isMobile && canShowMobileForm"
            action
            @submit.prevent="joinRoom"
        >
            <p class="textGlow">
                Connectez-vous sur
                <b>pluriel-xp.com</b> avec votre ordinateur et rentrez le code affiché
            </p>
            <input
                class="inputText textGlow"
                type="number"
                v-model="requestedRoom"
                placeholder="Code"
            >
            <br>

            <button type="submit">
                <div class="outerCircle">
                    <div class="innerCircle"></div>
                </div>
            </button>
        </form>
    </div>
</template>

<script>
import io from "socket.io-client";
import { threeBus } from "@/main";
import CanvasRotator from "@/threejs/CanvasRotator";
const firstStep = require("../../../server/experienceSteps.js")[0];
import Logo from "@/components/Logo";

export default {
    name: "home",
    components: {
        Logo
    },
    props: {
        isMobile: Boolean,
        audioFunctions: Object
    },
    data: () => ({
        title: "Pluriel",
        subtitle: "Une expérience singulière",
        requestedRoom: "",
        canShowMobileForm: false
    }),
    methods: {
        createRoom(event) {
            this.$emit("createRoom");
            threeBus.$emit("step creation room");

            this.audioFunctions.startAmbient()
            this.audioFunctions.clickBtn()
        },
        joinRoom(event) {
            this.$emit("joinRoom", this.$data.requestedRoom);
        },
        sliderMove(e) {
            if (this.$refs.sliderBar)
                this.$refs.sliderBar.style.left = `calc(50% + (${
                    e.pageX
                }px - 50%) * 0.45)`;
        },
        showMobileForm() {
            this.canShowMobileForm = true;
        }
    },
    mounted() {
        if (!this.isMobile) {
            CanvasRotator().rotateCSS(
                this.$refs.sliderBar,
                firstStep.canvasAngle
            );
        }
    }
};
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
        width: 6px;
        height: calc((40vw + 55vh) / 2);
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

    .homeMobile {
        width: 100%;
        height: 100%;
        position: absolute;
        background-image: url("/assets/img/HomeMobile.png");
        background-size: cover;
        background-repeat: no-repeat;

        div.main {
            position: relative;
            top: 40%;
            transform: translateY(-50%);

            h2 {
                margin: 0;
            }
        }

        button {
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
        }
    }

    .formMobile {
        input {
            margin-top: 10%;
            background: none;
            border: none;
            color: $white;
            text-transform: uppercase;
            border-bottom: solid 2px $white;
            font-size: 40px;
            text-align: center;
            padding-bottom: 5px;
            width: 200px;
            letter-spacing: 20px;
            padding-left: 5px;

            &::placeholder {
                /* Chrome, Firefox, Opera, Safari 10.1+ */
                color: $white;
                opacity: 1; /* Firefox */
            }
        }

        button {
            position: absolute;
            bottom: 5%;
            left: 50%;
            transform: translateX(-50%);
        }

        img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
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
