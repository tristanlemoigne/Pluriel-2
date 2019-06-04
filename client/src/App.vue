<template>
    <div id="app">
        <transition name="fade">
            <router-view
                class="page"
                :isMobile="isMobile"
                :roomId="roomId"
                :roomState="roomState"
                :users="users"
                @createRoom="userCreateRoom"
                @joinRoom="userJoinRoom"
            />
        </transition>

        <div class="UIOverlay">
            <a href>About</a>
            <button class="audio" @click="toggleAudio()" :class="[isAudioActive ? 'on' : 'off']"/>
        </div>

        <DebugUIHelpers :users="users" :roomState="roomState"/>
        <ThreeContainerDsk v-if="!isMobile" :roomState="roomState" :needsCamera="true"/>
        <ThreeContainerMob v-if="isMobile" :roomState="roomState" :character="myCharacter"/>
    </div>
</template>

<script>
import socket from "./socket.js";
import { bus } from "@/main";
import { findIp } from "./utils";
import { checkIfMobile } from "./utils";
import experienceSteps from "../../server/experienceSteps.js"; // this is reference a file outside client folder, so it's the same as the server's

import DebugUIHelpers from "./components/DebugUIHelpers";
import ThreeContainerDsk from "./components/ThreeContainer/ThreeContainerDsk.vue";
import ThreeContainerMob from "./components/ThreeContainer/ThreeContainerMob.vue";
import { threeBus } from "@/main";

export default {
    name: "app",
    components: { DebugUIHelpers, ThreeContainerDsk, ThreeContainerMob },
    data() {
        return {
            socket: socket,
            roomState: {
                currentStep: experienceSteps[0],
                lamar: undefined,
                zanit: undefined
            },
            users: Array(3),
            myCharacter: null,
            roomId: "",
            isMobile: checkIfMobile(),
            isAudioActive: true
        };
    },
    mounted() {
        // Listen for server events
        socket.on("joined room", this.showRoom);
        socket.on("cant join room", this.showCantJoin);
        socket.on("update users", users => this.setUsersData(users));
        socket.on("set user room state", newRoomState =>
            this.setOwnState(newRoomState)
        );

        bus.$on("setRoomState", this.setRoomState);
    },
    methods: {
        userCreateRoom() {
            socket.emit("create room", this.$data.isMobile);
        },
        userJoinRoom(requestedRoom) {
            socket.emit("join room", {
                isMobile: this.$data.isMobile,
                requestedRoom
            });
        },
        showRoom(roomId) {
            this.$router.push({ name: "room" });
            this.$data.roomId = roomId;
        },
        showCantJoin(roomId) {
            console.error(`La salle ${roomId} demandée n'existe pas`);
        },
        setRoomState(changedState) {
            socket.emit("set server room state", changedState);
        },
        setOwnState(roomState) {
            this.$data.roomState = roomState;
        },
        setUsersData(newUsers) {
            this.$data.users = newUsers;

            if (typeof this.$data.users[0] !== "undefined") {
                const user = this.$data.users.find(
                    user => user.id === socket.id
                );
            }
        },
        toggleAudio() {
            this.$data.isAudioActive = !this.$data.isAudioActive;
        }
    },
    watch: {
        roomState: function(roomState) {
            if (roomState.currentStep.name.slice(0, 4) === "room") {
                this.$router.push({ name: "room" });
            }
            if (roomState.currentStep.name === "selection_perso") {
                this.$router.push({ name: "selectionPersos" });
            }
            if (roomState.currentStep.name === "dioramas") {
                this.$router.push({ name: "dioramas" });
            }
            if (roomState.currentStep.name === "tuto_interactif") {
                this.$router.push({ name: "tutoInteractif" });
            }
            if (roomState.currentStep.name === "trial_1_intro") {
                this.$router.push({ name: "experience" });
            }
        },
        users: function() {
            const user = this.$data.users.find(user => user.id === socket.id);
            this.$data.myCharacter = user.character;
        }
    }
};
</script>

<style lang="scss">
// global styles are managed here :
@import "@/config/styles.scss";

* {
    box-sizing: border-box;
}
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    color: $white;

    #app {
        font-family: "Poppins", Arial, Helvetica, sans-serif;
        height: 100%;

        .page {
            // DECOMMENTER POUR ORBIT CONTROL OU DEBUG
            // pointer-events: none;
            position: relative;
            z-index: 10;
            height: 100%;
            padding: 50px;
            & > button {
                pointer-events: auto;
            }
        }

        .UIOverlay {
            position: absolute;
            right: 30px;
            top: 30px;
            z-index: 10;

            button.audio {
                pointer-events: auto;
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
                width: 30px;
                height: 10px;
                margin-left: 20px;
                transition: filter 0.25s ease, background-image 0.25s ease;

                &:hover {
                    @extend .svgGlow;
                }

                &.on {
                    background-image: url("/assets/img/sound-on.svg");
                }

                &.off {
                    background-image: url("/assets/img/sound-off.svg");
                }

                img {
                    display: block;
                }
            }
        }

        /* *** *** *** *** *** PAGES TRANSITIONS *** *** *** *** *** */
        .fade-leave-active {
            // position: absolute;
            transition: opacity 0.4s;
        }
        .fade-leave-to {
            opacity: 0;
        }
        .fade-enter-active {
            transition: opacity 0.5s;
            transition-delay: 0.4s;
        }
        .fade-enter {
            opacity: 0;
        }
    }
}
</style>
