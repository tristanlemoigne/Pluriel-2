rooms = [
  {
    id: xxxx,
    users: [
      {
        id: xxx,
        isMobile: false,
      },
      {
        id: xxx,
        isMobile: true,
      },
      {
        id: xxx,
        isMobile: true,
      }
    ],
    roomState: {
      currentStep: { name: "room_waiting" },
    //   paused: false,
    //   trial1winner: null, // "red" / "blue" / "team"
    //   trial2winner: null, // "red" / "blue" / "team"
    //   trial3win: undefined,
      player1: undefined, // === id du socket mobile envoyé par le client lors de la sélection du perso
      player2: undefined,
      lamar: undefined,
      zanit: undefined
    }
  }
];
