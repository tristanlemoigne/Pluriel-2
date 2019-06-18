let server

class Serveur {
    constructor(io) {
        server = io
    }

    init() {
        let rooms = []
        const maxMobileUsers = 2
        const maxDesktopUsers = 1
        const maxUsersInOneRoom = maxDesktopUsers + maxMobileUsers

        const experienceSteps = require("./experienceSteps.js")

        // User connection
        server.on("connection", function(socket) {
            console.log("a user has  connected")

            let currentRoom = null

            // CREATE ROOM (Desktop)
            // When user is on Desktop create a room
            socket.on("create room", function(isMobile) {
                let generatedRoomStr = null

                function makeid(length) {
                    var result = ""
                    // var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    var characters = "0123456789"
                    var charactersLength = characters.length
                    for (var i = 0; i < length; i++) {
                        result += characters.charAt(
                            Math.floor(Math.random() * charactersLength)
                        )
                    }
                    return result
                }

                do {
                    generatedRoomStr = makeid(4)
                } while (checkIfRoomExist(generatedRoomStr))

                // Create our room obj on server
                currentRoom = {
                    id: generatedRoomStr,
                    users: [
                        {
                            id: socket.id,
                            isMobile: isMobile
                        }
                    ],
                    roomState: {
                        currentStep: experienceSteps[1],
                        paused: false
                    }
                }
                rooms.push(currentRoom)

                // Create the socket.io room
                socket.join(generatedRoomStr, () => {
                    server
                        .in(currentRoom.id)
                        .emit("update users", currentRoom.users)
                    console.log(`Un joueur a créé la salle ${generatedRoomStr}`)
                    // create and joins the room (emit only joined)
                    socket.emit("joined room", generatedRoomStr)
                    // Dispatch the room's state
                    console.log(currentRoom.roomState)
                    server
                        .in(currentRoom.id)
                        .emit("set user room state", currentRoom.roomState)
                })
            })

            // JOIN ROOM (mobile)
            // When user is on Mobile and join a room
            socket.on("join room", function({ isMobile, requestedRoom }) {
                if (!checkIfRoomExist(requestedRoom)) {
                    console.log(
                        `Un joueur a essayé de rejoindre la salle ${requestedRoom} mais elle n'existe pas`
                    )
                    socket.emit("cant join room", requestedRoom)
                    return
                }

                currentRoom = rooms.find(room => room.id === requestedRoom)

                const mobileUsers = () =>
                    currentRoom.users.filter(user => user.isMobile)
                const desktopUsers = () =>
                    currentRoom.users.filter(user => !user.isMobile)

                const mobileUsersCount = () => mobileUsers().length
                const desktopUsersCount = () => desktopUsers().length
                const usersInRoomCount = () =>
                    mobileUsersCount() + desktopUsersCount()

                if (usersInRoomCount() >= maxUsersInOneRoom) {
                    console.error("La salle est pleine (3 devices max)")
                    return
                } else if (mobileUsersCount() >= maxMobileUsers && isMobile) {
                    console.error(
                        "Trop de mobiles dans la room, tu ne peux pas rejoindre"
                    )
                } else if (
                    desktopUsersCount() >= maxDesktopUsers &&
                    !isMobile
                ) {
                    console.error(
                        "Il y déjà un desktop dans la room, tu ne peux pas rejoindre"
                    )
                } else {
                    socket.join(requestedRoom, () => {
                        const currentUser = {
                            id: socket.id,
                            isMobile: isMobile,
                            character: isMobile
                                ? setCharacter(mobileUsersCount())
                                : null
                        }
                        currentRoom.users.push(currentUser)
                        socket.emit("joined room", requestedRoom)
                        server
                            .in(currentRoom.id)
                            .emit("update users", currentRoom.users)
                        console.log(
                            `Un joueur a rejoint la salle ${requestedRoom}`
                        )
                        // Dispatch the room's state
                        console.log(currentRoom.roomState)
                        server
                            .in(currentRoom.id)
                            .emit("set user room state", currentRoom.roomState)

                        if (mobileUsersCount() === 1) {
                            currentRoom.roomState.player1 = socket.id
                            server
                                .in(currentRoom.id)
                                .emit("playerOneReady", socket.id)
                        }

                        if (mobileUsersCount() === 2) {
                            currentRoom.roomState.player2 = socket.id
                            server
                                .in(currentRoom.id)
                                .emit("playerTwoReady", socket.id)
                        }

                        // If, after this connection, the room is full, then go to next step
                        if (
                            mobileUsersCount() === maxMobileUsers &&
                            desktopUsersCount() === maxDesktopUsers
                        ) {
                            setTimeout(() => {
                                currentRoom.roomState.currentStep = experienceSteps.find(
                                    stepObj =>
                                        stepObj.name === "selection_perso"
                                )

                                server
                                    .in(currentRoom.id)
                                    .emit(
                                        "set user room state",
                                        currentRoom.roomState
                                    )
                            }, 3000)
                        }
                    })
                }
            })

            // USER DISCONNECT
            // TODO: actually disconnect user when going back to home page
            // (for now, a user can connect to multiple rooms, and multiple times to the same room)
            socket.on("disconnect", function() {
                console.log("a user has disconnected")
                if (currentRoom === null) return
                socket.leave(currentRoom.id, () => {
                    // Remove user from the room object
                    currentRoom.users = currentRoom.users.filter(
                        user => user.id !== socket.id
                    )
                    server
                        .in(currentRoom.id)
                        .emit("update users", currentRoom.users)
                    console.log(`Un joueur a quitté la salle ${currentRoom.id}`)
                    // Dele room if last user left
                    if (currentRoom.users.length <= 0) {
                        rooms = rooms.filter(room => room.id !== currentRoom.id)
                        console.log(
                            "la room ",
                            currentRoom.id,
                            " à été supprimée"
                        )
                    }
                })
            })

            // SET ROOM STATE
            // Receive change of state, and order all devices to change theirs
            socket.on("set server room state", function(changedState) {
                if (currentRoom === null) {
                    console.error("No current room")
                    return
                }
                if (Object.keys(changedState).includes("currentStep")) {
                    changedState.currentStep = {
                        ...changedState.currentStep,
                        ...checkCurrentStep(
                            changedState.currentStep,
                            currentRoom.roomState.currentStep
                            // currentRoom.roomState.currentStep.name
                        )
                    }
                }
                currentRoom.roomState = {
                    ...currentRoom.roomState,
                    ...changedState
                }
                console.log(currentRoom.roomState)
                server
                    .in(currentRoom.id)
                    .emit("set user room state", currentRoom.roomState)
            })

            // THREE LOOP UPDATED
            socket.on("gyro cyan", function(Quaternion) {
                // console.log("GYRO CYAN")
                if (currentRoom) {
                    console.log("GYRO CYAN", Quaternion)
                    server
                        .in(currentRoom.id)
                        .emit("dispatch cyan quaternion", Quaternion)
                }
            })
            socket.on("gyro pink", function(Quaternion) {
                console.log("GYRO PINK")
                if (currentRoom) {
                    server
                        .in(currentRoom.id)
                        .emit("dispatch pink quaternion", Quaternion)
                }
            })
        })

        // *** *** *** *** *** *** *** *** *** ***

        /**
         *
         * @param {Object} roomString
         */
        function checkIfRoomExist(roomString) {
            const roomsStringArr = Object.keys(server.sockets.adapter.rooms)
            return roomsStringArr.some(currentRoomString => {
                return currentRoomString === roomString
            })
        }

        /**
         * Receive a step object and test on the experienceSteps array before returning
         * @param {Object} requestedStep
         * @param {Object} currentStep
         * @returns {Object} return a valid step object OR log an error and return the old currentStep
         */
        function checkCurrentStep(requestedStep, currentStep) {
            // Specific step
            if (
                experienceSteps.some(
                    stepObj => stepObj.name === requestedStep.name
                )
            ) {
                return experienceSteps.find(
                    stepObj => stepObj.name === requestedStep.name
                )
            }
            // Next step
            else if (requestedStep.name === "NEXT") {
                console.log("next")
                const currentStepIndex = experienceSteps.findIndex(
                    stepObj => stepObj.name === currentStep.name
                )
                if (currentStepIndex === -1) {
                    console.warn(
                        "the current step is not in the experienceSteps list"
                    )
                    return currentStep
                }
                const nextStepIndex = currentStepIndex + 1
                const nextStep = experienceSteps[nextStepIndex]
                if (typeof nextStep === "undefined") {
                    console.warn(
                        "the current step is the last of the experienceSteps list"
                    )
                    return currentStep
                }
                return nextStep
            } else {
                console.warn(
                    "the requestedStep '" +
                        requestedStep.name +
                        "' is not recognized, returning current step"
                )
                return currentStep
            }
        }

        /**
         * Temporary function that sets the character when joining the room
         * @param {Number} mobileUsersCount
         */
        function setCharacter(mobileUsersCount) {
            return mobileUsersCount === 0 ? "cyan" : "pink"
        }
    }
}

module.exports = Serveur
