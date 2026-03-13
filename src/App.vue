<script setup>
import { RouterView } from "vue-router";

import koheartsNeutral from "@/assets/characters/kohearts/kohearts_neutral.png";
import whiterabbitNeutral from "@/assets/characters/whiterabbit/whiterabbit_neutral.png";
import cheshirecatNeutral from "@/assets/characters/cheshirecat/cheshirecat_neutral.png";

import dungeon1 from "@/assets/backgrounds/dungeon1.png";
import dungeon2 from "@/assets/backgrounds/dungeon2.png";

// PERSONAJESs
const characters = [
  { id: 1, name: "King of Hearts", image: koheartsNeutral },
  { id: 2, name: "White Rabbit", image: whiterabbitNeutral },
  { id: 3, name: "Cheshire Cat", image: cheshirecatNeutral },
];

// FONDOS
const backgrounds = [
  { id: 1, image: dungeon1, name: "Dungeon 1" },
  { id: 2, image: dungeon2, name: "Dungeon 2" },
];

// DIÁLOGOS
const dialogues = [
  {
    id: "d1",
    defaultBackgroundId: 1,
    utterances: [
      {
        id: "u1",
        characterId: 1,
        texts: [
          "Bienvenido al reino subterráneo.",
          "Soy King of Hearts, protector de estas tierras.",
        ],
        position: "left",
      },
      {
        id: "u2",
        characterId: 2,
        texts: ["Y yo soy White Rabbit, tu guía en este lugar."],
        position: "right",
      },
    ],
  },
  {
    id: "d2",
    defaultBackgroundId: 2,
    utterances: [
      {
        id: "u1",
        characterId: 3,
        texts: ["Soy el misterioso Cheshire Cat."],
        position: "center",
      },
    ],
  },
];

// TEMAS
const yellowTheme = {
  dialogueBg: "bg-gray-900",
  border: "border-yellow-500",
  speakerName: "text-yellow-400",
  button: "bg-gray-700 hover:bg-yellow-500 hover:text-black",
  buttonActive: "bg-yellow-500 text-black",
  highlightWord: "text-yellow-400"
};

const cyanTheme = {
  dialogueBg: "bg-gray-900",
  border: "border-cyan-400",
  speakerName: "text-cyan-400",
  button: "bg-gray-800 hover:bg-cyan-500 hover:text-black",
  buttonActive: "bg-cyan-500 text-black",
  highlightWord: "text-cyan-400",
};

</script>

<template>
  <RouterView
    :characters="characters"
    :backgrounds="backgrounds"
    :dialogues="dialogues"
    :theme="yellowTheme"
  />
</template>
