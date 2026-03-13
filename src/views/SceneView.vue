<script setup>
    import { useStepper } from '@vueuse/core'
    import { computed, ref, shallowRef } from 'vue'

    const props = defineProps({
        characters: Array,
        backgrounds: Object,
        themes: Object,
        utterance: Object,
    })

    const stepper = useStepper(
        Object.fromEntries(props.utterance.map((_, i) => [i, i]))
    )

    const currentIndex = computed(() => Number(stepper.current.value))
    const textIndex = ref(0)

    const currentLine = computed(() => props.utterance[currentIndex.value])
    const currentText = computed(() => currentLine.value.texts[textIndex.value])

    const currentCharacter = computed(() =>
        props.characters.find(character => character.id === currentLine.value.characterId)
    )

    const currentBackground = computed(() =>
        props.backgrounds.find(background => background.id === currentLine.value.backgroundId)
    )

    const currentTheme = computed(() =>
        props.themes.find(theme => theme.id === currentLine.value.themeId)
    )

    const charIndex = ref(0)
    let interval = null

    function typeEffect() {
        clearInterval(interval)
        charIndex.value = 0
        interval = setInterval(() => {
            if (charIndex.value < currentText.value.length) {
                charIndex.value++
            } else {
                clearInterval(interval)
            }
        }, 30)
    }

    const showText = computed(() => 
        currentText.value.slice(0, charIndex.value)
    )

    function next() {
        //Si hay mas frases en el dialogo actual, avanza la frase
        if (textIndex.value < currentLine.value.texts.length - 1) {
            textIndex.value++
        } else {
            //Si no, avanza al siguiente paso y resetea textIndex
            textIndex.value = 0
            stepper.goToNext()
        }
        typeEffect()
    }

    function prev() {
        if (textIndex.value > 0) {
            textIndex.value--
        } else {
            textIndex.value = 0
            stepper.goToPrevious()
        }
        typeEffect()
    }

    const animationStatus = ref(false)

    function toggleAnimation() {
        animationStatus.value = !animationStatus.value
        if (animationStatus.value) typeEffect()
    }

    function playtextToSpeech(text) {
        speechSynthesis.cancel()
        resetSpeakingText()
        const textToSpeech = new SpeechSynthesisUtterance(text)
        textToSpeech.rate = 1
        textToSpeech.onboundary = onBoundary
        speechSynthesis.speak(textToSpeech)
    }

    const boundaryStart = shallowRef(0)
    const boundaryEnd = shallowRef(0)

    const textSegments = computed(() => {
        const fullText = currentText.value || ''
        const startIndex = Math.max(0, Math.min(boundaryStart.value, fullText.length))
        const endIndex = Math.max(startIndex, Math.min(boundaryEnd.value, fullText.length))
        return {
            leadingText: fullText.slice(0, startIndex),
            highlightedText: fullText.slice(startIndex, endIndex),
            trailingText: fullText.slice(endIndex),
        }
    })

    function onBoundary(event) {
        const { charIndex, charLength } = event
        const startIndex = charIndex
        let endIndex = charIndex
        if (typeof charLength === 'number' && charLength > 0) {
            endIndex = startIndex + charLength
        } else {
            const fullText = currentText.value || ''
            const remainingText = fullText.slice(startIndex)
            const firstWordMatch = remainingText.match(/^\S+/)
            endIndex = startIndex + (firstWordMatch ? firstWordMatch[0].length : 0)
        }
        boundaryStart.value = startIndex
        boundaryEnd.value = endIndex
    }

    function resetSpeakingText() {
        boundaryStart.value = 0
        boundaryEnd.value = 0
    }
    
    typeEffect()
</script>

<template>
    <main class="relative flex flex-col justify-end items-center min-h-screen">
        <div class="fixed inset-0 bg-cover bg-center -z-10" :style="{ backgroundImage: `url(${currentBackground?.image})`, filter: `blur(3px)` }"></div>
        <section class="relative flex">
            <img :src="currentCharacter.image" :alt="currentCharacter.name" class="fixed w-50 right-3 bottom-70 lg:w-100 lg:bottom-0" :class="currentLine.position">

            <div>
                <article id="characterName" class="border-4 rounded-xl w-fit mb-5 p-2" :style="{ backgroundColor: `${currentTheme.backgroundColor}`, borderColor: `${currentTheme.borderColor}` }">
                    <div class="text-xl">
                        <p class="font-semibold" :style="{ color: `${currentTheme.textColor}` }">{{ currentCharacter.name }}</p>
                    </div>
                </article>
                
                <article id="dialog" class="border-4 rounded-xl mb-10 p-2 w-97 lg:w-220 h-40" :style="{ backgroundColor: `${currentTheme.backgroundColor}`, borderColor: `${currentTheme.borderColor}` }">
                    <div v-if="animationStatus">
                        <p class="font-semibold" :style="{ color: `${currentTheme.textColor}` }">{{ showText }}</p>
                    </div>
                    <div v-else>
                        <p class="font-semibold" :style="{ color: `${currentTheme.textColor}` }">
                            <span>{{ textSegments.leadingText }}</span>
                            <span style="text-decoration: underline; font-weight: bold;">{{ textSegments.highlightedText }}</span>
                            <span>{{ textSegments.trailingText }}</span>
                        </p>
                    </div>
                </article>
            </div>

        </section>

        <div class="flex gap-4 items-center mb-10">
            <button @click="prev(); playtextToSpeech(currentText)" class="rounded-xl p-2 bg-red-400 transition-all duration-200 ease-in-out hover:bg-red-700 hover:cursor-pointer">
                Anterior
            </button>
            <button @click="next(); playtextToSpeech(currentText)" class="rounded-xl p-2 bg-red-400 transition-all duration-200 ease-in-out hover:bg-red-700 hover:cursor-pointer">
                Siguiente
            </button>
            <div>
                <input @click="toggleAnimation" type="checkbox" checked="on" id="type-animation" name="type-animation">
                <label for="type-animation">Desactivar animacion</label>
            </div>
        </div>
    </main>
</template>

<style scoped>

</style>