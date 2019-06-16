<template>
    <div class="roomUI">
        <!-- TUTO DISPOSITIF DESKTOP -->
        <div
            class="dispositif"
            ref="dispositif"
            v-show="roomState.currentStep.name === 'room_waiting'"
            v-if="!isMobile"
        >
            <div class="description textGlow">
                Vous devrez être
                <b>2 joueurs</b> ayant chacun un smartphone pour réaliser l’expérience.
            </div>

            <div class="illustration">
                <div class="desktop">
                    <img class="svgGlow" src="/assets/img/icon-desktop.svg" alt>
                    <img class="svgGlow verticalLine" src="/assets/img/vertical-line.svg" alt>
                </div>

                <div class="mobiles">
                    <img class="svgGlow mobile" src="/assets/img/icon-mobile.svg" alt>
                    <img class="svgGlow circle" src="/assets/img/circle.svg" alt>
                    <img class="svgGlow horizontalLine" src="/assets/img/horizontal-line.svg" alt>
                    <img class="svgGlow circle" src="/assets/img/circle.svg" alt>
                    <img class="svgGlow mobile" src="/assets/img/icon-mobile.svg" alt>
                </div>
            </div>
        </div>

        <!-- CONNEXION ROOM DESKTOP-->
        <div v-if="!isMobile" ref="connexion" class="connexion">
            <div v-if="roomState.currentStep.name === 'room_waiting'">
                <div class="description textGlow">
                    Connectez-vous grâce à votre mobile sur
                    <b>pluriel-xp.com</b>, et rentrez ce code :
                </div>

                <div class="roomId textGlow">{{ roomId }}</div>
                <div class="playersLeft">En attente de {{2 - mobileUsersCount}} joueurs...</div>
            </div>

            <div class="mobilesWaiting" v-if="roomState.currentStep.name === 'room_waiting'">
                <div>
                    <PictoMobile class="mobile" :isActive="mobileUsersCount > 0"/>
                    <p ref="player1ready">Joueur 1 est prêt</p>
                </div>

                <img
                    :class="mobileUsersCount > 0 ? 'active circle' : 'circle'"
                    src="/assets/img/circle.svg"
                    alt
                >
                <img class="svgGlow horizontalLine" src="/assets/img/horizontal-line.svg" alt>
                <img
                    :class="mobileUsersCount > 1 ? 'active circle' : 'circle'"
                    src="/assets/img/circle.svg"
                    alt
                >

                <div>
                    <PictoMobile class="mobile" :isActive="mobileUsersCount > 1"/>
                    <p ref="player2ready">Joueur 2 est prêt</p>
                </div>
            </div>
        </div>

        <!-- UN MOBILE A REJOINT -->

        <div class="mobile textGlow" v-if="isMobile">
            <div class="player">
                Vous êtes <span v-bind:class="{ visible: mobileUsersCount === 1 }">Joueur 1</span><span v-bind:class="{ visible: mobileUsersCount > 1 }">Joueur 2</span>
            </div>

            <img src="/assets/img/mobileConnected.svg" alt/>

            <div>
                <p>
                    Vous avez rejoins l'expérience
                </p>

                <p>
                    En attente du deuxième joueur...
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { TweenMax, Power2 } from "gsap/TweenMax"
import PictoDesktop from "../components/PictoDesktop"
import PictoMobile from "../components/PictoMobile"
import socket from "@/socket"

import { bus } from "@/main"

export default {
    name: "room",
    components: {
        PictoDesktop,
        PictoMobile
    },
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
    },
    data() {
        return {
            isDebugMode: true
        }
    },
    computed: {
        desktopUsersCount() {
            return this.$props.users.filter(user => !user.isMobile).length
        },
        mobileUsersCount() {
            const mobileCount = this.$props.users.filter(user => user.isMobile)
                .length
            return mobileCount
        }
    },
    mounted: function() {
        if (this.isMobile) {
            var noSleep = new NoSleep()
            noSleep.enable() // keep the screen on!
        }

        // TODO: use CSS and the current step name instead of GSAP?
        const tl = new TimelineLite()

        tl.to(this.$refs.dispositif, 2, {
            opacity: 0,
            delay: 0.5,
            ease: Power2.easeIn,
            onComplete: () => {
                if (this.$refs.dispositif) {
                    this.$refs.dispositif.style.display = "none"
                    this.$refs.connexion.style.display = "flex"
                }
            }
        })

        tl.to(this.$refs.connexion, 1, { opacity: 1, ease: Power2.easeOut })

        // Socket listeners
        socket.on("playerOneReady", () => {
            console.log("the player one is ready")
            TweenMax.to(this.$refs.player1ready, 1, {
                opacity: 1,
                ease: Power2.easeOut
            })
        })

        socket.on("playerTwoReady", () => {
            console.log("the player two is ready")
            TweenMax.to(this.$refs.player2ready, 1, {
                opacity: 1,
                ease: Power2.easeOut
            })
        })
    }
}
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

.roomUI {
    text-align: center;
    color: $white;
    font-size: 24px;
    font-weight: lighter;

    .description {
        margin: 0 auto;
        max-width: 580px;
    }

    .dispositif {
        position: relative;
        top: 50%;
        transform: translateY(-50%);

        .illustration {
            margin-top: 80px;

            .desktop {
                display: flex;
                flex-direction: column;

                .verticalLine {
                    margin-top: 30px;
                }
            }

            .mobiles {
                margin-top: -30px;
                display: flex;
                justify-content: center;

                .circle {
                    margin: 0 10px;
                }

                .mobile {
                    margin: 0 20px;
                }
            }
        }
    }

    .connexion {
        width: 100%;
        height: 100%;
        display: none;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: rgba(0, 0, 0, 0.35);

        .roomId {
            font-size: 100px;
            letter-spacing: 80px;
            text-indent: 80px;
            font-weight: 300;
            margin-top: 20px;
            margin-bottom: 50px;
            text-align: center;
        }

        .playersLeft {
            font-size: 18px;
            margin-bottom: 30px;
        }

        .mobilesWaiting {
            display: flex;
            .circle {
                margin: 0 10px;
                opacity: 0.5;

                &.active {
                    opacity: 1;
                    @extend .svgGlow;
                }
            }

            > div {
                p {
                    opacity: 0;
                    margin: 0;
                    margin-top: 10px;
                    font-size: 15px;
                }
            }
        }
    }

    div.mobile{
        font-size: 17px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;

        div.player{
            margin-bottom: 20%;
            span.visible{
                display: inline;
            }

            span{
                display: none;
                // font-style: italic;
                font-weight: bold;
            }
        }
      
        p:nth-child(1){
            font-weight: bold;
        }

        p:nth-child(2){
            margin-top: 100px;
        }
    }
}
</style>
