<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStepper, useSpeechSynthesis } from '@vueuse/core';

const props = defineProps({
  characters: { type: Array, required: true },
  dialogue: { type: Object, required: true },
  backgrounds: { type: Array, required: true },
  speed: { type: Number, default: 30 },
  animate: { type: Boolean, default: true },
  //Prop para la configuración del tema
  theme: {
    type: Object,
    default: () => ({
      borderColor: 'border-amber-600',
      bgColor: 'bg-gray-900',
      textColor: 'text-white',
      nameTagBg: 'bg-black',
      nameTagText: 'text-yellow-400',
      btnBg: 'bg-black',
      btnHover: 'hover:bg-gray-800'
    })
  }
});

const emit = defineEmits(['finish']);

// Inicia el Stepper: Controla en qué frase del guion estamos
const stepper = useStepper(props.dialogue.utterances);
const textPageIndex = ref(0);
const displayedText = ref('');
const isTyping = ref(false);
let timer = null;

//Estado reactivo para el resaltado de palabras
const boundaryStart = ref(0); 
const boundaryEnd = ref(0);   
const textToSpeak = ref('');  
const speechVoice = ref(null); 
const speechPitch = ref(1);    
const speechRate = ref(1);     

//Configuración de useSpeechSynthesis de VueUse 
const { speak, stop } = useSpeechSynthesis(textToSpeak, {
  lang: 'es-ES',
  voice: speechVoice,
  pitch: speechPitch,
  rate: speechRate,
  // El evento onBoundary se dispara cada vez que el navegador empieza una palabra
  onBoundary: (event) => {
    boundaryStart.value = event.charIndex; // Guardamos dónde empieza la palabra
    const rest = textToSpeak.value.slice(event.charIndex);
    const match = rest.match(/^\S+/); // Buscamos el final de la palabra actual (hasta el espacio)
    boundaryEnd.value = event.charIndex + (event.charLength || (match ? match[0].length : 0));
  },
  // Al terminar de hablar, reseteamos los índices de resaltado
  onEnd: () => {
    boundaryStart.value = 0;
    boundaryEnd.value = 0;
  }
});

//obtiene todos los datos de la frase actual
const currentUtterance = computed(() => props.dialogue.utterances[stepper.index.value]);

//objeto del personaje que está hablando ahora mismo
const currentCharacter = computed(() => {
  const charId = currentUtterance.value?.characterId;
  return props.characters.find(c => c.id === charId);
});

//busca la imagen de fondo actual
const currentBackground = computed(() => {
  const bgId = currentUtterance.value?.backgroundId ?? props.dialogue.defaultBackgroundId;
  return props.backgrounds.find(b => b.id === bgId);
});

// Obtiene el texto completo que debe mostrarse en la página actual
const currentFullText = computed(() => {
  return currentUtterance.value?.texts[textPageIndex.value] || '';
});


//lógica funcionamiento
// Inicia el efecto de escribir letra a letra
const startTyping = () => {
  if (timer) clearInterval(timer);
  
  displayedText.value = '';
  isTyping.value = true;
  let charIndex = 0;

  //añadir
  speakText(currentFullText.value);

  if (!props.animate) {
    displayedText.value = currentFullText.value;
    isTyping.value = false;
    return;
  }

  // Calculamos la velocidad del texto para que coincida con la voz del personaje
  let typingSpeed = props.speed;
  if (currentCharacter.value) {
    switch (currentCharacter.value.id) {
      case 1: typingSpeed = 80; break; // Propietario (Habla lento)
      case 2: typingSpeed = 55; break; // Comprador (Habla rápido)
      case 3: typingSpeed = 55; break; // Campesino (Habla normal)
    }
  }

  timer = setInterval(() => {
    //si quedan letras por escribir
    if (charIndex < currentFullText.value.length) {
      //añade la letra actual a lo que se ve en pantalla
      displayedText.value += currentFullText.value[charIndex];
      charIndex++;//pasa a la siguiente letra

      //y si no quedan letras se apaga el reloj y se avisa al sistema
    } else {
      clearInterval(timer);
      isTyping.value = false;
    }
  }, typingSpeed);
};

//maneja el botón siguiente o el click en la pantalla
const handleNext = () => {
  // Si está escribiendo, el primer click muestra todo el texto de golpe
  if (isTyping.value) {
    clearInterval(timer);
    displayedText.value = currentFullText.value;
    isTyping.value = false;
    
    stop();

    return;
  }

 //siguiente página del mismo personaje
  if (textPageIndex.value < currentUtterance.value.texts.length - 1) {
    textPageIndex.value++;
    startTyping();
  } 
//cambio de personaje, siguiente frase del guión
  else if (stepper.index.value < props.dialogue.utterances.length - 1) {
    stepper.index.value++; 
    textPageIndex.value = 0;
    startTyping();
  } 
  // Si es el final del diálogo
  else {
    // --- CAMBIO: Usamos stop() de VueUse ---
    stop();
    emit('finish');
  }
};

// Retrocede a la frase o página anterior
const handleBack = () => {
  if (textPageIndex.value > 0) {
    textPageIndex.value--;
    startTyping();
  } else if (stepper.index.value > 0) {
    stepper.index.value--; 
    textPageIndex.value = currentUtterance.value.texts.length - 1;
    startTyping();
  }
};

// Reiniciar el texto si el índice del stepper cambia por cualquier motivo
watch(() => stepper.index.value, () => {
  textPageIndex.value = 0;
  startTyping();
});

onMounted(() => {
  startTyping();
// Esto detecta cuando las voces terminan de cargar en el navegador
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
});

//Función para que el navegador hable usando el composable de VueUse
const speakText = (text) => {
  stop(); // Paramos cualquier audio anterior
  boundaryStart.value = 0; // Limpiamos resaltado
  boundaryEnd.value = 0;
  textToSpeak.value = text; // Asignamos el nuevo texto para que useSpeechSynthesis lo vea
  
  const voices = window.speechSynthesis.getVoices();
  
  // Buscamos la voz masculina 
  const vozMasculina = voices.find(v => 
    v.lang.includes('es') && 
    (v.name.toLowerCase().includes('david') || 
     v.name.toLowerCase().includes('pablo') || 
     v.name.toLowerCase().includes('jorge') || 
     v.name.toLowerCase().includes('google español') || 
     v.name.toLowerCase().includes('male'))
  );

  if (vozMasculina) {
    speechVoice.value = vozMasculina; // Guardamos la voz en la ref que usa el composable
  }

  // Configuramos pitch y rate en las refs del composable según el personaje 
  if (currentCharacter.value) {
    switch (currentCharacter.value.id) {
      case 1: // PROPIETARIO 
        speechPitch.value = 0.1; 
        speechRate.value = 0.7;  
        break;

      case 2: // COMPRADOR 
        speechPitch.value = 1.4; 
        speechRate.value = 1.3;   
        break;

      case 3: // CAMPESINO
        speechPitch.value = 0.9; 
        speechRate.value = 1.0;  
        break;
      default:
        speechPitch.value = 1;
        speechRate.value = 1;
    }
  }

  speak(); // Iniciamos el habla
};
</script>

<template>
  <div 
    v-if="currentUtterance"
    class="w-full h-screen bg-cover bg-center relative overflow-hidden font-sans bg-black flex flex-col justify-end transition-all duration-500"
    :style="{ backgroundImage: `url(${currentBackground?.image})` }"
  >
    <div class="absolute inset-0 bg-black/30 pointer-events-none"></div>

    <div 
      class="grow flex items-end pointer-events-none relative z-10 transition-all duration-500 px-10 md:px-20"
      :class="{
        'justify-start': currentUtterance.position === 'left',
        'justify-center': currentUtterance.position === 'center' || !currentUtterance.position,
        'justify-end': currentUtterance.position === 'right'
      }"
    >
      <img
        v-if="currentCharacter"
        :key="currentCharacter.id"
        :src="currentCharacter.image"
        :alt="currentCharacter.name"
        data-test="character-image"
        class="h-auto max-h-[45vh] md:max-h-[50vh] lg:max-h-[55vh] w-auto max-w-[85%] object-contain transition-all duration-500 drop-shadow-2xl"
        :class="{ 'brightness-110 scale-105': isTyping, 'brightness-90': !isTyping }"
      />
    </div>

    <div class="p-6 md:p-12 relative z-20 cursor-pointer" @click="handleNext" data-test="dialogue-container">
      
      <div 
        class="p-8 md:p-10 min-h-[180px] relative text-xl md:text-3xl leading-relaxed border-4 border-solid shadow-2xl"
        :class="[theme.bgColor, theme.textColor, theme.borderColor]"
      >
        
        <div 
          v-if="currentCharacter"
          data-test="character-name"
          class="absolute -top-7 left-10 px-6 py-2 font-bold border-4 border-solid text-lg uppercase tracking-[0.2em]"
          :class="[theme.nameTagBg, theme.nameTagText, theme.borderColor]"
        >
          {{ currentCharacter.name }}
        </div>

        <!--  Lógica de resaltado en el template -->
        <!-- Dividimos el texto en tres partes: lo anterior a la palabra, la palabra resaltada (solo color), y lo posterior -->
        <div class="whitespace-pre-wrap" data-test="dialogue-text">
          <span>{{ displayedText.slice(0, boundaryStart) }}</span
          ><span :class="{ 'text-yellow-400 font-bold transition-colors duration-200': displayedText.slice(boundaryStart, boundaryEnd).length > 0 }">{{ displayedText.slice(boundaryStart, boundaryEnd) }}</span
          ><span>{{ displayedText.slice(boundaryEnd) }}</span>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <button 
          @click.stop="handleBack" 
          :disabled="stepper.index.value === 0 && textPageIndex === 0"
          class="px-6 py-2 cursor-pointer font-bold uppercase border-2 disabled:opacity-50 transition-colors"
          :class="[theme.btnBg, theme.nameTagText, theme.borderColor, theme.btnHover]"
        >
          Anterior
        </button>
        <button 
          @click.stop="handleNext"
          class="px-6 py-2 cursor-pointer font-bold uppercase border-2 transition-colors"
          :class="[theme.btnBg, theme.nameTagText, theme.borderColor, theme.btnHover]"
        >
          {{ isTyping ? 'Saltar' : (stepper.index.value === dialogue.utterances.length - 1 && textPageIndex === currentUtterance.texts.length - 1 ? 'Terminar' : 'Siguiente') }}
        </button>
      </div>
    </div>
  </div>
</template>