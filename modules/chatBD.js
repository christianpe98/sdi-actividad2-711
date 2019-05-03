module.exports= {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },

    obtenerConversacion:function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.find(criterio).toArray(function(err, conversacion) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(conversacion);
                    }
                    db.close();
                });
            }
        });
    },

    insertarMensaje: function (criterio,mensaje, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                functionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.updateOne(criterio,{$push:{mensajes:mensaje}},function (err, conversacion) {
                    if (err) {
                        functionCallback(null);
                    } else {
                        functionCallback(conversacion);
                    }
                    db.close();
                });
            }
        });
    },

    crearConversacion:function(conversacion,functionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.insert(conversacion, function (err, result) {
                    if (err) {
                        functionCallback(null);
                    } else {
                        functionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },

    eliminarConverscion:function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },

    modificarMensaje: function(criterio,mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.update(criterio, {$set: mensaje}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }
};
