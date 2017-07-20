'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createCategory = function (numberOfCategories) {

    for (let categoryId = 0; categoryId < numberOfCategories; categoryId++) {
        dbConnectionHandling.getCommands().push(db.cypher()
            .create(`(:CategoryTranslated {name: {nameEn}})<-[:EN]-(category:Category {categoryId: {categoryId}})
                  -[:DE]->(:CategoryTranslated {name: {nameDe}})`)
            .end({
                categoryId: `${categoryId}`, nameEn: `English${categoryId}`, nameDe: `Deutsch${categoryId}`
            }).getCommand());
    }
};

module.exports = {
    createCategory: createCategory
};