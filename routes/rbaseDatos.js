/*

SOLO SE UTILILZA PARA REINICIAR LA BASE DE DATOS CON LOS SIGUIENTES DATOS:
    1-USUARIOS

 */

module.exports=function(app,utilBD){

    app.get("/reiniciarBBDD",function(req,res)
    {
        utilBD.eliminarColecciones(function(result)
        {
            if(result==null)
            {
                res.send("NO SE HA PODIDO CONECTAR CON LA BASE DE DATOS");
            }else{
                var usuarios=generarUsuarios();
                /*var ofertas=generarOfertas(usuarios);*/
                utilBD.insertarDatos(usuarios,/*ofertas,*/function(result)
                {
                    if(result!=null)
                    {
                        app.get('log').info("Se ha reiniciado la Base de Datos");
                        res.send("SE HA REINICIADO LA BASE DE DATOS CORRECTAMENTE");
                    }else{
                        res.send("HA OCURRIDO UN ERROR DURANTE EL REINICIO DE LA BASE DE DATOS");
                    }
                });
            }
        })
    });

    function generarUsuarios()
    {
        var usuarios=[];
        usuarios.push(crearUsuario("admin@email.com","Edward","Nuñez","admin","A",100));
        usuarios.push(crearUsuario("christian@email.com","Christian","Peláez","123456","U",100));
        usuarios.push(crearUsuario("cristina@email.com","Cristina","Ruiz de Bucesta","123456","U",100));
        usuarios.push(crearUsuario("noe@email.com","Noe","Fernandez","123456","U",100));
        usuarios.push(crearUsuario("william@email.com","William","Bones","123456","U",100));
        return usuarios;
    }

    function generarOfertas()
    {
        var ofertas=[];
        ofertas.push(crearOferta("Televisión Samsung","Televisión de 40 pulgadas 4K",new Date(1998,11,11),500,"christian@email.com",false,null));
        ofertas.push(crearOferta("BMX","Bicicleta último modelo",new Date(2018,4,27),"200","gema@email.com",true,"noe@email.com"));
        ofertas.push(crearOferta("PS4 Pro","Consola",new Date(2017,4,27),"150","cristina@email.com",false,"christian@email.com"));
        return ofertas;
    }


    function crearMensaje(origen, oferta, texto, fecha, leido) {
        return {
            origen: origen,
            id_oferta: oferta,
            texto: texto,
            fecha: fecha,
            leido: leido,
        };
    };

    function crearOferta(titulo,descripcion,fecha,precio,propietario,vendida,comprador){
        return {
            title: titulo,
            description:descripcion,
            date:fecha,
            price:precio,
            owner:propietario,
            sold:vendida,
            purchaser:comprador
        }
    };
    function encriptarPassword(password) {
        return  app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(password).digest('hex');
    };

    function crearUsuario(email,nombre,apellido,password,rol,dinero) {
        return {
            email : email,
            name: nombre,
            lastname: apellido,
            password : encriptarPassword(password),
            rol: rol,
            cash:dinero,
        };
    };

};
