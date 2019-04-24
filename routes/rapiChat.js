module.exports = function (app, usuariosBD, ofertasBD, chatBD) {

    app.post("/api/chat/identificarse", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.email,
            password: seguro
        };
        usuariosBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado: false
                })
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }
        });
    });

    app.get("/api/chat/ofertas", function (req, res) {
        var criterio = {
            owner: {$ne: res.usuario}
        };
        ofertasBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
            }
        });
    });

    function crearConversacion(usuario, idOferta) {
        return {
            usuario: usuario,
            id_oferta: idOferta
        }
    }


    ///REVISARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
    app.post("/api/chat/mensaje", function (req, res) {
        /*Datos del mensaje:
        -origen -> email del usuario registrado
        -oferta -> id de la oferta
        -texto del mensaje
        -fecha
        -leido
        -convesacion
        */var criterio = {
            usuario: res.usuario,
            id_oferta: req.body.idOferta
        };
        chatBD.obtenerConversacion(criterio, function (conversaciones) {
            if (conversaciones == null) {
                res.status(500);
                res.json({
                    enviado: false
                });
            } else {
                if (conversaciones.length === 0) {
                    var conversacion = crearConversacion(res.usuario, req.body.idOferta);
                    chatBD.insertarConversacion(conversacion, function (result) {
                        if (result == null) {
                            res.status(500);
                            res.json({
                                enviado: false
                            });
                        } else {
                            var mensaje = crearMensaje(res.usuario, req.body.idOferta, req.body.textoMensaje, new Date(), false, result.toString());//CAMBIARRRRRRR ID CONVERSACION
                            chatBD.insertarMensaje(mensaje, function (result) {
                                if (result == null) {
                                    res.status(500);
                                    res.json({
                                        enviado: false
                                    });
                                } else {
                                    res.status(200);
                                    res.json({
                                        enviado: true,
                                    });
                                }
                            });
                        }

                    });
                }
            }
        });

    });

    function crearMensaje(origen, oferta, texto, fecha, leido, conversacion) {
        return {
            origen: origen,
            id_oferta: oferta,
            texto: texto,
            fecha: fecha,
            leido: leido,
            id_conversacion: conversacion
        };
    };

};
