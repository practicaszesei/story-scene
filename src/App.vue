<template>
  <div class="min-h-screen bg-black text-gray-100">
    <RouterView v-slot="{ Component, route }">
      <component
        :is="Component"
        :characters="characters"
        :dialogue="dialogue"
        :backgrounds="backgrounds"
        :speed="28"
        :start-active="route.path === '/escena'"
      />
    </RouterView>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';

// personajes
const characters = [
  { id: 1, name: 'Zeus', image: '/personajes/zeus.png' },
  { id: 2, name: 'Teseo', image: '/personajes/guerrero.png' },
  { id: 3, name: 'Eraín', image: '/personajes/eraín.png' },
];

// bgs
const backgrounds = [
  { id: 1, image: '/fondos/ruina.avif', name: 'Templo en Ruinas' },
  { id: 2, image: '/fondos/ruinas_paisaje.jpg', name: 'Ruinas con Vista' },
  { id: 3, image: '/fondos/lago.avif', name: 'Lago Sagrado' },
];

// dialogos
const dialogue = {
  id: 'dialogo-1',
  defaultBackgroundId: 1,
  utterances: [
    { id: 'u1', characterId: 2, texts: ['¿Quién osa caminar entre estas ruinas antiguas?', 'He viajado desde tierras lejanas buscando al dios del trueno.'], position: 'left', backgroundId: 1 },
    { id: 'u2', characterId: 1, texts: ['Mortal valiente... o insensato.', 'Es raro que un guerrero busque audiencia con Zeus.'], position: 'right' },
    { id: 'u3', characterId: 2, texts: ['Soy Teseo, el que venció al Minotauro.', 'Vengo a demostrar que soy digno de tu bendición.'], position: 'left' },
    { id: 'u4', characterId: 1, texts: ['La fama te precede, guerrero.', 'Pero el valor en batalla no garantiza la sabiduría divina.'], position: 'right', backgroundId: 2 },
    { id: 'u5', characterId: 3, texts: ['Viajero, he guardado estos templos por milenios.', 'Pocos han llegado hasta aquí con corazón puro.'], position: 'center' },
    { id: 'u6', characterId: 2, texts: ['¿Y quién eres tú, guardián?', 'Tu presencia es... diferente al resto de mortales.'], position: 'left' },
    { id: 'u7', characterId: 3, texts: ['Soy Eraín, custodio de las ruinas sagradas.', 'Ni mortal ni dios, camino entre ambos mundos.'], position: 'center', backgroundId: 3 },
    { id: 'u8', characterId: 1, texts: ['Eraín ha servido fielmente durante eras.', 'Su juicio es certero. ¿Qué ves en este guerrero?'], position: 'right' },
    { id: 'u9', characterId: 3, texts: ['Veo determinación, pero también duda.', 'Llevadlo al lago sagrado, allí se revelará su verdad.'], position: 'center' },
    { id: 'u10', characterId: 2, texts: ['¿El lago sagrado? He oído leyendas...', 'Se dice que muestra el alma de quien se refleja en él.'], position: 'left', backgroundId: 3 },
    { id: 'u11', characterId: 1, texts: ['Las leyendas no mienten, mortal.', 'Estas aguas reflejan lo que uno realmente es.'], position: 'right' },
    { id: 'u12', characterId: 2, texts: ['No temo enfrentar mi verdad.', 'He luchado contra monstruos, puedo enfrentar mis sombras.'], position: 'left' },
    { id: 'u13', characterId: 3, texts: ['El valor físico es solo el comienzo.', 'El lago demanda honestidad absoluta.'], position: 'center' },
    { id: 'u14', characterId: 2, texts: ['Veo... mi reflejo muestra más que mi rostro.', 'Veo mis victorias, pero también mis miedos ocultos.'], position: 'left', backgroundId: 2 },
    { id: 'u15', characterId: 1, texts: ['Bien. Reconocer las propias debilidades es señal de fortaleza.', 'Muchos héroes caen por orgullo ciego.'], position: 'right' },
    { id: 'u16', characterId: 3, texts: ['Has pasado la primera prueba, guerrero.', 'Pocos admiten sus temores ante un dios.'], position: 'center' },
    { id: 'u17', characterId: 2, texts: ['No busco poder ilimitado, gran Zeus.', 'Solo pido la sabiduría para proteger a mi pueblo.'], position: 'left', backgroundId: 1 },
    { id: 'u18', characterId: 1, texts: ['Una petición humilde de un guerrero famoso.', 'Eso me agrada, Teseo. Las ruinas resuenan con tu sinceridad.'], position: 'right' },
    { id: 'u19', characterId: 3, texts: ['Este templo ha presenciado mil súplicas de poder.', 'Pero rara vez escucha una petición de sabiduría.'], position: 'center' },
    { id: 'u20', characterId: 1, texts: ['Está decidido. Recibirás mi bendición, mortal.', 'No de fuerza bruta, sino de juicio justo.'], position: 'right', backgroundId: 3 },
    { id: 'u21', characterId: 2, texts: ['Señor del Olimpo, tu generosidad me honra.', 'Usaré este don con responsabilidad.'], position: 'left' },
    { id: 'u22', characterId: 3, texts: ['El lago te recuerda tu verdad, guerrero.', 'Vuelve cuando lo necesites, sus aguas nunca mienten.'], position: 'center' },
    { id: 'u23', characterId: 1, texts: ['Ve, Teseo. Tu destino te aguarda.', 'Y recuerda: el verdadero poder está en saber cuándo no usarlo.'], position: 'right', backgroundId: 2 },
    { id: 'u24', characterId: 2, texts: ['Gracias, Zeus. Y a ti también, Eraín.', 'Regresaré a mi hogar siendo un líder mejor.'], position: 'left' },
  ],
};
</script>
