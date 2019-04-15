module.exports=function(app,swig,usuariosBD){
    app.get("/registrarse",function(req,res){
        var respuesta=swig.renderFile('views/bregistro.html',{});
        res.send(respuesta);
    });

    app.post("/registrarse",function(req,res){
        //Validaciones
        if(req.body.email==="")
        {
            res.redirect("/registrarse?error=noEmail");
            return;
        }
        if(req.body.name==="")
        {
            res.redirect("/registrarse?error=noNombre");
            return;
        }

        if(req.body.name.toString().length<3 || req.body.name.toString().length>20)
        {
            res.redirect("/registrarse?error=tamañoNombre");
            return;
        }

        if(req.body.lastName==="")
        {
            res.redirect("/registrarse?error=noApellido");
            return;
        }

        if(req.body.lastName.toString().length<3 || req.body.lastName.toString().length>20)
        {
            res.redirect("/registrarse?error=tamañoApellido");
            return;
        }

        if(req.body.password==="")
        {
            res.redirect("/registrarse?error=noContraseña");
            return;
        }
        if(req.body.passwordConfirm==="")
        {
            res.redirect("/registrarse?error=noContraseñaConfirmar");
            return;
        }
        if(req.body.passwordConfirm !== req.body.password)
        {
            res.redirect("/registrarse?error=contraseñasDistintas");
            return;
        }

        if(req.body.password.toString().length<8 || req.body.password.toString().length>20)
        {
            res.redirect("/registrarse?error=tamañoContraseña");
            return;
        }

        var usuario = crearUsuario(req,"usuario");

        var criterio={email:usuario.email };
        usuariosBD.obtenerUsuarios(criterio,function(usuarios)
        {
            if(usuarios.length>0)
            {
                res.redirect("/registrarse?error=usuarioRepetido");
            }else{
                usuariosBD.insertarUsuario(usuario, function(id) {
                    if (id == null){
                        res.redirect("/registrarse?error=errorRegistro");
                    } else {
                        app.get('log').info("Usuario registrado:"+usuario.email);//logger
                        req.session.usuario=usuario.email;
                        res.redirect("/perfil");
                    }
                });
            }
        });


    });

    function encriptarPassword(password) {
        return  app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(password).digest('hex');
    };

    function crearUsuario(req,rol) {
        return {
            email : req.body.email,
            name: req.body.name,
            lastname: req.body.lastName,
            password : encriptarPassword(req.body.password),
            rol: rol,
            cash:100,
        };
    };

    app.get("/perfil",function(req,res){
        var criterio={email:req.session.usuario};
        usuariosBD.obtenerUsuarios(criterio,function(usuarios) {
            if(usuarios.length===0)
            {
                res.send("ERROR") //<-------------------------------------- CAMBIAR
            }else{
                var respuesta=swig.renderFile('views/perfil.html',{usuario:usuarios[0]});
                res.send(respuesta);
            }
        });
    });

    app.get("/identificar",function (req,res) {
        var respuesta=swig.renderFile('views/bidentificar.html',{});
        res.send(respuesta);
    });

    app.post("/identificar",function (req,res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        };
        usuariosBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificar?error=Email-password incorrecto");
                app.get("log").info("Intento de acceso no autorizado a la cuenta:"+req.body.email);
            } else {
                req.session.usuario = usuarios[0].email;
                app.get("log").info("Inicio de sesión:"+req.body.email);
                res.redirect("/perfil");
            }
        });
    });

    app.get('/desconectar', function (req, res) {

        app.get('log').info(req.session.usuario +" se ha desconectado del sistema");
        req.session.usuario = null;
        res.redirect("/identificar");
    });
}
