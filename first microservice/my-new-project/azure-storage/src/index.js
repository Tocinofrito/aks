const express = require("express");
const azure = require('azure-storage'); //Lo que usaremos para contectar con azure

const app = express();

const PORT = process.env.PORT; //Tomamos el puerto de la variable de entorno ya puesta en el dockerfile
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME; //La tomamos de la variable de entorno
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;//Igual de la env

function createBlobService(){
  
}