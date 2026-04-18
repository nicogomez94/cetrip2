$ErrorActionPreference = 'Stop'

$outputPath = Join-Path (Get-Location) 'Tutorial_Panel_Admin_CETRIP_Cliente.docx'

function Add-Paragraph {
  param(
    [Parameter(Mandatory = $true)][object]$Selection,
    [Parameter(Mandatory = $true)][string]$Text,
    [int]$Size = 11,
    [bool]$Bold = $false,
    [bool]$Italic = $false,
    [int]$SpaceAfter = 8
  )

  $Selection.Font.Name = 'Calibri'
  $Selection.Font.Size = $Size
  $Selection.Font.Bold = if ($Bold) { 1 } else { 0 }
  $Selection.Font.Italic = if ($Italic) { 1 } else { 0 }
  $Selection.ParagraphFormat.SpaceAfter = $SpaceAfter
  $Selection.TypeText($Text)
  $Selection.TypeParagraph()
}

function Add-Bullets {
  param(
    [Parameter(Mandatory = $true)][object]$Selection,
    [Parameter(Mandatory = $true)][string[]]$Items
  )

  foreach ($item in $Items) {
    Add-Paragraph -Selection $Selection -Text ("• " + $item) -Size 11 -SpaceAfter 3
  }
  $Selection.TypeParagraph()
}

function Add-NumberedSteps {
  param(
    [Parameter(Mandatory = $true)][object]$Selection,
    [Parameter(Mandatory = $true)][string[]]$Items
  )

  for ($i = 0; $i -lt $Items.Length; $i++) {
    Add-Paragraph -Selection $Selection -Text ("{0}. {1}" -f ($i + 1), $Items[$i]) -Size 11 -SpaceAfter 3
  }
  $Selection.TypeParagraph()
}

$word = $null
$document = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $document = $word.Documents.Add()
  $selection = $word.Selection

  Add-Paragraph -Selection $selection -Text 'Tutorial del Panel de Administracion de CETRIP' -Size 22 -Bold $true -SpaceAfter 10
  Add-Paragraph -Selection $selection -Text 'Guia operativa para el cliente' -Size 14 -Italic $true -SpaceAfter 14
  Add-Paragraph -Selection $selection -Text ('Fecha de emision: ' + (Get-Date -Format 'dd/MM/yyyy')) -Size 10 -SpaceAfter 18

  Add-Paragraph -Selection $selection -Text '1. Objetivo del documento' -Size 16 -Bold $true -SpaceAfter 6
  Add-Paragraph -Selection $selection -Text 'Este tutorial explica como usar el panel de administracion para actualizar el contenido publico del sitio de CETRIP sin tocar codigo. Incluye acceso, estructura general, edicion por seccion, carga de imagenes, gestion de mensajes y recomendaciones de uso.' -Size 11

  Add-Paragraph -Selection $selection -Text '2. Acceso al panel' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'La pantalla de acceso se encuentra en /admin/login.',
    'Despues de iniciar sesion, el sistema redirige automaticamente a /admin/home.',
    'Si la instalacion conserva la configuracion inicial, las credenciales por defecto son: email admin@cetrip.com y contrasena admin123.',
    'Si esas credenciales fueron cambiadas en produccion, deben usarse las que haya definido el administrador tecnico.',
    'Desde la esquina superior derecha del panel se puede abrir el sitio publico con el enlace "Ver sitio".',
    'Desde el lateral izquierdo se puede cerrar sesion con el boton "Cerrar sesion".'
  )

  Add-Paragraph -Selection $selection -Text '3. Estructura general del panel' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Menu lateral: Home, Quienes Somos, Consultorios Externos, CET, SAIE, Admision, Contacto y Mensajes.',
    'Encabezado superior: muestra el nombre de la seccion actual y el acceso rapido para ver el sitio.',
    'Boton "Guardar cambios": todas las modificaciones se publican al presionarlo. Si se cambia un campo y no se guarda, el sitio no se actualiza.',
    'Mensajes de confirmacion: cuando una seccion guarda correctamente, el sistema muestra "Cambios guardados".',
    'Carga de imagenes: mientras una imagen se esta subiendo aparece una superposicion indicando "Subiendo imagen...".'
  )

  Add-Paragraph -Selection $selection -Text '4. Reglas generales de edicion' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Campos simples: admiten hasta 300 caracteres.',
    'Campos con editor enriquecido: admiten hasta 10000 caracteres de texto.',
    'Si un campo supera el limite, el sistema marca error y no permite guardar hasta corregirlo.',
    'En la mayoria de las pantallas las imagenes pueden cargarse de dos maneras: pegando una URL o subiendo un archivo.',
    'Si se reemplaza una imagen, conviene guardar y luego revisar el sitio publico para confirmar el resultado visual.',
    'El panel no guarda automaticamente: siempre hay que terminar con "Guardar cambios".'
  )

  Add-Paragraph -Selection $selection -Text '5. Como usar el editor de texto enriquecido' -Size 16 -Bold $true -SpaceAfter 6
  Add-Paragraph -Selection $selection -Text 'En varias secciones aparece un editor visual para textos largos. Ese editor permite dar formato sin conocimientos tecnicos.' -Size 11
  Add-Bullets -Selection $selection -Items @(
    'B: negrita.',
    'I: cursiva.',
    'U: subrayado.',
    'H1, H2 y H3: titulos y subtitulos.',
    'UL y OL: listas con viñetas o numeradas.',
    'Link: insertar o editar un enlace.',
    'Img: insertar una imagen por URL dentro del texto.',
    'Vid: insertar un video de YouTube, Vimeo o una URL de embed valida.',
    'Izq, Cen, Der y Jus: alineacion del texto.',
    'Undo y Redo: deshacer y rehacer cambios.'
  )
  Add-Paragraph -Selection $selection -Text 'Recomendacion: en textos institucionales conviene usar H2 o H3 para subtitulos y parrafos breves para mejorar la lectura.' -Size 11

  Add-Paragraph -Selection $selection -Text '6. Seccion Home' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Hero principal: permite editar titulo, subtitulo, texto principal y texto del boton.',
    'Carrusel hero: contiene 4 slides fijos. En cada uno se puede cambiar la imagen por URL o por carga de archivo.',
    'Consultorios externos destacados: hay 3 tarjetas fijas en la portada. Cada una permite editar titulo, texto e imagen.',
    'Seccion "Sobre nosotros": permite editar eyebrow, titulo, parrafo principal, cita destacada y parrafo secundario.'
  )
  Add-Paragraph -Selection $selection -Text 'Uso recomendado:' -Size 11 -Bold $true -SpaceAfter 4
  Add-NumberedSteps -Selection $selection -Items @(
    'Editar primero el bloque Hero, porque es el contenido mas visible de la portada.',
    'Actualizar luego las 4 imagenes del carrusel manteniendo un estilo visual consistente.',
    'Revisar las 3 tarjetas de consultorios destacados para que sus titulos y fotos esten alineados con los servicios vigentes.',
    'Guardar cambios y verificar la portada publica.'
  )

  Add-Paragraph -Selection $selection -Text '7. Seccion Quienes Somos' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Banner: titulo y subtitulo de cabecera.',
    'Introduccion: eyebrow, titulo, texto principal e imagen destacada.',
    'Identidad: 3 bloques fijos para presentar mision, vision, enfoque u otros ejes institucionales.',
    'Franja de confianza (CTA): titulo y texto final.'
  )
  Add-Paragraph -Selection $selection -Text 'Observacion: la imagen principal se puede pegar por URL o cargar desde un archivo con vista previa inmediata.' -Size 11

  Add-Paragraph -Selection $selection -Text '8. Seccion Consultorios Externos' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Banner: titulo y subtitulo.',
    'Introduccion: titulo y texto principal.',
    'Lista de consultorios externos: se pueden administrar entre 3 y 12 items.',
    'Cada consultorio externo permite editar titulo, texto completo de la pagina detalle e imagen.',
    'Cada item puede reordenarse con "Subir" y "Bajar".',
    'Cada item puede eliminarse, pero el sistema nunca permite bajar de 3 servicios.',
    'Tambien se pueden agregar nuevos consultorios hasta un maximo de 12.',
    'Como trabajamos: 3 pasos fijos con titulo y texto.',
    'CTA final: titulo y texto de cierre.'
  )
  Add-Paragraph -Selection $selection -Text 'Importante: el texto de cada consultorio externo no es solo un resumen. Ese contenido alimenta la pagina individual del servicio en /servicios/:slug.' -Size 11

  Add-Paragraph -Selection $selection -Text '9. Seccion CET' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Panel destacado: imagen a la izquierda y texto enriquecido a la derecha.',
    'Galeria de imagenes: permite agregar nuevas fotos y eliminar las existentes.',
    'Cada imagen nueva se incorpora con el boton "Añadir imagen".',
    'Cada imagen existente puede borrarse con el icono de eliminar.'
  )
  Add-Paragraph -Selection $selection -Text 'Uso recomendado: actualizar primero la imagen principal, luego el texto descriptivo y por ultimo la galeria.' -Size 11

  Add-Paragraph -Selection $selection -Text '10. Seccion SAIE' -Size 16 -Bold $true -SpaceAfter 6
  Add-Paragraph -Selection $selection -Text 'La logica de SAIE es equivalente a CET:' -Size 11
  Add-Bullets -Selection $selection -Items @(
    'Panel destacado con imagen izquierda y texto derecha.',
    'Galeria de imagenes con altas y bajas.',
    'Campo de texto enriquecido con limite de 10000 caracteres.'
  )

  Add-Paragraph -Selection $selection -Text '11. Seccion Admision' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Banner: titulo y subtitulo.',
    'Introduccion: titulo y texto enriquecido.',
    'Pasos del proceso: se pueden administrar entre 3 y 10 pasos.',
    'Cada paso tiene titulo, texto, orden y opcion de eliminar.',
    'Requisitos: 4 campos fijos mas un titulo de seccion.',
    'Preguntas frecuentes: 3 items fijos, cada uno con pregunta y respuesta.',
    'CTA final: titulo y texto enriquecido.'
  )
  Add-Paragraph -Selection $selection -Text 'Uso recomendado:' -Size 11 -Bold $true -SpaceAfter 4
  Add-NumberedSteps -Selection $selection -Items @(
    'Mantener los pasos en el orden real del proceso de admision.',
    'Usar respuestas breves y claras en preguntas frecuentes.',
    'No eliminar pasos si eso deja la lista con menos de 3 items.'
  )

  Add-Paragraph -Selection $selection -Text '12. Seccion Contacto' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Banner: titulo y subtitulo.',
    'Panel de informacion: titulo, subtitulo, direccion, telefono, email y horario.',
    'Redes sociales del footer: Facebook, Instagram, WhatsApp y YouTube.',
    'Todos estos campos son de texto simple y admiten hasta 300 caracteres.'
  )
  Add-Paragraph -Selection $selection -Text 'Importante: las URLs cargadas en redes sociales impactan directamente en el footer del sitio publico.' -Size 11

  Add-Paragraph -Selection $selection -Text '13. Seccion Mensajes' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Muestra todos los mensajes enviados desde el formulario de contacto.',
    'Permite filtrar por Todos, Sin leer y Leidos.',
    'Cada mensaje muestra nombre, asunto, fecha y una vista previa.',
    'Al seleccionar un mensaje, se abre el detalle completo.',
    'Si el mensaje estaba sin leer, el sistema lo marca como leido automaticamente.',
    'Tambien existe un boton especifico para "Marcar como leido".',
    'El boton "Responder por email" abre el cliente de correo con asunto precompletado.',
    'El boton "Eliminar" borra el mensaje luego de confirmar la accion.'
  )

  Add-Paragraph -Selection $selection -Text '14. Buenas practicas para el cliente' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'Preparar previamente textos e imagenes antes de entrar al panel.',
    'Evitar pegar textos excesivamente largos en banners o bloques cortos.',
    'Usar imagenes nítidas, livianas y con orientacion coherente entre si.',
    'Guardar por seccion y revisar inmediatamente el sitio publico.',
    'Si se hace una carga masiva de cambios, avanzar pagina por pagina para reducir errores.',
    'No cerrar la pestaña mientras una imagen se esta subiendo.'
  )

  Add-Paragraph -Selection $selection -Text '15. Problemas frecuentes y solucion' -Size 16 -Bold $true -SpaceAfter 6
  Add-Bullets -Selection $selection -Items @(
    'No puedo entrar al panel: verificar URL, email, contrasena y que la sesion no haya expirado.',
    'No me deja guardar: revisar si algun campo excede el limite de caracteres o si falta esperar que termine una subida.',
    'La imagen no aparece: confirmar que la carga finalizo y luego refrescar la pagina publica.',
    'Se ve distinto a lo esperado: comprobar el contenido en el sitio publico y ajustar texto, imagen o longitud del bloque.',
    'El boton de respuesta no envia solo: abre el programa de correo del equipo; desde ahi hay que completar y mandar el email.'
  )

  Add-Paragraph -Selection $selection -Text '16. Cierre' -Size 16 -Bold $true -SpaceAfter 6
  Add-Paragraph -Selection $selection -Text 'El panel de administracion de CETRIP esta orientado a la edicion de contenidos publicos sin soporte tecnico en cada cambio. Si se usa con el flujo correcto - editar, guardar y revisar el sitio - el cliente puede mantener actualizado el portal de forma autonoma.' -Size 11

  $document.SaveAs([ref]$outputPath)
}
finally {
  if ($document) {
    $document.Close() | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($document) | Out-Null
  }
  if ($word) {
    $word.Quit() | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Output $outputPath
