export type TourismSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export type TourismFaq = {
  question: string;
  answer: string;
};

export const TOURISM_GUIDE_PATH = "/guia";

export function getTourismGuideMeta() {
  return {
    title: "Qué hacer en San Clemente",
    description:
      "Guía turística de San Clemente, Manabí: playas, actividades, cómo llegar, mejor época y dónde hospedarse en la costa ecuatoriana.",
  };
}

export function getTourismGuideSections(): TourismSection[] {
  return [
    {
      id: "destino",
      title: "San Clemente, costa de Manabí",
      paragraphs: [
        "San Clemente es uno de los destinos playeros más visitados de Manabí para escapadas en familia o en grupo. Brisa constante, playas amplias y un entorno residencial ideal para alojamientos vacacionales.",
        "MS Vacations gestiona casas con piscina en San Clemente y alojamientos en Portoviejo. La zona combina tranquilidad costera con acceso rápido a Manta y Portoviejo en vehículo.",
      ],
    },
    {
      id: "playas",
      title: "Playas y naturaleza",
      paragraphs: ["En San Clemente y alrededores puedes disfrutar de:"],
      list: [
        "Playas amplias, aptas para caminar, tomar el sol y baño en el mar.",
        "Atardeceres sobre el Pacífico y paseos por la orilla al amanecer, cuando la marea lo permite.",
        "Avistamiento de aves costeras y el paisaje de mangle y esteros propio de la región.",
        "Temporada de ballenas jorobadas en la costa ecuatoriana (aprox. junio–septiembre): desde Manabí se organizan salidas hacia puntos de avistamiento; conviene reservar con anticipación en temporada alta.",
      ],
    },
    {
      id: "actividades",
      title: "Qué hacer durante tu estancia",
      list: [
        "Días de playa en grupo: nuestras casas están pensadas para familias y reuniones de hasta 18–21 huéspedes.",
        "Piscina privada en la mayoría de alojamientos — adecuada para niños y tardes sin salir de casa.",
        "Mariscos y pescado fresco en locales de San Clemente y pueblos cercanos.",
        "Excursión de un día a Manta (compras, malecón, hospital, aeropuerto) o a Crucita y otras playas vecinas.",
        "Deportes acuáticos y paseos en lancha según temporada y operadores locales — consulta al llegar.",
        "Descanso en terrazas, zonas exteriores y espacios compartidos de cada propiedad.",
      ],
    },
    {
      id: "como-llegar",
      title: "Cómo llegar",
      paragraphs: [
        "La forma más cómoda es en vehículo propio o taxi desde Manta (aprox. 25–40 minutos según tráfico y punto de partida) o desde Portoviejo (aprox. 40–50 minutos).",
        "Si vienes en avión, el aeropuerto de Manta (Eloy Alfaro) es el más cercano. Desde Quito o Guayaquil hay vuelos regulares; también puedes llegar por carretera en bus o auto.",
        "La ruta suele tomar la vía hacia la costa de Sucre / San Clemente. Te recomendamos llegar de día la primera vez y usar Google Maps hasta el punto de encuentro que confirmemos al reservar.",
      ],
    },
    {
      id: "cuando-ir",
      title: "Mejor época para visitar",
      paragraphs: [
        "La costa de Manabí es visitable todo el año. Diciembre a abril suele ser más seco y soleado; de mayo a noviembre puede haber más nublado y lloviznas (temporada fresca), pero las playas siguen siendo disfrutables.",
        "Semana Santa, feriados largos y vacaciones escolares concentran demanda. Si viajas en esas fechas, reserva con varias semanas de antelación.",
      ],
    },
    {
      id: "consejos",
      title: "Consejos prácticos",
      list: [
        "Protector solar, gorra y repelente: el sol en la costa es fuerte incluso con nubes.",
        "Efectivo para pueblos pequeños; hay cajeros en Manta y en centros más grandes.",
        "Compra básica antes de llegar si viajas en grupo grande (agua, hielo, desayunos).",
        "Respeta horarios de silencio en la casa y las reglas de cada alojamiento (no fumar en interiores, capacidad máxima de huéspedes).",
        "Contrata seguro de viaje si vienes del exterior; MS Vacations no sustituye cobertura médica personal.",
      ],
    },
  ];
}

export function getTourismGuideFaqs(): TourismFaq[] {
  return [
    {
      question: "¿Dónde están ubicadas las casas de playa?",
      answer:
        "Nuestras viviendas vacacionales se encuentran en San Clemente, en la costa de Manabí. La ubicación exacta se comunica al confirmar la reserva.",
    },
    {
      question: "¿Necesito carro durante la estancia?",
      answer:
        "Es muy recomendable. Hay taxis y motos en la zona, pero un carro facilita compras, emergencias y excursiones a Manta o playas cercanas.",
    },
    {
      question: "¿Hay supermercados cerca?",
      answer:
        "En San Clemente hay tiendas de barrio; para surtido amplio lo habitual es ir a Manta o Portoviejo. Muchos huéspedes hacen una compra grande al llegar.",
    },
    {
      question: "¿Puedo reservar solo fin de semana?",
      answer:
        "Sí, con entrada viernes o sábado la estancia mínima es de 2 noches. Con entrada de lunes a jueves o domingo puedes reservar una sola noche, según disponibilidad en el calendario.",
    },
  ];
}
