'use strict'

const {Router} = require('express');
const { CreateCompany,
        deleteCompany,
        updateCompany,
        readCompany,
        loginCompany,
        addBranchOffice,
        EditBranch,
        eliminateBranch } = require('../controllers/company.controller');
const {check} = require('express-validator');
const {validateParams} = require('../middlewares/validate-params');
const {validateJWT} = require('../middlewares/validate-jwt');

const api = Router();

//Empresa

api.post('/create-company', 
    [
        check("name", "El nombre de empresa es obligatorio").not().isEmpty(),
        check("password", "El password debe ser mayor a 6 digitos").isLength({
            min: 6,
        }),
        check("email", "El email es obligatorio").not().isEmpty(),
        validateParams,
    ],
CreateCompany
);

api.delete('/delete-company/:id', deleteCompany);

api.put('/update-company/:id',
[
    validateJWT,
    check("name", "El nombre de la empresa es obligatoria").not().isEmpty(),
    check("password", "El password debe ser mayor a 6 digitos").isLength({
        min: 6,
    }),
    check("email", "El email es obligatoria").not().isEmpty(),
    validateParams,
    ],
updateCompany);

api.get('/read-company', readCompany);

api.post('/login', loginCompany);

//Sucursales

api.put('/add-branch/:id', validateJWT, addBranchOffice);

api.put('/update-branch/:id', validateJWT, EditBranch);

api.delete('/delete-branch/:id', validateJWT, eliminateBranch);

module.exports = api;