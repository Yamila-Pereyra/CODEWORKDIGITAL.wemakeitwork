-- proyecto.novedades definition

CREATE TABLE `novedades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitulo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cuerpo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;