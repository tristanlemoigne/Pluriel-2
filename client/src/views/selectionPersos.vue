<template>
    <div class="selectionPerso" v-show="roomState.currentStep.name === 'selection_perso'">
        <!-- CHOIX DES PERSOS DESKTOP-->
        <div v-if="!isMobile">
            <h2 class="textGlow">Qui incarnerez-vous ?</h2>

            <div class="textGlow">Sélectionnez un personnage sur votre téléphone</div>

            <div class="playerContainer">
                <p ref="lamarPlayer" class="textGlow">{{lamarPlayer}} est Lamar</p>
                <p></p>
                <p ref="zanitPlayer" class="textGlow">{{zanitPlayer}} est Zanit</p>
            </div>
        </div>

        <!-- CHOIX DES PERSOS MOBILE-->
        <div class="mobile textGlow" v-if="isMobile">
            <p class="textContent">
                <span>{{player}}</span>
                Choisissez votre personnage
            </p>

            <div ref="carousel" class="carousel">
                <div class="previous" v-bind:class="{ hide: canClickNext }" @click="slidePerso('previous', -10)">
                    <img src="/assets/img/selectionPrevious.png" alt/><br/>
                    Précédent
                </div>

                <div class="next" v-bind:class="{ hide: !canClickNext }" @click="slidePerso('next', 10)">
                    <img src="/assets/img/selectionNext.png" alt/><br/>
                    Suivant
                </div>
            </div>

            <button v-bind:class="{ hide: (!canChooseLamar && canClickNext )|| (!canChooseZanit && !canClickNext ) }" v-if="isMobile" @click.once="choosePerso">Choisir ce personnage</button>
        </div>
    </div>
</template>

<script>
import { TweenMax, Power2 } from "gsap/TweenMax";
import socket from "@/socket";
import { bus, threeBus } from "@/main";

export default {
    name: "room",
    components: {},
    props: {
        isMobile: Boolean,
        roomState: Object
    },
    data: function() {
        return {
            canClickNext: true,
            player: (this.roomState.player1 === socket.id) ? "Joueur 1" : "Joueur 2",
            lamarPlayer: "undefined",
            zanitPlayer: "undefined",
            canChooseLamar: true,
            canChooseZanit: true
        }
    },
    computed: {},
    watch: {
        "roomState.lamar": {
            handler: function(currentLamar, oldLamar) {
                if (currentLamar !== oldLamar && currentLamar !== undefined) {
                    threeBus.$emit("animate perso", "lamar");
                    this.canChooseLamar = false

                    if(this.isMobile){
                        if(currentLamar === socket.id){
                            for (let i = 0; i < this.$refs.carousel.children.length; i++) {
                                this.$refs.carousel.children[i].classList.add("hide")
                            }
                        }
                    } else {
                        if(this.roomState.player1 === currentLamar){
                            this.lamarPlayer = "Joueur 1"
                        } else {
                            this.lamarPlayer = "Joueur 2"
                        }

                        this.$refs.lamarPlayer.style.opacity = 1;
                    }
                }
            },
            deep: true
        },
        "roomState.zanit": {
            handler: function(currentZanit, oldZanit) {
                if (currentZanit !== oldZanit && currentZanit !== undefined) {
                    threeBus.$emit("animate perso", "zanit");
                    this.canChooseZanit = false

                    if(this.isMobile){
                        if(currentZanit === socket.id){
                            for (let i = 0; i < this.$refs.carousel.children.length; i++) {
                                this.$refs.carousel.children[i].classList.add("hide")
                            }
                        }
                    } else {
                        if(this.roomState.player1 === currentZanit){
                            this.zanitPlayer = "Joueur 1"
                        } else {
                            this.zanitPlayer = "Joueur 2"
                        }

                        this.$refs.zanitPlayer.style.opacity = 1;
                    }
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
            if (this.canClickNext) { // Perso = Lamar
                this.setRoomState({ lamar: socket.id });
            } else{
                this.setRoomState({ zanit: socket.id });
            }
        },
        slidePerso(slide, slideValue){
            if(slide === "next"){
                this.canClickNext = false
            } else if(slide === "previous"){
                this.canClickNext = true
            }
            threeBus.$emit("slidePerso", slideValue);
        },
        setRoomState(stateObj) {
            bus.$emit("setRoomState", stateObj);
        }
    }
};
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

.selectionPerso {
    color: $white;
    text-align: center;

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

    .hide{
        opacity: 0.4;
        pointer-events: none;
    }

    .mobile{
        p.textContent{
            margin-top: 50px;

            span{
                display: block;
                font-style: italic;
                font-weight: lighter;
                margin-bottom: 10px;
            }
        }

        div.carousel{
            // border: solid 1px red;
            display: flex;
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            width: 100%;
            padding: 0 10px;
            justify-content: space-between;
            text-transform: uppercase;
            font-size: 12px;

            img{
                margin-bottom: 8px;
            }
        }

        button{
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
            padding-bottom: 4px;
            font-weight: bold;
            border-bottom: solid 2px $white;
        }
    }
}
</style>
