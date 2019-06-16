<template>
    <div class="selectionPerso" v-show="roomState.currentStep.name === 'selection_perso'">
        <!-- CHOIX DES PERSOS DESKTOP-->
        <div v-if="!isMobile">
            <h2 class="textGlow">Qui incarnerez-vous ?</h2>

            <div class="textGlow">Sélectionnez un personnage sur votre téléphone</div>

            <div class="playerContainer">
                <p ref="player1" class="textGlow">{{lamarPlayer}} est Lamar</p>
                <p></p>
                <p ref="player2" class="textGlow">{{zanitPlayer}} est Zanit</p>
            </div>
        </div>

        <!-- CHOIX DES PERSOS MOBILE-->
        <div class="textGlow" v-if="isMobile">
            <p>
                <span>{{lamarPlayer}}</span><br/><br/>
                Choisissez votre personnage
            </p>

            <button v-if="isMobile" @click.once="choosePerso">LAMAR</button>
            <button v-if="isMobile" @click.once="choosePerso">ZANIT</button>
        </div>
    </div>
</template>

<script>
import { TweenMax, Power2 } from "gsap/TweenMax";
import socket from "@/socket";
import { bus } from "@/main";
import { threeBus } from "@/main";

export default {
    name: "room",
    components: {},
    props: {
        isMobile: Boolean,
        roomState: Object
    },
    data: function() {
        return {
            lamarPlayer: (this.roomState.player1 === socket.id) ? "Joueur 1" : "Joueur 2",
            zanitPlayer: (this.roomState.player2 === socket.id)? "Joueur 2" : "Joueur 1",
        }
    },
    computed: {},
    watch: {
        "roomState.lamar": {
            handler: function(currentLamar, oldLamar) {
                if (currentLamar !== oldLamar && currentLamar !== undefined) {
                    threeBus.$emit("animate perso", "lamar");
                    this.$refs.player1.style.opacity = 1;
                }
            },
            deep: true
        },
        "roomState.zanit": {
            handler: function(currentZanit, oldZanit) {
                if (currentZanit !== oldZanit && currentZanit !== undefined) {
                    threeBus.$emit("animate perso", "zanit");
                    this.$refs.player2.style.opacity = 1;
                }
            },
            deep: true
        },
        roomState: {
            handler: function(currentRoomState, oldRoomState) {
                // Go to dioramas when all are ready
                // if (
                //     currentRoomState.currentStep.name === "selection_perso" &&
                //     currentRoomState.zanit !== undefined &&
                //     currentRoomState.lamar !== undefined
                // ) {
                //     this.setRoomState({ currentStep: { name: "dioramas" } });
                // }
            },
            deep: true
        }
    },
    methods: {
        choosePerso(e) {
            const perso = e.target.innerText;

            if (perso === "LAMAR") {
                e.target.style.opacity = "0.2";
                this.setRoomState({ lamar: socket.id });
            } else if (perso === "ZANIT") {
                e.target.style.opacity = "0.2";
                this.setRoomState({ zanit: socket.id });
            }
        },

        setRoomState(stateObj) {
            bus.$emit("setRoomState", stateObj);
        }
    },
    mounted(){
        console.log("hinbo", this.$props.roomState)
    }
};
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

.selectionPerso {
    color: $white;
    text-align: center;

    button {
        border: solid 1px red;
        background-color: $black;
        color: $white;
        display: block;
        margin: 50px auto;
        padding: 25px 50px;
    }

    .playerContainer {
        display: flex;
        width: 100%;
        justify-content: space-around;
        max-width: 1400px;
        margin: 70px auto 0;

        p {
            opacity: 0;
            font-style: italic;
            font-size: 18px;
            transition: opacity 1s ease;
        }
    }
}
</style>
