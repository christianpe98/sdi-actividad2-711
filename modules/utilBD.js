module.exports={
    mongo : null,
    app : null,
    usuariosBD:null,
    init : function(app, mongo,usuariosBD) {
        this.mongo = mongo;
        this.app = app;
        this.usuariosBD=usuariosBD;
    },

    eliminarColecciones: function(functionCallback)
    {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            }else{
                  db.dropDatabase();
                  functionCallback(true);
            }
        });
    },
    insertarDatos: function(usuarios,functionCallback)
    {
        var usuariosBD=this.usuariosBD;
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            }else{
                usuariosBD.insertarUsuario(usuarios,functionCallback);
            }
        });
    }
}
