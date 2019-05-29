import Vue from "vue";
import Router from "vue-router";
import home from "./views/home.vue";
import room from "./views/room.vue";
import selectionPersos from "./views/selectionPersos.vue";
import dioramas from "./views/dioramas.vue";
import tutoInteractif from "./views/tutoInteractif.vue";
import experience from "./views/experience.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: home
    },
    {
      path: "/room",
      name: "room",
      component: room
    },
    {
      path: "/selection-persos",
      name: "selectionPersos",
      component: selectionPersos
    },
    {
      path: "/dioramas",
      name: "dioramas",
      component: dioramas
    },
    {
      path: "/tuto-interactif",
      name: "tutoInteractif",
      component: tutoInteractif
    },
    {
      path: "/xp",
      name: "experience",
      component: experience
    }
  ]
});
