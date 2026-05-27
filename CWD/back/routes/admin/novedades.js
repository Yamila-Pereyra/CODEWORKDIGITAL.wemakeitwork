var express = require('express');
var router = express.Router();
var novedadesModel = require('../../models/novedadesModel');

// Mostrar todas las novedades
router.get('/', async function (req, res, next) {
    try {
        var novedades = await novedadesModel.getNovedades();
        res.render('admin/novedades', {
            layout: 'admin/layout',
            usuario: req.session.nombre,
            novedades
        });
    } catch (error) {
        console.log(error);
        res.render('admin/novedades', {
            layout: 'admin/layout',
            usuario: req.session.nombre,
            novedades: [],
            error: true,
            message: 'No se pudieron cargar las novedades'
        });
    }
});

// Formulario para agregar novedad
router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', {
        layout: 'admin/layout'
    });
});

// Agregar novedad
router.post('/agregar', async (req, res, next) => {
    try {
        if (
            req.body.titulo &&
            req.body.descripcion &&
            req.body.fecha_publicacion &&
            req.body.estado
        ) {
            await novedadesModel.insertNovedad({
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                fecha_publicacion: req.body.fecha_publicacion,
                estado: req.body.estado
            });

            res.redirect('/admin/novedades');
        } else {
            res.render('admin/agregar', {
                layout: 'admin/layout',
                error: true,
                message: 'Todos los campos son requeridos'
            });
        }
    } catch (error) {
        console.log(error);
        res.render('admin/agregar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se cargó la novedad'
        });
    }
});

// Eliminar novedad
router.get('/eliminar/:id', async (req, res, next) => {
    try {
        var id = req.params.id;
        await novedadesModel.deleteNovedadesById(id);
        res.redirect('/admin/novedades');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/novedades');
    }
});

// Formulario para modificar novedad
router.get('/modificar/:id', async (req, res, next) => {
    try {
        var id = req.params.id;
        var novedad = await novedadesModel.getNovedadById(id);

        res.render('admin/modificar', {
            layout: 'admin/layout',
            novedad
        });
    } catch (error) {
        console.log(error);
        res.redirect('/admin/novedades');
    }
});

// Modificar novedad
router.post('/modificar', async (req, res, next) => {
    try {
        var obj = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            fecha_publicacion: req.body.fecha_publicacion,
            estado: req.body.estado
        };

        await novedadesModel.modificarNovedadById(obj, req.body.id);
        res.redirect('/admin/novedades');
    } catch (error) {
        console.log(error);
        res.render('admin/modificar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se modificó la novedad'
        });
    }
});

module.exports = router;
