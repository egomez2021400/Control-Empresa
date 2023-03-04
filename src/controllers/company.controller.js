'use strict'

const Company = require('../models/company.models');
const bcrypt = require('bcrypt');
const {generateJWT} = require('../helpers/create-jwt');


//Crear Empresa
const CreateCompany = async(req, res) =>{
    const {name, email, password, address, typeCompany} = req.body;

    try{
        let company = await Company.findOne({email: email});
        if(company){
            return res.status(400).send({
                message: 'Una empresa ya cuenta con el email',
                ok: false,
                company: company,
            });
        }

        company = new Company(req.body);

        //Encriptar la contraseña
        const saltos = bcrypt.genSaltSync();
        company.password = bcrypt.hashSync(password, saltos);

        //Guardar Compañia
        company = await company.save();

        //Generar Token
        const token = await generateJWT(company.id, company.name, company.email);
        res.status(200).send({
            message: 'Compania creado correctamente',
            ok: true,
            company: company,
            token: token,
        })
        
    }catch(error){
        console.log(error);
        res.status(500).send({
            ok: false,
            message: `No se genero la empresa ${name}`,
            error: error,
        })
    }
};

//Eliminar Empresa
const deleteCompany = async(req, res) =>{
    try{
        const id = req.params.id;
        const resultado = await Company.findByIdAndDelete(id);

        res.status(200).send({
            message: "Empresa eliminada correctamente",
            company: resultado,
        });
    }catch(error){
        throw new Error(error);
    }
};

//Editar Empresa
const updateCompany = async(req, res) =>{

    try{
        const id = req.params.id;
        let editCompany = {...req.body};

        //Encriptación de contraseña
        editCompany.password = editCompany.password
        ? bcrypt.hashSync(editCompany.password, bcrypt.genSaltSync())
        : editCompany.password;

        const companyComplete = await Company.findByIdAndUpdate(id, editCompany, {
            new: true,
        });

        if(companyComplete) {
            const token = await generateJWT(companyComplete.id, editCompany.name, companyComplete.email);
            return res.status(200).send({
                message: "Esta Empresa actualizado correctamente",
                companyComplete,
                token,
        });
    }else {
        res.status(404).send({
            message: "Esta Empresa no existe en la base de datos, verifique los parametros",
        });
    };
    }catch(error){
        throw new Error(error);
    }
};

//Listar Empresa
const readCompany = async(req, res) =>{
    try{
        const company = await Company.find();

        if(!company){
            res.status(404).send({message: "No hay Empresas disponibles"});
        }else{
            res.status(200).json({"Empresa encontradas": company});
        }
    }catch(error){
        throw new Error(Error);
    }
};

//Login Empresa
const loginCompany = async(req, res) =>{
    const {email, password} = req.body;

    try{
        const company = await Company.findOne({email});

        if(!company) {
            return res.status(400).send({
                ok: false,
                message: "La empresa no existe"
            });
        }

        const validPassword = bcrypt.compareSync(
            password,
            company.password
        );

        if(!validPassword) {
            return res.status(400).send({
                ok: false,
                message: "Password incorrecto"
            });
        }

        const token = await generateJWT(company.id, company.name, company.email);
        res.json({
            message: `Correctamente logeado, inicio de sesión Empresa ${company.name}`,
            ok: true,
            uId: company.id,
            name: company.name,
            email: company.email,
            token,
        });
    }catch(error){
        throw new Error(error);
    }
};

//SUCURSALES

//Crear Sucursales
const addBranchOffice = async(req, res) =>{
    const {address, municipality} = req.body;
    const id = req.params.id;
    try{
        const addBranch = await Company.findByIdAndUpdate(id,
            {
                $push: {
                    branchOffices: {
                        address: address,
                        municipality: municipality,
                    },
                },
            },
            {new:  true}
        );

        if(!addBranch) {
            return res.status(400).send({message: "Empresa no encontrado"});
        }
        return res.status(200).send({message: "Registro nueva sucursal", addBranch})
    }catch(error){
        throw new Error(error);
    }
};

//Editar Sucursales
const EditBranch = async(req, res) => {
    const {idBranch, address, municipality} = req.body;
    const id = req.params.id;
    try{
        const updateBranch = await Company.updateOne(
            {_id: id, "branchOffices._id": idBranch},
            {
                $set: {
                    "branchOffices.$.address": address,
                    "branchOffices.$.municipality": municipality,
                },
            },
            {new: true}
        );

        if(!updateBranch){
            return res.status(404).send({message: "No existe esta Sucursal"});
        }

        return res
        .status(200)
        .send({updateBranch, message: "Sucursal actualizada correctamente"});
    }catch(error){
        throw new Error(error);
    }
};

//Eliminar Sucursales
const eliminateBranch = async(req, res) => {
    const {idBranch} = req.body;
    const id = req.params.id;
    try{
        const deleteBranch = await Company.updateOne(
            {_id: id},
            {
                $pull: {branchOffices: {_id: idBranch}},
            },
            { 
                new: true, multi: false
            }
        );

        if(!deleteBranch){
            return res.status(404).send({message: "No existe esta sucursal"});
        }

        return res.status(200).send({deleteBranch});
    }catch(error){
        throw new Error(error);
    }
};

module.exports = {CreateCompany, deleteCompany, updateCompany, readCompany, loginCompany, addBranchOffice, EditBranch, eliminateBranch};