  'use strict';
  const path = require('path');
  const cote = require('cote');
  const fs = require('fs-extra');
  const flow = require('../lib/flowControl');
  const mongoose = require('mongoose');

  // definimos un esquema
  const anuncioSchema = mongoose.Schema({
    nombre: String,
    precio: Number,
    venta:Boolean,
    foto:String,
    tags:Array
    
  }

  );

  anuncioSchema.methods.setFoto = async function (imageObject) {
    if (!imageObject) return;
    // copiar el fichero desde la carpeta uploads a public/images/anuncios
    // usando en nombre original del producto
    // IMPORTANTE: valorar si quereis poner el _id del usuario (this._id) para
    // diferenciar imagenes de distintos usuarios con el mismo nombre
    const dstPath = path.join(__dirname, '../public/images/anuncios', imageObject.originalname)
    await fs.copy(imageObject.path, dstPath)
    this.foto = imageObject.originalname
    thumbnailRequester.send({
      type: 'createThumbnail',
      image: dstPath
    })
  }

anuncioSchema.statics.list = function({filter, skip, limit, fields, sort}) {
  const query = Anuncio.find(filter);
 // console.log(filter);
  query.skip(skip);
  query.limit(limit);
  query.select(fields);   
 
  query.sort(sort);

 // query.start(start);
  return query.exec();
};

anuncioSchema.statics.listTags = function() {
  const query = Anuncio.distinct('tags') ;
 // console.log(filter);

 // query.start(start);
  return query.exec();
};


const Anuncio = mongoose.model('Anuncio', anuncioSchema);

module.exports = Anuncio;
