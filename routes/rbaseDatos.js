module.exports=function(app,utilBD){


    /*
        DATOS DE EJEMPLO:
        6 usuarios:Christia,Cristina,Gema,Noe,Enrique,Admin
        15 ofertas:CH1,CH2,CH3,C1,C2,C3,G1,G2,G3,N1,N2,N3,E1,E2,E3

        Usuarios:
        Christian={
            usuario=christian@email.com
            nombre=Christian
            apellidos=Peláez
            contraseña=123456
            saldo=100€
            rol=Usuario estándar
        }

        Cristina={
            usuario=cristina@email.com
            nombre=Cristina
            apellidos=Ruiz de Bucesta
            contraseña=123456
            saldo=100€
            rol=Usuario estándar
        }

        Gema={
            usuario=gema@email.com
            nombre=Gema
            apellidos=Rico
            contraseña=123456
            saldo=100€
            rol=Usuario estándar
        }

        Noe={
            usuario=noe@email.com
            nombre=Noe
            apellidos=Fernandez
            contraseña=123456
            saldo=100€
            rol=Usuario estándar
        }

        Enrique={
            usuario=enrique@email.com
            nombre=Enrique
            apellidos=Avello
            contraseña=123456
            saldo=100€
            rol=Usuario estándar
        }

        Admin={
            usuario=admin@email.com
            nombre=Admin
            apellidos=Admin
            contraseña=admin
            saldo=100€
            rol=Usuario administrador
        }
        Relaciones:
        Christian={
            Publica 3 ofertas:CH1,CH2,CH3
            Compra 2 ofertas:CR2 y N2
        }

        Cristina={
            Publica 3 ofertas: CR1,CR2,CR3
            Compra 2 ofertas: CH1,N3
        }

        Gema={
            Publica 3 ofertas: G1,G2,G3
            Compra 2 ofertas: CH2,CR1
        }

        Noe={
            Publica 3 ofertas: N1,N2,N3
            Compra 2 oferta: G1,E1
        }

        Enrique={
            Publica 3 ofertas:  E1,E2,E3
            Compra 2 oferta: G3,N1
        }
    */

    app.get("/reiniciarBBDD",function(req,res)
    {

        //1 conversacion por USUARIO,2 lineas por interlocutor

        //5 usuarios y un administrador
        var christian=crearUsuario("christian@email.com","Christian","Peláez","123456","U",100);//
        var cristina=crearUsuario("cristina@email.com","Cristina","Ruiz de Bucesta","123456","U",100);//
        var gema=crearUsuario("gema@email.com","Gema","Rico","123456","U",100);//
        var noe=crearUsuario("noe@email.com","Noe","Fernandez","123456","U",100);//
        var enrique=crearUsuario("enrique@email.com","Enrique","Avello","123456","U",100);//
        var admin=crearUsuario("admin@email.com","Admin","Admin","admin","A",100);

        var usuarios=[christian,cristina,gema,noe,enrique,admin];

        //3 ofertas por usuario y 2 compras por usuario
        var CH1=crearOferta("Oferta CH1","Oferta primera de Christian Peláez",new Date(),50,christian.email,true,cristina.email);
        var CH2=crearOferta("Oferta CH2","Oferta segunda de Christian Peláez",new Date(),100,christian.email,true,gema.email);
        var CH3=crearOferta("Oferta CH3","Oferta tercera de Christian Peláez",new Date(),33,christian.email,false,null);
        var CH4=crearOferta("Oferta CH4","Oferta cuarta de Christian Peláez",new Date(),12,christian.email,false,null);

        var CR1=crearOferta("Oferta CR1","Oferta primera de Cristina Ruiz de Bucesta",new Date(),25,cristina.email,true,gema.email);
        var CR2=crearOferta("Oferta CR2","Oferta segunda de Cristina Ruiz de Bucesta",new Date(),15,cristina.email,true,christian.email);
        var CR3=crearOferta("Oferta CR3","Oferta tercera de Cristina Ruiz de Bucesta",new Date(),5,cristina.email,false,null);
        var CR4=crearOferta("Oferta CR4","Oferta cuarta de Cristina Ruiz de Bucesta",new Date(),55,cristina.email,false,null);

        var G1=crearOferta("Oferta G1","Oferta primera de Gema Rico",new Date(),25.5,gema.email,true,noe.email);
        var G2=crearOferta("Oferta G2","Oferta segunda de Gema Rico",new Date(),75.5,gema.email,false,null);
        var G3=crearOferta("Oferta G3","Oferta tercera de Gema Rico",new Date(),6.25,gema.email,true,enrique.email);
        var G4=crearOferta("Oferta G4","Oferta cuarta de Gema Rico",new Date(),66.25,gema.email,true,enrique.email);


        var N1=crearOferta("Oferta N1","Oferta primera de Noe Fernandez",new Date(),200,noe.email,true,enrique.email);
        var N2=crearOferta("Oferta N2","Oferta segunda de Noe Fernandez",new Date(),10000,noe.email,true,christian.email);
        var N3=crearOferta("Oferta N3","Oferta tercera de Noe Fernandez",new Date(),1,noe.email,true,cristina.email);
        var N4=crearOferta("Oferta N4","Oferta cuarta de Noe Fernandez",new Date(),10,noe.email,true,null);

        var E1=crearOferta("Oferta E1","Oferta primera de Enique Avello",new Date(),200,enrique.email,true,noe.email);
        var E2=crearOferta("Oferta E2","Oferta segunda de Enique Avello",new Date(),10000,enrique.email,false,null);
        var E3=crearOferta("Oferta E3","Oferta tercera de Enique Avello",new Date(),1,enrique.email,false,null);
        var E4=crearOferta("Oferta E4","Oferta cuarta de Enique Avello",new Date(),100,enrique.email,false,null);

        var ofertas=[CH1,CH2,CH3,CH4,CR1,CR2,CR3,CR4,G1,G2,G3,G4,N1,N2,N3,N4,E1,E2,E3,E4];

        //
        utilBD.eliminarColecciones(function(result)
        {
            if(result==null)
            {
                res.send("NO SE HA PODIDO CONECTAR CON LA BASE DE DATOS");
            }else{
                utilBD.insertarDatos(usuarios,ofertas,function(result)
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
