// Inicialización de los modulos necesarios
var express = require('express');
var APP = module.exports = express();
var mongoo = require('mongoose');
// Se registra el directorio de las vistas
APP.set('views', __dirname + '/views');

var cookieSession = require('cookie-session');
APP.use(cookieSession({name:"session",
    keys:["key1", "key2"]
}));

// Ruteo con express

// Dirección principal que renderizará la página
APP.get('/kanban', function(req, res){
        res.render('kanban');
});
// Llamadas AJAX y rest para operaciones
// Llamada para cambiar el proyecto actual
APP.post('/cambiarproyecto', function(req,res){
    req.session.currentproject=req.body.dato;
    res.send({redirect:'/kanban'})
});
// Actualizar los usuarios de un proyecto
APP.post('/update', function(req, res){
    db.Tarea.find({id_proyecto:req.session.currentproject },function(err,users){
        db.Proyecto.findOne({_id:mongoo.Types.ObjectId(req.session.currentproject)},function(err,proy){
            aux2 = 0
            aux = []
            if(users.length==0){
                res.send(aux)
            }
            users.forEach(function(e){
                if(proy.id_pertenecientes.indexOf(e.id_usuario)!=-1 || proy.id_creador==e.id_usuario){
                    aux.push(e)
                }
                aux2 = aux2 + 1
                if(aux2==users.length){
                    res.send(aux)
                }
            })
        })

    });
});
// Agregar miembros a un proyecto
APP.post('/agregarmiembros',function(req,res){
    db.Proyecto.update({_id:req.session.currentproject},{$pushAll:{id_pertenecientes: req.body.pertenece}},{upsert:true}, function(err){
        if(err){
            console.log(err)
            res.send({resultado:"0"})
        }
        else{
            res.send({resultado:"1"})
        }
    })
})
// Actualiza los miembros pertenecientes al proyecto y su creador
APP.post('/miembrosupdate',function(req,res){
    db.Proyecto.find({_id:mongoo.Types.ObjectId(req.session.currentproject)},function(err,proy){
        var array = proy[0].id_pertenecientes.map(function(e){return mongoo.Types.ObjectId(e)})
        db.User.find({ _id:{ $in:array}},function(err,users){
            db.User.find({_id:mongoo.Types.ObjectId(proy[0].id_creador)},function(err,uss){
                if(req.session.user_id != proy[0].id_creador){
                res.send({usuarios:users, propietario:uss, jefe:false})
                }
                else{
                res.send({usuarios:users, propietario:uss, jefe:true})
                }
            })
        });
    })
});
// Se elimina un miembro del proyecto
APP.post('/borrarmiembro',function(req,res){
    db.Proyecto.update({_id:mongoo.Types.ObjectId(req.session.currentproject)},{$pullAll: {id_pertenecientes:[req.body.id]}},function(){
        res.send("1dd")
    })
});
// Se borra un proyecto
APP.post('/deleteproject',function(req,res){
    db.Proyecto.find({_id:mongoo.Types.ObjectId(req.session.currentproject)}).remove(function(err){
        if(err){console.log(err)}
        db.Tarea.find({id_proyecto:req.session.currentproject}).remove(function(err){
            req.session.currentproject=null;
            res.send({redirect:'/selector'});
            })
        });
});

// Obtener el id del usuario conectado
APP.post('/getid',function(req,res){
    res.send(req.session.user_id)
});
// Crear una nueva tarea
APP.post('/createtask', function(req , res){
    var t = db.Tarea({
        contenido: req.body.contenido,
        fecha : req.body.fecha,
        estado: req.body.estado,
        id_usuario: req.session.user_id,
        id_proyecto: req.session.currentproject
    });
    t.save(function(error, user){
        if(error) {console.log(error);}
        res.send("1dd");
    });
});
// Actualiza el estado de una tarea
APP.post('/actu', function(req,res){
    db.Tarea.update({_id:mongoo.Types.ObjectId(req.body.id)},{$set: {estado: req.body.estado}}, function(err){
        if (err) {console.log(err);}else{
        }
        res.send("1dd");
    });
});
// Elimina una tarea
APP.post('/delete', function(req,res){
    db.Tarea.find({_id:mongoo.Types.ObjectId(req.body.id)}).remove(function(err){
        if (err) {console.log(err);}
        else{res.send("1dd");}
    });
});
