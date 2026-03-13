<script setup>

    const characters = [
        {
            id: 1,
            name: "Ren Amamiya",
            image: "/img/Ren_Amamiya.webp"
        },
        {
            id: 2,
            name: "Futaba Sakura",
            image: "/img/Futaba_Sakura.webp"
        }
    ]

    const backgrounds = [
        {
            id: 1,
            image: "/img/rooftop-persona3.png",
            name: "Rooftop"
        },
        {
            id: 2,
            image: "/img/persona-4-revival-872675.3.webp",
            name: "Classroom"
        }
    ]

    const themes = [
        {
            id: 1,
            borderColor: "#760000",
            textColor: "#531212",
            backgroundColor: "#ffa5a5"
        },
        {
            id: 2,
            borderColor: "#6d8b00",
            textColor: "#4a5914",
            backgroundColor: "#e7ff90"
        }
    ]

    const utterance = [
        { 
            characterId: 1, 
            texts: ["Esto es la frase generica 1", "Siguiente frase generica"],
            position: "right-0",
            backgroundId: 1,
            themeId: 1
        },
        { 
            characterId: 2, 
            texts: ["Esto es la frase generica 2"],
            position: "left-0",
            backgroundId: 2,
            themeId: 2
        },
        { 
            characterId: 1, 
            texts: ["Esto es la frase generica 3"],
            position: "right-0",
            backgroundId: 1,
            themeId: 1
        }
    ]
</script>

<template>
    <RouterView :characters="characters" :backgrounds="backgrounds" :themes="themes" :utterance="utterance"/>
</template>

<style scoped>

</style>
