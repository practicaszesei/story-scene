<template>
  <div
    class="relative w-full h-screen overflow-hidden flex sm:justify-center sm:items-center bg-black"
    @click.self="handleStart"
  >
    <!-- recuadro -->
    <div
      class="relative w-full h-full sm:h-[95vh] sm:max-w-screen-2xl bg-cover bg-center sm:rounded-3xl sm:overflow-hidden sm:border-2 shadow-2xl"
      :class="[theme.sceneBorder, theme.shadowColor]"
      :style="bgStyle"
    >
      <!-- overlay -->
      <div class="absolute inset-0 bg-linear-to-b from-black/30 to-black/70"></div>

      <!-- comenzar -->
      <div
        v-if="!started"
        class="absolute inset-0 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center text-center gap-4"
      >
        <div class="text-2xl font-bold tracking-[0.25em]" :class="theme.title.text">POMPEYA</div>
        <RouterLink
          to="/escena"
          class="text-sm font-semibold px-5 py-2 rounded-full border transition-colors shadow-lg"
          :class="[theme.title.bg, theme.title.hover, theme.title.border]"
          @click.prevent="handleStart"
        >
          COMENZAR
        </RouterLink>
        
        <!-- opciones inicio -->
        <div class="flex gap-3 mt-2">
          <!-- btn anim -->
          <button
            class="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors border-2"
            :class="animate ? [theme.activeButton.bg, theme.activeButton.hover, theme.activeButton.border] : [theme.inactiveButton.bg, theme.inactiveButton.hover, theme.inactiveButton.border]"
            @click.stop="animate = !animate"
            :title="animate ? 'anim on' : 'anim off'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </button>
          
          <!-- btn audio -->
          <button
            class="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors border-2"
            :class="audioEnabled ? [theme.activeButton.bg, theme.activeButton.hover, theme.activeButton.border] : [theme.inactiveButton.bg, theme.inactiveButton.hover, theme.inactiveButton.border]"
            @click.stop="audioEnabled = !audioEnabled"
            :title="audioEnabled ? 'audio on' : 'audio off'"
          >
            <svg v-if="!audioEnabled" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          </button>
        </div>
      </div>

      <!-- escena activa -->
      <div v-else class="relative h-full w-full flex flex-col justify-end px-4 sm:px-10 py-8 sm:py-12 gap-6">

        <!-- personaje -->
        <img
          v-if="character"
          :key="character.id + '-' + stepCurrent"
          :src="character.image"
          :alt="character.name"
          :class="characterClasses"
          loading="eager"
          decoding="async"
        />

        <!-- caja dialogo -->
        <div class="relative w-full sm:max-w-2xl sm:mx-auto rounded-2xl p-5 sm:p-7 backdrop-blur-sm space-y-3 border-2"
          :class="[theme.dialogBox.bg, theme.dialogBox.border, theme.dialogBox.shadow]">
          <!-- nombre -->
          <span class="absolute -top-3.5 left-6 px-4 py-1.5 rounded-lg border-2 text-xs sm:text-sm font-bold uppercase shadow-lg"
            :class="[theme.nameTag.bg, theme.nameTag.border, theme.nameTag.text]">
            {{ character?.name ?? '' }}
          </span>
          
          <!-- nav -->
          <div class="flex items-start justify-end gap-2">
            <div class="flex gap-2">
              <button
                :disabled="typing"
                :class="navBtnClass"
                @click.stop="handlePrev"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button
                :disabled="typing"
                :class="navBtnClass"
                @click.stop="handleNext"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
          
          <!-- texto typewriter + resaltado -->
          <div ref="textBox" class="text-sm sm:text-base leading-relaxed h-20 sm:h-24 overflow-hidden relative">
            <!-- texto base -->
            <div class="absolute inset-0">{{ displayed }}</div>
            
            <!-- capa resaltado -->
            <div v-if="audioEnabled && words.length" class="absolute inset-0">
              <span
                v-for="(word, index) in words"
                :key="index"
                :class="{ 'bg-transparent text-transparent': index !== highlightedWordIndex }"
                :style="index === highlightedWordIndex ? highlightStyle : {}"
              >
                {{ word }}{{ index < words.length - 1 ? ' ' : '' }}
              </span>
            </div>
          </div>
        </div>

        <div class="absolute top-4 left-4 flex gap-2">
          <!-- reset -->
          <button
            class="w-11 h-11 rounded-full flex items-center justify-center shadow transition-colors border"
            :class="[theme.buttons.bg, theme.buttons.hover, theme.buttons.border]"
            @click.stop="handleReset"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <!-- toggle anim -->
          <button
            class="w-11 h-11 rounded-full flex items-center justify-center shadow transition-colors border"
            :class="animate ? [theme.activeButton.bg, theme.activeButton.hover, theme.activeButton.border] : [theme.inactiveButton.bg, theme.inactiveButton.hover, theme.inactiveButton.border]"
            @click.stop="handleToggleAnim"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </button>
        </div>

        <!-- btn audio -->
        <div class="absolute top-4 right-4">
          <button
            class="w-11 h-11 rounded-full flex items-center justify-center shadow transition-colors border"
            :class="audioEnabled ? [theme.activeButton.bg, theme.activeButton.hover, theme.activeButton.border] : [theme.buttons.bg, theme.buttons.hover, theme.buttons.border]"
            @click.stop="handleToggleAudio"
          >
            <svg v-if="!audioEnabled" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSpeechSynthesis } from '@vueuse/core';

// props
const props = defineProps({
  characters: { type: Array, required: true },
  dialogue: { type: Object, required: true },
  backgrounds: { type: Array, required: true },
  speed: { type: Number, default: 24 },
  startActive: { type: Boolean, default: false },
  theme: {
    type: Object,
    default: () => ({
      title: {
        text: 'text-amber-100',
        bg: 'bg-amber-700/80',
        hover: 'hover:bg-amber-600/90',
        border: 'border-amber-600/60',
      },
      dialogBox: {
        bg: 'bg-gray-950/85',
        border: 'border-amber-700/60',
        shadow: 'shadow-[0_0_25px_rgba(251,191,36,0.3)]',
      },
      nameTag: {
        bg: 'bg-amber-950/90',
        text: 'text-amber-100',
        border: 'border-amber-700/60',
      },
      buttons: {
        bg: 'bg-gray-900/80',
        hover: 'hover:bg-amber-900/80',
        border: 'border-amber-700/30',
      },
      activeButton: {
        bg: 'bg-amber-600',
        hover: 'hover:bg-amber-500',
        border: 'border-amber-500/60',
      },
      inactiveButton: {
        bg: 'bg-red-600',
        hover: 'hover:bg-red-500',
        border: 'border-red-500/60',
      },
      sceneBorder: 'border-amber-800/60',
      shadowColor: 'shadow-amber-900/30',
    }),
  },
});

const router = useRouter();
const route = useRoute();

// stepper
const stepCurrent = ref(0);
const stepPage = ref(0);
const stepLength = computed(() => props.dialogue.utterances.length);

const stepNext = () => {
  if (stepCurrent.value < stepLength.value - 1) {
    stepCurrent.value++;
    stepPage.value = 0;
  }
};
const stepPrev = () => {
  if (stepCurrent.value > 0) {
    stepCurrent.value--;
    stepPage.value = 0;
  }
};
const stepNextPage = (maxPages) => {
  if (stepPage.value < maxPages - 1) { stepPage.value++; return true; }
  return false;
};
const stepPrevPage = () => {
  if (stepPage.value > 0) { stepPage.value--; return true; }
  return false;
};

// typewriter
const displayed = ref('');
const typing = ref(false);
const animate = ref(true);
let twTimer;

// speech
const audioEnabled = ref(false);
const highlightedWordIndex = ref(-1);
const words = ref([]);
const currentSpeechText = ref('');

// estilo resaltado
const highlightStyle = computed(() => ({
  backgroundColor: '#fbbf24',
  color: '#000000',
  fontWeight: 'bold',
  padding: '0 2px',
  borderRadius: '4px',
  boxShadow: '0 0 10px rgba(251, 191, 36, 0.7), 0 2px 4px rgba(0, 0, 0, 0.3)',
  border: '1px solid #f59e0b',
  transition: 'all 0.15s ease-in-out',
  display: 'inline',
  transform: 'scale(1.05)',
  zIndex: 10
}));

// onBoundary
function onBoundary(event: SpeechSynthesisEvent) {
  const { charIndex } = event;
  const fullText = currentSpeechText.value || '';
  const textBefore = fullText.substring(0, charIndex);
  const wordsBefore = textBefore.split(/\s+/).filter(w => w.length > 0);
  highlightedWordIndex.value = wordsBefore.length;
}

// init speech
const speech = useSpeechSynthesis(currentSpeechText, {
  lang: 'es-ES',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  onBoundary,
});

// reset al terminar
watch(() => speech.status.value, (status) => {
  if (status === 'end') highlightedWordIndex.value = -1;
});

// reinicio en cambio texto
watch(currentSpeechText, (newText) => {
  if (newText && audioEnabled.value) {
    if (speech.isPlaying.value) speech.stop();
    setTimeout(() => {
      if (audioEnabled.value && newText) speech.speak();
    }, 100);
  }
});

// typewriter
const twClear = () => {
  if (twTimer) clearTimeout(twTimer);
  twTimer = undefined;
};

const twRun = (text, speed) => {
  twClear();
  const ms = speed ?? props.speed;
  if (!animate.value) {
    displayed.value = text;
    typing.value = false;
    return;
  }
  displayed.value = '';
  typing.value = true;
  let i = 0;
  const step = () => {
    displayed.value = text.slice(0, i);
    i++;
    if (i <= text.length) twTimer = setTimeout(step, ms);
    else typing.value = false;
  };
  step();
};

const twToggle = (text, speed) => {
  animate.value = !animate.value;
  if (text) twRun(text, speed);
};

onBeforeUnmount(twClear);

// datos derivados
const started = ref(props.startActive);

const charMap = computed(() => {
  const m = new Map();
  props.characters.forEach(c => m.set(c.id, c));
  return m;
});
const bgMap = computed(() => {
  const m = new Map();
  props.backgrounds.forEach(b => m.set(b.id, b));
  return m;
});

const utteranceData = computed(() => props.dialogue.utterances[stepCurrent.value] ?? null);
const character = computed(() => utteranceData.value ? charMap.value.get(utteranceData.value.characterId) ?? null : null);
const currentTexts = computed(() => utteranceData.value?.texts ?? ['']);
const currentText = computed(() => currentTexts.value[stepPage.value] ?? '');

const activeBg = computed(() => {
  const bgId = utteranceData.value?.backgroundId ?? props.dialogue.defaultBackgroundId;
  return bgId != null ? bgMap.value.get(bgId) ?? null : null;
});

const bgStyle = computed(() => {
  const url = activeBg.value?.image ?? '';
  if (!url) return { backgroundColor: '#000' };
  return { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.75)), url(${url})` };
});

const characterClasses = computed(() => {
  const pos = utteranceData.value?.position ?? 'center';
  const base = 'absolute w-64 h-64 sm:w-[28rem] sm:h-[28rem] object-contain drop-shadow-2xl bottom-44 sm:bottom-32 transition-all duration-300';
  const positions = {
    left: 'left-4 sm:left-10',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4 sm:right-10',
  };
  return `${base} ${positions[pos] ?? positions.center}`;
});

const navBtnClass = computed(() => [
  'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow transition-all border',
  typing.value
    ? 'bg-gray-900/40 opacity-30 cursor-not-allowed border-gray-800'
    : [props.theme.buttons.bg, props.theme.buttons.hover, props.theme.buttons.border].join(' '),
]);

// handlers
const runText = () => {
  if (!started.value) return;
  twRun(currentText.value, props.speed);
  words.value = currentText.value.split(/(\s+)/).filter(word => word.trim().length > 0);
  currentSpeechText.value = currentText.value;
};

const handleStart = () => {
  if (started.value) return;
  started.value = true;
  if (route.path !== '/escena') router.push('/escena');
  runText();
};

const handleNext = () => {
  if (typing.value) return;
  
  const isLastStep = stepCurrent.value === stepLength.value - 1;
  const isLastPage = stepPage.value === currentTexts.value.length - 1;
  
  if (isLastStep && isLastPage) {
    speech.stop();
    started.value = false;
    stepCurrent.value = 0;
    stepPage.value = 0;
    return;
  }
  
  const hasMore = stepNextPage(currentTexts.value.length);
  if (!hasMore) stepNext();
  runText();
};

const handlePrev = () => {
  if (typing.value) return;
  const wentBack = stepPrevPage();
  if (!wentBack) stepPrev();
  runText();
};

const handleToggleAnim = () => {
  twToggle(currentText.value, props.speed);
};

const handleReset = () => {
  if (typing.value) return;
  speech.stop();
  stepCurrent.value = 0;
  stepPage.value = 0;
  runText();
};

const handleToggleAudio = () => {
  audioEnabled.value = !audioEnabled.value;
  if (!audioEnabled.value) {
    speech.stop();
    highlightedWordIndex.value = -1;
  } else {
    currentSpeechText.value = currentText.value;
  }
};

// precarga
const preloadImages = () => {
  props.characters.forEach(c => { if (c.image) { const i = new Image(); i.src = c.image; } });
  props.backgrounds.forEach(b => { if (b.image) { const i = new Image(); i.src = b.image; } });
};

// auto-scroll
const textBox = ref(null);
watch(displayed, () => {
  if (textBox.value) textBox.value.scrollTop = textBox.value.scrollHeight;
});

// init
onMounted(() => {
  preloadImages();
  if (started.value) runText();
});

// cleanup
onBeforeUnmount(() => {
  speech.stop();
  twClear();
});
</script>