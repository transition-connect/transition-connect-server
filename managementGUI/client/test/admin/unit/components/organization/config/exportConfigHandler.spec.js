import {getExportMessage} from '../../../../../../src/admin/components/organization/config/exportConfigHandler.js';
import {isValidConfig} from '../../../../../../src/admin/components/organization/config/exportConfigHandler.js';

describe('exportConfigHandler.js', () => {
    it('Get export config message', () => {
        let testData = [{
            platformId: '1', isExported: true, isEventExported: false, categories: [
                {name: "category1", categoryId: "1", isSelected: false},
                {name: "category2", categoryId: "2", isSelected: true},
                {name: "category3", categoryId: "3", isSelected: false},
                {name: "category4", categoryId: "4", isSelected: true}]
        }, {
            platformId: '2', isExported: false, isEventExported: false, categories: [
                {name: "category1", categoryId: "1", isSelected: true},
                {name: "category2", categoryId: "2", isSelected: true},
                {name: "category3", categoryId: "3", isSelected: false},
                {name: "category4", categoryId: "4", isSelected: true}]
        }, {
            platformId: '3', isExported: true, isEventExported: true, categories: [
                {name: "category5", categoryId: "5", isSelected: false},
                {name: "category6", categoryId: "6", isSelected: false},
                {name: "category7", categoryId: "7", isSelected: true},
                {name: "category8", categoryId: "8", isSelected: false}]
        }];

        let result = getExportMessage(testData);

        expect(result.length).to.equal(2);
        expect(result[0].platformId).to.equal('1');
        expect(result[0].org.categories.length).to.equal(2);
        expect(result[0].org.categories[0]).to.equal('2');
        expect(result[0].org.categories[1]).to.equal('4');
        expect(result[0].events.exportActive).to.equal(false);
        expect(result[1].platformId).to.equal('3');
        expect(result[1].org.categories.length).to.equal(1);
        expect(result[1].org.categories[0]).to.equal('7');
        expect(result[1].events.exportActive).to.equal(true);
    });

    it('Accept valid config', () => {
        let testData = [{
            platformId: '1', isExported: true, isEventExported: false, categories: [
                {name: "category1", categoryId: "1", isSelected: false},
                {name: "category2", categoryId: "2", isSelected: true},
                {name: "category3", categoryId: "3", isSelected: false},
                {name: "category4", categoryId: "4", isSelected: true}]
        }, {
            platformId: '2', isExported: false, isEventExported: false, categories: [
                {name: "category1", categoryId: "1", isSelected: true},
                {name: "category2", categoryId: "2", isSelected: true},
                {name: "category3", categoryId: "3", isSelected: false},
                {name: "category4", categoryId: "4", isSelected: true}]
        }, {
            platformId: '3', isExported: true, isEventExported: true, categories: [
                {name: "category5", categoryId: "5", isSelected: false},
                {name: "category6", categoryId: "6", isSelected: false},
                {name: "category7", categoryId: "7", isSelected: true},
                {name: "category8", categoryId: "8", isSelected: false}]
        }];

        let result = isValidConfig(testData);

        expect(result).to.equal(true);

    });

    it('Refuse invalid config', () => {
        let testData = [{
            platformId: '1', isExported: true, isEventExported: false, categories: [
                {name: "category1", categoryId: "1", isSelected: false},
                {name: "category2", categoryId: "2", isSelected: false},
                {name: "category3", categoryId: "3", isSelected: false},
                {name: "category4", categoryId: "4", isSelected: false}]
        }, {
            platformId: '2', isExported: false, isEventExported: false, categories: [
                {name: "category1", categoryId: "1", isSelected: true},
                {name: "category2", categoryId: "2", isSelected: true},
                {name: "category3", categoryId: "3", isSelected: false},
                {name: "category4", categoryId: "4", isSelected: true}]
        }, {
            platformId: '3', isExported: true, isEventExported: false, categories: [
                {name: "category5", categoryId: "5", isSelected: false},
                {name: "category6", categoryId: "6", isSelected: false},
                {name: "category7", categoryId: "7", isSelected: true},
                {name: "category8", categoryId: "8", isSelected: false}]
        }];

        let result = isValidConfig(testData);

        expect(result).to.equal(false);

    });
});
