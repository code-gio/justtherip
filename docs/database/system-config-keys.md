# System config keys

Para que `carousel_min_value_usd` aparezca en **Admin → Settings** y se pueda editar como el resto, añade la fila en Supabase con este SQL:

```sql
INSERT INTO system_config (key, value)
VALUES ('carousel_min_value_usd', 20);
```

(20 = solo cartas de $20 o más en el carrusel; 0 = mostrar todas.)
