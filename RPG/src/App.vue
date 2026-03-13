<script setup>
import { ref } from 'vue';
import Scene from './components/Scene.vue';

// CONFIGURACIÓN DE ESTILOS (TEMA)
// Este objeto permite cambiar el aspecto de la interfaz sin tocar el código de Scene.vue
const themeConfig = {
  borderColor: 'border-amber-600',      
  bgColor: 'bg-black/90', 
  textColor: 'text-orange-100',        
  nameTagBg: 'bg-orange-950',        
  nameTagText: 'text-yellow-500',      
  btnBg: 'bg-orange-950',            
  btnHover: 'hover:bg-orange-900'          
};

const characters = [
  {
    id: 1,
    name: 'Propietario',
    image: '/images/1.png'
  },
  {
    id: 2,
    name: 'Comprador',
    image: '/images/2.png'
  },
  {
    id: 3,
    name: 'Campesino',
    image: '/images/3.png'
  }
];

const backgrounds = [
  {
    id: 1,
    image: '/images/casa.jpg',
    name: 'casa'
  },
  {
    id: 2,
    image: '/images/pueblo.jpg',
    name: 'pueblo'
  },
    {
    id: 3,
    image: '/images/tierra.jpeg',
    name: 'tierra'
  }
];

const dialogue = {
  id: 'intro-quest',
  defaultBackgroundId: 1,
  utterances: [
    {
      id: '1',
      characterId: 1,
      position: 'left',
      texts: [
          '¿Dónde estoy? este sitio me recuerda familiar...',
        'Espera, ahora me acuerdo, es mi casa.'
      ]
    },
    {
      id: '2',
      characterId: 2,
      position: 'right',
      texts: [
        'JAJAJAJAJ! Por fin llegaste, amigo!',
        'Te he estado buscando por mucho tiempo en este pueblo.'
      ],
      backgroundId: 2
    },
    {
      id: '3',
      characterId: 1,
      position: 'left',
      texts: [
        'Tú otra vez, que se te está perdiendo por mi pueblo?'
      ]
    },
    {
      id: '4',
      characterId: 2,
      position: 'right',
      backgroundId: 2,
      texts: [
        'Es porque en mi pueblo se nos está agotando los recursos.',
        'Necesitaba verte para pedirte papas y hortalizas'
      ]
      
    },
    {
      id: '5',
      characterId: 1,
      position: 'left',
      texts: [
        '¿Pero usted que se cree que a nosotros nos sobra?',
        'Lo siento amigo, pero aquí no hay nada.'
      ]
    },
    {
      id: '6',
      characterId: 3,
      position: 'center',
      backgroundId: 3,
      texts: [
        'Por favor les pido calma! Tengo papas y tomates para todos.',
        'Por sólo 50€ el kilo.'
      ]
    }
  ]
};

const showScene = ref(false);
const isLoading = ref(true);


 //pre-carga de imágenes
 
 // descarga todas las imágenes antes de empezar.
 
const preloadImages = async () => {
  // Juntamos todas las rutas de imágenes en un solo array
  const imageUrls = [
    ...characters.map(c => c.image),
    ...backgrounds.map(b => b.image)
  ];

  try {
    // Intentamos cargar todas las imágenes en paralelo
    await Promise.all(imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;// da error si falla archivo
      });
    }));
  } catch (err) {
    console.error('Error pre-loading images', err);
  } finally {
    // Pase lo que pase, quitamos el cargando y mostramos la escena
    isLoading.value = false;
    showScene.value = true;
  }
};

// Ejecutamos la carga al abrir la web
preloadImages();


  //GESTIÓN DE EVENTOS
  

// Se ejecuta cuando el componente Scene.vue avisa que ya no hay más diálogos

const handleFinish = () => {
  console.log('Dialogue finished!');
  showScene.value = false; // Ocultamos la escena para mostrar la pantalla final
};


// Para volver a empezar la aventura

const restart = () => {
  showScene.value = true;
};
</script>

<template>
  <main class="w-full h-full overflow-hidden bg-black text-white">
    <div v-if="isLoading" class="flex flex-col justify-center items-center h-screen bg-[#1a1a1a] text-white font-sans">
      <div class="border-4 border-solid border-[#333] border-t-[#d4af37] rounded-full w-10 h-10 animate-spin mb-5"></div>
      <p>Cargando Aventura...</p>
    </div>

    <Scene
      v-else-if="showScene"
      :characters="characters"
      :dialogue="dialogue"
      :backgrounds="backgrounds"
      :speed="30"
      :theme="themeConfig"
      @finish="handleFinish"
    />
 
    <div v-else class="bg-[url('/images/paisaje.png')] bg-cover bg-center h-screen flex flex-col justify-center items-center h-screen text-white font-sans">
      <div class="bg-black/90 text-[#f0e0d0] p-8 md:p-10 min-h-[100px] relative text-xl md:text-3xl leading-relaxed border-4 border-solid border-[#d4af37] [border-image:linear-gradient(to_bottom,#cf9e2e,#f9e1a0,#cf9e2e)_1] shadow-2xl"><h1 class="text-3xl font-bold mb-5">Aventura en Tinajo</h1></div>
      <button 
        @click="restart"
        class="bg-[#1a1107] text-[#ffd700] border-2 border-[#d4af37] px-6 py-2 cursor-pointer font-bold uppercase hover:bg-[#3d2a12] disabled:opacity-30 "
      >
        Reiniciar Diálogo
      </button>
    </div>
  </main>
</template>