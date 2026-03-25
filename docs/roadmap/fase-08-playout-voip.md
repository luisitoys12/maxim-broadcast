# Fase 8: Playout 24/7 y Llamadas VoIP

**Estado:** 🔄 En Desarrollo  
**Target:** Q1 2027  
**Prioridad:** Alta  
**Dependencias:** Fases 1–7 ✅

---

## Descripción

Implementar un sistema de playout automatizado para transmisión continua 24/7 y soporte de llamadas VoIP integradas para entrevistas y transmisiones remotas en vivo.

---

## 🎯 Objetivos

### Playout 24/7

- [ ] Scheduler de contenido con programación horaria
- [ ] Cola de reproducción con drag & drop desde dashboard web
- [ ] Soporte para listas con repetición, prioridades y franjas horarias
- [ ] Transiciones automáticas entre clips (fade, cut, wipe)
- [ ] Integración con Lower Thirds para metadatos automáticos del clip
- [ ] Failsafe: bumper/contenido de relleno si la cola está vacía
- [ ] Vista de "Ahora al aire" y "Próximamente" en dashboard
- [ ] Exportar/importar programación en formato JSON/XML
- [ ] Soporte HLS y RTMP para distribución del playout

### Llamadas VoIP

- [ ] Integración SIP (FreeSWITCH / Asterisk) para entrevistas remotas
- [ ] Soporte WebRTC para llamadas desde navegador sin instalar nada
- [ ] Mezcla de audio automática de la llamada con la señal principal
- [ ] Vista de invitado remoto como fuente de video en el mezclador
- [ ] PiP (Picture-in-Picture) configurable para el invitado
- [ ] Grabación independiente de cada canal de audio
- [ ] Supresión de ruido y cancelación de eco en tiempo real
- [ ] Sala de espera virtual para invitados antes de salir al aire
- [ ] Soporte multi-invitado (hasta 4 simultáneos)

---

## 🏗️ Arquitectura Propuesta

```
Playout Engine
├── scheduler/
│   ├── PlaylistManager.ts       # Gestión de listas de contenido
│   ├── ContentQueue.ts          # Cola con Redis
│   ├── SchedulerCron.ts         # Tareas programadas por horario
│   └── FailsafeHandler.ts       # Contenido de relleno automático
├── voip/
│   ├── SIPClient.ts             # Integración FreeSWITCH/Asterisk
│   ├── WebRTCBridge.ts          # Puente WebRTC ↔ SIP
│   ├── AudioMixer.ts            # Mezcla de canales de audio
│   └── GuestRoom.ts             # Sala de espera virtual
└── api/
    ├── playout.routes.ts
    └── voip.routes.ts
```

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Scheduler | Node.js + node-cron + Redis Bull Queue |
| Playout Engine | FFmpeg concat + libobs |
| VoIP SIP | FreeSWITCH o Asterisk |
| VoIP WebRTC | mediasoup v3 |
| Audio DSP | RNNoise (supresión de ruido) |
| Frontend UI | React + react-beautiful-dnd (drag & drop) |
| Almacenamiento | PostgreSQL (metadatos) + S3/MinIO (videos) |

---

## ✅ Criterios de Aceptación

- [ ] Canal puede transmitir 24 horas sin intervención manual
- [ ] Cambio de contenido en tiempo real sin cortar la señal de salida
- [ ] Llamadas VoIP con latencia < 200ms
- [ ] Dashboard muestra programa actual y los próximos 3 contenidos
- [ ] Compatible con el sistema de streaming existente (RTMP/HLS)
- [ ] Funciona en Docker con `docker-compose up`

---

## 📁 Archivos a Crear

```
backend/src/playout/
backend/src/voip/
frontend/src/components/Playout/
frontend/src/components/VoIP/
docs/api/playout-api.md
docs/api/voip-api.md
```

---

*Maxim Broadcast — EstacionKusMedia | Irapuato, México*
