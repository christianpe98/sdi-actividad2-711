module.exports=function(app,swig,usuariosBD){
    app.get("/registrarse",function(req,res){
        var respuesta=swig.renderFile('views/anonimo/bregistro.html',{});
        res.send(respuesta);
    });

    app.post("/registrarse",function(req,res){
        //Validaciones
        if(!req.body.name.toString().trim().length) //No lleva solo espacios
        {
            res.redirect("/registrarse?error=noNombre");
            return;
        }

        if(req.body.name.toString().length<3 || req.body.name.toString().length>20)
        {
            res.redirect("/registrarse?error=tamañoNombre");
            return;
        }

        if(!req.body.lastName.toString().trim().length)
        {
            res.redirect("/registrarse?error=noApellido");
            return;
        }

        if(req.body.lastName.toString().length<3 || req.body.lastName.toString().length>20)
        {
            res.redirect("/registrarse?error=tamañoApellido");
            return;
        }

        if(!req.body.password.toString().trim().length)
        {
            res.redirect("/registrarse?error=noContraseña");
            return;
        }
        if(!req.body.passwordConfirm.toString().trim().length)
        {
            res.redirect("/registrarse?error=noContraseñaConfirmar");
            return;
        }
        if(req.body.passwordConfirm !== req.body.password)
        {
            res.redirect("/registrarse?error=contraseñasDistintas");
            return;
        }

        if(req.body.password.toString().length<5 || req.body.password.toString().length>20)
        {
            res.redirect("/registrarse?error=tamañoContraseña");
            return;
        }

        var usuario = crearUsuario(req,'U');

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
            if(usuarios.length===0 || usuarios.length>1)
            {
                res.send("ERROR"); //<-------------------------------------- CAMBIAR
            }else{
                if(usuarios[0].rol==='U') {
                    var respuesta = swig.renderFile('views/identificado/estandar/bperfilEstandar.html', {usuario: usuarios[0]});
                    res.send(respuesta);
                }else{
                    if(usuarios[0].rol==='A') {
                        var respuesta = swig.renderFile('views/identificado/administrador/bperfilAdministrador.html', {usuario: usuarios[0]});
                        res.send(respuesta);
                }else{
                    res.send("ERROR: NO EXISTE ESE ROL");
                    }
                }
            }
        });
    });

    app.get("/identificarse",function (req,res) {
        var respuesta=swig.renderFile('views/anonimo/bidentificar.html',{});
        res.send(respuesta);
    });

    app.post("/identificarse",function (req,res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        };
        usuariosBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse?error=Email-password incorrecto");
                app.get("log").info("Intento de acceso no autorizado a la cuenta:"+req.body.email);
            } else {
                req.session.usuario = usuarios[0].email;
                app.get("log").info("Inicio de sesión:"+req.body.email);
                res.redirect("/perfil");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        app.get('log').info(req.session.usuario +" se ha desconectado del sistema");
        req.session.usuario = null;
        res.redirect("/identificarse");
    });

    app.get("/usuarios",function(req,res){
        usuariosBD.obtenerUsuarios({},function(usuarios){
           if(usuarios==null)
           {
               res.send("ERROR");
           }else{
               let actual = null;
               var i;
               for(i=0;i<usuarios.length;i++)
               {
                   if(req.session.usuario===usuarios[i].email)
                   {
                       actual=usuarios[i];
                   }
               }
               var respuesta=swig.renderFile("views/identificado/administrador/blistarUsuarios.html",{usuario:actual, usuarios:usuarios});
               res.send(respuesta);
           }
        });
    });

    app.get("/eliminarUsuarios",function (req,res)
    {
        usuariosBD.obtenerUsuarios({},function(usuarios){
            if(usuarios==null)
            {
                res.send("ERROR");
            }else{
                let arrayUsuarios = [];
                let actual=null;
                var i;
                for(i=0;i<usuarios.length;i++)
                {
                    if(req.session.usuario!=usuarios[i].email)
                    {
                        arrayUsuarios.push(usuarios[i]);
                    }else{
                        actual=usuarios[i];
                    }
                }
                var respuesta=swig.renderFile("views/identificado/administrador/beliminarUsuarios.html",{usuario:actual, usuarios:arrayUsuarios});
                res.send(respuesta);
            }
        });
    });

    app.post("/eliminarUsuarios",function (req,res) {
        if(typeof (req.body.checkEmail)=="string")// Si solo se selecciona un check box se muestra como un string -> $in no funciona
        {
            var criterio={email: req.body.checkEmail};
        }else{
            var criterio={email:{$in: req.body.checkEmail}};
        }

        usuariosBD.eliminarUsuario(criterio,function (result) {
            if(result==null)
            {
                res.send("ERROR AL ELIMINAR USUARIOS");
            }else{
                res.redirect("/eliminarUsuarios");
            }
        });
    });
}
