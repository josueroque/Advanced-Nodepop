  'use strict';
  const path = require('path');
  const cote = require('cote');
  const fs = require('fs-extra');
  const flow = require('../lib/flowControl');
  const mongoose = require('mongoose');
  const thumbnailRequester = new cote.Requester({
    name: 'thumbnail creator client'
  }, { log: false, statusLogsEnabled: false });
  // definimos un esquema
  const anuncioSchema = mongoose.Schema({
    nombre: String,
    precio: Number,
    venta:Boolean,
    foto:String,
    tags:Array
    
  }

  );

  anuncioSchema.statics.list = async function (filters, startRow, numRows, sortField, includeTotal, cb) {
    const query = Anuncio.find(filters);
    query.sort(sortField);
    query.skip(startRow);
    query.limit(numRows);
    // query.select('nombre venta');
  
    const result = {}
  
    if (includeTotal) {
      result.total = await Anuncio.count();
    }
    result.rows = await query.exec();
  
    // poner ruta base a imagenes
    const ruta = configAnuncios.imagesURLBasePath;
    result.rows.forEach(r => (r.foto = r.foto ? path.join(ruta, r.foto) : null));
  
    if (cb) return cb(null, result); // si me dan callback devuelvo los resultados por ahí
    return result; // si no, los devuelvo por la promesa del async (async está en la primera linea de esta función)
  }
  
  anuncioSchema.methods.setFoto = async function (imageObject) {
    if (!imageObject) return;
    // copiar el fichero desde la carpeta uploads a public/images/anuncios
    // usando en nombre original del producto
    // IMPORTANTE: valorar si quereis poner el _id del usuario (this._id) para
    // diferenciar imagenes de distintos usuarios con el mismo nombre
    const dstPath = path.join(__dirname, '../public/images', imageObject.originalname)
    await fs.copy(imageObject.path, dstPath)
    this.foto = imageObject.originalname
    thumbnailRequester.send({
      type: 'createThumbnail',
      image: dstPath
    });
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
