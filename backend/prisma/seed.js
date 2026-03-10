const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cetrip.com' },
    update: {},
    create: {
      email: 'admin@cetrip.com',
      password: hashedPassword,
      name: 'Administrador CETRIP',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Usuario admin creado:', admin.email);

  // ─── HOME ───────────────────────────────────────────────────────────────────
  const sectionHero = await prisma.section.upsert({
    where: { slug: 'home-hero' },
    update: {},
    create: {
      slug: 'home-hero',
      title: 'Hero Principal',
      description: 'Bloque principal de bienvenida de la página de inicio',
      page: 'home',
      order: 1,
      isActive: true,
    },
  });

  await prisma.block.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: sectionHero.id,
        type: 'HERO',
        title: 'Centro de Rehabilitación Infantil',
        subtitle: 'Acompañamos el desarrollo de cada niño con amor, dedicación y profesionalismo',
        content:
          'En CETRIP trabajamos con un equipo interdisciplinario para brindar atención integral a niños y niñas con necesidades especiales de desarrollo.',
        imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1200',
        linkUrl: '/admision',
        linkText: 'Solicitar turno',
        order: 1,
        isActive: true,
      },
    ],
  });

  const sectionHomeInfo = await prisma.section.upsert({
    where: { slug: 'home-info' },
    update: {},
    create: {
      slug: 'home-info',
      title: '¿Por qué elegirnos?',
      description: 'Destacados institucionales en la página de inicio',
      page: 'home',
      order: 2,
      isActive: true,
    },
  });

  await prisma.block.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: sectionHomeInfo.id,
        type: 'CARD',
        title: 'Equipo Especializado',
        content:
          'Contamos con profesionales en kinesiología, fonoaudiología, terapia ocupacional, psicología y psicopedagogía.',
        imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
        order: 1,
        isActive: true,
      },
      {
        sectionId: sectionHomeInfo.id,
        type: 'CARD',
        title: 'Atención Integral',
        content:
          'Abordaje interdisciplinario centrado en la familia, adaptado a las necesidades únicas de cada niño.',
        imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400',
        order: 2,
        isActive: true,
      },
      {
        sectionId: sectionHomeInfo.id,
        type: 'CARD',
        title: 'Trayectoria',
        content:
          'Más de 15 años acompañando familias y contribuyendo al desarrollo pleno de cientos de niños.',
        imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
        order: 3,
        isActive: true,
      },
    ],
  });

  // ─── QUIÉNES SOMOS ───────────────────────────────────────────────────────────
  const sectionBienvenida = await prisma.section.upsert({
    where: { slug: 'home-bienvenida' },
    update: {},
    create: {
      slug: 'home-bienvenida',
      title: 'Bienvenidos a CETRIP',
      description: 'Presentación institucional en la página de inicio',
      page: 'home',
      order: 2,
      isActive: true,
    },
  });

  await prisma.block.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: sectionBienvenida.id,
        type: 'TEXT',
        content:
          'En CETRIP acompañamos el desarrollo de niños, niñas y adolescentes a través de un abordaje interdisciplinario centrado en la persona y su entorno. Nuestro objetivo es favorecer la participación, el aprendizaje, la comunicación y el bienestar emocional, trabajando de manera articulada con las familias y las instituciones educativas.',
        order: 1,
        isActive: true,
      },
      {
        sectionId: sectionBienvenida.id,
        type: 'TEXT',
        content:
          'Nuestro equipo está conformado por profesionales especializados en distintas áreas del desarrollo infantil, que trabajan de manera coordinada para ofrecer evaluaciones, tratamientos y acompañamientos adaptados a las necesidades de cada persona.',
        order: 2,
        isActive: true,
      },
      {
        sectionId: sectionBienvenida.id,
        type: 'TEXT',
        content:
          'En CETRIP creemos en la importancia del trabajo conjunto entre profesionales, familias y escuela para favorecer el desarrollo integral y la inclusión en la vida cotidiana.',
        order: 3,
        isActive: true,
      },
    ],
  });

  const sectionQuienes = await prisma.section.upsert({
    where: { slug: 'quienes-somos-principal' },
    update: {},
    create: {
      slug: 'quienes-somos-principal',
      title: 'Nuestra Historia',
      description: 'Historia e identidad institucional',
      page: 'quienes-somos',
      order: 1,
      isActive: true,
    },
  });

  await prisma.block.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: sectionQuienes.id,
        type: 'TEXT',
        title: 'Quiénes Somos',
        content:
          'CETRIP nació con la misión de brindar atención especializada en rehabilitación infantil, integrando a las familias como parte fundamental del proceso terapéutico. Nuestro enfoque es biopsicosocial, reconociendo a cada niño como un ser único con potencial para desarrollarse.',
        order: 1,
        isActive: true,
      },
      {
        sectionId: sectionQuienes.id,
        type: 'IMAGE',
        title: 'Nuestro equipo',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
        order: 2,
        isActive: true,
      },
      {
        sectionId: sectionQuienes.id,
        type: 'TEXT',
        title: 'Misión',
        content:
          'Contribuir al desarrollo integral de niños y niñas con discapacidad o retraso madurativo, brindando servicios de rehabilitación de calidad, con enfoque familiar y comunitario.',
        order: 3,
        isActive: true,
      },
      {
        sectionId: sectionQuienes.id,
        type: 'TEXT',
        title: 'Visión',
        content:
          'Ser referentes en rehabilitación infantil de la región, innovando continuamente en metodologías terapéuticas y promoviendo la inclusión plena de cada niño en su comunidad.',
        order: 4,
        isActive: true,
      },
    ],
  });

  // ─── ADMISIÓN ────────────────────────────────────────────────────────────────
  const sectionAdmision = await prisma.section.upsert({
    where: { slug: 'admision-proceso' },
    update: {},
    create: {
      slug: 'admision-proceso',
      title: 'Proceso de Admisión',
      description: 'Información sobre cómo ingresar al centro',
      page: 'admision',
      order: 1,
      isActive: true,
    },
  });

  await prisma.block.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: sectionAdmision.id,
        type: 'TEXT',
        title: '¿Cómo iniciar el proceso?',
        content:
          'El proceso de admisión comienza con una entrevista inicial sin costo, donde evaluamos las necesidades del niño y orientamos a la familia sobre el abordaje más adecuado. Luego se realiza una evaluación interdisciplinaria completa para diseñar un plan terapéutico personalizado.',
        order: 1,
        isActive: true,
      },
      {
        sectionId: sectionAdmision.id,
        type: 'CARD',
        title: '1. Primer contacto',
        content: 'Comunicarse por teléfono, WhatsApp o mail para coordinar una entrevista de orientación familiar.',
        order: 2,
        isActive: true,
      },
      {
        sectionId: sectionAdmision.id,
        type: 'CARD',
        title: '2. Entrevista inicial',
        content: 'Reunión con nuestra coordinadora para conocer la situación del niño y responder sus preguntas.',
        order: 3,
        isActive: true,
      },
      {
        sectionId: sectionAdmision.id,
        type: 'CARD',
        title: '3. Evaluación',
        content: 'Evaluación completa por los profesionales de las áreas que correspondan al perfil del niño.',
        order: 4,
        isActive: true,
      },
      {
        sectionId: sectionAdmision.id,
        type: 'CARD',
        title: '4. Plan de trabajo',
        content: 'Diseño del plan terapéutico individualizado y comienzo del tratamiento.',
        order: 5,
        isActive: true,
      },
    ],
  });

  // ─── SERVICIOS ───────────────────────────────────────────────────────────────
  const sectionServicios = await prisma.section.upsert({
    where: { slug: 'servicios-lista' },
    update: {},
    create: {
      slug: 'servicios-lista',
      title: 'Nuestros Servicios',
      description: 'Listado de servicios terapéuticos disponibles',
      page: 'servicios',
      order: 1,
      isActive: true,
    },
  });

  await prisma.block.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: sectionServicios.id,
        type: 'CARD',
        title: 'Kinesiología',
        content:
          'Tratamiento de alteraciones del movimiento, tono muscular y postura. Habilitación y rehabilitación motora.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        order: 1,
        isActive: true,
      },
      {
        sectionId: sectionServicios.id,
        type: 'CARD',
        title: 'Fonoaudiología',
        content:
          'Evaluación y tratamiento de trastornos del lenguaje, habla, deglución y comunicación.',
        imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400',
        order: 2,
        isActive: true,
      },
      {
        sectionId: sectionServicios.id,
        type: 'CARD',
        title: 'Terapia Ocupacional',
        content:
          'Estimulación del desarrollo sensorial, motricidad fina, autonomía personal y habilidades de la vida diaria.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
        order: 3,
        isActive: true,
      },
      {
        sectionId: sectionServicios.id,
        type: 'CARD',
        title: 'Psicología',
        content:
          'Acompañamiento psicológico al niño y orientación a la familia durante todo el proceso terapéutico.',
        imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
        order: 4,
        isActive: true,
      },
      {
        sectionId: sectionServicios.id,
        type: 'CARD',
        title: 'Psicopedagogía',
        content:
          'Evaluación y tratamiento de dificultades de aprendizaje, atención, memoria y funciones ejecutivas.',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
        order: 5,
        isActive: true,
      },
      {
        sectionId: sectionServicios.id,
        type: 'CARD',
        title: 'Estimulación Temprana',
        content:
          'Programa para bebés y niños de 0 a 4 años para potenciar el desarrollo cognitivo, motor y social.',
        imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400',
        order: 6,
        isActive: true,
      },
    ],
  });

  // ─── MENSAJES DE CONTACTO DE EJEMPLO ────────────────────────────────────────
  await prisma.contactMessage.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '11-4567-8901',
        subject: 'Consulta sobre turnos',
        message: 'Hola, quisiera saber si tienen disponibilidad para kinesiología para mi hijo de 5 años. Saludos.',
        isRead: false,
      },
      {
        name: 'Carlos Rodríguez',
        email: 'crodriguez@gmail.com',
        phone: '11-2345-6789',
        subject: 'Proceso de admisión',
        message: '¿Cuáles son los pasos para iniciar el proceso de admisión? Mi hija tiene diagnóstico de TEA.',
        isRead: true,
      },
    ],
  });

  console.log('✅ Seed completado exitosamente.');
  console.log('');
  console.log('📋 Datos de acceso al panel admin:');
  console.log('   Email:    admin@cetrip.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
