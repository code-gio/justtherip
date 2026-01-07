# Media Library Service

Este servicio proporciona funcionalidad completa para gestionar archivos multimedia en Supabase Storage y una base de datos relacional.

## Características

- ✅ Subida de archivos a Supabase Storage
- ✅ Gestión de carpetas con estructura jerárquica
- ✅ Breadcrumbs para navegación
- ✅ Conteo de assets por carpeta
- ✅ Eliminación de archivos (storage + database)
- ✅ Búsqueda y filtrado de assets
- ✅ Soporte para tags y descripciones
- ✅ Componente Svelte completo con UI

## Configuración

### 1. Crear tablas en Supabase

Ejecuta el SQL en `src/lib/server/media-schema.sql` en tu consola de Supabase para crear:

- Tabla `media_folders`
- Tabla `media_assets`
- Índices para rendimiento
- Triggers para `updated_at`
- Políticas RLS (Row Level Security)

### 2. Crear bucket de Storage

En Supabase Dashboard -> Storage:

1. Crea un nuevo bucket llamado `media`
2. Habilita "Public bucket" si quieres URLs públicas
3. O configura políticas de acceso personalizadas

### 3. Usar el servicio

```typescript
// En un endpoint de servidor (+server.ts)
import {
  uploadMedia,
  getMediaAssets,
  deleteMediaAsset,
  createFolder,
  getFolders,
} from "$lib/server/media";

// Subir un archivo
const result = await uploadMedia({
  file: myFile,
  userId: session.user.id,
  folderId: "optional-folder-id",
  breadcrumbs: [{ id: "folder-1", name: "Images" }],
  tags: ["product", "featured"],
  description: "Product hero image",
});

// Obtener assets del usuario
const assets = await getMediaAssets(session.user.id, "optional-folder-id");

// Crear carpeta
const folder = await createFolder({
  userId: session.user.id,
  name: "My Folder",
  parentId: null,
  breadcrumbs: [],
});
```

## Componente Media

El componente `Media.svelte` proporciona una UI completa para gestionar archivos.

### Uso básico

```svelte
<script lang="ts">
  import Media from '$lib/components/media/media.svelte';

  let { data } = $props();
</script>

<Media
  userId={data.session.user.id}
  maxFileSize={100 * 1024 * 1024}
  allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
/>
```

### Props

- `userId` (required): ID del usuario autenticado
- `maxFileSize`: Tamaño máximo de archivo en bytes (default: 100MB)
- `allowedFileTypes`: Array de tipos MIME permitidos (default: todos)
- `showFileTypeError`: Mostrar errores de tipo de archivo (default: true)
- `onSelect`: Callback cuando se selecciona un asset
- `selectable`: Permite seleccionar assets (default: false)

### Modo selectable

Útil para seleccionar archivos en formularios:

```svelte
<script lang="ts">
  import Media from '$lib/components/media/media.svelte';
  import type { MediaAsset } from '$lib/types/media';

  let selectedAsset = $state<MediaAsset | null>(null);

  function handleSelect(asset: MediaAsset) {
    selectedAsset = asset;
    console.log('Selected:', asset.url);
  }
</script>

<Media
  userId={data.session.user.id}
  selectable={true}
  onSelect={handleSelect}
/>

{#if selectedAsset}
  <p>Selected: {selectedAsset.originalName}</p>
  <img src={selectedAsset.url} alt={selectedAsset.originalName} />
{/if}
```

## API Endpoints

El servicio incluye los siguientes endpoints:

### POST `/api/media/upload`

Sube un archivo al storage y crea el registro en BD.

**Body (FormData):**

- `file`: File
- `folderId`: string (opcional)
- `breadcrumbs`: JSON string (opcional)
- `tags`: JSON string (opcional)
- `description`: string (opcional)

### GET `/api/media/assets`

Obtiene assets del usuario autenticado.

**Query params:**

- `folderId`: string | 'null' (opcional)

### GET `/api/media/assets/:id`

Obtiene un asset específico.

### DELETE `/api/media/assets/:id`

Elimina un asset (storage + database).

### GET `/api/media/folders`

Obtiene carpetas del usuario autenticado.

**Query params:**

- `parentId`: string | 'null' (opcional)

### POST `/api/media/folders`

Crea una nueva carpeta.

**Body (JSON):**

- `name`: string
- `parentId`: string | null
- `breadcrumbs`: MediaBreadcrumb[]

### GET `/api/media/count`

Cuenta assets en una carpeta.

**Query params:**

- `folderId`: string (required)

## Estructura de tipos

```typescript
interface MediaAsset {
  id: string;
  userId: string;
  folderId?: string | null;
  breadcrumbs?: MediaBreadcrumb[];
  storagePath: string;
  url: string;
  thumbnailURL?: string;
  originalName: string;
  mimeType: string;
  fileExtension: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  updatedAt: string;
  tags?: string[];
  description?: string;
}

interface MediaFolder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  breadcrumbs: MediaBreadcrumb[];
  createdAt: string;
  updatedAt: string;
  childAssetCount?: number;
}

interface MediaBreadcrumb {
  id: string;
  name: string;
}
```

## Patrones de uso

### Archivos por usuario

Los archivos se organizan automáticamente por usuario:

```typescript
// El userId se obtiene de la sesión
const userId = session.user.id;

// Subir archivo
await uploadMedia({
  file: myFile,
  userId,
  folderId: null, // Raíz del usuario
});

// Obtener archivos del usuario
const assets = await getMediaAssets(userId);
```

### Estructura de carpetas

```typescript
// Crear estructura: user/projects/website/images
const projectsFolder = await createFolder({
  userId,
  name: "projects",
  parentId: null,
});

const websiteFolder = await createFolder({
  userId,
  name: "website",
  parentId: projectsFolder.id,
  breadcrumbs: [{ id: projectsFolder.id, name: "projects" }],
});

const imagesFolder = await createFolder({
  userId,
  name: "images",
  parentId: websiteFolder.id,
  breadcrumbs: [
    { id: projectsFolder.id, name: "projects" },
    { id: websiteFolder.id, name: "website" },
  ],
});
```

## Mejoras futuras

- [ ] Generación automática de thumbnails
- [ ] Procesamiento de imágenes (resize, crop, optimize)
- [ ] Soporte para variantes (webp, avif)
- [ ] Búsqueda por texto completo
- [ ] Filtros avanzados
- [ ] Drag & drop para reordenar
- [ ] Vista previa de archivos
- [ ] Edición de metadatos
- [ ] Compartir con permisos
- [ ] Papelera de reciclaje
