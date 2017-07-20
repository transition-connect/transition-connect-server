'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);

let getUsedCategory = function (categories) {
    for (let category of categories) {
        if (category.usedCategory) {
            return category;
        }
    }
    logger.error(`No used category found in ${categories}`);
    return null;
};

let getSimilarCategories = function (categories) {
    let similarCategories = [];
    for (let category of categories) {
        if (!category.usedCategory) {
            similarCategories.push({name: category.name, categoryId: category.categoryId});
        }
    }
    return similarCategories;
};

let getCategories = function (dbCategories) {
    let categories = [];
    for (let dbCategory of dbCategories) {
        let category = {}, usedCategory = getUsedCategory(dbCategory.categories);
        category.categoryId = usedCategory.categoryId;
        category.name = usedCategory.name;
        category.similar = getSimilarCategories(dbCategory.categories);
        categories.push(category);
    }
    return categories;
};

let getSelectedCategory = function (adminId, platformId) {
    return db.cypher().match(`(admin:Admin {adminId: {adminId}})`)
        .with(`admin.language AS language`)
        .match(`(np:NetworkingPlatform {platformId: {platformId}})-[:CATEGORY]->
                (mapper:SimilarCategoryMapper)-[categoryType:USED_CATEGORY|SIMILAR_CATEGORY]->(category:Category)
                -[categoryLanguage]->(categoryTranslated:CategoryTranslated)`)
        .where(`TYPE(categoryLanguage) = language`)
        .with(`mapper, category, categoryTranslated, TYPE(categoryType) = 'USED_CATEGORY' AS usedCategory`)
        .orderBy(`usedCategory DESC, categoryTranslated.name`)
        .return(`mapper, COLLECT({categoryId: category.categoryId, name: categoryTranslated.name, 
                 usedCategory: usedCategory}) AS categories`)
        .end({adminId: adminId, platformId: platformId})
        .send().then(function (resp) {
            return {category: getCategories(resp)};
        });
};

module.exports = {
    getSelectedCategory
};
