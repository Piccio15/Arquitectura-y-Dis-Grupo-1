-- En modalidad pospago la duracion se calcula con fecha_inicio y fecha_fin.
ALTER TABLE `SesionEstacionamiento`
    DROP COLUMN `duracion_estimada_minutos`;
